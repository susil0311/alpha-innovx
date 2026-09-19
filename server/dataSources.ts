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

export function configuredSourceAdapters(env: NodeJS.ProcessEnv = process.env): SourceAdapterConfig[] {
  const sources: SourceKind[] = ["IMD", "CWC", "NWIC", "IOT", "NASA_GPM", "BHUVAN"];
  return sources.flatMap(source => {
    const url = env[`${source}_DATA_URL`];
    if (!url) return [];
    return [{ source, url, headers: env[`${source}_DATA_TOKEN`] ? { Authorization: `Bearer ${env[`${source}_DATA_TOKEN`]}` } : undefined }];
  });
}
