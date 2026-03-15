"use client";

import { motion } from "framer-motion";
import { Wallet, Settings, Activity, ArrowRightLeft, Database, RefreshCw } from "lucide-react";

export default function TreasuryDashboard() {
  const vendors = [
    { id: 1, name: "Chennai Water Corp.", item: "500 Hydration Bottles", cost: "50 USDT", route: "Fiat Card Bridge (Moonpay)", status: "Active" },
    { id: 2, name: "Lens.protocol Media", item: "Photographer 2 Hrs", cost: "30 USDT", route: "Direct x402 (GOAT L2)", status: "Active" },
    { id: 3, name: "City Traffic Ops.", item: "Route Permitting", cost: "100 USDT", route: "Fiat Card Bridge (Transak)", status: "Inactive" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans selection:bg-[#FF4500] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-6 flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Treasury & Vendor Routing</h1>
             <p className="text-zinc-400">Manage the community vault, track vendor payouts, and automate item procurement.</p>
           </div>
           <div className="hidden md:flex items-center gap-3">
             <span className="flex items-center gap-2 bg-[#FF4500]/10 border border-[#FF4500]/30 text-[#FF4500] px-4 py-2 rounded-full font-mono text-sm">
               <Database className="w-4 h-4" /> Agent Vault Online
             </span>
             <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors">
               <Settings className="w-4 h-4" /> Routing Config
             </button>
           </div>
        </div>

        {/* Treasury Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] -z-10" />
            <Wallet className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-sm font-mono text-zinc-400 mb-1 tracking-wider uppercase">COMMUNITY VAULT</p>
            <p className="text-4xl font-bold font-mono">1,045 USDT</p>
            <p className="text-xs text-blue-400 mt-2">+120 USDT from latest no-shows</p>
          </div>

          <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
            <Activity className="w-8 h-8 text-zinc-400 mb-4" />
            <p className="text-sm font-mono text-zinc-400 mb-1 tracking-wider uppercase">VENDORS ON-CHAIN</p>
            <p className="text-4xl font-bold font-mono">14</p>
            <p className="text-xs text-zinc-500 mt-2">Mapped directly to x402 module.</p>
          </div>

          <div className="glass p-6 rounded-2xl border border-[#00ff9d]/30 bg-[#00ff9d]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff9d]/20 blur-[50px] -z-10" />
            <RefreshCw className="w-8 h-8 text-[#00ff9d] mb-4" />
            <p className="text-sm font-mono text-zinc-400 mb-1 tracking-wider uppercase">AUTOMATED SPEND / RUN</p>
            <p className="text-4xl font-bold font-mono">80 USDT</p>
            <p className="text-xs text-[#00ff9d] mt-2">Drawn from runner deposits instantly.</p>
          </div>
        </div>

        <div className="glass rounded-2xl border border-zinc-800 p-6">
           <h2 className="text-xl font-bold text-white mb-6">Item Map & Route Log</h2>
           
           <div className="overflow-x-auto w-full">
             <table className="w-full text-left font-mono text-sm border-collapse">
               <thead>
                 <tr className="border-b border-zinc-800 text-zinc-500">
                   <th className="pb-4 pt-2 px-4 uppercase font-medium">Vendor Target</th>
                   <th className="pb-4 pt-2 px-4 uppercase font-medium">Procurement Item</th>
                   <th className="pb-4 pt-2 px-4 uppercase font-medium">Cost / Run</th>
                   <th className="pb-4 pt-2 px-4 uppercase font-medium">Settlement Route</th>
                   <th className="pb-4 pt-2 px-4 uppercase font-medium">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800/50">
                 {vendors.map(v => (
                   <motion.tr 
                     key={v.id}
                     whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                     className="transition-colors group"
                   >
                     <td className="py-4 px-4 whitespace-nowrap text-white">{v.name}</td>
                     <td className="py-4 px-4 text-zinc-300">{v.item}</td>
                     <td className="py-4 px-4 text-[#FF4500] font-bold">{v.cost}</td>
                     <td className="py-4 px-4 text-zinc-400 flex items-center gap-2">
                        {v.route.includes('Bridge') ? <ArrowRightLeft className="w-4 h-4 text-blue-400" /> : <Wallet className="w-4 h-4 text-[#00ff9d]" />}
                        {v.route}
                     </td>
                     <td className="py-4 px-4">
                       <span className={`px-2 py-1 rounded text-xs ${v.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                         {v.status}
                       </span>
                     </td>
                   </motion.tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}
