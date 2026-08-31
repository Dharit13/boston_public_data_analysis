# Boston Fire incidents (2012–2024)

**Live briefing:** https://dharit13.github.io/boston_public_data_analysis/fire/

Cleaned Boston Fire Department incident files. Headline: volume is up; structure fires are not. Dorchester is first for fires and for total volume in every year on file. Cooking fires are the common issue; building fires are the costly ones.

## Files

- [canvases/boston-fire-city-briefing.canvas.tsx](canvases/boston-fire-city-briefing.canvas.tsx) — city briefing canvas
- `analyze_fire.py` — clean extracts and write `outputs/fire_briefing_stats.json`
- `timeline_areas.py` — neighborhood mix over time → `outputs/timeline_areas.json`
- `timeline_fire_loss.py` — issue mix and loss → `outputs/fire_issues_loss.json`

```bash
python3 analyze_fire.py
python3 timeline_areas.py
python3 timeline_fire_loss.py
```

Raw CSVs default to `~/Downloads`. Override with `BOSTON_DATA_DIR`. Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`).

## Source files (not in this repo)

Typical Analyze Boston / extract names used by the scripts:

- `2012-bostonfireincidentopendata.csv`
- `2013-bostonfireincidentopendata.csv`
- `tmpm7euesbm.csv` (later years)
- `incident-type-code-list.csv`
- `property-use-code-list.csv`

2025 incident months are incomplete on the extract (March–mid-December hole). Payroll figures on the canvas use the 2025 earnings file.
