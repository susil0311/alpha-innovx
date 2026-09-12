# Sahaayak Source Batch 07

This batch implements real user-to-user assignment selection and begins the transition from simulated operational inputs to transparent real data.

Operational resources now store an optional `assignedUserId`. The migration is `drizzle/0003_clear_meltdown.sql` and was applied successfully. Protected tRPC exposes eligible assignment candidates from the user table, validates that selected users hold an operational role, resolves the owner display name, and records assignment changes in the audit trail. The Command Pack now provides role-aware operator selectors for route and shelter ownership instead of assigning to the current operator by default.

The server adds a real-data adapter for Dharali at approximately 30.7333° N, 78.4399° E. Current and hourly weather values are fetched from Open-Meteo, while an Open-Meteo archive query provides daily precipitation for 1–10 August 2025. The Command Pack displays current weather evidence, the historical rainfall window, source links, fetch state, and explicit limitations. It also displays cited historical Dharali event records from a peer-reviewed ScienceDirect case study and an ISRO-imagery-based Times of India report.

The seeded RED risk output is now explicitly labelled **Scenario**. It is not silently replaced with a full live flash-flood probability because live Bhagirathi gauge, Kheer Gad camera, and verified Dharali ground-rain-gauge streams are not connected. The UI shows live weather evidence separately and never substitutes fabricated values when a source is unavailable.

Verification: `pnpm run check`, `pnpm test`, `pnpm run build`, Open-Meteo forecast request, Open-Meteo historical archive request, migration application, and source-marker verification all passed.
