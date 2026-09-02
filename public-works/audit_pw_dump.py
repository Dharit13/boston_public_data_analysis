#!/usr/bin/env python3
"""Audit Public Works dumps: citation grain, work-zone permits, asset snapshots."""
from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from common import DOWNLOADS, OUT, download_dump, parse_dt, strip_null

CITATION_ID = "90ed3816-5e70-443c-803d-9a71f44470be"
WORKZONE_ID = "36fcf981-e414-4891-93ea-f5905cec46fc"
LIGHT_ID = "c2fcc1e3-c38f-44ad-a0cf-e5ea2a6585b5"
SNOW_ID = "a7a4ca31-f0fe-451d-be73-89fcc52ea0d2"

CITATION_CSV = DOWNLOADS / "pw-code-enforcement-violations.csv"
WORKZONE_CSV = DOWNLOADS / "pw-active-work-zones.csv"
LIGHT_CSV = DOWNLOADS / "pw-streetlight-locations.csv"
SNOW_CSV = DOWNLOADS / "pw-snow-emergency-routes.csv"


def citation_identity(row: dict) -> str:
    ticket = strip_null(row.get("ticket_no"))
    if ticket:
        return ticket
    return strip_null(row.get("case_no"))


def exact_dup_key(row: dict) -> tuple:
    return (
        citation_identity(row),
        strip_null(row.get("code")),
        strip_null(row.get("status")),
        strip_null(row.get("status_dttm")),
        strip_null(row.get("value")),
    )


def _norm_cat(raw: str) -> str:
    text = strip_null(raw).upper()
    text = re.sub(r"\s+", " ", text)
    text = text.replace("AND / OR", "AND/OR")
    return text


def audit_citations(path: Path) -> dict:
    raw = 0
    seen_dup = Counter()
    by_ticket: dict[str, set[str]] = defaultdict(set)
    status_by_ticket: dict[str, set[str]] = defaultdict(set)
    void = set()
    null_ticket = 0
    years = Counter()
    codes = Counter()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for row in csv.DictReader(handle):
            raw += 1
            ident = citation_identity(row)
            if not strip_null(row.get("ticket_no")):
                null_ticket += 1
            seen_dup[exact_dup_key(row)] += 1
            code = strip_null(row.get("code"))
            status = strip_null(row.get("status"))
            if ident:
                by_ticket[ident].add(code)
                if status:
                    status_by_ticket[ident].add(status)
            if status.lower() == "void" and ident:
                void.add(ident)
            dt = parse_dt(row.get("status_dttm", ""))
            if dt:
                years[dt.year] += 1
            if code:
                desc = strip_null(row.get("description"))
                codes[(code, desc)] += 1
    exact_dup_rows = sum(n - 1 for n in seen_dup.values() if n > 1)
    multi_code = sum(1 for codeset in by_ticket.values() if len(codeset) > 1)
    closed_open = 0
    for ident, statuses in status_by_ticket.items():
        lowered = {s.lower() for s in statuses}
        if "closed" in lowered and "open" in lowered:
            closed_open += 1
    return {
        "raw_rows": raw,
        "unique_tickets": len(by_ticket),
        "multi_code_tickets": multi_code,
        "exact_dup_rows": exact_dup_rows,
        "void_tickets": len(void),
        "null_ticket_rows": null_ticket,
        "closed_and_open_tickets": closed_open,
        "year_histogram_raw": dict(sorted(years.items())),
        "top_code_desc": [
            {"code": c, "description": d, "n": n}
            for (c, d), n in codes.most_common(40)
        ],
    }


def audit_workzones(path: Path) -> dict:
    raw = 0
    permits = set()
    cats = Counter()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for row in csv.DictReader(handle):
            raw += 1
            permit = strip_null(row.get("Permit") or row.get("permit"))
            if permit:
                permits.add(permit)
            cats[_norm_cat(row.get("Project_Category") or row.get("project_category") or "")] += 1
    return {
        "raw_rows": raw,
        "unique_permits": len(permits),
        "categories": dict(cats),
    }


def audit_streetlights(path: Path) -> dict:
    raw = 0
    with_coord = 0
    types = Counter()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for row in csv.DictReader(handle):
            raw += 1
            types[strip_null(row.get("TYPE") or row.get("Type") or row.get("type"))] += 1
            lat = strip_null(row.get("Lat") or row.get("lat") or row.get("Y") or row.get("y"))
            lon = strip_null(row.get("Long") or row.get("Lon") or row.get("long") or row.get("X") or row.get("x"))
            if lat and lon:
                with_coord += 1
    return {
        "raw_rows": raw,
        "with_lat_lon": with_coord,
        "types": dict(types),
        "vintage_caption": "Streetlight Locations last modified 2016-12-11. Not an outage log.",
    }


def audit_snow_routes(path: Path) -> dict:
    raw = 0
    names = set()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for row in csv.DictReader(handle):
            raw += 1
            name = strip_null(row.get("FULL_NAME") or row.get("Full_Name") or row.get("STREET"))
            if name:
                names.add(name)
    return {
        "raw_rows": raw,
        "named_segments": len(names),
        "grain": "Named snow-emergency route segment, not a plow run.",
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
    citations = audit_citations(CITATION_CSV)
    workzones = audit_workzones(WORKZONE_CSV)
    streetlights = audit_streetlights(LIGHT_CSV)
    snow = audit_snow_routes(SNOW_CSV)
    audit = {
        "citations": citations,
        "workzones": workzones,
        "streetlights": streetlights,
        "snow_routes": snow,
        "collapse_rules": {
            "exact_dup": "Drop rows sharing ticket/case, code, status, status_dttm, value.",
            "volume": "Unique ticket_no (case_no if ticket empty).",
            "issue_year": "min(status_dttm) per ticket.",
            "open_caseload": "Latest status Open; never mixed into year-pill n.",
            "void": "Exclude from volume, fines, and street lists.",
        },
    }
    dest = OUT / "pw_dump_audit.json"
    dest.write_text(json.dumps(audit, indent=2))
    print(json.dumps({
        "citations": {
            "raw_rows": citations["raw_rows"],
            "unique_tickets": citations["unique_tickets"],
            "multi_code_tickets": citations["multi_code_tickets"],
            "exact_dup_rows": citations["exact_dup_rows"],
            "void_tickets": citations["void_tickets"],
            "null_ticket_rows": citations["null_ticket_rows"],
            "closed_and_open_tickets": citations["closed_and_open_tickets"],
            "top_code_desc": citations["top_code_desc"][:8],
            "year_histogram_raw": citations["year_histogram_raw"],
        },
        "workzones": workzones,
        "streetlights": {
            "raw_rows": streetlights["raw_rows"],
            "with_lat_lon": streetlights["with_lat_lon"],
            "types": streetlights["types"],
        },
        "snow_routes": snow,
    }, indent=2))
    print(f"wrote {dest}", flush=True)


if __name__ == "__main__":
    main()
