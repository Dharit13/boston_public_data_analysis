# Boston building permits — city briefing, 2006–2026 YTD

Written briefing from cleaned Analyze Boston Approved Building Permits and Zoning Board of Appeal Decisions. Interactive charts: [live page](https://dharit13.github.io/boston_public_data_analysis/building-permits/). Reproducible from `analyze_permits.py`.

**Headline:** Permit counts fell versus 2019. Declared valuation did not. Approved building permits were **36,801** in 2025 against **45,291** in 2019 (**−18.7%**). Declared valuation was **$12.46 billion** against **$11.09 billion** (**+12.4%**). Erect/New Construction is **210** of those permits. **Do not add ZBA (906) into the permit total.** **2020 is COVID.** **2026 is not a full year.** After-hours construction is not in this briefing.

---

## 2025 at a glance

| | |
| --- | ---: |
| Issued permits | 36,801 (100.8 a day) |
| vs 2019 | −18.7% (45,291 → 36,801) |
| Declared valuation | $12.46B (+12.4% vs $11.09B) |
| Total fees | $53.2M (−24.1% vs 2019 $70.1M) |
| Erect/New Construction | 210 of 36,801 |
| Peak issued hour | 3 p.m. (4,577) · quietest 7 a.m. (28) |
| 2026 YTD (through 29 Aug) | 24,086 (99.9 a day) |

---

## Fewer permits than 2019. More declared value.

Use **2019** as the last normal pre-COVID year, not 2020. Permits peaked at **45,291** in 2019 (124.1 a day). 2025 is 36,801 — 100.8 a day. Peak declared value was **2023 ($17.66 billion)**, not the peak-count year.

Permits fell **29.1%** in 2020 (45,291 → 32,112). Compare 2025 to 2019, then show 2020 as the shock.

2026 is not a full year. Issued permits in this dump run through **29 August 2026** (24,086 YTD, 99.9 a day). Do not annualize that figure.

### How the mix changed, 2019 → 2025

| Measure | 2019 | 2025 | Change |
| --- | ---: | ---: | ---: |
| Issued permits | 45,291 | 36,801 | −18.7% |
| Declared valuation | $11.09B | $12.46B | +12.4% |
| Total fees | $70.1M | $53.2M | −24.1% |
| Erect/New Construction | — | 210 | 0.57% of 2025 |
| ZBA dated cases (separate file) | 1,616 | 906 | −43.9% |

Do not add 906 into 36,801.

---

## Most 2025 permits are short-form and trades, not Erect/New Construction

Short Form Bldg Permit is **11,442** of 36,801 (**31.1%**). Electrical, plumbing, and gas add **16,553**. Erect/New Construction is **210 (0.57%)**. Occupancy is one City `occupancytype` code per permit, not nested unit counts: **1–2 family** is the code `1-2FAM` (**14,501** permits, 39.4%) but only **$797 million** of declared value (6.4%). **1–3 family** is `1-3FAM` (3,693). **1–4 family** is `1-4FAM` (1,181). **Multifamily** is `Multi` (4,480). A `1-2FAM` permit is not also counted as `1-3FAM` or `1-4FAM`. Commercial is `Comm` (9,924 permits and **$6.08 billion**, 48.8% of value).

---

## When permits were issued

`issued_date` hour is ISD issuance, **not** construction hours. After-hours construction is a different file (junk dates include 1753 and 2202) and is not in this briefing.

2025 peak is **3 p.m. (4,577)**. Quietest is **7 a.m. (28)**. **Tuesday** is heaviest (**8,115**). **Sunday** is lightest (**174**); Saturday is 309. Those weekend stamps are `issued_date` counts, not ISD public-counter days — do not read them as office-open days. October is the peak month (**3,879**); February is lightest (**2,415**).

---

## Place is ZIP, not a neighborhood field

Neighborhood is ZIP via the Fire `ZIP_NEIGHBORHOOD` map. **Dorchester is 02122 + 02124 + 02125 (4,779)**. Roxbury 02119 is a different map label and is outside the top 12.

| ZIP neighborhood | 2025 permits | What the map is |
| --- | ---: | --- |
| Dorchester | 4,779 | 02122 + 02124 + 02125 |
| Back Bay / Bay Village | 2,694 | 02116 + 02199 |
| Jamaica Plain | 2,275 | 02130 |
| Hyde Park | 2,263 | 02136 |
| West Roxbury | 2,208 | 02132 |
| Roslindale | 1,995 | 02131 |

Status as recorded, 2025: Closed **19,251** · Open **17,550**. Open = still valid; Closed = expired (City data dictionary), not “work finished.”

---

## ZBA is a different file

The Zoning Board of Appeal tracker has **16,394** rows; **16,392** have a usable date (submitted, then received, then final_decision_date). 2013 has **350** dated cases against **1,167** in 2014; the trend chart starts in 2014. 2025 is **906** against **1,616** in 2019. 2026 is **425** through 28 August.

Classified decisions (all dated cases with a recorded decision): Approved **13,074** · Denied **1,398** · Withdrawn **433** · Void **8**. **1,479** dated cases have no decision recorded. That pie is **not** all 16,392 dated cases.

---

## What these files are not

After-hours construction. 311. Fire. A complete 2026 calendar year. A “new buildings” count (use `permittypedescr` Erect/New Construction). A native neighborhood field (ZIP rollup). Nested occupancy buckets: `1-2FAM`, `1-3FAM`, `1-4FAM`, and `Multi` are mutually exclusive City codes, one per permit.
