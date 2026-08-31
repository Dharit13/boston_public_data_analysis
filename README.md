# Boston public data analysis

Three analyses of City of Boston open data:

| Project | What it covers | Interactive canvas | Writeup / code |
| --- | --- | --- | --- |
| [employee-earnings](employee-earnings/) | City payroll, CY 2015–2025 | `canvases/boston-employee-earnings.canvas.tsx` | [boston-earnings-summary.md](employee-earnings/boston-earnings-summary.md) |
| [fire-incidents](fire-incidents/) | Boston Fire incidents, 2012–2024 | `canvases/boston-fire-city-briefing.canvas.tsx` | `analyze_fire.py` and neighborhood / loss timelines |
| [crime-incidents](crime-incidents/) | Boston Police RMS, 2016–2025 | `canvases/boston-police-city-briefing.canvas.tsx` | `analyze_crime.py` |

Raw incident and payroll CSVs are **not** in this repo (they are large and already published by the City). Scripts read them from `~/Downloads` by default, or from `$BOSTON_DATA_DIR`. Derived briefing JSON is checked in under each project’s `outputs/` folder so the canvases can be reproduced without re-running a full extract.

## Canvases

The `.canvas.tsx` files are Cursor canvases (import from `cursor/canvas`). Open them in Cursor beside the chat. They embed the cleaned stats; they do not fetch the network.

## Data sources

Published on [Analyze Boston](https://data.boston.gov/):

- Employee earnings reports (calendar years 2015–2025)
- Boston Fire Department incident data (legacy 2012–2013 plus later extracts)
- Boston Police Department crime incident reports (RMS)

## License

Code and writeups in this repository are for analysis of public records. The underlying datasets remain the City of Boston’s.
