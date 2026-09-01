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
# Temporary suspension / voluntary or emergency closure — not fail codes.
SEVERE_OPS = frozenset({"HE_TSOP", "HE_VolClos", "HE_Closure"})
STAR_LEVELS = ("*", "**", "***")
SEV_MAJOR = "major"
SEV_MINOR = "minor_only"
SEV_UNSTARRED = "unstarred"
SEV_LABEL = {
    SEV_MAJOR: "Major",
    SEV_MINOR: "Minor-only",
    SEV_UNSTARRED: "Unstarred",
}
ALWAYS_PASS_MIN = 3
CAUTIOUS_MAJOR_MIN = 2
REPEAT_YEAR_MIN = 2
PLACE_DETAIL_YEARS = (2019, 2024, 2025)

CAT_FOOD_DRINKS = "Food and drinks"
CAT_TAKEOUT = "Take-out"
CAT_RETAIL = "Retail food"
CAT_MOBILE = "Mobile food"
CAT_ICE = "Ice cream"
CAT_CAFE = "Cafe"
CAT_PHARMACY = "Pharmacy"
CAT_GROCERY = "Grocery"
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
    CAT_PHARMACY,
    CAT_GROCERY,
    CAT_FOOD_DRINKS,
    CAT_TAKEOUT,
    CAT_RETAIL,
    CAT_MOBILE,
    CAT_OTHER,
)
# Overlay counts still include Hospital / School / Cultural / Hotel.
# Ranking pills do not: those kitchens are not consumer pick-a-restaurant lists.
INSTITUTION_CATS = frozenset(
    {CAT_HOSPITAL, CAT_SCHOOL, CAT_CULTURAL, CAT_HOTEL}
)
RANKING_CATS = frozenset(
    lab
    for lab in OVERLAY_ORDER
    if lab != CAT_OTHER and lab not in INSTITUTION_CATS
)
RANKING_ORDER = tuple(lab for lab in OVERLAY_ORDER if lab in RANKING_CATS)
ACTIVE_STATUS = "Active"

_ICE_RE = re.compile(
    r"\b(ice\s*cream|gelato|frozen\s+yogurt|frozen\s+dessert|fro-?yo|yoghurt\s+shop|\w*creamery)\b",
    re.I,
)
_AT_ABBREV_RE = re.compile(r"\s+at\s+(?:[A-Za-z]\.?\s*){1,3}$", re.I)
_PAREN_TAG_RE = re.compile(r"\s*\([^)]*\)\s*$")
# Trailing legal forms only (ISO 20275 / cleanco-style). Do not strip bare
# Company/Co — those are often the trade name (Atlantic Fish Company).
_LEGAL_SUFFIX_RE = re.compile(
    r"(?:,|\s)+((?:incorporated|inc|l\.l\.c|llc|l\s+l\s+c|corporation|corp|"
    r"ltd|limited)\.?)\s*(?:[ivx]{1,4}|\d+)?\s*$",
    re.I,
)
_PLACE_WORD_RE = re.compile(
    r"(?ix)\b("
    r"hospital|hotel|college|university|univ|school|institute|"
    r"medical|centre|center|"
    r"street|avenue|blvd|boulevard|"
    r"circle|square|plaza|broadway|park|wharf|hall|"
    r"market|supermarket|airport|station|mbta|library|"
    r"theater|theatre|museum|church|beach|island|golf|"
    r"garden|greenway|fitness|club|bank|kiosk|"
    r"floor|bldg|building|tower|lobby|pavilion|"
    r"convention|courthouse|track|farm|logan|"
    r"marriott|hilton|westin|sheraton|hyatt|aloft|"
    r"common|walgreens|childrens?"
    r")\b"
)
_STREET_END_RE = re.compile(
    r"(?i)\b(?:street|st|avenue|ave|road|rd|blvd|boulevard|"
    r"circle|square|plaza|broadway|park|wharf)\.?$"
)
_GENERIC_HOST_KITCHEN_RE = re.compile(
    r"(?ix)^(?:the\s+)?("
    r"patient\s+dining|basement\s+dining|"
    r"dining\s+hall|dining\s+room|"
    r"cafeteria|canteen|"
    r"\d+(?:st|nd|rd|th)\s+floor|"
    r"kitchen"
    r")$"
)
_SCHOOL_HOST_RE = re.compile(
    r"(?i)\b(bhcc|rcc|umass|berklee|emerson|simmons|suffolk|wentworth|"
    r"lesley|wheelock|harvard|northeastern|massart|mass\s*art)\b"
)
_HOSPITAL_HOST_RE = re.compile(
    r"(?i)\b(bidmc|mgh|bmc|spaulding|faulkner|children'?s)\b"
)
WEB_ICE_PATH = Path(__file__).resolve().parent / "ice_cream_web_matches.json"
WEB_GROCERY_PATH = Path(__file__).resolve().parent / "grocery_web_matches.json"
_web_ice_override: set[str] | None = None
_web_ice_file_cache: set[str] | None = None
_web_grocery_override: set[str] | None = None
_web_grocery_file_cache: set[str] | None = None
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
_PHARMACY_RE = re.compile(
    r"\b(pharmacy|drugstore|drug\s+store|walgreens?|rite\s+aid|cvs)\b",
    re.I,
)
_GROCERY_RE = re.compile(
    r"\b(grocery|supermarket|super\s+market)\b",
    re.I,
)
_VARIETY_STORE_RE = re.compile(
    r"\b(dollar\s+tree|family\s+dollar|dollar\s+general)\b",
    re.I,
)

QUALITY_NOTE = (
    "Food establishment inspections and active food licenses are separate "
    "files. Do not count a license row as an inspection. The inspection dump "
    "is one row per violation; this briefing collapses to one inspection per "
    "license number and result timestamp. Drop rows with no resultdttm. "
    "Complete years are 2012–2025. 2026 is year-to-date through 28 August — "
    "not a full year. 2020 is COVID. Fail is the exact result codes HE_Fail, "
    "HE_FailExt, Fail, Failed, and HE_FAILNOR — not a substring. HE_Filed is "
    "not a fail. Star levels are exact *, **, ***. Fail severity is our split "
    "from viol_level on a failed visit — not an official ISD “major failure” "
    "label, and not the letter grade on the door: major if the visit has ** or "
    "*** (critical / foodborne-critical), minor-only if starred violations are "
    "only * (non-critical; wiping cloths stay minor), mixed counts as major "
    "(worst-on-visit). HE_TSOP / HE_VolClos / HE_Closure are severe operational "
    "results, counted separately from fail codes. Display names strip trailing Inc/LLC/Corp/Ltd, "
    "not Company/Co in a trade name, and strip @ only when it is a location "
    "suffix (street, hospital, hotel, college). Ice cream, pharmacy, and "
    "grocery overlays are not City license types. ISD licensecat RF remains "
    "Retail Food (packaged food); leftover Retail food after overlays is "
    "other packaged retail, not pharmacy, grocery, or dollar/variety stores "
    "(Dollar Tree, Family Dollar, Dollar General). Place lists skip "
    "HE_NotReq: it is not counted as an inspection for always-pass or "
    "cautious tables. Always-pass and be-cautious in a Places view use "
    "the same year window. Ranking pills are ice cream, cafe, pharmacy, "
    "grocery, food and drinks, take-out, retail food, and mobile food — "
    "not Hospital, School, Cultural / attraction, or Hotel. Always-pass "
    "is an Active license, zero fails, and at least three real visits in "
    "that window. Be cautious is an Active license with at least two "
    "major fails (** or *** on a fail visit) in that same window; "
    "minor-only * repeats are excluded. A license number cannot appear "
    "on both lists in the same view. Institution kitchens are cafeteria "
    "inspection records, not a rating of the hospital or a skip list."
)


def _at_tokens(text: str) -> list[str]:
    return [tok for tok in re.split(r"[^\w]+", strip_null(text)) if tok]


def _at_is_location(left: str, right: str) -> bool:
    """True when @ marks a site (street/hospital/hotel/college), not a trade name."""
    right_s = right.strip()
    left_s = left.strip()
    if not right_s or not left_s:
        return False
    if re.search(r"\d", right_s):
        return True
    if _PLACE_WORD_RE.search(right_s) or _STREET_END_RE.search(right_s):
        return True
    if _SCHOOL_HOST_RE.search(right_s) or _HOSPITAL_HOST_RE.search(right_s):
        return True
    right_toks = _at_tokens(right_s)
    left_toks = [tok for tok in _at_tokens(left_s) if tok.casefold() != "the"]
    if len(right_toks) >= 3:
        return True
    if len(left_toks) >= 2:
        return True
    return False


def split_at_location(business: str) -> tuple[str, str]:
    """Split trade name from an @ location suffix. Keep trade-name @ (A @ Time)."""
    text = strip_null(business)
    idx = text.find("@")
    if idx < 0:
        return text, ""
    left, right = text[:idx], text[idx + 1 :]
    if _at_is_location(left, right):
        return left.strip(), right.strip()
    return text, ""


def _is_generic_host_kitchen(trade: str) -> bool:
    core = " ".join(strip_null(trade).split())
    return bool(_GENERIC_HOST_KITCHEN_RE.match(core))


def zip5_of(raw: str) -> str:
    digits = "".join(ch for ch in strip_null(raw) if ch.isdigit())
    if len(digits) >= 5:
        return digits[:5]
    if len(digits) == 4:
        return digits.zfill(5)
    return ""


def is_fail(raw: str) -> bool:
    return strip_null(raw) in FAIL_RESULTS


def is_place_visit(row) -> bool:
    """Collapsed visits that count on always-pass / cautious lists.

    HE_NotReq is still a citywide result code; it is not an inspection of the
    kitchen for place lists.
    """
    if isinstance(row, dict):
        result = strip_null(row.get("result", ""))
    else:
        result = strip_null(row)
    return result != "HE_NotReq"


def fail_severity(stars: dict) -> str:
    """Worst-on-visit class for a failed inspection. Our mapping, not ISD's.

    Analyze Boston does not publish a viol_level dictionary. The dump's
    Food Code suffixes line up with Boston's three grading bands:
    * = non-critical / Core (C) / 2 points (walls, wiping cloths);
    ** = critical / Priority Foundation (Pf) / 7 points (pests, date marking);
    *** = foodborne-critical / Priority (P) / 10 points (hot/cold holding).
    """
    if stars.get("**") or stars.get("***"):
        return SEV_MAJOR
    if stars.get("*"):
        return SEV_MINOR
    return SEV_UNSTARRED


def viol_star(raw: str) -> str:
    text = strip_null(raw)
    if text in STAR_LEVELS:
        return text
    return ""


def _strip_affixes(text: str) -> str:
    text, _loc = split_at_location(text)
    changed = True
    while changed:
        changed = False
        new = _PAREN_TAG_RE.sub("", text).rstrip(" ,")
        if new != text:
            text, changed = new, True
        new = _LEGAL_SUFFIX_RE.sub("", text).rstrip(" ,")
        if new != text:
            text, changed = new, True
    text = _AT_ABBREV_RE.sub("", text).rstrip(" ,")
    return " ".join(text.split())


def _fuse_initials(tokens: list[str]) -> list[str]:
    out: list[str] = []
    buf = ""
    for tok in tokens:
        if len(tok) == 1 and tok.isalpha():
            buf += tok
            continue
        if buf:
            out.append(buf)
            buf = ""
        out.append(tok)
    if buf:
        out.append(buf)
    return out


def normalize_name(business: str) -> str:
    text = _strip_affixes(business).casefold()
    text = text.replace("&", " ").replace("+", " ")
    text = re.sub(r"\band\b", " ", text)
    text = text.replace("'", "").replace("’", "")
    text = re.sub(r"(?<=[a-z0-9])no\.\s*(?=\d)", " no ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    tokens = [tok for tok in text.split() if tok]
    if tokens and tokens[0] == "the":
        tokens = tokens[1:]
    return " ".join(_fuse_initials(tokens))


def brand_key(business: str) -> str:
    return normalize_name(business)


def brand_compact(business: str) -> str:
    return brand_key(business).replace(" ", "")


def _web_ice_hit(compact: str, keys: set[str]) -> bool:
    if not compact:
        return False
    if compact in keys:
        return True
    if compact.endswith("s") and compact[:-1] in keys:
        return True
    return compact + "s" in keys


def _title_case_name(stripped: str) -> str:
    out: list[str] = []
    for word in stripped.split():
        if word in {"&", "+", "@"}:
            out.append(word)
            continue
        if re.fullmatch(r"(?:[A-Za-z]\.){1,4}", word):
            out.append(word.upper())
            continue
        core = word.rstrip(".")
        if len(core) <= 2 and core.isalpha():
            out.append(core.upper())
            continue
        out.append(word.capitalize())
    return " ".join(out)


def name_display(business: str) -> str:
    stripped = _strip_affixes(business)
    if not stripped:
        return strip_null(business)
    letters = [ch for ch in stripped if ch.isalpha()]
    if letters and (sum(ch.isupper() for ch in letters) / len(letters)) >= 0.72:
        return _title_case_name(stripped)
    return stripped


def set_web_ice_names(names: list[str] | None) -> None:
    global _web_ice_override, _web_ice_file_cache
    if names is None:
        _web_ice_override = None
        _web_ice_file_cache = None
    else:
        _web_ice_override = {brand_compact(n) for n in names if n.strip()}


def _load_web_ice_compact(path: Path) -> set[str]:
    if not path.is_file():
        return set()
    raw = json.loads(path.read_text())
    names = raw.get("names", [])
    keys: set[str] = set()
    for item in names:
        label = item.get("name", "") if isinstance(item, dict) else str(item)
        compact = brand_compact(label)
        if compact:
            keys.add(compact)
    return keys


def _web_ice_compact() -> set[str]:
    global _web_ice_file_cache
    if _web_ice_override is not None:
        return _web_ice_override
    if _web_ice_file_cache is None:
        _web_ice_file_cache = _load_web_ice_compact(WEB_ICE_PATH)
    return _web_ice_file_cache


def set_web_grocery_names(names: list[str] | None) -> None:
    global _web_grocery_override, _web_grocery_file_cache
    if names is None:
        _web_grocery_override = None
        _web_grocery_file_cache = None
    else:
        _web_grocery_override = {brand_key(n) for n in names if n.strip()}


def _load_web_grocery_keys(path: Path) -> set[str]:
    if not path.is_file():
        return set()
    raw = json.loads(path.read_text())
    names = raw.get("names", [])
    keys: set[str] = set()
    for item in names:
        label = item.get("name", "") if isinstance(item, dict) else str(item)
        key = brand_key(label)
        if key:
            keys.add(key)
    return keys


def _web_grocery_keys() -> set[str]:
    global _web_grocery_file_cache
    if _web_grocery_override is not None:
        return _web_grocery_override
    if _web_grocery_file_cache is None:
        _web_grocery_file_cache = _load_web_grocery_keys(WEB_GROCERY_PATH)
    return _web_grocery_file_cache


def _consecutive_tokens(hay: str, needle: str) -> bool:
    h = hay.split()
    n = needle.split()
    if not n or not h or len(n) > len(h):
        return False
    span = len(n)
    for i in range(len(h) - span + 1):
        if h[i : i + span] == n:
            return True
    return False


def _web_brand_key_hit(key: str, keys: set[str]) -> bool:
    if not key:
        return False
    for web in keys:
        if not web:
            continue
        if key == web or key.startswith(web + " "):
            return True
        if _consecutive_tokens(key, web):
            return True
        if web.endswith("s"):
            stem = web[:-1].rstrip()
            if stem and (key == stem or key.startswith(stem + " ")):
                return True
        if key.endswith("s"):
            stem = key[:-1].rstrip()
            if stem and (stem == web or stem.startswith(web + " ")):
                return True
    return False


def _is_pharmacy(norm: str) -> bool:
    text = re.sub(r"\bcvsno\b", "cvs no", norm)
    return bool(_PHARMACY_RE.search(text))


def categorize(business: str, licensecat: str) -> str:
    name = strip_null(business)
    trade, loc = split_at_location(name)
    norm = normalize_name(name)
    coded = CODED_CAT.get(strip_null(licensecat).upper(), CAT_OTHER)
    if (
        _ICE_RE.search(name)
        or _ICE_RE.search(norm)
        or _web_ice_hit(brand_compact(name), _web_ice_compact())
    ):
        return CAT_ICE
    if loc and _is_generic_host_kitchen(trade):
        if (
            _HOSPITAL_RE.search(loc)
            or re.search(r"(?i)\bmedical\s+c(?:en)?t", loc)
            or _HOSPITAL_HOST_RE.search(loc)
        ):
            return CAT_HOSPITAL
        if (
            _SCHOOL_RE.search(loc)
            or re.search(
                r"(?i)\b(?:college|university|univ\.?|school|institute)\b", loc
            )
            or _SCHOOL_HOST_RE.search(loc)
        ):
            return CAT_SCHOOL
    if _CULTURAL_RE.search(norm):
        return CAT_CULTURAL
    if _HOSPITAL_RE.search(norm):
        return CAT_HOSPITAL
    if _HOTEL_RE.search(norm):
        return CAT_HOTEL
    if _SCHOOL_RE.search(norm) or (
        _SCHOOL_WORD_RE.search(norm) and not _SCHOOL_STREET_RE.search(norm)
    ):
        return CAT_SCHOOL
    if _CAFE_RE.search(norm):
        return CAT_CAFE
    if _is_pharmacy(norm):
        return CAT_PHARMACY
    if _GROCERY_RE.search(norm) or _web_brand_key_hit(
        brand_key(name), _web_grocery_keys()
    ):
        return CAT_GROCERY
    if _VARIETY_STORE_RE.search(norm) or _VARIETY_STORE_RE.search(name):
        return CAT_OTHER
    return coded


def is_citywide_placeholder(address: str) -> bool:
    text = " ".join(strip_null(address).upper().split())
    if not text:
        return False
    if "CITYWIDE" in text:
        return True
    return text in {"1 CITYWIDE ST", "1 CITYWIDE"}


def format_address_display(
    address: str,
    zip5: str = "",
    licenseno: str = "",
) -> str:
    if is_citywide_placeholder(address):
        if licenseno:
            return f"Mobile (citywide) · License {licenseno}"
        return "Mobile (citywide)"
    if address and zip5:
        return f"{address}, {zip5}"
    return address or zip5


def _place_key(row: dict) -> str:
    return row["licenseno"] or f"{row['business']}|{row['address']}|{row['zip']}"


def _license_id(rec: dict) -> str:
    return rec.get("license") or f"{rec['name']}|{rec['address']}|{rec['zip']}"


def _is_major_fail_row(row: dict) -> bool:
    return bool(row.get("fail")) and fail_severity(row.get("stars") or {}) == SEV_MAJOR


def _roll_places(rows: list[dict]) -> dict[str, dict]:
    by: dict[str, dict] = {}
    for row in rows:
        if not is_place_visit(row):
            continue
        key = _place_key(row)
        rec = by.get(key)
        if rec is None:
            rec = {
                "name": row["business"],
                "name_display": name_display(row["business"]),
                "brand_key": brand_key(row["business"]),
                "address": row["address"],
                "zip": row["zip"],
                "license": row["licenseno"],
                "category": categorize(row["business"], row["licensecat"]),
                "licstatus": "",
                "inspections": 0,
                "fails": 0,
                "major_fails": 0,
                "last_fail_dt": "",
                "last_fail_severity": "",
            }
            by[key] = rec
        if row.get("licstatus") == ACTIVE_STATUS:
            rec["licstatus"] = ACTIVE_STATUS
        rec["inspections"] += 1
        if row["fail"]:
            rec["fails"] += 1
            if _is_major_fail_row(row):
                rec["major_fails"] += 1
                dtiso = row.get("resultdttm") or ""
                if dtiso >= rec["last_fail_dt"]:
                    rec["last_fail_dt"] = dtiso
                    rec["last_fail_severity"] = SEV_MAJOR
    for rec in by.values():
        n = rec["inspections"]
        rec["fail_rate"] = round(100.0 * rec["fails"] / n, 1) if n else 0.0
    return by


def _public_place(rec: dict, extra: tuple[str, ...] = ()) -> dict:
    rec = dict(rec)
    rec["address_display"] = format_address_display(
        rec["address"], rec["zip"], rec.get("license", "")
    )
    keys = (
        "name",
        "name_display",
        "brand_key",
        "address",
        "address_display",
        "zip",
        "license",
        "category",
        "inspections",
        "fails",
        "fail_rate",
    ) + extra
    return {k: rec[k] for k in keys if k in rec}


def _is_active_place(rec: dict) -> bool:
    return rec.get("licstatus") == ACTIVE_STATUS


def _split_window_lists(places: list[dict]) -> tuple[list[dict], list[dict]]:
    ranked = [
        p
        for p in places
        if p["category"] in RANKING_CATS and _is_active_place(p)
    ]
    cautious = [
        p for p in ranked if p.get("major_fails", 0) >= CAUTIOUS_MAJOR_MIN
    ]
    cautious.sort(
        key=lambda p: (-p["major_fails"], -p["fails"], p["name"].lower())
    )
    cautious_ids = {_license_id(p) for p in cautious}
    always = [
        p
        for p in ranked
        if p["fails"] == 0
        and p["inspections"] >= ALWAYS_PASS_MIN
        and _license_id(p) not in cautious_ids
    ]
    always.sort(key=lambda p: (-p["inspections"], p["name"].lower()))
    return always, cautious


def place_lists_for_window(places: list[dict]) -> dict:
    """Always-pass and be-cautious for one year window. Same rules every category."""
    always, cautious = _split_window_lists(places)
    extra = ("major_fails", "last_fail_severity")
    by_category: dict[str, dict] = {}
    for lab in RANKING_ORDER:
        subset = [p for p in places if p["category"] == lab]
        cat_always, cat_cautious = _split_window_lists(subset)
        if not cat_always and not cat_cautious:
            continue
        by_category[lab] = {
            "always_pass": [_public_place(p) for p in cat_always[:10]],
            "places_to_avoid": [
                _public_place(p, extra=extra) for p in cat_cautious[:10]
            ],
            "always_pass_n": len(cat_always),
            "repeat_n": len(cat_cautious),
        }
    return {
        "always_pass": always,
        "cautious": cautious,
        "by_category": by_category,
    }


def _window_payload(by: dict[str, dict], ytd: bool) -> dict:
    places = list(by.values())
    lists = place_lists_for_window(places)
    always = lists["always_pass"]
    cautious = lists["cautious"]
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
    extra = ("major_fails", "last_fail_severity")
    return {
        "ytd": ytd,
        "min_pass_inspections": ALWAYS_PASS_MIN,
        "min_major_fails": CAUTIOUS_MAJOR_MIN,
        "always_pass": [_public_place(p) for p in always[:10]],
        "repeat_offenders": [],
        "places_to_avoid": [_public_place(p, extra=extra) for p in cautious[:10]],
        "always_pass_n": len(always),
        "repeat_n": len(cautious),
        "category_n": category_n,
        "by_category": lists["by_category"],
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
                    "licstatus": strip_null(raw.get("licstatus", "")),
                    "zip": zip5,
                    "neighborhood": ZIP_NEIGHBORHOOD.get(zip5, ""),
                    "resultdttm": dt.isoformat(timespec="seconds"),
                    "n_viol": 0,
                    "stars": {"*": 0, "**": 0, "***": 0},
                    "violdesc": Counter(),
                    "violdesc_star": {
                        "*": Counter(),
                        "**": Counter(),
                        "***": Counter(),
                    },
                }
            rec = groups[key]
            if has_viol:
                rec["n_viol"] += 1
            if star:
                rec["stars"][star] += 1
            desc = strip_null(raw.get("violdesc", ""))
            if desc:
                rec["violdesc"][desc] += 1
                if star:
                    rec["violdesc_star"][star][desc] += 1
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


def _severity_block(visits: list[dict]) -> dict:
    fails = [r for r in visits if r["fail"]]
    n = len(fails)
    bands = Counter(fail_severity(r["stars"]) for r in fails)
    major = bands[SEV_MAJOR]
    minor = bands[SEV_MINOR]
    unst = bands[SEV_UNSTARRED]
    foodborne = sum(1 for r in fails if r["stars"].get("***"))
    crit_only = sum(
        1 for r in fails if r["stars"].get("**") and not r["stars"].get("***")
    )
    major_desc: Counter = Counter()
    minor_desc: Counter = Counter()
    for r in fails:
        by_star = r.get("violdesc_star") or {}
        major_seen = set(by_star.get("**", ())) | set(by_star.get("***", ()))
        minor_seen = set(by_star.get("*", ()))
        major_desc.update(major_seen)
        minor_desc.update(minor_seen)
    ops = Counter(r["result"] for r in visits if r["result"] in SEVERE_OPS)
    by_category = []
    for lab in OVERLAY_ORDER:
        subset = [
            r
            for r in fails
            if categorize(r["business"], r["licensecat"]) == lab
        ]
        if not subset:
            continue
        cb = Counter(fail_severity(r["stars"]) for r in subset)
        tot = len(subset)
        by_category.append({
            "label": lab,
            "fails": tot,
            "major": cb[SEV_MAJOR],
            "minor_only": cb[SEV_MINOR],
            "unstarred": cb[SEV_UNSTARRED],
            "major_share": round(100.0 * cb[SEV_MAJOR] / tot, 1) if tot else 0.0,
        })
    return {
        "fails": n,
        "major": major,
        "minor_only": minor,
        "unstarred": unst,
        "major_share": round(100.0 * major / n, 1) if n else 0.0,
        "minor_only_share": round(100.0 * minor / n, 1) if n else 0.0,
        "foodborne_critical": foodborne,
        "critical_not_foodborne": crit_only,
        "severe_ops": {
            "n": sum(ops.values()),
            "HE_VolClos": ops.get("HE_VolClos", 0),
            "HE_TSOP": ops.get("HE_TSOP", 0),
            "HE_Closure": ops.get("HE_Closure", 0),
        },
        "top_major": _top(major_desc, 8),
        "top_minor": _top(minor_desc, 8),
        "by_category": by_category,
    }


SEVERITY_RULE = (
    "A failed inspection is major if it has at least one ** or *** "
    "violation (critical / foodborne-critical on Boston’s 7- and 10-point "
    "bands); minor-only if starred violations are only * (non-critical / "
    "2 points — walls, wiping cloths, labels). Mixed visits count as major "
    "(worst-on-visit). Unstarred fails have no * / ** / ***. Analyze Boston "
    "does not publish a star dictionary; this is our mapping from viol_level "
    "plus Food Code (C)/(Pf)/(P) suffixes in the dump, aligned to ISD grading "
    "and Mayor’s Food Court language. It is not an official ISD “major "
    "failure” label. Letter grade is still on the door. HE_TSOP / HE_VolClos "
    "/ HE_Closure are severe operational results, not fail codes. HE_Filed "
    "is not a fail."
)

REPEAT_ACROSS_WINDOW = "2012–2026 · methods appendix · not a Places year pill"
REPEAT_ACROSS_RULE = (
    "Places always-pass and be-cautious use the same window. This career "
    "rollup is not mixed with a year pill. It lists ranking categories only "
    "(not Hospital, School, Cultural / attraction, or Hotel) with a major "
    "fail (** or ***) in at least two calendar "
    "years. Minor-only repeats "
    "(* only — walls, wiping cloths) are excluded. Two major fails in the "
    "same year count as one year. Ranked by years with a major fail, then "
    "major-fail count. Severity is viol_level on the collapsed visit, not "
    "an official ISD avoid list. Web pages only help classify ice cream "
    "and grocery names; they are not inspection outcomes. HE_NotReq is not "
    "counted as an inspection on these lists."
)


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

    years_major: dict[str, set[int]] = defaultdict(set)
    across_roll: dict[str, dict] = {}
    for row in inspections:
        if not (2012 <= row["year"] <= YEAR_MAX):
            continue
        if not is_place_visit(row):
            continue
        key = _place_key(row)
        rec = across_roll.get(key)
        if rec is None:
            rec = {
                "name": row["business"],
                "name_display": name_display(row["business"]),
                "brand_key": brand_key(row["business"]),
                "address": row["address"],
                "zip": row["zip"],
                "license": row["licenseno"],
                "category": categorize(row["business"], row["licensecat"]),
                "licstatus": "",
                "inspections": 0,
                "fails": 0,
                "last_fail_dt": "",
                "last_fail_severity": "",
            }
            across_roll[key] = rec
        if row.get("licstatus") == ACTIVE_STATUS:
            rec["licstatus"] = ACTIVE_STATUS
        rec["inspections"] += 1
        if row["fail"] and fail_severity(row["stars"]) == SEV_MAJOR:
            rec["fails"] += 1
            years_major[key].add(row["year"])
            dtiso = row.get("resultdttm") or ""
            if dtiso >= rec["last_fail_dt"]:
                rec["last_fail_dt"] = dtiso
                rec["last_fail_severity"] = SEV_MAJOR
    across_places = []
    for key, rec in across_roll.items():
        nyears = len(years_major.get(key, ()))
        if nyears < REPEAT_YEAR_MIN:
            continue
        if rec["category"] not in RANKING_CATS:
            continue
        if rec.get("licstatus") != ACTIVE_STATUS:
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
    for lab in RANKING_ORDER:
        subset = [p for p in across_places if p["category"] == lab]
        if not subset:
            continue
        across_by_cat[lab] = {
            "places_to_avoid": [
                _public_place(
                    p, extra=("years_failed", "last_fail_severity")
                )
                for p in subset[:10]
            ],
            "repeat_n": len(subset),
        }
    repeat_across = {
        "window": REPEAT_ACROSS_WINDOW,
        "rule": REPEAT_ACROSS_RULE,
        "years": list(range(YEAR_MIN, YEAR_MAX + 1)),
        "repeat_n": len(across_places),
        "places": [
            _public_place(p, extra=("years_failed", "last_fail_severity"))
            for p in across_places[:15]
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
        "fail_severity": {
            "rule": SEVERITY_RULE,
            "y2025": _severity_block(y2025),
            "y2026_ytd": _severity_block(y2026),
        },
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
        "ranking_labels": list(RANKING_ORDER),
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
        "fail_severity": {
            "y2025": briefing["fail_severity"]["y2025"],
            "y2026_ytd": {
                k: briefing["fail_severity"]["y2026_ytd"][k]
                for k in (
                    "fails",
                    "major",
                    "minor_only",
                    "unstarred",
                    "major_share",
                )
            },
        },
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
