import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Registration from "@/models/Registration";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Hackathon override: Automatically seed the specific default user list into the database queue when an event gets created
    try {
      await dbConnect();
      await Registration.deleteMany({});
      
      const defaultRunners = [
        { name: "@siri_chandhana_k", email: "siri@openclaw.com", stravaId: "str_siri", commitmentScore: 99, walletAddress: "0x123...abc", status: "pending", hasMadeDeposit: true },
        { name: "@Manic_don", email: "manic@openclaw.com", stravaId: "str_manic", commitmentScore: 95, walletAddress: "0x456...def", status: "pending", hasMadeDeposit: true },
        { name: "@nagipragalathan", email: "nagi@openclaw.com", stravaId: "str_nagi", commitmentScore: 88, walletAddress: "0x789...ghi", status: "pending", hasMadeDeposit: true },
        { name: "@krnkiran22", email: "kiran@openclaw.com", stravaId: "str_kiran", commitmentScore: 85, walletAddress: "0xabc...123", status: "pending", hasMadeDeposit: true },
        { name: "@gokkull", email: "gokul@openclaw.com", stravaId: "str_gokul", commitmentScore: 20, walletAddress: "0xdef...456", status: "pending", hasMadeDeposit: true }
      ];
      
      await Registration.insertMany(defaultRunners);
      console.log("Successfully seeded demo runners into the queue database!");
    } catch (dbErr) {
      console.error("Failed to seed default runners", dbErr);
    }
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_GROUP_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: "Telegram BOT_TOKEN or GROUP_ID is missing in .env" }, 
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.description }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Telegram API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
