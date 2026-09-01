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
| Fail visits that are major (** or ***) | 4,035 (80.7%) |
| Minor-only fail visits (* only) | 889 (17.8%) |
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

**Most fails are major. Some are walls and wiping cloths.** Our split uses `viol_level` on the collapsed visit — not an official ISD “major failure” label, and not the letter grade on the door. Analyze Boston does not publish a star dictionary. In the dump, `*` lines up with Food Code Core `(C)` / Boston’s 2-point non-critical band (walls, wiping cloths); `**` with Priority Foundation `(Pf)` / 7-point critical (pests, date marking); `***` with Priority `(P)` / 10-point foodborne-critical (hot/cold holding). A fail visit is **major** if it has at least one `**` or `***`; **minor-only** if starred violations are only `*`; mixed visits count as major (worst-on-visit).

In **2025**, **4,035 of 5,003** fails (80.7%) are major. **889** (17.8%) are minor-only. **1,901** had at least one `***`. Closures are a separate operational bucket: HE_VolClos **108**, HE_TSOP **17**, HE_Closure **1** (126 visits) — not fail codes. `HE_Filed` is still not a fail.

Top major reasons on 2025 fail visits: Controlling Pests (Pf) **1,121** · equipment food-contact (Pf) **674** · hot/cold holding (P) **626** · PIC duties (Pf) **543** · handwashing sink (Pf) **523**. Top minor reasons: Nonfood Contact Surfaces **1,058** · floors/walls/ceilings **879** · cleaning ventilation **682**. Wiping cloths are minor (462 visits). 2026 YTD (through 28 Aug) is **3,193 of 3,925** major (81.4%) and **695** minor-only.

Pharmacy (86.8% of 68 fails) and ice cream (83.8% of 37) match the citywide mix. Cultural / attraction is 66.7% of **12** fails — too small to treat as a different regime. Mobile food is the outlier at 58.0% major (more minor-only and unstarred).

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

## Places — same clock for both lists

Always-pass and be-cautious share the year pill: complete years **2019, 2024, 2025**, plus **2026 YTD through 28 August**. Always-pass needs **at least 3 real visits** in that window and **zero** fail codes (`HE_Filed` is not a fail; `HE_NotReq` is not an inspection). Be cautious needs **at least 2 major fails** (`**` / `***`) in that **same** window. A license number cannot appear on both lists in the same view. **Hospital, School, Cultural / attraction, and Hotel** kitchens are cafeteria/kitchen inspection records, not ranking pills.

| Window | Always-pass | Be cautious |
| --- | ---: | ---: |
| 2019 | 36 | 396 |
| 2024 | 40 | 848 |
| 2025 | 79 | 985 |
| 2026 YTD | 48 | 814 |

2025 always-pass includes **Dunkin Donuts**, **Blue Ribbon Barbecue**, and **CVS/Pharmacy No. 10517**. 2025 be-cautious is led by **Dans Mini Dogs**. Mass General Hospital Cafe at 55 Fruit St is not on either ranking list.

Display names strip trailing Inc/LLC/Corp/Ltd, not Company in Atlantic Fish Company. `@` is a location only after a street/hospital/hotel/college. Ice cream, Pharmacy, and Grocery are **not** City license types. Ice cream: word-boundary matching plus public scoop-shop pages joined on brand key (**J.P. Licks**, **Ben & Jerry’s**). Pharmacy: pharmacy/drugstore and chains (CVS, Walgreens, Rite Aid) on the normalized name — **CVS/Pharmacy No. 10517** (77 Seaport) and **No. 1900** (218 Hanover) are Pharmacy, not generic Retail food. Grocery: grocery/supermarket in the name plus sourced supermarket roundups joined on brand key (Trader Joe’s, Whole Foods, Stop & Shop, Star Market). 7-Eleven is not grocery. Leftover RF is other packaged retail. `1 CITYWIDE ST` is ISD’s mobile-license placeholder, shown as **Mobile (citywide) · License …**.

Categories: City `licensecat` first (FS Food and drinks · FT Take-out · RF Retail food · MFW Mobile food). Name overlays add Ice cream, Cafe, School, Hotel, Hospital, Cultural / attraction, Pharmacy, and Grocery before those codes — overlays still count inspections, but ranking pills are ice cream, cafe, pharmacy, grocery, food and drinks, take-out, retail food, and mobile food. The City has no cafe, ice-cream, pharmacy, or grocery license code. `ice` does not match ICE Auto Services. RF remainder after overlays is other packaged retail.
