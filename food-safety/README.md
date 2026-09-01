# Boston food safety (inspections + active licenses), 2006–2026 YTD

Cleaned Analyze Boston Food Establishment Inspections and Active Food Establishment Licenses. **These are two files — do not count a license row as an inspection.** The inspection dump is **one row per violation**; this briefing collapses to one inspection per license number and result timestamp. 2020 is COVID — not a baseline. **2026 is not a full year** (results through 28 August). Fail is an **exact** result code (`HE_Fail`, `HE_FailExt`, `Fail`, `Failed`, `HE_FAILNOR`). `HE_Filed` is not a fail.

Headline: inspections **rose versus 2019**. The fail share **rose with them**. 2025 inspections **12,414** vs **10,116** in 2019 (**+22.7%**). Fail share **40.3%** vs **37.0%**. HE_Pass is **49.9%** — not a majority. Active licenses are **3,347**.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/food-safety/](https://dharit13.github.io/boston_public_data_analysis/food-safety/)

**Written summary:** [boston-food-safety-summary.md](boston-food-safety-summary.md)

## 2025 headline

| | |
| --- | ---: |
| Collapsed inspections | 12,414 (34.0 a day) |
| vs 2019 inspections | +22.7% (10,116 → 12,414) |
| Fail share | 40.3% (5,003 of 12,414) |
| HE_Pass | 6,191 (49.9%) |
| Peak result hour | 4 p.m. (2,667) · Wednesday 2,682 |
| 2026 YTD (through 28 Aug) | 8,894 (37.1 a day) |
| Active licenses (separate file) | 3,347 |

Do **not** add 12,414 inspections + 3,347 licenses. Neighborhood on the inspection chart is ZIP via the Fire ZIP map — Dorchester is 02122+02124+02125. Volume leader East Boston 02128 is **30.2%** fail; 02125 Dorchester is **52.2%**.

## What’s on the live page

1. **Summary** — six findings
2. **Overview** — inspection vs fail-share series, result mix, stars
3. **Department** — result clock, ZIP neighborhoods, licenses
4. **City / Mayor** — policy asks
5. **Public** — plain language for residents
6. **Places** — always-pass by year (2019, 2024, 2025, 2026 YTD) and category; repeated fails across ≥2 calendar years 2012–2026 are listed as **Be cautious — repeated fails**, not a skip list. Ice cream, Pharmacy, and Grocery are name overlays (regex or sourced web matches), not City license types. `1 CITYWIDE ST` is shown as Mobile (citywide).
7. **Notes** — row counts and cleaning rules

## Files in this folder

| File | Role |
| --- | --- |
| [boston-food-safety-summary.md](boston-food-safety-summary.md) | Full written findings |
| `analyze_food.py` | Clean inspections + licenses → `outputs/food_stats.json` |
| `ice_cream_web_matches.json` | Sourced ice-cream shop names + URLs (not a City license type) |
| `grocery_web_matches.json` | Sourced grocery/supermarket names + URLs (not a City license type) |
| `test_analyze_food.py` | Unit tests (`python3 -m unittest test_analyze_food`) |
| `common.py` | Download skip-if-exists, date parse, ZIP neighborhood map |
| [canvases/boston-food-safety.canvas.tsx](canvases/boston-food-safety.canvas.tsx) | Original Cursor canvas |

```bash
# default input dir is ~/Downloads; override with BOSTON_DATA_DIR
python3 analyze_food.py
```

Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Analyze Boston datasets. Scripts look for:

| File | Dataset |
| --- | --- |
| `food-establishment-inspections.csv` | Food Establishment Inspections (`4582bec6-2b4f-4f9e-bc55-cbaa73117f4c`) |
| `active-food-licenses.csv` | Active Food Establishment Licenses (`f1e13724-284d-478c-b8bc-ef042aa5b70b`) |

## Cleaning rules (short)

Drop `resultdttm` that fail to parse or fall outside 2006–2026. Collapse on license number (or business name) + result timestamp to the second. Fail and star levels are **exact codes**, not substrings. Complete inspection years are 2012–2025. Dump span: inspections 2006-04-04 to 2026-08-28. All 3,347 license rows in this extract are `Active`.

Display names strip trailing `Inc`/`LLC`/`Corp`/`Ltd` — not `Company` in a trade name (Atlantic Fish Company). `@` is a location suffix only after a street, hospital, hotel, or college (`A @ Time` stays). Ice cream overlays use word-boundary regex **or** sourced public scoop-shop pages joined on brand key (J.P. Licks, Ben & Jerry’s). Pharmacy overlays use pharmacy/drugstore and chain names (CVS, Walgreens, Rite Aid) on the normalized trade name. Grocery overlays use grocery/supermarket in the name **or** sourced supermarket roundups joined on brand key. Convenience (7-Eleven, Dunkin) is not grocery. `1 CITYWIDE ST` is ISD’s placeholder for mobile licenses, shown as **Mobile (citywide) · License …**.

| Check | Count |
| --- | ---: |
| Inspection rows raw / kept | 900,574 / 894,176 |
| Collapsed inspections | 217,847 |
| 2025 inspections | 12,414 |
| 2025 fails | 5,003 |
| Active licenses | 3,347 |
