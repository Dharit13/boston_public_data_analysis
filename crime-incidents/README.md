# Boston Police incidents (2016–2025)

Cleaned Boston Police RMS incident reports. One row per incident number. 2025 is the last complete year. Shootings, shots fired, and gun recoveries run through mid-August 2026 on the briefing canvas.

Headline: the department is still busy; Boston is not more violent than 2019. Do not use 2020 as a baseline. Do not thin B2 / B3 / C11 because the citywide shooting count fell.

## Files

- [canvases/boston-police-city-briefing.canvas.tsx](canvases/boston-police-city-briefing.canvas.tsx) — city briefing canvas
- `analyze_crime.py` — clean RMS extracts and write `outputs/crime_briefing_stats.json`

```bash
python3 analyze_crime.py
```

Raw CSVs default to `~/Downloads`. Override with `BOSTON_DATA_DIR`. Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`).

## Source files (not in this repo)

Yearly RMS extracts (Analyze Boston download names as used in the script):

| Years | File |
| --- | --- |
| 2015 (partial) | `tmpzr3l5bxw.csv` |
| 2016 | `tmp3ochjtdc.csv` |
| 2017 | `tmp3apxsafn.csv` |
| 2018 | `tmpf_uzkqpk.csv` |
| 2019 | `tmp6w6ts2d7.csv` |
| 2020 | `tmpkd_w64k_.csv` |
| 2021 | `tmpfap3hfze.csv` |
| 2022 | `tmpdfeo3qy2.csv` |
| 2023–2026 YTD | `tmpxjuw4lyi.csv` |

Plus shooting / shots-fired / recovery extracts referenced in `analyze_crime.py` (`tmptxprphg5.csv`, `tmpk63d1583.csv`, `tmp2o7bnkk5.csv`).
