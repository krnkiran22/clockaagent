import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { itemId, itemName, price, vendorAddress } = body;

    if (!vendorAddress) {
      return NextResponse.json({ success: false, error: "Missing required vendorAddress in request body." }, { status: 400 });
    }

    // Official GOAT Network x402 Facilitator Hub
    const hubAddress = "0x556089008Fc0a60cD09390Eca93477ca254A5522";
    const agentId = BigInt(process.env.AGENT_ID || "258");
    const merchantId = (process.env.GOATX402_MERCHANT_ID || "0xgokkull").trim();
    
    const rpcUrl = process.env.GOAT_RPC_URL || "https://rpc.testnet3.goat.network";
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    
    const cleanPrivateKey = privateKey?.trim().replace(/^["']|["']$/g, '');

    if (!cleanPrivateKey) {
      return NextResponse.json({ success: false, error: "Missing AGENT_PRIVATE_KEY" }, { status: 500 });
    }

    // ABI for the Official x402 Facilitator Hub
    const hubAbi = [
      "function payUsingAgent(uint256 agentId, address destination, string merchantId) external payable"
    ];

    console.log(`[x402] ROUTING THROUGH OFFICIAL HUB: ${hubAddress}`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(cleanPrivateKey, provider);
    
    // Create the interface for explicit x402 encoding
    const iface = new ethers.Interface(hubAbi);
    const encodedData = iface.encodeFunctionData("payUsingAgent", [
      agentId,
      vendorAddress,
      merchantId
    ]);

    // This is the Proper x402 Protocol Call
    console.log(`Executing authenticated x402 payout for Agent ${agentId} to Merchant ${merchantId}`);
    const tx = await wallet.sendTransaction({
      to: hubAddress,
      data: encodedData,
      value: ethers.parseEther("0.000001"), // Using micro-payment to trigger protocol events
      gasLimit: 800000 
    });

    console.log(`x402 Transaction Submitted: ${tx.hash}`);
    await tx.wait();

    return NextResponse.json({ 
       success: true, 
       txHash: tx.hash,
       itemName,
       vendorAddress,
       message: `Authenticated x402 Payment successful on GOAT Network Dashboard.`
    });

  } catch (err: any) {
    console.error("[x402 PROTOCOL ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message || "x402 Routing Failure" }, { status: 500 });
  }
}
