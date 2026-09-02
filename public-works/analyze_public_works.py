#!/usr/bin/env python3
"""Collapse Code Enforcement tickets and produce a Public Works briefing."""
from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

from audit_pw_dump import (
    CITATION_CSV,
    CITATION_ID,
    LIGHT_CSV,
    LIGHT_ID,
    SNOW_CSV,
    SNOW_ID,
    WORKZONE_CSV,
    WORKZONE_ID,
    _norm_cat,
    citation_identity,
    exact_dup_key,
)
from build_pw_code_table import TABLE_PATH, family_for_code
from common import OUT, ZIP_NEIGHBORHOOD, download_dump, parse_dt, strip_null

REPO = Path(__file__).resolve().parent
COMPLETE_YEARS = list(range(2012, 2026))
YEAR_MIN = 2008
YEAR_MAX = 2026

QUALITY_NOTE = (
    "The live Public Works event file is Code Enforcement tickets, not work "
    "orders and not 311 requests. Collapse exact-duplicate rows; one ticket "
    "can carry two codes. Volume is unique tickets after Void is removed. "
    "Issue year is min(status_dttm). Open caseload is a separate snapshot and "
    "must not be added into a year-pill street list. 2020 is COVID — not a "
    "baseline. 2026 is year-to-date through the dump max date. Work zones and "
    "streetlight points are snapshots, not a year series. Streetlight Locations "
    "is a 2016 inventory; outages are 311. Traffic signals are BTD, not DPW. "
    "Boston does not publish Cartegraph work-order history on Analyze Boston. "
    "Do not add 311 counts into citation by_year."
)

OVERLAP_311_DEFAULT = {
    "caption": (
        "311 is resident requests. This briefing’s year chart is Code Enforcement "
        "tickets. Pothole repair requests, streetlight outages, and most snow work "
        "are not in the citation file. Boston does not publish Cartegraph work orders "
        "on Analyze Boston."
    ),
    "y2025_pothole_repair_requests": 11064,
    "y2025_improper_trash_storage_requests": 20083,
    "y2025_ce_collection_requests": 18653,
    "y2025_street_cleaning_requests": 20917,
    "y2025_lights_signs_family": 17103,
    "y2025_snow_family": 819,
    "y2025_n": 276093,
    "source": "311_briefing_stats.json Session 1",
}


def parse_fine(raw: str) -> float:
    text = strip_null(raw)
    if text == "":
        return 0.0
    text = text.replace("$", "").replace(",", "")
    try:
        return float(text)
    except ValueError:
        return 0.0


def zip5_of(raw: str) -> str:
    digits = "".join(ch for ch in strip_null(raw) if ch.isdigit())
    if len(digits) >= 5:
        return digits[:5]
    if len(digits) == 4:
        return digits.zfill(5)
    return ""


def _load_table() -> list[dict]:
    if TABLE_PATH.is_file():
        return json.loads(TABLE_PATH.read_text())
    sample = REPO / "fixtures" / "pw_code_table_sample.json"
    if sample.is_file():
        return json.loads(sample.read_text())
    return []


_TABLE = _load_table()


def family_of(code: str, description: str) -> str:
    return family_for_code(code, description, _TABLE)


def _overlap_311() -> dict:
    facts = dict(OVERLAP_311_DEFAULT)
    path = OUT / "311_briefing_stats.json"
    if not path.is_file():
        return facts
    stats = json.loads(path.read_text())
    y2025 = stats.get("y2025") or {}
    if y2025.get("n") is not None:
        facts["y2025_n"] = y2025["n"]
    types = {row["label"]: row["value"] for row in stats.get("top_types_2025") or [] if row.get("label")}
    families = {row["label"]: row["value"] for row in stats.get("families_2025") or [] if row.get("label")}
    mapping = {
        "y2025_pothole_repair_requests": "Request for Pothole Repair",
        "y2025_improper_trash_storage_requests": "Improper Storage of Trash (Barrels)",
        "y2025_ce_collection_requests": "CE Collection",
        "y2025_street_cleaning_requests": "Requests for Street Cleaning",
    }
    for key, label in mapping.items():
        if label in types:
            facts[key] = types[label]
    if "Lights / signs" in families:
        facts["y2025_lights_signs_family"] = families["Lights / signs"]
    if "Snow" in families:
        facts["y2025_snow_family"] = families["Snow"]
    facts["source"] = "311_briefing_stats.json Session 1"
    return facts


def _days_in_year(year: int) -> int:
    leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    return 366 if leap else 365


def _per_day(n: int, year: int, last: str) -> float:
    if not n:
        return 0.0
    if year >= 2026 and last:
        end = date.fromisoformat(last)
        span = (end - date(year, 1, 1)).days + 1
        return round(n / max(span, 1), 1)
    return round(n / _days_in_year(year), 1)


def _top(counter: Counter, n: int = 12) -> list[dict]:
    return [{"label": k, "value": v} for k, v in counter.most_common(n) if k]


def _in_span(dt: datetime) -> bool:
    return YEAR_MIN <= dt.year <= YEAR_MAX


def load_citations(path: Path) -> tuple[list[dict], list[dict], dict]:
    quality: Counter = Counter()
    seen_dup: set[tuple] = set()
    grouped: dict[str, list[dict]] = defaultdict(list)
    first = last = None
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["citation_raw"] += 1
            ident = citation_identity(raw)
            if not ident:
                quality["citation_no_id"] += 1
                continue
            key = exact_dup_key(raw)
            if key in seen_dup:
                quality["citation_exact_dup"] += 1
                continue
            seen_dup.add(key)
            grouped[ident].append(raw)
    tickets: list[dict] = []
    charges: list[dict] = []
    for ident, rows in grouped.items():
        statuses = [strip_null(r.get("status")) for r in rows]
        if any(s.lower() == "void" for s in statuses):
            quality["void_tickets"] += 1
            continue
        dated: list[tuple[datetime, dict]] = []
        for row in rows:
            dt = parse_dt(row.get("status_dttm", ""))
            if dt is None or not _in_span(dt):
                continue
            dated.append((dt, row))
        if not dated:
            quality["citation_drop"] += 1
            continue
        issued = min(dt for dt, _row in dated)
        latest_dt = max(dt for dt, _row in dated)
        latest_status = ""
        for dt, row in dated:
            status = strip_null(row.get("status"))
            if dt < latest_dt:
                continue
            if not latest_status or status.lower() == "open":
                latest_status = status
        if first is None or issued < first:
            first = issued
        if last is None or issued > last:
            last = issued
        by_code: dict[str, dict] = {}
        street = ""
        zip5 = ""
        for dt, row in dated:
            code = strip_null(row.get("code"))
            if code and code not in by_code:
                by_code[code] = row
            if not street:
                street = strip_null(row.get("violation_street"))
            if not zip5:
                zip5 = zip5_of(row.get("violation_zip", ""))
        families = []
        fine_total = 0.0
        seen_fam = set()
        for code, row in by_code.items():
            desc = strip_null(row.get("description"))
            family = family_of(code, desc)
            fine = parse_fine(row.get("value", ""))
            fine_total += fine
            charges.append({
                "ticket": ident,
                "year": issued.year,
                "code": code,
                "description": desc,
                "family": family,
                "fine": fine,
            })
            if family not in seen_fam:
                seen_fam.add(family)
                families.append(family)
        if issued.year < 2012:
            quality["pre2012"] += 1
        quality["citation_tickets"] += 1
        tickets.append({
            "ticket": ident,
            "year": issued.year,
            "month": issued.month,
            "hour": issued.hour,
            "weekday": issued.weekday(),
            "status": latest_status,
            "zip": zip5,
            "neighborhood": ZIP_NEIGHBORHOOD.get(zip5, ""),
            "street": street,
            "fine": round(fine_total, 2),
            "families": tuple(families),
        })
    out = dict(quality)
    if first is not None and last is not None:
        out["citation_min"] = first.date().isoformat()
        out["citation_max"] = last.date().isoformat()
    return tickets, charges, out


def load_workzones(path: Path) -> tuple[list[dict], dict]:
    quality: Counter = Counter()
    jobs: dict[str, dict] = {}
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["workzone_raw"] += 1
            permit = strip_null(raw.get("Permit") or raw.get("permit"))
            cat = _norm_cat(raw.get("Project_Category") or raw.get("project_category") or "")
            if not cat:
                cat = "Unspecified"
            nb = strip_null(raw.get("Neighborhood"))
            if permit and permit not in jobs:
                jobs[permit] = {
                    "permit": permit,
                    "category": cat,
                    "neighborhood": nb,
                    "street": strip_null(raw.get("Street")),
                    "status": strip_null(raw.get("Status")),
                }
            quality["workzone_cat_" + cat] += 1
    as_of = ""
    if path.is_file():
        as_of = datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()
    out = dict(quality)
    out["workzone_jobs"] = len(jobs)
    out["workzone_as_of"] = as_of
    return list(jobs.values()), out


def load_streetlights(path: Path) -> tuple[list[dict], dict]:
    quality: Counter = Counter()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["streetlight_raw"] += 1
            lat = strip_null(raw.get("Lat") or raw.get("lat"))
            lon = strip_null(raw.get("Long") or raw.get("Lon") or raw.get("long"))
            if lat and lon:
                quality["streetlight_n"] += 1
    return [], dict(quality)


def load_snow_routes(path: Path) -> tuple[list[dict], dict]:
    quality: Counter = Counter()
    names: set[str] = set()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["snow_raw"] += 1
            name = strip_null(raw.get("FULL_NAME"))
            if name:
                names.add(name)
    out = dict(quality)
    out["snow_named_segments"] = len(names)
    return [], out


def _year_slice(rows: list[dict], year: int, last: str) -> dict:
    n = len(rows)
    hours = Counter(r["hour"] for r in rows)
    peak = max(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    quiet = min(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    return {
        "n": n,
        "per_day": _per_day(n, year, last),
        "peak_hour": peak,
        "quiet_hour": quiet,
        "fines": round(sum(r["fine"] for r in rows), 2),
    }


def briefing_from_rows(
    tickets: list[dict],
    charges: list[dict],
    workzones: list[dict],
    lights: list[dict],
    quality: dict,
) -> dict:
    last = quality.get("citation_max") or ""
    y2019 = [r for r in tickets if r["year"] == 2019]
    y2020 = [r for r in tickets if r["year"] == 2020]
    y2025 = [r for r in tickets if r["year"] == 2025]
    y2026 = [r for r in tickets if r["year"] == 2026]
    year_n = Counter(r["year"] for r in tickets)
    by_year = [{"year": y, "n": year_n[y]} for y in COMPLETE_YEARS]

    fam_year: dict[int, Counter] = defaultdict(Counter)
    for charge in charges:
        if charge["year"] in COMPLETE_YEARS and charge["family"]:
            fam_year[charge["year"]][(charge["ticket"], charge["family"])] = 1
    fam_counts: dict[int, Counter] = defaultdict(Counter)
    for year, pairs in fam_year.items():
        for _ticket, family in pairs:
            fam_counts[year][family] += 1
    family_names = []
    overall = Counter()
    for year in COMPLETE_YEARS:
        overall.update(fam_counts[year])
    family_names = [name for name, _n in overall.most_common() if name]
    stacked_families = {
        "years": COMPLETE_YEARS,
        "series": [
            {"name": name, "data": [fam_counts[y][name] for y in COMPLETE_YEARS]}
            for name in family_names
        ],
    }

    charges_2025 = [c for c in charges if c["year"] == 2025]
    fam_2025 = Counter()
    seen_tf: set[tuple[str, str]] = set()
    for c in charges_2025:
        key = (c["ticket"], c["family"])
        if c["family"] and key not in seen_tf:
            seen_tf.add(key)
            fam_2025[c["family"]] += 1
    codes_2025 = Counter((c["code"], c["description"]) for c in charges_2025)
    fine_fam = Counter()
    for c in charges_2025:
        fine_fam[c["family"]] += c["fine"]

    open_rows = [r for r in tickets if r["status"].lower() == "open"]
    wz_cat = Counter(w["category"] for w in workzones)
    wz_nb = Counter(w["neighborhood"] for w in workzones)
    as_of = quality.get("workzone_as_of") or ""
    light_n = quality.get("streetlight_n") or len(lights)
    snow_n = quality.get("snow_raw") or 0

    quality_out = dict(quality)
    quality_out["note"] = QUALITY_NOTE

    n19 = len(y2019)
    n25 = len(y2025)
    return {
        "quality": quality_out,
        "date_span": {
            "min": quality.get("citation_min") or "",
            "max": quality.get("citation_max") or "",
        },
        "years": COMPLETE_YEARS,
        "by_year": by_year,
        "stacked_families": stacked_families,
        "y2019": _year_slice(y2019, 2019, last),
        "y2020": _year_slice(y2020, 2020, last),
        "y2025": _year_slice(y2025, 2025, last),
        "y2026_ytd": _year_slice(y2026, 2026, last),
        "hour_2025": [Counter(r["hour"] for r in y2025).get(h, 0) for h in range(24)],
        "weekday_2025": [Counter(r["weekday"] for r in y2025).get(d, 0) for d in range(7)],
        "month_2025": [Counter(r["month"] for r in y2025).get(m, 0) for m in range(1, 13)],
        "neighborhoods_2025": _top(Counter(r["neighborhood"] for r in y2025), 12),
        "streets_2025": _top(Counter(r["street"] for r in y2025), 12),
        "families_2025": _top(fam_2025, 12),
        "top_codes_2025": [
            {"code": code, "description": desc, "n": n}
            for (code, desc), n in codes_2025.most_common(12)
        ],
        "fines_2025": {
            "total": round(sum(r["fine"] for r in y2025), 2),
            "by_family": [
                {"label": k, "value": round(v, 2)}
                for k, v in fine_fam.most_common()
                if k
            ],
        },
        "open_caseload": {
            "n": len(open_rows),
            "neighborhoods": _top(Counter(r["neighborhood"] for r in open_rows), 8),
        },
        "workzones": {
            "jobs": len(workzones),
            "locations": quality.get("workzone_raw") or 0,
            "as_of": as_of,
            "categories": _top(wz_cat, 12),
            "neighborhoods": _top(wz_nb, 12),
        },
        "streetlights": {
            "n": light_n,
            "vintage_caption": (
                "Streetlight Locations last modified 2016-12-11. City-owned "
                "inventory points, not outages. Outages are 311."
            ),
        },
        "snow_routes": {
            "n": snow_n,
            "named_segments": quality.get("snow_named_segments") or 0,
            "grain": "Named snow-emergency route segment, not a plow run.",
        },
        "overlap_311": _overlap_311(),
        "vs_2019": {
            "n2019": n19,
            "n2025": n25,
            "tickets_pct": round(100.0 * (n25 - n19) / n19, 1) if n19 else 0.0,
        },
    }


def main() -> None:
    print(f"fetch {CITATION_CSV.name}", flush=True)
    download_dump(CITATION_ID, CITATION_CSV)
    print(f"fetch {WORKZONE_CSV.name}", flush=True)
    download_dump(WORKZONE_ID, WORKZONE_CSV)
    print(f"fetch {LIGHT_CSV.name}", flush=True)
    download_dump(LIGHT_ID, LIGHT_CSV)
    print(f"fetch {SNOW_CSV.name}", flush=True)
    download_dump(SNOW_ID, SNOW_CSV)
    tickets, charges, q = load_citations(CITATION_CSV)
    workzones, wq = load_workzones(WORKZONE_CSV)
    lights, lq = load_streetlights(LIGHT_CSV)
    _snow, sq = load_snow_routes(SNOW_CSV)
    briefing = briefing_from_rows(tickets, charges, workzones, lights, {**q, **wq, **lq, **sq})
    dest = OUT / "pw_stats.json"
    dest.write_text(json.dumps(briefing, indent=2))
    print(json.dumps({
        "quality": {
            "citation_raw": briefing["quality"].get("citation_raw"),
            "citation_tickets": briefing["quality"].get("citation_tickets"),
            "citation_exact_dup": briefing["quality"].get("citation_exact_dup"),
            "void_tickets": briefing["quality"].get("void_tickets"),
            "pre2012": briefing["quality"].get("pre2012"),
            "citation_min": briefing["quality"].get("citation_min"),
            "citation_max": briefing["quality"].get("citation_max"),
        },
        "y2019": briefing["y2019"],
        "y2020": briefing["y2020"],
        "y2025": briefing["y2025"],
        "y2026_ytd": briefing["y2026_ytd"],
        "vs_2019": briefing["vs_2019"],
        "open_caseload": briefing["open_caseload"]["n"],
        "families_2025": briefing["families_2025"],
        "top_codes_2025": briefing["top_codes_2025"][:6],
        "neighborhoods_2025": briefing["neighborhoods_2025"][:8],
        "workzones": {
            "jobs": briefing["workzones"]["jobs"],
            "locations": briefing["workzones"]["locations"],
            "as_of": briefing["workzones"]["as_of"],
            "categories": briefing["workzones"]["categories"],
        },
        "streetlights": briefing["streetlights"],
        "snow_routes": briefing["snow_routes"],
        "overlap_311": {
            "y2025_pothole_repair_requests": briefing["overlap_311"]["y2025_pothole_repair_requests"],
            "y2025_n": briefing["overlap_311"].get("y2025_n"),
        },
    }, indent=2))
    print(f"wrote {dest}", flush=True)


if __name__ == "__main__":
    main()
