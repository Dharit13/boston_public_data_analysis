# Boston Public Works (Code Enforcement tickets + snapshots), 2008–2026 YTD

Cleaned Analyze Boston Public Works Violations, Active Work Zones, Streetlight Locations, and Snow Emergency Routes. **The year chart is unique Code Enforcement tickets, not raw rows, not 311 requests, and not work orders.** Boston does not publish a Cartegraph work-order history on Analyze Boston. 2020 is COVID — not a baseline. **2026 is year-to-date** (through 1 September), not a 13th bar. Work zones, streetlights (2016 inventory), and snow routes are snapshots — do not mix them into citation `by_year`.

Headline: the live Public Works **event** dump is tickets, mostly trash storage. 2025 tickets **63,226** vs **46,214** in 2019 (**+36.8%**). Trash storage is on **50,587** of those tickets (**80.0%**). Open caseload is **116,431** — a separate snapshot.

**Live briefing:** [https://dharit13.github.io/boston_public_data_analysis/public-works/](https://dharit13.github.io/boston_public_data_analysis/public-works/)

**Written summary:** [boston-public-works-summary.md](boston-public-works-summary.md)

## 2025 headline

| | |
| --- | ---: |
| Unique tickets issued | 63,226 (173.2 a day) |
| vs 2019 tickets | +36.8% (46,214 → 63,226) |
| Trash-storage family | 50,587 of 63,226 (80.0%) |
| Code 1, improper storage trash: res | 39,697 |
| Assessed fines | $4.05 million |
| Open caseload (snapshot) | 116,431 |
| 2026 YTD (through 1 Sep) | 44,684 (183.1 a day) |
| Active work-zone permits (1 Sep 2026) | 810 (907 locations) |

Do **not** add 63,226 tickets + 11,064 pothole-repair requests + 810 work-zone jobs. Neighborhood on the citation chart is ZIP via the Fire ZIP map — Dorchester is 02122+02124+02125.

## What’s on the live page

1. **Summary** — five findings; 311 overlap table
2. **Overview** — ticket year series, families, codes, fines, open caseload
3. **Place** — 2025 issued tickets by neighborhood and street name (not a career list)
4. **Clock** — `status_dttm` hour, weekday, month
5. **Construction** — work-zone snapshot, 2016 streetlights, snow routes
6. **Quality** — collapse grain, leftover codes, clock isolation

## Files in this folder

| File | Role |
| --- | --- |
| [boston-public-works-summary.md](boston-public-works-summary.md) | Full written findings |
| `analyze_public_works.py` | Collapse citations + snapshots → `outputs/pw_stats.json` |
| `audit_pw_dump.py` | Dump audit (`pw_dump_audit.json`) |
| `build_pw_code_table.py` | Generated `pw_code_table.json` from dump clusters |
| `test_analyze_public_works.py` / `test_audit_pw_dump.py` | Unit tests (`python3 -m unittest`) |
| `common.py` | Download skip-if-exists, date parse, ZIP neighborhood map |
| [canvases/boston-public-works.canvas.tsx](canvases/boston-public-works.canvas.tsx) | Original Cursor canvas |

```bash
# default input dir is ~/Downloads; override with BOSTON_DATA_DIR
python3 analyze_public_works.py
```

Outputs go to `./outputs` (or `$BOSTON_ANALYSIS_OUT`). Python 3 standard library only.

## Source files (not in this repo)

Analyze Boston datasets. Scripts look for:

| File | Dataset |
| --- | --- |
| `pw-code-enforcement-violations.csv` | Public Works Violations (`90ed3816-5e70-443c-803d-9a71f44470be`) |
| `pw-active-work-zones.csv` | Public Works Active Work Zones (`36fcf981-e414-4891-93ea-f5905cec46fc`) |
| `pw-streetlight-locations.csv` | Streetlight Locations (`c2fcc1e3-c38f-44ad-a0cf-e5ea2a6585b5`) |
| `pw-snow-emergency-routes.csv` | Snow Emergency Routes (`a7a4ca31-f0fe-451d-be73-89fcc52ea0d2`) |

## Cleaning rules (short)

Drop exact-duplicate citation rows (same ticket/case, code, status, `status_dttm`, value). Volume is unique `ticket_no` (fallback `case_no`) after Void is removed. Issue year is `min(status_dttm)` per ticket. Open caseload is latest status Open — never added into `by_year`. Families come from `pw_code_table.json`, not a regex. Work zones collapse to `Permit`. Streetlights are a 2016 inventory, not outages. Complete citation years are 2012–2025. Dump span: citations 2008-06-14 to 2026-09-01.

| Check | Count |
| --- | ---: |
| Citation rows raw / unique tickets (identity) | 916,375 / 807,528 |
| Volume after Void out | 807,282 |
| Exact-duplicate rows dropped | 386 |
| 2025 raw rows → tickets | 73,219 → 63,226 |
| Open caseload | 116,431 |
| Active work-zone permits / locations | 810 / 907 |
| Streetlight points (2016) | 74,065 |
