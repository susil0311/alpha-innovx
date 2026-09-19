"""Join paper-derived static evidence to real feature windows.

This script adds catchment and antecedent-rainfall context but never creates a
training label. A separate verified event-label pipeline must provide
flashFloodWithin30m. The historical paper evidence is therefore usable as
context/features, not as a substitute for a multi-event training set.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import pandas as pd

CATCHMENT_MAP = {
    "catchment_area": "catchmentAreaKm2",
    "channel_gradient": "channelGradientMPerKm",
    "drainage_density": "drainageDensityKmPerKm2",
    "melton_ruggedness_number": "meltonRuggednessNumber",
    "glaciated_area": "glaciatedAreaKm2",
    "debris_flow_spread_area": "historicalDebrisSpreadAreaHa",
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--windows", required=True, help="Exported feature-window CSV with locationKey")
    parser.add_argument("--catchment-features", required=True, help="data/kheer-gad-catchment-features.csv")
    parser.add_argument("--antecedent-rainfall", required=True, help="data/kheer-gad-2025-antecedent-rainfall.csv")
    parser.add_argument("--output", required=True, help="Output enriched feature-window CSV")
    parser.add_argument("--location-key", default="DHARALI")
    args = parser.parse_args()

    windows = pd.read_csv(args.windows)
    if "locationKey" not in windows.columns:
        raise SystemExit("The feature-window CSV must contain locationKey")
    if args.location_key not in set(windows["locationKey"].astype(str)):
        raise SystemExit(f"No rows for locationKey={args.location_key}; refusing an unverified spatial join")

    catchment = pd.read_csv(args.catchment_features)
    selected = catchment[catchment["feature"].isin(CATCHMENT_MAP)].copy()
    if selected.empty:
        raise SystemExit("No recognized catchment features were found")
    static = {CATCHMENT_MAP[row.feature]: float(row.value) for row in selected.itertuples()}

    rainfall = pd.read_csv(args.antecedent_rainfall)
    rainfall = rainfall[rainfall["locationKey"].astype(str) == args.location_key]
    for row in rainfall.itertuples():
        static[f"antecedentRainfall{int(row.windowDays)}dMm"] = float(row.rainfallMm)

    for column, value in static.items():
        windows[column] = windows["locationKey"].astype(str).map(lambda key: value if key == args.location_key else float("nan"))
    windows["historicalEvidenceSource"] = windows["locationKey"].map(lambda key: "Kumar et al. 2026; DOI 10.18520/cs/v130/i3/229-238" if str(key) == args.location_key else "")
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    windows.to_csv(args.output, index=False)
    print(f"Wrote {len(windows)} enriched rows with {len(static)} paper-derived features to {args.output}")


if __name__ == "__main__":
    main()
