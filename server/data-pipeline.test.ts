import { describe, expect, it } from "vitest";
import { buildFeatureWindow, labelMatchesPrediction, validateObservation } from "@shared/dataPipeline";

describe("multi-source data pipeline", () => {
  const now = new Date("2026-09-19T12:00:00Z");

  it("rejects impossible values and unexpected units", () => {
    const result = validateObservation({ sensorKey: "SOIL-01", metric: "soil_saturation", value: 140, unit: "%", observedAt: now }, now);
    expect(result.quality).toBe("INVALID");
    expect(result.reasons.join(" ")).toContain("outside expected range");
  });

  it("marks delayed readings stale instead of silently treating them as current", () => {
    const result = validateObservation({ sensorKey: "RAIN-01", metric: "rain_15m", value: 18, unit: "mm", observedAt: new Date("2026-09-19T11:45:00Z"), receivedAt: new Date("2026-09-19T11:45:00Z") }, now);
    expect(result.quality).toBe("STALE");
  });

  it("builds latest and peak rolling features with data-quality counts", () => {
    const window = buildFeatureWindow("DHARALI", [
      { sensorKey: "RAIN-01", metric: "rain_15m", value: 22, unit: "mm", observedAt: new Date("2026-09-19T11:30:00Z"), quality: "GOOD", source: "IMD" },
      { sensorKey: "RAIN-01", metric: "rain_15m", value: 42, unit: "mm", observedAt: new Date("2026-09-19T11:45:00Z"), quality: "GOOD", source: "IMD" },
      { sensorKey: "SOIL-01", metric: "soil_saturation", value: 88, unit: "%", observedAt: new Date("2026-09-19T11:40:00Z"), quality: "GOOD", source: "IoT" },
      { sensorKey: "WL-01", metric: "river_rise_30m", value: 0.7, unit: "m", observedAt: new Date("2026-09-19T11:50:00Z"), quality: "STALE", source: "CWC" },
    ], now);
    expect(window.rain15m).toBe(42);
    expect(window.rain15mMax).toBe(42);
    expect(window.soilSaturation).toBe(88);
    expect(window.riverRiseM30).toBe(0.7);
    expect(window.staleObservationCount).toBe(1);
    expect(window.sourceKeys).toEqual(["IMD", "IoT", "CWC"]);
  });

  it("matches only verified events in the forecast horizon", () => {
    const window = buildFeatureWindow("DHARALI", [], now);
    const event = { eventKey: "E-01", locationKey: "DHARALI", startedAt: new Date("2026-09-19T12:25:00Z"), severity: "FLASH_FLOOD" as const, verified: true, verificationSource: "district log" };
    expect(labelMatchesPrediction(window, event, 30)).toBe(true);
    expect(labelMatchesPrediction(window, { ...event, startedAt: new Date("2026-09-19T13:00:00Z") }, 30)).toBe(false);
  });
});
