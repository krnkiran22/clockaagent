import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { itemId, itemName, price, vendorAddress, amountWei } = body;

    // Log the incoming request for debugging
    console.log(`[x402 Payout] Initiating for ${itemName} to ${vendorAddress}`);

    if (!vendorAddress) {
      return NextResponse.json({ success: false, error: "Missing required vendorAddress in request body." }, { status: 400 });
    }

    if (!ethers.isAddress(vendorAddress)) {
      return NextResponse.json({ success: false, error: "Invalid vendorAddress." }, { status: 400 });
    }

    const rpcUrl = process.env.GOAT_RPC_URL || "https://rpc.testnet3.goat.network";
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    const agentContractAddress = process.env.RUNCLUB_AGENT_IDENTITY_ADDRESS;

    const cleanPrivateKey = privateKey?.trim().replace(/^["']|["']$/g, '');

    if (!cleanPrivateKey || cleanPrivateKey.length < 32) {
      return NextResponse.json({ success: false, error: "Invalid AGENT_PRIVATE_KEY in .env" }, { status: 500 });
    }

    if (!agentContractAddress || !ethers.isAddress(agentContractAddress)) {
      return NextResponse.json({ success: false, error: "Invalid RUNCLUB_AGENT_IDENTITY_ADDRESS in .env" }, { status: 500 });
    }

    const agentAbi = [
      "function owner() view returns (address)",
      "function vendors(address) view returns (string name, uint8 preferredMethod, address wallet)",
      "function registerVendor(string _name, uint8 _method, address _wallet) external",
      "function payVendor(address _vendorWallet, uint256 _amount) external"
    ];

    console.log(`Connecting to GOAT RPC: ${rpcUrl}`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    console.log("Initializing Agent Wallet...");
    const wallet = new ethers.Wallet(cleanPrivateKey, provider);

    console.log(`Loading RunClubAgentIdentity at: ${agentContractAddress}`);
    const agent = new ethers.Contract(agentContractAddress, agentAbi, wallet);

    // Verify Ownership
    const owner = await agent.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "AGENT_PRIVATE_KEY is not the owner of the Run Club Identity contract." },
        { status: 403 }
      );
    }

    // Default to 1 wei if amount is not specified to ensure success with low funds
    const parsedAmount = amountWei ? BigInt(amountWei) : 1000n; 
    
    let registerTxHash: string | null = null;
    const vendorData = await agent.vendors(vendorAddress);
    const registeredWallet = vendorData.wallet || ethers.ZeroAddress;

    // 1. Auto-Register Vendor if not already present in the Agent's registry
    if (registeredWallet.toLowerCase() !== vendorAddress.toLowerCase()) {
      console.log(`Registering vendor on-chain: ${vendorAddress}`);
      // Method 2 = WALLET
      const registerTx = await agent.registerVendor(itemName || "Run Club Merchant", 2, vendorAddress, { 
        gasLimit: 400000 
      });
      await registerTx.wait();
      registerTxHash = registerTx.hash;
      console.log(`Vendor registered: ${registerTxHash}`);
    }

    // 2. Ensure Agent Contract is funded (Top up from Agent's main wallet if needed)
    let fundTxHash: string | null = null;
    const contractBal = await provider.getBalance(agentContractAddress);
    if (contractBal < parsedAmount) {
      const topUp = (parsedAmount - contractBal) + ethers.parseEther("0.0001"); // Add a small buffer
      console.log(`Funding agent contract with extra GOAT for payout...`);
      const fundTx = await wallet.sendTransaction({ 
        to: agentContractAddress, 
        value: topUp, 
        gasLimit: 100000 
      });
      await fundTx.wait();
      fundTxHash = fundTx.hash;
    }

    // 3. Final x402 Agent Execution Payment
    console.log(`Executing payVendor via Agent: to=${vendorAddress}, amountWei=${parsedAmount.toString()}`);
    // We keep gas limit moderate to avoid "Intrinsic Cost" errors with low balances
    const payTx = await agent.payVendor(vendorAddress, parsedAmount, { 
        gasLimit: 500000 
    });
    await payTx.wait();

    console.log(`Payout Successful! Hash: ${payTx.hash}`);

    return NextResponse.json({ 
       success: true, 
       txHash: payTx.hash,
       registerTxHash,
       fundTxHash,
       itemName,
       price,
       vendorAddress,
       amountWei: parsedAmount.toString(),
       message: `Authenticated x402 Agent Payout successful on GOAT Network.`
    });

  } catch (err: any) {
    console.error("[x402 API ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message || "Unknown server error" }, { status: 500 });
  }
}
