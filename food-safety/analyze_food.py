#!/usr/bin/env python3
"""Clean food establishment inspections and active licenses; produce briefing stats."""
from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from common import DOWNLOADS, OUT, ZIP_NEIGHBORHOOD, download_dump, parse_dt, strip_null

INSPECT_ID = "4582bec6-2b4f-4f9e-bc55-cbaa73117f4c"
LICENSE_ID = "f1e13724-284d-478c-b8bc-ef042aa5b70b"
COMPLETE_YEARS = list(range(2012, 2026))
YEAR_MIN = 2006
YEAR_MAX = 2026

FAIL_RESULTS = frozenset({
    "HE_Fail",
    "HE_FailExt",
    "Fail",
    "Failed",
    "HE_FAILNOR",
})
STAR_LEVELS = ("*", "**", "***")
ALWAYS_PASS_MIN = 3
REPEAT_YEAR_MIN = 2
PLACE_DETAIL_YEARS = (2019, 2024, 2025)

CAT_FOOD_DRINKS = "Food and drinks"
CAT_TAKEOUT = "Take-out"
CAT_RETAIL = "Retail food"
CAT_MOBILE = "Mobile food"
CAT_ICE = "Ice cream"
CAT_CAFE = "Cafe"
CAT_CULTURAL = "Cultural / attraction"
CAT_SCHOOL = "School"
CAT_HOSPITAL = "Hospital"
CAT_HOTEL = "Hotel"
CAT_OTHER = "Other / unclassified"
CODED_CAT = {
    "FS": CAT_FOOD_DRINKS,
    "FT": CAT_TAKEOUT,
    "RF": CAT_RETAIL,
    "MFW": CAT_MOBILE,
}
OVERLAY_ORDER = (
    CAT_ICE,
    CAT_CULTURAL,
    CAT_HOSPITAL,
    CAT_HOTEL,
    CAT_SCHOOL,
    CAT_CAFE,
    CAT_FOOD_DRINKS,
    CAT_TAKEOUT,
    CAT_RETAIL,
    CAT_MOBILE,
    CAT_OTHER,
)

_ICE_RE = re.compile(
    r"\b(ice\s*cream|gelato|frozen\s+yogurt|frozen\s+dessert|fro-?yo|yoghurt\s+shop)\b",
    re.I,
)
_CULTURAL_RE = re.compile(
    r"\b(museum|aquarium|zoo|botanical\s+gardens?|stadium|fenway\s+park)\b",
    re.I,
)
_SCHOOL_STREET_RE = re.compile(r"\bschool\s+st(?:reet|\.)?\b", re.I)
_SCHOOL_RE = re.compile(
    r"\b(high\s+school|elementary\s+school|middle\s+school|university|college)\b",
    re.I,
)
_SCHOOL_WORD_RE = re.compile(r"\bschool\b", re.I)
_HOSPITAL_RE = re.compile(r"\b(hospital|medical\s+center)\b", re.I)
_HOTEL_RE = re.compile(
    r"\b(hotel|marriott|hilton|hyatt|sheraton|westin|aloft)\b",
    re.I,
)
_CAFE_RE = re.compile(
    r"\b(caf[eé]|coffeehouse|coffee\s+bar|coffee\s+shop|espresso|coffee)\b",
    re.I,
)

QUALITY_NOTE = (
    "Food establishment inspections and active food licenses are separate "
    "files. Do not count a license row as an inspection. The inspection dump "
    "is one row per violation; this briefing collapses to one inspection per "
    "license number and result timestamp. Drop rows with no resultdttm. "
    "Complete years are 2012–2025. 2026 is year-to-date through 28 August — "
    "not a full year. 2020 is COVID. Fail is the exact result codes HE_Fail, "
    "HE_FailExt, Fail, Failed, and HE_FAILNOR — not a substring. Star levels "
    "are exact *, **, ***."
)


def zip5_of(raw: str) -> str:
    digits = "".join(ch for ch in strip_null(raw) if ch.isdigit())
    if len(digits) >= 5:
        return digits[:5]
    if len(digits) == 4:
        return digits.zfill(5)
    return ""


def is_fail(raw: str) -> bool:
    return strip_null(raw) in FAIL_RESULTS


def viol_star(raw: str) -> str:
    text = strip_null(raw)
    if text in STAR_LEVELS:
        return text
    return ""


def categorize(business: str, licensecat: str) -> str:
    name = strip_null(business)
    coded = CODED_CAT.get(strip_null(licensecat).upper(), CAT_OTHER)
    if _ICE_RE.search(name):
        return CAT_ICE
    if _CULTURAL_RE.search(name):
        return CAT_CULTURAL
    if _HOSPITAL_RE.search(name):
        return CAT_HOSPITAL
    if _HOTEL_RE.search(name):
        return CAT_HOTEL
    if _SCHOOL_RE.search(name) or (
        _SCHOOL_WORD_RE.search(name) and not _SCHOOL_STREET_RE.search(name)
    ):
        return CAT_SCHOOL
    if _CAFE_RE.search(name):
        return CAT_CAFE
    return coded


def _place_key(row: dict) -> str:
    return row["licenseno"] or f"{row['business']}|{row['address']}|{row['zip']}"


def _roll_places(rows: list[dict]) -> dict[str, dict]:
    by: dict[str, dict] = {}
    for row in rows:
        key = _place_key(row)
        rec = by.get(key)
        if rec is None:
            rec = {
                "name": row["business"],
                "address": row["address"],
                "zip": row["zip"],
                "category": categorize(row["business"], row["licensecat"]),
                "inspections": 0,
                "fails": 0,
            }
            by[key] = rec
        rec["inspections"] += 1
        if row["fail"]:
            rec["fails"] += 1
    for rec in by.values():
        n = rec["inspections"]
        rec["fail_rate"] = round(100.0 * rec["fails"] / n, 1) if n else 0.0
    return by


def _public_place(rec: dict, extra: tuple[str, ...] = ()) -> dict:
    keys = ("name", "address", "zip", "category", "inspections", "fails", "fail_rate") + extra
    return {k: rec[k] for k in keys}


def _window_payload(by: dict[str, dict], ytd: bool) -> dict:
    places = list(by.values())
    always = [
        p
        for p in places
        if p["fails"] == 0 and p["inspections"] >= ALWAYS_PASS_MIN
    ]
    always.sort(key=lambda p: (-p["inspections"], p["name"].lower()))
    cat_n: Counter = Counter()
    cat_fail: Counter = Counter()
    for p in places:
        cat_n[p["category"]] += p["inspections"]
        cat_fail[p["category"]] += p["fails"]
    category_n = [
        {"label": lab, "inspections": cat_n[lab], "fails": cat_fail[lab]}
        for lab in OVERLAY_ORDER
        if cat_n[lab]
    ]
    by_category: dict[str, dict] = {}
    for lab in OVERLAY_ORDER:
        subset = [p for p in places if p["category"] == lab]
        cat_always = [
            p
            for p in subset
            if p["fails"] == 0 and p["inspections"] >= ALWAYS_PASS_MIN
        ]
        cat_always.sort(key=lambda p: (-p["inspections"], p["name"].lower()))
        if not cat_always:
            continue
        by_category[lab] = {
            "always_pass": [_public_place(p) for p in cat_always[:10]],
            "places_to_avoid": [],
            "always_pass_n": len(cat_always),
            "repeat_n": 0,
        }
    return {
        "ytd": ytd,
        "min_pass_inspections": ALWAYS_PASS_MIN,
        "always_pass": [_public_place(p) for p in always[:10]],
        "repeat_offenders": [],
        "places_to_avoid": [],
        "always_pass_n": len(always),
        "repeat_n": 0,
        "category_n": category_n,
        "by_category": by_category,
    }


def _insp_key(licenseno: str, business: str, dt) -> tuple:
    who = licenseno or business
    return (who, dt.isoformat(timespec="seconds"))


def load_inspections(path: Path) -> tuple[list[dict], dict]:
    quality = Counter()
    groups: dict[tuple, dict] = {}
    first = last = None
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["insp_raw"] += 1
            dt = parse_dt(raw.get("resultdttm", ""))
            if dt is None or not (YEAR_MIN <= dt.year <= YEAR_MAX):
                quality["insp_drop"] += 1
                continue
            quality["insp_kept_rows"] += 1
            if first is None or dt < first:
                first = dt
            if last is None or dt > last:
                last = dt
            licenseno = strip_null(raw.get("licenseno", ""))
            business = strip_null(raw.get("businessname", ""))
            key = _insp_key(licenseno, business, dt)
            zip5 = zip5_of(raw.get("zip", ""))
            star = viol_star(raw.get("viol_level", ""))
            has_viol = strip_null(raw.get("violation", "")) != ""
            if key not in groups:
                groups[key] = {
                    "year": dt.year,
                    "month": dt.month,
                    "hour": dt.hour,
                    "weekday": dt.weekday(),
                    "result": strip_null(raw.get("result", "")),
                    "fail": is_fail(raw.get("result", "")),
                    "business": business,
                    "licenseno": licenseno,
                    "address": strip_null(raw.get("address", "")),
                    "licensecat": strip_null(raw.get("licensecat", "")),
                    "descript": strip_null(raw.get("descript", "")),
                    "zip": zip5,
                    "neighborhood": ZIP_NEIGHBORHOOD.get(zip5, ""),
                    "n_viol": 0,
                    "stars": {"*": 0, "**": 0, "***": 0},
                    "violdesc": Counter(),
                }
            rec = groups[key]
            if has_viol:
                rec["n_viol"] += 1
            if star:
                rec["stars"][star] += 1
            desc = strip_null(raw.get("violdesc", ""))
            if desc:
                rec["violdesc"][desc] += 1
    rows = list(groups.values())
    quality["insp_kept"] = len(rows)
    out = dict(quality)
    if first is not None and last is not None:
        out["insp_min"] = first.date().isoformat()
        out["insp_max"] = last.date().isoformat()
    return rows, out


def load_licenses(path: Path) -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["lic_raw"] += 1
            zip5 = zip5_of(raw.get("zip", ""))
            rows.append({
                "business": strip_null(raw.get("businessname", "")),
                "zip": zip5,
                "neighborhood": ZIP_NEIGHBORHOOD.get(zip5, ""),
                "status": strip_null(raw.get("licstatus", "")),
                "licensecat": strip_null(raw.get("licensecat", "")),
                "descript": strip_null(raw.get("descript", "")),
            })
            quality["lic_kept"] += 1
    return rows, dict(quality)


def _top(counter: Counter, n: int) -> list[dict]:
    return [{"label": k, "value": v} for k, v in counter.most_common(n) if k]


def _days_in_year(year: int) -> int:
    leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    return 366 if leap else 365


def briefing_from_rows(
    inspections: list[dict],
    licenses: list[dict],
    quality: dict,
) -> dict:
    y2019 = [r for r in inspections if r["year"] == 2019]
    y2020 = [r for r in inspections if r["year"] == 2020]
    y2025 = [r for r in inspections if r["year"] == 2025]
    y2026 = [r for r in inspections if r["year"] == 2026]
    year_counts = Counter(r["year"] for r in inspections)
    fail_year = Counter(r["year"] for r in inspections if r["fail"])

    by_year = [
        {
            "year": y,
            "inspections": year_counts[y],
            "fails": fail_year[y],
            "fail_rate": round(100.0 * fail_year[y] / year_counts[y], 1) if year_counts[y] else 0.0,
        }
        for y in COMPLETE_YEARS
    ]

    zip_year_n: dict[tuple[int, str], int] = Counter()
    zip_year_fail: dict[tuple[int, str], int] = Counter()
    zip_nb: dict[str, str] = {}
    for r in inspections:
        if r["year"] not in COMPLETE_YEARS or not r["zip"]:
            continue
        key = (r["year"], r["zip"])
        zip_year_n[key] += 1
        if r["fail"]:
            zip_year_fail[key] += 1
        zip_nb[r["zip"]] = r["neighborhood"]
    fail_rate_zip_year = [
        {
            "year": year,
            "zip": zip5,
            "neighborhood": zip_nb.get(zip5, ""),
            "inspections": zip_year_n[(year, zip5)],
            "fails": zip_year_fail[(year, zip5)],
            "fail_rate": round(
                100.0 * zip_year_fail[(year, zip5)] / zip_year_n[(year, zip5)],
                1,
            ),
        }
        for year, zip5 in sorted(zip_year_n)
    ]

    stars_2025 = Counter()
    violdesc_2025 = Counter()
    for r in y2025:
        for star, n in r["stars"].items():
            stars_2025[star] += n
        violdesc_2025.update(r["violdesc"])

    n19 = len(y2019)
    n25 = len(y2025)
    quality_out = dict(quality)
    quality_out["note"] = QUALITY_NOTE

    last = quality.get("insp_max", "")
    y2026_days = 240  # 1 Jan–28 Aug 2026
    if last:
        try:
            end = date.fromisoformat(last)
            if end.year == 2026:
                y2026_days = (end - date(2026, 1, 1)).days + 1
        except ValueError:
            pass

    place_windows = {}
    for year in PLACE_DETAIL_YEARS:
        subset = [r for r in inspections if r["year"] == year]
        payload = _window_payload(_roll_places(subset), ytd=False)
        payload["year"] = year
        place_windows[str(year)] = payload
    ytd_payload = _window_payload(_roll_places(y2026), ytd=True)
    ytd_payload["year"] = 2026
    place_windows["2026_ytd"] = ytd_payload

    years_failed: dict[str, set[int]] = defaultdict(set)
    across_roll: dict[str, dict] = {}
    for row in inspections:
        if not (2012 <= row["year"] <= YEAR_MAX):
            continue
        key = _place_key(row)
        rec = across_roll.get(key)
        if rec is None:
            rec = {
                "name": row["business"],
                "address": row["address"],
                "zip": row["zip"],
                "category": categorize(row["business"], row["licensecat"]),
                "inspections": 0,
                "fails": 0,
            }
            across_roll[key] = rec
        rec["inspections"] += 1
        if row["fail"]:
            rec["fails"] += 1
            years_failed[key].add(row["year"])
    across_places = []
    for key, rec in across_roll.items():
        nyears = len(years_failed.get(key, ()))
        if nyears < REPEAT_YEAR_MIN:
            continue
        rec["years_failed"] = nyears
        rec["fail_rate"] = round(
            100.0 * rec["fails"] / rec["inspections"], 1
        ) if rec["inspections"] else 0.0
        across_places.append(rec)
    across_places.sort(
        key=lambda p: (-p["years_failed"], -p["fails"], p["name"].lower())
    )
    across_by_cat: dict[str, dict] = {}
    for lab in OVERLAY_ORDER:
        subset = [p for p in across_places if p["category"] == lab]
        if not subset:
            continue
        across_by_cat[lab] = {
            "places_to_avoid": [
                _public_place(p, extra=("years_failed",)) for p in subset[:10]
            ],
            "repeat_n": len(subset),
        }
    repeat_across = {
        "window": "2012–2026 · fail in ≥2 calendar years",
        "years": list(range(YEAR_MIN, YEAR_MAX + 1)),
        "repeat_n": len(across_places),
        "places": [
            _public_place(p, extra=("years_failed",)) for p in across_places[:15]
        ],
        "by_category": across_by_cat,
    }

    category_by_year = []
    for year in COMPLETE_YEARS:
        coded_n = Counter()
        for row in inspections:
            if row["year"] != year:
                continue
            coded_n[CODED_CAT.get(row["licensecat"].upper(), CAT_OTHER)] += 1
        category_by_year.append({
            "year": year,
            CAT_FOOD_DRINKS: coded_n[CAT_FOOD_DRINKS],
            CAT_TAKEOUT: coded_n[CAT_TAKEOUT],
            CAT_RETAIL: coded_n[CAT_RETAIL],
            CAT_MOBILE: coded_n[CAT_MOBILE],
            CAT_OTHER: coded_n[CAT_OTHER],
        })

    return {
        "quality": quality_out,
        "years": COMPLETE_YEARS,
        "by_year": by_year,
        "y2019": {"n": n19, "fails": sum(1 for r in y2019 if r["fail"])},
        "y2020": {"n": len(y2020), "fails": sum(1 for r in y2020 if r["fail"])},
        "y2025": {
            "n": n25,
            "fails": sum(1 for r in y2025 if r["fail"]),
            "fail_rate": round(
                100.0 * sum(1 for r in y2025 if r["fail"]) / n25, 1
            ) if n25 else 0.0,
            "per_day": round(n25 / _days_in_year(2025), 1) if n25 else 0.0,
        },
        "y2026_ytd": {
            "n": len(y2026),
            "fails": sum(1 for r in y2026 if r["fail"]),
            "per_day": round(len(y2026) / max(y2026_days, 1), 1) if y2026 else 0.0,
        },
        "hour_2025": [Counter(r["hour"] for r in y2025).get(h, 0) for h in range(24)],
        "weekday_2025": [Counter(r["weekday"] for r in y2025).get(d, 0) for d in range(7)],
        "month_2025": [Counter(r["month"] for r in y2025).get(m, 0) for m in range(1, 13)],
        "results_2025": _top(Counter(r["result"] for r in y2025), 12),
        "levels_2025": [
            {"label": star, "value": stars_2025[star]}
            for star in STAR_LEVELS
            if stars_2025[star]
        ],
        "violdesc_2025": _top(violdesc_2025, 12),
        "neighborhoods_2025": _top(Counter(r["neighborhood"] for r in y2025), 12),
        "fail_rate_zip_year": fail_rate_zip_year,
        "active_licenses": len(licenses),
        "license_cats": _top(Counter(r["licensecat"] for r in licenses), 8),
        "license_nb": _top(Counter(r["neighborhood"] for r in licenses), 12),
        "vs_2019": {
            "n2019": n19,
            "n2025": n25,
            "insp_pct": round(100.0 * (n25 - n19) / n19, 1) if n19 else 0.0,
            "fail_pct": round(
                100.0
                * (
                    (sum(1 for r in y2025 if r["fail"]) / n25 if n25 else 0.0)
                    - (sum(1 for r in y2019 if r["fail"]) / n19 if n19 else 0.0)
                ),
                1,
            ),
        },
        "place_windows": place_windows,
        "repeat_across_years": repeat_across,
        "category_by_year": category_by_year,
    }


def main() -> None:
    insp_path = DOWNLOADS / "food-establishment-inspections.csv"
    lic_path = DOWNLOADS / "active-food-licenses.csv"
    print(f"fetch {insp_path.name}", flush=True)
    download_dump(INSPECT_ID, insp_path)
    print(f"fetch {lic_path.name}", flush=True)
    download_dump(LICENSE_ID, lic_path)
    inspections, iq = load_inspections(insp_path)
    licenses, lq = load_licenses(lic_path)
    briefing = briefing_from_rows(inspections, licenses, {**iq, **lq})
    (OUT / "food_stats.json").write_text(json.dumps(briefing, indent=2))
    print(json.dumps({
        "quality": briefing["quality"],
        "y2019": briefing["y2019"],
        "y2020": briefing["y2020"],
        "y2025": briefing["y2025"],
        "y2026_ytd": briefing["y2026_ytd"],
        "vs_2019": briefing["vs_2019"],
        "results_2025": briefing["results_2025"],
        "levels_2025": briefing["levels_2025"],
        "violdesc_2025": briefing["violdesc_2025"][:6],
        "neighborhoods_2025": briefing["neighborhoods_2025"][:8],
        "active_licenses": briefing["active_licenses"],
        "license_cats": briefing["license_cats"],
    }, indent=2))
    print("\nby_year", briefing["by_year"])
    print("\nplace_windows", {
        k: {
            "ytd": w["ytd"],
            "always_pass_n": w["always_pass_n"],
            "repeat_n": w["repeat_n"],
        }
        for k, w in briefing["place_windows"].items()
    })
    print(
        "repeat_across",
        briefing["repeat_across_years"]["window"],
        briefing["repeat_across_years"]["places"][0]["name"],
    )


if __name__ == "__main__":
    main()
