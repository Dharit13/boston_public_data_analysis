from __future__ import annotations

import json
import unittest
from pathlib import Path

from analyze_food import (
    ALWAYS_PASS_MIN,
    _place_key,
    _roll_places,
    brand_compact,
    brand_key,
    briefing_from_rows,
    categorize,
    format_address_display,
    is_citywide_placeholder,
    is_fail,
    load_inspections,
    load_licenses,
    name_display,
    normalize_name,
    set_web_ice_names,
    viol_star,
    zip5_of,
)
from common import ZIP_NEIGHBORHOOD

FIX = Path(__file__).parent / "fixtures"


class ResultTests(unittest.TestCase):
    def test_fail_is_exact_codes_not_substrings(self):
        self.assertTrue(is_fail("HE_Fail"))
        self.assertTrue(is_fail("HE_FailExt"))
        self.assertTrue(is_fail("Fail"))
        self.assertTrue(is_fail("Failed"))
        self.assertTrue(is_fail("HE_FAILNOR"))
        self.assertFalse(is_fail("HE_Filed"))
        self.assertFalse(is_fail("HE_Pass"))
        self.assertFalse(is_fail("Pass"))
        self.assertFalse(is_fail("PassViol"))
        self.assertFalse(is_fail("HE_Hearing"))
        self.assertFalse(is_fail("HE_Closure"))

    def test_star_levels_are_exact(self):
        self.assertEqual(viol_star("*"), "*")
        self.assertEqual(viol_star("**"), "**")
        self.assertEqual(viol_star("***"), "***")
        self.assertEqual(viol_star("1919"), "")
        self.assertEqual(viol_star(""), "")
        self.assertNotEqual(viol_star("***"), "*")


class ZipTests(unittest.TestCase):
    def test_pad_zip_and_neighborhood(self):
        self.assertEqual(zip5_of("02119"), "02119")
        self.assertEqual(zip5_of("2119"), "02119")
        self.assertEqual(zip5_of("02119-1234"), "02119")
        self.assertEqual(ZIP_NEIGHBORHOOD["02119"], "Roxbury")
        self.assertEqual(ZIP_NEIGHBORHOOD["02108"], "Beacon Hill / Downtown")


class LoadTests(unittest.TestCase):
    def test_drops_null_resultdttm_and_collapses_violations(self):
        rows, q = load_inspections(FIX / "food_inspections_sample.csv")
        self.assertEqual(q["insp_raw"], 12)
        self.assertEqual(q["insp_drop"], 1)
        self.assertEqual(q["insp_kept_rows"], 11)
        self.assertEqual(q["insp_kept"], 8)
        years = sorted(r["year"] for r in rows)
        self.assertEqual(years, [2012, 2019, 2019, 2020, 2025, 2025, 2025, 2026])
        fail_2019 = [r for r in rows if r["year"] == 2019 and r["fail"]]
        self.assertEqual(len(fail_2019), 1)
        self.assertEqual(fail_2019[0]["n_viol"], 3)
        self.assertEqual(fail_2019[0]["stars"]["*"], 1)
        self.assertEqual(fail_2019[0]["stars"]["**"], 1)
        self.assertEqual(fail_2019[0]["stars"]["***"], 1)

    def test_licenses_are_not_inspections(self):
        licenses, q = load_licenses(FIX / "food_licenses_sample.csv")
        self.assertEqual(q["lic_raw"], 2)
        self.assertEqual(q["lic_kept"], 2)
        self.assertEqual(len(licenses), 2)
        self.assertNotIn("result", licenses[0])
        self.assertNotIn("resultdttm", licenses[0])


class BriefingTests(unittest.TestCase):
    def test_result_mix_levels_fail_rate_and_licenses_not_mixed(self):
        inspections, iq = load_inspections(FIX / "food_inspections_sample.csv")
        licenses, lq = load_licenses(FIX / "food_licenses_sample.csv")
        b = briefing_from_rows(inspections, licenses, {**iq, **lq})
        self.assertEqual(b["years"], list(range(2012, 2026)))
        self.assertNotIn(2026, b["years"])
        by = {row["year"]: row for row in b["by_year"]}
        self.assertEqual(by[2012]["inspections"], 1)
        self.assertEqual(by[2019]["inspections"], 2)
        self.assertEqual(by[2020]["inspections"], 1)
        self.assertEqual(by[2025]["inspections"], 3)
        self.assertNotIn("licenses", by[2025])
        self.assertEqual(b["y2025"]["n"], 3)
        self.assertEqual(b["y2019"]["n"], 2)
        self.assertEqual(b["y2026_ytd"]["n"], 1)
        self.assertEqual(b["active_licenses"], 2)
        results = {x["label"]: x["value"] for x in b["results_2025"]}
        self.assertEqual(results["HE_Fail"], 1)
        self.assertEqual(results["HE_Pass"], 1)
        self.assertEqual(results["HE_Filed"], 1)
        levels = {x["label"]: x["value"] for x in b["levels_2025"]}
        self.assertEqual(levels["*"], 1)
        self.assertEqual(levels["**"], 1)
        self.assertEqual(levels.get("***", 0), 0)
        rates = {(x["year"], x["zip"]): x["fail_rate"] for x in b["fail_rate_zip_year"]}
        self.assertEqual(rates[(2025, "02119")], 100.0)
        self.assertEqual(rates[(2025, "02108")], 0.0)
        self.assertEqual(rates[(2025, "02134")], 0.0)
        self.assertEqual(b["vs_2019"]["n2019"], 2)
        self.assertEqual(b["vs_2019"]["n2025"], 3)
        self.assertEqual(b["vs_2019"]["insp_pct"], 50.0)
        self.assertTrue(all("license" not in row for row in b["by_year"]))


class CategoryTests(unittest.TestCase):
    def test_coded_licensecat_before_names(self):
        self.assertEqual(categorize("Joe's Grill", "FS"), "Food and drinks")
        self.assertEqual(categorize("Joe's Grill", "FT"), "Take-out")
        self.assertEqual(categorize("Corner Market", "RF"), "Retail food")
        self.assertEqual(categorize("Truck 12", "MFW"), "Mobile food")
        self.assertEqual(categorize("Mystery Cart", ""), "Other / unclassified")

    def test_ice_cream_is_word_boundary_not_substring(self):
        self.assertEqual(categorize("Bart Ice Cream", "FT"), "Ice cream")
        self.assertEqual(categorize("DANTE'S FROZEN YOGURT", "FT"), "Ice cream")
        self.assertEqual(categorize("Chill Gelato", "FS"), "Ice cream")
        self.assertNotEqual(categorize("All Spice", "FS"), "Ice cream")
        self.assertNotEqual(categorize("ICE Auto Services", "RF"), "Ice cream")
        self.assertEqual(categorize("ICE Auto Services", "RF"), "Retail food")

    def test_cafe_not_school_street_and_not_museum(self):
        self.assertEqual(categorize("Al's School Street Cafe", "FS"), "Cafe")
        self.assertEqual(categorize("Children's Museum Shop", "RF"), "Cultural / attraction")
        self.assertEqual(categorize("Tufts Medical Center Cafe", "FS"), "Hospital")
        self.assertEqual(categorize("Emerson College Dining", "FS"), "School")
        self.assertEqual(categorize("Marriott Hotel Kitchen", "FS"), "Hotel")


class NamePipelineTests(unittest.TestCase):
    def setUp(self):
        set_web_ice_names([
            "J.P. Licks",
            "FoMu",
            "Ben & Jerry's",
            "Emack & Bolio's",
            "The Ice Creamsmith",
            "Amorino",
        ])

    def tearDown(self):
        set_web_ice_names(None)

    def test_jp_licks_variants_share_brand_key_and_are_ice_cream(self):
        names = ("J.P. Licks", "J.P. LICKS INC.", "J.P. Licks @ Charles Street")
        self.assertEqual({brand_key(n) for n in names}, {"jp licks"})
        self.assertEqual({brand_compact(n) for n in names}, {"jplicks"})
        for n in names:
            self.assertEqual(categorize(n, "FT"), "Ice cream")
            self.assertEqual(name_display(n), "J.P. Licks")

    def test_jp_licks_west_roxbury_inc_normalizes_to_same_brand(self):
        self.assertEqual(brand_key("J.P. LICKS AT W.R.  INC."), "jp licks")
        self.assertEqual(categorize("J.P. LICKS AT W.R.  INC.", "FT"), "Ice cream")
        self.assertEqual(name_display("J.P. LICKS AT W.R.  INC."), "J.P. Licks")

    def test_same_brand_keeps_distinct_licenses(self):
        rows = [
            {
                "business": "J.P. Licks",
                "licenseno": "21069",
                "address": "659  CENTRE ST",
                "zip": "02130",
                "licensecat": "FT",
                "fail": False,
            },
            {
                "business": "J.P. LICKS INC.",
                "licenseno": "21069-dup-should-not-happen",
                "address": "352  NEWBURY ST",
                "zip": "02115",
                "licensecat": "FT",
                "fail": False,
            },
            {
                "business": "J.P. Licks @ Charles Street",
                "licenseno": "78337",
                "address": "144  CHARLES ST",
                "zip": "02114",
                "licensecat": "FT",
                "fail": False,
            },
        ]
        rows[1]["licenseno"] = "358739"
        by = _roll_places(rows)
        self.assertEqual(len(by), 3)
        self.assertEqual(len({_place_key(r) for r in rows}), 3)
        recs = list(by.values())
        self.assertEqual({r["brand_key"] for r in recs}, {"jp licks"})
        self.assertEqual({r["name_display"] for r in recs}, {"J.P. Licks"})
        self.assertEqual({r["name"] for r in recs}, {r["business"] for r in rows})
        self.assertEqual({r["address"] for r in recs}, {r["address"] for r in rows})
        self.assertTrue(all(r["category"] == "Ice cream" for r in recs))

    def test_ice_creamsmith_and_ben_jerry_and_emack_share_brand_keys(self):
        self.assertEqual(
            brand_compact("The Ice Creamsmith"),
            brand_compact("ICE CREAM SMITH"),
        )
        self.assertEqual(brand_compact("The Ice Creamsmith"), "icecreamsmith")
        self.assertEqual(categorize("ICE CREAM SMITH", "FT"), "Ice cream")
        self.assertEqual(categorize("The Ice Creamsmith", "FT"), "Ice cream")
        self.assertEqual(
            brand_compact("Ben & Jerry's"),
            brand_compact("BEN & JERRYS"),
        )
        self.assertEqual(
            brand_compact("Ben & Jerry's"),
            brand_compact("Ben and Jerry's"),
        )
        self.assertEqual(categorize("Ben & Jerry's", "FT"), "Ice cream")
        self.assertEqual(categorize("BEN & JERRYS", "FT"), "Ice cream")
        self.assertEqual(
            brand_compact("Emack & Bolio's"),
            brand_compact("Emack and Bolio's"),
        )
        self.assertEqual(categorize("Emack & Bolio's", "FT"), "Ice cream")
        self.assertEqual(categorize("Fomu", "FT"), "Ice cream")
        self.assertEqual(categorize("Fomu Ice Cream", "FT"), "Ice cream")

    def test_overlays_use_normalized_name_not_only_ice_cream(self):
        self.assertEqual(categorize("MARRIOTT HOTEL INC.", "FS"), "Hotel")
        self.assertEqual(categorize("Marriott Hotel Kitchen", "FS"), "Hotel")
        self.assertEqual(brand_key("MARRIOTT HOTEL INC."), brand_key("Marriott Hotel"))
        self.assertEqual(categorize("BLUE BOTTLE COFFEE INC.", "FT"), "Cafe")
        self.assertEqual(
            categorize("AL'S SCHOOL STREET CAFE INC.", "FS"),
            "Cafe",
        )
        self.assertEqual(categorize("Al's School Street Cafe", "FS"), "Cafe")
        self.assertEqual(categorize("ICE AUTO SERVICES INC.", "RF"), "Retail food")
        self.assertEqual(categorize("ICE Auto Services", "RF"), "Retail food")
        self.assertEqual(categorize("CHILDREN'S MUSEUM SHOP INC.", "RF"), "Cultural / attraction")
        self.assertEqual(categorize("TUFTS MEDICAL CENTER CAFE INC.", "FS"), "Hospital")
        self.assertEqual(categorize("EMERSON COLLEGE DINING INC.", "FS"), "School")

    def test_legalowner_is_not_an_argument_and_flour_is_cafe(self):
        self.assertEqual(categorize("FLOUR BAKERY & CAFE", "FS"), "Cafe")
        self.assertEqual(categorize("Lily's Market", "RF"), "Retail food")
        self.assertNotIn("legalowner", categorize.__code__.co_varnames)

    def test_generic_hospital_kitchen_is_hospital_named_cafe_is_cafe(self):
        self.assertEqual(
            categorize("3rd Floor @ Tufts Medical Center", "FS"),
            "Hospital",
        )
        self.assertEqual(
            categorize("Patient Dining @ Tufts Medical Center", "FS"),
            "Hospital",
        )
        self.assertEqual(
            categorize("Basement Dining @ Tufts Medical Center", "FS"),
            "Hospital",
        )
        self.assertEqual(
            categorize("1st Floor Cafe @ Tufts Medical Center", "FS"),
            "Cafe",
        )
        self.assertEqual(categorize("Tufts Medical Center Cafe", "FS"), "Hospital")
        self.assertEqual(name_display("3rd Floor @ Tufts Medical Center"), "3rd Floor")
        self.assertEqual(
            name_display("Patient Dining @ Tufts Medical Center"),
            "Patient Dining",
        )

    def test_coffee_shop_at_hotel_is_cafe_not_hotel(self):
        self.assertEqual(
            categorize("Cosmica @ the Revolution Hotel", "FS"),
            "Food and drinks",
        )
        self.assertEqual(
            categorize("Starbucks Coffee @Westin Copley", "FT"),
            "Cafe",
        )
        self.assertNotEqual(
            categorize("Starbucks Coffee @Westin Copley", "FT"),
            "Hotel",
        )
        self.assertEqual(name_display("Cosmica @ the Revolution Hotel"), "Cosmica")

    def test_company_in_trade_name_is_kept_legal_inc_still_stripped(self):
        self.assertEqual(
            name_display("ATLANTIC FISH COMPANY"),
            "Atlantic Fish Company",
        )
        self.assertEqual(brand_key("ATLANTIC FISH COMPANY"), "atlantic fish company")
        self.assertIn("company", brand_key("Boston Bagel Company"))
        self.assertIn("co", brand_key("Boston Chowda Co."))
        self.assertEqual(name_display("Boston Chowda Co."), "Boston Chowda Co.")
        self.assertEqual(name_display("J.P. LICKS INC."), "J.P. Licks")
        self.assertNotIn("inc", brand_key("J.P. LICKS INC."))
        self.assertNotIn("llc", brand_key("BLUE BOTTLE COFFEE LLC"))
        self.assertEqual(name_display("BLUE BOTTLE COFFEE INC."), "Blue Bottle Coffee")
        self.assertNotRegex(name_display("COMMONWEALTH COFFEE COMPANY LLC"), r"(?i)\bllc\b")
        self.assertIn("company", name_display("COMMONWEALTH COFFEE COMPANY LLC").casefold())

    def test_at_in_trade_name_is_not_stripped_as_location(self):
        self.assertIn("@", name_display("A @ Time"))
        self.assertEqual(name_display("A @ Time"), "A @ Time")
        self.assertEqual(brand_key("A @ Time"), "a time")
        self.assertNotEqual(brand_key("A @ Time"), "a")
        self.assertIn("@", name_display("EAST @ WEST"))
        self.assertEqual(brand_key("EAST @ WEST"), "east west")
        self.assertNotEqual(brand_key("EAST @ WEST"), "east")
        self.assertIn("@", name_display("The Inn @ St. Botolph"))
        self.assertIn("botolph", brand_key("The Inn @ St. Botolph"))
        self.assertEqual(
            brand_key("J.P. Licks @ Charles Street"),
            brand_key("J.P. Licks"),
        )
        self.assertEqual(name_display("J.P. Licks @ Charles Street"), "J.P. Licks")
        self.assertEqual(
            brand_key("J.P. Licks @ Southbay"),
            "jp licks",
        )

    def test_college_and_hospital_acronym_tails_are_locations(self):
        self.assertEqual(categorize("Cafeteria @ BHCC", "FS"), "School")
        self.assertEqual(name_display("Cafeteria @ BHCC"), "Cafeteria")
        self.assertNotIn("@", name_display("Sodexo @BIDMC"))
        self.assertEqual(name_display("Sodexo @BIDMC"), "Sodexo")
        self.assertEqual(categorize("Sodexo @BIDMC", "FT"), "Take-out")
        self.assertEqual(
            categorize("Dining Hall @Emerson", "FS"),
            "School",
        )

    def test_howl_at_the_moon_keeps_at_phrase(self):
        self.assertIn("moon", normalize_name("Howl at the Moon"))
        self.assertNotEqual(brand_key("Howl at the Moon"), "howl")

    def test_at_sign_without_following_space_still_strips_location(self):
        disp = name_display("AFC SUSHI @SIMMONS COLLEGE")
        self.assertNotIn("@", disp)
        self.assertEqual(normalize_name("AFC SUSHI @SIMMONS COLLEGE"), "afc sushi")
        self.assertEqual(
            categorize("AFC SUSHI @SIMMONS COLLEGE", "FT"),
            "Take-out",
        )

    def test_glued_at_sign_does_not_borrow_hospital_or_museum(self):
        self.assertNotIn("@", name_display("Starbucks@Boston Children's Hospital"))
        self.assertEqual(
            categorize("Starbucks@Boston Children's Hospital", "FT"),
            "Take-out",
        )
        self.assertNotEqual(
            categorize("Au Bon Pain Kiosk@Childrens Museum", "FT"),
            "Cultural / attraction",
        )

    def test_emack_without_possessive_matches_web_list(self):
        self.assertEqual(categorize("Emack & Bolio", "FT"), "Ice cream")
        self.assertEqual(
            brand_compact("Emack & Bolio") + "s",
            brand_compact("Emack & Bolio's"),
        )

    def test_all_caps_ice_cream_title_cases_ice(self):
        self.assertEqual(
            name_display("THE BOSTON ICE CREAM FACTORY"),
            "The Boston Ice Cream Factory",
        )
        self.assertEqual(name_display("P & R ICE CREAM"), "P & R Ice Cream")

    def test_truck_numbers_stay_in_display_licenses_stay_distinct(self):
        self.assertEqual(
            name_display("The Bacon Truck No. 2"),
            "The Bacon Truck No. 2",
        )
        a = {
            "business": "The Bacon Truck No. 2",
            "licenseno": "389249",
            "address": "1 CITYWIDE ST",
            "zip": "02128",
            "licensecat": "MFW",
            "fail": False,
        }
        b = {
            "business": "The Bacon Truck",
            "licenseno": "97097",
            "address": "1 CITYWIDE ST",
            "zip": "02128",
            "licensecat": "MFW",
            "fail": False,
        }
        by = _roll_places([a, b])
        self.assertEqual(len(by), 2)


class WebIceJsonTests(unittest.TestCase):
    def test_generated_json_has_source_urls_and_jp_licks(self):
        path = Path(__file__).parent / "ice_cream_web_matches.json"
        data = json.loads(path.read_text())
        self.assertTrue(data["names"])
        labels = []
        for item in data["names"]:
            self.assertTrue(item["name"])
            self.assertTrue(item["sources"])
            self.assertTrue(all(s.startswith("http") for s in item["sources"]))
            labels.append(item["name"])
        self.assertIn("J.P. Licks", labels)
        self.assertIn("FoMu", labels)
        self.assertIn("Emack & Bolio's", labels)
        self.assertIn("The Ice Creamsmith", labels)
        self.assertIn("Ben & Jerry's", labels)
        self.assertNotIn("Picco", labels)
        self.assertNotIn("P & R Restaurant", labels)
        bnj = next(item for item in data["names"] if item["name"] == "Ben & Jerry's")
        self.assertTrue(
            any("benjerry.com" in s or "boston.com" in s for s in bnj["sources"])
        )
        analyzer = (Path(__file__).parent / "analyze_food.py").read_text()
        self.assertNotIn('frozenset({"J.P. Licks"', analyzer)
        self.assertNotIn("J.P. Licks, Ben & Jerry", analyzer)

    def test_production_json_classifies_listed_shops(self):
        set_web_ice_names(None)
        self.assertEqual(categorize("J.P. Licks", "FT"), "Ice cream")
        self.assertEqual(categorize("J.P. LICKS INC.", "FT"), "Ice cream")
        self.assertEqual(categorize("Fomu", "FT"), "Ice cream")
        self.assertEqual(categorize("Amorino", "FT"), "Ice cream")
        self.assertEqual(categorize("Sweeties", "FT"), "Ice cream")
        self.assertEqual(categorize("Ben & Jerry's", "FT"), "Ice cream")
        self.assertEqual(categorize("BEN & JERRYS", "FT"), "Ice cream")
        self.assertEqual(categorize("Joe's Grill", "FS"), "Food and drinks")
        self.assertNotEqual(categorize("P & R Restaurant", "FT"), "Ice cream")
        self.assertEqual(
            categorize("P & R Restaurant & Ice Cream Parlor", "FT"),
            "Ice cream",
        )


class CitywideAddressTests(unittest.TestCase):
    def test_placeholder_is_citywide_not_a_street(self):
        self.assertTrue(is_citywide_placeholder("1  CITYWIDE ST"))
        self.assertTrue(is_citywide_placeholder("1 CITYWIDE ST"))
        self.assertTrue(is_citywide_placeholder("1 CITYWIDE"))
        self.assertTrue(is_citywide_placeholder("1  CITYWIDE"))
        self.assertTrue(is_citywide_placeholder("CITYWIDE"))
        self.assertTrue(is_citywide_placeholder("0  CITYWIDE AV"))
        self.assertTrue(is_citywide_placeholder("citywide st"))
        self.assertFalse(is_citywide_placeholder("5 Harbor ST"))
        self.assertFalse(is_citywide_placeholder("400  FENWAY"))
        self.assertFalse(is_citywide_placeholder("1  HOTEL DR"))
        self.assertFalse(is_citywide_placeholder(""))

    def test_display_hides_placeholder_and_keeps_real_streets(self):
        self.assertEqual(
            format_address_display("1  CITYWIDE ST", "02128", "77929"),
            "Mobile (citywide) · License 77929",
        )
        self.assertEqual(
            format_address_display("1 CITYWIDE", "02128", ""),
            "Mobile (citywide)",
        )
        self.assertEqual(
            format_address_display("5 Harbor ST", "02210", "L110"),
            "5 Harbor ST, 02210",
        )
        self.assertEqual(
            format_address_display("400  FENWAY", "02115", "L200"),
            "400  FENWAY, 02115",
        )


class PlaceWindowTests(unittest.TestCase):
    def test_always_pass_repeat_avoid_and_multi_year(self):
        self.assertEqual(ALWAYS_PASS_MIN, 3)
        inspections, iq = load_inspections(FIX / "food_places_inspections.csv")
        licenses, lq = load_licenses(FIX / "food_places_licenses.csv")
        b = briefing_from_rows(inspections, licenses, {**iq, **lq})
        self.assertNotIn("licenses", b["by_year"][0])
        self.assertEqual(b["active_licenses"], 2)
        self.assertEqual(b["y2025"]["n"], 36)
        windows = b["place_windows"]
        self.assertIn("2019", windows)
        self.assertIn("2024", windows)
        self.assertIn("2025", windows)
        self.assertIn("2026_ytd", windows)
        self.assertTrue(windows["2026_ytd"]["ytd"])
        self.assertFalse(windows["2025"]["ytd"])
        self.assertEqual(windows["2025"]["min_pass_inspections"], 3)

        names_2025_pass = [p["name"] for p in windows["2025"]["always_pass"]]
        self.assertIn("Safe Diner", names_2025_pass)
        self.assertIn("Bart Ice Cream", names_2025_pass)
        self.assertIn("ICE Auto Services", names_2025_pass)
        self.assertIn("Al's School Street Cafe", names_2025_pass)
        self.assertIn("Filed Only", names_2025_pass)
        self.assertNotIn("One Lucky Bowl", names_2025_pass)
        self.assertNotIn("Repeat Taco", names_2025_pass)
        bart = next(p for p in windows["2025"]["always_pass"] if p["name"] == "Bart Ice Cream")
        self.assertEqual(bart["category"], "Ice cream")
        self.assertEqual(bart["inspections"], 3)
        self.assertEqual(bart["fails"], 0)
        ice_auto = next(p for p in windows["2025"]["always_pass"] if p["name"] == "ICE Auto Services")
        self.assertEqual(ice_auto["category"], "Retail food")
        school_st = next(
            p for p in windows["2025"]["always_pass"] if p["name"] == "Al's School Street Cafe"
        )
        self.assertEqual(school_st["category"], "Cafe")
        filed = next(p for p in windows["2025"]["always_pass"] if p["name"] == "Filed Only")
        self.assertEqual(filed["fails"], 0)

        repeats = windows["2025"]["repeat_offenders"]
        self.assertEqual(repeats, [])
        avoid = windows["2025"]["places_to_avoid"]
        self.assertEqual(avoid, [])
        cultural_avoid = windows["2025"]["by_category"].get(
            "Cultural / attraction", {}
        ).get("places_to_avoid", [])
        self.assertEqual(cultural_avoid, [])
        takeout_avoid = windows["2025"]["by_category"].get("Take-out", {}).get(
            "places_to_avoid", []
        )
        self.assertEqual(takeout_avoid, [])

        y2019_pass = [p["name"] for p in windows["2019"]["always_pass"]]
        self.assertEqual(y2019_pass, ["Safe Diner"])
        y2024_pass = [p["name"] for p in windows["2024"]["always_pass"]]
        self.assertIn("Safe Diner", y2024_pass)
        self.assertIn("Mobile Walk", y2024_pass)
        y2026_pass = [p["name"] for p in windows["2026_ytd"]["always_pass"]]
        self.assertEqual(y2026_pass, ["Safe Diner"])
        y2026_rep = [p["name"] for p in windows["2026_ytd"]["repeat_offenders"]]
        self.assertEqual(y2026_rep, [])

        across = {p["name"]: p for p in b["repeat_across_years"]["places"]}
        self.assertIn("Repeat Taco", across)
        self.assertGreaterEqual(across["Repeat Taco"]["years_failed"], 3)
        self.assertNotIn("Children's Museum Shop", across)
        self.assertNotIn("Marriott Hotel Kitchen", across)
        self.assertEqual(b["repeat_across_years"]["window"], "2012–2026 · fail in ≥2 calendar years")
        taco_years = across["Repeat Taco"]["years_failed"]
        self.assertGreaterEqual(taco_years, 3)

        coded = {row["year"]: row for row in b["category_by_year"]}
        self.assertIn("Food and drinks", coded[2025])
        self.assertIn("Take-out", coded[2025])
        self.assertIn("Retail food", coded[2025])
        self.assertGreater(coded[2025]["Food and drinks"], 0)
        cats_2025 = {x["label"]: x["inspections"] for x in windows["2025"]["category_n"]}
        self.assertIn("Other / unclassified", cats_2025)
        self.assertGreater(cats_2025["Ice cream"], 0)
        self.assertGreater(cats_2025["Cafe"], 0)
        self.assertGreater(cats_2025["Cultural / attraction"], 0)
        self.assertGreater(cats_2025["Hospital"], 0)
        self.assertGreater(cats_2025["School"], 0)
        self.assertGreater(cats_2025["Hotel"], 0)

        by_cat = windows["2025"]["by_category"]
        ice_pass = [p["name"] for p in by_cat["Ice cream"]["always_pass"]]
        self.assertEqual(ice_pass, ["Bart Ice Cream"])
        self.assertEqual(by_cat["Ice cream"]["places_to_avoid"], [])
        self.assertNotIn("ICE Auto Services", ice_pass)
        cafe_pass = [p["name"] for p in by_cat["Cafe"]["always_pass"]]
        self.assertEqual(cafe_pass, ["Al's School Street Cafe"])
        self.assertNotIn("Tufts Medical Center Cafe", cafe_pass)
        self.assertEqual(
            [p["name"] for p in by_cat["Hospital"]["always_pass"]],
            ["Tufts Medical Center Cafe"],
        )
        food_pass = [p["name"] for p in by_cat["Food and drinks"]["always_pass"]]
        self.assertIn("Safe Diner", food_pass)
        self.assertNotIn("Bart Ice Cream", food_pass)
        self.assertNotIn("Al's School Street Cafe", food_pass)
        self.assertIn("by_category", windows["2026_ytd"])

        across_cat = b["repeat_across_years"]["by_category"]
        self.assertEqual(
            [p["name"] for p in across_cat["Take-out"]["places_to_avoid"]],
            ["Repeat Taco"],
        )
        self.assertNotIn("Cultural / attraction", across_cat)

    def test_citywide_placeholder_not_published_as_storefront(self):
        inspections, iq = load_inspections(FIX / "food_places_inspections.csv")
        licenses, lq = load_licenses(FIX / "food_places_licenses.csv")
        b = briefing_from_rows(inspections, licenses, {**iq, **lq})
        y2024 = b["place_windows"]["2024"]["always_pass"]
        walk = next(p for p in y2024 if p["name"] == "Mobile Walk")
        self.assertEqual(walk["address"], "5 Harbor ST")
        self.assertEqual(walk["address_display"], "5 Harbor ST, 02210")
        self.assertEqual(walk["license"], "L110")
        self.assertNotRegex(walk["address_display"], r"(?i)1\s+CITYWIDE")
        cart = next(p for p in y2024 if p["name"] == "Citywide Cart")
        self.assertEqual(cart["address"], "1 CITYWIDE ST")
        self.assertEqual(cart["address_display"], "Mobile (citywide) · License L114")
        self.assertEqual(cart["license"], "L114")
        self.assertNotRegex(cart["address_display"], r"(?i)1\s+CITYWIDE")
        self.assertNotIn("02128", cart["address_display"])
        by_mfw = b["place_windows"]["2024"]["by_category"]["Mobile food"]["always_pass"]
        cart_mfw = next(p for p in by_mfw if p["name"] == "Citywide Cart")
        self.assertEqual(
            cart_mfw["address_display"],
            "Mobile (citywide) · License L114",
        )
        across = next(
            p
            for p in b["repeat_across_years"]["places"]
            if p["name"] == "Citywide Repeat"
        )
        self.assertEqual(across["address"], "1 CITYWIDE")
        self.assertEqual(
            across["address_display"],
            "Mobile (citywide) · License L115",
        )
        self.assertNotRegex(across["address_display"], r"(?i)1\s+CITYWIDE")
        avoid_mfw = b["repeat_across_years"]["by_category"]["Mobile food"][
            "places_to_avoid"
        ]
        self.assertEqual(avoid_mfw[0]["name"], "Citywide Repeat")
        self.assertEqual(
            avoid_mfw[0]["address_display"],
            "Mobile (citywide) · License L115",
        )


CANVASES = Path(
    "/Users/dhshah/.cursor/projects/"
    "Users-dhshah-fullsend-fullsend-demo-target-github-workflows-boston-data/canvases"
)
REPO = Path(__file__).parent


class CanvasLayoutTests(unittest.TestCase):
    def test_food_stats_json_lives_next_to_python(self):
        self.assertTrue((REPO / "food_stats.json").is_file())

    def test_food_canvas_matches_sidecar_pattern(self):
        tsx = CANVASES / "boston-food-safety.canvas.tsx"
        sidecar = CANVASES / "boston-food-safety.canvas.data.json"
        self.assertTrue(tsx.is_file(), f"missing canvas {tsx}")
        self.assertTrue(sidecar.is_file(), f"missing sidecar {sidecar}")

    def test_food_canvas_openable_from_workspace(self):
        path = REPO / "canvases" / "boston-food-safety.canvas.tsx"
        self.assertTrue(path.exists(), f"file not found: {path}")
        sidecar = REPO / "canvases" / "boston-food-safety.canvas.data.json"
        self.assertTrue(sidecar.exists(), f"file not found: {sidecar}")

    def test_canvas_tracks_briefing_json_labels(self):
        import json
        import re

        text = (CANVASES / "boston-food-safety.canvas.tsx").read_text()
        stats = json.loads((REPO / "food_stats.json").read_text())
        self.assertNotIn("Five findings", text)
        self.assertIn("Six findings", text)
        self.assertNotIn("fetch(", text)
        self.assertIn("12,414", text)
        self.assertIn("10,116", text)
        self.assertIn("40.3%", text)
        self.assertIn("3,347", text)
        self.assertIn("HE_Fail", text)
        self.assertIn("not a full year", text.lower())
        self.assertIn("one row per violation", text.lower())
        self.assertIn("Do not count a license row as an inspection.", text)
        self.assertIn("4 p.m.", text)
        self.assertIn("Wednesday", text)
        self.assertIn("02125", text)
        self.assertIn("52.2%", text)
        self.assertIn("19,648", text)
        self.assertIn("COVID", text)
        self.assertIn("2020", text)
        self.assertIn("Eating & Drinking", text)
        self.assertIn("Dorchester", text)
        self.assertIn("02122", text)
        self.assertIn("02124", text)
        self.assertIn("Analyze Boston Food Establishment Inspections", text)
        self.assertIn("Active Food Establishment Licenses", text)
        self.assertIn("resultdttm", text)
        self.assertIn("8,894", text)
        self.assertIn("37.0%", text)
        self.assertIn("+22.7%", text)
        self.assertIn("HE_FailExt", text)
        self.assertIn("HE_Filed", text)
        self.assertIn("Controlling Pests", text)
        self.assertIn("not RentSmart", text)
        pass_n = next(x["value"] for x in stats["results_2025"] if x["label"] == "HE_Pass")
        pass_share = round(100.0 * pass_n / stats["y2025"]["n"], 1)
        self.assertEqual(pass_share, 49.9)
        self.assertLess(pass_share, 50.0)
        self.assertIn("49.9%", text)
        self.assertNotIn("Most 2025 inspections pass", text)
        self.assertNotIn("not office-open days", text)
        self.assertNotIn("not ISD public-counter days", text)
        self.assertNotIn("hair-restraint", text.lower())
        self.assertIn("restaurants can be inspected", text.lower())
        self.assertIn("Saturday is 66", text)
        nb_mix = text.split("Top ZIP neighborhoods, 2025 inspections", 1)[1].split(
            "Highest 2025 fail share", 1
        )[0]
        self.assertNotIn("tone:", nb_mix)
        viol_mix = text.split("Top 2025 violation descriptions", 1)[1].split(
            "function SectionClock", 1
        )[0]
        self.assertNotIn("tone:", viol_mix)
        results_pie = text.split("2025 inspection results", 1)[1].split(
            "2025 violation star levels", 1
        )[0]
        self.assertIn('tone: "success"', results_pie)
        self.assertIn('tone: "danger"', results_pie)
        self.assertIn('tone: "warning"', results_pie)
        stars_pie = text.split("2025 violation star levels", 1)[1].split(
            "Fail counts beside inspections", 1
        )[0]
        self.assertIn('tone: "info"', stars_pie)
        self.assertIn('tone: "warning"', stars_pie)
        self.assertIn('tone: "danger"', stars_pie)
        license_pie = text.split("Active licenses by category", 1)[1].split(
            "function SectionPlaces", 1
        )[0]
        self.assertNotIn("tone:", license_pie)

        def const_ints(name: str) -> list[int]:
            match = re.search(rf"const {name} = \[\s*(.*?)\s*\];", text, re.S)
            self.assertIsNotNone(match, name)
            return [int(part.strip()) for part in match.group(1).split(",") if part.strip()]

        def const_floats(name: str) -> list[float]:
            match = re.search(rf"const {name} = \[\s*(.*?)\s*\];", text, re.S)
            self.assertIsNotNone(match, name)
            return [float(part.strip()) for part in match.group(1).split(",") if part.strip()]

        self.assertEqual(
            const_ints("INSPECTIONS"),
            [row["inspections"] for row in stats["by_year"] if row["year"] <= 2025],
        )
        self.assertEqual(
            const_ints("FAILS"),
            [row["fails"] for row in stats["by_year"] if row["year"] <= 2025],
        )
        self.assertEqual(
            const_floats("FAIL_RATE"),
            [row["fail_rate"] for row in stats["by_year"] if row["year"] <= 2025],
        )
        self.assertEqual(const_ints("HOUR_2025"), stats["hour_2025"])
        self.assertEqual(const_ints("MONTH_2025"), stats["month_2025"])
        self.assertEqual(const_ints("WEEKDAY_2025"), stats["weekday_2025"])
        self.assertEqual(
            const_ints("NB_2025"),
            [x["value"] for x in stats["neighborhoods_2025"][:12]],
        )
        self.assertEqual(
            const_ints("VIOL_2025"),
            [x["value"] for x in stats["violdesc_2025"][:6]],
        )
        zip_fail = [
            round(x["fail_rate"], 1)
            for x in sorted(
                [
                    r
                    for r in stats["fail_rate_zip_year"]
                    if r["year"] == 2025 and r["inspections"] >= 80
                ],
                key=lambda r: (-r["fail_rate"], -r["inspections"]),
            )[:8]
        ]
        self.assertEqual(const_floats("ZIP_FAIL_RATE"), zip_fail)
        self.assertEqual(stats["y2025"]["n"], 12414)
        self.assertEqual(stats["y2019"]["n"], 10116)
        self.assertEqual(stats["y2025"]["fail_rate"], 40.3)
        self.assertEqual(stats["active_licenses"], 3347)
        self.assertEqual(stats["vs_2019"]["insp_pct"], 22.7)
        self.assertNotIn("licenses", stats["by_year"][0])

        self.assertIn("Places", text)
        self.assertIn("places-year", text)
        self.assertIn("places-category", text)
        self.assertIn("2026 YTD", text)
        self.assertIn("at least 3 inspections", text)
        self.assertIn("Ice cream", text)
        self.assertIn("Other / unclassified", text)
        self.assertIn("word-boundary", text)
        self.assertIn("calendar years", text)
        self.assertIn("Two fails in the same year are not a repeat", text)
        self.assertIn("Go Fresh 365", text)
        self.assertIn("places-category", text)
        self.assertNotIn("within-window repeat offenders", text)
        self.assertIn("Ice cream", stats["place_windows"]["2025"]["by_category"])
        self.assertIn("Ice cream", stats["repeat_across_years"]["by_category"])
        self.assertIn("names are cleaned", text)
        self.assertIn("not a City cuisine", text)
        self.assertIn("School Street is not School", text)
        self.assertIn("Atlantic Fish Company", text)
        self.assertIn("A @ Time", text)
        self.assertIn("EAST @ WEST", text)
        self.assertIn("Ben &amp; Jerry", text)
        self.assertIn("generic dining", text)
        self.assertIn("not Company", text)
        self.assertEqual(
            const_ints("CODED_FOOD_DRINKS"),
            [row["Food and drinks"] for row in stats["category_by_year"]],
        )
        self.assertEqual(
            const_ints("CODED_TAKEOUT"),
            [row["Take-out"] for row in stats["category_by_year"]],
        )
        self.assertEqual(
            const_ints("CODED_RETAIL"),
            [row["Retail food"] for row in stats["category_by_year"]],
        )
        self.assertEqual(
            const_ints("CODED_MOBILE"),
            [row["Mobile food"] for row in stats["category_by_year"]],
        )
        self.assertEqual(
            const_ints("ALWAYS_PASS_N"),
            [
                stats["place_windows"][k]["always_pass_n"]
                for k in ("2019", "2024", "2025", "2026_ytd")
            ],
        )
        self.assertEqual(
            stats["place_windows"]["2025"]["places_to_avoid"],
            [],
        )
        self.assertEqual(
            stats["repeat_across_years"]["places"][0]["name"],
            "Go Fresh 365",
        )
        self.assertIn(2026, stats["repeat_across_years"]["years"])
        self.assertGreaterEqual(stats["repeat_across_years"]["repeat_n"], 1)
        self.assertIn("Take-out", stats["repeat_across_years"]["by_category"])

        def assert_no_citywide_storefront(places, where):
            for p in places:
                disp = p.get("address_display", "")
                self.assertNotRegex(
                    disp,
                    r"(?i)1\s+CITYWIDE(\s+ST)?\b",
                    f"{where}: {p}",
                )
                if "CITYWIDE" in p.get("address", "").upper():
                    self.assertTrue(
                        disp.startswith("Mobile (citywide)"),
                        f"{where}: {p}",
                    )
                    self.assertNotIn("02128", disp)

        for key, win in stats["place_windows"].items():
            assert_no_citywide_storefront(win["always_pass"], f"{key} always_pass")
            for lab, block in win["by_category"].items():
                assert_no_citywide_storefront(
                    block["always_pass"], f"{key} {lab}"
                )
        assert_no_citywide_storefront(
            stats["repeat_across_years"]["places"], "repeat places"
        )
        for lab, block in stats["repeat_across_years"]["by_category"].items():
            assert_no_citywide_storefront(block["places_to_avoid"], f"avoid {lab}")
        overlay_order = [
            "Ice cream",
            "Cultural / attraction",
            "Hospital",
            "Hotel",
            "School",
            "Cafe",
            "Food and drinks",
            "Take-out",
            "Retail food",
            "Mobile food",
            "Other / unclassified",
        ]

        def overlay_counts(window: str) -> list[int]:
            by_label = {
                x["label"]: x["inspections"]
                for x in stats["place_windows"][window]["category_n"]
            }
            return [by_label.get(lab, 0) for lab in overlay_order]

        self.assertEqual(const_ints("OVERLAY_2019"), overlay_counts("2019"))
        self.assertEqual(const_ints("OVERLAY_2024"), overlay_counts("2024"))
        self.assertEqual(const_ints("OVERLAY_2025"), overlay_counts("2025"))
        self.assertEqual(const_ints("OVERLAY_2026"), overlay_counts("2026_ytd"))
        coded_mix = text.split("Coded license category mix, 2012–2025", 1)[1].split(
            "Name overlays on top of coded categories", 1
        )[0]
        self.assertNotIn("tone:", coded_mix)
        self.assertIn(
            "1 CITYWIDE ST is ISD’s placeholder for mobile licenses, not a shared physical address",
            text,
        )
        self.assertNotIn("mobile rows often use 1 CITYWIDE ST", text)
        self.assertIn(
            "BM3:BON ME RED and Chubby Chickpea can appear on 2024 always-pass and on multi-year avoid because the windows differ",
            text,
        )
        self.assertIn("placeAddress(", text)
        self.assertIn("addressDisplay", text)


DUMP = Path("/Users/dhshah/Downloads/food-establishment-inspections.csv")


class DumpNameQualityTests(unittest.TestCase):
    """Audit the Analyze Boston dump against the public name-quality bar."""

    @classmethod
    def setUpClass(cls):
        if not DUMP.is_file():
            raise unittest.SkipTest(f"missing dump {DUMP}")
        import csv

        cls.by_name: dict[str, str] = {}
        with DUMP.open(newline="", encoding="utf-8", errors="replace") as handle:
            for raw in csv.DictReader(handle):
                name = (raw.get("businessname") or "").strip()
                if name and name not in cls.by_name:
                    cls.by_name[name] = (raw.get("licensecat") or "").strip()

    def test_jp_licks_and_ben_jerry_and_fish_company_and_at_trade_names(self):
        set_web_ice_names(None)
        jp = [
            n
            for n in self.by_name
            if "j.p. lick" in n.casefold() or "jp lick" in n.casefold()
        ]
        self.assertTrue(jp)
        keys = {brand_key(n) for n in jp}
        self.assertEqual(keys, {"jp licks"})
        for n in jp:
            self.assertEqual(categorize(n, self.by_name[n]), "Ice cream")
            self.assertEqual(name_display(n), "J.P. Licks")

        bnj = [
            n
            for n in self.by_name
            if "ben" in n.casefold() and "jerr" in n.casefold()
        ]
        self.assertTrue(bnj)
        for n in bnj:
            self.assertEqual(categorize(n, self.by_name[n]), "Ice cream", n)
            self.assertEqual(brand_key(n), "ben jerrys")

        fish = next(n for n in self.by_name if n.casefold() == "atlantic fish company")
        self.assertEqual(name_display(fish), "Atlantic Fish Company")
        self.assertEqual(brand_key(fish), "atlantic fish company")

        self.assertIn("@", name_display("A @ Time"))
        self.assertEqual(brand_key("A @ Time"), "a time")
        self.assertIn("@", name_display("EAST @ WEST"))
        self.assertEqual(brand_key("EAST @ WEST"), "east west")
        self.assertEqual(
            categorize("1st Floor Cafe @ Tufts Medical Center", "FS"),
            "Cafe",
        )
        self.assertEqual(
            categorize("Patient Dining @ Tufts Medical Center", "FS"),
            "Hospital",
        )
        self.assertEqual(
            categorize("Cosmica @ the Revolution Hotel", "FS"),
            "Food and drinks",
        )


if __name__ == "__main__":
    unittest.main()
