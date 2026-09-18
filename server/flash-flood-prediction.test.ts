import { describe, expect, it } from "vitest";
import { calculateFlashFloodNowcast } from "../client/src/data";

describe("flash-flood nowcast", () => {
  it("does not treat low sensor confidence as extra flood hazard", () => {
    const strongEvidence = calculateFlashFloodNowcast({ rain15mm: 20, soilSaturation: 55, riverRiseM30: 0.2, debrisLikelihood: 0.2, sensorConfidence: 0.95 });
    const weakEvidence = calculateFlashFloodNowcast({ rain15mm: 20, soilSaturation: 55, riverRiseM30: 0.2, debrisLikelihood: 0.2, sensorConfidence: 0.45 });
    expect(weakEvidence.probability).toBe(strongEvidence.probability);
    expect(weakEvidence.confidence).toBeLessThan(strongEvidence.confidence);
  });

  it("raises likelihood only when rainfall, saturation, and debris signals compound", () => {
    const isolated = calculateFlashFloodNowcast({ rain15mm: 38, soilSaturation: 78, riverRiseM30: 0.3, debrisLikelihood: 0.6, sensorConfidence: 0.9 });
    const compound = calculateFlashFloodNowcast({ rain15mm: 42, soilSaturation: 91, riverRiseM30: 0.64, debrisLikelihood: 0.92, sensorConfidence: 0.85 });
    expect(isolated.compoundTrigger).toBe(0.04);
    expect(compound.compoundTrigger).toBe(0.1);
    expect(compound.probability).toBeGreaterThan(isolated.probability);
    expect(compound.state).toBe("RED");
  });

  it("caps confidence when evidence quality is weak", () => {
    const result = calculateFlashFloodNowcast({ rain15mm: 42, soilSaturation: 91, riverRiseM30: 0.64, debrisLikelihood: 0.92, sensorConfidence: 0.55 });
    expect(result.probability).toBeGreaterThan(0.8);
    expect(result.confidence).toBeLessThan(0.6);
    expect(result.keyUncertainty).toContain("confidence is capped");
  });
});
