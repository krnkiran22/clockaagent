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
 * Note: Uses the Strava API. 
 * For the hackathon demo, if the API call fails or token is mock, returns fallback data to avoid ruining the demo.
 */
export async function fetchRunnerHistory(accessToken: string): Promise<StravaRun[]> {
  try {
    const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${ninetyDaysAgo}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (response.ok) {
      const data = await response.json();
      // Filter strictly for Run types
      return data.filter((activity: any) => activity.type === "Run");
    } else {
      console.warn("Strava API fetched failed with status", response.status, "- Falling back to Mock Data for Demo");
    }
  } catch (error) {
    console.warn("Strava fetch failed entirely", error, "- Falling back to Mock Data for Demo");
  }

  // Fallback demo data
  return [
    {
      id: 101,
      name: "Sunday Long Run - Run Club",
      distance: 10000,
      moving_time: 3600,
      type: "Run",
      start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
      start_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
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
