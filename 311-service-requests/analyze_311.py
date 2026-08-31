#!/usr/bin/env python3
"""Clean Boston 311 legacy + NEW SYSTEM files and produce briefing stats."""
from __future__ import annotations

import csv
import html
import json
import re
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from common import DOWNLOADS, OUT, download_dump, parse_dt, strip_null

FAMILY_RULES = (
    (("parking", "abandoned veh"), "Parking / vehicles"),
    (("needle", "trash", "litter", "graffiti", "dumpster", "street cleaning", "ce collection", "recycling"), "Sanitation / streets"),
    (("housing", "unsanitary", "living condition", "pest", "bed bug", "lead", "occupying"), "Housing / ISD"),
    (("tree", "park"), "Parks / trees"),
    (("light", "street light", "sign", "signal"), "Lights / signs"),
    (("animal", "dog", "rodent"), "Animals"),
    (("snow", "ice"), "Snow"),
    (("fire", "smoke", "carbon monoxide"), "Fire / CO"),
    (("sidewalk", "pothole", "highway"), "Road defects"),
)

# Short keys match as words so "tree" is not "street" and "ice" is not "services".
_WORD_KEYS = {
    "tree": r"trees?",
    "park": r"parks?",
    "ice": r"ice",
    "sign": r"signs?",
    "light": r"lights?",
    "snow": r"snow",
    "fire": r"fires?",
    "lead": r"lead",
    "dog": r"dogs?",
}

UNIFIED_KEYS = (
    "incident", "source_system", "dt", "year", "month", "hour", "weekday",
    "closed_dt", "on_time", "status", "subject", "type", "family",
    "department", "neighborhood", "district", "street", "zip",
)


def _key_in_blob(blob: str, key: str) -> bool:
    pattern = _WORD_KEYS.get(key)
    if pattern:
        return re.search(rf"(?<![a-z]){pattern}(?![a-z])", blob) is not None
    return key in blob


def family_of(subject: str, typ: str) -> str:
    blob = f"{subject} {typ}".lower()
    for keys, label in FAMILY_RULES:
        if any(_key_in_blob(blob, k) for k in keys):
            return label
    return "Other"


def _street(raw: str) -> str:
    return html.unescape(strip_null(raw)).title()


def _on_time(raw: str) -> str:
    s = strip_null(raw).upper().replace(" ", "")
    if s in {"ONTIME", "ON-TIME"}:
        return "ONTIME"
    if s in {"OVERDUE"}:
        return "OVERDUE"
    return ""


def unify_legacy(raw: dict) -> dict | None:
    inc = strip_null(raw.get("case_enquiry_id"))
    dt = parse_dt(raw.get("open_dt", ""))
    if not inc or dt is None:
        return None
    subject = strip_null(raw.get("subject"))
    typ = strip_null(raw.get("type")) or strip_null(raw.get("reason"))
    closed = parse_dt(raw.get("closed_dt", ""))
    return {
        "incident": inc,
        "source_system": "legacy",
        "dt": dt.isoformat(timespec="seconds"),
        "year": dt.year,
        "month": dt.month,
        "hour": dt.hour,
        "weekday": dt.weekday(),
        "closed_dt": closed.isoformat(timespec="seconds") if closed else "",
        "on_time": _on_time(raw.get("on_time", "")),
        "status": strip_null(raw.get("case_status")),
        "subject": subject,
        "type": typ,
        "family": family_of(subject, typ),
        "department": strip_null(raw.get("department")),
        "neighborhood": strip_null(raw.get("neighborhood")),
        "district": strip_null(raw.get("police_district")).upper().replace(" ", ""),
        "street": _street(raw.get("location_street_name", "")),
        "zip": strip_null(raw.get("location_zipcode"))[:5],
    }


def unify_new(raw: dict) -> dict | None:
    inc = strip_null(raw.get("case_id"))
    dt = parse_dt(raw.get("open_date", ""))
    if not inc or dt is None:
        return None
    subject = strip_null(raw.get("case_topic"))
    typ = strip_null(raw.get("service_name"))
    closed = parse_dt(raw.get("close_date", ""))
    return {
        "incident": inc,
        "source_system": "new",
        "dt": dt.isoformat(timespec="seconds"),
        "year": dt.year,
        "month": dt.month,
        "hour": dt.hour,
        "weekday": dt.weekday(),
        "closed_dt": closed.isoformat(timespec="seconds") if closed else "",
        "on_time": _on_time(raw.get("on_time", "")),
        "status": strip_null(raw.get("case_status")),
        "subject": subject,
        "type": typ,
        "family": family_of(subject, typ),
        "department": strip_null(raw.get("assigned_department")),
        "neighborhood": strip_null(raw.get("neighborhood")),
        "district": strip_null(raw.get("police_district")).upper().replace(" ", ""),
        "street": _street(raw.get("street_name", "")),
        "zip": strip_null(raw.get("zip_code"))[:5],
    }


def load_unified(legacy_paths: list[Path], new_paths: list[Path]) -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    for path in legacy_paths:
        with path.open(newline="", encoding="utf-8", errors="replace") as handle:
            for raw in csv.DictReader(handle):
                quality["legacy_raw"] += 1
                row = unify_legacy(raw)
                if row is None:
                    quality["legacy_drop"] += 1
                    continue
                quality["legacy_kept"] += 1
                rows.append(row)
    for path in new_paths:
        with path.open(newline="", encoding="utf-8", errors="replace") as handle:
            for raw in csv.DictReader(handle):
                quality["new_raw"] += 1
                row = unify_new(raw)
                if row is None:
                    quality["new_drop"] += 1
                    continue
                quality["new_kept"] += 1
                rows.append(row)
    return rows, dict(quality)


COMPLETE_YEARS = list(range(2016, 2026))
FAMILY_ORDER = [label for _, label in FAMILY_RULES] + ["Other"]
QUALITY_NOTE = (
    "Oct 2025 CRM split. Do not add legacy 2025 + NEW SYSTEM as one citywide "
    "total without a footnote. Compare 2025 vs 2019, not vs 2020."
)
DATASET_DOWNLOAD = (
    "https://data.boston.gov/dataset/8048697b-ad64-4bfc-b090-ee00169f2323"
    "/resource/{id}/download"
)

LEGACY_IDS = {
    2016: "b7ea6b1b-3ca4-4c5b-9713-6dc1db52379a",
    2017: "30022137-709d-465e-baae-ca155b51927d",
    2018: "2be28d90-3a90-4af1-a3f6-f28c1e25880a",
    2019: "ea2e4696-4a2d-429c-9807-d02eb92e0222",
    2020: "6ff6a6fd-3141-4440-a880-6f60a37fe789",
    2021: "f53ebccd-bc61-49f9-83db-625f209c95f5",
    2022: "81a7b022-f8fc-4da5-80e4-b160058ca207",
    2023: "e6013a93-1321-4f2a-bf91-8d8a02f1e62f",
    2024: "dff4d804-5031-443a-8409-8344efd0e5c8",
    2025: "9d7c2214-4709-478a-a2e8-fb2020a5bb94",
    2026: "1a0b420d-99f1-4887-9851-990b2a5a6e17",
}
NEW_IDS = {
    "new": "254adca6-64ab-4c5c-9fc0-a6da622be185",
}

DISTRICT_NAME = {
    "A1": "Downtown",
    "A15": "Charlestown",
    "A7": "East Boston",
    "B2": "Roxbury",
    "B3": "Mattapan",
    "C6": "South Boston",
    "C11": "Dorchester",
    "D4": "South End",
    "D14": "Brighton",
    "E5": "West Roxbury",
    "E13": "Jamaica Plain",
    "E18": "Hyde Park",
}


def _top(counter: Counter, n: int = 12) -> list[dict]:
    return [{"label": k, "value": v} for k, v in counter.most_common(n) if k]


def _district_label(code: str) -> str:
    if not code:
        return ""
    name = DISTRICT_NAME.get(code, "")
    return f"{code} {name}" if name else code


def _days_in_year(year: int) -> int:
    leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    return 366 if leap else 365


def _per_day(rows: list[dict], year: int) -> float:
    n = len(rows)
    if not n:
        return 0.0
    if year >= 2026:
        last = max((r["dt"][:10] for r in rows if r.get("dt")), default="")
        if last:
            end = date.fromisoformat(last)
            span = (end - date(year, 1, 1)).days + 1
            return round(n / max(span, 1), 1)
    return round(n / _days_in_year(year), 1)


def _count_by(rows: list[dict], keyfn) -> Counter:
    return Counter(keyfn(r) for r in rows)


def _year_slice(rows: list[dict], year: int) -> dict:
    n = len(rows)
    families = _count_by(rows, lambda r: r["family"])
    hours = _count_by(rows, lambda r: r["hour"])
    peak = max(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    quiet = min(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    return {
        "n": n,
        "per_day": _per_day(rows, year),
        "peak_hour": peak,
        "quiet_hour": quiet,
        "families": _top(families, 12),
    }


def briefing_from_rows(rows: list[dict], quality: dict) -> dict:
    legacy = [r for r in rows if r["source_system"] == "legacy"]
    new_rows = [r for r in rows if r["source_system"] == "new"]
    y2019 = [r for r in legacy if r["year"] == 2019]
    y2020 = [r for r in legacy if r["year"] == 2020]
    y2025 = [r for r in legacy if r["year"] == 2025]
    y2026 = [r for r in legacy if r["year"] == 2026]
    new_2026 = [r for r in new_rows if r["year"] == 2026]

    dates = [r["dt"][:10] for r in rows if r.get("dt")]
    date_span = {
        "min": min(dates) if dates else "",
        "max": max(dates) if dates else "",
    }

    by_year_counts = _count_by(legacy, lambda r: r["year"])
    by_year_new = _count_by(new_rows, lambda r: r["year"])
    years_for_by = sorted(set(COMPLETE_YEARS) | {2026} | set(by_year_counts) | set(by_year_new))
    by_year = [
        {
            "year": y,
            "incidents": by_year_counts[y],
            "legacy": by_year_counts[y],
            "new": by_year_new[y],
        }
        for y in years_for_by
        if y >= 2016
    ]

    year_family = defaultdict(Counter)
    for r in legacy:
        if r["year"] in COMPLETE_YEARS:
            year_family[r["year"]][r["family"]] += 1
    stacked = {
        "years": COMPLETE_YEARS,
        "series": [
            {"name": name, "data": [year_family[y][name] for y in COMPLETE_YEARS]}
            for name in FAMILY_ORDER
            if any(year_family[y][name] for y in COMPLETE_YEARS)
        ],
    }

    hour_2025 = [_count_by(y2025, lambda r: r["hour"]).get(h, 0) for h in range(24)]
    weekday_2025 = [_count_by(y2025, lambda r: r["weekday"]).get(d, 0) for d in range(7)]
    month_2025 = [_count_by(y2025, lambda r: r["month"]).get(m, 0) for m in range(1, 13)]
    neighborhoods_2025 = _top(_count_by([r for r in y2025 if r["neighborhood"]], lambda r: r["neighborhood"]), 15)
    families_2025 = _top(_count_by(y2025, lambda r: r["family"]), 12)
    top_types_2025 = _top(_count_by(y2025, lambda r: r["type"] or r["subject"] or "Unknown"), 15)

    ontime = sum(1 for r in y2025 if r["on_time"] == "ONTIME")
    overdue = sum(1 for r in y2025 if r["on_time"] == "OVERDUE")
    unknown = len(y2025) - ontime - overdue
    known = ontime + overdue
    on_time_2025 = {
        "ontime": ontime,
        "overdue": overdue,
        "unknown": unknown,
        "ontime_pct": round(100.0 * ontime / known, 1) if known else 0.0,
    }

    dist = _count_by([r for r in y2025 if r["district"]], lambda r: r["district"])
    dist_overdue = _count_by(
        [r for r in y2025 if r["district"] and r["on_time"] == "OVERDUE"],
        lambda r: r["district"],
    )
    dist_sanitation = _count_by(
        [r for r in y2025 if r["district"] and r["family"] == "Sanitation / streets"],
        lambda r: r["district"],
    )
    district_profile_2025 = []
    for code, n in dist.most_common():
        od = dist_overdue.get(code, 0)
        district_profile_2025.append({
            "district": _district_label(code),
            "code": code,
            "incidents": n,
            "overdue": od,
            "overdue_pct": round(100.0 * od / n, 1) if n else 0,
            "sanitation": dist_sanitation.get(code, 0),
        })

    streets = Counter()
    for r in y2025:
        if r["street"] and r["neighborhood"]:
            streets[f"{r['street']} ({r['neighborhood']})"] += 1
        elif r["street"]:
            streets[r["street"]] += 1
    repeat_streets_2025 = _top(streets, 12)

    quality_out = dict(quality)
    quality_out["note"] = QUALITY_NOTE
    quality_out["new_all"] = len(new_rows)
    quality_out["new_2025"] = sum(1 for r in new_rows if r["year"] == 2025)

    return {
        "quality": quality_out,
        "date_span": date_span,
        "years": COMPLETE_YEARS,
        "by_year": by_year,
        "stacked": stacked,
        "y2019": _year_slice(y2019, 2019),
        "y2020": _year_slice(y2020, 2020),
        "y2025": _year_slice(y2025, 2025),
        "y2026_ytd": _year_slice(y2026, 2026),
        "hour_2025": hour_2025,
        "weekday_2025": weekday_2025,
        "month_2025": month_2025,
        "neighborhoods_2025": neighborhoods_2025,
        "families_2025": families_2025,
        "top_types_2025": top_types_2025,
        "on_time_2025": on_time_2025,
        "district_profile_2025": district_profile_2025,
        "repeat_streets_2025": repeat_streets_2025,
        "new_system_2026": _year_slice(new_2026, 2026),
    }


def fetch_311(resource_id: str, dest: Path) -> Path:
    try:
        return download_dump(resource_id, dest)
    except urllib.error.HTTPError:
        if dest.exists() and dest.stat().st_size == 0:
            dest.unlink()
        url = DATASET_DOWNLOAD.format(id=resource_id)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url, timeout=300) as handle, dest.open("wb") as out:
            while True:
                chunk = handle.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
        return dest


def main() -> None:
    legacy_paths = []
    for year, rid in LEGACY_IDS.items():
        dest = DOWNLOADS / f"311-legacy-{year}.csv"
        print(f"fetch {dest.name}", flush=True)
        fetch_311(rid, dest)
        legacy_paths.append(dest)
    new_dest = DOWNLOADS / "311-new-system.csv"
    print(f"fetch {new_dest.name}", flush=True)
    fetch_311(NEW_IDS["new"], new_dest)
    rows, quality = load_unified(legacy_paths, [new_dest])
    briefing = briefing_from_rows(rows, quality)
    (OUT / "311_briefing_stats.json").write_text(json.dumps(briefing, indent=2))
    print(json.dumps({
        "quality": briefing["quality"],
        "date_span": briefing["date_span"],
        "y2019": briefing["y2019"],
        "y2020": briefing["y2020"],
        "y2025": briefing["y2025"],
        "y2026_ytd": briefing["y2026_ytd"],
        "new_system_2026": briefing["new_system_2026"],
        "on_time_2025": briefing["on_time_2025"],
    }, indent=2))
    print("\nby_year", briefing["by_year"])
    print("\nfamilies_2025", briefing["families_2025"][:8])
    print("\nneighborhoods_2025", briefing["neighborhoods_2025"][:8])


if __name__ == "__main__":
    main()
