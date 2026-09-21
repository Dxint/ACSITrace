"""Loads the Graduate Tracer Survey (GTS) form schema used by the alumni intake page.

The schema was extracted from the university's Google Form (FB_PUBLIC_LOAD_DATA_)
and converted into a flat list of sections/fields so the survey page can be
rendered generically from data instead of hand-written markup per question.
"""
import json
from functools import lru_cache
from pathlib import Path

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "data" / "gts_survey.json"


@lru_cache(maxsize=1)
def get_survey_schema() -> dict:
    with SCHEMA_PATH.open(encoding="utf-8") as f:
        return json.load(f)
