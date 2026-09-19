import { normalizeSourcePayload, type SourceKind, type SourceObservationPayload } from "@shared/sourceContracts";
import type { Observation } from "@shared/dataPipeline";

export type SourceAdapterConfig = {
  source: SourceKind;
  url: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export async function fetchSourceObservations(config: SourceAdapterConfig): Promise<Observation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 10_000);
  try {
    const response = await fetch(config.url, { headers: config.headers, signal: controller.signal });
    if (!response.ok) throw new Error(`${config.source} source returned HTTP ${response.status}`);
    const body = await response.json() as { observations?: SourceObservationPayload[] } | SourceObservationPayload[];
    const payloads = Array.isArray(body) ? body : body.observations;
    if (!Array.isArray(payloads)) throw new Error(`${config.source} response must be an array or { observations: [] }`);
    return payloads.map(payload => normalizeSourcePayload({ ...payload, source: config.source }));
  } finally {
    clearTimeout(timeout);
  }
}

function parseNwicDate(value: string): Date {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`NWIC wind record has invalid Data Acquisition Time: ${value}`);
  const [, day, month, year, hour, minute] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+05:30`);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

export function parseNwicWindCsv(csv: string): Observation[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  const index = (name: string) => headers.indexOf(name);
  const stationIndex = index("Station");
  const latitudeIndex = index("Latitude");
  const longitudeIndex = index("Longitude");
  const timeIndex = index("Data Acquisition Time");
  const speedIndex = index("Telemetry Hourly Wind Speed (Km/Hr)");
  if ([stationIndex, latitudeIndex, longitudeIndex, timeIndex, speedIndex].some(value => value < 0)) throw new Error("NWIC wind CSV is missing one or more required columns");

  return lines.slice(1).flatMap(line => {
    const cells = splitCsvLine(line);
    const speed = Number(cells[speedIndex]);
    if (!cells[stationIndex] || !Number.isFinite(speed)) return [];
    const station = cells[stationIndex].replace(/\s+/g, "-").toUpperCase();
    const observedAt = parseNwicDate(cells[timeIndex]);
    return [{ sensorKey: `NWIC-WIND-${station}`, metric: "wind_speed_hourly" as const, value: speed, unit: "km/h", observedAt, receivedAt: new Date(), quality: "GOOD" as const, source: "NWIC", metadata: { agency: "Uttar Pradesh SW", state: cells[index("State")] ?? "", district: cells[index("District")] ?? "", latitude: cells[latitudeIndex] ?? "", longitude: cells[longitudeIndex] ?? "", sourceMetric: "Telemetry Hourly Wind Speed (Km/Hr)" } }];
  });
}

export async function fetchNwicWindCsv(url: string, timeoutMs = 20_000): Promise<Observation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`NWIC wind CSV returned HTTP ${response.status}`);
    return parseNwicWindCsv(await response.text());
  } finally {
    clearTimeout(timeout);
  }
}

export function configuredSourceAdapters(env: NodeJS.ProcessEnv = process.env): SourceAdapterConfig[] {
  const sources: SourceKind[] = ["IMD", "CWC", "NWIC", "IOT", "NASA_GPM", "BHUVAN", "FIELD_REPORT"];
  return sources.flatMap(source => {
    const url = env[`${source}_DATA_URL`];
    if (!url) return [];
    return [{ source, url, headers: env[`${source}_DATA_TOKEN`] ? { Authorization: `Bearer ${env[`${source}_DATA_TOKEN`]}` } : undefined }];
  });
}
