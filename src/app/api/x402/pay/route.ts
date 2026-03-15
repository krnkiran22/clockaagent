import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { itemId, itemName, price, vendorAddress } = await req.json();

    // The Official GOAT x402 API configuration
    const rpcUrl = process.env.GOATX402_API_URL || "https://rpc.testnet3.goat.network";
    const apiKey = process.env.GOATX402_API_KEY;
    const apiSecret = process.env.GOATX402_API_SECRET;
    const merchantId = process.env.GOATX402_MERCHANT_ID;
    
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    const agentId = process.env.AGENT_ID || "258";
    const registryAddress = process.env.RUNCLUB_AGENT_IDENTITY_ADDRESS || process.env.IDENTITY_REGISTRY || "0xd6DC2dD83Be8F3A9b199c2d1B555845A99b4E560";
    
    if (!privateKey) {
      return NextResponse.json({ success: false, error: "Missing Agent Private Key in configuration." }, { status: 500 });
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

    // Connect our wallet using the custom private key
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create the contract instance for the Facilitator Hub
    const facilitator = new ethers.Contract(registryAddress, facilitatorAbi, wallet);

    console.log("Submitting transaction to GOAT Network...");
    
    // We execute the payUsingAgent() function on the official Facilitator Hub.
    // Using explicit getFunction to ensure we don't hit property undefined issues.
    const payMethod = facilitator.getFunction("payUsingAgent");
    if (!payMethod) {
        throw new Error("Critical: payUsingAgent function not found in contract ABI.");
    }

    const tx = await payMethod(
      BigInt(agentId), 
      vendorAddress,
      merchantId || "",
      {
        value: ethers.parseEther("0.000001"), 
        gasLimit: 500000 // Increased gas limit slightly for safety
      }
    );
    
    if (!tx) {
        throw new Error("Blockchain did not return a transaction response. Check wallet balance.");
    }

    console.log(`Transaction submitted! Hash: ${tx.hash}`);
    
    // Wait for the block to be mined to ensure it hits the indexer
    const receipt = await tx.wait();
    
    if (!receipt) {
        throw new Error("Transaction verification failed - block mined but no receipt returned.");
    }
    
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
