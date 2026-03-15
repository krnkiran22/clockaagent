"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Activity, Wallet, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [vendorPaid, setVendorPaid] = useState(false);
  const [recapGenerated, setRecapGenerated] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string, delay: number = 0) => {
    setTimeout(() => {
      setLogs((prev) => [...prev, message]);
    }, delay);
  };

  const startAutomatedSunday = async () => {
    setIsRunning(true);
    setLogs([]);
    setStep(1); // Evaluation
    
    addLog("[06:00:01] ❯ Waking Agent (Run Club Agent on GOAT L2)...", 500);
    addLog("[06:00:02] ❯ Fetching Weather: Temp 24.5°C, Rain: False", 1500);
    addLog("[06:00:03] ❯ Fetching AQI: 65 (Moderate)", 2000);
    
    setTimeout(() => {
      addLog("[06:00:04] ❯ CONDITION: OPTIMAL. Proceeding to announcement.", 500);
      setStep(2); // Queue Mapping
    }, 3500);

    setTimeout(() => {
      addLog("[06:00:08] ❯ Broadcasting Announcement to Telegram...", 500);
      addLog("[06:00:09] ❯ Fetching 482 Registered Runners...", 1500);
      addLog("[06:00:10] ❯ Computing Commitment Scores and generating Queue...", 2500);
      setStep(3); // Payments
    }, 6000);

    setTimeout(() => {
      addLog("[06:00:15] ❯ Queue sorted. Top 130 Spots Confirmed.", 500);
      addLog("[06:00:16] ❯ Runner A (Score: 100) -> CONFIRMED", 1000);
      addLog("[06:00:17] ❯ Runner B (Score: 20) -> WAITLISTED", 1500);
      addLog("[06:00:20] ❯ Fast Forward to End of Run (09:00 AM IST)...", 3500);
      setStep(4);
    }, 9500);

    setTimeout(() => {
      addLog("[09:00:01] ❯ Verifying GPS Hashes in run window. 128/130 attended.", 500);
      addLog("[09:00:02] ❯ 128 x402 Deposits returned. 2 Deposits Forfeited to Treasury.", 1500);
      addLog("[09:00:05] ❯ Routing Vendor Payments...", 3000);
      addLog("[09:00:06] ❯ Payment 1: Water Supplier (50 USDT) -> Fiat Card (Transak Bridge)", 4000);
      setVendorPaid(true);
    }, 13500);

    setTimeout(() => {
      addLog("[09:10:00] ❯ Generating Community LLM Recap...", 1000);
      addLog("[09:10:05] ❯ Minting LazAI DAT Record (Hash: 0x9f86d...)", 2500);
      addLog("[09:10:10] ❯ Protocol complete. See you next Sunday.", 4000);
      setRecapGenerated(true);
      setIsRunning(false);
      setStep(5);
    }, 18500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans selection:bg-[#FF4500] selection:text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left pane - Demo Controls */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-8 border border-zinc-800">
            <h1 className="text-3xl font-bold mb-2 text-white">Sunday Simulation</h1>
            <p className="text-zinc-400 mb-8 max-w-sm">
              Trigger the Run Club Agent agent exactly as it would wake up at 6:00 AM on Sunday morning.
            </p>

            <button
              onClick={startAutomatedSunday}
              disabled={isRunning || step === 5}
              className="w-full flex items-center justify-center gap-3 bg-[#FF4500] hover:bg-orange-600 text-white font-bold py-5 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-[#FF4500]"
            >
              {isRunning ? (
                <><Activity className="w-5 h-5 animate-pulse" /> Protocol Running...</>
              ) : step === 5 ? (
                <><CheckCircle2 className="w-5 h-5" /> Automation Complete</>
              ) : (
                <><Play className="w-5 h-5" /> Trigger Sunday Agent</>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Live Data Widgets */}
            <div className={`glass p-6 rounded-2xl border transition-colors ${step >= 1 ? "border-green-500/50" : "border-zinc-800"}`}>
              <ShieldAlert className={`w-8 h-8 mb-4 ${step >= 1 ? "text-green-500" : "text-zinc-600"}`} />
              <p className="text-xs text-zinc-500 font-mono font-medium mb-1">CONDITIONS</p>
              <p className="text-2xl font-bold">{step >= 1 ? "Clear" : "---"}</p>
            </div>
            
            <div className={`glass p-6 rounded-2xl border transition-colors ${step >= 3 ? "border-blue-500/50" : "border-zinc-800"}`}>
              <Activity className={`w-8 h-8 mb-4 ${step >= 3 ? "text-blue-500" : "text-zinc-600"}`} />
              <p className="text-xs text-zinc-500 font-mono font-medium mb-1">CONFIRMED QUEUE</p>
              <p className="text-2xl font-bold">{step >= 3 ? "130/130" : "---"}</p>
            </div>

            <div className={`glass p-6 rounded-2xl border transition-colors ${vendorPaid ? "border-purple-500/50" : "border-zinc-800"}`}>
              <Wallet className={`w-8 h-8 mb-4 ${vendorPaid ? "text-purple-500" : "text-zinc-600"}`} />
              <p className="text-xs text-zinc-500 font-mono font-medium mb-1">VENDORS PAID</p>
              <p className="text-2xl font-bold">{vendorPaid ? "2/2 via GOAT" : "---"}</p>
            </div>

            <div className={`glass p-6 rounded-2xl border transition-colors ${recapGenerated ? "border-orange-500/50" : "border-zinc-800"}`}>
              <FileText className={`w-8 h-8 mb-4 ${recapGenerated ? "text-orange-500" : "text-zinc-600"}`} />
              <p className="text-xs text-zinc-500 font-mono font-medium mb-1">LAZAI DAT HASH</p>
              <p className="text-sm font-bold font-mono truncate">{recapGenerated ? "0x9f...a0c5" : "---"}</p>
            </div>
          </div>
        </div>

        {/* Right pane - Live Terminal logs */}
        <div className="glass rounded-2xl border border-zinc-800 p-6 flex flex-col items-start bg-[#0a0a0a]">
          <div className="flex items-center gap-2 mb-6 w-full border-b border-zinc-800 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs font-mono text-zinc-500">runclub-agent-runtime</span>
            {isRunning && <span className="ml-auto flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4500]"></span>
            </span>}
          </div>

          <div className="flex-1 w-full overflow-y-auto font-mono text-sm space-y-3 pb-8 scrollbar-hide">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    log.includes("Waitlisted") || log.includes("Forfeited") ? "text-red-400" : 
                    log.includes("CONFIRMED") || log.includes("Clear") || log.includes("OPTIMAL") ? "text-green-400" : 
                    log.includes("Paid") || log.includes("Routing") ? "text-purple-400" : 
                    "text-zinc-300"
                  }`}
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {!isRunning && logs.length === 0 && (
              <div className="text-zinc-600 flex h-full items-center justify-center mt-20">
                 Awaiting Protocol Trigger...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
