# Dharali Geography References

The source batch uses these external references for the seeded Dharali–Harsil corridor framing:

- Dharali location reference: https://www.findlatitudeandlongitude.com/l/Dharali+Harsil+Uttarkashi+IN/843978/ — approximate listed coordinates 30.7333° N, 78.4399° E.
- Harsil overview and nearby place ordering: https://en.wikipedia.org/wiki/Harsil — lists Harsil, Bagori, Dharali, Jhala, Jaspur, and Purali in the valley context.
- Bhagirathi river context: https://en.wikipedia.org/wiki/Bhagirathi_River — describes the river course through the Uttarkashi region.
- Kheer Gad / Dharali flood-risk context: https://india.mongabay.com/2025/08/another-flash-flood-in-the-himalayas-reignites-debate-on-development/ — reports the August 2025 Dharali flash flood involving the Kheer Gad tributary.
- Kheer Gad alluvial-fan context: https://www.researchgate.net/figure/Location-map-of-the-Bhagirathi-river-valley-Background-is-presented-by-SRTM3-hill-shade_fig1_319327833 — describes Dharali along the Bhagirathi near the glacier-fed Khir/Kheer Gad system.

The application labels its current map as a **schematic operational corridor**, not a navigational GIS map. Live GIS layers, verified road geometry, and agency-confirmed shelter coordinates should replace the seeded geometry before operational use.


## Live and archive data references

The Command Pack now queries the Open-Meteo coordinate forecast endpoint for current and hourly weather-model values at the Dharali coordinate: https://open-meteo.com/en/docs. It also queries the Open-Meteo historical archive for 1–10 August 2025 daily precipitation: https://open-meteo.com/en/docs/historical-weather-api. The UI labels these values as model data and never presents them as local station observations.

The verified historical event wording is grounded in the ScienceDirect case study, which describes the 5 August 2025 Kheer Ganga/Gad debris flow at the confluence with the Bhagirathi and its geomorphic impact: https://www.sciencedirect.com/science/article/pii/S2666592125001003. The post-event channel and fan changes are cross-checked against the Times of India report based on ISRO imagery: https://timesofindia.indiatimes.com/india/flash-flood-changes-bhagirathi-course-river-returns-to-old-path/articleshow/123224789.cms.
