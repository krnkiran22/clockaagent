"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cloud, Thermometer, Wind, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminAnnounce() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("06:00");
  const [location, setLocation] = useState("Anna University Ground");
  const [maxRunners, setMaxRunners] = useState("10");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<"idle" | "success" | "error">("idle");

  const handleEvaluate = () => {
    setIsEvaluating(true);
    // Simulate hitting our Weather/AQI evaluation endpoints (mocked locally for demo to be fast)
    setTimeout(() => {
      // Mock data check. In production, this pings `/api/weather` and `/api/aqi` based on `date` and `time`
      const isGood = true; // Randomly decide or force true for demo
      
      setEvaluation({
        tempCelsius: 24.5,
        aqi: 65,
        status: "Moderate",
        isRaining: false,
        isConfirmed: isGood,
        announcementText: isGood 
          ? `[Agent Announcement] Run Club Sunday Long Run is officially CONFIRMED. \n\n📍 Date: ${date} @ ${time}\n🗺️ Location: ${location}\n👥 Max Spots: ${maxRunners} Runners\n⛅ Temp: 24.5°C | 💨 AQI: 65\n\n🎒 Perks: Drinks and snacks (protein bars) will be provided!\n\nQueue processing triggered. Top commitment scores will be confirmed.`
          : `[Agent Notice] Run Club Run cancelled for ${date}.\n\nReason: AQI Spiked to Hazardous levels. Protocol suspended.`,
        reason: isGood ? "Conditions optimal." : "Hazardous AQI."
      });
      setIsEvaluating(false);
    }, 1500);
  };

  const handlePostTelegram = async () => {
    if (!evaluation) return;
    setIsPosting(true);
    setPostStatus("idle");

    try {
      const res = await fetch("/api/telegram/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: evaluation.announcementText }),
      });
      const data = await res.json();
      
      if (data.success) {
        setPostStatus("success");
      } else {
        setPostStatus("error");
        setErrorMsg(data.error || "Telegram failed.");
      }
    } catch (e: any) {
      setPostStatus("error");
      setErrorMsg(e.message);
    }
    
    setIsPosting(false);
  };

  const handleTriggerQueue = async () => {
    setIsTriggering(true);
    setTriggerStatus("idle");
    try {
      const res = await fetch("/api/marathon/status", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTriggerStatus("success");
      } else {
        setTriggerStatus("error");
      }
    } catch (e: any) {
      setTriggerStatus("error");
    }
    setIsTriggering(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 border-b border-zinc-800 pb-6 flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Event Dispatcher</h1>
             <p className="text-zinc-400">Evaluate conditions and broadcast official event announcements to Telegram.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass rounded-2xl border border-zinc-800 p-6 space-y-6">
            <div>
              <label className="text-xs font-mono text-zinc-500 mb-2 block">PLANNED RUN DATE</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#FF4500] transition-colors" 
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 mb-2 block">START TIME</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#FF4500] transition-colors" 
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 mb-2 block">LOCATION / STARTING POINT</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#FF4500] transition-colors" 
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 mb-2 block">MAX PARTICIPANTS LIMIT</label>
              <input 
                type="number" 
                value={maxRunners}
                onChange={(e) => setMaxRunners(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#FF4500] transition-colors" 
              />
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !date || !time || !location || !maxRunners}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:border-[#FF4500] border border-zinc-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isEvaluating ? (
                <span className="flex items-center gap-2 font-mono"><div className="w-4 h-4 rounded-full border-t-2 border-[#FF4500] animate-spin"/> MAPPING CONDITIONS...</span>
              ) : (
                <><Cloud className="w-5 h-5 text-[#FF4500]" /> Evaluate Conditions</>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="glass rounded-2xl border border-zinc-800 p-6 flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!evaluation ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                  <Cloud className="w-12 h-12 opacity-50" />
                  <p className="text-sm font-mono text-center">Awaiting Time Parameters...</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 space-y-6 z-10">
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${evaluation.isConfirmed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    {evaluation.isConfirmed ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <AlertTriangle className="w-8 h-8 text-red-500" />}
                    <div>
                      <h3 className={`font-bold text-lg ${evaluation.isConfirmed ? 'text-green-500' : 'text-red-500'}`}>
                        {evaluation.isConfirmed ? 'GO: CONDITIONS OPTIMAL' : 'NO-GO: HAZARDOUS'}
                      </h3>
                      <p className="text-sm text-zinc-400">{evaluation.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                       <Thermometer className="w-4 h-4 text-orange-400 mb-2" />
                       <span className="text-2xl font-bold">{evaluation.tempCelsius}°C</span>
                     </div>
                     <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                       <Wind className="w-4 h-4 text-blue-400 mb-2" />
                       <span className="text-2xl font-bold">{evaluation.aqi}</span>
                       <span className="ml-2 text-xs text-zinc-500 uppercase">{evaluation.status}</span>
                     </div>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs whitespace-pre-wrap text-[#00ff9d]">
                     {evaluation.announcementText}
                  </div>

                  <button
                    onClick={handlePostTelegram}
                    disabled={isPosting || postStatus === "success"}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF4500] hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,69,0,0.3)] disabled:opacity-50"
                  >
                    {isPosting ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin"/> Sending...</span>
                    ) : postStatus === "success" ? (
                      <><CheckCircle2 className="w-5 h-5" /> Live on Telegram</>
                    ) : (
                      <><Send className="w-5 h-5" /> Push to Telegram Bot</>
                    )}
                  </button>

                  {postStatus === "error" && (
                    <p className="text-red-500 text-xs font-mono mt-2 text-center">{errorMsg}</p>
                  )}

                  {postStatus === "success" && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleTriggerQueue}
                      disabled={isTriggering || triggerStatus === "success"}
                      className="w-full flex items-center justify-center gap-2 bg-[#00ff9d] hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,255,157,0.3)] disabled:opacity-50 mt-4"
                    >
                      {isTriggering ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-t-2 border-black animate-spin"/> Executing Agent Allocation...</span>
                      ) : triggerStatus === "success" ? (
                        <><CheckCircle2 className="w-5 h-5" /> Final Confirmed List Sent</>
                      ) : (
                        <><Send className="w-5 h-5" /> Fast-Forward: Trigger Queue Allocation</>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Background Glows based on condition */}
            {evaluation?.isConfirmed && <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full z-0" />}
            {evaluation?.isConfirmed === false && <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full z-0" />}
          </div>
        </div>
      </div>
    </div>
  );
}
