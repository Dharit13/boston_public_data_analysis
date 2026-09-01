#!/usr/bin/env python3
"""Dump audit: leftover Retail food after overlays, plus overlay false-positives.

Streams the Analyze Boston inspection CSV, collapses to license + timestamp
the same way analyze_food.load_inspections does, then one record per license
(first-seen name, Active if any visit is Active). Stdlib only.
"""
from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from analyze_food import (
    CAT_GROCERY,
    CAT_ICE,
    CAT_PHARMACY,
    CAT_RETAIL,
    CAT_VARIETY,
    YEAR_MAX,
    YEAR_MIN,
    _insp_key,
    brand_key,
    categorize,
    parse_dt,
    strip_null,
    zip5_of,
)
from common import DOWNLOADS

DUMP = DOWNLOADS / "food-establishment-inspections.csv"

# Class detectors for leftover RF that is NOT packaged bodega/convenience.
# These are NAICS-style store classes, not per-store license numbers.
VARIETY_GM_CLASS_RE = re.compile(
    r"(?ix)\b("
    r"dollar\s+tree|family\s+dollar|dollar\s+general|"
    r"five\s+below|big\s+lots|"
    r"target|walmart|wal\s*mart|"
    r"amazon\s+fresh|"
    r"ocean\s+state\s+job\s*lot|"
    r"job\s*lot|"
    r"burlington|"
    r"tj\s*maxx|t\s*j\s*maxx|marshalls|marshall'?s|"
    r"ross\s+dress|home\s+goods|homegoods|"
    r"dollar\s+store"
    r")\b"
)
PHARMACY_LEFTOVER_RE = re.compile(
    r"(?ix)\b("
    r"pharmacy|drugstore|drug\s+store|"
    r"walgreens?|rite\s+aid|cvs|"
    r"osceola\s+pharmacy|neighborhood\s+pharmacy"
    r")\b"
)
GROCERY_LEFTOVER_RE = re.compile(
    r"(?ix)\b("
    r"grocery|supermarket|super\s+market|"
    r"trader\s+joe|whole\s+foods|stop\s+[\s&]*shop|"
    r"star\s+market|shaw'?s|market\s+basket|wegmans|"
    r"aldi|hannaford|h\s+mart|costco"
    r")\b"
)
GAS_CLASS_RE = re.compile(
    r"(?ix)\b("
    r"shell|exxon|mobil|sunoco|bp\b|gulf|"
    r"citgo|speedway|wawa|circle\s+k|"
    r"gas\s+station|filling\s+station|service\s+station|"
    r"cumberland\s+farms"
    r")\b"
)
HARDWARE_CLASS_RE = re.compile(
    r"(?ix)\b("
    r"home\s+depot|lowe'?s|ace\s+hardware|true\s+value|"
    r"hardware"
    r")\b"
)
LIQUOR_CLASS_RE = re.compile(
    r"(?ix)\b("
    r"liquor|wine\s+and\s+spirits|wine\s+&\s+spirits|"
    r"package\s+store|packy"
    r")\b"
)

NON_RETAIL_CLASS_DETECTORS = (
    ("variety_gm", VARIETY_GM_CLASS_RE),
    ("pharmacy", PHARMACY_LEFTOVER_RE),
    ("grocery", GROCERY_LEFTOVER_RE),
    ("gas", GAS_CLASS_RE),
    ("hardware", HARDWARE_CLASS_RE),
    ("liquor", LIQUOR_CLASS_RE),
)


def collapse_licenses(path: Path) -> dict[str, dict]:
    """Unique licenses after license+timestamp collapse. First-seen name wins."""
    visits: set[tuple] = set()
    by: dict[str, dict] = {}
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for raw in csv.DictReader(handle):
            dt = parse_dt(raw.get("resultdttm", ""))
            if dt is None or not (YEAR_MIN <= dt.year <= YEAR_MAX):
                continue
            licenseno = strip_null(raw.get("licenseno", ""))
            business = strip_null(raw.get("businessname", ""))
            vkey = _insp_key(licenseno, business, dt)
            if vkey in visits:
                rec = by.get(licenseno or f"{business}|{strip_null(raw.get('address', ''))}|{zip5_of(raw.get('zip', ''))}")
                if rec is not None and strip_null(raw.get("licstatus", "")) == "Active":
                    rec["licstatus"] = "Active"
                continue
            visits.add(vkey)
            place_key = licenseno or (
                f"{business}|{strip_null(raw.get('address', ''))}|{zip5_of(raw.get('zip', ''))}"
            )
            rec = by.get(place_key)
            if rec is None:
                rec = {
                    "license": licenseno,
                    "name": business,
                    "licensecat": strip_null(raw.get("licensecat", "")),
                    "licstatus": strip_null(raw.get("licstatus", "")),
                    "visits": 0,
                }
                by[place_key] = rec
            rec["visits"] += 1
            if strip_null(raw.get("licstatus", "")) == "Active":
                rec["licstatus"] = "Active"
    return by


def classify_licenses(by: dict[str, dict]) -> None:
    for rec in by.values():
        rec["brand_key"] = brand_key(rec["name"])
        rec["category"] = categorize(rec["name"], rec["licensecat"])


def leftover_rf(by: dict[str, dict], active_only: bool = True) -> list[dict]:
    out = []
    for rec in by.values():
        if active_only and rec.get("licstatus") != "Active":
            continue
        if rec.get("licensecat") != "RF":
            continue
        if rec.get("category") != CAT_RETAIL:
            continue
        out.append(rec)
    return out


def token_clusters(rows: list[dict], ntok: int = 2) -> list[tuple[str, int, list[str]]]:
    groups: dict[str, list[str]] = defaultdict(list)
    licenses: dict[str, set[str]] = defaultdict(set)
    for rec in rows:
        toks = rec["brand_key"].split()
        head = " ".join(toks[:ntok]) if toks else "(blank)"
        licenses[head].add(rec["license"] or rec["name"])
        if rec["name"] not in groups[head]:
            groups[head].append(rec["name"])
    ranked = sorted(
        ((head, len(licenses[head]), groups[head][:8]) for head in licenses),
        key=lambda x: (-x[1], x[0]),
    )
    return ranked


def flag_non_retail(rows: list[dict]) -> dict[str, list[dict]]:
    flagged: dict[str, list[dict]] = {k: [] for k, _ in NON_RETAIL_CLASS_DETECTORS}
    for rec in rows:
        text = f"{rec['name']} {rec['brand_key']}"
        for label, regex in NON_RETAIL_CLASS_DETECTORS:
            if regex.search(text):
                flagged[label].append(rec)
    return flagged


def crosstab(by: dict[str, dict], active_only: bool = True) -> list[tuple[str, str, int]]:
    counts: Counter = Counter()
    for rec in by.values():
        if active_only and rec.get("licstatus") != "Active":
            continue
        counts[(rec.get("category") or "", rec.get("licensecat") or "")] += 1
    return [(cat, lic, n) for (cat, lic), n in counts.most_common()]


def overlay_samples(by: dict[str, dict], category: str, n: int = 40) -> list[str]:
    names = []
    seen = set()
    for rec in by.values():
        if rec.get("licstatus") != "Active":
            continue
        if rec.get("category") != category:
            continue
        if rec["name"] in seen:
            continue
        seen.add(rec["name"])
        names.append(f"{rec['name']} [{rec['licensecat']}] lic={rec['license']}")
        if len(names) >= n:
            break
    return names


def main() -> None:
    if not DUMP.is_file():
        raise SystemExit(f"missing dump {DUMP}")
    print(f"collapsing {DUMP}", flush=True)
    by = collapse_licenses(DUMP)
    classify_licenses(by)
    active = [r for r in by.values() if r.get("licstatus") == "Active"]
    print(f"unique licenses: {len(by)}  active: {len(active)}")
    print("\n=== category × licensecat (Active) ===")
    for cat, lic, n in crosstab(by):
        print(f"  {n:5d}  {cat:32s}  {lic or '(blank)'}")
    leftover = leftover_rf(by)
    print(f"\n=== leftover RF → Retail food Active licenses: {len(leftover)} ===")
    print("\n-- first-2-token clusters (license count) --")
    for head, n, samples in token_clusters(leftover, 2)[:80]:
        print(f"  {n:4d}  {head:40s}  e.g. {samples[0]}")
    print("\n-- first-1-token clusters (license count, n>=3) --")
    for head, n, samples in token_clusters(leftover, 1):
        if n < 3:
            continue
        print(f"  {n:4d}  {head:40s}  e.g. {'; '.join(samples[:4])}")
    flagged = flag_non_retail(leftover)
    print("\n=== leftover RF flagged as non-bodega class ===")
    for label, rows in flagged.items():
        lic_n = len({r["license"] or r["name"] for r in rows})
        print(f"  {label}: {lic_n} licenses")
        for rec in rows[:25]:
            print(f"    {rec['license']:10s}  {rec['name']}")
        if lic_n > 25:
            print(f"    ... {lic_n - 25} more")
    print("\n=== Variety overlay Active names ===")
    for line in overlay_samples(by, CAT_VARIETY, 80):
        print(f"  {line}")
    print("\n=== Pharmacy overlay that are still RF-coded (expected) ===")
    pharm = [
        r
        for r in active
        if r["category"] == CAT_PHARMACY and r["licensecat"] == "RF"
    ]
    print(f"  count {len(pharm)}")
    still_rf_pharm = leftover_rf(by)
    pharm_left = [r for r in still_rf_pharm if PHARMACY_LEFTOVER_RE.search(r["name"])]
    print(f"  leftover RF that look like pharmacy: {len(pharm_left)}")
    for rec in pharm_left[:20]:
        print(f"    {rec['license']} {rec['name']}")
    groc_left = [r for r in leftover if GROCERY_LEFTOVER_RE.search(r["name"])]
    print(f"\n  leftover RF that look like grocery: {len(groc_left)}")
    for rec in groc_left[:20]:
        print(f"    {rec['license']} {rec['name']}")
    ice_fp = [
        r
        for r in active
        if r["category"] == CAT_ICE and not re.search(
            r"(?i)ice\s*cream|gelato|frozen\s+yogurt|creamery|licks|fomu|ben\s*&\s*jerry",
            r["name"],
        )
    ]
    print(f"\n=== Ice cream overlay without ice-cream words (web-list hits): {len(ice_fp)} ===")
    for rec in ice_fp[:40]:
        print(f"  {rec['licensecat']} {rec['license']} {rec['name']}")
    groc_not_rf = [
        r
        for r in active
        if r["category"] == CAT_GROCERY and r["licensecat"] not in {"RF", ""}
    ]
    print(f"\n=== Grocery overlay on non-RF licensecat: {len(groc_not_rf)} ===")
    for rec in groc_not_rf[:20]:
        print(f"  {rec['licensecat']} {rec['license']} {rec['name']}")
    rf_all_active = [
        r for r in active if r["licensecat"] == "RF"
    ]
    print(f"\nActive RF licenses total: {len(rf_all_active)}")
    by_cat = Counter(r["category"] for r in rf_all_active)
    print("Active RF by overlay category:")
    for lab, n in by_cat.most_common():
        print(f"  {n:5d}  {lab}")
    out = {
        "unique_licenses": len(by),
        "active": len(active),
        "leftover_rf": len(leftover),
        "flagged": {k: len({r['license'] or r['name'] for r in v}) for k, v in flagged.items()},
        "variety_names": overlay_samples(by, CAT_VARIETY, 200),
    }
    Path("audit_rf_leftover_summary.json").write_text(json.dumps(out, indent=2))
    print("\nwrote audit_rf_leftover_summary.json")


if __name__ == "__main__":
    main()
