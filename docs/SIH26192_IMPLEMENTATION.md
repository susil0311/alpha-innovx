# SIH26192 Implementation Status and Deployment Plan

## Executive conclusion

Flood Nexus now contains the software foundation required for a multi-source flash-flood early-warning system. The repository includes sensor ingestion, observation quality control, rolling feature generation, verified event labeling, prediction persistence, alert-policy evaluation, alert-decision persistence, and a reproducible supervised-learning scaffold.

The system is not yet an operational public-warning service because real sensor credentials, field hardware, official data permissions, historical event labels, and alert-delivery providers are external dependencies. The code is designed to accept those inputs without replacing them with simulated data.

## Completed implementation

The prediction layer separates **hazard likelihood** from **evidence confidence**. Invalid or stale readings reduce trust in a prediction and do not increase the hazard score. The alert engine applies a physical safety gate, independent-signal agreement, sensor-health checks, and human approval requirements before recommending responder or public alerts.

The data pipeline validates ranges and units for rainfall, river rise, soil saturation, and debris likelihood. It produces rolling feature windows with latest values, peak rainfall, source provenance, and counts of good, stale, and invalid observations. These windows can be matched to verified flood-event labels without leaking future observations into the feature set.

The database now supports sensor observations, flood predictions, verified flood events, and persisted alert decisions. The backend exposes protected APIs for ingestion, event labeling, prediction history, alert evaluation, and alert-decision recording.

The `ml/` directory contains a scikit-learn training scaffold. It requires a real labeled CSV, uses a chronological split, calibrates probabilities, and reports ROC AUC, average precision, Brier score, and a classification report. It refuses to train when labels are missing, classes are absent, or the dataset is too small.

## Data onboarding contract

Every observation should be normalized to the following logical fields:

| Field | Meaning |
|---|---|
| `sensorKey` | Stable device or source identifier |
| `metric` | `rain_15m`, `river_rise_30m`, `soil_saturation`, or `debris_likelihood` |
| `value` | Numeric reading in the declared unit |
| `unit` | Measurement unit, such as `mm`, `m`, `%`, or `probability` |
| `observedAt` | Time at which the measurement was taken |
| `receivedAt` | Time at which Flood Nexus received the measurement |
| `quality` | `GOOD`, `STALE`, or `INVALID` |
| `source` | IMD, CWC, NWIC, IOT, NASA_GPM, BHUVAN, or FIELD_REPORT |

The ingestion endpoint validates the observation before persistence. It records the quality decision and the validation reasons in metadata. This permits model evaluation under sensor outages instead of silently treating missing data as normal.

## Historical labels

A training label must be linked to a verified event. Suitable verification sources include an official bulletin, a reviewed camera record, a verified field report, a district incident record, or a satellite-derived flood/debris map. A model prediction must never be used to create its own label.

Each event should contain a stable event key, location key, start time, end time when available, severity, verification source, and notes. The training pipeline uses these events to create labels such as `flashFloodWithin30m`.

## Model promotion rules

The deterministic safety model remains active as a fallback and safety layer. A supervised model should not be promoted to operational use until it has been evaluated with chronological or walk-forward validation and has documented:

- Severe-event recall.
- False-alarm rate.
- Average warning lead time.
- Brier score and calibration.
- Missed-event count.
- Performance during stale or missing sensor conditions.
- Route-failure and exposed-location performance.

Accuracy alone is not a sufficient promotion criterion for a disaster-warning model.

## External work still required

The implementation cannot create the physical evidence needed for validation. The deployment team must obtain access to official rainfall and hydrological feeds, install or commission local rain and water-level sensors, establish a sensor gateway, collect field-confirmed events, and configure alert delivery. The recommended official starting points are the India Meteorological Department API platform [1], the Central Water Commission hydrological observation and flood-forecasting network [2], and the National Water Data Portal [3]. NASA GPM can provide regional precipitation context and historical coverage, but its approximately 10-kilometre grid and 30-minute product resolution are not a substitute for a local catchment gauge [4].

## Verification commands

```bash
pnpm check
pnpm test -- --run
pnpm build
```

To train after real labeled data is available:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r ml/requirements.txt
python ml/train_model.py --input exports/dharali_feature_windows.csv --output-dir ml/artifacts
```

## References

[1]: https://api.imd.gov.in/ "India Meteorological Department API Management Platform"
[2]: https://www.cwc.gov.in/en/flood-forecasting-hydrological-observation "Central Water Commission Flood Forecasting and Hydrological Observation"
[3]: https://nwdp.nwic.gov.in/en/ "National Water Data Portal"
[4]: https://gpm.nasa.gov/data "NASA Global Precipitation Measurement Data"
