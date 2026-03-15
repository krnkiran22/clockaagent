import { AgentFeatures } from "@/components/agent-features";
import { Hero } from "@/components/hero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-[#FF4500] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FF4500]"></div>
            <span className="font-bold tracking-tighter text-lg">CLOKA PROTOCOL</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#agent" className="hover:text-white transition-colors">The Agent</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/announce" className="text-sm font-mono text-zinc-300 hover:text-white transition-colors">
              HQ / Dispatch
            </Link>
            <Link href="/admin/treasury" className="text-sm font-mono text-zinc-300 hover:text-white transition-colors">
              Treasury Vault
            </Link>
            <Link href="/vendor-payment" className="text-sm font-mono text-zinc-300 hover:text-white transition-colors">
              x402 Vendors
            </Link>
            <Link href="/marathon" className="bg-[#00ff9d] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00cc7a] transition-colors shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              Marathon Queue
            </Link>
          </div>
        </div>
      </nav>

      {/* Pages Sections */}
      <Hero />
      
      {/* Problem statement */}
      <section id="problem" className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-[#FF4500] font-mono font-semibold tracking-wider uppercase text-sm">The Broken Status Quo</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            The organizer is the bottleneck of his own creation.
          </h2>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-light">
            Every weekend, 400–500 people fight for 130 spots. The organizer messages hundreds manually, 
            picks selectively via WhatsApp, chases no-shows with zero accountability, and pays water vendors 
            by bank transfer. <strong className="text-white">This community cannot scale beyond what one person manages on Sunday morning.</strong>
          </p>
        </div>
      </section>

      <AgentFeatures />

      {/* Vendor Payout Router Section */}
      <section className="py-24 px-4 bg-black border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Fiat to Crypto Bridge
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">Vendors Don't Need Crypto.</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              While the Cloka Protocol operates entirely on-chain via x402, vendors don't manage wallets unless they want to. 
              The payment gateway bridge routes GOAT settlement directly to their preferred method.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex gap-3 text-zinc-300">
                <span className="text-[#FF4500] font-bold">1.</span> Fiat Card (INR/USD to Bank)
              </li>
              <li className="flex gap-3 text-zinc-300">
                <span className="text-[#FF4500] font-bold">2.</span> Crypto Card (Coinbase/Binance)
              </li>
              <li className="flex gap-3 text-zinc-300">
                <span className="text-[#FF4500] font-bold">3.</span> Native Crypto (USDT on GOAT)
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/2">
             <div className="glass-accent rounded-2xl p-8 border hover:shadow-[0_0_40px_rgba(255,69,0,0.15)] transition-all">
                <h3 className="font-mono text-xl text-white mb-6 border-b border-zinc-800/50 pb-4">On-Chain Transaction</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">From</span>
                    <span className="text-white truncate max-w-[200px]">0xGOATagent...39X</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">To</span>
                    <span className="text-[#00ff9d]">Water_Vendor.UPI via Transak</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Amount</span>
                    <span className="text-white">50.00 USDT → ₹4,180 INR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Settlement Time</span>
                    <span className="text-white">&lt; 60 seconds</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950 text-center text-zinc-500 font-mono text-sm flex flex-col items-center gap-4">
        <p>Built at OpenClaw Hack — Chennai, March 15, 2025</p>
        <p>GOAT Network Track — Agent-Native Payments</p>
      </footer>
    </main>
  );
}
