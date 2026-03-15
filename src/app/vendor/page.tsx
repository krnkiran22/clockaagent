"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, CreditCard, Wallet, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function VendorRegistration() {
  const [step, setStep] = useState(1);
  const [payoutMethod, setPayoutMethod] = useState<"fiat_card" | "crypto_card" | "wallet" | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSelectMethod = (method: "fiat_card" | "crypto_card" | "wallet") => {
    setPayoutMethod(method);
    setStep(2);
  };

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans selection:bg-[#FF4500] selection:text-white">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto z-10 relative">
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-purple-400 mb-4">
             <Briefcase className="w-3 h-3" />
             Vendor Onboarding
          </div>
          <h1 className="text-4xl font-bold tracking-tight">How should the Agent pay you?</h1>
          <p className="text-zinc-400 font-light max-w-lg mx-auto">
             Run Club runs on an autonomous x402 module. There are no invoices or human approvals. You register your service and your routing preference.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 border border-zinc-800 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="mb-6 font-mono text-sm text-zinc-500">SELECT PAYOUT ROUTE</div>
                
                <button 
                  onClick={() => handleSelectMethod("fiat_card")}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group box-border hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                >
                  <div className="bg-zinc-900 p-3 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-400">Fiat Card / Bank Account</h3>
                     <p className="text-sm text-zinc-400">Crypto converted to INR/USD via Transak/Moonpay. Settles directly to your bank.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleSelectMethod("wallet")}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border border-zinc-800 hover:border-[#00ff9d]/50 hover:bg-[#00ff9d]/5 transition-all text-left group box-border hover:shadow-[0_0_20px_rgba(0,255,157,0.15)]"
                >
                  <div className="bg-zinc-900 p-3 rounded-lg group-hover:bg-[#00ff9d]/20 group-hover:text-[#00ff9d] transition-colors">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-white mb-1 group-hover:text-[#00ff9d]">Native Crypto</h3>
                     <p className="text-sm text-zinc-400">Direct USDT on GOAT L2. No conversion fees. Instant settlement.</p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-sm mb-6">
                  {payoutMethod === "fiat_card" ? (
                    <><AlertCircle className="w-5 h-5 text-zinc-400" /> You selected <strong className="text-blue-400 ml-1">Fiat (INR/USD) off-ramp.</strong></>
                  ) : (
                    <><AlertCircle className="w-5 h-5 text-zinc-400" /> You selected <strong className="text-[#00ff9d] ml-1">Native USDT on GOAT.</strong></>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-500 mb-2 block">SERVICE TYPE</label>
                    <input type="text" placeholder="e.g. Water Supply, Photography" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-500 mb-2 block">
                      {payoutMethod === "fiat_card" ? "BANK VPA / ALIAS (Mocked)" : "USDT WALLET ADDRESS"}
                    </label>
                    <input type="text" placeholder={payoutMethod === "fiat_card" ? "runclub_vendor@upi" : "0x..."} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-purple-500 transition-colors" />
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(147,51,234,0.3)] disabled:opacity-70 mt-8"
                >
                  {isRegistering ? (
                    <span className="flex items-center gap-2 font-mono"><div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin"/> Routing...</span>
                  ) : (
                    <>Register Payment Route <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Route Configured</h2>
                <p className="text-zinc-400 max-w-sm mx-auto">
                  The Run Club Agent will automatically execute payments to this route within 60 seconds of any run completion.
                </p>
                <div className="mt-8 p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm inline-block mx-auto text-left">
                  <p className="text-zinc-500">Registry Hash</p>
                  <p className="text-[#a855f7] break-all">0x4b7f83e2187c3e29f86d081884c7d659a2feaa0c55ad015a</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
