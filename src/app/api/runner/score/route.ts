import { NextResponse } from "next/server";
import { fetchRunnerHistory } from "@/modules/runner-queue/strava";
import { aggregateRunnerStats, calculateCommitmentScore } from "@/modules/runner-queue/score";

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "No Strava Access Token provided" }, { status: 400 });
    }

    // 1. Fetch real runner history from Strava
    const runs = await fetchRunnerHistory(accessToken);

    // 2. Aggregate the stats (assumes 0 known no-shows for this fresh runner in the hackathon demo context)
    const stats = aggregateRunnerStats(runs, 0);

    // 3. Compute score based on on-chain parameters
    const score = calculateCommitmentScore(stats);

    // Provide the latest hashed trace if they have runs
    const latestHash = runs.length > 0 && runs[0].map?.summary_polyline
      ? "0x" + require("crypto").createHash("sha256").update(runs[0].map.summary_polyline).digest("hex") 
      : "0x0000000000000000000000000000000000000000000000000000000000000000";

    return NextResponse.json({
      success: true,
      score,
      stats,
      latestHash
    });

  } catch (error: any) {
    console.error("Score Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
