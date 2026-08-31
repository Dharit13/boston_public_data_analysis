# Boston approved building permits (+ ZBA), 2006–2026 YTD

Cleaned Analyze Boston Approved Building Permits and Zoning Board of Appeal Decisions. **These are two files — do not add ZBA cases into the permit year series.** 2020 is COVID — not a baseline. **2026 is not a full year** (permits through 29 August; ZBA through 28 August). After-hours construction is **not** in this briefing.

Headline: permit **counts fell versus 2019**. Declared **valuation did not**. 2025 permits **36,801** vs **45,291** in 2019 (**−18.7%**). Declared valuation **$12.46B** vs **$11.09B** (**+12.4%**). Erect/New Construction is **210** of those permits — not a “new buildings” family.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/building-permits/](https://dharit13.github.io/boston_public_data_analysis/building-permits/)

**Written summary:** [boston-building-permits-summary.md](boston-building-permits-summary.md)

## 2025 headline

| | |
| --- | ---: |
| Issued permits | 36,801 (100.8 a day) |
| vs 2019 permits | −18.7% (45,291 → 36,801) |
| Declared valuation | $12.46B (+12.4% vs 2019 $11.09B) |
| Erect/New Construction | 210 of 36,801 |
| Peak issued hour | 3 p.m. (4,577) · quietest 7 a.m. (28) |
| Heaviest weekday | Tuesday 8,115 · Sunday 174 |
| 2026 YTD permits (through 29 Aug) | 24,086 (99.9 a day) |
| ZBA dated cases (separate file) | 906 vs 1,616 in 2019 |

Do **not** add 36,801 permits + 906 ZBA cases. Neighborhood on the permit chart is ZIP via the Fire ZIP map — Dorchester is 02122+02124+02125.

## What’s on the live page

1. **Summary** — six findings
2. **Overview** — permit vs valuation series, type and occupancy mix
3. **Department** — issuance clock, ZIP neighborhoods, status
4. **City / Mayor** — policy asks and the ZBA footnote
5. **Public** — plain language for residents
6. **Notes** — row counts and cleaning rules

## Files in this folder

| File | Role |
| --- | --- |
| [boston-building-permits-summary.md](boston-building-permits-summary.md) | Full written findings |
| `analyze_permits.py` | Clean permits + ZBA → `outputs/permits_stats.json` |
| `common.py` | Download skip-if-exists, date parse, ZIP neighborhood map |
| [canvases/boston-building-permits.canvas.tsx](canvases/boston-building-permits.canvas.tsx) | Original Cursor canvas |

```bash
# default input dir is ~/Downloads; override with BOSTON_DATA_DIR
python3 analyze_permits.py
```

Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Analyze Boston datasets. Scripts look for:

| File | Dataset |
| --- | --- |
| `building-permits.csv` | Approved Building Permits (`6ddcd912-32a0-43df-9908-63574f8c7e77`) |
| `zba-tracker.csv` | Zoning Board of Appeal Decisions (`0f0fa8c2-87ba-45d6-a876-0d177dd02512`) |

## Cleaning rules (short)

Drop `issued_date` that fail to parse or fall outside 2006–2026. Occupancy and ZBA decisions are **exact codes**, not substrings (`Communication` is not Commercial). ZBA date is submitted, then received, then final_decision_date. Complete permit years are 2012–2025. Dump span: permits 2006-09-26 to 2026-08-29; ZBA 2013-01-31 to 2026-08-28.

| Check | Count |
| --- | ---: |
| Permits raw / kept | 661,589 / 661,589 |
| ZBA raw / kept | 16,394 / 16,392 |
| 2025 permits | 36,801 |
| 2025 ZBA dated cases | 906 |
