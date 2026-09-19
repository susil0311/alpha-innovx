import type { Observation, ObservationMetric } from "./dataPipeline";

export type SourceKind = "IMD" | "CWC" | "NWIC" | "IOT" | "NASA_GPM" | "BHUVAN" | "FIELD_REPORT";

export type SourceObservationPayload = {
  source: SourceKind;
  sensorKey: string;
  metric: ObservationMetric;
  value: number;
  unit: string;
  observedAt: string;
  metadata?: Record<string, string>;
};

export function normalizeSourcePayload(payload: SourceObservationPayload, receivedAt = new Date()): Observation {
  const observedAt = new Date(payload.observedAt);
  if (Number.isNaN(observedAt.getTime())) throw new Error("Source observation has an invalid observedAt timestamp");
  if (!Number.isFinite(payload.value)) throw new Error("Source observation value must be finite");
  return { sensorKey: payload.sensorKey.trim(), metric: payload.metric, value: payload.value, unit: payload.unit.trim(), observedAt, receivedAt, quality: "GOOD", source: payload.source };
}

export function sourceEnvironmentKey(source: SourceKind): string {
  return `${source}_DATA_URL`;
}
