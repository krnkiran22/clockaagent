import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createHmac, randomUUID } from 'crypto';

type PayRequestBody = {
  itemId?: string;
  itemName?: string;
  price?: string;
  vendorAddress?: string;
  amountWei?: string;
  paymentMode?: 'agent' | 'agent_token' | 'facilitator';
};

type FacilitatorOrderPayload = {
  dapp_order_id: string;
  chain_id: number;
  token_symbol: string;
  token_contract?: string;
  from_address: string;
  amount_wei: string;
  merchant_id?: string;
};

function cleanEnv(value: string | undefined): string {
  return value?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

function createFacilitatorSignature(body: Record<string, string | number>, apiKey: string, apiSecret: string, timestamp: string): string {
  const signPayload: Record<string, string | number> = { ...body, api_key: apiKey, timestamp };
  const serialized = Object.keys(signPayload)
    .filter((key) => signPayload[key] !== '' && signPayload[key] !== null && signPayload[key] !== undefined)
    .sort()
    .map((key) => `${key}=${String(signPayload[key])}`)
    .join('&');

  return createHmac('sha256', apiSecret).update(serialized).digest('hex');
}

async function initializeFacilitatorOrder(args: {
  facilitatorBaseUrl: string;
  facilitatorApiKey: string;
  facilitatorApiSecret: string;
  merchantId?: string;
  chainId: number;
  tokenSymbol: string;
  tokenContract?: string;
  itemId?: string;
  fromAddress: string;
  amountWei: string;
}) {
  const orderPayload: FacilitatorOrderPayload = {
    dapp_order_id: `${args.itemId || 'vendor'}-${Date.now()}-${randomUUID().slice(0, 8)}`,
    chain_id: args.chainId,
    token_symbol: args.tokenSymbol,
    from_address: args.fromAddress,
    amount_wei: args.amountWei
  };

  if (args.tokenContract) {
    orderPayload.token_contract = args.tokenContract;
  }
  if (args.merchantId) {
    orderPayload.merchant_id = args.merchantId;
  }

  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const sign = createFacilitatorSignature(orderPayload, args.facilitatorApiKey, args.facilitatorApiSecret, timestamp);

  const createOrderRes = await fetch(`${args.facilitatorBaseUrl}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': args.facilitatorApiKey,
      'X-Timestamp': timestamp,
      'X-Sign': sign
    },
    body: JSON.stringify(orderPayload)
  });

  const paymentRequiredHeader = createOrderRes.headers.get('PAYMENT-REQUIRED');
  const rawBody = await createOrderRes.text();
  let parsedBody: unknown = null;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = rawBody;
  }

  if (createOrderRes.status !== 402 && !createOrderRes.ok) {
    throw new Error(`facilitator order init failed: status=${createOrderRes.status}`);
  }

  const bodyObj = parsedBody as Record<string, unknown> | null;
  return {
    orderId: typeof bodyObj?.order_id === 'string' ? bodyObj.order_id : null,
    paymentRequired: paymentRequiredHeader,
    facilitatorStatus: createOrderRes.status,
    txHash: typeof bodyObj?.tx_hash === 'string' ? bodyObj.tx_hash : null
  };
}

async function executeAgentTokenTransfer(args: {
  rpcUrl: string;
  privateKey: string;
  tokenContract: string;
  itemName?: string;
  price?: string;
  vendorAddress: string;
  amountWei: string;
}) {
  const erc20Abi = [
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)'
  ];

  const provider = new ethers.JsonRpcProvider(args.rpcUrl);
  const wallet = new ethers.Wallet(args.privateKey, provider);
  const token = new ethers.Contract(args.tokenContract, erc20Abi, provider);
  const tokenWithSigner = token.connect(wallet);

  const parsedAmount = BigInt(args.amountWei);
  if (parsedAmount <= BigInt(0)) {
    throw new Error('amountWei must be greater than 0');
  }

  const agentTokenBefore = await token.balanceOf(wallet.address) as bigint;
  const vendorTokenBefore = await token.balanceOf(args.vendorAddress) as bigint;

  if (agentTokenBefore < parsedAmount) {
    throw new Error(`insufficient USDC balance: available=${agentTokenBefore.toString()}, required=${parsedAmount.toString()}`);
  }

  // Explicit calldata avoids method-resolution edge cases around "transfer".
  const tx = await tokenWithSigner.getFunction('transfer').send(args.vendorAddress, parsedAmount, { gasLimit: 200000 });
  await tx.wait();

  const agentTokenAfter = await token.balanceOf(wallet.address) as bigint;
  const vendorTokenAfter = await token.balanceOf(args.vendorAddress) as bigint;

  return {
    success: true,
    mode: 'agent_token_transfer',
    txHash: tx.hash,
    itemName: args.itemName,
    price: args.price,
    vendorAddress: args.vendorAddress,
    amountWei: parsedAmount.toString(),
    tokenContract: args.tokenContract,
    agentAddress: wallet.address,
    before: {
      agentToken: agentTokenBefore.toString(),
      vendorToken: vendorTokenBefore.toString()
    },
    after: {
      agentToken: agentTokenAfter.toString(),
      vendorToken: vendorTokenAfter.toString()
    },
    message: 'Vendor payout processed via agent token transfer.'
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as PayRequestBody;
    const { itemId, itemName, price, vendorAddress, amountWei, paymentMode } = body;

    if (!vendorAddress) {
      return NextResponse.json({ success: false, error: 'Missing required vendorAddress in request body.' }, { status: 400 });
    }

    if (!ethers.isAddress(vendorAddress)) {
      return NextResponse.json({ success: false, error: 'Invalid vendorAddress.' }, { status: 400 });
    }

    const rpcUrl = cleanEnv(process.env.GOAT_TESTNET_RPC_URL) || 'https://rpc.testnet3.goat.network';
    const cleanPrivateKey = cleanEnv(process.env.PRIVATE_KEY);
    if (!cleanPrivateKey || cleanPrivateKey.length < 32) {
      return NextResponse.json({ success: false, error: 'Invalid PRIVATE_KEY in .env' }, { status: 500 });
    }

    const parsedAmount = amountWei ? BigInt(amountWei) : BigInt(1);
    if (parsedAmount <= BigInt(0)) {
      return NextResponse.json({ success: false, error: 'amountWei must be greater than 0' }, { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(cleanPrivateKey, provider);

    const facilitatorBaseUrl = cleanEnv(process.env.GOAT_X402_BASE_URL);
    const facilitatorApiKey = cleanEnv(process.env.GOAT_X402_API_KEY);
    const facilitatorApiSecret = cleanEnv(process.env.GOAT_X402_API_SECRET);
    const merchantId = cleanEnv(process.env.GOAT_X402_MERCHANT_ID);
    const chainId = Number(cleanEnv(process.env.GOAT_X402_CHAIN_ID) || '48816');
    const tokenSymbol = cleanEnv(process.env.GOAT_X402_TOKEN_SYMBOL) || 'USDT';
    const tokenContract = cleanEnv(process.env.GOAT_X402_TOKEN_CONTRACT);
    const facilitatorConfigured = Boolean(facilitatorBaseUrl && facilitatorApiKey && facilitatorApiSecret);
    const useFacilitator = facilitatorConfigured && paymentMode === 'facilitator';

    if (paymentMode === 'facilitator' && !facilitatorConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Facilitator mode requested but GOAT_X402_BASE_URL / GOAT_X402_API_KEY / GOAT_X402_API_SECRET are missing.'
      }, { status: 500 });
    }

    if (!tokenContract) {
      return NextResponse.json({
        success: false,
        error: 'GOAT_X402_TOKEN_CONTRACT is required for USDC transfer flow.'
      }, { status: 500 });
    }

    const directResult: Record<string, unknown> = await executeAgentTokenTransfer({
      rpcUrl,
      privateKey: cleanPrivateKey,
      tokenContract,
      itemName,
      price,
      vendorAddress,
      amountWei: parsedAmount.toString()
    });

    let facilitatorOrder: Record<string, unknown> | null = null;
    if (useFacilitator) {
      try {
        facilitatorOrder = await initializeFacilitatorOrder({
          facilitatorBaseUrl,
          facilitatorApiKey,
          facilitatorApiSecret,
          merchantId,
          chainId,
          tokenSymbol,
          tokenContract,
          itemId,
          fromAddress: wallet.address,
          amountWei: parsedAmount.toString()
        });
      } catch (facilitatorErr) {
        console.error('[x402 Facilitator] initialization error:', facilitatorErr);
        facilitatorOrder = {
          error: facilitatorErr instanceof Error ? facilitatorErr.message : 'unknown facilitator error'
        };
      }
    }

    if (facilitatorOrder) {
      directResult.facilitator = facilitatorOrder;
    }

    return NextResponse.json(directResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('[x402 API ERROR]:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
