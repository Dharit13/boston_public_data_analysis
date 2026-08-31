# City of Boston employee earnings, 2015–2025

One-page writeup of the cleaned 11-year payroll files. Re-audited 28 August 2026 against the source reports (257,457 rows). Dollars are calendar-year **gross**, not W-2 wages, FTE, or budget appropriations. There is **no employee ID**; people are matched on a normalized name.

**2025 headline:** $2.46B gross · 25,397 people · $90.6k median · $183M overtime.

Education (combined teaching), Police, and Fire are **79% of 2025 payroll**. Treat **2024** as a contract-catch-up year, not a new normal.

---

## Citywide, 2015 → 2025

| Metric | 2015 | 2025 | Change |
| --- | ---: | ---: | ---: |
| People | 21,902 | 25,397 | +16% |
| Gross payroll | $1.55B | $2.46B | +58% |
| Payroll in 2024 dollars (CPI-U) | $2.05B | $2.41B | +17% |
| Median gross | $67.2k | $90.6k | +35% |
| Overtime | $102M | $183M | +79% |
| Share earning ≥ $200k | — | 7.6% | 3.3% in 2023; 9.1% in 2024 |
| Education people | 11,121 | 12,806 | +15% |
| Education payroll | $670M | $1.09B | +63% |
| Police median | $121k | $179k | +48% |

Real (inflation-adjusted) payroll was essentially **flat from 2019 through 2023**, then stepped up with 2024 contracts. Nominal growth over the decade is mostly that late jump plus headcount.

### Year by year

| Year | People | Payroll | Median | Overtime | Retro |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2015 | 21,902 | $1.55B | $67.2k | $102M | $0.1M |
| 2016 | 22,046 | $1.58B | $66.1k | $100M | $21M |
| 2017 | 22,245 | $1.59B | $66.2k | $107M | $9M |
| 2018 | 23,605 | $1.72B | $66.3k | $120M | $30M |
| 2019 | 23,312 | $1.80B | $70.8k | $127M | $34M |
| 2020 | 21,858 | $1.82B | $78.9k | $127M | $0.4M |
| 2021 | 22,546 | $1.87B | $78.4k | $131M | $7M |
| 2022 | 23,204 | $1.93B | $79.2k | $141M | $9M |
| 2023 | 25,812 | $2.14B | $79.5k | $153M | $51M |
| 2024 | 25,530 | $2.42B | $84.0k | $177M | $114M |
| 2025 | 25,397 | $2.46B | $90.6k | $183M | $33M |

2020 is the COVID roster: people −6.2%, paid details down, median up because more of the remaining jobs were full-time. 2024 is the retro spike (see below).

### What a 2025 paycheck is made of

Regular wages are about **83%** of 2025 gross ($2.03B). The rest:

| Component | 2025 |
| --- | ---: |
| Regular | $2.026B |
| Overtime | $183M |
| Paid detail | $79M |
| Other (settlements, buyouts, unused leave) | $66M |
| Quinn / education incentive | $35M |
| Injured | $33M |
| Retro | $33M |

---

## Where the money goes (2025)

After rolling teaching into one **Education** department, **85** canonical departments remain.

| Department | People | Payroll | Share of city pay | Median | OT % of dept pay |
| --- | ---: | ---: | ---: | ---: | ---: |
| Education (teaching rollup) | 12,806 | $1.09B | 44.6% | $92.5k | ~0% |
| Boston Police Department | 3,094 | $534M | 21.8% | $179k | 19% |
| Boston Fire Department | 1,805 | $317M | 12.9% | $175k | 16% |
| Boston Public Library | 556 | $39M | 1.6% | $72k | 2% |
| Facilities Management | 609 | $38M | 1.5% | $64k | 5% |
| Public Works Department | 401 | $33M | 1.4% | $75k | **27%** |
| Traffic Division | 411 | $28M | — | $68k | 12% |
| Transportation (BPS cab monitors) | 761 | $26M | — | $34k | 8% |
| Boston Cntr - Youth & Families | 460 | $23M | — | $51k | 2% |
| Parks Department | 396 | $23M | — | $55k | 12% |
| All other (75 departments) | — | ~$510M | 21% | — | — |

**Education + Police + Fire = 79% of dollars.** Police + Fire are 19% of people and 35% of pay.

### Education

Education is every school site, Teaching & Learning, Special Education, adult/alternative education, substitutes, and related instructional BPS shops — **144 units**. Food & Nutrition, Transportation, Facilities, and BPS police stay **outside** that rollup.

- 12,806 people, $1.09B, median $92.5k, almost no overtime.
- 5,368 **Teachers**: $592M, median **$123k** (42% of Education people, 54% of Education pay).
- Other large titles: Paraprofessional (1,541, median $55k), Lunch Hour Monitors, substitutes, One-to-One Paras, social workers, instructional coaches, SLPs, nurses.

The city’s **Transportation** row is not the MBTA. It is mostly BPS `Cab Monitor` / `Cab Monitor HE` (682 of 761 people), which is why the median is $33.7k. MBTA is a state authority and is **not on these files**. Public MBTA 2025 figures sit near a ~$90–92k median, in line with the citywide median, not with BPS cab monitors.

### Police and Fire

- BPD: 3,094 people, $534M, median $179k, OT $102M (19% of BPD pay, 55% of city OT). 41% of BPD earn ≥ $200k.
- BFD: 1,805 people, $317M, median $175k, OT $50M (16% of BFD pay, 27% of city OT).
- Together they write **83%** of the $183M overtime check.
- **All 20 highest-paid 2025 employees are BPD.** Regular pay is $145–194k; overtime, paid detail, and Quinn push totals to $420–498k. Top: Connolly, Timothy, Police Captain/DDC, $498,145.

Median gross by inferred role (groups with ≥50 people): police lieutenant $312k · fire chief+ $289k · police sergeant $268k · fire company officer $218k · detective $213k · police officer $182k · firefighter $166k · educator $97k · nurse $66k.

---

## Hires, attrition, tenure

A “new hire” is a normalized name on this year’s city file that was not on last year’s. Attrition is the reverse. Returning after a gap counts as a hire (248 of 2,985 in 2025). Marriage, spelling, and remaining department-name changes inflate both rates. Substitutes, food service, and BPS Transportation are seasonal churn, not career turnover.

### Citywide

| Year | New names | Left | Hire rate | Attrition | Replacement (new / left) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2016 | 2,564 | 2,411 | 11.7% | 11.1% | 1.06 |
| 2017 | 2,532 | 2,326 | 11.4% | 10.6% | 1.09 |
| 2018 | 2,821 | 1,462 | 12.0% | 6.6% | 1.93 |
| 2019 | 2,740 | 3,033 | 11.8% | 12.9% | 0.90 |
| 2020 | 1,753 | 3,194 | 8.0% | 13.8% | 0.55 |
| 2021 | 2,689 | 2,003 | 12.0% | 9.2% | 1.34 |
| 2022 | 3,160 | 2,495 | 13.7% | 11.1% | 1.27 |
| 2023 | 4,131 | 1,525 | 16.1% | 6.6% | 2.71 |
| 2024 | 3,731 | 4,017 | 14.7% | 15.6% | 0.93 |
| 2025 | 2,985 | 3,112 | 11.8% | 12.2% | 0.96 |

2020 is the only year attrition far exceeded hiring. 2018 and 2023 look like expansion (partly more school/seasonal names on the file). 2025 is roughly in balance.

2025 by shop (selected): Education 1,415 new / 1,299 left, 10.3% attrition; Police 253 / 652, 18.8% after the 2024 roster bulge; Fire 73 / 192, 10.0%; Food & Nutrition 128 new, 19.2% hire rate.

### Tenure

Of **21,793** unique 2015 names, **10,240 (47%)** are still on the 2025 file. **9,733** appear in **all 11 years**: 38% of 2025 unique names and **52% of 2025 pay**. The other 15,081 people on the 2025 file were not on the 2015 file.

2015 cohort still on payroll: 100% (2015) → 89% → 82% → 78% → 72% → 65% (2020) → 61% → 57% → 55% → 52% → **47% (2025)**. About 5–8 percentage points drop per year, steeper in 2020.

Retention of the 2015 roster (still employed anywhere in the city, not necessarily the same department): Fire 65% · Police 55% · Facilities 53% · Education 45%.

---

## Where 2025 employees live

25,376 of 25,397 rows have a ZIP. **67%** live in Boston proper (not 69% — corrected on re-audit). Quincy (02169 / 02170 / 02171) is the largest suburb at **629**.

| Neighborhood | ZIPs | Employees | Share of known ZIPs |
| --- | --- | ---: | ---: |
| Dorchester | 02121, 02122, 02124, 02125 | 5,097 | 20.1% |
| Hyde Park | 02136 | 1,873 | 7.4% |
| West Roxbury | 02132 | 1,403 | 5.5% |
| Roslindale | 02131 | 1,267 | 5.0% |
| Roxbury | 02119, 02120 | 1,144 | 4.5% |
| Jamaica Plain | 02130 | 1,001 | 3.9% |
| East Boston | 02128 | 964 | 3.8% |
| Allston-Brighton | 02134, 02135, 02163 | 947 | 3.7% |
| Mattapan | 02126 | 940 | 3.7% |
| South Boston / Seaport | 02127, 02210 | 860 | 3.4% |

### Pay concentration (2025)

| Slice | Share of payroll |
| --- | ---: |
| Top 1% of earners | 3.6% |
| Top 10% | 24.7% |
| Bottom 50% | 22.1% |
| Approx. Gini | 0.39 |

The top tenth takes more payroll than the entire bottom half. That is a workforce that mixes $30k part-time school jobs with $300k police lieutenants — not a finance-industry Gini.

---

## Overtime and top pay

Overtime grew **79%** from 2015 to 2025, faster than headcount (+16%) and total payroll (+58%).

- City OT 2025: **$183M**. Police $102M + Fire $50M = **83%**.
- Public Works has the **highest OT intensity** (27% of that department’s pay) but only $9M of dollars.
- **93** people had overtime **above regular pay** (the old “80” used an unpublished $50k OT floor).
- Paid details 2025: **$79M** (mostly police; city detail $36M → $62M → $79M across 2023–25).

Police overtime and detail both jump in 2024 with the retro year; police median $142k (2023) → $175k (2024) → $179k (2025). Police headcount 3,011 → **3,491** → 3,094 — treat the 2024 count as an outlier, not a permanent hiring wave.

### Top individual earners, 2025

Citywide top 20 are **all Boston Police**. #1 is Connolly, Timothy, Police Captain/DDC, **$498,145** (regular $194k + OT $229k + Quinn $49k). Ranked lists for every department and school site are on the canvas: Departments → Top earners.

| Rank | Name | Title | Department / unit | Total |
| ---: | --- | --- | --- | ---: |
| 1 | Connolly, Timothy | Police Captain/DDC | Police | $498,145 |
| 2 | Demesmin, Stanley | Police Lieutenant (Det) | Police | $490,239 |
| 3 | Hegarty, Michael J | Police Captain/DDC | Police | $488,434 |
| 4 | Danilecki, John H | Police Captain | Police | $485,534 |
| 5 | Lanchester, Wayne | Police Captain/DDC | Police | $479,062 |

**Education** (combined teaching) tops out lower, and is almost all regular pay:

| Rank | Name | Title | Unit | Total |
| ---: | --- | --- | --- | ---: |
| 1 | Skipper, Mary E | Superintendent | Superintendent's Office | $377,789 |
| 2 | Freeman-Wisdom, Tanya N | Chief of Schools | School Support | $237,214 |
| 3 | Tavares, Ana I | Deputy Superintendent | Family & Community Advancement | $232,459 |
| 4 | Walker Gregory, Caren S | Head of School | Kennedy Academy Health Careers | $224,355 |
| 5 | Weeks, Kristen M. | Elementary Superintendent | School Support | $218,636 |

**Fire** #1 is Osgood, Troy T, Fire Lieutenant Administration, **$373,465**. **Library** #1 is Leonard, David J, President, **$240,001**. **Public Works** #1 is Parks, Norman, Chief Engineer, **$313,131** (OT-heavy shop).

**Lump “other” payments are not salary.** Two 2021 police officers show ~$1.25M each in OTHER and $0 regular. Other large OTHER rows include 2022 Gavin ($1.05M other), 2018 Williams ($503k), 2024 Sordillo / Calobrisi, 2018 Chang. Do not put these on “highest paid” lists without context.

---

## 2024 is not the new baseline

| | 2023 | 2024 | 2025 |
| --- | ---: | ---: | ---: |
| Retro | $51M | **$114M** | $33M |
| Share ≥ $200k | 3.3% | **9.1%** | 7.6% |
| Police headcount | 3,011 | **3,491** | 3,094 |
| Police payroll | $417M | $578M | $534M |
| Paid detail (city) | $36M | $62M | $79M |

Year-over-year “raises” that run through 2024 overstate the underlying trend.

---

## Department names, 2015 vs 2025

A dash in 2015 is not automatically “the department did not exist.” After combining teaching:

| Status | Count | Notes |
| --- | ---: | --- |
| Same name | 44 | Police, Fire, Library, etc. |
| Renamed / successor | 18 | Official rebrands plus punctuation / BPS prefix fold |
| New on 2025 file | 23 | e.g. Planning (BPDA staff onto city payroll, 2024) |
| Closed or unmatched 2015 | 6 | Mostly closed schools, plus Chief Operating Officer |

Documented successors include: Elderly Commission → Age Strong (2019); Neighborhood Development → Office of Housing (2021); BPS School Safety → Safety Services (2021); Facility Management → Facilities Management; Food & Nutrition Svc → Food & Nutrition Services; Office of New Bostonians → Immigrant Advancement; ASD Purchasing → Procurement; Licensing Board → Consumer Affairs & Licensing.

Through 2021 most school units are prefixed `BPS `; from 2023 the prefix is mostly gone. Time series use the 2025 name after dropping that prefix.

---

## Cleaning and audit

Eleven files (ten CSVs plus the 2023 workbook). The 2022 file is `finalconsolidatedcy22earnings_feb2023.xlsx-sheet1.csv`. The 2024 path was listed twice and loaded once.

| Year | Rows | Encoding | ZIP blanks | Total ≠ parts | Name dupes | Lump (no regular, ≥$200k) |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| 2015 | 21,902 | UTF-8 | 17 | 0 | 4 | 1 |
| 2016 | 22,046 | Windows-1252 | 22 | 0 | 4 | 0 |
| 2017 | 22,245 | UTF-8 | 49 | 0 | 4 | 1 |
| 2018 | 23,605 | Windows-1252 | 2 | 0 | 5 | 3 |
| 2019 | 23,312 | UTF-8 | 0 | 0 | 5 | 3 |
| 2020 | 21,858 | Windows-1252 | 93 | 115 (>$1) | 4 | 2 |
| 2021 | 22,546 | Windows-1252 | 1 | 0 | 6 | 9 |
| 2022 | 23,204 | UTF-8 | 0 | 0 | 3 | 5 |
| 2023 | 25,812 | xlsx | 63 | 0 | 2 | 2 |
| 2024 | 25,530 | UTF-8 | 31 | 1 | 5 | 7 |
| 2025 | 25,397 | UTF-8 | 21 | 1 | 3 | 5 |

**2020 is the messiest file:** 93 missing ZIPs, 115 rows where published total disagrees with the sum of parts by more than $1 (45 of those by more than $100), and a non-breaking space that is not valid UTF-8. Published totals were kept unless total was blank.

Column names were not stable (`TOTAL EARNINGS` vs `TOTAL GROSS`; four Quinn spellings; `DETAILS` vs `DETAIL`; padded headers). Money used four formats (dollar sign, commas, Excel dashes, accounting parentheses). 2017 stored some ZIPs as integers, dropping the leading zero; all were padded to five digits.

**Re-audit (28 Aug 2026):** citywide series, Education rollup (144 instructional units), hire/attrition, tenure, pay mix, and Police series match the canvas. Two labels were corrected: OT above regular pay is **93** people; Boston-proper ZIP share is **67%**.

---

## What this data cannot support

These files are calendar-year gross rows. A person who worked 3 months and a person who worked 12 months both appear as one row. Overtime **hours** are not reported — only dollars — so a high OT check can mean high rates, high hours, or both. “Other” is a junk drawer. 2024’s retro spike will distort any naive year-over-year raise. MBTA pay is a different employer and is not in this dataset.

---

## Source files (Downloads)

| Year | File |
| --- | --- |
| 2015 | `employee-earnings-report-2015.csv` |
| 2016 | `employee-earnings-report-2016.csv` |
| 2017 | `employee-earnings-report-2017.csv` |
| 2018 | `employeeearningscy18full.csv` |
| 2019 | `allemployeescy2019_feb19_20final-all.csv` |
| 2020 | `city-of-boston-calendar-year-2020-earnings.csv` |
| 2021 | `employee-earnings-report-2021.csv` |
| 2022 | `finalconsolidatedcy22earnings_feb2023.xlsx-sheet1.csv` |
| 2023 | `employee-earnings-report-2023.xlsx` |
| 2024 | `employee_earnings_report_2024.csv` |
| 2025 | `employee-earnings-report-2025.csv` |

Inflation uses BLS CPI-U; 2025 CPI is an approximate annualized figure (~320).

**Live briefing (charts, every-department tables, top earners):** [https://dharit13.github.io/boston_public_data_analysis/earnings/](https://dharit13.github.io/boston_public_data_analysis/earnings/). Project README: [README.md](README.md). Original Cursor canvas: `canvases/boston-employee-earnings.canvas.tsx` (does not render on GitHub).
