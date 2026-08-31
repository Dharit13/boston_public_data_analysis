#!/usr/bin/env python3
"""Clean Boston Fire incident files and produce briefing stats."""

from __future__ import annotations

import csv
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path(os.environ.get("BOSTON_ANALYSIS_OUT", HERE / "outputs"))
DOWNLOADS = Path(os.environ.get("BOSTON_DATA_DIR", Path.home() / "Downloads"))
OUT.mkdir(parents=True, exist_ok=True)

BOSTON_ZIPS = {
    "02108", "02109", "02110", "02111", "02113", "02114", "02115", "02116",
    "02118", "02119", "02120", "02121", "02122", "02124", "02125", "02126",
    "02127", "02128", "02129", "02130", "02131", "02132", "02134", "02135",
    "02136", "02163", "02199", "02201", "02203", "02205", "02210", "02215",
    "02222", "02283", "02284",
}

ZIP_NEIGHBORHOOD = {
    "02108": "Beacon Hill / Downtown",
    "02109": "Downtown / North End",
    "02110": "Financial District / Waterfront",
    "02111": "Chinatown / Leather District",
    "02113": "North End",
    "02114": "West End / Beacon Hill",
    "02115": "Fenway / Longwood",
    "02116": "Back Bay / Bay Village",
    "02118": "South End",
    "02119": "Roxbury",
    "02120": "Mission Hill / Roxbury",
    "02121": "Roxbury / Dorchester",
    "02122": "Dorchester",
    "02124": "Dorchester",
    "02125": "Dorchester",
    "02126": "Mattapan",
    "02127": "South Boston",
    "02128": "East Boston",
    "02129": "Charlestown",
    "02130": "Jamaica Plain",
    "02131": "Roslindale",
    "02132": "West Roxbury",
    "02134": "Allston",
    "02135": "Brighton",
    "02136": "Hyde Park",
    "02163": "Allston",
    "02199": "Back Bay / Bay Village",
    "02201": "Financial District / Waterfront",
    "02203": "Financial District / Waterfront",
    "02205": "Financial District / Waterfront",
    "02210": "Seaport / Fort Point",
    "02215": "Fenway / Kenmore",
    "02222": "Financial District / Waterfront",
}

SECTION_NEIGHBORHOOD = {
    "EB": "East Boston",
    "CH": "Charlestown",
    "BO": "Downtown / Central",
    "SB": "South Boston",
    "DO": "Dorchester",
    "RX": "Roxbury",
    "JP": "Jamaica Plain",
    "RS": "Roslindale",
    "WR": "West Roxbury",
    "HP": "Hyde Park",
    "MT": "Mattapan",
    "BR": "Allston-Brighton",
    "RE": "Readville",
}

SERIES_LABEL = {
    "1": "Fire",
    "2": "Explosion / overpressure (no fire)",
    "3": "Rescue / EMS",
    "4": "Hazardous condition",
    "5": "Service call",
    "6": "Good intent",
    "7": "False alarm / false call",
    "8": "Severe weather",
    "9": "Special incident",
}

FIRE_FOCUS = {
    "111": "Building fire",
    "113": "Cooking fire (confined)",
    "118": "Trash fire (contained)",
    "131": "Passenger vehicle fire",
    "140": "Vegetation fire (other)",
    "142": "Brush fire",
    "151": "Outside trash fire",
    "154": "Dumpster fire",
}

HAZARD_FOCUS = {
    "412": "Gas leak (natural gas / LPG)",
    "424": "Carbon monoxide incident",
    "440": "Electrical wiring/equipment",
    "445": "Arcing, shorted electrical equipment",
}

FALSE_ALARM_FOCUS = {
    "700": "False alarm, other",
    "714": "Malicious false alarm (central station)",
    "735": "Alarm sounded due to malfunction",
    "743": "Smoke detector, no fire (unintentional)",
    "745": "Alarm system, no fire (unintentional)",
    "746": "CO detector activation, no CO",
}

PROP_GROUP = {
    "1": "Assembly (restaurants, worship, rec)",
    "2": "Educational",
    "3": "Health care / detention",
    "4": "Residential",
    "5": "Mercantile / business",
    "6": "Industrial / manufacturing",
    "7": "Manufacturing (other)",
    "8": "Storage",
    "9": "Outside / special / street",
}


def strip_null(value: str | None) -> str:
    if value is None:
        return ""
    text = value.strip()
    if text.upper() in {"", "NULL", "NONE", "NAN", "N/A", "NA"}:
        return ""
    return text


def parse_date(raw: str) -> datetime | None:
    raw = strip_null(raw)
    if not raw:
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%y", "%m/%d/%Y"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    return None


def parse_hour(raw: str) -> int | None:
    raw = strip_null(raw)
    if not raw:
        return None
    raw = raw.replace(".", ":")
    for fmt in ("%H:%M:%S", "%H:%M", "%-H:%M:%S"):
        try:
            return datetime.strptime(raw, fmt.replace("%-H", "%H")).hour
        except ValueError:
            continue
    m = re.match(r"^(\d{1,2}):", raw)
    if m:
        hour = int(m.group(1))
        if 0 <= hour <= 23:
            return hour
    return None


def parse_money(raw: str) -> float | None:
    raw = strip_null(raw)
    if raw == "":
        return 0.0
    raw = raw.replace("$", "").replace(",", "")
    try:
        value = float(raw)
    except ValueError:
        return None
    if value < 0 or value > 50_000_000:
        return None
    return value


def parse_code(raw: str) -> str:
    raw = strip_null(raw).upper()
    if not raw or raw in {"NNN", "UUU", "XXX"}:
        return ""
    if raw.isdigit() and 100 <= int(raw) <= 999:
        return raw.zfill(3)
    if raw.isdigit() and 1 <= int(raw) <= 99:
        return ""
    return ""


def parse_zip(raw: str) -> str:
    raw = strip_null(raw)
    digits = re.sub(r"\D", "", raw)
    if len(digits) >= 5:
        return digits[:5]
    return ""


def load_code_map(path: Path) -> dict[str, str]:
    mapping: dict[str, str] = {}
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            code = strip_null(row.get("code", "")).zfill(3) if strip_null(row.get("code", "")).isdigit() else strip_null(row.get("code", ""))
            desc = strip_null(row.get("descript", "")).rstrip()
            if code:
                mapping[code] = desc
    return mapping


def neighborhood_for(row: dict) -> str:
    z = row.get("zip", "")
    if z in ZIP_NEIGHBORHOOD:
        return ZIP_NEIGHBORHOOD[z]
    named = strip_null(row.get("neighborhood", ""))
    if named and named.lower() not in {"boston", "null"}:
        aliases = {
            "Allston-Brighton": "Allston-Brighton",
            "Hyde Park": "Hyde Park",
            "Roxbury": "Roxbury",
            "Jamaica Plain": "Jamaica Plain",
            "South Boston": "South Boston",
            "Dorchester": "Dorchester",
            "West Roxbury": "West Roxbury",
            "East Boston": "East Boston",
            "Charlestown": "Charlestown",
            "Mattapan": "Mattapan",
            "Roslindale": "Roslindale",
        }
        return aliases.get(named, named)
    section = strip_null(row.get("city_section", "")).upper()
    if section in SECTION_NEIGHBORHOOD:
        return SECTION_NEIGHBORHOOD[section]
    return ""


def series_of(code: str) -> str:
    if not code:
        return ""
    return SERIES_LABEL.get(code[0], "Other")


def property_group(code: str) -> str:
    if not code:
        return "Unknown"
    if code[0] in PROP_GROUP:
        return PROP_GROUP[code[0]]
    return "Unknown"


def load_legacy(path: Path, year_hint: int) -> list[dict]:
    rows = []
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        reader = csv.DictReader(handle)
        for raw in reader:
            rows.append({
                "incident_number": strip_null(raw.get("Incident Number")),
                "exposure_number": strip_null(raw.get("Exposure Number")) or "0",
                "alarm_date": strip_null(raw.get("Alarm Date")),
                "alarm_time": strip_null(raw.get("Alarm Time")),
                "incident_type": strip_null(raw.get("Incident Type")),
                "incident_description": strip_null(raw.get("Incident Description")),
                "estimated_property_loss": strip_null(raw.get("Estimated Property Loss")),
                "estimated_content_loss": strip_null(raw.get("Estimated Content Loss")),
                "district": strip_null(raw.get("District")),
                "city_section": strip_null(raw.get("City Section")),
                "neighborhood": strip_null(raw.get("Neighborhood")),
                "zip": strip_null(raw.get("Zip")),
                "property_use": strip_null(raw.get("Property Use")),
                "property_description": strip_null(raw.get("Property Description")),
                "street_name": strip_null(raw.get("Street Name")),
                "source_year": year_hint,
            })
    return rows


def load_modern(path: Path) -> list[dict]:
    rows = []
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        reader = csv.DictReader(handle)
        for raw in reader:
            rows.append({
                "incident_number": strip_null(raw.get("incident_number")),
                "exposure_number": strip_null(raw.get("exposure_number")) or "0",
                "alarm_date": strip_null(raw.get("alarm_date")),
                "alarm_time": strip_null(raw.get("alarm_time")),
                "incident_type": strip_null(raw.get("incident_type")),
                "incident_description": strip_null(raw.get("incident_description")),
                "estimated_property_loss": strip_null(raw.get("estimated_property_loss")),
                "estimated_content_loss": strip_null(raw.get("estimated_content_loss")),
                "district": strip_null(raw.get("district")),
                "city_section": strip_null(raw.get("city_section")),
                "neighborhood": strip_null(raw.get("neighborhood")),
                "zip": strip_null(raw.get("zip")),
                "property_use": strip_null(raw.get("property_use")),
                "property_description": strip_null(raw.get("property_description")),
                "street_name": strip_null(raw.get("street_name")),
                "source_year": None,
            })
    return rows


def main() -> None:
    incident_codes = load_code_map(DOWNLOADS / "incident-type-code-list.csv")
    property_codes = load_code_map(DOWNLOADS / "property-use-code-list.csv")

    raw_rows = []
    raw_rows.extend(load_legacy(DOWNLOADS / "2012-bostonfireincidentopendata.csv", 2012))
    raw_rows.extend(load_legacy(DOWNLOADS / "2013-bostonfireincidentopendata.csv", 2013))
    raw_rows.extend(load_modern(DOWNLOADS / "tmpm7euesbm.csv"))

    quality = Counter()
    seen_keys: set[tuple[str, str]] = set()
    kept = []

    for row in raw_rows:
        quality["raw"] += 1
        inc = row["incident_number"]
        if not inc:
            quality["drop_no_incident_number"] += 1
            continue
        dt = parse_date(row["alarm_date"])
        if dt is None or not (2012 <= dt.year <= 2025):
            quality["drop_bad_date"] += 1
            continue
        code = parse_code(row["incident_type"])
        if not code:
            quality["drop_bad_incident_type"] += 1
            continue
        zip5 = parse_zip(row["zip"])
        prop_loss = parse_money(row["estimated_property_loss"])
        cont_loss = parse_money(row["estimated_content_loss"])
        if prop_loss is None or cont_loss is None:
            quality["drop_bad_loss"] += 1
            continue
        exp = re.sub(r"\D", "", row["exposure_number"]) or "0"
        key = (inc, exp)
        if key in seen_keys:
            quality["drop_duplicate"] += 1
            continue
        seen_keys.add(key)

        district = strip_null(row["district"]).lstrip("0") or strip_null(row["district"])
        if district and not district.isdigit():
            district = ""

        zip_ok = zip5 in BOSTON_ZIPS
        in_boston = zip_ok or bool(strip_null(row["city_section"])) or (
            strip_null(row["neighborhood"]).lower() not in {"", "null", "boston"} and zip5 != "99999"
        )
        if zip5 == "99999":
            quality["flag_placeholder_zip"] += 1
            in_boston = False
        if zip5 and not zip_ok:
            quality["flag_non_boston_zip"] += 1

        cleaned = {
            "incident_number": inc,
            "exposure": int(exp),
            "date": dt.date().isoformat(),
            "year": dt.year,
            "month": dt.month,
            "weekday": dt.weekday(),  # Mon=0
            "hour": parse_hour(row["alarm_time"]),
            "incident_type": code,
            "incident_desc": strip_null(row["incident_description"]) or incident_codes.get(code, ""),
            "series": series_of(code),
            "property_use": parse_code(row["property_use"]) or strip_null(row["property_use"]),
            "property_desc": strip_null(row["property_description"]) or property_codes.get(parse_code(row["property_use"]), ""),
            "property_group": property_group(parse_code(row["property_use"]) or strip_null(row["property_use"])),
            "prop_loss": prop_loss,
            "cont_loss": cont_loss,
            "total_loss": prop_loss + cont_loss,
            "district": district,
            "city_section": strip_null(row["city_section"]).upper(),
            "zip": zip5,
            "zip_ok": zip_ok,
            "in_boston": in_boston,
            "street_name": strip_null(row["street_name"]).title(),
        }
        cleaned["neighborhood"] = neighborhood_for({**row, "zip": zip5, "city_section": cleaned["city_section"], "neighborhood": row["neighborhood"]})
        if not cleaned["neighborhood"] and zip_ok:
            cleaned["neighborhood"] = ZIP_NEIGHBORHOOD.get(zip5, "")
        kept.append(cleaned)
        quality["kept"] += 1
        if exp != "0":
            quality["kept_exposures"] += 1

    primaries = [r for r in kept if r["exposure"] == 0]
    boston = [r for r in primaries if r["in_boston"]]
    complete_years = [r for r in boston if r["year"] < 2025]
    y2024 = [r for r in boston if r["year"] == 2024]
    y2012 = [r for r in boston if r["year"] == 2012]
    y2025 = [r for r in boston if r["year"] == 2025]

    def count_by(rows, keyfn):
        c = Counter(keyfn(r) for r in rows)
        return c

    def top(counter, n=12):
        return [{"label": k, "value": v} for k, v in counter.most_common(n) if k]

    by_year = count_by(boston, lambda r: r["year"])
    by_series_2024 = count_by(y2024, lambda r: r["series"])
    by_series_2012 = count_by(y2012, lambda r: r["series"])

    fires_2024 = [r for r in y2024 if r["series"] == "Fire"]
    fires_all = [r for r in complete_years if r["series"] == "Fire"]
    building_fires_2024 = [r for r in y2024 if r["incident_type"] == "111"]
    cooking_2024 = [r for r in y2024 if r["incident_type"] == "113"]
    false_2024 = [r for r in y2024 if r["series"] == "False alarm / false call"]
    service_2024 = [r for r in y2024 if r["series"] == "Service call"]
    hazard_2024 = [r for r in y2024 if r["series"] == "Hazardous condition"]

    year_series = defaultdict(Counter)
    year_fires = Counter()
    year_false = Counter()
    year_building = Counter()
    year_loss = defaultdict(float)
    year_loss_incidents = Counter()
    for r in boston:
        year_series[r["year"]][r["series"]] += 1
        if r["series"] == "Fire":
            year_fires[r["year"]] += 1
        if r["series"] == "False alarm / false call":
            year_false[r["year"]] += 1
        if r["incident_type"] == "111":
            year_building[r["year"]] += 1
        if r["total_loss"] > 0:
            year_loss[r["year"]] += r["total_loss"]
            year_loss_incidents[r["year"]] += 1

    years_sorted = sorted(by_year)
    series_order = [
        "False alarm / false call",
        "Service call",
        "Good intent",
        "Hazardous condition",
        "Fire",
        "Rescue / EMS",
        "Explosion / overpressure (no fire)",
        "Severe weather",
        "Special incident",
    ]

    stacked = {
        "years": years_sorted,
        "series": [
            {"name": s, "data": [year_series[y][s] for y in years_sorted]}
            for s in series_order
            if any(year_series[y][s] for y in years_sorted)
        ],
    }

    by_hour_2024 = count_by([r for r in y2024 if r["hour"] is not None], lambda r: r["hour"])
    by_hour_fire = count_by([r for r in fires_2024 if r["hour"] is not None], lambda r: r["hour"])
    by_wd_2024 = count_by(y2024, lambda r: r["weekday"])
    by_month_2024 = count_by(y2024, lambda r: r["month"])

    # Neighborhood: prefer city_section mapping for 2014+, zip for earlier
    nb_2024 = count_by([r for r in y2024 if r["neighborhood"]], lambda r: r["neighborhood"])
    nb_fire_2024 = count_by([r for r in fires_2024 if r["neighborhood"]], lambda r: r["neighborhood"])
    nb_building_2024 = count_by([r for r in building_fires_2024 if r["neighborhood"]], lambda r: r["neighborhood"])
    nb_false_2024 = count_by([r for r in false_2024 if r["neighborhood"]], lambda r: r["neighborhood"])

    district_2024 = count_by([r for r in y2024 if r["district"]], lambda r: f"District {r['district']}")
    district_fire = count_by([r for r in fires_2024 if r["district"]], lambda r: f"District {r['district']}")

    type_2024 = count_by(y2024, lambda r: f"{r['incident_type']} {r['incident_desc'][:42].rstrip()}")
    fire_types_2024 = count_by(fires_2024, lambda r: f"{r['incident_type']} {r['incident_desc'][:42].rstrip()}")
    prop_2024 = count_by(y2024, lambda r: r["property_group"])
    prop_fire = count_by(fires_2024, lambda r: r["property_group"])
    prop_desc_fire = count_by(fires_2024, lambda r: r["property_desc"][:48] or "Unknown")

    residential_codes = {"419", "429", "400", "439", "449", "459", "460", "462", "464"}
    mf_2024 = [r for r in y2024 if r["property_use"] == "429"]
    sf_2024 = [r for r in y2024 if r["property_use"] == "419"]

    loss_2024 = sum(r["total_loss"] for r in y2024)
    loss_building = sum(r["total_loss"] for r in building_fires_2024)
    loss_events_2024 = [r for r in y2024 if r["total_loss"] > 0]
    top_loss = sorted(y2024, key=lambda r: r["total_loss"], reverse=True)[:8]

    # Repeat-alarm addresses: street + zip for false alarms
    repeat_false = Counter()
    for r in false_2024:
        if r["street_name"] and r["zip"]:
            repeat_false[f"{r['street_name']} ({r['zip']})"] += 1

    # 2012 vs 2024 mix shares
    def shares(counter, total):
        return {k: round(100.0 * v / total, 1) for k, v in counter.items()} if total else {}

    # Quality by year
    q_year = Counter(r["year"] for r in primaries)
    boston_year = Counter(r["year"] for r in boston)
    zip_ok_year = Counter(r["year"] for r in primaries if r["zip_ok"])
    nb_year = Counter(r["year"] for r in primaries if r["neighborhood"])

    max_2025 = max((r["date"] for r in y2025), default="")
    min_2025 = min((r["date"] for r in y2025), default="")

    # Cooking vs building as prevention story
    cooking_all = Counter(r["year"] for r in complete_years if r["incident_type"] == "113")
    confined_structure = Counter(
        r["year"] for r in complete_years
        if r["incident_type"] in {"113", "114", "115", "116", "117", "118"}
    )

    # District x series for 2024 heatmap-ish table
    dist_series = defaultdict(Counter)
    for r in y2024:
        if r["district"]:
            dist_series[r["district"]][r["series"]] += 1

    nb_service = count_by([r for r in service_2024 if r["neighborhood"]], lambda r: r["neighborhood"])
    nb_profile = []
    for label, n in nb_2024.most_common(18):
        fires_n = nb_fire_2024.get(label, 0)
        false_n = nb_false_2024.get(label, 0)
        bldg_n = nb_building_2024.get(label, 0)
        nb_profile.append({
            "label": label,
            "incidents": n,
            "fires": fires_n,
            "building": bldg_n,
            "false_alarms": false_n,
            "fire_pct": round(100.0 * fires_n / n, 1) if n else 0,
            "false_pct": round(100.0 * false_n / n, 1) if n else 0,
        })

    service_types = count_by(service_2024, lambda r: f"{r['incident_type']} {r['incident_desc'][:42].rstrip()}")
    cooking_mf = sum(1 for r in cooking_2024 if r["property_use"] == "429")
    cooking_sf = sum(1 for r in cooking_2024 if r["property_use"] == "419")
    bldg_mf = sum(1 for r in building_fires_2024 if r["property_use"] == "429")
    bldg_sf = sum(1 for r in building_fires_2024 if r["property_use"] == "419")
    peak_hour = max(range(24), key=lambda h: by_hour_2024.get(h, 0))
    quiet_hour = min(range(24), key=lambda h: by_hour_2024.get(h, 0))
    fire_peak = max(range(24), key=lambda h: by_hour_fire.get(h, 0))

    briefing = {
        "quality": dict(quality),
        "raw_total": quality["raw"],
        "kept_total": quality["kept"],
        "primaries": len(primaries),
        "boston_primaries": len(boston),
        "dropped": quality["raw"] - quality["kept"],
        "drop_rate": round(100 * (quality["raw"] - quality["kept"]) / quality["raw"], 2),
        "date_span": {"min": min(r["date"] for r in boston), "max": max(r["date"] for r in boston)},
        "y2025_span": {"min": min_2025, "max": max_2025, "n": len(y2025)},
        "by_year": [{"year": y, "incidents": by_year[y]} for y in years_sorted],
        "stacked": stacked,
        "year_fires": [{"year": y, "value": year_fires[y]} for y in years_sorted],
        "year_false": [{"year": y, "value": year_false[y]} for y in years_sorted],
        "year_building": [{"year": y, "value": year_building[y]} for y in years_sorted],
        "year_loss": [{"year": y, "dollars": round(year_loss[y]), "events": year_loss_incidents[y]} for y in years_sorted],
        "y2024": {
            "n": len(y2024),
            "fires": len(fires_2024),
            "building_fires": len(building_fires_2024),
            "cooking": len(cooking_2024),
            "false_alarms": len(false_2024),
            "service": len(service_2024),
            "hazard": len(hazard_2024),
            "loss": round(loss_2024),
            "loss_events": len(loss_events_2024),
            "loss_building": round(loss_building),
            "multifamily": len(mf_2024),
            "one_two_family": len(sf_2024),
            "per_day": round(len(y2024) / 366, 1),
            "cooking_mf": cooking_mf,
            "cooking_sf": cooking_sf,
            "bldg_mf": bldg_mf,
            "bldg_sf": bldg_sf,
            "peak_hour": peak_hour,
            "quiet_hour": quiet_hour,
            "fire_peak_hour": fire_peak,
        },
        "y2012": {
            "n": len(y2012),
            "fires": sum(1 for r in y2012 if r["series"] == "Fire"),
            "false_alarms": sum(1 for r in y2012 if r["series"] == "False alarm / false call"),
            "building_fires": sum(1 for r in y2012 if r["incident_type"] == "111"),
        },
        "mix_2024": top(by_series_2024, 10),
        "mix_2012": top(by_series_2012, 10),
        "share_2024": shares(by_series_2024, len(y2024)),
        "share_2012": shares(by_series_2012, len(y2012)),
        "top_types_2024": top(type_2024, 12),
        "top_fire_types_2024": top(fire_types_2024, 10),
        "hour_2024": [by_hour_2024.get(h, 0) for h in range(24)],
        "hour_fire_2024": [by_hour_fire.get(h, 0) for h in range(24)],
        "weekday_2024": [by_wd_2024.get(d, 0) for d in range(7)],
        "month_2024": [by_month_2024.get(m, 0) for m in range(1, 13)],
        "neighborhoods_2024": top(nb_2024, 15),
        "neighborhoods_fire_2024": top(nb_fire_2024, 12),
        "neighborhoods_building_2024": top(nb_building_2024, 12),
        "neighborhoods_false_2024": top(nb_false_2024, 12),
        "nb_profile": nb_profile,
        "service_types_2024": top(service_types, 8),
        "districts_2024": top(district_2024, 15),
        "districts_fire_2024": top(district_fire, 15),
        "property_2024": top(prop_2024, 10),
        "property_fire_2024": top(prop_fire, 10),
        "property_desc_fire": top(prop_desc_fire, 10),
        "repeat_false": top(repeat_false, 10),
        "top_loss": [
            {
                "date": r["date"],
                "type": r["incident_desc"][:50],
                "code": r["incident_type"],
                "neighborhood": r["neighborhood"] or r["zip"],
                "property": r["property_desc"][:40],
                "loss": round(r["total_loss"]),
            }
            for r in top_loss if r["total_loss"] > 0
        ],
        "cooking_by_year": [{"year": y, "value": cooking_all[y]} for y in years_sorted if y < 2025],
        "confined_by_year": [{"year": y, "value": confined_structure[y]} for y in years_sorted if y < 2025],
        "geo_coverage": {
            "zip_ok_2024": zip_ok_year[2024],
            "nb_2024": nb_year[2024],
            "n_2024": q_year[2024],
            "zip_ok_2012": zip_ok_year[2012],
            "nb_2012": nb_year[2012],
        },
        "district_series_2024": {
            d: {s: dist_series[d][s] for s in series_order if dist_series[d][s]}
            for d in sorted(dist_series, key=lambda x: int(x) if x.isdigit() else 99)
        },
        "focus_codes_2024": {
            **{k: sum(1 for r in y2024 if r["incident_type"] == k) for k in list(FIRE_FOCUS) + list(HAZARD_FOCUS) + list(FALSE_ALARM_FOCUS)},
        },
    }

    (OUT / "fire_briefing_stats.json").write_text(json.dumps(briefing, indent=2))
    print(json.dumps({k: briefing[k] for k in [
        "quality", "primaries", "boston_primaries", "dropped", "drop_rate",
        "date_span", "y2025_span", "y2024", "y2012", "share_2024", "share_2012",
        "geo_coverage",
    ]}, indent=2))
    print("\nby_year", briefing["by_year"])
    print("\ntop types", briefing["top_types_2024"][:8])
    print("\nneighborhoods", briefing["neighborhoods_2024"][:8])
    print("\nfire neighborhoods", briefing["neighborhoods_fire_2024"][:8])
    print("\ntop loss", briefing["top_loss"][:5])
    print("\nrepeat false", briefing["repeat_false"][:8])
    print("\nproperty fire", briefing["property_fire_2024"])
    print("\nfocus", briefing["focus_codes_2024"])
    print("\nyear fires", briefing["year_fires"])
    print("\nyear building", briefing["year_building"])
    print("\nyear loss", briefing["year_loss"])


if __name__ == "__main__":
    main()
