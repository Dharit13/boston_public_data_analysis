# Boston Public Works — city briefing, 2008–2026 YTD

Written briefing from cleaned Analyze Boston Public Works Violations (Code Enforcement citations), Active Work Zones, Streetlight Locations, and Snow Emergency Routes. Interactive charts: [live page](https://dharit13.github.io/boston_public_data_analysis/public-works/). Reproducible from `analyze_public_works.py`.

**Headline:** The live Public Works event dump is Code Enforcement tickets, mostly trash storage. Unique tickets were **63,226** in 2025 against **46,214** in 2019 (**+36.8%**). Trash storage is on **50,587** of those tickets (**80.0%**). **Do not add 11,064 pothole-repair requests into 63,226.** **2020 is COVID.** **2026 is year-to-date.** Open caseload (**116,431**) is a snapshot, not a year.

---

## 2025 at a glance

| | |
| --- | ---: |
| Unique tickets issued | 63,226 (173.2 a day) |
| vs 2019 | +36.8% (46,214 → 63,226) |
| Trash storage | 50,587 of 63,226 (80.0%) |
| Code 1, improper storage trash: res | 39,697 |
| Assessed fines | $4.05 million ($4,050,220) |
| Peak status_dttm hour | 7 a.m. (7,210) · Tuesday 12,538 |
| 2026 YTD (through 1 Sep) | 44,684 (183.1 a day) |
| Open caseload (latest status Open) | 116,431 |
| Active work-zone permits (1 Sep 2026) | 810 (907 locations) |

---

## More tickets than 2019. 2020 is not the baseline.

Use **2019** as the last normal pre-COVID year, not 2020. Complete citation years are 2012–2025. 2025 is 63,226 tickets against 46,214 in 2019. 2020 fell to **42,275**. 2026 is **44,684** through **1 September 2026** (183.1 a day). Do not annualize that figure, and do not mix it onto the 2012–2025 year chart.

The public dump is **one row per citation line** (916,375 raw). This briefing drops **386** exact-duplicate rows and collapses to unique `ticket_no` (fallback `case_no`). Volume after Void out is **807,282**. 2025 is **73,219 raw rows → 63,226 tickets**. One ticket can carry two codes; stacked families in 2025 (**67,859**) exceed ticket n.

---

## 2025 codes are ordinance tickets, not NAICS

Families come from dump `(code, description)` clusters confirmed against boston.gov Code Enforcement — not a three-name regex. Assessed fines on 2025 tickets sum to **$4.05 million**. Trash storage is most of the count (**$2.42 million**); illegal dumping is a smaller count and a larger share of dollars.

| Code | Description | 2025 tickets |
| --- | --- | ---: |
| 1 | Improper storage trash: res | 39,697 |
| 3 | Overfilling of barrel/dumpster | 11,538 |
| 24 | Overgrown weeds on property | 6,001 |
| 17a | Failure clear sidewalk — snow | 4,751 |
| 2 | Improper storage trash: com | 4,264 |
| 9a | Illegal dumping < 1 cubic yd | 1,950 |
| 27a | Occupying City property w/o permit | 1,264 |
| 17c | Failure clear sidewalk — snow | 1,070 |

Leftover codes **26, 37, 42, 45, 43, 32, 31** stay Other (7 codes / 912 tickets; vacant/board-up/rental and rare vending).

---

## Open caseload is a separate stat

**116,431** tickets currently Open. That is not 2025 issued (63,226) and not 2026 year-to-date (44,684). A 2025 ticket can still be Open; those IDs may overlap. Counts must not be added, and Open IDs must not be treated as extra 2026 events.

---

## 2025 issued tickets, not a career ranking

Dorchester leads 2025 issued tickets (**10,541**). Street names are 2025 only. Washington, Newbury, and Beacon are long streets — not a single block, and not “the worst street in Boston.”

`status_dttm` on 2025 tickets peaks at **7 a.m. (7,210)**. Evening hours are near zero. Tuesday is the busiest weekday (**12,538**); Saturday is the quietest (**4,153**). August is the peak month (**6,475**). This is when tickets were written, not when a pothole was filled.

---

## Construction and assets are snapshots

The CIU active-work-zone file is a daily report of jobs in the street: **810** permits, **907** locations, as of **1 September 2026**. Collapse to Permit. Do not stack these onto citation years. Streetlight Locations is a **2016** inventory (**74,065** points with coordinates). Outages are 311. Snow-emergency routes are **736** named segments (**214** street names), not plow GPS. Traffic signals are BTD, not DPW.

---

## What is not in this file

311 is how a resident files a request. A Code Enforcement ticket is written to a property owner. Boston does not publish Cartegraph work orders on Analyze Boston.

| 311 (Session 1, 2025) | Requests | In the citation year chart? |
| --- | ---: | --- |
| Request for Pothole Repair | 11,064 | No — no repair log here |
| Requests for Street Cleaning | 20,917 | No |
| Improper Storage of Trash (Barrels) | 20,083 | No — overlap with code 1, different grain |
| CE Collection | 18,653 | No |
| Lights / signs family | 17,103 | No — lights here are a 2016 inventory |
| Snow family | 819 | No — sidewalk-snow tickets are a different file |

Citation y2025 n is **63,226**. 311 2025 requests are **276,093**. Do not add these columns.

---

## Grain

| Check | Result |
| --- | --- |
| Raw citation rows | 916,375 |
| Unique tickets (identity) | 807,528 |
| Volume after Void out | 807,282 |
| Exact-duplicate rows dropped | 386 |
| Tickets with more than one code | 100,993 |
| Tickets with both Closed and Open rows | 41 — not a status-history file |
| Void tickets excluded from volume | 246 |
| Null ticket_no rows (fell back to case_no) | 72 |
| Pre-2012 tickets (quality only) | 98,711 |
| 2025 raw rows vs tickets | 73,219 rows → 63,226 tickets |
| Leftover codes in table as Other | 7 codes / 912 tickets |
| 311 2025 requests vs citation 2025 | 276,093 ≠ 63,226 |

Year pill = unique tickets issued that year. Open caseload = latest status Open. Work zones = permits in the daily CIU report. Streetlights = 2016 points. 311 = resident requests. None of those n’s belong in citation `by_year`.
