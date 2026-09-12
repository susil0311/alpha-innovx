const DHARALI = { latitude: 30.7333, longitude: 78.4399, timezone: "Asia/Kolkata" };

export const historicalDharaliEvents = [
  {
    date: "1945",
    title: "Historical cloudburst and debris-flow account",
    summary: "Published research describes a major cloudburst-triggered debris flow affecting the Dharali settlement area.",
    source: "Springer research summary",
    url: "https://link.springer.com/article/10.1007/s44475-026-00044-1",
  },
  {
    date: "2025-08-05",
    title: "Kheer Gad / Dharali catastrophic debris flow",
    summary: "Peer-reviewed reporting describes a catastrophic debris flow from the Kheer Ganga/Kheer Gad catchment; casualty and missing-person counts vary across contemporaneous reports.",
    source: "ScienceDirect case study",
    url: "https://www.sciencedirect.com/science/article/pii/S2666592125001003",
  },
  {
    date: "2025-08-11",
    title: "Bhagirathi course and fan reworking reported",
    summary: "News reporting described debris reworking the alluvial fan and changing the local Bhagirathi channel configuration after the August event.",
    source: "Times of India report",
    url: "https://timesofindia.indiatimes.com/india/flash-flood-changes-bhagirathi-course-river-returns-to-old-path/articleshow/123224789.cms",
  },
];

function buildForecastUrl() {
  const params = new URLSearchParams({
    latitude: String(DHARALI.latitude),
    longitude: String(DHARALI.longitude),
    current: "temperature_2m,relative_humidity_2m,precipitation,rain,showers,cloud_cover,wind_speed_10m,weather_code",
    hourly: "temperature_2m,precipitation,rain,precipitation_probability,cloud_cover,wind_speed_10m,soil_moisture_0_to_1cm",
    forecast_days: "2",
    timezone: DHARALI.timezone,
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export async function getDharaliLiveData() {
  const source = buildForecastUrl();
  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
    const payload = await response.json() as { current?: Record<string, number | string>; current_units?: Record<string, string>; hourly?: { time?: string[]; temperature_2m?: number[]; precipitation?: number[]; rain?: number[]; precipitation_probability?: number[]; cloud_cover?: number[]; wind_speed_10m?: number[]; soil_moisture_0_to_1cm?: number[] }; hourly_units?: Record<string, string> };
    const current = payload.current ?? {};
    const times = payload.hourly?.time ?? [];
    const now = Date.now();
    const recentIndexes = times.map((time, index) => ({ index, timestamp: new Date(time).getTime() })).filter(item => item.timestamp <= now).slice(-6).map(item => item.index);
    const nextIndexes = times.map((time, index) => ({ index, timestamp: new Date(time).getTime() })).filter(item => item.timestamp >= now).slice(0, 12).map(item => item.index);
    const nextSix = nextIndexes.slice(0, 6);
    const nextSixTotal = nextSix.reduce((sum, index) => sum + (payload.hourly?.precipitation?.[index] ?? 0), 0);
    const peakRain = Math.max(0, ...nextSix.map(index => payload.hourly?.rain?.[index] ?? 0));
    const peakProbability = Math.max(0, ...nextSix.map(index => payload.hourly?.precipitation_probability?.[index] ?? 0));
    const weatherWatch = peakRain >= 20 || nextSixTotal >= 40 ? "SEVERE RAIN WATCH" : peakRain >= 10 || nextSixTotal >= 20 ? "HEAVY RAIN WATCH" : "NO MODEL RAIN WATCH";
    return {
      available: true,
      source,
      fetchedAt: new Date().toISOString(),
      location: { ...DHARALI, label: "Dharali, Uttarkashi" },
      current: {
        temperature: current.temperature_2m ?? null,
        humidity: current.relative_humidity_2m ?? null,
        precipitation: current.precipitation ?? null,
        rain: current.rain ?? null,
        showers: current.showers ?? null,
        cloudCover: current.cloud_cover ?? null,
        windSpeed: current.wind_speed_10m ?? null,
        weatherCode: current.weather_code ?? null,
        units: payload.current_units ?? {},
      },
      recentHourly: recentIndexes.map(index => ({
        time: times[index],
        precipitation: payload.hourly?.precipitation?.[index] ?? null,
        rain: payload.hourly?.rain?.[index] ?? null,
        cloudCover: payload.hourly?.cloud_cover?.[index] ?? null,
        soilMoisture: payload.hourly?.soil_moisture_0_to_1cm?.[index] ?? null,
      })),
      nextHours: nextIndexes.map(index => ({
        time: times[index],
        temperature: payload.hourly?.temperature_2m?.[index] ?? null,
        precipitation: payload.hourly?.precipitation?.[index] ?? null,
        rain: payload.hourly?.rain?.[index] ?? null,
        precipitationProbability: payload.hourly?.precipitation_probability?.[index] ?? null,
        cloudCover: payload.hourly?.cloud_cover?.[index] ?? null,
        windSpeed: payload.hourly?.wind_speed_10m?.[index] ?? null,
      })),
      weatherWatch: { label: weatherWatch, nextSixHourPrecipitation: Number(nextSixTotal.toFixed(1)), peakHourlyRain: Number(peakRain.toFixed(1)), peakPrecipitationProbability: peakProbability },
      limitations: ["Open-Meteo is a weather-model feed, not a Dharali ground sensor.", "Bhagirathi gauge, Kheer Gad camera, and verified local rain-gauge streams are not connected in this build."],
    };
  } catch (error) {
    return {
      available: false,
      source,
      fetchedAt: new Date().toISOString(),
      location: { ...DHARALI, label: "Dharali, Uttarkashi" },
      error: error instanceof Error ? error.message : "Live weather feed unavailable",
      limitations: ["No live weather value was used because the source could not be reached.", "Bhagirathi gauge, Kheer Gad camera, and verified local rain-gauge streams are not connected in this build."],
    };
  }
}


export async function getDharaliHistoricalWeather() {
  const params = new URLSearchParams({
    latitude: String(DHARALI.latitude),
    longitude: String(DHARALI.longitude),
    start_date: "2025-08-01",
    end_date: "2025-08-10",
    daily: "precipitation_sum,precipitation_hours",
    timezone: DHARALI.timezone,
  });
  const source = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Open-Meteo archive returned ${response.status}`);
    const payload = await response.json() as { daily?: { time?: string[]; precipitation_sum?: (number | null)[]; precipitation_hours?: (number | null)[] }; daily_units?: Record<string, string> };
    const dates = payload.daily?.time ?? [];
    return {
      available: true,
      source,
      fetchedAt: new Date().toISOString(),
      window: { start: "2025-08-01", end: "2025-08-10" },
      daily: dates.map((date, index) => ({ date, precipitation: payload.daily?.precipitation_sum?.[index] ?? null, precipitationHours: payload.daily?.precipitation_hours?.[index] ?? null })),
      units: payload.daily_units ?? {},
      note: "Open-Meteo ERA5-Land archive estimate for the Dharali coordinate; not a station observation.",
    };
  } catch (error) {
    return { available: false, source, fetchedAt: new Date().toISOString(), window: { start: "2025-08-01", end: "2025-08-10" }, daily: [], error: error instanceof Error ? error.message : "Historical weather feed unavailable", note: "Historical weather could not be loaded." };
  }
}
