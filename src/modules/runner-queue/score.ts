import { StravaRun } from "./strava";

export interface RunnerStats {
  totalRuns: number;
  noShows: number;
  paceConsistency: number; // 0-100 scale
  distanceLast30Days: number; // in km
}

/**
 * Calculates Commitment Score (0-100) based on runner's Strava history.
 * - Total Runs: +5 per run (max 50)
 * - Distance: +1 per 10km (max 20)
 * - Pace Consistency: +10 if variance < 1min/km
 * - No Shows: -15 per absence at a confirmed Cloka event
 */
export function calculateCommitmentScore(stats: RunnerStats): number {
  let score = 20; // Base score for connecting wallet/Strava
  
  // Reward active runners
  score += Math.min(50, stats.totalRuns * 5);
  
  // Reward distance logged
  score += Math.min(20, Math.floor(stats.distanceLast30Days / 10));
  
  // Reward consistent pacing (proof they aren't faking runs)
  if (stats.paceConsistency > 80) score += 10;
  
  // Heavy penalty for flaking
  score -= (stats.noShows * 15);
  
  // Floor check and Ceil check
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  
  return score;
}

/**
 * Parses raw Strava data into the stats model
 */
export function aggregateRunnerStats(runs: StravaRun[], knownNoShows: number): RunnerStats {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let distance30d = 0;
  const paces: number[] = [];

  runs.forEach(run => {
    const runDate = new Date(run.start_date);
    if (runDate >= thirtyDaysAgo) {
      distance30d += (run.distance / 1000); // converting meters to km
    }
    
    // Calculate pace in seconds per km
    if (run.distance > 0 && run.moving_time > 0) {
      paces.push(run.moving_time / (run.distance / 1000));
    }
  });
  
  // Calculate pace consistency (inverse of standard deviation of paces)
  // Mock simplified calculation for demo
  const averagePace = paces.reduce((a, b) => a + b, 0) / paces.length;
  const variance = paces.reduce((a, b) => a + Math.pow(b - averagePace, 2), 0) / paces.length;
  const stdDev = Math.sqrt(variance);
  
  // The lower the standard deviation in pace, the higher the consistency
  // If stdDev < 30 seconds/km, it's highly consistent (e.g. they really run a steady 5:30/km)
  const paceConsistency = Math.max(0, 100 - (stdDev / 30) * 10);

  return {
    totalRuns: runs.length,
    noShows: knownNoShows,
    paceConsistency: Math.round(paceConsistency),
    distanceLast30Days: Math.round(distance30d)
  };
}
