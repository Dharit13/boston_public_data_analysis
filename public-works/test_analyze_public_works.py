from __future__ import annotations

import json
import unittest
from pathlib import Path

from analyze_public_works import briefing_from_rows, load_citations, load_workzones, parse_fine

FIX = Path(__file__).parent / "fixtures"
DUMP = Path("/Users/dhshah/Downloads/pw-code-enforcement-violations.csv")


class CollapseTests(unittest.TestCase):
    def test_exact_dup_and_multi_code_ticket(self):
        tickets, charges, q = load_citations(FIX / "pw_citations_sample.csv")
        ids = {t["ticket"] for t in tickets}
        self.assertEqual(q["citation_raw"], 8)
        self.assertIn("T1", ids)
        self.assertEqual(sum(1 for t in tickets if t["ticket"] == "T1"), 1)
        t1_charges = [c for c in charges if c["ticket"] == "T1"]
        self.assertEqual({c["code"] for c in t1_charges}, {"27b", "24"})
        self.assertNotIn("T5", ids)  # Void
        self.assertTrue(any(t["ticket"] == "CE6" for t in tickets))  # null ticket_no

    def test_year_clock_not_open_caseload(self):
        tickets, charges, q = load_citations(FIX / "pw_citations_sample.csv")
        wz, wq = load_workzones(FIX / "pw_workzones_sample.csv")
        b = briefing_from_rows(tickets, charges, wz, [], {**q, **wq})
        self.assertEqual(b["years"], list(range(2012, 2026)))
        self.assertNotIn(2026, b["years"])
        self.assertEqual(b["y2025"]["n"], 3)  # T1, T2, CE6 — not T4 (2026), not T5 void, not T3 (2019)
        self.assertEqual(b["y2019"]["n"], 1)
        self.assertEqual(b["y2026_ytd"]["n"], 1)
        self.assertEqual(b["open_caseload"]["n"], 2)  # T1 and T4
        self.assertNotEqual(b["open_caseload"]["n"], b["y2025"]["n"])
        fam = {x["label"]: x["value"] for x in b["families_2025"]}
        self.assertIn("Trash storage", fam)
        self.assertEqual(b["workzones"]["jobs"], 3)
        self.assertEqual(b["workzones"]["locations"], 4)


class IsolationTests(unittest.TestCase):
    def test_workzone_and_311_not_in_by_year(self):
        tickets, charges, q = load_citations(FIX / "pw_citations_sample.csv")
        wz, wq = load_workzones(FIX / "pw_workzones_sample.csv")
        b = briefing_from_rows(tickets, charges, wz, [], {**q, **wq})
        by = {row["year"]: row["n"] for row in b["by_year"]}
        self.assertEqual(by.get(2025), 3)
        self.assertNotIn("workzones", b["by_year"][0])
        self.assertIn("overlap_311", b)
        self.assertIsInstance(b["overlap_311"]["caption"], str)
        self.assertNotEqual(b["y2025"]["n"] + b["y2026_ytd"]["n"], b["overlap_311"].get("y2025_n", 276093))


class FineTests(unittest.TestCase):
    def test_parse_fine_value_string(self):
        self.assertEqual(parse_fine("25"), 25.0)
        self.assertEqual(parse_fine("$50.00"), 50.0)
        self.assertEqual(parse_fine(""), 0.0)


@unittest.skipUnless(DUMP.exists() and DUMP.stat().st_size > 0, "citation dump not downloaded")
class DumpGateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tickets, cls.charges, cls.q = load_citations(DUMP)

    def test_collapse_actually_collapses(self):
        self.assertGreater(self.q["citation_raw"], len(self.tickets))
        self.assertGreater(len(self.tickets), 500000)

    def test_void_not_in_volume(self):
        self.assertTrue(all(t["status"].lower() != "void" for t in self.tickets))

    def test_leftover_codes_are_table_other_not_missing(self):
        table = json.loads((Path(__file__).parent / "pw_code_table.json").read_text())
        table_codes = {row["code"] for row in table}
        dump_codes = {c["code"] for c in self.charges}
        self.assertEqual(dump_codes - table_codes, set())

    def test_open_caseload_not_added_to_2025_issued(self):
        b = briefing_from_rows(self.tickets, self.charges, [], [], self.q)
        issued_2025 = {t["ticket"] for t in self.tickets if t["year"] == 2025}
        self.assertNotEqual(b["open_caseload"]["n"], b["y2025"]["n"])
        self.assertEqual(b["y2025"]["n"], len(issued_2025))
        career_note = b["quality"]["note"]
        self.assertIn("ticket", career_note.lower())
        self.assertNotEqual(b["y2025"]["n"] + b["y2026_ytd"]["n"], 276093)


if __name__ == "__main__":
    unittest.main()
