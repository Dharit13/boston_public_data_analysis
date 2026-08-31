#!/usr/bin/env python3
"""Citywide common fire issues and total loss, 2012-2025."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

from analyze_fire import (
    DOWNLOADS,
    OUT,
    load_code_map,
    load_legacy,
    load_modern,
    neighborhood_for,
    parse_code,
    parse_date,
    parse_money,
    parse_zip,
    property_group,
    series_of,
    strip_null,
    BOSTON_ZIPS,
    ZIP_NEIGHBORHOOD,
)

ROLLUP = {
    "Roxbury / Dorchester": "Dorchester",
    "Mission Hill / Roxbury": "Roxbury",
    "Allston": "Allston-Brighton",
    "Brighton": "Allston-Brighton",
    "Fenway / Longwood": "Fenway / Longwood / Kenmore",
    "Fenway / Kenmore": "Fenway / Longwood / Kenmore",
    "Beacon Hill / Downtown": "Downtown core",
    "Downtown / North End": "Downtown core",
    "Financial District / Waterfront": "Downtown core",
    "Chinatown / Leather District": "Downtown core",
    "North End": "Downtown core",
    "West End / Beacon Hill": "Downtown core",
}


def area_of(nb: str) -> str:
    return ROLLUP.get(nb, nb)


def clean():
    rows = []
    rows.extend(load_legacy(DOWNLOADS / "2012-bostonfireincidentopendata.csv", 2012))
    rows.extend(load_legacy(DOWNLOADS / "2013-bostonfireincidentopendata.csv", 2013))
    rows.extend(load_modern(DOWNLOADS / "tmpm7euesbm.csv"))
    codes = load_code_map(DOWNLOADS / "incident-type-code-list.csv")
    seen = set()
    kept = []
    for row in rows:
        inc = row["incident_number"]
        if not inc:
            continue
        dt = parse_date(row["alarm_date"])
        if dt is None or not (2012 <= dt.year <= 2025):
            continue
        code = parse_code(row["incident_type"])
        if not code:
            continue
        zip5 = parse_zip(row["zip"])
        if zip5 not in BOSTON_ZIPS:
            continue
        prop_loss = parse_money(row["estimated_property_loss"])
        cont_loss = parse_money(row["estimated_content_loss"])
        if prop_loss is None or cont_loss is None:
            continue
        exp = "".join(ch for ch in (row["exposure_number"] or "0") if ch.isdigit()) or "0"
        key = (inc, exp)
        if key in seen or exp != "0":
            continue
        seen.add(key)
        nb = neighborhood_for({**row, "zip": zip5, "city_section": strip_null(row["city_section"]).upper()})
        if not nb:
            nb = ZIP_NEIGHBORHOOD.get(zip5, "")
        area = area_of(nb)
        if not area:
            continue
        kept.append(
            {
                "year": dt.year,
                "area": area,
                "series": series_of(code),
                "code": code,
                "desc": (strip_null(row["incident_description"]) or codes.get(code, "")).rstrip(),
                "prop_group": property_group(parse_code(row["property_use"]) or strip_null(row["property_use"])),
                "prop_loss": prop_loss,
                "cont_loss": cont_loss,
                "loss": prop_loss + cont_loss,
            }
        )
    return kept


def main() -> None:
    data = clean()
    fires = [r for r in data if r["series"] == "Fire"]
    complete = [r for r in fires if r["year"] < 2025]
    complete_all = [r for r in data if r["year"] < 2025]
    years = list(range(2012, 2025))

    type_tot = Counter(f"{r['code']} {r['desc'][:42]}" for r in complete)
    type_year = defaultdict(Counter)
    for r in complete:
        type_year[r["code"]][r["year"]] += 1

    # Common across areas: in how many areas is this type top-3 fire type?
    areas = sorted({r["area"] for r in complete})
    area_types = defaultdict(Counter)
    for r in complete:
        area_types[r["area"]][r["code"]] += 1
    area_top3 = defaultdict(set)
    for area, c in area_types.items():
        for code, _ in c.most_common(3):
            area_top3[code].add(area)
    common = sorted(
        ((code, len(s), s) for code, s in area_top3.items()),
        key=lambda x: (-x[1], x[0]),
    )

    # Also: type present as #1 fire type in N areas
    area_first = Counter()
    for area, c in area_types.items():
        area_first[c.most_common(1)[0][0]] += 1

    code_label = {}
    for r in complete:
        code_label.setdefault(r["code"], f"{r['code']} {r['desc'][:42]}")

    # Fire family buckets
    def family(code: str) -> str:
        if code in {"111", "112", "110"}:
            return "Building / structure fire"
        if code in {"113", "114", "115", "116", "117", "118"}:
            return "Confined / contained fire (mostly cooking)"
        if code.startswith("13"):
            return "Vehicle fire"
        if code.startswith("14"):
            return "Vegetation / brush / grass"
        if code.startswith("15"):
            return "Outside trash / dumpster"
        if code.startswith("16"):
            return "Other outside fire"
        return "Other fire"

    fam_tot = Counter(family(r["code"]) for r in complete)
    fam_year = defaultdict(Counter)
    fam_loss = Counter()
    for r in complete:
        fam_year[family(r["code"])][r["year"]] += 1
        fam_loss[family(r["code"])] += r["loss"]

    prop_fire = Counter(r["prop_group"] for r in complete)

    # Loss
    loss_year = defaultdict(lambda: {"dollars": 0.0, "events": 0, "prop": 0.0, "cont": 0.0, "fire_dollars": 0.0, "bldg_dollars": 0.0})
    for r in complete_all:
        b = loss_year[r["year"]]
        if r["loss"] > 0:
            b["dollars"] += r["loss"]
            b["events"] += 1
            b["prop"] += r["prop_loss"]
            b["cont"] += r["cont_loss"]
        if r["series"] == "Fire":
            b["fire_dollars"] += r["loss"]
        if r["code"] == "111":
            b["bldg_dollars"] += r["loss"]

    y2025 = [r for r in data if r["year"] == 2025]
    loss_2025 = sum(r["loss"] for r in y2025)
    fire_2025 = sum(1 for r in y2025 if r["series"] == "Fire")

    total_loss = sum(loss_year[y]["dollars"] for y in years)
    total_prop = sum(loss_year[y]["prop"] for y in years)
    total_cont = sum(loss_year[y]["cont"] for y in years)
    total_fire_loss = sum(loss_year[y]["fire_dollars"] for y in years)
    total_bldg_loss = sum(loss_year[y]["bldg_dollars"] for y in years)
    total_events = sum(loss_year[y]["events"] for y in years)

    # Loss by area and by type
    loss_area = Counter()
    loss_code = Counter()
    fire_loss_code = Counter()
    for r in complete_all:
        loss_area[r["area"]] += r["loss"]
        if r["loss"] > 0:
            loss_code[r["code"]] += r["loss"]
        if r["series"] == "Fire":
            fire_loss_code[r["code"]] += r["loss"]

    # Cooking vs building share of fires by year
    cook_year = [sum(1 for r in complete if r["year"] == y and r["code"] == "113") for y in years]
    bldg_year = [sum(1 for r in complete if r["year"] == y and r["code"] == "111") for y in years]
    fire_n_year = [sum(1 for r in complete if r["year"] == y) for y in years]

    top_codes = [c for c, _ in type_tot.most_common(8)]
    # map top codes to yearly series
    # extract code from "113 Cooking..."
    top_code_ids = []
    seen_c = set()
    for label, n in type_tot.most_common(10):
        cid = label.split()[0]
        if cid not in seen_c:
            seen_c.add(cid)
            top_code_ids.append(cid)

    yearly_types = {c: [type_year[c][y] for y in years] for c in top_code_ids[:6]}

    fam_order = [
        "Confined / contained fire (mostly cooking)",
        "Building / structure fire",
        "Outside trash / dumpster",
        "Vegetation / brush / grass",
        "Vehicle fire",
        "Other outside fire",
        "Other fire",
    ]

    out = {
        "fires_2012_2024": len(complete),
        "type_tot": type_tot.most_common(15),
        "family_tot": [(k, fam_tot[k]) for k in fam_order if fam_tot[k]],
        "family_year": {k: [fam_year[k][y] for y in years] for k in fam_order if fam_tot[k]},
        "family_loss": {k: round(fam_loss[k]) for k in fam_order},
        "prop_fire": prop_fire.most_common(),
        "areas_n": len(areas),
        "common_top3": [
            {
                "code": code,
                "label": code_label.get(code, code),
                "areas": n,
                "of": len(areas),
                "count": sum(area_types[a][code] for a in areas),
            }
            for code, n, _ in common
        ],
        "area_first": {code_label.get(c, c): n for c, n in area_first.most_common()},
        "cook_year": cook_year,
        "bldg_year": bldg_year,
        "fire_n_year": fire_n_year,
        "yearly_types": {code_label.get(c, c): yearly_types[c] for c in yearly_types},
        "loss_year": [
            {
                "year": y,
                "dollars": round(loss_year[y]["dollars"]),
                "events": loss_year[y]["events"],
                "prop": round(loss_year[y]["prop"]),
                "cont": round(loss_year[y]["cont"]),
                "fire": round(loss_year[y]["fire_dollars"]),
                "building": round(loss_year[y]["bldg_dollars"]),
            }
            for y in years
        ],
        "loss_2025_ytd": round(loss_2025),
        "fires_2025_ytd": fire_2025,
        "total_loss_2012_2024": round(total_loss),
        "total_prop": round(total_prop),
        "total_cont": round(total_cont),
        "total_fire_loss": round(total_fire_loss),
        "total_bldg_loss": round(total_bldg_loss),
        "total_loss_events": total_events,
        "loss_area": [(a, round(v)) for a, v in loss_area.most_common(12)],
        "loss_code": [(code_label.get(c, c), round(v)) for c, v in fire_loss_code.most_common(8)],
        "cum": [],
    }
    running = 0
    for y in years:
        running += loss_year[y]["dollars"]
        out["cum"].append(round(running))

    (OUT / "fire_issues_loss.json").write_text(json.dumps(out, indent=2))
    print("fires", len(complete), "areas", len(areas))
    print("types", type_tot.most_common(10))
    print("family", out["family_tot"])
    print("area_first", out["area_first"])
    print("common_top3")
    for row in out["common_top3"][:8]:
        print(" ", row)
    print("prop", prop_fire.most_common(5))
    print("TOTAL LOSS", f"${total_loss:,.0f}", "events", total_events)
    print("  property", total_prop, "content", total_cont)
    print("  fire loss", total_fire_loss, "building", total_bldg_loss)
    print("  2025 ytd", loss_2025)
    print("loss by year")
    for row in out["loss_year"]:
        print(" ", row["year"], f"${row['dollars']:,}", "bldg", f"${row['building']:,}")
    print("cum 2024", out["cum"][-1])
    print("loss area", out["loss_area"][:6])
    print("loss code", out["loss_code"][:6])
    print("cook year", cook_year)
    print("bldg year", bldg_year)
    print("family year", out["family_year"])
    print("yearly types", {k: v for k, v in list(out["yearly_types"].items())[:6]})


if __name__ == "__main__":
    main()
