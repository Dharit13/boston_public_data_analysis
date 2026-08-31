# Boston Vision Zero crashes and fatalities (2015–2026 YTD)

Cleaned Analyze Boston Vision Zero Crash Records and Fatality Records. **These are two files — do not add deaths into the crash total.** 2020 is COVID — not a baseline. **2026 is not a full year** (crashes through 1 July; fatalities through 15 May). BPD RMS MV crash / traffic is a different count and **will not match**.

Headline: crashes are **down versus 2019**. Traffic deaths are **not**. 2025 crashes **3,411** vs **4,354** in 2019 (**−21.7%**). Deaths **14** vs **11**. Pedestrians were **16.7%** of crashes and **11 of 14** deaths.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/vision-zero/](https://dharit13.github.io/boston_public_data_analysis/vision-zero/)

**Written summary:** [boston-vision-zero-summary.md](boston-vision-zero-summary.md)

## 2025 headline

| | |
| --- | ---: |
| Crashes | 3,411 (9.3 a day) |
| vs 2019 | −21.7% (4,354 → 3,411) |
| Deaths | 14 (11 in 2019) |
| Motor vehicle / pedestrian / bicycle crashes | 2,584 / 571 / 256 |
| Pedestrian deaths | 11 of 14 |
| Peak hour | 9 p.m. (212) · quietest 9 a.m. (52) |
| 2026 YTD crashes (through 1 Jul) | 1,661 (9.1 a day) |
| BPD RMS MV crash / traffic (different file) | 13,138 |

Do **not** add 3,411 crashes + 14 deaths. Do **not** brief RMS 13,138 as Vision Zero crashes.

## What’s on the live page

1. **Summary** — six findings
2. **Overview** — crash vs death series, mode mix, 2019→2025
3. **Department** — clock, streets, location type
4. **City / Mayor** — policy asks and the RMS vs Vision Zero footnote
5. **Public** — plain language for residents
6. **Notes** — row counts and cleaning rules

## Files in this folder

| File | Role |
| --- | --- |
| [boston-vision-zero-summary.md](boston-vision-zero-summary.md) | Full written findings |
| `analyze_vision_zero.py` | Clean crashes + fatalities → `outputs/vision_zero_stats.json` |
| `common.py` | Download skip-if-exists, date parse, null strip |
| [canvases/boston-vision-zero.canvas.tsx](canvases/boston-vision-zero.canvas.tsx) | Original Cursor canvas |

```bash
# default input dir is ~/Downloads; override with BOSTON_DATA_DIR
python3 analyze_vision_zero.py
```

Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Analyze Boston datasets. Scripts look for:

| File | Dataset |
| --- | --- |
| `vision-zero-crashes.csv` | Vision Zero Crash Records (`e4bfe397-6bfc-49c5-9367-c879fac7401d`) |
| `vision-zero-fatalities.csv` | Vision Zero Fatality Records (`92f18923-d4ec-4c17-9405-4e0da63e1d6c`) |

## Cleaning rules (short)

Drop rows with no parseable timestamp. `mode_type` is an exact code (`mv` / `ped` / `bike`), not a substring. Blank `street` at intersections is filled from `xstreet1` & `xstreet2`. 2015–2025 are complete years. Date span on file: crashes 2015-01-01 to 2026-07-01; fatalities 2015-01-22 to 2026-05-15.

| Check | Count |
| --- | ---: |
| Crashes raw / kept | 44,343 / 44,343 |
| Fatalities raw / kept | 161 / 161 |
| 2025 crashes | 3,411 |
| 2025 deaths | 14 |
