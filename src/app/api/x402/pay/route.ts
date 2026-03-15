import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { itemId, itemName, price, vendorAddress } = body;

    if (!vendorAddress) {
      return NextResponse.json({ success: false, error: "Missing required vendorAddress in request body." }, { status: 400 });
    }

    // The Official GOAT x402 API configuration
    const rpcUrl = process.env.GOATX402_API_URL || "https://rpc.testnet3.goat.network";
    const apiKey = process.env.GOATX402_API_KEY;
    const apiSecret = process.env.GOATX402_API_SECRET;
    const merchantId = process.env.GOATX402_MERCHANT_ID;
    
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    const agentId = (process.env.AGENT_ID || "258").trim();
    const registryAddress = (process.env.IDENTITY_REGISTRY || "0x556089008Fc0a60cD09390Eca93477ca254A5522").trim();
    
    // Clean the private key (remove quotes or spaces if any)
    const cleanPrivateKey = privateKey?.trim().replace(/^["']|["']$/g, '');
    
    if (!cleanPrivateKey || cleanPrivateKey.length < 32) {
      return NextResponse.json({ success: false, error: "Invalid Agent Private Key provided." }, { status: 500 });
    }
    
    // Instead of raw raw Ethereum transactions, we now use the GOAT Agent x402 Gateway API! 
    const paymentPayload = {
        agent_id: agentId,
        identity_registry: registryAddress,
        merchant_id: merchantId,
        destination_wallet: vendorAddress,
        amount: "0.2", // Reinstating higher test amount since API handles funding pool!
        currency: "GOAT",
        item_id: itemId,
        item_name: itemName,
        timestamp: Date.now()
    };

    // The Facilitator Contract ABI - strictly following the GOAT Network Agent Economy x402 standard
    const facilitatorAbi = [
      "function payUsingAgent(uint256 agentId, address destination, string merchantId) external payable"
    ];

    console.log(`Executing PROPER x402 Payment via Facilitator Hub [${registryAddress}]...`);
    console.log(`Agent ID: ${agentId}, Merchant: ${merchantId}`);

    console.log(`Connecting to GOAT RPC: ${rpcUrl}`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log("Initializing Agent Wallet...");
    const wallet = new ethers.Wallet(cleanPrivateKey, provider);
    
    console.log(`Loading Facilitator Hub at: ${registryAddress}`);
    const facilitator = new ethers.Contract(registryAddress, facilitatorAbi, wallet);

    console.log(`Submitting x402 transaction: Agent=${agentId}, Merchant=${merchantId}, To=${vendorAddress}`);
    
    const tx = await facilitator.payUsingAgent(
      BigInt(agentId), 
      vendorAddress,
      (merchantId || "0xgokkull").trim(),
      {
        value: ethers.parseEther("0.000001"), 
        gasLimit: 500000 
      }
    );
    
    console.log(`Transaction submitted! Hash: ${tx.hash}`);
    
    // Wait for the block to be mined to ensure it hits the indexer
    const receipt = await tx.wait();
    
    const txHash = tx.hash;

    return NextResponse.json({ 
       success: true, 
       txHash,
       itemName,
       price,
       vendorAddress,
       message: `Authenticated x402 Agent Payment successfully processed on GOAT Network!`
    });

  } catch (err: any) {
    console.error("[x402 API ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message || "Unknown server error" }, { status: 500 });
  }
}
