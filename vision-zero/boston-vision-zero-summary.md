# Boston Vision Zero — city briefing, 2015–2026 YTD

Written briefing from cleaned Analyze Boston Vision Zero Crash Records and Fatality Records. Interactive charts: [live page](https://dharit13.github.io/boston_public_data_analysis/vision-zero/). Reproducible from `analyze_vision_zero.py`.

**Headline:** Crashes are down versus 2019. Traffic deaths are not. Vision Zero recorded **3,411** crashes in 2025 against **4,354** in 2019 (**−21.7%**). Deaths were **14** against **11**. Pedestrians were **16.7%** of crashes and **11 of 14** deaths. **2020 is COVID.** **2026 is not a full year.** These two files are not Boston Police RMS.

---

## 2025 at a glance

| | |
| --- | ---: |
| Crashes | 3,411 (9.3 a day) |
| Deaths | 14 |
| vs 2019 crashes | −21.7% (4,354 → 3,411) |
| Motor vehicle / pedestrian / bicycle | 2,584 / 571 / 256 |
| Pedestrian deaths | 11 of 14 |
| Peak hour | 9 p.m. (212) |
| 2026 YTD crashes (through 1 Jul) | 1,661 (9.1 a day) |

---

## Crashes fell versus 2019. Deaths did not.

Use **2019** as the last normal pre-COVID year, not 2020. Crashes peaked at **4,529** in 2017, then **4,372** in 2018 and **4,354** in 2019. 2025 is 3,411 — 9.3 a day.

Crashes fell **23.2%** in 2020 (4,354 → 3,346) while deaths rose (11 → 14). Compare 2025 to 2019, then show 2020 as the shock.

2026 is not a full year. Crashes run through **1 July 2026** (1,661 YTD). Fatalities run through **15 May 2026** (5 deaths). Do not annualize either figure.

Do not add 14 deaths into 3,411 crashes. They are separate files.

### How the mix changed, 2019 → 2025

| Measure | 2019 | 2025 | Change |
| --- | ---: | ---: | ---: |
| All crashes | 4,354 | 3,411 | −21.7% |
| Deaths | 11 | 14 | +3 |
| Motor vehicle crashes | 3,292 | 2,584 | −21.5% |
| Pedestrian crashes | 697 | 571 | −18.1% |
| Bicycle crashes | 365 | 256 | −29.9% |
| Pedestrian share of deaths | 8 of 11 | 11 of 14 | still most |

Across complete years 2015–2025, pedestrians are **92 of 156** deaths. 2025 crash mix: motor vehicle **75.8%**, pedestrian **16.7%**, bicycle **7.5%**. `mode_type` is an exact datastore code (`mv` / `ped` / `bike`); motor-vehicle deaths are not split into drivers, passengers, or motorcyclists.

---

## When crashes happen

2025 demand peaks at **9 p.m. (212)**. Overnight/morning trough is **9 a.m. (52)** — the opposite clock from 311 (8 a.m. open). Friday is heaviest (**535**). **Thursday and Sunday** are lightest (**457** each). Tuesday is 469, not the trough. August is the peak month (**355**); February is lightest (**217**).

---

## Where 2025 crashes were recorded

Street names are as recorded. Blank street fields at intersections are filled from the two cross streets. Interstate 93 is in this file as a named location.

| Street | 2025 crashes |
| --- | ---: |
| Washington St | 111 |
| Interstate 93 | 106 |
| Blue Hill Ave | 78 |
| Dorchester Ave | 47 |
| Hyde Park Ave | 37 |
| Massachusetts Ave | 34 |
| River St | 34 |
| Centre St | 33 |
| Columbia Rd | 32 |
| William T Morrissey Blvd | 30 |
| Tremont St | 29 |

Location type as recorded: street **1,858** · intersection **1,384** · other **169**.

---

## BPD RMS is not Vision Zero

BPD recorded **13,138** MV crash / traffic incidents in 2025 (leaving-scene, OUI, crash, and other traffic). Vision Zero recorded **3,411** crashes. They **will not match**. Do not brief them as one number.

---

## What this file is not

| Rule | Why it matters |
| --- | --- |
| Crashes kept 44,343 of 44,343 | No timestamp drop. Span 2015-01-01 to 2026-07-01. |
| Fatalities kept 161 of 161 | A separate file. Span 2015-01-22 to 2026-05-15. |
| 2026 is not a full year | Crashes through 1 Jul (1,661). Deaths through 15 May (5). |
| Compare 2025 to 2019, not 2020 | COVID year. Crashes −23.2%; deaths 11 → 14. |
| Do not add RMS 13,138 to Vision Zero 3,411 | Different files. They will not match. |

Source: Analyze Boston datasets vision-zero-crash-records and vision-zero-fatality-records · dumps pulled 31 Aug 2026.
