# Employee earnings (CY 2015–2025)

**Live briefing:** https://dharit13.github.io/boston_public_data_analysis/earnings/

City of Boston employee earnings reports, cleaned onto one schema (257,457 rows). Teaching and school sites are rolled into **Education**. There is no employee ID; people are matched on a normalized name.

**2025:** $2.46B gross · 25,397 people · $90.6k median · $183M overtime. Education + Police + Fire are 79% of payroll.

## Files

- [boston-earnings-summary.md](boston-earnings-summary.md) — full written summary
- [canvases/boston-employee-earnings.canvas.tsx](canvases/boston-employee-earnings.canvas.tsx) — interactive canvas (departments, hires, overtime, top earners)

Open the canvas in Cursor. Tabs: Summary → Overview → Departments (including **Top earners**) → Who gets paid → New hires → Overtime → Cleaning notes.

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

Treat **2024** as a contract-catch-up year ($114M retro), not a new normal.
