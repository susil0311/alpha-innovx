# Sahaayak Source Batch 04

This batch adds the **Dharali Command Pack**, connecting the flash-flood nowcast to an executable response workflow.

The new `/command-pack` route includes the current RED nowcast and confidence, the Kheer Gad trigger, preferred Dharali-to-Harsil movement, route closure and alternate-route statuses, shelter capacity and readiness checks, responder ownership, and a five-step command checklist. Operators can mark steps complete, print the briefing, and prepare a shareable operator brief. Public issuance remains guarded by the existing human-approval workflow.

The control-room sidebar now links directly to the Command Pack. New seeded operating data covers Dharali low-bank approach, Dharali–Harsil high-ground route, Harsil-to-Jhala corridor, Mukhba alternate access, Harsil Army Ground, Jhala Primary School, and Bagori Community Hall.

Verification for this batch: `pnpm run check`, `pnpm test`, and `pnpm run build` all pass. The build retains only the existing Vite chunk-size advisory.
