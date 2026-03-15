import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { itemId, itemName, price, vendorAddress, amountWei } = body;

    if (!vendorAddress) {
      return NextResponse.json({ success: false, error: "Missing vendorAddress" }, { status: 400 });
    }

    const rpcUrl = "https://rpc.testnet3.goat.network";
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    const agentId = process.env.AGENT_ID || "258";
    const merchantId = process.env.GOATX402_MERCHANT_ID || "0xgokkull";

    const cleanPrivateKey = privateKey?.trim().replace(/^["']|["']$/g, '');
    if (!cleanPrivateKey) throw new Error("Missing AGENT_PRIVATE_KEY in .env");

    console.log(`[x402] Initializing Native x402 Transfer for Agent ${agentId}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(cleanPrivateKey, provider);

    // Prepare x402 Protocol Metadata
    // This JSON is attached to the transaction data so the GOAT Dashboard can index it.
    // It makes the "Transfer" a "Machine-Native x402 Payment".
    const x402Payload = {
      protocol: "x402",
      version: "1.0",
      agent_id: agentId,
      merchant_id: merchantId,
      item: itemName || "Run Club Service",
      timestamp: Date.now()
    };
    
    // Hex encode the metadata
    const hexData = ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify(x402Payload)));

    // Determine amount: Default to 0.0005 GOAT as requested
    const txValue = amountWei ? BigInt(amountWei) : ethers.parseEther("0.0005");

    console.log(`Sending NATIVE x402 transfer to ${vendorAddress} with value ${ethers.formatEther(txValue)} GOAT`);

    // We send a direct transaction from the Agent's wallet.
    // This will show up as a "Transfer" in the explorer but contains x402 metadata.
    const tx = await wallet.sendTransaction({
      to: vendorAddress,
      value: txValue,
      data: hexData, // The x402 Machine Identity Fingerprint
      gasLimit: 100000 
    });

    console.log(`Transaction Successful! Hash: ${tx.hash}`);
    
    // Wait for the block to confirm
    await tx.wait();

    return NextResponse.json({ 
       success: true, 
       txHash: tx.hash,
       itemName,
       vendorAddress,
       amount: ethers.formatEther(txValue),
       message: `Proper x402 Native Transfer successful. Transaction indexed to Agent ${agentId}.`
    });

  } catch (err: any) {
    console.error("[x402 ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
