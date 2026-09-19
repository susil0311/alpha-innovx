# Flash-flood model pipeline

This directory contains the training scaffold for the first supervised model. It does **not** generate synthetic training data. Training is allowed only after verified sensor windows and verified historical event labels are exported to CSV.

## Recommended first model

`train_model.py` uses scikit-learn's `HistGradientBoostingClassifier`, wrapped with isotonic probability calibration. The first model is intentionally tabular and interpretable. It should remain behind the deterministic safety gate in `shared/alertPolicy.ts`.

## Input contract

The CSV must contain the following columns:

- `windowEnd`: UTC timestamp of the feature window end
- `rain15m`
- `rain15mMax`
- `soilSaturation`
- `riverRiseM30`
- `debrisLikelihood`
- `goodObservationCount`
- `staleObservationCount`
- `invalidObservationCount`
- `flashFloodWithin30m`: verified binary label, 0 or 1

Rows must be generated from real observations using the shared feature-window utility. The event label must come from a verified field report, official bulletin, camera review, or district incident record. Never label a row from the model's own prediction.

## Training and evaluation

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r ml/requirements.txt
python ml/train_model.py --input exports/dharali_feature_windows.csv --output-dir ml/artifacts
```

The script uses a chronological split rather than a random split to prevent future information leakage. It writes a calibrated model and `metrics.json` containing ROC AUC, average precision, Brier score, and a classification report.

Before operational use, add walk-forward validation, event-level recall, false-alarm rate, warning lead time, calibration plots, and performance by sensor outage condition. Do not promote a model based on accuracy alone.
