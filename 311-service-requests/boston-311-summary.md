# Boston 311 — city briefing, 2016–2026 YTD

Written briefing from cleaned Analyze Boston 311 Service Requests. Interactive charts: [live page](https://dharit13.github.io/boston_public_data_analysis/311/). Reproducible from `analyze_311.py`.

**Headline:** 311 is busier than 2019. The 2025 drop is a system change, not fewer complaints. Legacy cases **253,782 → 276,093 (+8.8%)**. Peak year is **2023 (307,791)**. **59%** of 2025 is sanitation or parking. **32%** closed overdue. A parallel NEW SYSTEM file starts October 2025 — **do not add the two.** **2020 is COVID.**

---

## 2025 at a glance

| | |
| --- | ---: |
| Legacy cases | 276,093 (756 a day) |
| Closed on time | 68% (187,812 / 88,281 overdue) |
| Sanitation + parking | 59% |
| Parking enforcement | 60,632 · #1 type |
| Dorchester | 34,831 · #1 neighborhood |
| NEW SYSTEM (Oct 2025–) | 46,436 |
| 2026 YTD legacy (through 30 Aug) | 172,886 (717 a day) |

---

## Volume peaked in 2023. 2025 is a CRM split.

Use **2019** as the last normal pre-COVID year, not 2020. Legacy 311 climbed from 210,483 in 2016 to 307,791 in 2023, then held 306,756 in 2024. 2025 is 276,093 on the legacy file — 8.8% above 2019, about 10% below the 2023 peak.

December is the lightest month (16,574). The Oct CRM split is **part** of that drop, not the whole story: NEW SYSTEM 2025 is only 4,132 cases, and seasonal demand falls after August (28,933).

311 dipped only **3%** in 2020 (253,782 → 246,165). Housing / ISD rose 4,330 → 5,506. Compare 2025 to 2019, then show 2020 as the shock.

A NEW SYSTEM file starts in October 2025 (4,132 that year, 42,304 in 2026 YTD, 46,436 in all). Parks, trees, and some other types moved. Parking enforcement stayed on the legacy file. Adding 276,093 + 46,436 is not a citywide total.

### How the job changed, 2019 → 2025 (legacy)

| Category | 2019 | 2025 | Change |
| --- | ---: | ---: | ---: |
| All cases | 253,782 | 276,093 | +8.8% |
| Sanitation / streets | 76,662 | 96,796 | +26% |
| Parking / vehicles | 47,211 | 65,615 | +39% |
| Road defects | 30,155 | 24,725 | −18% |
| Lights / signs | 21,713 | 17,103 | −21% |
| Parks / trees | 15,871 | 14,766 | −7% (2024 was 19,715) |
| Housing / ISD | 4,330 | 5,250 | +21% |

Parks/trees 2024→2025 is the Oct CRM split (NEW SYSTEM 2026 already has 5,932 parks/trees), not fewer trees.

---

## When cases open, and whether they close on time

2025 demand peaks at **8 a.m. (23,430)**. Overnight trough is **4 a.m. (1,404)**. Tuesday is heaviest (46,984); Sunday is lightest (27,633) — 41% below Tuesday. August is the peak month; December is the lightest.

**68%** on time (187,812). **88,281** overdue. Charlestown (A15) has the worst overdue share at **44.5%** on the smallest district volume (7,721). D4 South End is the volume district (52,999) with 26.3% overdue.

---

## What the desks close

Parking enforcement is #1 (60,632). Street cleaning, trash barrels, and CE collection follow. Needle pickup is **11,689** — not a rounding error.

Dorchester leads neighborhood volume (34,831). D4 leads by police district because it covers more than one neighborhood.

Parking stayed on the old CRM in 2026: **46,546** parking on legacy YTD vs **44** on NEW SYSTEM.

---

## What this file is not

| Rule | Why it matters |
| --- | --- |
| Legacy 2016–2026 YTD kept 2,819,637 of 2,819,637 | No date/id drop |
| NEW SYSTEM kept 46,436 of 46,436 | Parallel CRM from Oct 2025 |
| 2026 is YTD through 30 Aug | Not a full year |
| Do not add 2025 legacy + NEW SYSTEM | Double-count trap |
| Compare 2025 to 2019, not 2020 | COVID year |

Source: Analyze Boston dataset `311-service-requests` · dumps pulled 31 Aug 2026 · date span 2016-01-01 to 2026-08-30.
