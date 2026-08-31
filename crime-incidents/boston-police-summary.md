# Boston Police Department — incident analysis, 2016–2025

Written briefing from cleaned BPD RMS records (one incident per report number), plus the separate shootings, shots-fired, and gun-recovery files. Interactive charts: [live page](https://dharit13.github.io/boston_public_data_analysis/crime/). Reproducible from `analyze_crime.py`.

**Headline:** We are still busy. Boston is not more violent. Incidents **−8%** since 2016. Serious violence **−41%**. Shooting victims 190 (2019) → 120 (2025). **2020 is COVID** — fewer reports, more shootings. Do not use it as the before picture. D4 took the volume lead; **B2 still owns the guns.**

---

## 2025 at a glance

| | |
| --- | ---: |
| Unique incidents | 81,162 (222 a day) |
| Share that were serious violence | 2.7% |
| Shooting victims | 120 |
| Fatal shootings | 19 |
| Victims in B2 + B3 + C11 | 72% (84 of 120) |
| Investigate person + sick assist | 18,653 (23% of reports) |
| Shoplifting | 4,340 |
| BPD overtime (2025 earnings file) | $102M (56% of all city OT) |

2025 is the last **complete** incident year. 2026 through mid-August is on the Guns tab and must not be annualized yet.

---

## Demand recovered. Violence did not come back with it.

Use **2019** as the last normal pre-COVID year, not 2020. Volume fell 19% in 2020 because streets emptied, then climbed through 2025 and is still below 2016–2019. The tape filled with sick-assist, investigate-person, and shoplifting.

### 2019 (pre-COVID) · 2020 (COVID) · 2025

| Metric | 2019 | 2020 | 2025 | 2025 vs 2019 |
| --- | ---: | ---: | ---: | ---: |
| All incidents | 87,184 | 70,894 | 81,162 | −7% |
| Shooting victims | 190 | 274 | 120 | −37% |
| Shots fired | 825 | 1,209 | 604 | −27% |
| Serious violence | 3,341 | 2,634 | 2,213 | −34% |
| Verbal dispute | 3,583 | 1,448 | 1,743 | −51% |
| Drug incidents | 3,020 | 1,401 | 2,688 | −11% |
| Sick assist | 7,800 | 8,236 | 9,718 | +25% |

COVID took cars and disputes off the tape and put more gunfire on it.

### How the job changed, 2016 → 2025

| Category | 2016 | 2025 | Change |
| --- | ---: | ---: | ---: |
| All incidents | 87,994 | 81,162 | −8% |
| Non-crime service | 38.7% | 47.1% | +4,146 count |
| Investigate person | 5,773 | 8,935 | +55% |
| Sick assist | 6,568 | 9,718 | +48% |
| Violence (all) | 13.7% | 10.0% | −33% count |
| Serious violence | 3,756 | 2,213 | −41% |
| Shoplifting | 2,453 | 4,340 | +77% |
| Drug incidents | 3,293 | 2,688 | −18% |

Serious violence = homicide, sex offense, robbery, aggravated assault.

---

## The paper moved. The guns did not.

Roxbury (B2) led incident volume every year 2015–2022. In 2023, D4 (South End / Back Bay) took over — shoplifting on Boylston and Newbury. Gun violence never left B2, B3, and C11.

**72% of shooting victims, 2015–2025, were in Roxbury, Mattapan, or Dorchester** (1,623 of 2,250). That share was 80% in 2016 and 70% in 2025. D4 is now #1 for reports. It is not #1 for shootings (104 victims in 11 years).

| Year | #1 volume | Reports | #1 shootings |
| --- | --- | ---: | --- |
| 2016–2022 | B2 Roxbury | 9,929–13,833 | B2 every year |
| 2023 | D4 | 10,408 | B2 · 34 |
| 2024 | D4 | 11,319 | B2 · 35 |
| 2025 | D4 | 12,762 | B2 · 30 |

2025 D4 is 16% of city reports and 5% of shooting victims.

---

## Guns

Compare 2025 to **2019**, not to the 2020 spike (274 victims, 1,209 shots fired).

| District | Victims 2015–2025 | Share | Shots fired |
| --- | ---: | ---: | ---: |
| B2 Roxbury | 666 | 30% | 2,714 |
| B3 Mattapan | 573 | 25% | 2,503 |
| C11 Dorchester | 384 | 17% | 1,908 |
| E13 Jamaica Plain | 170 | 8% | 562 |
| E18 Hyde Park | 119 | 5% | 472 |
| D4 South End / Back Bay | 104 | 5% | 405 |
| A1 Downtown | 40 | 2% | 90 |

Core-district share of victims never fell below 66%. 2020 was 70% — same geography.

**Crime-gun recoveries did not fall with shootings.** ~590 crime guns a year (578 in 2016, 590 in 2025). Safeguard rose (178 → 281). Buybacks essentially stopped. The street is not disarmed — fewer of those guns are being fired at people.

Victims 2015–2025: Black or African American 1,742 (77%), White 382 (17%), male 1,999 (89%). Multi-victim flag on 31% of victim rows.

### 2026 year-to-date (do not annualize)

Through mid-August 2026: 86 shooting victims (13 fatal), 278 shots-fired, 362 crime guns recovered through 28 August.

---

## When officers are running (2025)

Total demand and violence both peak **4–5 p.m.**, not overnight. Quietest 4 a.m. Friday is heaviest; Sunday is lightest. October is the high month. Midnight (6,271) is mostly unknown-time dumps, not a real spike.

### Most frequent 2024 types

| Type | Count |
| --- | ---: |
| Sick assist | 8,833 |
| Investigate person | 7,705 |
| M/V leaving scene — property damage | 4,687 |
| Larceny shoplifting | 3,755 |
| Towed motor vehicle | 3,492 |
| Investigate property | 3,467 |
| Assault — simple | 3,265 |

2024 shoplifting streets: Boylston D4 634, Washington A1 353, Newbury D4 293. D4 held 1,291 of 3,755 (34%). B3 is 49% non-crime service and almost no shoplifting.

---

## Overtime and efficiency (2025 payroll)

Efficient departments do not run fewer officers in the gun districts. They run fewer wasted assignments: civilian/online volume crime, co-responders for sick/behavioral calls, and a relief pool instead of overtime as the default empty-seat filler.

| | |
| --- | ---: |
| BPD people, 2025 earnings | 3,094 |
| Gross | $534M |
| Overtime | $102M (19% of BPD pay, 56% of city OT) |
| Median | $179k |
| 2025 attrition (name match) | 18.8% |
| 2024 headcount (roster bulge) | 3,491 |

All 20 highest-paid 2025 city employees are BPD. OT did not fall in proportion to shootings.

If half of sick-assist leaves the sworn tape, that is on the order of 4,800 car-hours a year back — concentrated in B2/B3/C11 where shots still happen. D4 volume is a reason to change **how D4 takes the report**, not a reason to move bodies out of B2.

---

## Decisions for the Mayor and Council

1. **Do not trade B2 / B3 / C11 strength for D4 paper.** Shootings are down, not gone: 120 victims in 2025, 72% still in three districts. A 2.7% serious-violence rate is not a staffing formula.
2. **Take sick-assist and investigate-person off the sworn tape.** 18,653 of those two in 2025. Co-response, EMS, civilian report-takers.
3. **Treat Back Bay shoplifting as a retail problem.** Store security, civilian larceny teams, online reporting — not B2 overtime.
4. **Keep focused deterrence where the victims actually are.** B2, B3, C11, then E13. Crime-gun recoveries are still ~590 a year.

Do not “save” OT by thinning the gun districts. A smaller on-duty force in B2/B3/C11 means more callback, more overtime, and a slower first car.

---

## What we counted

| Quality check | Records |
| --- | ---: |
| Raw RMS rows (all files) | 947,034 |
| Unique incidents after collapse | 904,961 |
| 2015–2018 multi-offense incidents | 31,269 |
| 2015 (partial: 15 Jun–31 Dec) | 46,966 |
| 2016–2025 complete years | 806,206 |
| 2024 / 2025 incidents | 79,124 / 81,162 |
| 2026 YTD through mid-August | 51,789 |
| Shooting victims (separate file) | 2,250 |
| Shots-fired incidents | 9,533 |

2015–2018 files list one row per offense; we keep one incident and assign the most serious offense. 2019+ is already one row per incident. UCR Part and offense-group fields go blank after 2018, so mix is classified from description and code. Midnight hour is inflated by unknown times. Some high-count streets (Gibson St C11, Harrison Ave D4) include district / hospital reporting. Shootings are victims. Crime-gun recoveries are daily citywide totals, not geocoded.

## Source

[Analyze Boston](https://data.boston.gov/) crime incident reports, plus shooting / shots-fired / recovery extracts. Local download names and how to rerun: [README.md](README.md).
