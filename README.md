# Boston public data analysis

Six briefings built from City of Boston open data: **employee earnings** (2015–2025), **fire incidents** (2012–2024), **police incidents** (2016–2025), **311 service requests** (2016–2026 YTD), **Vision Zero** crashes and fatalities (2015–2026 YTD), and **approved building permits** (+ ZBA, 2006–2026 YTD).

**Live site (GitHub Pages):** [https://dharit13.github.io/boston_public_data_analysis/](https://dharit13.github.io/boston_public_data_analysis/)

| Project | Live briefing | Written summary | Folder |
| --- | --- | --- | --- |
| Employee earnings, CY 2015–2025 | [Open](https://dharit13.github.io/boston_public_data_analysis/earnings/) | [boston-earnings-summary.md](employee-earnings/boston-earnings-summary.md) | [employee-earnings/](employee-earnings/) |
| Fire incidents, 2012–2024 | [Open](https://dharit13.github.io/boston_public_data_analysis/fire/) | [boston-fire-summary.md](fire-incidents/boston-fire-summary.md) | [fire-incidents/](fire-incidents/) |
| Police incidents, 2016–2025 | [Open](https://dharit13.github.io/boston_public_data_analysis/crime/) | [boston-police-summary.md](crime-incidents/boston-police-summary.md) | [crime-incidents/](crime-incidents/) |
| 311 service requests, 2016–2026 YTD | [Open](https://dharit13.github.io/boston_public_data_analysis/311/) | [boston-311-summary.md](311-service-requests/boston-311-summary.md) | [311-service-requests/](311-service-requests/) |
| Vision Zero crashes and fatalities, 2015–2026 YTD | [Open](https://dharit13.github.io/boston_public_data_analysis/vision-zero/) | [boston-vision-zero-summary.md](vision-zero/boston-vision-zero-summary.md) | [vision-zero/](vision-zero/) |
| Approved building permits, 2006–2026 YTD | [Open](https://dharit13.github.io/boston_public_data_analysis/building-permits/) | [boston-building-permits-summary.md](building-permits/boston-building-permits-summary.md) | [building-permits/](building-permits/) |

The Pages site is the briefing you can share. Each project folder has a README (how to reproduce) and a markdown writeup (findings, tables, caveats). Cursor `.canvas.tsx` files are the original working notebooks; they do not render on GitHub.

## Headlines

- **Earnings (2025):** $2.46B gross · 25,397 people · $90.6k median · $183M overtime. Education (teaching rollup) + Police + Fire are **79% of payroll**. Treat **2024** as a contract-catch-up year ($114M retro), not a new normal. Re-audited 28 August 2026.
- **Fire (2024):** 60,096 runs · fires **−34%** since 2012 · building fires **−28%**. Dorchester led fires **every year**. Cooking is the common fire; building fires hold **90%** of estimated loss ($572M over 13 years).
- **Police (2025):** 81,162 reports · serious violence **−41%** since 2016 · 120 shooting victims (−37% vs 2019). **Do not use 2020 as a baseline.** B2 / B3 / C11 still hold **72%** of shooting victims. D4 took volume because of shoplifting, not guns.
- **311 (2025):** 276,093 legacy cases (+8.8% vs 2019) · 68% on time · 59% sanitation or parking. **Do not add** the Oct 2025 NEW SYSTEM file (46,436). Peak year is 2023 (307,791).
- **Vision Zero (2025):** 3,411 crashes (−21.7% vs 2019) · 14 deaths (11 in 2019). Pedestrians were 16.7% of crashes and **11 of 14** deaths. **2026 is not a full year.** BPD RMS MV crash / traffic (13,138) is a different file.
- **Building permits (2025):** 36,801 issued (−18.7% vs 2019) · declared value **$12.46B (+12.4%)**. Erect/New Construction is **210**. **Do not add ZBA (906).** **2026 is not a full year.**

## How to read this repo

```
boston_public_data_analysis/
  README.md                          this file
  docs/                              GitHub Pages site (HTML + charts)
    earnings/  fire/  crime/  311/  vision-zero/  building-permits/
  employee-earnings/
    README.md
    boston-earnings-summary.md       full writeup
    canvases/                        Cursor canvas source
  fire-incidents/
    README.md
    boston-fire-summary.md
    analyze_fire.py                  clean + briefing stats
    timeline_areas.py / timeline_fire_loss.py
    outputs/*.json
    canvases/
  crime-incidents/
    README.md
    boston-police-summary.md
    analyze_crime.py
    outputs/*.json
    canvases/
  311-service-requests/
    README.md
    boston-311-summary.md
    analyze_311.py
    outputs/*.json
    canvases/
  vision-zero/
    README.md
    boston-vision-zero-summary.md
    analyze_vision_zero.py
    outputs/*.json
    canvases/
  building-permits/
    README.md
    boston-building-permits-summary.md
    analyze_permits.py
    outputs/*.json
    canvases/
```

Raw City CSVs are **not** in the repo (they are large and republished by the City). Cleaning scripts read `$BOSTON_DATA_DIR` or `~/Downloads`. Derived JSON lives under each project’s `outputs/` folder.

## Reproduce

Python 3 standard library only (`python3 -m` — no extra packages).

```bash
export BOSTON_DATA_DIR="$HOME/Downloads"   # optional; this is the default
cd fire-incidents && python3 analyze_fire.py && python3 timeline_areas.py && python3 timeline_fire_loss.py
cd ../crime-incidents && python3 analyze_crime.py
cd ../311-service-requests && python3 analyze_311.py
cd ../vision-zero && python3 analyze_vision_zero.py
cd ../building-permits && python3 analyze_permits.py
```

Earnings figures on the live page were recomputed from the 11 published reports (see [employee-earnings/README.md](employee-earnings/README.md) for file names). Source: [Analyze Boston](https://data.boston.gov/).

## What the files are not

Calendar-year gross payroll is not FTE, W-2, or budget. Fire estimated loss is the officer’s NFIRS figure, not insurance. Police mix after 2018 is classified from offense text because UCR fields go blank. 2025 fire incidents are incomplete on the extract (March–mid-December hole). MBTA pay is a different employer. 311 2025 legacy and NEW SYSTEM are parallel files — do not add them. Vision Zero crashes and fatalities are separate files; BPD RMS MV crash / traffic is a third count. Approved building permits and ZBA cases are separate files — do not add them. After-hours construction is not in the permits briefing.
