import { describe, expect, it } from "vitest";
import { evaluateFlashFloodAlert } from "@shared/alertPolicy";

describe("flash-flood alert policy", () => {
  it("escalates to RED when a physical trigger is confirmed by healthy signals", () => {
    const result = evaluateFlashFloodAlert({
      probability: 0.62,
      confidence: 0.61,
      leadTimeMinutes: 24,
      physicalTrigger: true,
      criticalSignalsHealthy: true,
      independentSignals: 1,
      staleCriticalSignals: [],
    });
    expect(result.level).toBe("RED");
    expect(result.shouldDraftPublicAlert).toBe(true);
    expect(result.requiresHumanApproval).toBe(true);
  });

  it("does not automatically issue a high-confidence alert when evidence is weak", () => {
    const result = evaluateFlashFloodAlert({
      probability: 0.91,
      confidence: 0.52,
      leadTimeMinutes: 28,
      physicalTrigger: false,
      criticalSignalsHealthy: false,
      independentSignals: 1,
      staleCriticalSignals: ["Kheer Gad camera"],
    });
    expect(result.level).toBe("YELLOW");
    expect(result.shouldDraftPublicAlert).toBe(false);
    expect(result.limitations.join(" ")).toContain("low evidence confidence");
  });

  it("uses ORANGE when independent signals agree but RED criteria are not met", () => {
    const result = evaluateFlashFloodAlert({
      probability: 0.7,
      confidence: 0.72,
      leadTimeMinutes: 42,
      physicalTrigger: false,
      criticalSignalsHealthy: true,
      independentSignals: 2,
      staleCriticalSignals: [],
    });
    expect(result.level).toBe("ORANGE");
    expect(result.shouldNotifyResponders).toBe(true);
    expect(result.shouldDraftPublicAlert).toBe(true);
  });
});
