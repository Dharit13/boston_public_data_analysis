# Employee earnings (CY 2015–2025)

City of Boston employee earnings reports, cleaned onto one schema (**257,457** person-year rows). Teaching and school sites are rolled into **Education**. There is **no employee ID**; people are matched on a normalized name.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/earnings/](https://dharit13.github.io/boston_public_data_analysis/earnings/)

**Written summary:** [boston-earnings-summary.md](boston-earnings-summary.md) — citywide series, departments, hires, tenure, ZIPs, overtime, cleaning notes, and what the data cannot support.

Re-audited **28 August 2026** against the source reports.

## 2025 headline

| | |
| --- | ---: |
| Gross payroll | $2.46B |
| People | 25,397 |
| Median gross | $90.6k |
| Overtime | $183M |
| Education (teaching rollup) | 12,806 people · $1.09B · 44.6% of pay |
| Police | 3,094 · $534M · median $179k · OT $102M |
| Fire | 1,805 · $317M · median $175k · OT $50M |

Education + Police + Fire = **79% of 2025 payroll**. Police + Fire are 19% of people, 35% of pay, and **83% of overtime**. All 20 citywide top earners are BPD.

Treat **2024** as a contract-catch-up year: retro $114M, share ≥ $200k 3.3% → 9.1% → 7.6%, police headcount 3,011 → 3,491 → 3,094.

## What’s on the live page

Tabs match the analysis, not a teaser:

1. **Summary** — 2015→2025 table, payroll mix, hire/tenure/ZIP/concentration one-liners
2. **Citywide** — payroll (nominal and 2024 $), headcount, median, year-by-year, paycheck mix, 2024 vs 2023/2025
3. **Departments** — searchable 85-department table (people, pay, median, OT), 2015→2025 name map
4. **Who gets paid** — ZIP neighborhoods, concentration/Gini, Education titles, Police/Fire, MBTA caveat
5. **Top earners** — picker for citywide + every department and school site (~230 lists)
6. **New hires** — arrivals vs departures, rates, 2015 cohort remaining, 2025 hire/attrition by department
7. **Overtime** — city OT $183M, 93 people with OT above regular, Police OT/detail/headcount, every-department OT table
8. **Notes** — file quality by year, encodings, what not to conclude

## Files in this folder

| File | Role |
| --- | --- |
| [boston-earnings-summary.md](boston-earnings-summary.md) | Full written findings |
| [canvases/boston-employee-earnings.canvas.tsx](canvases/boston-employee-earnings.canvas.tsx) | Original Cursor canvas (does not render on GitHub) |
| Live HTML | `docs/earnings/` at the repo root (GitHub Pages) |

## Source files (not in this repo)

Place the City’s published files in `$BOSTON_DATA_DIR` or `~/Downloads`:

| Year | File |
| --- | --- |
| 2015 | `employee-earnings-report-2015.csv` |
| 2016 | `employee-earnings-report-2016.csv` |
| 2017 | `employee-earnings-report-2017.csv` |
| 2018 | `employeeearningscy18full.csv` |
| 2019 | `allemployeescy2019_feb19_20final-all.csv` |
| 2020 | `city-of-boston-calendar-year-2020-earnings.csv` |
| 2021 | `employee-earnings-report-2021.csv` |
| 2022 | `finalconsolidatedcy22earnings_feb2023.xlsx-sheet1.csv` |
| 2023 | `employee-earnings-report-2023.xlsx` |
| 2024 | `employee_earnings_report_2024.csv` |
| 2025 | `employee-earnings-report-2025.csv` |

Inflation uses BLS CPI-U; 2025 CPI is an approximate annualized figure.

## Definitions that matter

- **Education** = 144 instructional units (school sites, Teaching & Learning, Special Education, adult/alternative, substitutes). Food & Nutrition, Transportation, Facilities, and BPS police stay **outside** that rollup.
- **Transportation** on the city file is mostly BPS `Cab Monitor` (median $33.7k). **MBTA is not on this file.**
- A **new hire** is a normalized name on this year’s city file that was not on last year’s. Returning after a gap counts as a hire.
- Dollars are calendar-year **gross**, not W-2, FTE, or budget. Overtime is dollars, not hours.

Two labels corrected on re-audit: people with overtime above regular pay are **93** (not 80); Boston-proper ZIP share is **67%** (not 69%).
