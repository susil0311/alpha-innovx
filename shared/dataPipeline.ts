export type ObservationMetric = "rain_15m" | "river_rise_30m" | "soil_saturation" | "debris_likelihood";
export type ObservationQuality = "GOOD" | "STALE" | "INVALID";

export type Observation = {
  sensorKey: string;
  metric: ObservationMetric;
  value: number;
  unit: string;
  observedAt: Date;
  receivedAt?: Date;
  quality?: ObservationQuality;
  source?: string;
};

export type QualityResult = {
  quality: ObservationQuality;
  reasons: string[];
};

const bounds: Record<ObservationMetric, { min: number; max: number; units: string[] }> = {
  rain_15m: { min: 0, max: 500, units: ["mm"] },
  river_rise_30m: { min: -10, max: 10, units: ["m", "m/30m"] },
  soil_saturation: { min: 0, max: 100, units: ["%"] },
  debris_likelihood: { min: 0, max: 1, units: ["probability"] },
};

export function validateObservation(observation: Observation, now = new Date()): QualityResult {
  const reasons: string[] = [];
  const rule = bounds[observation.metric];
  if (!observation.sensorKey.trim()) reasons.push("sensorKey is empty");
  if (!Number.isFinite(observation.value)) reasons.push("value is not finite");
  if (observation.value < rule.min || observation.value > rule.max) reasons.push(`value outside expected range ${rule.min}..${rule.max}`);
  if (!rule.units.includes(observation.unit)) reasons.push(`unexpected unit ${observation.unit}`);
  if (Number.isNaN(observation.observedAt.getTime())) reasons.push("observedAt is invalid");
  if (observation.observedAt.getTime() > now.getTime() + 5 * 60_000) reasons.push("observation is in the future");
  if (observation.receivedAt && observation.receivedAt.getTime() - observation.observedAt.getTime() > 15 * 60_000) reasons.push("observation arrived more than 15 minutes late");
  if (observation.quality === "INVALID") reasons.push("source marked observation invalid");
  if (reasons.length) return { quality: "INVALID", reasons };
  if (observation.quality === "STALE" || (observation.receivedAt && now.getTime() - observation.receivedAt.getTime() > 10 * 60_000)) return { quality: "STALE", reasons: ["observation is stale"] };
  return { quality: "GOOD", reasons: [] };
}

export type FeatureWindow = {
  locationKey: string;
  windowEnd: Date;
  rain15m: number | null;
  rain15mMax: number | null;
  soilSaturation: number | null;
  riverRiseM30: number | null;
  debrisLikelihood: number | null;
  goodObservationCount: number;
  staleObservationCount: number;
  invalidObservationCount: number;
  sourceKeys: string[];
};

export function buildFeatureWindow(locationKey: string, observations: Observation[], windowEnd: Date, windowMinutes = 60): FeatureWindow {
  const start = windowEnd.getTime() - windowMinutes * 60_000;
  const inWindow = observations.filter(observation => {
    const timestamp = observation.observedAt.getTime();
    return timestamp >= start && timestamp <= windowEnd.getTime();
  });
  const values = (metric: ObservationMetric) => inWindow.filter(item => item.metric === metric && item.quality !== "INVALID").map(item => item.value);
  const latest = (metric: ObservationMetric) => {
    const candidates = inWindow.filter(item => item.metric === metric && item.quality !== "INVALID").sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
    return candidates[0]?.value ?? null;
  };
  const rain = values("rain_15m");
  return {
    locationKey,
    windowEnd,
    rain15m: latest("rain_15m"),
    rain15mMax: rain.length ? Math.max(...rain) : null,
    soilSaturation: latest("soil_saturation"),
    riverRiseM30: latest("river_rise_30m"),
    debrisLikelihood: latest("debris_likelihood"),
    goodObservationCount: inWindow.filter(item => item.quality === "GOOD").length,
    staleObservationCount: inWindow.filter(item => item.quality === "STALE").length,
    invalidObservationCount: inWindow.filter(item => item.quality === "INVALID").length,
    sourceKeys: Array.from(new Set(inWindow.map(item => item.source ?? item.sensorKey))),
  };
}

export type FloodEventLabel = {
  eventKey: string;
  locationKey: string;
  startedAt: Date;
  endedAt?: Date;
  severity: "WATCH" | "WARNING" | "FLASH_FLOOD" | "DEBRIS_FLOW";
  verified: boolean;
  verificationSource: string;
  notes?: string;
};

export function labelMatchesPrediction(window: FeatureWindow, event: FloodEventLabel, horizonMinutes: number): boolean {
  if (window.locationKey !== event.locationKey) return false;
  const delta = event.startedAt.getTime() - window.windowEnd.getTime();
  return delta >= 0 && delta <= horizonMinutes * 60_000;
}
