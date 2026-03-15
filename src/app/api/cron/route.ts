import { NextResponse } from 'next/server';
import { fetchLiveWeather, fetchLiveAqi } from '@/modules/event-agent/weather';
import { evaluateRunDecision } from '@/modules/event-agent/decision';

export async function GET(req: Request) {
  // Can be secured via VERCEL_CRON_SECRET for production
  
  try {
    const weather = await fetchLiveWeather();
    const aqi = await fetchLiveAqi();
    
    const decision = evaluateRunDecision(weather, aqi);
    
    // Broadcast via TG / Twitter Mock
    console.log("[CRON EVENT AGENT] Waking up at 06:00 AM...");
    console.log(decision.announcementText);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      decision,
      envConditions: { weather, aqi }
    });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
