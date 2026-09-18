export type AlertLevel = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export type AlertEvaluationInput = {
  probability: number;
  confidence: number;
  leadTimeMinutes: number;
  physicalTrigger: boolean;
  criticalSignalsHealthy: boolean;
  independentSignals: number;
  staleCriticalSignals: string[];
};

export type AlertEvaluation = {
  level: AlertLevel;
  requiresHumanApproval: boolean;
  shouldNotifyResponders: boolean;
  shouldDraftPublicAlert: boolean;
  reason: string;
  limitations: string[];
  recommendedActions: string[];
};

export function evaluateFlashFloodAlert(input: AlertEvaluationInput): AlertEvaluation {
  const probability = Math.max(0, Math.min(1, input.probability));
  const confidence = Math.max(0, Math.min(1, input.confidence));
  const limitations = [...input.staleCriticalSignals];
  if (!input.criticalSignalsHealthy) limitations.push("One or more critical signals are unhealthy or unavailable");
  const independentEvidence = input.independentSignals >= 2;

  let level: AlertLevel = "GREEN";
  let reason = "No alert threshold is currently met; continue monitoring.";

  // Physical thresholds are safety gates: a verified rapid rise must not be
  // suppressed by a probabilistic model or a single missing sensor.
  if (input.physicalTrigger && input.criticalSignalsHealthy) {
    level = "RED";
    reason = "A physical flash-flood trigger is confirmed by healthy critical signals.";
  } else if (probability >= 0.8 && confidence >= 0.7 && independentEvidence) {
    level = "RED";
    reason = "High likelihood, adequate confidence, and independent signals agree.";
  } else if (probability >= 0.6 && confidence >= 0.6 && independentEvidence) {
    level = "ORANGE";
    reason = "Multiple independent signals indicate an imminent or developing flash-flood threat.";
  } else if (probability >= 0.4 || input.physicalTrigger) {
    level = "YELLOW";
    reason = input.physicalTrigger
      ? "A physical trigger is present, but evidence quality is insufficient for an automatic escalation."
      : "The model indicates an elevated threat that requires active watch and verification.";
  }

  if (probability >= 0.8 && confidence < 0.7) {
    limitations.push("High modeled likelihood has low evidence confidence; do not issue automatically");
  }

  const shouldNotifyResponders = level === "YELLOW" || level === "ORANGE" || level === "RED";
  return {
    level,
    requiresHumanApproval: shouldNotifyResponders,
    shouldNotifyResponders,
    shouldDraftPublicAlert: level === "ORANGE" || level === "RED",
    reason,
    limitations: Array.from(new Set(limitations)),
    recommendedActions: level === "RED"
      ? ["Notify control room and field responders immediately", "Prepare or issue an authorized evacuation warning", "Close exposed routes and verify safe movement capacity"]
      : level === "ORANGE"
        ? ["Notify responders and verify upstream conditions", "Prepare route closure and shelter operations", "Draft an authorized public warning"]
        : level === "YELLOW"
          ? ["Increase monitoring cadence", "Request field and camera confirmation", "Review readiness of routes and shelters"]
          : ["Continue routine monitoring and sensor-health checks"],
  };
}
