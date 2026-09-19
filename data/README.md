# Kheer Gad / Dharali historical data extracted from Kumar et al. (2026)

These files were derived only from values explicitly reported in the supplied paper:

> Kumar, V. et al. (2026). *Dharali debris flow on 5 August 2025, Uttarakhand: event reconstruction and geomorphic implications*. Current Science, 130(3), 229–238. DOI: [10.18520/cs/v130/i3/229-238](https://doi.org/10.18520/cs/v130/i3/229-238).

The files contain a verified historical event label, antecedent rainfall-window summaries, and static catchment/debris-flow reconstruction features. They are suitable for backtesting, validation, feature engineering, and historical-event display.

The paper reports that daily rainfall data for 2000–2025 came from the FLDAS-Global model at 0.01° resolution. The full daily rainfall table is not included in the supplied PDF. The four rainfall rows in this directory are only the reported antecedent totals: 29 mm over 3 days, 59 mm over 7 days, 94 mm over 15 days, and approximately 195 mm over 30 days. They must not be treated as a complete daily time series.

The paper’s study-area coordinates are recorded as approximately 31.0407°N, 78.7972°E. Flood Nexus currently has a separate Dharali coordinate in its live-weather module; this discrepancy must be reviewed before using the historical label for spatial joins.

The paper cites supplementary figures and tables. The complete underlying Zenodo supplementary package is associated with record [21937860](https://zenodo.org/records/21937860), but the record files were not downloaded automatically because Zenodo returned a gateway timeout during retrieval.

License and attribution should follow the paper and its supplementary record. The related Zenodo record is identified as CC BY 4.0 in its metadata.
