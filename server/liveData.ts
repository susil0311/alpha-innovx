import { kheerGadAntecedentRainfall, kheerGadCatchmentFeatures, kheerGadHistoricalEvent, kheerGadPaperSource } from "@shared/kheerGadEvidence";

const DHARALI = { latitude: 30.7333, longitude: 78.4399, timezone: "Asia/Kolkata" };
const INDIAN_API_BASE_URL = process.env.INDIAN_API_BASE_URL ?? "https://weather.indianapi.in";

export const historicalDharaliEvents = [
  { date: kheerGadHistoricalEvent.date, title: kheerGadPaperSource.title, summary: kheerGadHistoricalEvent.summary, source: kheerGadPaperSource.citation, url: kheerGadHistoricalEvent.sourceUrl },
  { date: "1945", title: "Historical cloudburst and debris-flow account", summary: "Published research describes a major cloudburst-triggered debris flow affecting the Dharali settlement area.", source: "Springer research summary", url: "https://link.springer.com/article/10.1007/s44475-026-00044-1" },
  { date: "2025-08-05", title: "Kheer Gad / Dharali catastrophic debris flow", summary: "Peer-reviewed reporting describes a catastrophic debris flow from the Kheer Ganga/Kheer Gad catchment; casualty and missing-person counts vary across contemporaneous reports.", source: "ScienceDirect case study", url: "https://www.sciencedirect.com/science/article/pii/S2666592125001003" },
  { date: "2025-08-11", title: "Bhagirathi course and fan reworking reported", summary: "News reporting described debris reworking the alluvial fan and changing the local Bhagirathi channel configuration after the August event.", source: "Times of India report", url: "https://timesofindia.indiatimes.com/india/flash-flood-changes-bhagirathi-course-river-returns-to-old-path/articleshow/123224789.cms" },
];

export const historicalDharaliEvidence = {
  event: kheerGadHistoricalEvent,
  antecedentRainfall: kheerGadAntecedentRainfall,
  catchmentFeatures: kheerGadCatchmentFeatures,
  source: kheerGadPaperSource,
  limitations: ["The rainfall values are reported antecedent-window totals, not a complete daily time series.", "The evidence is historical and must not be treated as a live sensor feed.", "The paper coordinates differ from the live-weather coordinate currently configured for Dharali and require spatial reconciliation before automated joins."],
};

function buildForecastUrl() {
  const params = new URLSearchParams({ latitude: String(DHARALI.latitude), longitude: String(DHARALI.longitude), current: "temperature_2m,relative_humidity_2m,precipitation,rain,showers,cloud_cover,wind_speed_10m,weather_code", hourly: "temperature_2m,precipitation,rain,precipitation_probability,cloud_cover,wind_speed_10m,soil_moisture_0_to_1cm", forecast_days: "2", timezone: DHARALI.timezone });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function indianApiConfigured() {
  return Boolean(process.env.INDIAN_API_KEY && (process.env.INDIAN_API_CITY || process.env.INDIAN_API_CITY_ID));
}

function buildIndianApiUrl() {
  const params = new URLSearchParams();
  if (process.env.INDIAN_API_CITY_ID) {
    params.set("city_id", process.env.INDIAN_API_CITY_ID);
    return `${INDIAN_API_BASE_URL}/india/weather_by_id?${params.toString()}`;
  }
  params.set("city", process.env.INDIAN_API_CITY ?? "Dharali");
  return `${INDIAN_API_BASE_URL}/india/weather?${params.toString()}`;
}

async function getIndianApiWeather() {
  const source = buildIndianApiUrl();
  const response = await fetch(source, { headers: { "x-api-key": process.env.INDIAN_API_KEY ?? "" }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`IndianAPI returned ${response.status}`);
  const payload = await response.json() as { city?: string; weather?: { current?: { humidity?: { morning?: number; evening?: number }; rainfall?: number | null; temperature?: { max?: { value?: number }; min?: { value?: number } } }; forecast?: Array<{ date?: string; max_temp?: number; min_temp?: number; description?: string }>; astronomical?: Record<string, string> } };
  const current = payload.weather?.current ?? {};
  const forecast = payload.weather?.forecast ?? [];
  const descriptions = forecast.map(item => item.description ?? "").join(" ").toLowerCase();
  const rainSignal = descriptions.includes("heavy") || descriptions.includes("thunder") ? "SEVERE RAIN WATCH" : descriptions.includes("rain") || descriptions.includes("shower") ? "HEAVY RAIN WATCH" : "NO MODEL RAIN WATCH";
  return {
    available: true as const,
    provider: "IndianAPI",
    source,
    fetchedAt: new Date().toISOString(),
    location: { ...DHARALI, label: payload.city ?? process.env.INDIAN_API_CITY ?? "Dharali, Uttarkashi" },
    current: {
      temperature: current.temperature?.max?.value ?? current.temperature?.min?.value ?? null,
      humidity: current.humidity?.evening ?? current.humidity?.morning ?? null,
      precipitation: current.rainfall ?? null,
      rain: current.rainfall ?? null,
      showers: null,
      cloudCover: null,
      windSpeed: null,
      weatherCode: null,
      units: { temperature_2m: "°C", relative_humidity_2m: "%", precipitation: "mm", rain: "mm", showers: "mm", cloud_cover: "%", wind_speed_10m: "km/h", weather_code: "" },
    },
    recentHourly: [],
    nextHours: forecast.map(item => ({ time: item.date ?? "", temperature: item.max_temp ?? null, precipitation: null, rain: null, precipitationProbability: null, cloudCover: null, windSpeed: null, description: item.description ?? null })),
    weatherWatch: { label: rainSignal, nextSixHourPrecipitation: 0, peakHourlyRain: 0, peakPrecipitationProbability: 0 },
    limitations: ["IndianAPI provides city/station weather and forecast data; it is not a Kheer Gad ground sensor.", "IndianAPI response does not provide the sub-hourly rainfall and river-level signals required for a standalone flash-flood trigger.", "Bhagirathi gauge, Kheer Gad camera, and verified local rain-gauge streams are not connected in this build."],
  };
}

async function getOpenMeteoWeather() {
  const source = buildForecastUrl();
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
    available: true as const,
    provider: "Open-Meteo",
    source,
    fetchedAt: new Date().toISOString(),
    location: { ...DHARALI, label: "Dharali, Uttarkashi" },
    current: { temperature: current.temperature_2m ?? null, humidity: current.relative_humidity_2m ?? null, precipitation: current.precipitation ?? null, rain: current.rain ?? null, showers: current.showers ?? null, cloudCover: current.cloud_cover ?? null, windSpeed: current.wind_speed_10m ?? null, weatherCode: current.weather_code ?? null, units: payload.current_units ?? {} },
    recentHourly: recentIndexes.map(index => ({ time: times[index], precipitation: payload.hourly?.precipitation?.[index] ?? null, rain: payload.hourly?.rain?.[index] ?? null, cloudCover: payload.hourly?.cloud_cover?.[index] ?? null, soilMoisture: payload.hourly?.soil_moisture_0_to_1cm?.[index] ?? null })),
    nextHours: nextIndexes.map(index => ({ time: times[index], temperature: payload.hourly?.temperature_2m?.[index] ?? null, precipitation: payload.hourly?.precipitation?.[index] ?? null, rain: payload.hourly?.rain?.[index] ?? null, precipitationProbability: payload.hourly?.precipitation_probability?.[index] ?? null, cloudCover: payload.hourly?.cloud_cover?.[index] ?? null, windSpeed: payload.hourly?.wind_speed_10m?.[index] ?? null })),
    weatherWatch: { label: weatherWatch, nextSixHourPrecipitation: Number(nextSixTotal.toFixed(1)), peakHourlyRain: Number(peakRain.toFixed(1)), peakPrecipitationProbability: peakProbability },
    limitations: ["Open-Meteo is a weather-model feed, not a Dharali ground sensor.", "Bhagirathi gauge, Kheer Gad camera, and verified local rain-gauge streams are not connected in this build."],
  };
}

export async function getDharaliLiveData() {
  if (indianApiConfigured()) {
    try { return await getIndianApiWeather(); } catch (error) {
      try {
        const fallback = await getOpenMeteoWeather();
        return { ...fallback, fallbackFrom: "IndianAPI", limitations: [...fallback.limitations, `IndianAPI was unavailable: ${error instanceof Error ? error.message : "request failed"}`] };
      } catch (fallbackError) {
        return { available: false as const, provider: "IndianAPI", source: buildIndianApiUrl(), fetchedAt: new Date().toISOString(), location: { ...DHARALI, label: "Dharali, Uttarkashi" }, error: fallbackError instanceof Error ? fallbackError.message : "Weather feeds unavailable", limitations: ["IndianAPI and Open-Meteo were unavailable."] };
      }
    }
  }
  try { return await getOpenMeteoWeather(); } catch (error) {
    return { available: false as const, provider: "Open-Meteo", source: buildForecastUrl(), fetchedAt: new Date().toISOString(), location: { ...DHARALI, label: "Dharali, Uttarkashi" }, error: error instanceof Error ? error.message : "Live weather feed unavailable", limitations: ["No live weather value was used because the source could not be reached.", "IndianAPI is not configured.", "Bhagirathi gauge, Kheer Gad camera, and verified local rain-gauge streams are not connected in this build."] };
  }
}

export async function getDharaliHistoricalWeather() {
  const params = new URLSearchParams({ latitude: String(DHARALI.latitude), longitude: String(DHARALI.longitude), start_date: "2025-08-01", end_date: "2025-08-10", daily: "precipitation_sum,precipitation_hours", timezone: DHARALI.timezone });
  const source = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Open-Meteo archive returned ${response.status}`);
    const payload = await response.json() as { daily?: { time?: string[]; precipitation_sum?: (number | null)[]; precipitation_hours?: (number | null)[] }; daily_units?: Record<string, string> };
    const dates = payload.daily?.time ?? [];
    return { available: true as const, source, fetchedAt: new Date().toISOString(), window: { start: "2025-08-01", end: "2025-08-10" }, daily: dates.map((date, index) => ({ date, precipitation: payload.daily?.precipitation_sum?.[index] ?? null, precipitationHours: payload.daily?.precipitation_hours?.[index] ?? null })), units: payload.daily_units ?? {}, note: "Open-Meteo ERA5-Land archive estimate for the Dharali coordinate; not a station observation." };
  } catch (error) { return { available: false as const, source, fetchedAt: new Date().toISOString(), window: { start: "2025-08-01", end: "2025-08-10" }, daily: [], error: error instanceof Error ? error.message : "Historical weather feed unavailable", note: "Historical weather could not be loaded." }; }
}
