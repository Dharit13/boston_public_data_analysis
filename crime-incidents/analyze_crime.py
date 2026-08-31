#!/usr/bin/env python3
"""Clean Boston Police RMS incident files and produce briefing stats."""

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

INCIDENT_FILES = [
    DOWNLOADS / "tmpzr3l5bxw.csv",  # 2015 partial
    DOWNLOADS / "tmp3ochjtdc.csv",  # 2016
    DOWNLOADS / "tmp3apxsafn.csv",  # 2017
    DOWNLOADS / "tmpf_uzkqpk.csv",  # 2018
    DOWNLOADS / "tmp6w6ts2d7.csv",  # 2019
    DOWNLOADS / "tmpkd_w64k_.csv",  # 2020
    DOWNLOADS / "tmpfap3hfze.csv",  # 2021
    DOWNLOADS / "tmpdfeo3qy2.csv",  # 2022
    DOWNLOADS / "tmpxjuw4lyi.csv",  # 2023–2026 YTD
]

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

# Lower number = more serious; used to pick one offense per incident in 2015–2018.
FAMILY_RANK = {
    "Homicide": 0,
    "Sex offense": 1,
    "Robbery": 2,
    "Aggravated assault": 3,
    "Burglary": 4,
    "Auto theft": 5,
    "Simple assault": 6,
    "Larceny": 7,
    "Drugs": 8,
    "Weapons": 9,
    "Vandalism / fraud": 10,
    "MV crash / traffic": 11,
    "Medical / sick assist": 12,
    "Verbal dispute": 13,
    "Investigate": 14,
    "Other service": 15,
    "Other": 16,
}

WORKLOAD = {
    "Homicide": "Violence",
    "Sex offense": "Violence",
    "Robbery": "Violence",
    "Aggravated assault": "Violence",
    "Simple assault": "Violence",
    "Burglary": "Property crime",
    "Auto theft": "Property crime",
    "Larceny": "Property crime",
    "Vandalism / fraud": "Property crime",
    "Drugs": "Drugs",
    "Weapons": "Other crime",
    "MV crash / traffic": "Motor vehicle",
    "Medical / sick assist": "Non-crime service",
    "Verbal dispute": "Non-crime service",
    "Investigate": "Non-crime service",
    "Other service": "Non-crime service",
    "Other": "Other",
}

SERIOUS_VIOLENCE = {
    "Homicide",
    "Sex offense",
    "Robbery",
    "Aggravated assault",
}

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def strip_null(value: str | None) -> str:
    if value is None:
        return ""
    text = value.strip()
    if text.upper() in {"", "NULL", "NONE", "NAN", "N/A", "NA"}:
        return ""
    return text


def norm_district(raw: str) -> str:
    d = strip_null(raw).upper().replace(" ", "")
    if d in {"EXTERNAL", "OUTSIDEOF", "OUTSIDE"}:
        return "External"
    if d in DISTRICT_NAME:
        return d
    return ""


def district_label(code: str) -> str:
    if not code:
        return ""
    name = DISTRICT_NAME.get(code, "")
    return f"{code} {name}" if name else code


def parse_year(row: dict) -> int | None:
    y = strip_null(row.get("YEAR", ""))
    if y.isdigit():
        return int(y)
    dt = strip_null(row.get("OCCURRED_ON_DATE", ""))[:10]
    if len(dt) >= 4 and dt[:4].isdigit():
        return int(dt[:4])
    return None


def parse_month(row: dict) -> int | None:
    m = strip_null(row.get("MONTH", ""))
    if m.isdigit():
        v = int(m)
        if 1 <= v <= 12:
            return v
    dt = strip_null(row.get("OCCURRED_ON_DATE", ""))
    if len(dt) >= 7:
        try:
            return int(dt[5:7])
        except ValueError:
            return None
    return None


def parse_hour(row: dict) -> int | None:
    h = strip_null(row.get("HOUR", ""))
    if h.isdigit():
        v = int(h)
        if 0 <= v <= 23:
            return v
    dt = strip_null(row.get("OCCURRED_ON_DATE", ""))
    m = re.search(r" (\d{1,2}):", dt)
    if m:
        v = int(m.group(1))
        if 0 <= v <= 23:
            return v
    return None


def parse_weekday(row: dict) -> str:
    return strip_null(row.get("DAY_OF_WEEK", "")).title()


def shooting_flag(raw: str) -> bool:
    s = strip_null(raw).upper()
    return s in {"Y", "1", "YES", "TRUE", "T"}


def offense_code(raw: str) -> str:
    raw = strip_null(raw)
    digits = re.sub(r"\D", "", raw)
    if digits:
        return str(int(digits))
    return ""


def classify(desc: str, code: str) -> str:
    d = re.sub(r"\s+", " ", desc.upper()).strip()
    c = offense_code(code)

    # Medical before 18xx drug codes — BPD reused 1831 for SICK ASSIST.
    if "SICK ASSIST" in d or "SICK/INJURED" in d or "SICK/INJURED/MEDICAL" in d:
        return "Medical / sick assist"
    if any(k in d for k in ("SUDDEN DEATH", "SUICIDE", "SICK/INJURED")):
        return "Medical / sick assist"

    if any(k in d for k in ("MURDER", "HOMICIDE", "MANSLAUGHTER")) or c in {"111", "121", "123"}:
        return "Homicide"

    if any(
        k in d
        for k in (
            "RAPE",
            "SEXUAL ASSAULT",
            "SEX OFFENSE",
            "INDECENT ASSAULT",
            "INDECENT A&B",
            "FONDLING",
            "INDECENT EXPOSURE",
            "SEXUAL",
        )
    ):
        return "Sex offense"

    if "ROBBERY" in d or (c.isdigit() and 301 <= int(c) <= 381):
        return "Robbery"

    if "KIDNAPPING" in d or "ABDUCTION" in d:
        return "Aggravated assault"
    if "AGGRAVATED" in d or "A&B HANDGUN" in d or "A&B KNIFE" in d:
        return "Aggravated assault"
    if c in {"413", "401", "402", "403", "404", "411", "412", "421", "422", "423", "431"}:
        return "Aggravated assault"

    if "BURGLARY" in d or "B&E" in d or "BREAKING AND ENTERING" in d:
        return "Burglary"
    if c.isdigit() and 520 <= int(c) <= 549:
        return "Burglary"

    if any(
        k in d
        for k in (
            "AUTO THEFT",
            "STOLEN - MV",
            "MV - STOLEN",
            "RECOVERED - MV STOLEN",
            "LARCENY THEFT OF MV",
        )
    ):
        return "Auto theft"
    if c in {"701", "706", "724", "727", "735", "736"}:
        return "Auto theft"

    if "SHOPLIFTING" in d or "LARCENY" in d or "PICK-POCKET" in d or "PURSE SNATCH" in d or "THEFT FROM" in d:
        return "Larceny"
    if c.isdigit() and 610 <= int(c) <= 670:
        return "Larceny"

    if d.startswith("DRUGS") or "DRUGS -" in d or "DRUG VIOLATION" in d:
        return "Drugs"
    if any(k in d for k in ("COCAINE", "MARIJUANA", "HEROIN", "NARCOTIC", "CLASS A", "CLASS B")) and "SICK" not in d:
        return "Drugs"

    if any(k in d for k in ("WEAPON", "FIREARM", "BALLISTICS", "CARRYING DANGEROUS")):
        return "Weapons"

    if any(k in d for k in ("ASSAULT SIMPLE", "ASSAULT - SIMPLE", "SIMPLE ASSAULT")):
        return "Simple assault"
    if "A&B" in d and "AGGRAVATED" not in d:
        return "Simple assault"
    if c in {"801", "802"}:
        return "Simple assault"
    if "THREATS" in d or "HARASSMENT" in d or "INTIMIDAT" in d:
        return "Simple assault"

    if "ARSON" in d:
        return "Vandalism / fraud"
    if any(k in d for k in ("VANDALISM", "GRAFFITI", "FRAUD", "FORGERY", "COUNTERFEIT", "CREDIT CARD", "EMBEZZLE", "IDENTITY", "WORTHLESS", "STOLEN PROPERTY")):
        return "Vandalism / fraud"
    if c.isdigit() and (1400 <= int(c) <= 1499 or 1100 <= int(c) <= 1199):
        return "Vandalism / fraud"

    if any(
        k in d
        for k in (
            "M/V",
            "LEAVING SCENE",
            "OPERATING UNDER THE INFLUENCE",
            "OUI",
            "VAL -",
        )
    ):
        return "MV crash / traffic"
    if c.isdigit() and (3800 <= int(c) <= 3841 or 2100 <= int(c) <= 2110 or 2900 <= int(c) <= 2940):
        return "MV crash / traffic"

    if "VERBAL DISPUTE" in d or c == "3301":
        return "Verbal dispute"

    if "INVESTIGATE" in d or c in {"3115", "3114"}:
        return "Investigate"

    if any(
        k in d
        for k in (
            "TOWED",
            "PROPERTY - LOST",
            "PROPERTY - FOUND",
            "PROPERTY - MISSING",
            "MISSING PERSON",
            "LANDLORD",
            "SERVICE TO OTHER",
            "FIRE REPORT",
            "ANIMAL INCIDENT",
            "TRESPASS",
        )
    ):
        return "Other service"
    if c.isdigit() and 3000 <= int(c) <= 3999:
        return "Other service"

    return "Other"


def is_shoplifting(desc: str) -> bool:
    return "SHOPLIFTING" in desc.upper()


def is_investigate_person(desc: str) -> bool:
    return "INVESTIGATE PERSON" in desc.upper()


def is_investigate_property(desc: str) -> bool:
    return "INVESTIGATE PROPERTY" in desc.upper()


def is_towed(desc: str) -> bool:
    return "TOWED" in desc.upper()


def is_verbal(desc: str) -> bool:
    return "VERBAL DISPUTE" in desc.upper()


def is_sick(desc: str) -> bool:
    d = desc.upper()
    return "SICK" in d or "MEDICAL" in d


def load_offense_rows() -> tuple[list[dict], dict]:
    quality = Counter()
    rows: list[dict] = []
    for path in INCIDENT_FILES:
        with path.open(newline="", encoding="utf-8", errors="replace") as handle:
            reader = csv.DictReader(handle)
            for raw in reader:
                quality["raw"] += 1
                inc = strip_null(raw.get("INCIDENT_NUMBER"))
                year = parse_year(raw)
                if not inc or year is None:
                    quality["drop_bad"] += 1
                    continue
                desc = strip_null(raw.get("OFFENSE_DESCRIPTION"))
                code = offense_code(raw.get("OFFENSE_CODE", ""))
                family = classify(desc, code)
                district = norm_district(raw.get("DISTRICT", ""))
                rows.append({
                    "incident": inc,
                    "year": year,
                    "month": parse_month(raw),
                    "hour": parse_hour(raw),
                    "weekday": parse_weekday(raw),
                    "district": district,
                    "street": re.sub(r"\s+", " ", strip_null(raw.get("STREET", ""))).strip(),
                    "desc": desc,
                    "code": code,
                    "family": family,
                    "rank": FAMILY_RANK[family],
                    "shooting": shooting_flag(raw.get("SHOOTING", "")),
                    "group": strip_null(raw.get("OFFENSE_CODE_GROUP", "")),
                    "ucr": strip_null(raw.get("UCR_PART", "")),
                    "source": path.name,
                })
                quality["kept_offense"] += 1
    return rows, dict(quality)


def collapse_incidents(offense_rows: list[dict]) -> list[dict]:
    """One row per incident: most serious offense wins."""
    buckets: dict[tuple[str, int], list[dict]] = defaultdict(list)
    for row in offense_rows:
        buckets[(row["incident"], row["year"])].append(row)

    incidents = []
    for (inc, year), group in buckets.items():
        primary = min(group, key=lambda r: (r["rank"], r["desc"]))
        shooting = any(r["shooting"] for r in group)
        district = primary["district"]
        if not district:
            for r in group:
                if r["district"]:
                    district = r["district"]
                    break
        incidents.append({
            "incident": inc,
            "year": year,
            "month": primary["month"],
            "hour": primary["hour"],
            "weekday": primary["weekday"],
            "district": district,
            "street": primary["street"],
            "desc": primary["desc"],
            "code": primary["code"],
            "family": primary["family"],
            "workload": WORKLOAD[primary["family"]],
            "shooting": shooting,
            "n_offenses": len(group),
            "shoplifting": any(is_shoplifting(r["desc"]) for r in group),
            "investigate_person": any(is_investigate_person(r["desc"]) for r in group),
            "investigate_property": any(is_investigate_property(r["desc"]) for r in group),
            "towed": any(is_towed(r["desc"]) for r in group),
            "verbal": any(is_verbal(r["desc"]) for r in group),
            "sick": any(is_sick(r["desc"]) for r in group),
        })
    return incidents


def load_shootings() -> list[dict]:
    rows = []
    with (DOWNLOADS / "tmptxprphg5.csv").open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            dt = strip_null(raw.get("shooting_date"))[:10]
            if len(dt) < 4:
                continue
            year = int(dt[:4])
            rows.append({
                "incident": strip_null(raw.get("incident_num")),
                "date": dt,
                "year": year,
                "district": norm_district(raw.get("district", "")),
                "type": strip_null(raw.get("shooting_type_v2")),
                "gender": strip_null(raw.get("victim_gender")),
                "race": strip_null(raw.get("victim_race")),
                "ethnicity": strip_null(raw.get("victim_ethnicity_nibrs")),
                "multi": strip_null(raw.get("multi_victim")).lower() in {"t", "true", "1", "y"},
            })
    return rows


def load_shots() -> list[dict]:
    rows = []
    with (DOWNLOADS / "tmpk63d1583.csv").open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            dt = strip_null(raw.get("incident_date"))[:10]
            if len(dt) < 4:
                continue
            rows.append({
                "incident": strip_null(raw.get("incident_num")),
                "date": dt,
                "year": int(dt[:4]),
                "district": norm_district(raw.get("district", "")),
                "ballistics": strip_null(raw.get("ballistics_evidence")).lower() in {"t", "true", "1"},
            })
    return rows


def load_guns() -> dict:
    by_year = defaultdict(lambda: {"crime": 0, "safeguard": 0, "buyback": 0, "days": 0})
    dmin = dmax = None
    with (DOWNLOADS / "tmp2o7bnkk5.csv").open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            dt = strip_null(raw.get("collection_date"))[:10]
            if len(dt) < 4:
                continue
            y = int(dt[:4])
            by_year[y]["crime"] += int(raw.get("crime_guns_recovered") or 0)
            by_year[y]["safeguard"] += int(raw.get("guns_recovered_safeguard") or 0)
            by_year[y]["buyback"] += int(raw.get("buyback_guns_recovered") or 0)
            by_year[y]["days"] += 1
            if dmin is None or dt < dmin:
                dmin = dt
            if dmax is None or dt > dmax:
                dmax = dt
    return {"span": {"min": dmin, "max": dmax}, "by_year": {str(y): v for y, v in sorted(by_year.items())}}


def count_by(rows, keyfn) -> Counter:
    c = Counter()
    for r in rows:
        k = keyfn(r)
        if k is None or k == "":
            continue
        c[k] += 1
    return c


def top(counter: Counter, n=12):
    return [{"label": str(k), "value": v} for k, v in counter.most_common(n) if k or k == 0]


def year_list(counter: Counter, years: list[int]) -> list[int]:
    return [int(counter.get(y, 0)) for y in years]


def main() -> None:
    offense_rows, quality = load_offense_rows()
    incidents = collapse_incidents(offense_rows)
    shootings = load_shootings()
    shots = load_shots()
    guns = load_guns()

    years_all = sorted({r["year"] for r in incidents})
    full_years = [y for y in years_all if y not in {2015, 2026}]
    y2024 = [r for r in incidents if r["year"] == 2024]
    y2025 = [r for r in incidents if r["year"] == 2025]
    y2016 = [r for r in incidents if r["year"] == 2016]
    y2020 = [r for r in incidents if r["year"] == 2020]

    by_year = count_by(incidents, lambda r: r["year"])
    offense_by_year = count_by(offense_rows, lambda r: r["year"])
    multi_year = Counter()
    for r in incidents:
        if r["n_offenses"] > 1:
            multi_year[r["year"]] += 1

    dates = []
    for r in incidents:
        pass
    # date span from offense rows via year/month is enough; pull raw dates from files for quality
    date_min = min((f"{r['year']}-{r['month']:02d}" if r["month"] else f"{r['year']}") for r in incidents)
    date_max_2026 = max((r["month"] or 0) for r in incidents if r["year"] == 2026)

    year_workload = defaultdict(Counter)
    year_family = defaultdict(Counter)
    year_district = defaultdict(Counter)
    year_violence = Counter()
    year_serious = Counter()
    year_service = Counter()
    year_property = Counter()
    year_larceny = Counter()
    year_shop = Counter()
    year_invest_p = Counter()
    year_invest_pr = Counter()
    year_sick = Counter()
    year_towed = Counter()
    year_verbal = Counter()
    year_drugs = Counter()
    year_rms_shoot = Counter()
    for r in incidents:
        y = r["year"]
        year_workload[y][r["workload"]] += 1
        year_family[y][r["family"]] += 1
        if r["district"]:
            year_district[y][r["district"]] += 1
        if r["workload"] == "Violence":
            year_violence[y] += 1
        if r["family"] in SERIOUS_VIOLENCE:
            year_serious[y] += 1
        if r["workload"] == "Non-crime service":
            year_service[y] += 1
        if r["workload"] == "Property crime":
            year_property[y] += 1
        if r["family"] == "Larceny":
            year_larceny[y] += 1
        if r["family"] == "Drugs":
            year_drugs[y] += 1
        if r["shoplifting"]:
            year_shop[y] += 1
        if r["investigate_person"]:
            year_invest_p[y] += 1
        if r["investigate_property"]:
            year_invest_pr[y] += 1
        if r["sick"]:
            year_sick[y] += 1
        if r["towed"]:
            year_towed[y] += 1
        if r["verbal"]:
            year_verbal[y] += 1
        if r["shooting"]:
            year_rms_shoot[y] += 1

    workload_order = [
        "Non-crime service",
        "Motor vehicle",
        "Property crime",
        "Violence",
        "Drugs",
        "Other crime",
        "Other",
    ]
    stacked = {
        "years": full_years,
        "series": [
            {"name": name, "data": [year_workload[y][name] for y in full_years]}
            for name in workload_order
        ],
    }

    leaders = []
    for y in years_all:
        vol = year_district[y]
        if not vol:
            continue
        d1, n1 = vol.most_common(1)[0]
        leaders.append({
            "year": y,
            "volume_district": district_label(d1),
            "volume": n1,
        })

    # violence leaders
    viol_district_year = defaultdict(Counter)
    serious_district_year = defaultdict(Counter)
    for r in incidents:
        if r["district"] and r["workload"] == "Violence":
            viol_district_year[r["year"]][r["district"]] += 1
        if r["district"] and r["family"] in SERIOUS_VIOLENCE:
            serious_district_year[r["year"]][r["district"]] += 1

    for row in leaders:
        y = row["year"]
        if viol_district_year[y]:
            d, n = viol_district_year[y].most_common(1)[0]
            row["violence_district"] = district_label(d)
            row["violence"] = n
        if serious_district_year[y]:
            d, n = serious_district_year[y].most_common(1)[0]
            row["serious_district"] = district_label(d)
            row["serious"] = n

    def clock_for(rows):
        hour_all = [count_by(rows, lambda r: r["hour"]).get(h, 0) for h in range(24)]
        hour_viol = [count_by([r for r in rows if r["workload"] == "Violence"], lambda r: r["hour"]).get(h, 0) for h in range(24)]
        wd_map = {d: i for i, d in enumerate(WEEKDAYS)}
        weekday = [0] * 7
        for r in rows:
            i = wd_map.get(r["weekday"])
            if i is not None:
                weekday[i] += 1
        month = [count_by(rows, lambda r: r["month"]).get(m, 0) for m in range(1, 13)]
        peak = max(range(1, 24), key=lambda h: hour_all[h])
        quiet = min(range(1, 24), key=lambda h: hour_all[h])
        viol_peak = max(range(1, 24), key=lambda h: hour_viol[h])
        return {
            "hour": hour_all,
            "hour_violence": hour_viol,
            "weekday": weekday,
            "month": month,
            "peak_hour": peak,
            "quiet_hour": quiet,
            "violence_peak_hour": viol_peak,
        }

    def district_profile_for(rows):
        dist = count_by([r for r in rows if r["district"]], lambda r: r["district"])
        dist_viol = count_by([r for r in rows if r["district"] and r["workload"] == "Violence"], lambda r: r["district"])
        dist_serious = count_by([r for r in rows if r["district"] and r["family"] in SERIOUS_VIOLENCE], lambda r: r["district"])
        dist_service = count_by([r for r in rows if r["district"] and r["workload"] == "Non-crime service"], lambda r: r["district"])
        dist_shop = count_by([r for r in rows if r["district"] and r["shoplifting"]], lambda r: r["district"])
        profile = []
        for d, n in dist.most_common():
            v = dist_viol.get(d, 0)
            s = dist_serious.get(d, 0)
            svc = dist_service.get(d, 0)
            profile.append({
                "district": district_label(d),
                "code": d,
                "incidents": n,
                "violence": v,
                "serious": s,
                "service": svc,
                "shoplifting": dist_shop.get(d, 0),
                "violence_pct": round(100.0 * v / n, 1) if n else 0,
                "service_pct": round(100.0 * svc / n, 1) if n else 0,
            })
        return dist, dist_viol, dist_serious, profile

    def streets_for(rows):
        street = Counter()
        street_viol = Counter()
        street_shop = Counter()
        street_service = Counter()
        for r in rows:
            if not r["street"] or not r["district"]:
                continue
            key = f"{r['street']} ({r['district']})"
            street[key] += 1
            if r["workload"] == "Violence":
                street_viol[key] += 1
            if r["shoplifting"]:
                street_shop[key] += 1
            if r["workload"] == "Non-crime service":
                street_service[key] += 1
        return street, street_viol, street_shop, street_service

    clock_2024 = clock_for(y2024)
    clock_2025 = clock_for(y2025)
    hour_all = clock_2024["hour"]
    hour_viol = clock_2024["hour_violence"]
    weekday_2024 = clock_2024["weekday"]
    month_2024 = clock_2024["month"]
    month_2025 = clock_2025["month"]

    dist_2024, dist_viol, dist_serious, dist_profile = district_profile_for(y2024)
    dist_2025, dist_viol_2025, dist_serious_2025, dist_profile_2025 = district_profile_for(y2025)
    street_2024, street_viol, street_shop, street_service = streets_for(y2024)
    street_2025, street_viol_2025, street_shop_2025, street_service_2025 = streets_for(y2025)

    # neighborhood analog: district volume series for top districts
    top_districts = ["B2", "C11", "D4", "B3", "A1", "C6", "D14", "E13", "E18", "A7", "E5", "A15"]
    area_volume = {d: [year_district[y][d] for y in full_years] for d in top_districts}
    area_violence = {d: [viol_district_year[y][d] for y in full_years] for d in top_districts}
    area_serious = {d: [serious_district_year[y][d] for y in full_years] for d in top_districts}

    # B2 mix over time
    b2_mix = defaultdict(Counter)
    for r in incidents:
        if r["district"] == "B2" and r["year"] in full_years:
            b2_mix[r["year"]][r["workload"]] += 1
    b2_stacked = {
        name: [b2_mix[y][name] for y in full_years] for name in workload_order
    }

    desc_2024 = count_by(y2024, lambda r: r["desc"] or "Unknown")
    family_2024 = count_by(y2024, lambda r: r["family"])
    workload_2024 = count_by(y2024, lambda r: r["workload"])
    desc_2025 = count_by(y2025, lambda r: r["desc"] or "Unknown")
    family_2025 = count_by(y2025, lambda r: r["family"])
    workload_2025 = count_by(y2025, lambda r: r["workload"])
    family_2016 = count_by(y2016, lambda r: r["family"])
    workload_2016 = count_by(y2016, lambda r: r["workload"])

    # shootings / shots
    shoot_year = count_by(shootings, lambda r: r["year"])
    shoot_fatal = count_by([r for r in shootings if r["type"] == "Fatal"], lambda r: r["year"])
    shoot_nonfatal = count_by([r for r in shootings if r["type"] == "Non-Fatal"], lambda r: r["year"])
    shoot_dist = count_by([r for r in shootings if r["district"]], lambda r: r["district"])
    shoot_dist_year = defaultdict(Counter)
    for r in shootings:
        if r["district"]:
            shoot_dist_year[r["year"]][r["district"]] += 1
    shots_year = count_by(shots, lambda r: r["year"])
    shots_dist = count_by([r for r in shots if r["district"]], lambda r: r["district"])
    shots_ballistics = sum(1 for r in shots if r["ballistics"])

    shoot_race = count_by(shootings, lambda r: r["race"] or "Unknown")
    shoot_gender = count_by(shootings, lambda r: r["gender"] or "Unknown")
    shoot_multi = sum(1 for r in shootings if r["multi"])

    # 2015–2025 shooting district share
    shoot_focus = ["B2", "B3", "C11"]
    shoot_core_year = []
    for y in range(2015, 2026):
        n = shoot_year[y]
        core = sum(shoot_dist_year[y][d] for d in shoot_focus)
        shoot_core_year.append({"year": y, "n": n, "core": core, "share": round(100.0 * core / n, 1) if n else 0})

    # 2024 vs 2016 table helpers
    def pct(n, tot):
        return round(100.0 * n / tot, 1) if tot else 0

    n2016 = len(y2016)
    n2024 = len(y2024)
    n2025 = len(y2025)

    # 2026 YTD
    y2026 = [r for r in incidents if r["year"] == 2026]
    y2025_to_aug = [r for r in y2025 if r["month"] and r["month"] <= 8]

    peak_hour = clock_2025["peak_hour"]
    quiet_hour = clock_2025["quiet_hour"]
    viol_peak = clock_2025["violence_peak_hour"]

    b2b3c11_2024 = sum(dist_2024[d] for d in ("B2", "B3", "C11"))
    b2b3c11_viol = sum(dist_viol[d] for d in ("B2", "B3", "C11"))
    b2b3c11_serious = sum(dist_serious[d] for d in ("B2", "B3", "C11"))
    b2b3c11_2025 = sum(dist_2025[d] for d in ("B2", "B3", "C11"))
    b2b3c11_viol_2025 = sum(dist_viol_2025[d] for d in ("B2", "B3", "C11"))
    b2b3c11_serious_2025 = sum(dist_serious_2025[d] for d in ("B2", "B3", "C11"))
    shoot_core_all = sum(shoot_dist[d] for d in shoot_focus)

    briefing = {
        "quality": {
            **quality,
            "unique_incidents": len(incidents),
            "multi_offense_incidents": sum(multi_year.values()),
            "note": "2015 starts 15 Jun. 2015–2018 files are offense-level; collapsed to one incident. 2026 through mid-August.",
        },
        "date_span": {
            "min_year": min(years_all),
            "max_year": max(years_all),
            "y2015_partial": True,
            "y2026_months": date_max_2026,
            "y2026_n": len(y2026),
        },
        "years": full_years,
        "by_year": [{"year": y, "incidents": by_year[y], "offenses": offense_by_year[y]} for y in years_all],
        "stacked": stacked,
        "year_violence": year_list(year_violence, full_years),
        "year_serious": year_list(year_serious, full_years),
        "year_service": year_list(year_service, full_years),
        "year_property": year_list(year_property, full_years),
        "year_larceny": year_list(year_larceny, full_years),
        "year_shop": year_list(year_shop, full_years),
        "year_invest_person": year_list(year_invest_p, full_years),
        "year_invest_property": year_list(year_invest_pr, full_years),
        "year_sick": year_list(year_sick, full_years),
        "year_towed": year_list(year_towed, full_years),
        "year_verbal": year_list(year_verbal, full_years),
        "year_drugs": year_list(year_drugs, full_years),
        "year_rms_shooting": year_list(year_rms_shoot, full_years),
        "volume": year_list(by_year, full_years),
        "leaders": leaders,
        "y2016": {
            "n": n2016,
            "violence": year_violence[2016],
            "serious": year_serious[2016],
            "service": year_service[2016],
            "property": year_property[2016],
            "drugs": year_drugs[2016],
            "shop": year_shop[2016],
            "invest_person": year_invest_p[2016],
            "sick": year_sick[2016],
            "share_service": pct(year_service[2016], n2016),
            "share_violence": pct(year_violence[2016], n2016),
            "share_property": pct(year_property[2016], n2016),
            "families": top(family_2016, 12),
            "workload": top(workload_2016, 10),
        },
        "y2020": {
            "n": len(y2020),
            "violence": year_violence[2020],
            "serious": year_serious[2020],
            "service": year_service[2020],
        },
        "y2024": {
            "n": n2024,
            "per_day": round(n2024 / 366, 1),
            "violence": year_violence[2024],
            "serious": year_serious[2024],
            "service": year_service[2024],
            "property": year_property[2024],
            "larceny": year_larceny[2024],
            "shop": year_shop[2024],
            "invest_person": year_invest_p[2024],
            "invest_property": year_invest_pr[2024],
            "sick": year_sick[2024],
            "towed": year_towed[2024],
            "verbal": year_verbal[2024],
            "drugs": year_drugs[2024],
            "rms_shooting": year_rms_shoot[2024],
            "share_service": pct(year_service[2024], n2024),
            "share_violence": pct(year_violence[2024], n2024),
            "share_serious": pct(year_serious[2024], n2024),
            "share_property": pct(year_property[2024], n2024),
            "share_drugs": pct(year_drugs[2024], n2024),
            "b2_b3_c11": b2b3c11_2024,
            "b2_b3_c11_share": pct(b2b3c11_2024, n2024),
            "b2_b3_c11_violence": b2b3c11_viol,
            "b2_b3_c11_violence_share": pct(b2b3c11_viol, year_violence[2024]),
            "b2_b3_c11_serious": b2b3c11_serious,
            "b2_b3_c11_serious_share": pct(b2b3c11_serious, year_serious[2024]),
            "peak_hour": clock_2024["peak_hour"],
            "quiet_hour": clock_2024["quiet_hour"],
            "violence_peak_hour": clock_2024["violence_peak_hour"],
            "families": top(family_2024, 12),
            "workload": top(workload_2024, 10),
            "top_desc": top(desc_2024, 15),
        },
        "y2025": {
            "n": n2025,
            "per_day": round(n2025 / 365, 1),
            "violence": year_violence[2025],
            "serious": year_serious[2025],
            "service": year_service[2025],
            "property": year_property[2025],
            "larceny": year_larceny[2025],
            "shop": year_shop[2025],
            "invest_person": year_invest_p[2025],
            "invest_property": year_invest_pr[2025],
            "sick": year_sick[2025],
            "towed": year_towed[2025],
            "verbal": year_verbal[2025],
            "drugs": year_drugs[2025],
            "rms_shooting": year_rms_shoot[2025],
            "share_service": pct(year_service[2025], n2025),
            "share_violence": pct(year_violence[2025], n2025),
            "share_serious": pct(year_serious[2025], n2025),
            "share_property": pct(year_property[2025], n2025),
            "share_drugs": pct(year_drugs[2025], n2025),
            "b2_b3_c11": b2b3c11_2025,
            "b2_b3_c11_share": pct(b2b3c11_2025, n2025),
            "b2_b3_c11_violence": b2b3c11_viol_2025,
            "b2_b3_c11_violence_share": pct(b2b3c11_viol_2025, year_violence[2025]),
            "b2_b3_c11_serious": b2b3c11_serious_2025,
            "b2_b3_c11_serious_share": pct(b2b3c11_serious_2025, year_serious[2025]),
            "peak_hour": clock_2025["peak_hour"],
            "quiet_hour": clock_2025["quiet_hour"],
            "violence_peak_hour": clock_2025["violence_peak_hour"],
            "month": month_2025,
            "families": top(family_2025, 12),
            "workload": top(workload_2025, 10),
            "top_desc": top(desc_2025, 15),
        },
        "y2026_ytd": {
            "n": len(y2026),
            "through_month": date_max_2026,
            "n_2025_through_aug": len(y2025_to_aug),
            "violence": sum(1 for r in y2026 if r["workload"] == "Violence"),
            "serious": sum(1 for r in y2026 if r["family"] in SERIOUS_VIOLENCE),
            "service": sum(1 for r in y2026 if r["workload"] == "Non-crime service"),
            "shop": sum(1 for r in y2026 if r["shoplifting"]),
            "sick": sum(1 for r in y2026 if r["sick"]),
            "invest_person": sum(1 for r in y2026 if r["investigate_person"]),
        },
        "hour_2024": hour_all,
        "hour_violence_2024": hour_viol,
        "hour_2025": clock_2025["hour"],
        "hour_violence_2025": clock_2025["hour_violence"],
        "weekday_2024": weekday_2024,
        "weekday_2025": clock_2025["weekday"],
        "month_2024": month_2024,
        "month_2025": month_2025,
        "district_profile_2024": dist_profile,
        "district_profile_2025": dist_profile_2025,
        "area_volume": {district_label(d): area_volume[d] for d in top_districts},
        "area_violence": {district_label(d): area_violence[d] for d in top_districts},
        "area_serious": {district_label(d): area_serious[d] for d in top_districts},
        "b2_mix": b2_stacked,
        "repeat_streets_2024": top(street_2024, 12),
        "repeat_streets_2025": top(street_2025, 12),
        "repeat_violence_streets": top(street_viol_2025, 10),
        "repeat_shop_streets": top(street_shop_2025, 8),
        "repeat_service_streets": top(street_service_2025, 8),
        "shootings": {
            "n": len(shootings),
            "fatal": sum(shoot_fatal.values()),
            "nonfatal": sum(shoot_nonfatal.values()),
            "multi_victim": shoot_multi,
            "span": {
                "min": min(r["date"] for r in shootings),
                "max": max(r["date"] for r in shootings),
            },
            "by_year": [{"year": y, "n": shoot_year[y], "fatal": shoot_fatal[y], "nonfatal": shoot_nonfatal[y]} for y in range(2015, 2027) if shoot_year[y]],
            "districts": [{"label": district_label(d), "value": n} for d, n in shoot_dist.most_common()],
            "core_b2_b3_c11": shoot_core_all,
            "core_share": pct(shoot_core_all, len(shootings)),
            "core_by_year": shoot_core_year,
            "race": top(shoot_race, 8),
            "gender": top(shoot_gender, 6),
            "area_series": {district_label(d): [shoot_dist_year[y][d] for y in range(2015, 2026)] for d in ("B2", "B3", "C11", "E13", "E18", "D4")},
        },
        "shots_fired": {
            "n": len(shots),
            "ballistics": shots_ballistics,
            "span": {
                "min": min(r["date"] for r in shots),
                "max": max(r["date"] for r in shots),
            },
            "by_year": [{"year": y, "n": shots_year[y]} for y in range(2015, 2027) if shots_year[y]],
            "districts": [{"label": district_label(d), "value": n} for d, n in shots_dist.most_common()],
        },
        "guns": guns,
        "payroll_2025": {
            "people": 3094,
            "gross_m": 534,
            "ot_m": 102,
            "median_k": 179,
            "attrition_pct": 18.8,
            "ot_share_of_city": round(100 * 102 / 183, 1),
        },
        "payroll_2024": {
            "people": 3491,
            "gross_m": 578,
            "note": "2024 roster bulge and retro year — not a new normal",
        },
    }

    (OUT / "crime_briefing_stats.json").write_text(json.dumps(briefing, indent=2))

    print(json.dumps({
        "quality": briefing["quality"],
        "date_span": briefing["date_span"],
        "by_year": briefing["by_year"],
        "y2016": briefing["y2016"],
        "y2024": {k: briefing["y2024"][k] for k in briefing["y2024"] if k not in {"families", "top_desc", "workload"}},
        "y2025": briefing["y2025"],
        "y2026_ytd": briefing["y2026_ytd"],
        "leaders": leaders,
        "dist_2025": dist_profile_2025[:8],
        "top_desc_2025": briefing["y2025"]["top_desc"][:10],
        "shootings_year": briefing["shootings"]["by_year"],
        "shots_year": briefing["shots_fired"]["by_year"],
        "shoot_core": briefing["shootings"]["core_by_year"],
    }, indent=2))
    print("\nstreets", briefing["repeat_streets_2024"][:8])
    print("violence streets", briefing["repeat_violence_streets"][:8])
    print("shop streets", briefing["repeat_shop_streets"][:8])
    print("guns", guns["by_year"])


if __name__ == "__main__":
    main()
