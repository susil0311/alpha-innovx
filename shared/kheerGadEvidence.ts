export const kheerGadPaperSource = {
  title: "Dharali debris flow on 5 August 2025, Uttarakhand: event reconstruction and geomorphic implications",
  citation: "Kumar et al. (2026), Current Science 130(3), 229–238",
  doi: "10.18520/cs/v130/i3/229-238",
  zenodo: "https://zenodo.org/records/21937860",
};

export const kheerGadHistoricalEvent = {
  eventKey: "DHARALI-KHEERGAD-2025-08-05",
  locationKey: "DHARALI",
  date: "2025-08-05",
  latitude: 31.0407,
  longitude: 78.7972,
  severity: "DEBRIS_FLOW" as const,
  verified: true,
  catchmentAreaKm2: 17,
  source: kheerGadPaperSource.citation,
  sourceUrl: `https://doi.org/${kheerGadPaperSource.doi}`,
  summary: "Historical Kheer Gad debris-flow reconstruction used for model validation and backtesting; this is not a live sensor observation.",
};

export const kheerGadAntecedentRainfall = [
  { windowDays: 3, rainfallMm: 29, source: "FLDAS-Global", resolution: "0.01 degree" },
  { windowDays: 7, rainfallMm: 59, source: "FLDAS-Global", resolution: "0.01 degree" },
  { windowDays: 15, rainfallMm: 94, source: "FLDAS-Global", resolution: "0.01 degree" },
  { windowDays: 30, rainfallMm: 195, source: "FLDAS-Global", resolution: "0.01 degree" },
] as const;

export const kheerGadCatchmentFeatures = [
  { feature: "catchment_area", value: 17, unit: "km2" },
  { feature: "basin_length", value: 10.5, unit: "km" },
  { feature: "total_stream_length", value: 46, unit: "km" },
  { feature: "channel_gradient", value: 260, unit: "m_per_km" },
  { feature: "drainage_density", value: 2.68, unit: "km_per_km2" },
  { feature: "elongation_ratio", value: 1.5, unit: "ratio" },
  { feature: "relief_ratio", value: 0.33, unit: "ratio" },
  { feature: "melton_ruggedness_number", value: 0.8, unit: "ratio" },
  { feature: "glaciated_area", value: 3, unit: "km2" },
  { feature: "debris_flow_pressure", value: 60, unit: "kPa" },
  { feature: "debris_flow_velocity_min", value: 5, unit: "m_per_s" },
  { feature: "debris_flow_velocity_max", value: 10, unit: "m_per_s" },
  { feature: "debris_flow_height_min", value: 5, unit: "m" },
  { feature: "debris_flow_height_max", value: 10, unit: "m" },
  { feature: "debris_flow_spread_area", value: 18, unit: "hectare" },
  { feature: "debris_volume_min", value: 995580, unit: "m3" },
  { feature: "debris_volume_max", value: 1285260, unit: "m3" },
  { feature: "built_up_units_2011", value: 89, unit: "count" },
  { feature: "built_up_units_2025", value: 160, unit: "count" },
] as const;
