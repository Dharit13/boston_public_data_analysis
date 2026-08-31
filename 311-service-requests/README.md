# Boston 311 service requests (2016–2026 YTD)

Cleaned Analyze Boston 311 Service Requests. **Legacy annual files are the citywide series.** A parallel **NEW SYSTEM** file starts October 2025 — do not add the two. 2020 is COVID — not a baseline. 2026 is year-to-date through 30 August.

Headline: 311 is **busier than 2019**. The 2025 drop on the legacy file is a CRM split, not fewer complaints. 59% of 2025 is sanitation or parking. 32% of cases closed overdue.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/311/](https://dharit13.github.io/boston_public_data_analysis/311/)

**Written summary:** [boston-311-summary.md](boston-311-summary.md)

## 2025 headline

| | |
| --- | ---: |
| Legacy cases | 276,093 (756 a day) |
| vs 2019 | +8.8% (253,782 → 276,093) |
| 2023 peak, then 2024 | 307,791 → 306,756 |
| On time / overdue | 187,812 / 88,281 · 68% on time |
| Sanitation + parking | 59% (96,796 + 65,615) |
| Parking enforcement | 60,632 · #1 type |
| NEW SYSTEM (Oct 2025–) | 46,436 (4,132 in 2025 · 42,304 in 2026 YTD) |
| 2026 YTD legacy (through 30 Aug) | 172,886 (717 a day) |

Do **not** add 276,093 + 46,436 as one citywide 2025 total.

## What’s on the live page

1. **Summary** — six findings
2. **Overview** — demand, mix, 2019→2025 change, dual-system footnote
3. **Department** — clock, SLA, types, repeat streets, NEW SYSTEM 2026 mix
4. **City / Mayor** — volume vs 2019, neighborhoods, districts, policy asks
5. **Public** — plain language for residents
6. **Notes** — row counts and cleaning rules

## Files in this folder

| File | Role |
| --- | --- |
| [boston-311-summary.md](boston-311-summary.md) | Full written findings |
| `analyze_311.py` | Unify legacy + NEW SYSTEM → `outputs/311_briefing_stats.json` |
| `common.py` | Download skip-if-exists, date parse, null strip |
| [canvases/boston-311-city-briefing.canvas.tsx](canvases/boston-311-city-briefing.canvas.tsx) | Original Cursor canvas |

```bash
# default input dir is ~/Downloads; override with BOSTON_DATA_DIR
python3 analyze_311.py
```

Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Analyze Boston dataset `311-service-requests`. Scripts look for:

| Year | File |
| --- | --- |
| 2016–2026 YTD | `311-legacy-{year}.csv` |
| NEW SYSTEM (Oct 2025–) | `311-new-system.csv` |

If a dump URL 404s, the script falls back to the dataset resource download.

## Cleaning rules (short)

Kept every row with an incident id and a parseable open date. Type family uses whole-word matches so `tree` is not `street` and `ice` is not `services`. `Transportation - Traffic Division` is not automatically parking. 2026 is YTD through 30 Aug 2026. Date span on file: 2016-01-01 to 2026-08-30.

| Check | Count |
| --- | ---: |
| Legacy raw / kept | 2,819,637 / 2,819,637 |
| NEW SYSTEM raw / kept | 46,436 / 46,436 |
| 2025 legacy | 276,093 |
| NEW SYSTEM calendar 2025 | 4,132 |
