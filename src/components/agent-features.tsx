"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Wallet, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "1. Autonomous Agent Wake Up",
    description: "Every Sunday at 6:00 AM, the agent reads live weather, AQI, and Strava segments. If conditions meet the threshold, it announces the event. No human decision. No WhatsApp.",
    highlight: "Zero Manual Ops"
  },
  {
    icon: ShieldCheck,
    title: "2. Proof-of-Run Selection",
    description: "Runner Identity (ERC-8004) ranks by Commitment Score: total verified runs, no-show history, and pace consistency. Hashed GPS traces prove you earned your spot.",
    highlight: "Tamper-Proof Commitment"
  },
  {
    icon: Wallet,
    title: "3. x402 x GOAT Payments",
    description: "Runners place x402 deposits that return on attendance. No-shows forfeit to treasury. The agent pays water vendors & photographers instantly via GOAT L2.",
    highlight: "Insta-settlement"
  },
  {
    icon: FileText,
    title: "4. LazAI DAT Recaps",
    description: "10 mins post-run, the LLM generates a recap from Strava data, posts to TG/Twitter, and mints a permanent LazAI Data Attestation Token for the community history.",
    highlight: "Immutable History"
  }
];

export function AgentFeatures() {
  return (
    <section className="py-32 px-4 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF4500]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">How the Agent Replaces Us</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Four modules. Complete autonomy. <br className="hidden md:block" />Every financial, logistical, and social decision executed on-chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-2xl group border border-zinc-800/50 hover:border-[#FF4500]/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-[#FF4500]/50 group-hover:bg-[#FF4500]/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-zinc-400 group-hover:text-[#FF4500]" />
                </div>
                <span className="text-xs font-mono font-medium tracking-wider text-[#FF4500] bg-[#FF4500]/10 px-3 py-1 rounded-full">
                  {feature.highlight}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed max-w-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
