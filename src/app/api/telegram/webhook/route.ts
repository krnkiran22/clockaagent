import { NextResponse } from "next/server";
import { allocateSpots } from "@/modules/spot-allocator/allocator";
import dbConnect from "@/lib/mongoose";
import Registration from "@/models/Registration";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if there is an incoming message
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text.toLowerCase();
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return NextResponse.json({ success: false, error: "Missing bot token configuration" });
      }

      let replyText = "";
      
      // Basic /start response
      if (text.startsWith("/start")) {
        replyText = "🤖 *Cloka Protocol Agent Online*\n\nI am listening natively from my contract deployment on Vercel!\n\n_Available Commands:_\n`/status` - Check current runner queue\n`/trigger` - Force finalization of the run queue";
      } 
      // Telegram `/status` command to read DB
      else if (text.startsWith("/status")) {
        try {
          await dbConnect();
          const count = await Registration.countDocuments();
          
          replyText = `📊 *Cloka Protocol Live Status*\n\nThere are currently *${count}* runners registered in the queue waiting for the agent to execute their commitment scores.`;
        } catch (e: any) {
          replyText = "❌ Agent Error: Failed to connect to the registry database.";
        }
      }
      // Telegram `/trigger` command to execute the run logic directly from chat!
      else if (text.startsWith("/trigger")) {
        try {
           // We re-run the exact same logic from the UI!
           await dbConnect();
           const registrations = await Registration.find({}).lean();
           
           if (registrations.length === 0) {
             replyText = "⚠️ Unable to trigger. The registration queue is currently completely empty.";
           } else {
             const applicants = registrations.map(r => ({
               runnerId: (r as any)._id.toString(),
               name: r.name,
               commitmentScore: r.commitmentScore,
               walletAddress: r.walletAddress,
               status: r.status as "pending" | "confirmed" | "waitlisted" | "cancelled"
             }));

             const { confirmedRunners } = allocateSpots(applicants);

             // Format message specifically for telegram output
             const namesList = confirmedRunners.map((r, i) => `${i + 1}. ${r.name} 🏆 (${r.commitmentScore} pts)`).join("\n");
             replyText = `*🚨 CLOKA RUN QUEUE HAS FORCIBLY CLOSED & FINALIZED VIA TELEGRAM AGENT COMMAND!*\n\n*CONFIRMED RUNNERS (${confirmedRunners.length})*\n\n${namesList}\n\n_Deposits are successfully locked in!_`;
           }
        } catch (e: any) {
           replyText = `❌ Agent Allocation Error: ${e.message}`;
        }
      }

      // If we formed a reply, send it back immediately
      if (replyText) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            parse_mode: "Markdown",
          }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook route error:", error);
    // Return 200 anyway so Telegram doesn't aggressively retry on their end
    return NextResponse.json({ success: true, error: "Silenced error" });
  }
}
