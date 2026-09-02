#!/usr/bin/env python3
"""Generate pw_code_table.json from dump (code, description) clusters."""
from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

from audit_pw_dump import citation_identity, exact_dup_key
from common import DOWNLOADS, OUT, strip_null

REPO = Path(__file__).resolve().parent
TABLE_PATH = REPO / "pw_code_table.json"
CITATION_CSV = DOWNLOADS / "pw-code-enforcement-violations.csv"

# Codes from the dump; family labels from boston.gov Code Enforcement.
OFFICIAL_FAMILY = {
    "1": "Trash storage",
    "2": "Trash storage",
    "3": "Trash storage",
    "4": "Trash storage",
    "20a": "Trash storage",
    "20b": "Trash storage",
    "5": "Illegal dumping",
    "6": "Illegal dumping",
    "8": "Illegal dumping",
    "9a": "Illegal dumping",
    "9b": "Illegal dumping",
    "9c": "Illegal dumping",
    "10a": "Illegal dumping",
    "10b": "Illegal dumping",
    "10c": "Illegal dumping",
    "11": "Illegal dumping",
    "12": "Illegal dumping",
    "13": "Illegal dumping",
    "14a": "Illegal dumping",
    "14b": "Illegal dumping",
    "34": "Illegal dumping",
    "36": "Illegal dumping",
    "15a": "Snow / ice sidewalk",
    "15b": "Snow / ice sidewalk",
    "15c": "Snow / ice sidewalk",
    "15d": "Snow / ice sidewalk",
    "16a": "Snow / ice sidewalk",
    "16b": "Snow / ice sidewalk",
    "17a": "Snow / ice sidewalk",
    "17b": "Snow / ice sidewalk",
    "17c": "Snow / ice sidewalk",
    "7": "Sidewalk cleanliness",
    "24": "Overgrown weeds",
    "27a": "Occupying city property",
    "27b": "Occupying city property",
    "27c": "Occupying city property",
    "21a": "Illegal parking on property",
    "21b": "Illegal parking on property",
    "22a": "Illegal parking on property",
    "22b": "Illegal parking on property",
    "18": "Signs / vending / graffiti",
    "23a": "Signs / vending / graffiti",
    "23b": "Signs / vending / graffiti",
    "28": "Signs / vending / graffiti",
    "29": "Signs / vending / graffiti",
    "30a": "Signs / vending / graffiti",
    "30b": "Signs / vending / graffiti",
    "30c": "Signs / vending / graffiti",
    "33a": "Signs / vending / graffiti",
    "33b": "Signs / vending / graffiti",
    "39a": "Signs / vending / graffiti",
    "39b": "Signs / vending / graffiti",
    "19a": "Site cleanliness / admin",
    "19b": "Site cleanliness / admin",
    "25": "Site cleanliness / admin",
    "38": "Site cleanliness / admin",
    "40": "Site cleanliness / admin",
    "41": "Site cleanliness / admin",
    "44": "Site cleanliness / admin",
    "46": "Site cleanliness / admin",
}

OFFICIAL_SOURCE = "https://www.boston.gov/departments/public-works/how-code-enforcement-works-boston"


def _cluster_codes(path: Path) -> dict[str, tuple[str, int]]:
    """Return code -> (most common description, unique ticket+code n after exact-dup drop)."""
    seen_dup: set[tuple] = set()
    pair_n: Counter[tuple[str, str]] = Counter()
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for row in csv.DictReader(handle):
            key = exact_dup_key(row)
            if key in seen_dup:
                continue
            seen_dup.add(key)
            code = strip_null(row.get("code"))
            if not code:
                continue
            ident = citation_identity(row)
            if not ident:
                continue
            desc = strip_null(row.get("description"))
            pair_n[(ident, code, desc)] += 1
    by_code_desc: dict[str, Counter[str]] = defaultdict(Counter)
    by_code_n: Counter[str] = Counter()
    seen_ticket_code: set[tuple[str, str]] = set()
    for (ident, code, desc), _n in pair_n.items():
        by_code_desc[code][desc] += 1
        ticket_code = (ident, code)
        if ticket_code not in seen_ticket_code:
            seen_ticket_code.add(ticket_code)
            by_code_n[code] += 1
    out: dict[str, tuple[str, int]] = {}
    for code, desc_counts in by_code_desc.items():
        desc, _ = desc_counts.most_common(1)[0]
        out[code] = (desc, by_code_n[code])
    return out


def build_table(path: Path) -> list[dict]:
    clusters = _cluster_codes(path)
    rows = []
    for code in sorted(clusters, key=lambda c: (-clusters[c][1], c)):
        desc, n = clusters[code]
        family = OFFICIAL_FAMILY.get(code, "Other")
        rows.append({
            "code": code,
            "description": desc,
            "family": family,
            "n": n,
            "source": OFFICIAL_SOURCE if code in OFFICIAL_FAMILY else "dump cluster leftover",
        })
    return rows


def family_for_code(code: str, description: str, table: list[dict]) -> str:
    code = strip_null(code)
    for row in table:
        if row["code"] == code:
            return row["family"]
    return "Other"


def leftover_codes(table: list[dict]) -> list[dict]:
    return [row for row in table if row["family"] == "Other"]


def main() -> None:
    if not CITATION_CSV.exists() or CITATION_CSV.stat().st_size == 0:
        raise SystemExit(f"missing dump {CITATION_CSV}")
    table = build_table(CITATION_CSV)
    TABLE_PATH.write_text(json.dumps(table, indent=2))
    leftover = leftover_codes(table)
    print(json.dumps({
        "codes": len(table),
        "leftover_n": len(leftover),
        "leftover": leftover,
        "top": table[:12],
    }, indent=2))
    print(f"wrote {TABLE_PATH}", flush=True)


if __name__ == "__main__":
    main()
