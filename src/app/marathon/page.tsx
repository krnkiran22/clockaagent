"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Wallet, Trophy, CheckCircle2, ShieldCheck, Play } from "lucide-react";

export default function MarathonQueue() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finalized, setFinalized] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Random mock parameters generated on load for the visual representation
  const [wallet, setWallet] = useState("0x" + Math.random().toString(16).slice(2, 42));
  const [score, setScore] = useState(0);

  const MAX_SPOTS = 10; // Demo size to visualize the limit triggering

  useEffect(() => {
    fetchRegistrations();
    setScore(Math.floor(Math.random() * (100 - 40 + 1)) + 40); // Generate a 40-100 score on mount
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/marathon/register");
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
        setTotalCount(data.count);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const submitRegistration = async () => {
    if (!name || !email) return;

    try {
      const body = {
        name,
        email,
        stravaId: `str_${Math.random()}`,
        commitmentScore: score,
        walletAddress: wallet
      };

      await fetch("/api/marathon/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      setName("");
      setEmail("");
      setScore(Math.floor(Math.random() * (100 - 40 + 1)) + 40);
      setWallet("0x" + Math.random().toString(16).slice(2, 42));
      
      await fetchRegistrations();

    } catch (e) {
      console.error("Error submitting", e);
    }
  };

  const finalizeQueue = async () => {
    // Hits the backend route to process the allocator constraint and blast it to Telegram.
    setLoading(true);
    try {
       await fetch("/api/marathon/status", { method: "POST" });
       await fetchRegistrations(); // refetch so UI shows confirmed/waitlisted properly evaluated
       setFinalized(true);
    } catch (e) {
       console.error("Failed to finalize", e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans selection:bg-[#FF4500] selection:text-white pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="border-b border-zinc-800 pb-6 flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Marathon Registry & Allocation limit</h1>
             <p className="text-zinc-400">Apply to run. Spots map to commitment score. x402 handles the payment deposits cleanly.</p>
           </div>
           
           <div className="text-right">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-zinc-700 bg-zinc-900/50 mb-2 font-mono">
               <span className={`w-2 h-2 rounded-full animate-pulse ${totalCount >= MAX_SPOTS && !finalized ? 'bg-yellow-500' : finalized ? 'bg-[#FF4500]' : 'bg-green-500'}`} />
               {totalCount} / {MAX_SPOTS} APPLICANTS
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Sign Up Form (Runner Interface) */}
          <div className="glass rounded-2xl border border-zinc-800 p-8 space-y-6 self-start">
             <div>
               <h2 className="text-xl font-bold mb-1">Queue for the Run</h2>
               <p className="text-sm text-zinc-400">Join the waitlist. 50 USDT x402 entry deposit triggers immediately on confirmation.</p>
             </div>

             <div className="space-y-4">
               <div>
                  <label className="text-xs font-mono text-zinc-500 mb-2 block">FULL NAME</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Karthik N." disabled={finalized} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#00ff9d]" />
               </div>
               <div>
                  <label className="text-xs font-mono text-zinc-500 mb-2 block">EMAIL ADDRESS</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" disabled={finalized} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#00ff9d]" />
               </div>

               <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-3">
                 <div className="flex justify-between items-center text-sm font-mono">
                   <span className="text-zinc-500">Strava Trace Hit</span>
                   <span className="text-[#00ff9d] bg-[#00ff9d]/10 px-2 rounded flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Active</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-mono">
                   <span className="text-zinc-500">Simulated Score</span>
                   <span className="text-white font-bold">{score} pts</span>
                 </div>
               </div>

               <button 
                 onClick={submitRegistration} 
                 disabled={!name || !email || finalized} 
                 className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all disabled:opacity-50 ${finalized ? 'bg-zinc-800 text-zinc-500' : 'bg-[#00ff9d] hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(0,255,157,0.3)]'}`}
               >
                 <UserPlus className="w-5 h-5" /> 
                 {finalized ? "Registrations Closed" : "Apply & Setup x402 Deposit"}
               </button>
             </div>
          </div>

          {/* Admin Queue Execution & List */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
               <h3 className="text-lg font-bold mb-2 z-10">Agent Finalization Threshold</h3>
               <p className="text-zinc-400 text-sm max-w-sm mb-6 z-10">When limits are reached, trigger the allocation logic to lock confirmed spots by highest commitment scores & blast the list securely to Telegram.</p>
               
               <button 
                 onClick={finalizeQueue} 
                 disabled={loading || totalCount === 0 || finalized} 
                 className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all z-10 disabled:opacity-50 ${finalized ? 'bg-green-500 text-white' : 'bg-[#FF4500] hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(255,69,0,0.3)]'}`}
               >
                 {loading ? <span className="animate-spin"><Play className="w-4 h-4" /></span> : finalized ? <CheckCircle2 className="w-5 h-5"/> : <Wallet className="w-5 h-5" /> }
                 {loading ? "Allocating..." : finalized ? "Allocated & Pushed to Telegram" : "Trigger Agent Algorithm & Text Tg"}
               </button>
               {totalCount >= MAX_SPOTS && !finalized && <div className="absolute inset-0 bg-[#FF4500]/10 blur-3xl rounded-full z-0 pointer-events-none animate-pulse" />}
            </div>

            <div className="glass rounded-2xl border border-zinc-800 p-6 flex-1 max-h-[500px] overflow-y-auto">
              <h3 className="font-bold border-b border-zinc-800 pb-4 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500"/> Current Allocations
              </h3>

              {loading && registrations.length === 0 ? (
                <div className="text-center font-mono text-zinc-500 text-sm mt-10">Fetching Database...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center font-mono text-zinc-500 text-sm mt-10">Zero Active Registrations detected.</div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {registrations.map((reg) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                        key={reg._id} 
                        className={`flex items-center justify-between p-4 rounded-xl border ${reg.status === 'confirmed' ? 'bg-[#00ff9d]/5 border-[#00ff9d]/20' : reg.status === 'waitlisted' ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900 border-zinc-800'}`}
                      >
                         <div>
                           <p className="font-bold text-white mb-0.5 flex items-center gap-2">
                             {reg.name} 
                             {reg.status !== 'pending' && <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#00ff9d] text-black' : 'bg-red-500 text-white'}`}>{reg.status}</span>}
                           </p>
                           <p className="text-xs font-mono text-zinc-500 tracking-wider">Deposit {"->"} {reg.walletAddress.slice(0, 10)}...</p>
                         </div>
                         <div className="text-right">
                           <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#00ff9d]">{reg.commitmentScore}</p>
                           <p className="text-[10px] text-zinc-500 uppercase">SCORE</p>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
