#!/usr/bin/env python3
"""Clean approved building permits and ZBA tracker; produce briefing stats."""
from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from common import DOWNLOADS, OUT, ZIP_NEIGHBORHOOD, download_dump, parse_dt, strip_null

PERMIT_ID = "6ddcd912-32a0-43df-9908-63574f8c7e77"
ZBA_ID = "0f0fa8c2-87ba-45d6-a876-0d177dd02512"
COMPLETE_YEARS = list(range(2012, 2026))
YEAR_MIN = 2006
YEAR_MAX = 2026

OCC_LABEL = {
    "1-2FAM": "1–2 family",
    "1-3FAM": "1–3 family",
    "1-4FAM": "1–4 family",
    "1-7FAM": "1–7 family",
    "1Unit": "1–2 family",
    "2unit": "1–2 family",
    "3unit": "1–3 family",
    "4unit": "Multifamily",
    "4Unit": "Multifamily",
    "5unit": "Multifamily",
    "6unit": "Multifamily",
    "6Unit": "Multifamily",
    "7unit": "Multifamily",
    "7More": "Multifamily",
    "Multi": "Multifamily",
    "Comm": "Commercial",
    "COMM": "Commercial",
    "Mixed": "Mixed",
    "MIXED": "Mixed",
    "VacLd": "Vacant land",
    "Other": "Other",
}

ZBA_DECISION = {
    "appprov": "Approved",
    "approved": "Approved",
    "deniedprej": "Denied",
    "denied": "Denied",
    "withdrawn": "Withdrawn",
    "withdraw": "Withdrawn",
    "void": "Void",
}

QUALITY_NOTE = (
    "Approved building permits and ZBA cases are separate files. Do not add "
    "ZBA counts into the permit year series. Complete permit years are "
    "2012–2025. 2026 is year-to-date through 29 August — not a full year. "
    "2020 is COVID. After-hours construction is not in this briefing. "
    "mode_type-style substring matching is not used: occupancy and ZBA "
    "decisions are exact codes."
)


def parse_money(raw: str) -> float | None:
    text = strip_null(raw)
    if text == "":
        return 0.0
    text = text.replace("$", "").replace(",", "")
    try:
        return float(text)
    except ValueError:
        return None


def zip5_of(raw: str) -> str:
    digits = "".join(ch for ch in strip_null(raw) if ch.isdigit())
    if len(digits) >= 5:
        return digits[:5]
    if len(digits) == 4:
        return digits.zfill(5)
    return ""


def occupancy_group(raw: str) -> str:
    return OCC_LABEL.get(strip_null(raw), "Other")


def zba_decision_of(raw: str) -> str:
    key = strip_null(raw).lower()
    if not key:
        return ""
    return ZBA_DECISION.get(key, "Other")


def _in_span(dt) -> bool:
    return YEAR_MIN <= dt.year <= YEAR_MAX


def load_permits(path: Path) -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    first = last = None
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["permit_raw"] += 1
            dt = parse_dt(raw.get("issued_date", ""))
            if dt is None or not _in_span(dt):
                quality["permit_drop"] += 1
                continue
            value = parse_money(raw.get("declared_valuation", ""))
            if value is None:
                value = 0.0
            fees = parse_money(raw.get("total_fees", ""))
            if fees is None:
                fees = 0.0
            zip5 = zip5_of(raw.get("zip", ""))
            quality["permit_kept"] += 1
            if first is None or dt < first:
                first = dt
            if last is None or dt > last:
                last = dt
            rows.append({
                "year": dt.year,
                "month": dt.month,
                "hour": dt.hour,
                "weekday": dt.weekday(),
                "type": strip_null(raw.get("permittypedescr", "")),
                "occupancy": occupancy_group(raw.get("occupancytype", "")),
                "status": strip_null(raw.get("status", "")),
                "valuation": value,
                "fees": fees,
                "zip": zip5,
                "neighborhood": ZIP_NEIGHBORHOOD.get(zip5, ""),
                "ward": strip_null(raw.get("ward", "")),
            })
    out = dict(quality)
    if first is not None and last is not None:
        out["permit_min"] = first.date().isoformat()
        out["permit_max"] = last.date().isoformat()
    return rows, out


def load_zba(path: Path) -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    first = last = None
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            quality["zba_raw"] += 1
            dt = (
                parse_dt(raw.get("submitted_date", "") or "")
                or parse_dt(raw.get("received_date", "") or "")
                or parse_dt(raw.get("final_decision_date", "") or "")
            )
            if dt is None or not _in_span(dt):
                quality["zba_drop"] += 1
                continue
            zip5 = zip5_of(raw.get("zip", ""))
            quality["zba_kept"] += 1
            if first is None or dt < first:
                first = dt
            if last is None or dt > last:
                last = dt
            rows.append({
                "year": dt.year,
                "decision": zba_decision_of(raw.get("decision", "")),
                "zip": zip5,
                "neighborhood": ZIP_NEIGHBORHOOD.get(zip5, ""),
                "ward": strip_null(raw.get("ward", "")),
                "zoning_district": strip_null(raw.get("zoning_district", "")),
            })
    out = dict(quality)
    if first is not None and last is not None:
        out["zba_min"] = first.date().isoformat()
        out["zba_max"] = last.date().isoformat()
    return rows, out


def _top(counter: Counter, n: int = 12) -> list[dict]:
    return [{"label": k, "value": v} for k, v in counter.most_common(n) if k]


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


def _year_slice(rows: list[dict], year: int) -> dict:
    n = len(rows)
    hours = Counter(r["hour"] for r in rows)
    peak = max(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    quiet = min(range(24), key=lambda h: hours.get(h, 0)) if n else 0
    return {
        "n": n,
        "per_day": round(n / (_days_in_year(year) if year < 2026 else max(n and 1, 1)), 1) if year < 2026 else 0.0,
        "peak_hour": peak,
        "quiet_hour": quiet,
        "valuation": round(sum(r["valuation"] for r in rows), 0),
        "fees": round(sum(r["fees"] for r in rows), 0),
    }


def briefing_from_rows(permits: list[dict], zba: list[dict], quality: dict) -> dict:
    y2019 = [r for r in permits if r["year"] == 2019]
    y2020 = [r for r in permits if r["year"] == 2020]
    y2025 = [r for r in permits if r["year"] == 2025]
    y2026 = [r for r in permits if r["year"] == 2026]
    permit_years = Counter(r["year"] for r in permits)
    zba_years = Counter(r["year"] for r in zba)
    years_for_by = sorted(set(COMPLETE_YEARS) | {y for y in permit_years if y >= 2012})
    by_year = [
        {"year": y, "permits": permit_years[y], "valuation": round(sum(r["valuation"] for r in permits if r["year"] == y), 0)}
        for y in years_for_by
    ]

    type_year = defaultdict(Counter)
    occ_year = defaultdict(Counter)
    for r in permits:
        if r["year"] in COMPLETE_YEARS:
            if r["type"]:
                type_year[r["year"]][r["type"]] += 1
            occ_year[r["year"]][r["occupancy"]] += 1
    type_names = [name for name, _ in Counter(r["type"] for r in permits if r["year"] in COMPLETE_YEARS and r["type"]).most_common(8)]
    stacked = {
        "years": COMPLETE_YEARS,
        "series": [
            {"name": name, "data": [type_year[y][name] for y in COMPLETE_YEARS]}
            for name in type_names
        ],
    }

    val_2025 = Counter()
    occ_2025 = Counter()
    for r in y2025:
        occ_2025[r["occupancy"]] += 1
        val_2025[r["occupancy"]] += r["valuation"]

    n19 = len(y2019)
    n25 = len(y2025)
    quality_out = dict(quality)
    quality_out["note"] = QUALITY_NOTE

    zba_2019 = [r for r in zba if r["year"] == 2019]
    zba_2025 = [r for r in zba if r["year"] == 2025]
    zba_2026 = [r for r in zba if r["year"] == 2026]

    dates_2026 = ""
    # per_day for 2026 filled below if we have issued dates on rows — year slice uses calendar 2026 YTD after main()
    y2026_slice = {
        "n": len(y2026),
        "per_day": round(len(y2026) / 241, 1) if y2026 else 0.0,  # 1 Jan–29 Aug 2026 = 241 days
        "valuation": round(sum(r["valuation"] for r in y2026), 0),
    }

    return {
        "quality": quality_out,
        "years": COMPLETE_YEARS,
        "by_year": by_year,
        "zba_by_year": [
            {"year": y, "n": zba_years[y]}
            for y in sorted(y for y in zba_years if 2013 <= y <= 2026)
        ],
        "stacked": stacked,
        "y2019": _year_slice(y2019, 2019),
        "y2020": _year_slice(y2020, 2020),
        "y2025": _year_slice(y2025, 2025),
        "y2026_ytd": y2026_slice,
        "hour_2025": [Counter(r["hour"] for r in y2025).get(h, 0) for h in range(24)],
        "weekday_2025": [Counter(r["weekday"] for r in y2025).get(d, 0) for d in range(7)],
        "month_2025": [Counter(r["month"] for r in y2025).get(m, 0) for m in range(1, 13)],
        "types_2025": _top(Counter(r["type"] for r in y2025), 12),
        "occupancy_2025": _top(occ_2025, 12),
        "valuation_2025": [
            {"label": k, "value": round(v, 0)}
            for k, v in sorted(val_2025.items(), key=lambda kv: (-kv[1], kv[0]))
            if k
        ],
        "neighborhoods_2025": _top(Counter(r["neighborhood"] for r in y2025), 12),
        "status_2025": _top(Counter(r["status"] for r in y2025), 8),
        "zba_2019": {"n": len(zba_2019)},
        "zba_2025": {"n": len(zba_2025)},
        "zba_2026_ytd": {"n": len(zba_2026)},
        "zba_decisions": _top(Counter(r["decision"] for r in zba if r["decision"]), 8),
        "zba_districts_2025": _top(Counter(r["zoning_district"] for r in zba_2025), 8),
        "vs_2019": {
            "permits_pct": round(100.0 * (n25 - n19) / n19, 1) if n19 else 0.0,
            "valuation_pct": round(
                100.0
                * (
                    sum(r["valuation"] for r in y2025)
                    - sum(r["valuation"] for r in y2019)
                )
                / sum(r["valuation"] for r in y2019),
                1,
            )
            if y2019 and sum(r["valuation"] for r in y2019)
            else 0.0,
            "n2019": n19,
            "n2025": n25,
        },
    }


def main() -> None:
    permit_path = DOWNLOADS / "building-permits.csv"
    zba_path = DOWNLOADS / "zba-tracker.csv"
    print(f"fetch {permit_path.name}", flush=True)
    download_dump(PERMIT_ID, permit_path)
    print(f"fetch {zba_path.name}", flush=True)
    download_dump(ZBA_ID, zba_path)
    permits, pq = load_permits(permit_path)
    zba, zq = load_zba(zba_path)
    briefing = briefing_from_rows(permits, zba, {**pq, **zq})
    y2026 = [r for r in permits if r["year"] == 2026]
    if y2026:
        # issued through 29 Aug 2026 on the live file
        briefing["y2026_ytd"]["per_day"] = round(len(y2026) / 241, 1)
    (OUT / "permits_stats.json").write_text(json.dumps(briefing, indent=2))
    print(json.dumps({
        "quality": briefing["quality"],
        "y2019": briefing["y2019"],
        "y2020": briefing["y2020"],
        "y2025": briefing["y2025"],
        "y2026_ytd": briefing["y2026_ytd"],
        "vs_2019": briefing["vs_2019"],
        "types_2025": briefing["types_2025"][:6],
        "occupancy_2025": briefing["occupancy_2025"],
        "valuation_2025": briefing["valuation_2025"][:6],
        "neighborhoods_2025": briefing["neighborhoods_2025"][:8],
        "zba_2025": briefing["zba_2025"],
        "zba_decisions": briefing["zba_decisions"],
    }, indent=2))
    print("\nby_year", briefing["by_year"])


if __name__ == "__main__":
    main()
