# Sahaayak Source Batch 03

This batch re-centres the Sahaayak prototype on the **Dharali–Harsil corridor in Uttarkashi, Uttarakhand** and upgrades the operator experience for rapid flash-flood decisions.

## Geographic operating picture

The seeded map now represents Dharali, Harsil, Jhala, Bagori, Mukhba, and Sukki around the Bhagirathi River and Kheer Gad tributary system. The map surface includes a Dharali coordinate anchor, named corridor assets, the Kheer Gad alluvial-fan exposure, the Gangotri Road low-bank segment, and high-ground shelter routing. It is intentionally labelled as a schematic operational corridor rather than a navigational GIS map until live GIS data is connected.

## Prediction improvements

The application now exposes a consequence-first flash-flood nowcast. The model combines 15-minute rainfall intensity, soil saturation, Bhagirathi river rise, debris-flow likelihood, and sensor confidence. It distinguishes a fast Kheer Gad debris-flow arrival from a slower Bhagirathi gauge response, caps confidence when the Kheer Gad camera is offline, and produces a RED/ORANGE/YELLOW/GREEN state with an estimated arrival window.

The current seeded scenario evaluates to a RED nowcast for Dharali: 42 mm in 15 minutes over Kheer Gad, 91% soil saturation, 0.64 m river rise over 30 minutes, 0.92 debris likelihood, and an estimated 20–35 minute arrival window.

## Action workflow

The new action sequence is explicit: evacuate low-bank Dharali households away from Kheer Gad and the Bhagirathi edge; open and verify Harsil Army Ground; stop traffic on the exposed Dharali–Harsil low-bank road; keep the Gangotri Road clear for responders; and do not wait for the Bhagirathi gauge peak before acting. Public issuance remains subject to authorized human approval.

## Verification

The source passes `pnpm run check`, `pnpm test`, and `pnpm run build`. The build emits only the existing Vite chunk-size advisory. Source batch 03 includes this notes file and all preceding authenticated persistence work.
