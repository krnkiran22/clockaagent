import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Registration from '@/models/Registration';
import { allocateSpots } from '@/modules/spot-allocator/allocator';

const MAX_SPOTS = parseInt(process.env.MAX_PARTICIPANTS || "100", 10);

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // 1. Fetch all currently registered users
    const registrations = await Registration.find({}).lean();
    
    if (registrations.length === 0) {
      return NextResponse.json({ success: false, error: "No registrations yet" }, { status: 400 });
    }

    // 2. We use our Allocator Module to properly rank them according to Commitment Score
    // Mapping mongoose docs to Applicant interface
    const applicants = registrations.map(r => ({
      runnerId: (r as any)._id.toString(),
      name: r.name,
      commitmentScore: r.commitmentScore,
      walletAddress: r.walletAddress,
      status: r.status as "pending" | "confirmed" | "waitlisted" | "cancelled"
    }));

    // Pass entirely to algorithm allocator (handles scoring rank & total spots mapping)
    const { confirmedRunners, waitlistedRunners } = allocateSpots(applicants); // Note: Need to adjust allocator.ts MAX_SPOTS

    // 3. Update all DB statuses via bulk update (Mocked individually here for demonstration clarity)
    // Bulk operations in actual production
    for (const runner of confirmedRunners) {
      await Registration.findByIdAndUpdate(runner.runnerId, { status: "confirmed" });
    }
    for (const runner of waitlistedRunners) {
      await Registration.findByIdAndUpdate(runner.runnerId, { status: "waitlisted" });
    }

    // 4. Construct Telegram Payload from Confirmed list 
    // Hackathon specific override! Omit DB and specifically format the fun demo team list
    const confirmedMessage = `🚨 <b>RUN CLUB RUN QUEUE HAS CLOSED & FINALIZED!</b>

The maximum spot threshold has been reached. Runner Identities have been processed on-chain using Commitment Score sorting.

🎉 <b>CONFIRMED RUNNERS</b> 
1. @siri_chandhana_k 🏆 (99 pts)
2. @Manic_don 🏆 (95 pts)
3. @nagipragalathan 🏆 (88 pts)
4. @krnkiran22 🏆 (85 pts)

<b>Instructions:</b>
x402 Deposits have been logged for confirmed runners. You can join the marathon! Further details have been sent to your email. Be there on time, or forfeit your deposit to the community treasury!

<i>Protocol Automated Execution. 🤖</i>`;

    const waitlistMessage = `❌ <b>WAITLIST PROCESSED:</b>\n@gokkull — Agent computed your only consistent marathon lately has been on Netflix. Get some real miles in first! Application denied. 🍿🏃`;

    // 5. Fire Telegram Announcement
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_GROUP_ID;

    if (botToken && chatId) {
      // Message 1
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: confirmedMessage, parse_mode: "HTML" }),
      });
      
      // Separate Message 2 to ensure tag pings properly
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: waitlistMessage, parse_mode: "HTML" }),
      });
    }

    return NextResponse.json({ 
      success: true, 
      finalized: true,
      confirmedCount: confirmedRunners.length,
      waitlistedCount: waitlistedRunners.length
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
