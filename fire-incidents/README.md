# Boston Fire incidents (2012–2024)

Cleaned Boston Fire Department primary incidents. Headline: **volume is up; structure fires are not.** Dorchester is first for fires and for total volume in every year on file. Cooking fires are the common issue; building fires are the costly ones.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/fire/](https://dharit13.github.io/boston_public_data_analysis/fire/)

**Written summary:** [boston-fire-summary.md](boston-fire-summary.md)

## 2024 headline

| | |
| --- | ---: |
| Boston primary incidents | 60,096 (164 a day) |
| Share that were fires | 6.2% |
| Fires vs 2012 | 5,609 → 3,716 (−34%) |
| Building fires (NFIRS 111) | 491 → 354 (−28%) |
| Estimated loss, 2012–2024 | $572M (90% from building fires) |
| Years Dorchester led fires | 13 / 13 |
| False alarms | 21,752 (36% of runs) |
| Public service (553) | 18,214 |
| BFD overtime, 2025 payroll | $49.9M (15.8% of BFD pay, 27% of city OT) |

2025 incidents are **not** a complete year on the extract (Jan–Feb, 1–10 Mar, 19–31 Dec). Do not annualize 11,480 into a 2025 total. January–February 2025 vs the same two months in 2024 is the fair comparison. 2025 **payroll** is a full year and is on the Efficiency / OT tab.

## What’s on the live page

1. **Summary** — five findings
2. **Overview** — demand, mix, 2012→2024 change table, Jan–Feb 2025 vs 2024
3. **Department** — clock (hour / weekday / month), top codes, false-alarm streets, district workload, shop-by-shop use
4. **City / Mayor** — Dorchester 13-year rank, cooking vs building, building fires by neighborhood, loss, policy asks
5. **Public** — plain language for residents
6. **Efficiency / OT** — peer practices (London AFA, Tokyo/FDNY modified response, vacancy math), 2025 OT by title, where to hire vs where to change dispatch
7. **Notes** — row counts, drop reasons, 2025 holes

## Files in this folder

| File | Role |
| --- | --- |
| [boston-fire-summary.md](boston-fire-summary.md) | Full written findings |
| `analyze_fire.py` | Clean extracts → `outputs/fire_briefing_stats.json` |
| `timeline_areas.py` | Neighborhood mix over time → `outputs/timeline_areas.json` |
| `timeline_fire_loss.py` | Fire-family mix and loss → `outputs/fire_issues_loss.json` |
| [canvases/boston-fire-city-briefing.canvas.tsx](canvases/boston-fire-city-briefing.canvas.tsx) | Original Cursor canvas |

```bash
# default input dir is ~/Downloads; override with BOSTON_DATA_DIR
python3 analyze_fire.py
python3 timeline_areas.py
python3 timeline_fire_loss.py
```

Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Typical Analyze Boston / extract names used by the scripts:

- `2012-bostonfireincidentopendata.csv`
- `2013-bostonfireincidentopendata.csv`
- `tmpm7euesbm.csv` (2014 through the current extract, including partial 2025)
- `incident-type-code-list.csv`
- `property-use-code-list.csv`

## Cleaning rules (short)

Kept: valid incident number, parseable date, three-digit incident type, non-negative loss under $50M. Geography is **ZIP-mapped** Boston (the city “BO” section collapses Back Bay, Fenway, South End, and downtown). Boston EMS is a separate system — almost no 300-series medical in these files. Estimated loss is not an audited insurance total.

| Check | Count |
| --- | ---: |
| Raw rows | 641,615 |
| Kept after cleaning | 631,890 |
| Boston geography used | 628,291 |
| 2024 Boston primaries | 60,096 |
| 2025 Boston primaries on file | 11,480 |
