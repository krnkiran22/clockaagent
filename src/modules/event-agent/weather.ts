export interface WeatherData {
  tempCelsius: number;
  isRaining: boolean;
  windSpeedKmh: number;
  conditionDescription: string;
}

export interface AqiData {
  index: number; // 0-500 scale
  status: string; // Good, Moderate, Unhealthy, etc.
}

/**
 * Fetch mock weather data for Chennai (Cloka location)
 */
export async function fetchLiveWeather(): Promise<WeatherData> {
  // In production:
  // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Chennai&appid=${process.env.WEATHER_API_KEY}&units=metric`);
  
  return {
    tempCelsius: 24.5,
    isRaining: false,
    windSpeedKmh: 12,
    conditionDescription: "Clear skies"
  };
}

/**
 * Fetch mock AQI data for Chennai
 */
export async function fetchLiveAqi(): Promise<AqiData> {
  // In production:
  // const res = await fetch(`https://api.waqi.info/feed/chennai/?token=${process.env.AQI_API_KEY}`);
  
  return {
    index: 65,
    status: "Moderate"
  };
}
