import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { itemId, itemName, price, vendorAddress } = await req.json();

    // The GOAT testnet RPC URL configured in our env
    const rpcUrl = process.env.X402_URL || "https://rpc.testnet3.goat.network";
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({ success: false, error: "Missing Agent Private Key in configuration." }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    let txHash = "";

    // Connect our wallet using the custom private key
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Construct the x402 tracking payload so the GOAT indexer can identify the merchant payment
    const x402Payload = JSON.stringify({
        merchant_id: process.env.X402_MERCHANT_ID || "0xgokkull",
        api_key: process.env.X402_API_KEY,
        protocol: "x402_payment"
      });

      // We send a tiny microtransaction of raw native gas (0.2) purely to trigger an on-chain event 
      // over to the vendor's public key as proof of x402 payment execution.
      // We append the custom x402 payload straight into the hex 'data' field for the dashboard to parse.
      const tx = await wallet.sendTransaction({
        to: vendorAddress,
        value: ethers.parseEther("0.2"),
        data: ethers.hexlify(ethers.toUtf8Bytes(x402Payload))
      });
      
      // Wait for it to be confirmed on the blockchain so it 100% shows up on the explorer
      await tx.wait();
      
      txHash = tx.hash;

    return NextResponse.json({ 
       success: true, 
       txHash,
       itemName,
       price,
       vendorAddress,
       message: `Payment successfully routed via x402 on GOAT Network!`
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
