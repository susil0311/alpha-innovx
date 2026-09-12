# Sahaayak Source Batch 08

This batch expands the real Dharali weather layer into an operational forecast view.

The Open-Meteo forecast adapter now requests current weather, hourly temperature, rainfall, precipitation probability, cloud cover, wind, and soil-moisture model variables. It returns the next 12 hours, a next-six-hour precipitation total, peak hourly rain, peak precipitation probability, and a clearly named weather-model watch: `NO MODEL RAIN WATCH`, `HEAVY RAIN WATCH`, or `SEVERE RAIN WATCH`.

The Command Pack now shows the hourly forecast strip, weather-watch summary, precipitation totals, model probability, freshness time, and action guidance. The Control Room also shows a live weather snapshot beside the scenario nowcast. Guidance explicitly states that weather-model watch output is not a flash-flood probability and directs operators to confirm local gauges, Kheer Gad field status, and approved agency signals.

The RED forecast remains labelled `Scenario` because the application still lacks verified Bhagirathi telemetry, Kheer Gad camera ingestion, and local Dharali rain-gauge streams. No synthetic weather values are substituted when the external feed is unavailable.

Verification: `pnpm run check`, `pnpm test`, `pnpm run build`, a live Open-Meteo forecast request, and source-marker verification all passed.
