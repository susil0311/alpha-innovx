export type RiskState = "RED" | "ORANGE" | "YELLOW" | "GREEN";

export type Village = {
  id: string;
  name: string;
  state: RiskState;
  escalation: string;
  priority: number;
  confidence: number;
  population: number;
  flood: number;
  landslide: number;
  compound: number;
  hazard: string;
  x: number;
  y: number;
  watershed: string;
  deadline: string;
  route: string;
  shelter: string;
  elevation: string;
  action: string;
  lat: number;
  lng: number;
};

export const catchment = {
  name: "Dharali–Harsil corridor",
  district: "Uttarkashi, Uttarakhand",
  river: "Bhagirathi River",
  tributary: "Kheer Gad",
  centre: "30.7333° N, 78.4399° E",
  elevation: "2,680 m",
  lastUpdated: "2 min ago",
};

export const villages: Village[] = [
  { id: "DHARALI_001", name: "Dharali", state: "RED", escalation: "Now", priority: 0.94, confidence: 0.89, population: 620, flood: 0.91, landslide: 0.84, compound: 0.93, hazard: "Kheer Gad debris flow", x: 58, y: 51, watershed: "Kheer Gad alluvial fan", deadline: "Evacuate now", route: "Gangotri Road · compromised", shelter: "Harsil Army Ground", elevation: "2,680 m", action: "Move to high ground away from Kheer Gad and the Bhagirathi bank", lat: 30.7333, lng: 78.4399 },
  { id: "HARSIL_002", name: "Harsil", state: "ORANGE", escalation: "45 min", priority: 0.88, confidence: 0.86, population: 980, flood: 0.68, landslide: 0.74, compound: 0.78, hazard: "River rise + road cut", x: 30, y: 34, watershed: "Bhagirathi upper reach", deadline: "11:15 IST", route: "Army Ground route available", shelter: "Harsil Army Ground", elevation: "2,620 m", action: "Open shelter, keep vehicles off the river road, prepare assisted movement", lat: 30.7518, lng: 78.4228 },
  { id: "JHALA_003", name: "Jhala", state: "ORANGE", escalation: "1 h", priority: 0.82, confidence: 0.83, population: 460, flood: 0.59, landslide: 0.77, compound: 0.72, hazard: "Slope failure above road", x: 19, y: 68, watershed: "Jhala slope", deadline: "11:30 IST", route: "Gangotri Road · rockfall risk", shelter: "Jhala Primary School", elevation: "2,560 m", action: "Stop uphill travel, clear the road, notify households below the cut slope", lat: 30.7198, lng: 78.4155 },
  { id: "BAGORI_004", name: "Bagori", state: "YELLOW", escalation: "3 h", priority: 0.64, confidence: 0.79, population: 290, flood: 0.46, landslide: 0.58, compound: 0.56, hazard: "Road washout watch", x: 43, y: 21, watershed: "Bagori nala", deadline: "13:05 IST", route: "Open · monitor culvert", shelter: "Bagori Community Hall", elevation: "2,650 m", action: "Stage a local team and keep the culvert approach clear", lat: 30.7421, lng: 78.4512 },
  { id: "MUKHBA_005", name: "Mukhba", state: "YELLOW", escalation: "6 h", priority: 0.48, confidence: 0.76, population: 240, flood: 0.39, landslide: 0.51, compound: 0.44, hazard: "Secondary slope risk", x: 72, y: 28, watershed: "Mukhba ridge", deadline: "15:40 IST", route: "Open · alternate access", shelter: "Mukhba Panchayat Hall", elevation: "2,620 m", action: "Check vulnerable homes and prepare a voluntary movement notice", lat: 30.7612, lng: 78.4621 },
  { id: "SUKKI_006", name: "Sukki", state: "GREEN", escalation: "12 h", priority: 0.28, confidence: 0.74, population: 330, flood: 0.21, landslide: 0.31, compound: 0.25, hazard: "Watch", x: 83, y: 68, watershed: "Sukki Top", deadline: "18:00 IST", route: "Open", shelter: "Sukki School", elevation: "2,740 m", action: "Maintain watch and keep the alternate route ready", lat: 30.7724, lng: 78.4734 },
];

export const cascadeNodes = [
  { label: "Cloudburst cell", type: "RAIN", risk: 0.86, note: "15-minute intensity rising over upper Kheer Gad catchment" },
  { label: "Kheer Gad nala", type: "STREAM", risk: 0.91, note: "Debris-laden flow can arrive before river gauge peaks" },
  { label: "Dharali fan", type: "FAN", risk: 0.94, note: "Low-lying alluvial fan and settlement exposure" },
  { label: "Gangotri Road", type: "ROAD", risk: 0.82, note: "One corridor; closure isolates upstream hamlets" },
  { label: "Dharali + Harsil", type: "VILLAGE", risk: 0.93, note: "Evacuate low bank; open high-ground shelter" },
];

export const sensorRows = [
  { name: "RAIN-KG-01", type: "Rain gauge · Kheer Gad", value: "42 mm / 15m", age: "2 min", battery: "88%", signal: "Strong", health: "Healthy" },
  { name: "WL-BHG-02", type: "River level · Bhagirathi", value: "+0.64 m / 30m", age: "3 min", battery: "76%", signal: "Strong", health: "Healthy" },
  { name: "SOIL-DHR-01", type: "Soil saturation · Dharali", value: "91%", age: "6 min", battery: "62%", signal: "Degraded", health: "Degraded" },
  { name: "CAM-KGR-01", type: "Camera · Kheer Gad mouth", value: "No image", age: "19 min", battery: "24%", signal: "Lost", health: "Offline" },
];

export const actionItems = [
  { id: 1, tone: "urgent", label: "ACT NOW", title: "Move Dharali off the Kheer Gad fan", detail: "Issue an operator-approved evacuation advisory; do not wait for the Bhagirathi gauge peak.", owner: "Unassigned" },
  { id: 2, tone: "urgent", label: "ROUTE", title: "Close the Dharali–Harsil low-bank road", detail: "Place a traffic stop and route residents toward Harsil Army Ground.", owner: "District control" },
  { id: 3, tone: "quality", label: "DATA QUALITY", title: "Verify Kheer Gad camera outage", detail: "Dispatch a field check; keep confidence capped while visual confirmation is missing.", owner: "Awaiting field team" },
  { id: 4, tone: "field", label: "SHELTER", title: "Open Harsil high-ground shelter", detail: "Confirm lighting, water, transport, and capacity before public issuance.", owner: "SDRF liaison" },
];

export const replayEvents = [
  ["T+00:00", "Baseline wet catchment", "green", "Soil saturation already elevated; Kheer Gad channel clear."],
  ["T+00:15", "Cloudburst intensity rises", "yellow", "RAIN-KG-01 crosses 30 mm in 15 minutes over the tributary head."],
  ["T+00:30", "Debris-flow likelihood increases", "orange", "Rainfall intensity + saturated soil + steep channel combine into a fast response."],
  ["T+00:42", "Kheer Gad signal accelerates", "orange", "Camera becomes intermittent; model lowers confidence but keeps high consequence."],
  ["T+00:55", "Dharali crosses Red", "red", "Predicted arrival window reaches the alluvial fan in 20–35 minutes."],
  ["T+01:00", "Action window opens", "red", "Move low-bank households now; open Harsil Army Ground; stop road traffic."],
  ["T+01:12", "River gauge still lagging", "orange", "Bhagirathi level has not peaked; waiting for it would lose lead time."],
  ["T+01:30", "Field confirmation requested", "blue", "Operator requests visual check and logs a model advisory for approval."],
  ["T+01:48", "Road closure confirmed", "red", "Gangotri Road low-bank segment marked compromised; alternate movement route retained."],
  ["T+02:10", "Shelter verified", "blue", "Harsil Army Ground open; capacity and transport checks complete."],
  ["T+02:30", "Replay summary", "blue", "Lead time protected by acting on tributary and debris signals before gauge peak."],
] as const;

export const methodSteps = [
  { title: "Detect", text: "Watch 15-minute rainfall intensity over the small Kheer Gad catchment, not only daily totals." },
  { title: "Cross-check", text: "Combine rain, soil saturation, river rise, camera status, and field reports with an explicit confidence cap." },
  { title: "Predict", text: "Estimate debris-flow arrival to the Dharali fan and distinguish tributary arrival from slower Bhagirathi rise." },
  { title: "Prioritize", text: "Rank the location by consequence and safe movement time, not by sensor confidence alone." },
  { title: "Act", text: "Move low-bank households, open high-ground shelter, stop the exposed road, and require human approval before public issuance." },
];

export function calculateFlashFloodNowcast(input: { rain15mm: number; soilSaturation: number; riverRiseM30: number; debrisLikelihood: number; sensorConfidence: number }) {
  // Hazard likelihood and evidence confidence are deliberately separate. Missing or
  // stale sensors must lower confidence, never increase the probability of flooding.
  const intensity = Math.min(input.rain15mm / 50, 1);
  const saturation = Math.min(input.soilSaturation / 100, 1);
  const riverRise = Math.min(input.riverRiseM30 / 0.8, 1);
  const debris = Math.min(Math.max(input.debrisLikelihood, 0), 1);
  const baseLikelihood = intensity * 0.34 + saturation * 0.20 + riverRise * 0.12 + debris * 0.26;
  const compoundTrigger = intensity >= 0.75 && saturation >= 0.80 && debris >= 0.75 ? 0.10 : intensity >= 0.60 && saturation >= 0.70 ? 0.04 : 0;
  const probability = Math.min(0.99, Math.max(0.02, baseLikelihood + compoundTrigger));
  const state: RiskState = probability >= 0.8 ? "RED" : probability >= 0.6 ? "ORANGE" : probability >= 0.4 ? "YELLOW" : "GREEN";
  const evidenceConfidence = Math.max(0.45, Math.min(0.96, input.sensorConfidence * (compoundTrigger > 0 ? 0.96 : 1)));
  return {
    state,
    probability,
    confidence: evidenceConfidence,
    baseLikelihood,
    compoundTrigger,
    factors: [
      { label: "15-minute rainfall intensity", value: intensity, weight: 0.34, source: "RAIN-KG-01" },
      { label: "Catchment soil saturation", value: saturation, weight: 0.20, source: "SOIL-DHR-01" },
      { label: "Bhagirathi rise rate", value: riverRise, weight: 0.12, source: "WL-BHG-02" },
      { label: "Debris-flow likelihood", value: debris, weight: 0.26, source: "Cascade model" },
    ],
    arrivalWindow: probability >= 0.8 ? "20–35 min" : probability >= 0.6 ? "35–60 min" : "1–3 h",
    trigger: `${input.rain15mm} mm / 15m over Kheer Gad + ${input.soilSaturation}% soil saturation`,
    keyUncertainty: input.sensorConfidence < 0.8 ? "Kheer Gad camera offline; likelihood remains high but confidence is capped" : "Sensor agreement is stable; continue watch",
    immediateActions: [
      "Evacuate low-bank Dharali households away from Kheer Gad and Bhagirathi edge",
      "Open Harsil Army Ground and verify transport, lighting, water, and capacity",
      "Stop traffic on the Dharali–Harsil low-bank road and keep Gangotri Road clear for responders",
      "Do not wait for the Bhagirathi gauge peak; tributary debris arrival leads the river signal",
    ],
  };
}

export type SimulationInput = {
  rain15mm: number;
  soilSaturation: number;
  riverRiseM30: number;
  debrisLikelihood: number;
  sensorConfidence: number;
  slopeSusceptibility: number;
  forecastRain6h: number;
};

export function calculateSimulation(input: SimulationInput) {
  const factors = [
    { label: "Rainfall intensity", value: Math.min(input.rain15mm / 50, 1), weight: 0.3 },
    { label: "Soil saturation", value: Math.min(input.soilSaturation / 100, 1), weight: 0.2 },
    { label: "River rise rate", value: Math.min(input.riverRiseM30 / 0.8, 1), weight: 0.15 },
    { label: "Debris-flow likelihood", value: input.debrisLikelihood, weight: 0.15 },
    { label: "Slope susceptibility", value: input.slopeSusceptibility, weight: 0.1 },
    { label: "6h forecast rainfall", value: Math.min(input.forecastRain6h / 80, 1), weight: 0.1 },
  ];
  const probability = Math.min(0.99, Math.max(0.02, factors.reduce((sum, factor) => sum + factor.value * factor.weight, 0)));
  const state: RiskState = probability >= 0.8 ? "RED" : probability >= 0.6 ? "ORANGE" : probability >= 0.4 ? "YELLOW" : "GREEN";
  const confidence = Math.max(0.5, Math.min(0.96, input.sensorConfidence - (input.sensorConfidence < 0.75 ? 0.08 : 0)));
  const leadTimeMinutes = state === "RED" ? 20 : state === "ORANGE" ? 45 : state === "YELLOW" ? 90 : 180;
  return { state, probability, confidence, leadTimeMinutes, factors, dataQuality: Math.round(confidence * 100) };
}

export const flashFloodPrediction = calculateFlashFloodNowcast({
  rain15mm: 42,
  soilSaturation: 91,
  riverRiseM30: 0.64,
  debrisLikelihood: 0.92,
  sensorConfidence: 0.85,
});


export const routeSegments = [
  { id: "R-01", name: "Dharali low-bank approach", status: "CLOSE NOW", tone: "red", reason: "Kheer Gad debris and bank erosion exposure", verified: "14:38 IST", owner: "Traffic control" },
  { id: "R-02", name: "Dharali → Harsil high-ground route", status: "OPEN", tone: "green", reason: "Preferred evacuation movement path", verified: "14:34 IST", owner: "SDRF liaison" },
  { id: "R-03", name: "Harsil → Jhala corridor", status: "CAUTION", tone: "orange", reason: "Rockfall watch above Gangotri Road", verified: "14:28 IST", owner: "PWD patrol" },
  { id: "R-04", name: "Mukhba alternate access", status: "OPEN", tone: "green", reason: "Use only for assisted movement", verified: "14:19 IST", owner: "Village team" },
];

export type DynamicRoute = {
  name: string;
  status: "RECOMMENDED" | "BACKUP" | "REJECTED";
  trafficMinutes: number;
  hazardArrivalMinutes: number;
  evacuationMinutes: number;
  safetyMarginMinutes: number;
  confidence: number;
  reason: string;
  warning?: string;
};

export function calculateDynamicRoutes() {
  const candidates: DynamicRoute[] = [
    { name: "Dharali → Harsil high-ground route", status: "RECOMMENDED", trafficMinutes: 24, hazardArrivalMinutes: 85, evacuationMinutes: 34, safetyMarginMinutes: 51, confidence: 0.86, reason: "Fastest verified high-ground route with sufficient cascade margin" },
    { name: "Mukhba alternate access", status: "BACKUP", trafficMinutes: 34, hazardArrivalMinutes: 110, evacuationMinutes: 44, safetyMarginMinutes: 66, confidence: 0.73, reason: "Backup route remains open for assisted movement", warning: "Use only after village-team confirmation" },
    { name: "Dharali low-bank approach", status: "REJECTED", trafficMinutes: 10, hazardArrivalMinutes: 15, evacuationMinutes: 20, safetyMarginMinutes: -5, confidence: 0.94, reason: "Rejected: debris-flow arrival is earlier than evacuation completion", warning: "CLOSE NOW · do not enter" },
  ];
  return candidates;
}

export const shelterStatus = [
  { name: "Harsil Army Ground", location: "Harsil · high ground", capacity: "180 / 420", status: "READY", tone: "green", checks: "Lighting · water · transport" },
  { name: "Jhala Primary School", location: "Jhala · above road cut", capacity: "60 / 140", status: "STANDBY", tone: "orange", checks: "Needs generator check" },
  { name: "Bagori Community Hall", location: "Bagori · ridge side", capacity: "30 / 90", status: "READY", tone: "green", checks: "Basic supplies" },
];

export const commandSteps = [
  { id: "C1", lead: "Control room", action: "Approve RED advisory for low-bank Dharali households", detail: "Do not wait for Bhagirathi gauge peak; cite Kheer Gad arrival window." },
  { id: "C2", lead: "Traffic control", action: "Stop entry to Dharali low-bank approach", detail: "Keep Gangotri Road clear for responders and assisted evacuation." },
  { id: "C3", lead: "SDRF liaison", action: "Open Harsil Army Ground", detail: "Confirm lighting, water, transport, registration, and capacity." },
  { id: "C4", lead: "Field team", action: "Verify Kheer Gad camera outage and debris front", detail: "Return visual confirmation without sending personnel into the channel." },
  { id: "C5", lead: "Public information", action: "Issue bilingual route and shelter message", detail: "Name the safe route, the shelter, and the action deadline in plain language." },
];
