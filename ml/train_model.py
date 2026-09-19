"""Train and evaluate a calibrated flash-flood classifier from exported feature windows.

This script intentionally refuses to invent data. The input CSV must contain verified
labels and the feature columns listed in REQUIRED_FEATURES. Split is chronological to
avoid leaking future information into training.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score, brier_score_loss, classification_report, roc_auc_score

REQUIRED_FEATURES = [
    "rain15m", "rain15mMax", "soilSaturation", "riverRiseM30", "debrisLikelihood",
    "goodObservationCount", "staleObservationCount", "invalidObservationCount",
]
OPTIONAL_EVIDENCE_FEATURES = [
    "catchmentAreaKm2", "channelGradientMPerKm", "drainageDensityKmPerKm2",
    "meltonRuggednessNumber", "glaciatedAreaKm2", "historicalDebrisSpreadAreaHa",
    "antecedentRainfall3dMm", "antecedentRainfall7dMm", "antecedentRainfall15dMm",
    "antecedentRainfall30dMm",
]
TARGET = "flashFloodWithin30m"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="CSV exported from verified feature windows")
    parser.add_argument("--output-dir", default="ml/artifacts")
    parser.add_argument("--test-fraction", type=float, default=0.2)
    args = parser.parse_args()

    frame = pd.read_csv(args.input, parse_dates=["windowEnd"])
    missing = [column for column in REQUIRED_FEATURES + [TARGET, "windowEnd"] if column not in frame.columns]
    if missing:
        raise SystemExit(f"Missing required columns: {', '.join(missing)}")
    if len(frame) < 30 or frame[TARGET].nunique() < 2:
        raise SystemExit("At least 30 labeled windows and both positive and negative classes are required")
    evidence_features = [column for column in OPTIONAL_EVIDENCE_FEATURES if column in frame.columns]
    features = REQUIRED_FEATURES + evidence_features
    frame = frame.sort_values("windowEnd").dropna(subset=features + [TARGET])
    split = max(1, int(len(frame) * (1 - args.test_fraction)))
    train, test = frame.iloc[:split], frame.iloc[split:]
    if train[TARGET].nunique() < 2 or test[TARGET].nunique() < 2:
        raise SystemExit("Chronological split must contain both classes in train and test")

    estimator = HistGradientBoostingClassifier(max_iter=200, learning_rate=0.05, max_leaf_nodes=15, random_state=42)
    model = CalibratedClassifierCV(estimator, method="isotonic", cv=3)
    model.fit(train[features], train[TARGET].astype(int))
    probability = model.predict_proba(test[features])[:, 1]
    prediction = (probability >= 0.5).astype(int)
    metrics = {
        "rows": len(frame),
        "trainRows": len(train),
        "testRows": len(test),
        "positiveRate": float(frame[TARGET].mean()),
        "rocAuc": float(roc_auc_score(test[TARGET], probability)),
        "averagePrecision": float(average_precision_score(test[TARGET], probability)),
        "brierScore": float(brier_score_loss(test[TARGET], probability)),
        "classificationReport": classification_report(test[TARGET], prediction, output_dict=True),
        "features": features,
        "evidenceFeatures": evidence_features,
        "target": TARGET,
        "split": "chronological",
    }
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output / "flash-flood-calibrated.joblib")
    (output / "metrics.json").write_text(json.dumps(metrics, indent=2, default=float))
    print(json.dumps(metrics, indent=2, default=float))


if __name__ == "__main__":
    main()
