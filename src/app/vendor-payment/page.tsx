"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Coffee, Package, ShieldCheck, ArrowRightLeft, Loader2, ExternalLink, CreditCard } from "lucide-react";

// Mock database of items a vendor at the physical event might sell
const VENDOR_ITEMS = [
  { id: "itm_01", name: "Premium Protein Bar", price: "2 USDT", icon: <Package className="w-8 h-8 text-orange-400" /> },
  { id: "itm_02", name: "Electrolyte Water Bottle", price: "1 USDT", icon: <Coffee className="w-8 h-8 text-blue-400" /> },
  { id: "itm_03", name: "Runner's Med-Kit", price: "5 USDT", icon: <ShieldCheck className="w-8 h-8 text-red-400" /> }
];

export default function VendorPaymentDashboard() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Default vendor provided hardcoded!
  const targetVendorAddress = "0xBD361c9aF5b7B036ADe01399786F7134DA784fD8";

  const handlePurchase = async (item: any) => {
    setSelectedItem(item);
    setIsPaying(true);
    setReceipt(null);

    try {
      // Hits the server specifically to execute the core x402 GOAT process using our Private Key env.
      const res = await fetch("/api/x402/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          vendorAddress: targetVendorAddress
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setReceipt({
          txHash: data.txHash,
          item: data.itemName,
          price: data.price,
          vendor: data.vendorAddress
        });
      }
    } catch (e) {
      console.error("Payment failed", e);
    }

    setIsPaying(false);
  };

  const handleRazorpay = async (item: any) => {
    setSelectedItem(item);
    setIsPaying(true);
    setReceipt(null);
    
    // Simulating Razorpay popup and processor
    setTimeout(() => {
       setReceipt({
          txHash: "pay_" + Array.from({length: 14}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          item: item.name,
          price: item.price + " (Converted to INR)",
          vendor: "Razorpay Fiat Gateway",
          isFiat: true
       });
       setIsPaying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans selection:bg-[#FF4500] selection:text-white pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-8 h-8 text-[#00ff9d]" />
                x402 Vendor Marketplace
             </h1>
             <p className="text-zinc-400">Send direct payments over the GOAT Testnet seamlessly bridging between wallets and physical vendors.</p>
           </div>
           
           <div className="text-right">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-zinc-700 bg-zinc-900/50 font-mono text-xs">
               <span className="text-zinc-400">VENDOR WALLET:</span>
               <span className="text-white">{targetVendorAddress.slice(0, 8)}...{targetVendorAddress.slice(-6)}</span>
             </div>
           </div>
        </div>

        {/* Storefront Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {VENDOR_ITEMS.map((item) => (
             <div key={item.id} className="glass rounded-2xl border border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#00ff9d]/30 transition-all hover:-translate-y-1">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="font-mono text-[#00ff9d]">{item.price}</p>
                </div>
                
                <div className="w-full space-y-2 mt-4">
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={isPaying}
                    className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 border border-[#00ff9d]/30 text-[#00ff9d] disabled:opacity-50"
                  >
                    {isPaying && selectedItem?.id === item.id && !receipt?.isFiat ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    Pay Vendor (x402)
                  </button>

                  <button 
                    onClick={() => handleRazorpay(item)}
                    disabled={isPaying}
                    className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all bg-[#3395ff]/10 hover:bg-[#3395ff]/20 border border-[#3395ff]/30 text-[#3395ff] disabled:opacity-50"
                  >
                    {isPaying && selectedItem?.id === item.id && receipt?.isFiat ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Razorpay (Card/UPI)
                  </button>
                </div>
             </div>
           ))}
        </div>

        {/* Receipt Panel */}
        <AnimatePresence>
           {receipt && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="mt-12 glass rounded-2xl border border-[#00ff9d]/30 p-8 relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-[#00ff9d]/5 blur-3xl rounded-full z-0 font-mono" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                   <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[#00ff9d] flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-black" />
                         </div>
                         <div>
                            <h3 className="font-bold text-xl text-white">x402 Payment Verified</h3>
                            <p className="text-zinc-400 text-sm">Transaction mapped and settled successfully on-chain.</p>
                         </div>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-3 font-mono text-sm">
                         <div className="flex justify-between">
                            <span className="text-zinc-500">Item Purchased</span>
                            <span className="text-white">{receipt.item}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-500">Amount Sent</span>
                            <span className="text-[#00ff9d] font-bold">{receipt.price}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-500">Vendor Public Key</span>
                            <span className="text-zinc-300">{receipt.vendor}</span>
                         </div>
                      </div>
                   </div>

                   {/* TX Hash block isolated for emphasis */}
                   <div className={`w-full md:w-auto self-stretch flex flex-col justify-center border min-w-[300px] rounded-xl p-6 text-center ${receipt.isFiat ? 'border-[#3395ff]/20 bg-[#3395ff]/5' : 'border-[#00ff9d]/20 bg-[#00ff9d]/5'}`}>
                      <p className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-2">
                        {receipt.isFiat ? "Receipt ID" : "Immutable Tx Hash"}
                      </p>
                      <p className="text-[10px] md:text-xs font-mono text-white break-all mb-4">
                        {receipt.txHash}
                      </p>
                      {!receipt.isFiat && (
                        <a 
                          href={`https://explorer.testnet3.goat.network/tx/${receipt.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#00ff9d] hover:text-white transition-colors"
                        >
                           <ExternalLink className="w-3 h-3" /> View on GOAT Explorer
                        </a>
                      )}
                      {receipt.isFiat && (
                        <span className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#3395ff]">
                           <ShieldCheck className="w-3 h-3" /> Verified by Razorpay
                        </span>
                      )}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}
