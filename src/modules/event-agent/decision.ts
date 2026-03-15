import { WeatherData, AqiData } from "./weather";

export interface DecisionResult {
  isConfirmed: boolean;
  reason: string;
  announcementText: string;
}

const RUN_LIMITS = {
  MAX_TEMP: 35, // Celsius
  MAX_AQI: 150, // Unhealthy
  ALLOW_RAIN: false, // For now, cancel on rain
};

export function evaluateRunDecision(weather: WeatherData, aqi: AqiData): DecisionResult {
  let isConfirmed = true;
  let reasons: string[] = [];

  // Weather checks
  if (weather.isRaining && !RUN_LIMITS.ALLOW_RAIN) {
    isConfirmed = false;
    reasons.push("Heavy rain mapped on the route.");
  }

  if (weather.tempCelsius >= RUN_LIMITS.MAX_TEMP) {
    isConfirmed = false;
    reasons.push(`Temperature at ${weather.tempCelsius}°C exceeds safe limits.`);
  }

  // Air quality check
  if (aqi.index > RUN_LIMITS.MAX_AQI) {
    isConfirmed = false;
    reasons.push(`AQI spiked to ${aqi.index} (${aqi.status}). Hazardous for running.`);
  }

  if (!isConfirmed) {
    return {
      isConfirmed: false,
      reason: reasons.join(" "),
      announcementText: `[Agent Notice] Cloka Run cancelled for Sunday.\n\nReason: ${reasons.join(" ")}\n\nx402 Deposits have been automatically returned to confirmed runners. See you next week. Protocol out.`
    };
  }

  return {
    isConfirmed: true,
    reason: "Conditions optimal.",
    announcementText: `[Agent Announcement] Cloka Sunday Long Run is officially CONFIRMED.\n\nTemp: ${weather.tempCelsius}°C | AQI: ${aqi.index}\n\nQueue processing triggered. Top 130 commitment scores are receiving x402 payment requests now. Run fast. Protocol active.`
  };
}
