import { describe, expect, it } from "vitest";
import { normalizeSourcePayload } from "@shared/sourceContracts";

describe("source contracts", () => {
  it("normalizes official and IoT payloads into the shared observation shape", () => {
    const observation = normalizeSourcePayload({ source: "IMD", sensorKey: "RAIN-KG-01", metric: "rain_15m", value: 28, unit: "mm", observedAt: "2026-09-19T12:00:00Z" });
    expect(observation.source).toBe("IMD");
    expect(observation.observedAt.toISOString()).toBe("2026-09-19T12:00:00.000Z");
    expect(observation.quality).toBe("GOOD");
  });

  it("rejects malformed source timestamps", () => {
    expect(() => normalizeSourcePayload({ source: "CWC", sensorKey: "WL-01", metric: "river_rise_30m", value: 0.4, unit: "m", observedAt: "not-a-date" })).toThrow("observedAt");
  });
});
