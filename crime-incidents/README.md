# Boston Police incidents (2016–2025)

Cleaned Boston Police RMS incident reports. **One row per incident number.** 2025 is the last complete year. Shootings, shots fired, and gun recoveries run through mid-August 2026 on the briefing.

Headline: the department is still busy; Boston is **not more violent than 2019**. Do not use **2020** as a baseline. Do not thin **B2 / B3 / C11** because the citywide shooting count fell.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/crime/](https://dharit13.github.io/boston_public_data_analysis/crime/)

**Written summary:** [boston-police-summary.md](boston-police-summary.md)

## 2025 headline

| | |
| --- | ---: |
| Unique incidents | 81,162 (222 a day) |
| Serious violence share | 2.7% |
| Serious violence vs 2016 | 3,756 → 2,213 (−41%) |
| Shooting victims vs 2019 | 190 → 120 (−37%) |
| 2020 COVID | reports 70,894 (−19%) · 274 victims (+44%) |
| Investigate person + sick assist | 18,653 (23% of reports) |
| Shoplifting vs 2016 | 2,453 → 4,340 (+77%) |
| Share of shooting victims in B2+B3+C11 | 72% (84 of 120 in 2025) |
| BPD overtime, 2025 payroll | $102M (56% of all city OT) |

D4 (South End / Back Bay) is #1 for **volume** since 2023. B2 is #1 for **shootings every year**.

## What’s on the live page

1. **Summary** — five findings
2. **Overview** — demand, 2019/2020/2025 comparison, mix, 2016→2025 change table
3. **Department** — clock, sick-assist / investigate / shoplifting, 2024 types, shoplifting streets, district table
4. **Guns** — victims (fatal/non-fatal), shots fired, district map, core-district share, recoveries, race/gender, 2026 YTD
5. **City / Mayor** — volume vs guns, who was #1 each year, Roxbury mix, policy asks
6. **Public** — plain language for residents
7. **Efficiency / OT** — peer practices (online reporting, co-response, vacancy math), what to move off sworn tape
8. **Notes** — row counts and classification caveats

## Files in this folder

| File | Role |
| --- | --- |
| [boston-police-summary.md](boston-police-summary.md) | Full written findings |
| `analyze_crime.py` | Clean RMS + shooting/recovery files → `outputs/crime_briefing_stats.json` |
| [canvases/boston-police-city-briefing.canvas.tsx](canvases/boston-police-city-briefing.canvas.tsx) | Original Cursor canvas |

```bash
python3 analyze_crime.py
```

Raw CSVs default to `~/Downloads` (`$BOSTON_DATA_DIR`). Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Yearly RMS extracts (Analyze Boston download names as used in the script):

| Years | File |
| --- | --- |
| 2015 (partial, 15 Jun–31 Dec) | `tmpzr3l5bxw.csv` |
| 2016 | `tmp3ochjtdc.csv` |
| 2017 | `tmp3apxsafn.csv` |
| 2018 | `tmpf_uzkqpk.csv` |
| 2019 | `tmp6w6ts2d7.csv` |
| 2020 | `tmpkd_w64k_.csv` |
| 2021 | `tmpfap3hfze.csv` |
| 2022 | `tmpdfeo3qy2.csv` |
| 2023–2026 YTD | `tmpxjuw4lyi.csv` |

Plus:

- `tmptxprphg5.csv` — shooting victims
- `tmpk63d1583.csv` — shots fired
- `tmp2o7bnkk5.csv` — gun recoveries

## Cleaning rules (short)

2015–2018 files list one row per offense; we keep one incident and assign the most serious offense. 2019+ is already one row per incident. UCR Part and offense-group fields go blank after 2018, so mix is classified from description and code. Midnight hour is inflated by unknown times. Shootings are **victims** (one incident can have several). Crime-gun recoveries are daily citywide totals, not geocoded.

| Check | Count |
| --- | ---: |
| Raw RMS rows | 947,034 |
| Unique incidents after collapse | 904,961 |
| 2016–2025 complete years | 806,206 |
| 2025 incidents | 81,162 |
| Shooting victims (separate file) | 2,250 |
| Shots-fired incidents | 9,533 |
