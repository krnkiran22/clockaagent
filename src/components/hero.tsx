"use client";

import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4 pt-20 pb-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF4500]/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00ff9d]/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-[#FF4500]/30 text-sm font-mono text-[#FF4500]">
          <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
          ERC-8004 Agent Deployed on GOAT testnet
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white">
          The Run Club That <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#ffaa00]">
            Runs Itself.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          An autonomous on-chain agent that announces events, selects runners by proof-of-run, collects fees, pays vendors, and posts recaps. <strong className="text-white">Zero human intervention.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#ff5a1f] text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,69,0,0.3)]">
            <Zap className="w-5 h-5" />
            Deploy Protocol
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:bg-zinc-800">
            Read Logic
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full max-w-5xl mx-auto mt-20 relative z-10 p-1"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF4500]/20 to-transparent blur-xl -z-10 rounded-2xl" />
        <div className="glass rounded-2xl border border-zinc-800/50 p-6 shadow-2xl overflow-hidden relative">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs font-mono text-zinc-500">cloka-agent-runtime</span>
          </div>
          <div className="font-mono text-sm text-zinc-300 space-y-2 h-[200px] overflow-hidden flex flex-col justify-end">
             <div className="text-zinc-500">{"// 06:00 AM IST - Sunday Protocol Triggered"}</div>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex gap-2">
               <span className="text-green-400">❯</span> <span className="text-blue-300">Evaluating conditions...</span> AQI: 56, Temp: 24°C, Route: Clear.
             </motion.div>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="flex gap-2">
               <span className="text-green-400">❯</span> <span className="text-yellow-300">Action:</span> Event Announced (Tx: 0x8f2a...9c)
             </motion.div>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="flex gap-2">
               <span className="text-green-400">❯</span> <span className="text-purple-300">Processing Queue:</span> 482 Waitlist, 130 Spots. Ranking by Commitment Score...
             </motion.div>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="flex gap-2">
               <span className="text-green-400">❯</span> <span className="text-[#FF4500]">Vendors Paid via x402:</span> Water (50 USDT), Photographer (30 USDT). Route Completed.
             </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
