#!/usr/bin/env python3
"""Clean Vision Zero crash and fatality files and produce briefing stats."""
from __future__ import annotations

import csv
import html
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from common import DOWNLOADS, OUT, download_dump, parse_dt, strip_null

CRASH_ID = "e4bfe397-6bfc-49c5-9367-c879fac7401d"
FAT_ID = "92f18923-d4ec-4c17-9405-4e0da63e1d6c"
COMPLETE_YEARS = list(range(2015, 2026))
MODE_LABEL = {
    "mv": "Motor vehicle",
    "ped": "Pedestrian",
    "bike": "Bicycle",
}
MODE_ORDER = ["Motor vehicle", "Pedestrian", "Bicycle", "Other"]
QUALITY_NOTE = (
    "Vision Zero crashes and fatalities are separate files. 2026 crashes run "
    "through 1 July — not a full year. Compare 2025 to 2019, not 2020. "
    "BPD RMS MV crash/traffic is a different count and will not match."
)


def mode_of(raw: str) -> str:
    return MODE_LABEL.get(strip_null(raw).lower(), "Other")


def street_of(street: str, xstreet1: str, xstreet2: str) -> str:
    named = html.unescape(strip_null(street)).title()
    if named:
        return named
    a = html.unescape(strip_null(xstreet1)).title()
    b = html.unescape(strip_null(xstreet2)).title()
    if a and b:
        return f"{a} & {b}"
    return a or b


def _unify(raw: dict, ts_field: str) -> dict | None:
    dt = parse_dt(raw.get(ts_field, ""))
    if dt is None:
        return None
    return {
        "dt": dt.isoformat(timespec="seconds"),
        "year": dt.year,
        "month": dt.month,
        "hour": dt.hour,
        "weekday": dt.weekday(),
        "mode": mode_of(raw.get("mode_type", "")),
        "location_type": strip_null(raw.get("location_type")),
        "street": street_of(
            raw.get("street", ""),
            raw.get("xstreet1", ""),
            raw.get("xstreet2", ""),
        ),
    }


def load_crashes(path: Path) -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["crash_raw"] += 1
            row = _unify(raw, "dispatch_ts")
            if row is None:
                quality["crash_drop"] += 1
                continue
            quality["crash_kept"] += 1
            rows.append(row)
    return rows, dict(quality)


def load_fatalities(path: Path) -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["fat_raw"] += 1
            row = _unify(raw, "date_time")
            if row is None:
                quality["fat_drop"] += 1
                continue
            quality["fat_kept"] += 1
            rows.append(row)
    return rows, dict(quality)


def _top(counter: Counter, n: int = 12) -> list[dict]:
    return [{"label": k, "value": v} for k, v in counter.most_common(n) if k]


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
    hours = _count_by(rows, lambda r: r["hour"])
    peak = max(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    quiet = min(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    return {
        "n": n,
        "per_day": _per_day(rows, year),
        "peak_hour": peak,
        "quiet_hour": quiet,
        "modes": _top(_count_by(rows, lambda r: r["mode"]), 8),
    }


def _span(rows: list[dict]) -> dict:
    dates = [r["dt"][:10] for r in rows if r.get("dt")]
    return {"min": min(dates) if dates else "", "max": max(dates) if dates else ""}


def briefing_from_rows(crashes: list[dict], deaths: list[dict], quality: dict) -> dict:
    y2019 = [r for r in crashes if r["year"] == 2019]
    y2020 = [r for r in crashes if r["year"] == 2020]
    y2025 = [r for r in crashes if r["year"] == 2025]
    y2026 = [r for r in crashes if r["year"] == 2026]
    crash_years = _count_by(crashes, lambda r: r["year"])
    death_years = _count_by(deaths, lambda r: r["year"])
    years_for_by = sorted(set(COMPLETE_YEARS) | set(crash_years) | set(death_years))
    by_year = [
        {
            "year": y,
            "crashes": crash_years[y],
            "deaths": death_years[y],
        }
        for y in years_for_by
        if y >= 2015
    ]

    year_mode = defaultdict(Counter)
    for r in crashes:
        if r["year"] in COMPLETE_YEARS:
            year_mode[r["year"]][r["mode"]] += 1
    stacked = {
        "years": COMPLETE_YEARS,
        "series": [
            {"name": name, "data": [year_mode[y][name] for y in COMPLETE_YEARS]}
            for name in MODE_ORDER
            if any(year_mode[y][name] for y in COMPLETE_YEARS)
        ],
    }

    n19 = len(y2019)
    n25 = len(y2025)
    quality_out = dict(quality)
    quality_out["note"] = QUALITY_NOTE

    return {
        "quality": quality_out,
        "date_span": {"crashes": _span(crashes), "fatalities": _span(deaths)},
        "years": COMPLETE_YEARS,
        "by_year": by_year,
        "stacked": stacked,
        "y2019": _year_slice(y2019, 2019),
        "y2020": _year_slice(y2020, 2020),
        "y2025": _year_slice(y2025, 2025),
        "y2026_ytd": _year_slice(y2026, 2026),
        "deaths_2019": sum(1 for r in deaths if r["year"] == 2019),
        "deaths_2020": sum(1 for r in deaths if r["year"] == 2020),
        "deaths_2025": sum(1 for r in deaths if r["year"] == 2025),
        "deaths_2026_ytd": sum(1 for r in deaths if r["year"] == 2026),
        "hour_2025": [_count_by(y2025, lambda r: r["hour"]).get(h, 0) for h in range(24)],
        "weekday_2025": [_count_by(y2025, lambda r: r["weekday"]).get(d, 0) for d in range(7)],
        "month_2025": [_count_by(y2025, lambda r: r["month"]).get(m, 0) for m in range(1, 13)],
        "modes_2025": _top(_count_by(y2025, lambda r: r["mode"]), 8),
        "deaths_modes_2025": _top(
            _count_by([r for r in deaths if r["year"] == 2025], lambda r: r["mode"]),
            8,
        ),
        "deaths_modes": _top(
            _count_by([r for r in deaths if r["year"] in COMPLETE_YEARS], lambda r: r["mode"]),
            8,
        ),
        "streets_2025": _top(_count_by(y2025, lambda r: r["street"]), 12),
        "location_2025": _top(_count_by(y2025, lambda r: r["location_type"]), 8),
        "vs_2019": {
            "crashes_pct": round(100.0 * (n25 - n19) / n19, 1) if n19 else 0.0,
            "deaths_2019": sum(1 for r in deaths if r["year"] == 2019),
            "deaths_2025": sum(1 for r in deaths if r["year"] == 2025),
        },
    }


def main() -> None:
    crash_path = DOWNLOADS / "vision-zero-crashes.csv"
    fat_path = DOWNLOADS / "vision-zero-fatalities.csv"
    print(f"fetch {crash_path.name}", flush=True)
    download_dump(CRASH_ID, crash_path)
    print(f"fetch {fat_path.name}", flush=True)
    download_dump(FAT_ID, fat_path)
    crashes, cq = load_crashes(crash_path)
    deaths, fq = load_fatalities(fat_path)
    briefing = briefing_from_rows(crashes, deaths, {**cq, **fq})
    (OUT / "vision_zero_stats.json").write_text(json.dumps(briefing, indent=2))
    print(json.dumps({
        "quality": briefing["quality"],
        "date_span": briefing["date_span"],
        "y2019": briefing["y2019"],
        "y2020": briefing["y2020"],
        "y2025": briefing["y2025"],
        "y2026_ytd": briefing["y2026_ytd"],
        "deaths_2019": briefing["deaths_2019"],
        "deaths_2025": briefing["deaths_2025"],
        "vs_2019": briefing["vs_2019"],
    }, indent=2))
    print("\nby_year", briefing["by_year"])
    print("\nmodes_2025", briefing["modes_2025"])
    print("\nstreets_2025", briefing["streets_2025"][:8])


if __name__ == "__main__":
    main()
