# Boston food safety — city briefing, 2006–2026 YTD

Written briefing from cleaned Analyze Boston Food Establishment Inspections and Active Food Establishment Licenses. Interactive charts: [live page](https://dharit13.github.io/boston_public_data_analysis/food-safety/). Reproducible from `analyze_food.py`.

**Headline:** Inspections rose versus 2019. The fail share rose with them. Collapsed food inspections were **12,414** in 2025 against **10,116** in 2019 (**+22.7%**). Fail share was **40.3%** against **37.0%**. HE_Pass is **49.9%** — not a majority. **Do not add 3,347 licenses into 12,414.** **2020 is COVID.** **2026 is not a full year.**

---

## 2025 at a glance

| | |
| --- | ---: |
| Collapsed inspections | 12,414 (34.0 a day) |
| vs 2019 | +22.7% (10,116 → 12,414) |
| Fail share | 40.3% (5,003 of 12,414) |
| HE_Pass / HE_Fail / HE_FailExt | 6,191 / 3,867 / 1,134 |
| Starred violation rows | * 24,219 · ** 11,929 · *** 4,498 |
| Peak result hour | 4 p.m. (2,667) · Wednesday 2,682 |
| 2026 YTD (through 28 Aug) | 8,894 (37.1 a day) |
| Active licenses (separate file) | 3,347 |

---

## More inspections than 2019. A higher fail share.

Use **2019** as the last normal pre-COVID year, not 2020. Collapsed inspections were 10,116 in 2019 (37.0% fail) and 12,414 in 2025 (40.3% fail). Fail is the exact result codes `HE_Fail`, `HE_FailExt`, `Fail`, `Failed`, and `HE_FAILNOR`. `HE_Filed` (830 in 2025) is **not** a fail.

Inspections fell to **7,932** in 2020. Compare 2025 to 2019, then show 2020 as the shock.

**2022** is **19,648** inspections in the file (almost double 2019) and the fail share fell to **24.9%**. The file records that jump. This briefing does not invent a program change to explain it.

2026 is not a full year. Results in this dump run through **28 August 2026** (8,894 YTD, 37.1 a day). Do not annualize that figure.

The public dump is **one row per violation** (900,574 raw; 894,176 kept). This briefing collapses to **217,847** inspections (one per license number and result timestamp).

---

## HE_Pass is 49.9%. Fail is 40.3%.

HE_Pass is **6,191 of 12,414 (49.9%)** — not a majority. HE_Fail 3,867 + HE_FailExt 1,134 + HE_FAILNOR 2 = **5,003** fails.

Star levels are **violation rows**, not inspections: * **24,219** · ** **11,929** · *** **4,498** (40,646 starred rows in 2025).

Top 2025 `violdesc` rows: Nonfood Contact Surfaces **1,963** · Controlling Pests **1,873** · Floors Walls and Ceilings-Cleanability **1,519**.

Active licenses are a **snapshot of 3,347** licensed places (FS Eating & Drinking **1,766** · FT take-out **1,581**). Do not count a license as an inspection.

---

## When results were recorded

`resultdttm` hour is the result timestamp, **not** kitchen hours. Do not read 4 p.m. as a foodborne-illness peak.

2025 peak is **4 p.m. (2,667)**. Overnight hours are near zero. **Wednesday** is heaviest (**2,682**). **Sunday** is lightest (**29**); Saturday is **66**. ISD Health’s public office is Monday–Friday. Food inspectors can still visit restaurants when they are open — those 95 weekend stamps stay on the chart as recorded field results. October is the peak month (**1,316**); June is lightest (**890**).

---

## Place is ZIP, not a neighborhood field

Neighborhood is ZIP via the Fire `ZIP_NEIGHBORHOOD` map. **Dorchester is 02122 + 02124 + 02125 (1,282)**. East Boston **02128** is the single-ZIP volume leader (**1,025**) at **30.2%** fail. **02125 Dorchester** is **517** inspections and **52.2%** fail. Volume and fail rate are not the same ranking.

| ZIP (n ≥ 80) | Neighborhood | 2025 fail share |
| --- | --- | ---: |
| 02125 | Dorchester | 52.2% |
| 02118 | South End | 50.4% |
| 02130 | Jamaica Plain | 50.3% |
| 02120 | Mission Hill / Roxbury | 50.2% |

---

## What these files are not

Food inspections and active licenses are **not** RentSmart, **not** building permits, and **not** 311. One dump row is a violation. A license is not an inspection. 2026 is not a full year.

---

## Places — not 2025-only

Always-pass, repeat offenders, and places to avoid are computed **inside each window**: complete years **2019, 2024, 2025**, plus **2026 YTD through 28 August**. Always-pass needs **at least 3 inspections** in that window and **zero** fail codes (`HE_Filed` is not a fail). Repeat offenders failed **at least two visits** in that window. Places to avoid are the worst of those within-window repeats.

A separate list is places that failed in **multiple complete years 2012–2025** (2026 excluded). That is not the same as two fails inside one year.

| Window | Always-pass | Repeat offenders |
| --- | ---: | ---: |
| 2019 | 60 | 1,010 |
| 2024 | 328 | 1,296 |
| 2025 | 92 | 1,349 |
| 2026 YTD | 49 | 999 |

2025 worst within-year repeat: **Dans Mini Dogs** (23 fails / 29 visits). Across complete years: **Go Fresh 365** (failed in all 14 years).

Categories: City `licensecat` first (FS Food and drinks · FT Take-out · RF Retail food · MFW Mobile food). Name overlays with word-boundary matching add Ice cream, Cafe, School, Hotel, Hospital, and Cultural / attraction. The City has no cafe or ice-cream license code. `ice` does not match ICE Auto Services.
