from __future__ import annotations

import unittest
from pathlib import Path

from audit_pw_dump import audit_citations, audit_workzones, citation_identity

FIX = Path(__file__).parent / "fixtures"


class CitationAuditTests(unittest.TestCase):
    def test_identity_prefers_ticket(self):
        self.assertEqual(citation_identity({"ticket_no": "T1", "case_no": "CE1"}), "T1")
        self.assertEqual(citation_identity({"ticket_no": "", "case_no": "CE6"}), "CE6")

    def test_raw_exceeds_tickets_and_void_split(self):
        audit = audit_citations(FIX / "pw_citations_sample.csv")
        self.assertEqual(audit["raw_rows"], 8)
        self.assertEqual(audit["unique_tickets"], 6)
        self.assertGreater(audit["raw_rows"], audit["unique_tickets"])
        self.assertEqual(audit["multi_code_tickets"], 1)
        self.assertEqual(audit["exact_dup_rows"], 1)
        self.assertEqual(audit["void_tickets"], 1)
        self.assertEqual(audit["null_ticket_rows"], 1)


class WorkzoneAuditTests(unittest.TestCase):
    def test_permit_collapse_and_category_normalize(self):
        audit = audit_workzones(FIX / "pw_workzones_sample.csv")
        self.assertEqual(audit["raw_rows"], 4)
        self.assertEqual(audit["unique_permits"], 3)
        self.assertIn("NEW CONDUIT AND/OR MAIN", audit["categories"])


class CodeTableTests(unittest.TestCase):
    def test_fixture_codes_cover_and_trash_not_snow(self):
        from build_pw_code_table import build_table, family_for_code
        table = build_table(FIX / "pw_citations_sample.csv")
        codes = {row["code"] for row in table}
        self.assertEqual(codes, {"27b", "24", "1", "17a", "3"})
        self.assertEqual(family_for_code("1", "Improper storage trash: res", table), "Trash storage")
        self.assertEqual(family_for_code("17a", "Failure clear sidewalk - snow", table), "Snow / ice sidewalk")
        self.assertNotEqual(family_for_code("1", "Improper storage trash: res", table), "Snow / ice sidewalk")


if __name__ == "__main__":
    unittest.main()
