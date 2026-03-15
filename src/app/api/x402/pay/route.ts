import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { itemId, itemName, price, vendorAddress } = body;

    if (!vendorAddress) {
      return NextResponse.json({ success: false, error: "Missing required vendorAddress in request body." }, { status: 400 });
    }

    // 1. Configuration for GOAT Network x402 Gateway (Off-chain)
    const baseUrl = process.env.GOATX402_API_URL || "https://rpc.testnet3.goat.network"; // Note: This might be the core API base, not just RPC
    const apiKey = process.env.GOATX402_API_KEY;
    const apiSecret = process.env.GOATX402_API_SECRET;
    const merchantId = process.env.GOATX402_MERCHANT_ID || "0xgokkull";

    // 2. Configuration for On-chain Agent Execution
    const rpcUrl = "https://rpc.testnet3.goat.network";
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    const agentId = process.env.AGENT_ID || "258";
    
    const cleanPrivateKey = privateKey?.trim().replace(/^["']|["']$/g, '');
    if (!cleanPrivateKey) return NextResponse.json({ success: false, error: "Missing AGENT_PRIVATE_KEY" }, { status: 500 });

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(cleanPrivateKey, provider);

    // --- x402 STRATEGY 1: Official GOAT Gateway (Off-chain Order) ---
    // According to the documentation at https://github.com/GOATNetwork/x402/blob/main/API.md
    
    const dappOrderId = `order_${Date.now()}`;
    const amountWei = "500000000000000"; // 0.0005 GOAT as requested
    
    const orderBody = {
      dapp_order_id: dappOrderId,
      chain_id: 48816, // GOAT Testnet Chain ID
      token_symbol: "GOAT",
      from_address: wallet.address,
      amount_wei: amountWei,
      merchant_id: merchantId
    };

    // HMAC Signature Calculation for x402 Gateway
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signParams = { ...orderBody, api_key: apiKey, timestamp: timestamp };
    
    // Sort keys and build query string
    const sortedKeys = Object.keys(signParams).sort();
    const queryStr = sortedKeys
      .map(k => `${k}=${signParams[k as keyof typeof signParams]}`)
      .join('&');
    
    const signature = CryptoJS.HmacSHA256(queryStr, apiSecret || "").toString(CryptoJS.enc.Hex);

    console.log(`[x402 GATEWAY] Creating order: ${dappOrderId}`);
    
    // Attempt Gateway order creation
    let gatewaySuccess = false;
    let orderId = "";
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || "",
          'X-Timestamp': timestamp,
          'X-Sign': signature
        },
        body: JSON.stringify(orderBody)
      });

      // x402 Gateway returns 402 Payment Required for success
      if (response.status === 402) {
        const data = await response.json();
        orderId = data.order_id;
        gatewaySuccess = true;
        console.log(`[x402 GATEWAY] Order created: ${orderId}`);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[x402 GATEWAY] Non-402 response: ${response.status}`, errData);
      }
    } catch (apiErr) {
      console.error(`[x402 GATEWAY] Connection failed:`, apiErr);
    }

    // --- x402 STRATEGY 2: On-chain Hub Execution (The Protocol Call) ---
    // This is the part that actually interacts with the blockchain
    const hubAddress = "0x556089008Fc0a60cD09390Eca93477ca254A5522";
    const hubAbi = [
      "function payUsingAgent(uint256 agentId, address destination, string merchantId) external payable"
    ];

    console.log(`[x402 ON-CHAIN] Routing through Hub: ${hubAddress}`);
    const facilitator = new ethers.Contract(hubAddress, hubAbi, wallet);

    // Prepare x402 Metadata Payload for the transaction 'data' field
    // This provides the link to the off-chain order if it was successfully created
    const x402Metadata = {
      order_id: orderId || dappOrderId, // Fallback to our dapp id if gateway fails
      agent_id: agentId,
      merchant_id: merchantId,
      protocol: "x402"
    };
    const metadataHex = ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify(x402Metadata)));

    // We use the Protocol Method: payUsingAgent
    // Note: We've increased the value and gas as requested
    const tx = await facilitator.payUsingAgent(
      BigInt(agentId),
      vendorAddress,
      merchantId,
      {
        value: ethers.parseEther("0.0005"),
        gasLimit: 800000 
      }
    );

    console.log(`[x402 ON-CHAIN] Transaction Submitted! Hash: ${tx.hash}`);
    await tx.wait();

    return NextResponse.json({ 
       success: true, 
       txHash: tx.hash,
       orderId: orderId,
       itemName,
       vendorAddress,
       message: gatewaySuccess 
         ? `Authenticated x402 Transaction & Off-chain Order successfully processed.` 
         : `x402 Protocol Call successful. (Manual on-chain verification fallback used).`
    });

  } catch (err: any) {
    console.error("[x402 CRITICAL ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
