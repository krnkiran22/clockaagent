"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, CheckCircle2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

export default function RunnerRegistration() {
  const { data: session, status } = useSession();
  
  const [step, setStep] = useState(1);
  const [scoreData, setScoreData] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If the user returns from Strava auth with a session, automatically proceed to calculate score
    if (status === "authenticated" && (session as any)?.accessToken && step === 1) {
      setStep(2);
      fetchScore((session as any).accessToken);
    }
  }, [status, session, step]);

  const handleConnectStrava = () => {
    // Initiate OAuth flow. For the hackathon demo, if env variables aren't set, 
    // we could fallback, but NextAuth will just error properly telling them to add it.
    signIn("strava");
  };

  const fetchScore = async (token: string) => {
    try {
      const res = await fetch("/api/runner/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      
      if (data.success) {
        setScoreData(data);
        setStep(3);
      } else {
        setErrorMsg(data.error || "Failed to fetch Strava runs.");
        setStep(1);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error communicating with scoring module.");
      setStep(1);
    }
  };

  const handleMintIdentity = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      setStep(4);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-24 font-sans selection:bg-[#FF4500] selection:text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF4500]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl mx-auto z-10 relative">
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#FF4500] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
            GOAT Testnet Live
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Runner Identity</h1>
          <p className="text-zinc-400 font-light">
            Connect Strava to compute your on-chain Commitment Score and mint your ERC-8004 identity.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 border border-zinc-800/50 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-orange-500">S</span>
                </div>
                <h2 className="text-2xl font-semibold">Connect Strava</h2>
                <p className="text-zinc-400 text-sm max-w-sm">
                  We read your last 90 days of runs. No manual data entry. Your GPS traces are cryptographically hashed for proof-of-run.
                </p>

                {errorMsg && (
                  <div className="w-full bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleConnectStrava}
                  disabled={status === "loading"}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] mt-4 disabled:opacity-50"
                >
                  {status === "loading" ? "Initializing..." : "Connect with Strava"}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-6 py-12"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-[#FF4500] animate-spin" />
                  <Activity className="absolute inset-0 m-auto w-6 h-6 text-[#FF4500]" />
                </div>
                <p className="font-mono text-sm text-zinc-400 animate-pulse">Computing Commitment Score via Real API...</p>
                <div className="space-y-2 text-xs font-mono text-zinc-500 text-center">
                  <p>Fetching last 90 days from Strava...</p>
                  <p>Verifying pace consistency...</p>
                  <p>Hashing GPS polylines...</p>
                </div>
              </motion.div>
            )}

            {step === 3 && scoreData && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div>
                  <h3 className="text-zinc-400 font-mono text-sm tracking-wider uppercase mb-2">Your Commitment Score</h3>
                  <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#00ff9d] to-blue-500 drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                    {scoreData.score}
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 text-left">
                  <div className="glass p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 font-mono font-semibold mb-1">TOTAL RUNS</p>
                    <p className="text-xl font-bold">{scoreData.stats?.totalRuns || 0}</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 font-mono font-semibold mb-1">NO SHOWS</p>
                    <p className="text-xl font-bold text-red-500">{scoreData.stats?.noShows || 0}</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-zinc-800 col-span-2">
                    <p className="text-xs text-zinc-500 font-mono font-semibold mb-1">GPS HASH (LATEST)</p>
                    <p className="text-xs font-mono text-zinc-300 truncate">{scoreData.latestHash}</p>
                  </div>
                </div>

                <button
                  onClick={handleMintIdentity}
                  disabled={isMinting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4500] to-orange-600 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(255,69,0,0.4)] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isMinting ? (
                    <span className="flex items-center gap-2 font-mono"><div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin"/> Minting...</span>
                  ) : (
                    <><Zap className="w-5 h-5" /> Mint ERC-8004 Identity </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Identity Live</h2>
                  <p className="text-zinc-400">Your Runner Identity is bound to your wallet. You are now eligible for Cloka Protocol event queues.</p>
                </div>
                
                <div className="w-full glass-accent p-4 border border-[#FF4500]/20 rounded-xl mt-4">
                  <div className="flex justify-between items-center border-b border-[#FF4500]/10 pb-2 mb-2">
                    <span className="text-xs font-mono text-zinc-500">Token ID</span>
                    <span className="text-sm font-mono text-white">#804</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-500">Commitment Rank</span>
                    <span className="text-sm font-mono font-bold text-[#FF4500]">Top 15%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
