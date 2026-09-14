import { train } from "@wlearn/xgboost";

const model = await train(
  { task: "classification", objective: "binary:logistic", numRound: 4, max_depth: 2, eta: 0.2 },
  [[0, 0], [0.1, 0.2], [0.9, 0.8], [1, 1]],
  [0, 0, 1, 1],
);
const probabilities = model.predictProba([[0.95, 0.95]]);
if (probabilities.length !== 2 || !Number.isFinite(probabilities[1]) || probabilities[1] < 0 || probabilities[1] > 1) {
  throw new Error(`Invalid probability output: ${probabilities[1]}`);
}
model.dispose();
console.log(`XGBoost smoke test passed: positive probability ${probabilities[1].toFixed(4)}`);
