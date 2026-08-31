#!/usr/bin/env python3
"""Neighborhood timeline 2012-2025: persistent hotspots and issue mix."""

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
    parse_hour,
    parse_money,
    parse_zip,
    property_group,
    series_of,
    strip_null,
    BOSTON_ZIPS,
    ZIP_NEIGHBORHOOD,
)

# Collapse border ZIPs so "area" matches how the City talks.
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


def clean_all():
    rows = []
    rows.extend(load_legacy(DOWNLOADS / "2012-bostonfireincidentopendata.csv", 2012))
    rows.extend(load_legacy(DOWNLOADS / "2013-bostonfireincidentopendata.csv", 2013))
    rows.extend(load_modern(DOWNLOADS / "tmpm7euesbm.csv"))
    incident_codes = load_code_map(DOWNLOADS / "incident-type-code-list.csv")
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
        prop_loss = parse_money(row["estimated_property_loss"])
        cont_loss = parse_money(row["estimated_content_loss"])
        if prop_loss is None or cont_loss is None:
            continue
        exp = (row["exposure_number"] or "0").strip()
        exp = "".join(ch for ch in exp if ch.isdigit()) or "0"
        key = (inc, exp)
        if key in seen:
            continue
        seen.add(key)
        if exp != "0":
            continue
        zip_ok = zip5 in BOSTON_ZIPS
        if not zip_ok:
            continue
        nb = neighborhood_for(
            {
                **row,
                "zip": zip5,
                "city_section": strip_null(row["city_section"]).upper(),
                "neighborhood": row["neighborhood"],
            }
        )
        if not nb and zip_ok:
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
                "desc": strip_null(row["incident_description"]) or incident_codes.get(code, ""),
                "property_use": parse_code(row["property_use"]) or strip_null(row["property_use"]),
                "property_group": property_group(
                    parse_code(row["property_use"]) or strip_null(row["property_use"])
                ),
                "loss": prop_loss + cont_loss,
                "hour": parse_hour(row["alarm_time"]),
            }
        )
    return kept


def main() -> None:
    data = clean_all()
    years = list(range(2012, 2026))
    complete = [y for y in years if y < 2025]

    by_year_area = defaultdict(Counter)
    fire_year_area = defaultdict(Counter)
    bldg_year_area = defaultdict(Counter)
    false_year_area = defaultdict(Counter)
    service_year_area = defaultdict(Counter)
    cooking_year_area = defaultdict(Counter)
    for r in data:
        by_year_area[r["year"]][r["area"]] += 1
        if r["series"] == "Fire":
            fire_year_area[r["year"]][r["area"]] += 1
        if r["code"] == "111":
            bldg_year_area[r["year"]][r["area"]] += 1
        if r["series"] == "False alarm / false call":
            false_year_area[r["year"]][r["area"]] += 1
        if r["series"] == "Service call":
            service_year_area[r["year"]][r["area"]] += 1
        if r["code"] == "113":
            cooking_year_area[r["year"]][r["area"]] += 1

    # Rank #1 each complete year
    rank_incidents = {y: by_year_area[y].most_common() for y in years}
    rank_fires = {y: fire_year_area[y].most_common() for y in years}

    def times_first(rank_map, years_):
        c = Counter()
        for y in years_:
            if rank_map[y]:
                c[rank_map[y][0][0]] += 1
        return c

    def times_top3(rank_map, years_):
        c = Counter()
        for y in years_:
            for area, _ in rank_map[y][:3]:
                c[area] += 1
        return c

    first_inc = times_first(rank_incidents, complete)
    first_fire = times_first(rank_fires, complete)
    top3_inc = times_top3(rank_incidents, complete)
    top3_fire = times_top3(rank_fires, complete)

    totals = Counter()
    fire_tot = Counter()
    bldg_tot = Counter()
    false_tot = Counter()
    service_tot = Counter()
    cooking_tot = Counter()
    loss_tot = Counter()
    for r in data:
        if r["year"] == 2025:
            continue
        totals[r["area"]] += 1
        if r["series"] == "Fire":
            fire_tot[r["area"]] += 1
        if r["code"] == "111":
            bldg_tot[r["area"]] += 1
        if r["series"] == "False alarm / false call":
            false_tot[r["area"]] += 1
        if r["series"] == "Service call":
            service_tot[r["area"]] += 1
        if r["code"] == "113":
            cooking_tot[r["area"]] += 1
        loss_tot[r["area"]] += r["loss"]

    # Pick persistent leader: most years as #1 for fires (life safety)
    # and report incident-volume leader separately.
    fire_leader = first_fire.most_common(1)[0][0]
    vol_leader = first_inc.most_common(1)[0][0]

    def series_for(area, years_):
        return [by_year_area[y][area] for y in years_]

    def fire_series(area, years_):
        return [fire_year_area[y][area] for y in years_]

    top_areas_vol = [a for a, _ in totals.most_common(8)]
    top_areas_fire = [a for a, _ in fire_tot.most_common(8)]

    # Issue mix for the fire leader across complete years
    leader_rows = [r for r in data if r["area"] == fire_leader and r["year"] < 2025]
    leader_series = Counter(r["series"] for r in leader_rows)
    leader_types = Counter(
        f"{r['code']} {(r['desc'] or '')[:40].rstrip()}" for r in leader_rows
    )
    leader_fire_types = Counter(
        f"{r['code']} {(r['desc'] or '')[:40].rstrip()}"
        for r in leader_rows
        if r["series"] == "Fire"
    )
    leader_prop_fire = Counter(
        r["property_group"] for r in leader_rows if r["series"] == "Fire"
    )
    leader_year_series = defaultdict(Counter)
    for r in leader_rows:
        leader_year_series[r["year"]][r["series"]] += 1

    # Fenway as alarm contrast
    fenway = "Fenway / Longwood / Kenmore"
    fenway_rows = [r for r in data if r["area"] == fenway and r["year"] < 2025]
    fenway_series = Counter(r["series"] for r in fenway_rows)

    downtown = "Downtown core"
    dt_rows = [r for r in data if r["area"] == downtown and r["year"] < 2025]
    dt_series = Counter(r["series"] for r in dt_rows)

    # Year-by-year #1 table
    yearly = []
    for y in years:
        inc_top = rank_incidents[y][0] if rank_incidents[y] else ("", 0)
        fire_top = rank_fires[y][0] if rank_fires[y] else ("", 0)
        yearly.append(
            {
                "year": y,
                "top_volume": inc_top[0],
                "top_volume_n": inc_top[1],
                "top_fire": fire_top[0],
                "top_fire_n": fire_top[1],
                "dorchester_inc": by_year_area[y]["Dorchester"],
                "dorchester_fire": fire_year_area[y]["Dorchester"],
                "dorchester_bldg": bldg_year_area[y]["Dorchester"],
                "dorchester_false": false_year_area[y]["Dorchester"],
                "dorchester_service": service_year_area[y]["Dorchester"],
                "dorchester_cooking": cooking_year_area[y]["Dorchester"],
            }
        )

    series_order = [
        "Service call",
        "False alarm / false call",
        "Good intent",
        "Fire",
        "Hazardous condition",
    ]
    leader_stacked = {
        "years": complete,
        "series": [
            {
                "name": s,
                "data": [leader_year_series[y][s] for y in complete],
            }
            for s in series_order
        ],
    }

    out = {
        "n": len(data),
        "fire_leader": fire_leader,
        "vol_leader": vol_leader,
        "years_fire_first": dict(first_fire),
        "years_vol_first": dict(first_inc),
        "years_fire_top3": dict(top3_fire),
        "years_vol_top3": dict(top3_inc),
        "totals_2012_2024": dict(totals.most_common()),
        "fires_2012_2024": dict(fire_tot.most_common()),
        "building_2012_2024": dict(bldg_tot.most_common()),
        "false_2012_2024": dict(false_tot.most_common()),
        "service_2012_2024": dict(service_tot.most_common()),
        "cooking_2012_2024": dict(cooking_tot.most_common()),
        "loss_2012_2024": {k: round(v) for k, v in loss_tot.most_common()},
        "yearly": yearly,
        "volume_lines": {a: series_for(a, complete) for a in top_areas_vol},
        "fire_lines": {a: fire_series(a, complete) for a in top_areas_fire},
        "leader_n": len(leader_rows),
        "leader_series": dict(leader_series.most_common()),
        "leader_types": leader_types.most_common(12),
        "leader_fire_types": leader_fire_types.most_common(10),
        "leader_prop_fire": dict(leader_prop_fire.most_common()),
        "leader_stacked": leader_stacked,
        "fenway_series": dict(fenway_series.most_common()),
        "downtown_series": dict(dt_series.most_common()),
        "y2025": {
            "n": sum(by_year_area[2025].values()),
            "top_volume": rank_incidents[2025][:5],
            "top_fire": rank_fires[2025][:5],
        },
    }
    (OUT / "timeline_areas.json").write_text(json.dumps(out, indent=2))
    print("fire_leader", fire_leader, "years #1 fire", first_fire)
    print("vol_leader", vol_leader, "years #1 vol", first_inc)
    print("top3 fire", top3_fire)
    print("fires 2012-24", fire_tot.most_common(8))
    print("volume 2012-24", totals.most_common(8))
    print("building", bldg_tot.most_common(6))
    print("cooking", cooking_tot.most_common(6))
    print("loss", loss_tot.most_common(6))
    print("\nYEARLY")
    for row in yearly:
        print(
            f"  {row['year']} vol={row['top_volume'][:18]:18} {row['top_volume_n']:5}  "
            f"fire={row['top_fire'][:18]:18} {row['top_fire_n']:4}  "
            f"Dotch inc={row['dorchester_inc']} fire={row['dorchester_fire']} "
            f"cook={row['dorchester_cooking']} 553-ish service={row['dorchester_service']}"
        )
    print("\nleader types", leader_types.most_common(8))
    print("leader fire types", leader_fire_types.most_common(8))
    print("leader series", leader_series)
    print("leader prop fire", leader_prop_fire)
    print("fenway", fenway_series)
    print("downtown", dt_series)
    print("2025", out["y2025"])


if __name__ == "__main__":
    main()
