import crypto from "crypto";

export interface StravaRun {
  id: number;
  name: string;
  distance: number; // in meters
  moving_time: number; // in seconds
  type: string;
  start_date: string;
  map: {
    polyline: string;
    summary_polyline: string;
  };
}

/**
 * Fetch last 90 days of Strava runs for a user
 * Note: In a real app this uses the Strava API. 
 * For the hackathon demo, this is a mock returning the runner's real history from test data.
 */
export async function fetchRunnerHistory(accessToken: string): Promise<StravaRun[]> {
  // Mock endpoint hit
  // const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${ninetyDaysAgo}`, {
  //   headers: { Authorization: `Bearer ${accessToken}` }
  // });
  
  return [
    {
      id: 101,
      name: "Sunday Long Run - Cloka",
      distance: 10000,
      moving_time: 3600,
      type: "Run",
      start_date: "2025-03-09T00:30:00Z",
      map: {
        polyline: "g_hwF_g`gMjAg@hBw...",
        summary_polyline: "g_hwF_g`gMjAg@hBw..."
      }
    },
    {
      id: 102,
      name: "Recovery Run",
      distance: 5000,
      moving_time: 1800,
      type: "Run",
      start_date: "2025-03-12T00:30:00Z",
      map: {
        polyline: "c_hwF_g`gMjAc@hDw...",
        summary_polyline: "c_hwF_g`gMjAc@hDw..."
      }
    }
  ];
}

/**
 * Generate a tamper-proof SHA-256 hash of the GPS polyline
 */
export function hashGpsTrace(polyline: string): string {
  return crypto.createHash("sha256").update(polyline).digest("hex");
}
