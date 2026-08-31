#!/usr/bin/env python3
from __future__ import annotations

import os
import urllib.request
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path(os.environ.get("BOSTON_ANALYSIS_OUT", HERE / "outputs"))
DOWNLOADS = Path(os.environ.get("BOSTON_DATA_DIR", Path.home() / "Downloads"))
OUT.mkdir(parents=True, exist_ok=True)

DUMP = "https://data.boston.gov/datastore/dump/{id}"


def strip_null(value: str | None) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if text.upper() in {"", "NULL", "NONE", "NAN", "N/A", "NA"}:
        return ""
    return text


def parse_dt(raw: str) -> datetime | None:
    raw = strip_null(raw)
    if not raw:
        return None
    raw = raw.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(raw.replace(" ", "T", 1)).replace(tzinfo=None)
    except ValueError:
        return None


def download_dump(resource_id: str, dest: Path, opener=urllib.request.urlopen) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    url = DUMP.format(id=resource_id)
    with opener(url, timeout=300) as handle, dest.open("wb") as out:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            out.write(chunk)
    return dest


def per_1000(count: int, pop: int) -> float:
    if not pop:
        return 0.0
    return round(1000.0 * count / pop, 1)
