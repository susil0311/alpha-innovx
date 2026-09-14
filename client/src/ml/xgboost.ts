import { train } from "@wlearn/xgboost";
import type { SimulationInput } from "../data";

const FEATURE_ORDER: (keyof SimulationInput)[] = [
  "rain15mm",
  "soilSaturation",
  "riverRiseM30",
  "debrisLikelihood",
  "sensorConfidence",
  "slopeSusceptibility",
  "forecastRain6h",
];

function toFeatures(input: SimulationInput): number[] {
  return [
    input.rain15mm / 80,
    input.soilSaturation / 100,
    input.riverRiseM30,
    input.debrisLikelihood,
    input.sensorConfidence,
    input.slopeSusceptibility,
    input.forecastRain6h / 160,
  ];
}

// Small, deterministic calibration set for the pilot's feature contract. In production,
// replace this with labelled historical events from the live-data store.
const TRAINING_ROWS: number[][] = [
  [0.08, 0.28, 0.08, 0.08, 0.95, 0.22, 0.10],
  [0.16, 0.40, 0.15, 0.16, 0.90, 0.32, 0.20],
  [0.24, 0.52, 0.22, 0.25, 0.88, 0.42, 0.28],
  [0.31, 0.60, 0.30, 0.34, 0.84, 0.48, 0.36],
  [0.38, 0.68, 0.38, 0.42, 0.80, 0.56, 0.44],
  [0.45, 0.74, 0.45, 0.50, 0.78, 0.62, 0.52],
  [0.52, 0.80, 0.52, 0.58, 0.74, 0.68, 0.60],
  [0.60, 0.84, 0.60, 0.66, 0.70, 0.74, 0.68],
  [0.68, 0.88, 0.68, 0.74, 0.66, 0.80, 0.76],
  [0.76, 0.92, 0.76, 0.82, 0.62, 0.86, 0.84],
  [0.86, 0.96, 0.84, 0.90, 0.56, 0.92, 0.92],
  [0.96, 0.99, 0.94, 0.98, 0.48, 0.98, 1.00],
  [0.12, 0.82, 0.20, 0.74, 0.86, 0.80, 0.34],
  [0.72, 0.44, 0.28, 0.78, 0.82, 0.38, 0.46],
  [0.26, 0.90, 0.18, 0.18, 0.72, 0.24, 0.70],
  [0.58, 0.58, 0.72, 0.36, 0.64, 0.70, 0.54],
];

const TRAINING_LABELS = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];

let modelPromise: Promise<any> | undefined;

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const model = await train(
        {
          task: "classification",
          objective: "binary:logistic",
          eval_metric: "logloss",
          eta: 0.16,
          max_depth: 3,
          min_child_weight: 1,
          subsample: 1,
          colsample_bytree: 1,
          numRound: 28,
          seed: 7,
        },
        TRAINING_ROWS,
        TRAINING_LABELS,
      );
      return model;
    })();
  }
  return modelPromise;
}

export async function calculateXGBoostProbability(input: SimulationInput): Promise<number> {
  const model = await getModel();
  const probabilities = model.predictProba([toFeatures(input)]);
  return Math.min(0.99, Math.max(0.02, Number(probabilities[1])));
}

export const xgboostFeatureLabels = FEATURE_ORDER.map(key =>
  key === "rain15mm" ? "Rainfall intensity" :
  key === "soilSaturation" ? "Soil saturation" :
  key === "riverRiseM30" ? "River rise rate" :
  key === "debrisLikelihood" ? "Debris-flow likelihood" :
  key === "sensorConfidence" ? "Sensor confidence" :
  key === "slopeSusceptibility" ? "Slope susceptibility" : "6h forecast rainfall"
);

export const xgboostModelDescription = "XGBoost gradient-boosted trees · 7 flood features · WASM inference";
