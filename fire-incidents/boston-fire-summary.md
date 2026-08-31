# Boston Fire Department — incident analysis, 2012–2024

Written briefing from cleaned BFD primary incidents. Interactive charts and department/efficiency tables: [live page](https://dharit13.github.io/boston_public_data_analysis/fire/). Reproducible from `analyze_fire.py`, `timeline_areas.py`, and `timeline_fire_loss.py`.

**Headline:** We are busier. Boston is not burning more. Responses **+61%** since 2012. Fires **−34%**. Building fires **−28%**. Four in five 2024 runs were service calls or false alarms.

---

## 2024 at a glance

| | |
| --- | ---: |
| Boston primary incidents | 60,096 (164 a day) |
| Share that were fires | 6.2% |
| Fires | 3,716 |
| Building fires (NFIRS 111) | 354 |
| False alarms | 21,752 (36% of runs) |
| Public service (553) | 18,214 |
| Estimated loss, 2012–2024 | $572M |
| Years Dorchester led fires | 13 / 13 |

2025 is **not** a complete incident year. The extract has January–February, 1–10 March, and 19–31 December (11,480 Boston primaries on file). Do not annualize that into a 2025 total. January–February 2025 vs the same two months in 2024 is the fair comparison. Calendar **2025 payroll** is complete and is used on the Efficiency / OT tab.

---

## Demand is up. Fire is not what grew.

After a 2020 dip, volume climbed through 2024. Service calls nearly tripled. False alarms rose 77%. Fires are at a 13-year low.

| Category | 2012 | 2024 | Change |
| --- | ---: | ---: | ---: |
| All incidents | 37,290 | 60,096 | +61% |
| Service call share | 24.5% | 43.1% | +183% count |
| False alarm share | 32.9% | 36.2% | +77% count |
| Fire share | 15.0% | 6.2% | −34% count |
| Building fire (111) | 491 | 354 | −28% |
| Hazardous condition | 10.0% | 3.5% | −43% count |

### January–February 2025 vs 2024 (complete months only)

| Category | Jan–Feb 2024 | Jan–Feb 2025 | Change |
| --- | ---: | ---: | ---: |
| Boston primaries | 8,661 | 8,521 | −2% |
| Fires | 564 (6.5%) | 601 (7.1%) | +37 |
| False alarm | 3,159 (36.5%) | 3,187 (37.4%) | same mix |
| Service call | 3,677 (42.5%) | 3,373 (39.6%) | −8% |
| Public service (553) | 2,382 | 2,298 | −4% |
| Building fire (111) | 59 | 51 | −8 |

The mix did not change. The seats did (see overtime below).

---

## Thirteen years, one neighborhood

ZIP-mapped Dorchester (02121 Grove Hall, 02122, 02124, 02125) is **#1 for fires and for volume in every year 2012–2024**, and in every 2025 window on file.

| | |
| --- | ---: |
| Dorchester fires, 2012–2024 | 14,566 |
| Building fires | 1,519 (29% of Boston) |
| Estimated loss in Dorchester | $172M |
| Share of city runs / fires | 18% / 23% |

Fires there are falling (1,178 in 2012 → 830 in 2024). The **rank** is not. Districts 7, 8, and 12 are the fire-share districts. District 4 (Back Bay / Fenway / South End) is the volume district (10,737 runs in 2024, 5.6% fire).

---

## Cooking is the common fire. Building fire is the costly one.

Confined cooking (113) is **38,237** fires — **60%** of all fires, and **#1 in all 16 neighborhoods**. Those stay in the pan ($6.3M estimated loss). Building fires are **8%** of fires and **90%** of the dollars.

| Fire family | Fires 2012–2024 | Share | Est. loss |
| --- | ---: | ---: | ---: |
| Cooking / confined (mostly 113) | 40,841 | 64% | $6.3M |
| Outside trash / dumpster | 6,474 | 10% | $0.5M |
| Brush / grass / vegetation | 6,136 | 10% | $1.2M |
| Building / structure | 5,548 | 9% | $516M |
| Vehicle | 2,936 | 5% | $33M |

Cooking 3,319 → 2,174. Building 491 → 354. The rank never flipped. In 2024, 1,030 of 2,180 cooking fires were in multifamily housing.

### Building fires by neighborhood (code 111)

| Area | Building fires | Share | #1 years | Est. loss |
| --- | ---: | ---: | ---: | ---: |
| Dorchester | 1,519 | 29% | 13 of 13 | $162M |
| Roxbury | 509 | 10% | 0 | $36M |
| Allston-Brighton | 407 | 8% | 0 | $42M |
| Jamaica Plain | 348 | 7% | 0 | $15M |
| Downtown core | 336 | 6% | 0 | $29M |
| East Boston | 289 | 6% | 0 | $50M |

East Boston is 6% of count and ~10% of dollars. Dorchester never fell below 92 building fires in a year; no other area ever reached 54.

---

## What the houses actually run on (2024)

Top codes are not fires.

| Code | Type | Count |
| --- | --- | ---: |
| 553 | Public service | 18,214 |
| 745 | Alarm activation, no fire | 5,978 |
| 600 | Good intent, other | 4,117 |
| 743 | Smoke detector, no fire | 4,089 |
| 714 | Malicious false alarm | 2,821 |
| 554 | Assist invalid | 2,593 |
| 735 | Alarm malfunction | 2,358 |
| 113 | Cooking fire, confined | 2,180 |

Repeat false-alarm corridors: Commonwealth 02215 (215), Broadway 02127 (195), Huntington 02115 (191), Boylston 02116 (184). Peak **all-calls** is 11 a.m. Peak **fires** is 6–7 p.m. (cooking). Still in the hazard pile: 425 carbon monoxide incidents and 392 gas leaks.

---

## Loss

NFIRS estimated property plus contents — officer’s figure, not insurance. 18,380 incidents reported any dollars. **$572M** through 2024; plus $8.1M in 2025 on file (incomplete year). 2017 ($75M) is a few large building fires, not a new baseline.

Building fires (111) $514M (90%). Vehicle $33M. Cooking / confined $6.3M. Property (vs contents) is 84% of the $572M.

---

## Overtime and efficiency (2025 payroll)

There is no official “world’s most efficient fire department.” Tokyo, London, FDNY, and UK brigades that get praised for productivity do three things: send only the force the call type needs, stop going to unconfirmed commercial automatic alarms in daylight, and stop covering vacancies with overtime as the default.

| | |
| --- | ---: |
| BFD people, 2025 earnings | 1,805 (down from 1,919 in 2024) |
| Gross | $317M |
| Overtime | $49.9M (15.8% of BFD pay, 27% of city OT) |
| Injured pay | $16.0M |
| Median firefighter regular | $134k |
| People with some OT | 1,658 of 1,805 |
| People at $50k+ OT | 241 |

2025 retro is $0.1M — unlike 2024, this OT line is not mixed with contract catch-up. About 202 names left the 2024 file; 88 are new.

London’s published AFA rule (no auto-dispatch to unconfirmed commercial automatic fire alarms 07:00–20:30; always attend sleeping risk and any 999 that reports fire) cut ~10,000 attendances a year. Boston ordinance 11-5A.5 starts fines on the 4th malfunction in a half-year at $50 then $200 — too small to change a campus system. UK cost recovery is on the order of $560 per appliance-hour from the 4th commercial false alarm in 12 months.

**Hire into fire-share districts (7, 8, 9, 12), not into District 4 to chase alarms.** Change the dispatch rule there. 50 firefighters at regular (~$6.7M) vs the same hours on OT (~$10.1M) is about $3.4M less — only if they take seats that are today filled by callback.

---

## Decisions for the Mayor and Council

1. **Do not trade fire companies for the mix shift.** Building fires are down, not gone: 354 in 2024, $41.5M that year, $514M over 13 years. A 6% fire rate is not a staffing formula.
2. **Put a price on chronic automatic alarms.** 21,752 false alarms in 2024. Inspection, repair orders, escalating fees after repeated unintentional activations.
3. **Decide what public service belongs to Fire.** 18,214 code-553 runs plus 2,593 assist-invalid. Some is life-safety. Much is lockouts, water, and lift assists that 311, EMS, or a community team could take.
4. **Fund cooking-fire prevention first in Dorchester.** Then Roxbury, Allston-Brighton, and Mattapan — not a citywide pamphlet drop.

---

## What was cleaned

Five source files: 2012 and 2013 BFD extracts, the 2014–2025 open-data file, an updated extract that adds 19–31 December 2025, plus NFIRS incident-type and property-use lists. Kept: valid incident number, parseable date, three-digit incident type, non-negative loss under $50M.

| Quality check | Records |
| --- | ---: |
| Raw rows (all files) | 641,615 |
| Kept after cleaning | 631,890 |
| Dropped — invalid incident type | 9,706 |
| Dropped — duplicate incident + exposure | 19 |
| Primary incidents (exposure 0) | 631,585 |
| Boston geography used here | 628,291 |
| 2024 Boston primaries | 60,096 |
| 2025 Boston primaries on file | 11,480 |

2012–2013 neighborhood field is blank; geography is zip-mapped. City section “BO” was not used because it collapses Back Bay, Fenway, South End, and downtown. Boston EMS is a separate system. Estimated loss is not an audited total. 19–31 December 2025 uses different close codes, so mix tables use January–February only.

## Source

[Analyze Boston](https://data.boston.gov/) BFD incident files. Typical local names: `2012-bostonfireincidentopendata.csv`, `2013-bostonfireincidentopendata.csv`, `tmpm7euesbm.csv`, `incident-type-code-list.csv`, `property-use-code-list.csv`. See [README.md](README.md) to rerun the scripts.
