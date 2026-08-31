import {
  BarChart,
  Callout,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  LineChart,
  PieChart,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

const YEARS = [
  "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019",
  "2020", "2021", "2022", "2023", "2024", "2025",
];
const INSPECTIONS = [
  14773, 11444, 9202, 10038, 11090, 10199, 10817, 10116,
  7932, 11318, 19648, 13381, 14576, 12414,
];
const FAILS = [
  3708, 3282, 3436, 3856, 4494, 3561, 4034, 3738,
  2723, 4164, 4886, 4131, 4738, 5003,
];
const FAIL_RATE = [
  25.1, 28.7, 37.3, 38.4, 40.5, 34.9, 37.3, 37.0,
  34.3, 36.8, 24.9, 30.9, 32.5, 40.3,
];

const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_2025 = [
  55, 36, 2, 4, 3, 0, 0, 1, 0, 0, 3, 35,
  215, 276, 1086, 2279, 2667, 2162, 2007, 1150, 224, 95, 54, 60,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2025 = [
  1064, 905, 981, 1153, 1042, 890, 967, 1039, 938, 1316, 1001, 1118,
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2025 = [2156, 2553, 2682, 2441, 2487, 66, 29];

const NB_LABELS = [
  "Dorchester",
  "East Boston",
  "Back Bay / Bay Village",
  "Fenway / Kenmore",
  "Seaport / Fort Point",
  "Fenway / Longwood",
  "South End",
  "Allston",
  "Chinatown / Leather District",
  "Brighton",
  "Jamaica Plain",
  "South Boston",
];
const NB_2025 = [1282, 1025, 982, 956, 690, 611, 540, 528, 525, 491, 463, 442];

const ZIP_FAIL_LABELS = [
  "02125 Dorchester",
  "02118 South End",
  "02130 Jamaica Plain",
  "02120 Mission Hill / Roxbury",
  "02132 West Roxbury",
  "02136 Hyde Park",
  "02122 Dorchester",
  "02111 Chinatown / Leather District",
];
const ZIP_FAIL_RATE = [52.2, 50.4, 50.3, 50.2, 49.5, 48.9, 47.4, 46.7];

const VIOL_LABELS = [
  "Nonfood Contact Surfaces (C)",
  "Controlling Pests (Pf)",
  "Floors Walls and Ceilings-Cleanability (C)",
  "Cleaning Ventilation Systems (C)",
  "Equipment Food-Contact Surfaces (Pf)",
  "Repairing-Premises Structures (C)",
];
const VIOL_2025 = [1963, 1873, 1519, 1149, 1121, 1095];

const CODED_FOOD_DRINKS = [
  5954, 4809, 4035, 4313, 4787, 4551, 4926, 4833, 3527, 5209, 8649, 6235, 6765, 5756,
];
const CODED_TAKEOUT = [
  5396, 4329, 3472, 3772, 4210, 3729, 3803, 3741, 3102, 4273, 7446, 5238, 5761, 4895,
];
const CODED_RETAIL = [
  3215, 2047, 1564, 1752, 1904, 1716, 1760, 1318, 1257, 1728, 3124, 1607, 1697, 1495,
];
const CODED_MOBILE = [
  208, 259, 131, 201, 189, 203, 328, 224, 46, 108, 429, 301, 353, 268,
];
const ALWAYS_PASS_N = [
  60, 328, 92, 49,
];
const REPEAT_N = [
  1010, 1296, 1349, 999,
];
const OVERLAY_LABELS = [
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
];
const OVERLAY_2019 = [
  26, 31, 44, 194, 98, 1056, 4041, 3107, 1298, 221, 0,
];
const OVERLAY_2024 = [
  43, 49, 75, 232, 137, 1436, 5718, 4878, 1663, 345, 0,
];
const OVERLAY_2025 = [
  54, 30, 61, 220, 102, 1212, 4861, 4147, 1468, 259, 0,
];
const OVERLAY_2026 = [
  19, 25, 42, 183, 54, 873, 3478, 2882, 1070, 268, 0,
];

type PlaceYearKey = "2019" | "2024" | "2025" | "2026_ytd";
type PlaceRow = {
  name: string;
  address: string;
  zip: string;
  category: string;
  inspections: number;
  fails: number;
  failRate: number;
  yearsFailed?: number;
};
const PLACE_YEAR_PILLS: { id: PlaceYearKey; label: string }[] = [
  { id: "2019", label: "2019" },
  { id: "2024", label: "2024" },
  { id: "2025", label: "2025" },
  { id: "2026_ytd", label: "2026 YTD" },
];
const PLACE_WINDOWS: Record<PlaceYearKey, {
  ytd: boolean;
  yearLabel: string;
  alwaysN: number;
  repeatN: number;
  alwaysPass: PlaceRow[];
  avoid: PlaceRow[];
}> = {
  "2019": {
    ytd: false,
    yearLabel: "2019",
    alwaysN: 60,
    repeatN: 1010,
    alwaysPass: [
      { name: "Roxy's Gourmet Grilled Cheese No. 2", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "The Bacon Truck No. 2", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "Emmanuel College", address: "400  FENWAY", zip: "02115", category: "School", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "HILTON BOSTON LOGAN AIRPORT", address: "1  HOTEL DR", zip: "02128", category: "Hotel", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Mama Ana", address: "197  EIGHTH ST", zip: "02129", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Mcdonalds", address: "315  WASHINGTON ST", zip: "02108", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "THE BARKING CRAB", address: "88  SLEEPER ST", zip: "02210", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "AFC Sushi @ Walgreens No. 15390", address: "10  SCHOOL ST", zip: "02108", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "AFC Sushi @Liberty Mutual Ins.", address: "157  BERKELEY ST", zip: "02116", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Bella Luna Restaurant @ the Brewery", address: "284  AMORY ST", zip: "02130", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
    ],
    avoid: [
      { name: "TICO", address: "222  BERKELEY ST", zip: "02116", category: "Food and drinks", inspections: 10, fails: 7, failRate: 70.0 },
      { name: "The Brahmin", address: "33  STANHOPE ST", zip: "02116", category: "Food and drinks", inspections: 5, fails: 5, failRate: 100.0 },
      { name: "Restaurante Cesaria", address: "266  BOWDOIN ST", zip: "02122", category: "Food and drinks", inspections: 7, fails: 5, failRate: 71.4 },
      { name: "Mc Goo's Pizza", address: "479 W BROADWAY", zip: "02127", category: "Take-out", inspections: 8, fails: 5, failRate: 62.5 },
      { name: "New York Pizza", address: "433  MASSACHUSETTS AV", zip: "02118", category: "Take-out", inspections: 8, fails: 5, failRate: 62.5 },
      { name: "SAKURAABANA INC", address: "57  BROAD ST", zip: "02109", category: "Food and drinks", inspections: 8, fails: 5, failRate: 62.5 },
      { name: "Penguin Pizza", address: "735  HUNTINGTON AV", zip: "02115", category: "Food and drinks", inspections: 9, fails: 5, failRate: 55.6 },
      { name: "Super Stop & Shop", address: "1100  MASSACHUSETTS AV", zip: "02125", category: "Retail food", inspections: 10, fails: 5, failRate: 50.0 },
      { name: "Ilona", address: "493  MASSACHUSETTS AV", zip: "02118", category: "Food and drinks", inspections: 5, fails: 4, failRate: 80.0 },
      { name: "MIAMI RESTAURANT", address: "381  CENTRE ST", zip: "02130", category: "Food and drinks", inspections: 5, fails: 4, failRate: 80.0 },
    ],
  },
  "2024": {
    ytd: false,
    yearLabel: "2024",
    alwaysN: 328,
    repeatN: 1296,
    alwaysPass: [
      { name: "Limani Grille", address: "100  NORTHERN AV", zip: "02210", category: "Food and drinks", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "Zaaki", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "CHECKMATE CAFE", address: "900  SOUTH ST", zip: "02131", category: "Cafe", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "Dave's Hot Chicken", address: "123  STUART ST", zip: "02116", category: "Food and drinks", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "Lincoln Tavern", address: "425 W BROADWAY", zip: "02127", category: "Food and drinks", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "SALSAS MEXICAN GRILL", address: "417  WASHINGTON ST", zip: "02108", category: "Take-out", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "311", address: "605  TREMONT ST", zip: "02118", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "A & N PIZZA", address: "1409  CENTRE ST", zip: "02132", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Burger King", address: "100  WASHINGTON ST", zip: "02121", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Chubby Chickpea Mobile", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 4, fails: 0, failRate: 0.0 },
    ],
    avoid: [
      { name: "Alamo Drafthouse", address: "23  NORTHERN AV", zip: "02210", category: "Take-out", inspections: 21, fails: 14, failRate: 66.7 },
      { name: "Deno's Pizza and Subs", address: "2040  CENTRE ST", zip: "02132", category: "Take-out", inspections: 13, fails: 11, failRate: 84.6 },
      { name: "Dollar Tree No. 8071", address: "1089  DORCHESTER AV", zip: "02125", category: "Retail food", inspections: 15, fails: 10, failRate: 66.7 },
      { name: "Mattapan Fish Market", address: "1600  BLUE HILL AV", zip: "02126", category: "Retail food", inspections: 11, fails: 9, failRate: 81.8 },
      { name: "Walgreens No. 19437", address: "1100  DORCHESTER AV", zip: "02125", category: "Retail food", inspections: 12, fails: 9, failRate: 75.0 },
      { name: "Dollar Tree", address: "1230  VFW PW", zip: "02132", category: "Retail food", inspections: 13, fails: 9, failRate: 69.2 },
      { name: "CVS Pharmacy No. 1031", address: "4600  WASHINGTON ST", zip: "02131", category: "Retail food", inspections: 9, fails: 8, failRate: 88.9 },
      { name: "Cold Stone Creamery", address: "800  BOYLSTON ST", zip: "02199", category: "Take-out", inspections: 10, fails: 8, failRate: 80.0 },
      { name: "Saigon One Restaurant", address: "1331  DORCHESTER AV", zip: "02122", category: "Food and drinks", inspections: 10, fails: 8, failRate: 80.0 },
      { name: "BERTUCCI'S", address: "633  V F W PK", zip: "02132", category: "Food and drinks", inspections: 12, fails: 8, failRate: 66.7 },
    ],
  },
  "2025": {
    ytd: false,
    yearLabel: "2025",
    alwaysN: 92,
    repeatN: 1349,
    alwaysPass: [
      { name: "Dunkin Donuts", address: "1627  TREMONT ST", zip: "02120", category: "Take-out", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "Blue Ribbon Barbecue", address: "401  PARK DR", zip: "02215", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "CVS/Pharmacy No. 10517", address: "77  SEAPORT BL", zip: "02210", category: "Retail food", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "CVS/Pharmacy No. 1900", address: "218  HANOVER ST", zip: "02113", category: "Retail food", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Honeygrow", address: "100  NORTHERN AV", zip: "02210", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Lala's Neapolitan-ish Pizza", address: "401  PARK DR", zip: "02215", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Shake Shack", address: "234  NEWBURY ST", zip: "02116", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Sodexo @ Liberty Mutual Fl. 2", address: "157  BERKELEY ST", zip: "02116", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "STARBUCKS COFFEE No.  7823", address: "470  WASHINGTON ST", zip: "02135", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Taco Bell", address: "74  SUMMER ST", zip: "02110", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
    ],
    avoid: [
      { name: "Dans Mini Dogs", address: "1010  MASSACHUSETTS AV", zip: "02118", category: "Food and drinks", inspections: 29, fails: 23, failRate: 79.3 },
      { name: "Star Market No. 4587", address: "45  WM T MORRISSEY BL", zip: "02122", category: "Retail food", inspections: 17, fails: 10, failRate: 58.8 },
      { name: "CVS No. 11036", address: "451  WASHINGTON ST", zip: "02124", category: "Retail food", inspections: 11, fails: 9, failRate: 81.8 },
      { name: "Rincon Caribeno Restaurant", address: "18  FAIRMOUNT AV", zip: "02136", category: "Food and drinks", inspections: 11, fails: 9, failRate: 81.8 },
      { name: "Yeanie's Burger & Social", address: "33  SAVIN HILL AV", zip: "02125", category: "Food and drinks", inspections: 12, fails: 9, failRate: 75.0 },
      { name: "Slade's Bar & Grill", address: "950  TREMONT ST", zip: "02120", category: "Food and drinks", inspections: 13, fails: 9, failRate: 69.2 },
      { name: "Boston Restaurant Bar & Grill", address: "1251  RIVER ST", zip: "02136", category: "Food and drinks", inspections: 15, fails: 9, failRate: 60.0 },
      { name: "KMB(TEST)", address: "1010  MASSACHUSETTS AV", zip: "02118", category: "Take-out", inspections: 15, fails: 9, failRate: 60.0 },
      { name: "NEW YORK FRIED CHICKEN & PIZZA", address: "531  COLUMBIA RD", zip: "02125", category: "Take-out", inspections: 10, fails: 8, failRate: 80.0 },
      { name: "Pho Le", address: "1356  DORCHESTER AV", zip: "02122", category: "Food and drinks", inspections: 11, fails: 8, failRate: 72.7 },
    ],
  },
  "2026_ytd": {
    ytd: true,
    yearLabel: "2026 YTD",
    alwaysN: 49,
    repeatN: 999,
    alwaysPass: [
      { name: "BM2: Bon Me OrangeNo. 2", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 9, fails: 0, failRate: 0.0 },
      { name: "Cool Shade 2", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Dave's Hot Chicken", address: "1260  BOYLSTON ST", zip: "02215", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Grace Note Coffee", address: "100  HIGH ST", zip: "02110", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Olu's African Market", address: "4400  WASHINGTON ST", zip: "02131", category: "Retail food", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Ashmont Convenience Store", address: "1996  DORCHESTER AV", zip: "02124", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "B/SPOKE", address: "54  OLD COLONY AV", zip: "02127", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Bibim Box", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Boston Trolley Dogs", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Boston Trolley DogsNo. 2", address: "1  CITYWIDE ST", zip: "02128", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
    ],
    avoid: [
      { name: "Alamo Drafthouse", address: "23  NORTHERN AV", zip: "02210", category: "Take-out", inspections: 15, fails: 12, failRate: 80.0 },
      { name: "Star Market No. 4587", address: "45  WM T MORRISSEY BL", zip: "02122", category: "Retail food", inspections: 15, fails: 10, failRate: 66.7 },
      { name: "Dollar Tree StoreNo. 09513", address: "1329  HYDE PARK AV", zip: "02136", category: "Retail food", inspections: 17, fails: 10, failRate: 58.8 },
      { name: "Boston Fried Chicken", address: "998  BLUE HILL AV", zip: "02124", category: "Food and drinks", inspections: 8, fails: 7, failRate: 87.5 },
      { name: "Rod Thai Family Taste", address: "94  PETERBOROUGH ST", zip: "02215", category: "Food and drinks", inspections: 8, fails: 7, failRate: 87.5 },
      { name: "Pink Taco", address: "374  CONGRESS ST", zip: "02210", category: "Food and drinks", inspections: 10, fails: 7, failRate: 70.0 },
      { name: "MiNori Sushi No. 7", address: "122  BRIGHTON AV", zip: "02134", category: "Take-out", inspections: 6, fails: 6, failRate: 100.0 },
      { name: "NICOLE'S PIZZA", address: "639  TREMONT ST", zip: "02118", category: "Take-out", inspections: 7, fails: 6, failRate: 85.7 },
      { name: "AMERICA'S FOOD BASKET", address: "576  WASHINGTON ST", zip: "02124", category: "Retail food", inspections: 8, fails: 6, failRate: 75.0 },
      { name: "Anna's Taqueria", address: "242  CAMBRIDGE ST", zip: "02114", category: "Food and drinks", inspections: 8, fails: 6, failRate: 75.0 },
    ],
  },
};
const REPEAT_ACROSS: PlaceRow[] = [
  { name: "Go Fresh 365", address: "1102  WASHINGTON ST", zip: "02118", category: "Retail food", inspections: 105, fails: 54, failRate: 51.4, yearsFailed: 14 },
  { name: "BOURBON ST. CAFE", address: "417  WASHINGTON ST", zip: "02108", category: "Cafe", inspections: 112, fails: 53, failRate: 47.3, yearsFailed: 14 },
  { name: "Fan Fan Restaurant", address: "15  HARVARD AV", zip: "02136", category: "Food and drinks", inspections: 100, fails: 51, failRate: 51.0, yearsFailed: 14 },
  { name: "The Real Deal", address: "1882  CENTRE ST", zip: "02132", category: "Food and drinks", inspections: 99, fails: 51, failRate: 51.5, yearsFailed: 14 },
  { name: "Bonchon Allston", address: "101  BRIGHTON AV", zip: "02134", category: "Food and drinks", inspections: 104, fails: 50, failRate: 48.1, yearsFailed: 14 },
  { name: "Nhu Lan Fast Food", address: "1155  DORCHESTER AV", zip: "02125", category: "Take-out", inspections: 99, fails: 49, failRate: 49.5, yearsFailed: 14 },
  { name: "Yely's Coffee Shop", address: "284  CENTRE ST", zip: "02130", category: "Cafe", inspections: 99, fails: 47, failRate: 47.5, yearsFailed: 14 },
  { name: "Los Amigos Mexican Grill", address: "1741  CENTRE ST", zip: "02132", category: "Take-out", inspections: 100, fails: 46, failRate: 46.0, yearsFailed: 14 },
  { name: "NEW YORK FRIED CHICKEN & PIZZA", address: "531  COLUMBIA RD", zip: "02125", category: "Take-out", inspections: 84, fails: 46, failRate: 54.8, yearsFailed: 14 },
  { name: "Yamato Japanese Cuisine", address: "111  CHISWICK RD", zip: "02135", category: "Food and drinks", inspections: 94, fails: 46, failRate: 48.9, yearsFailed: 14 },
];

type TabId = "summary" | "overview" | "department" | "city" | "public" | "places" | "full";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Overview" },
  { id: "department", label: "Department" },
  { id: "city", label: "City / Mayor" },
  { id: "public", label: "Public" },
  { id: "places", label: "Places" },
  { id: "full", label: "Full analysis" },
];

const TAB_BLURB: Record<TabId, string> = {
  summary: "Six findings. Numbers a reader can take into a meeting.",
  overview:
    "Citywide food inspections. 2020 is COVID — not a baseline. 2026 is not a full year. Licenses are a separate file.",
  department:
    "What ISD Health needs: weekday load, afternoon peak, star-level mix. resultdttm is the result timestamp, not a kitchen clock.",
  city: "What the Mayor and Council need: more inspections than 2019, a higher fail share, and ZIP fail rates that are not the same as volume.",
  public:
    "Plain language: one inspection can have several violation rows. A license is not an inspection.",
  places:
    "Always-pass, repeat offenders, and places to avoid for 2019, 2024, 2025, and 2026 YTD — not a 2025-only list. Repeat across years is 2012–2025 complete years.",
  full: "Every chart and table from this analysis, in one place.",
};

function Caption({ children }: { children: string }) {
  return (
    <Text size="small" tone="tertiary">
      {children}
    </Text>
  );
}

function SectionDemand() {
  return (
    <Stack gap={12}>
      <H2>More inspections than 2019. A higher fail share.</H2>
      <Text>
        Use 2019 as the last normal pre-COVID year, not 2020. Collapsed
        inspections were 10,116 in 2019 (37.0% fail) and 12,414 in 2025
        (40.3% fail) — 34.0 a day, 22.7% above 2019. Fail is the exact
        result codes HE_Fail, HE_FailExt, Fail, Failed, and HE_FAILNOR
        (5,003 of 12,414). Do not count 3,347 active licenses as
        inspections.
      </Text>
      <Callout tone="warning" title="2020 is a COVID year. Do not use it as a baseline.">
        Inspections fell to 7,932 in 2020 (10,116 → 7,932) and the fail
        share was 34.3%. Compare 2025 to 2019, then show 2020 as the shock.
      </Callout>
      <Callout tone="danger" title="2026 is not a full year.">
        Inspection results in this dump run through 28 August 2026 (8,894
        year-to-date, 37.1 a day). Do not annualize that figure, and do
        not treat 8,894 as a calendar year.
      </Callout>
      <Callout tone="warning" title="2022 is 19,648 inspections in the file — not a new baseline.">
        2022 is almost double 2019 (19,648 vs 10,116) and the fail share
        fell to 24.9%. The file records that jump. This briefing does not
        invent a program change to explain it.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Collapsed inspections per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[{ name: "Inspections", data: INSPECTIONS, tone: "info" }]}
            valueSuffix=" inspections"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections ·
            resultdttm · 2012–2025 complete years · one inspection per
            license number and result timestamp · 2026 YTD omitted
            (through 28 Aug, 8,894)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Fail share per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[{ name: "Fail share", data: FAIL_RATE, tone: "warning" }]}
            valueSuffix="%"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections · fail
            share of collapsed inspections · 2012–2025 · Fail = HE_Fail,
            HE_FailExt, Fail, Failed, HE_FAILNOR · 2025 40.3%
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionMix() {
  return (
    <Stack gap={12}>
      <H2>HE_Pass is 49.9% of 2025 inspections. Fail is 40.3%.</H2>
      <Text>
        HE_Pass is 6,191 of 12,414 (49.9%) — not a majority. HE_Fail is
        3,867. HE_FailExt is 1,134. Those two fail codes plus HE_FAILNOR
        (2) are the 5,003 fails. HE_Filed is 830 and is not a fail. Star
        levels are violation rows, not inspections: * 24,219 · ** 11,929
        · *** 4,498 in 2025.
      </Text>
      <Callout tone="warning" title="Do not count a license row as an inspection.">
        Active Food Establishment Licenses is a different file: 3,347
        active places (Eating &amp; Drinking FS 1,766 · Eating &amp; Drinking
        w/ Take Out FT 1,581).
        12,414 inspections is not 3,347, and it is not 900,574 violation
        rows.
      </Callout>
      <Grid columns="1.1fr 0.9fr" gap={24}>
        <Stack gap={8}>
          <H3>2025 inspection results</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "HE_Pass", value: 6191, tone: "success" },
              { label: "HE_Fail", value: 3867, tone: "danger" },
              { label: "HE_FailExt", value: 1134, tone: "warning" },
              { label: "HE_Filed", value: 830, tone: "info" },
              { label: "HE_Hearing", value: 199 },
              { label: "HE_VolClos", value: 108 },
              { label: "Other", value: 85 },
            ]}
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections · result
            · 2025 · collapsed inspections n = 12,414 · Other is
            HE_OutBus 32, HE_NotReq 30, HE_TSOP 17, HE_Misc 3, HE_FAILNOR
            2, HE_Closure 1
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 violation star levels</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "*", value: 24219, tone: "info" },
              { label: "**", value: 11929, tone: "warning" },
              { label: "***", value: 4498, tone: "danger" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections ·
            viol_level exact codes · 2025 · 40,646 starred violation rows
            · not inspection counts · *** is 4,498
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>Fail counts beside inspections, 2012–2025</H3>
        <BarChart
          categories={YEARS}
          height={240}
          series={[
            { name: "Inspections", data: INSPECTIONS, tone: "info" },
            { name: "Fails", data: FAILS, tone: "danger" },
          ]}
          valueSuffix=" inspections"
        />
        <Caption>
          Source: Analyze Boston Food Establishment Inspections · grouped
          counts · fails are a subset of inspections, not stacked on top ·
          2012–2025 complete years
        </Caption>
      </Stack>
      <Stack gap={8}>
        <H3>Top 2025 violation descriptions</H3>
        <BarChart
          horizontal
          height={220}
          categories={VIOL_LABELS}
          series={[{ name: "2025 violation rows", data: VIOL_2025 }]}
          valueSuffix=" rows"
        />
        <Caption>
          Source: Analyze Boston Food Establishment Inspections · violdesc
          · 2025 · violation rows, not inspections · Controlling Pests
          1,873
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>Results peak at 4 p.m. on weekdays, not on the weekend.</H2>
      <Text>
        In 2025 the busiest resultdttm hour is 4 p.m. (2,667 inspections).
        Overnight hours are near zero. Wednesday is heaviest (2,682);
        Sunday is lightest (29); Saturday is 66. October is the peak
        month (1,316); June is the lightest (890). This clock is when ISD
        recorded the result timestamp — not when food was served.
      </Text>
      <Callout tone="info" title="resultdttm hour is not kitchen hours.">
        Health inspections are recorded during the day. Do not read 4 p.m.
        as a foodborne-illness peak.
      </Callout>
      <Callout tone="info" title="Weekend result timestamps are rare. That is not an office-hours chart.">
        Saturday is 66 inspections and Sunday is 29, against 2,000-plus on
        a weekday. ISD Health’s public office is Monday–Friday. Food
        inspectors can still visit restaurants when they are open. These
        95 weekend stamps stay on the chart as recorded field results —
        restaurants can be inspected on weekends.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 inspections by result hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "Inspections", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" inspections"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections ·
            resultdttm hour · 2025 · peak 4 p.m. (2,667)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 inspections by weekday</H3>
          <BarChart
            categories={WEEKDAYS}
            height={200}
            series={[{ name: "Inspections", data: WEEKDAY_2025, tone: "info" }]}
            valueSuffix=" inspections"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections ·
            resultdttm weekday · 2025 · Wednesday 2,682 · Sunday 29 ·
            Saturday 66 · restaurants can be inspected on weekends
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>2025 inspections by month</H3>
        <BarChart
          categories={MONTHS}
          height={200}
          series={[{ name: "Inspections", data: MONTH_2025, tone: "info" }]}
          valueSuffix=" inspections"
        />
        <Caption>
          Source: Analyze Boston Food Establishment Inspections ·
          resultdttm month · 2025 · October 1,316 · June 890 · a complete
          calendar year
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionPlace() {
  return (
    <Stack gap={12}>
      <H2>Dorchester leads volume only as three ZIPs rolled together.</H2>
      <Text>
        Neighborhood is ZIP via the Fire ZIP_NEIGHBORHOOD map — not a
        neighborhood field on the inspection. Dorchester is 02122 + 02124
        + 02125 (1,282). East Boston 02128 is the single-ZIP volume
        leader (1,025) with a 30.2% fail share. 02125 Dorchester is 517
        inspections and a 52.2% fail share. Volume and fail rate are not
        the same ranking.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Top ZIP neighborhoods, 2025 inspections</H3>
          <BarChart
            horizontal
            height={280}
            categories={NB_LABELS}
            series={[{ name: "2025 inspections", data: NB_2025 }]}
            valueSuffix=" inspections"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections · ZIP via
            Fire ZIP_NEIGHBORHOOD · 2025 · top 12 mapped of 12,414 ·
            Dorchester = 02122, 02124, 02125
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Highest 2025 fail share (ZIP, n ≥ 80)</H3>
          <BarChart
            horizontal
            height={280}
            categories={ZIP_FAIL_LABELS}
            series={[{ name: "Fail share", data: ZIP_FAIL_RATE, tone: "danger" }]}
            valueSuffix="%"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections · fail
            share of collapsed inspections · 2025 · ZIPs with at least 80
            inspections · 02125 52.2% (517)
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>Active licenses by category</H3>
        <PieChart
          donut
          size={200}
          data={[
            { label: "Eating & Drinking (FS)", value: 1766 },
            { label: "Eating & Drinking w/ Take Out (FT)", value: 1581 },
          ]}
        />
        <Caption>
          Source: Analyze Boston Active Food Establishment Licenses ·
          licensecat · snapshot 3,347 active · denominator of licensed
          places, not 2025 inspections
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionPlaces() {
  const [yearKey, setYearKey] = useCanvasState<PlaceYearKey>(
    "places-year",
    "2025",
  );
  const win = PLACE_WINDOWS[yearKey];
  const windowCaption = win.ytd
    ? `${win.yearLabel} through 28 August 2026 — not a full year`
    : `${win.yearLabel} complete year`;

  return (
    <Stack gap={12}>
      <H2>Always-pass, repeats, and places to avoid — by year</H2>
      <Text>
        These lists are not 2025-only. Always-pass and repeat offenders are
        computed inside each window: complete years 2019, 2024, and 2025,
        plus 2026 year-to-date. Always-pass requires at least 3 inspections
        in that window and zero fails. Repeat offenders failed at least two
        visits in that window. Places to avoid are the worst of those
        within-window repeats. A second list counts places that failed in
        multiple years across 2012–2025 complete years. Do not count 3,347
        licenses as inspections.
      </Text>
      <Table
        headers={[
          "Window",
          "Always-pass (≥3 inspections, 0 fails)",
          "Repeat offenders (≥2 failed visits)",
        ]}
        columnAlign={["left", "right", "right"]}
        rows={[
          ["2019 complete", "60", "1,010"],
          ["2024 complete", "328", "1,296"],
          ["2025 complete", "92", "1,349"],
          ["2026 YTD through 28 Aug", "49", "999"],
        ]}
        rowTone={["info", "info", "warning", "warning"]}
      />
      <Caption>
        Source: Analyze Boston Food Establishment Inspections · collapsed
        visits · 2024 always-pass is larger because 2024 had more
        inspections (14,576) and a lower fail share (32.5%) than 2025
        (12,414 · 40.3%). 2026 is not a full year. 2020 is COVID and is
        not a list window here.
      </Caption>
      <BarChart
        categories={["2019", "2024", "2025", "2026 YTD"]}
        height={200}
        series={[
          { name: "Always-pass places", data: ALWAYS_PASS_N, tone: "success" },
          { name: "Repeat offenders", data: REPEAT_N, tone: "danger" },
        ]}
        valueSuffix=" places"
      />
      <Caption>
        Source: Analyze Boston Food Establishment Inspections · place counts
        · always-pass min 3 inspections in the window · repeat ≥2 failed
        visits in the window · 2026 YTD not a full year
      </Caption>
      <H3>Coded license category mix, 2012–2025</H3>
      <BarChart
        stacked
        categories={YEARS}
        height={240}
        series={[
          { name: "Food and drinks", data: CODED_FOOD_DRINKS },
          { name: "Take-out", data: CODED_TAKEOUT },
          { name: "Retail food", data: CODED_RETAIL },
          { name: "Mobile food", data: CODED_MOBILE },
        ]}
        valueSuffix=" inspections"
      />
      <Caption>
        Source: Analyze Boston Food Establishment Inspections · licensecat
        on the inspection row · FS Food and drinks · FT Take-out (Eating
        &amp; Drinking w/ Take Out) · RF Retail food · MFW Mobile food ·
        2012–2025 complete years · Other / unclassified is 0 every year
        because every collapsed inspection has one of those four codes ·
        not a 2025 pie · licenses are a separate file
      </Caption>
      <H3>Name overlays on top of coded categories</H3>
      <Table
        headers={["Category", "2019", "2024", "2025", "2026 YTD"]}
        columnAlign={["left", "right", "right", "right", "right"]}
        rows={OVERLAY_LABELS.map((label, i) => [
          label,
          String(OVERLAY_2019[i]),
          String(OVERLAY_2024[i]),
          String(OVERLAY_2025[i]),
          String(OVERLAY_2026[i]),
        ])}
      />
      <Caption>
        Source: Analyze Boston Food Establishment Inspections · collapsed
        inspections · Ice cream, Cafe, School, Hotel, Hospital, and
        Cultural / attraction are name overlays with word-boundary
        matching (ice cream, gelato, frozen yogurt — not the substring
        ice). ICE Auto Services and All Spice are not ice cream. FT is
        Take-out, not Food. City has no cafe or ice-cream license code.
        Other / unclassified is 0 on this dump. 2026 YTD is not a full
        year.
      </Caption>
      <Row gap={8} wrap>
        {PLACE_YEAR_PILLS.map((p) => (
          <span key={p.id}>
            <Pill active={yearKey === p.id} onClick={() => setYearKey(p.id)}>
              {p.label}
            </Pill>
          </span>
        ))}
      </Row>
      {win.ytd ? (
        <Callout tone="danger" title="2026 is not a full year.">
          Always-pass and places to avoid below are 2026 year-to-date
          through 28 August. Do not treat them as a calendar year.
        </Callout>
      ) : null}
      <Grid columns={2} gap={16}>
        <Stat
          value={String(win.alwaysN)}
          label={`Always-pass places, ${windowCaption}`}
          tone="success"
        />
        <Stat
          value={String(win.repeatN)}
          label={`Repeat offenders, ${windowCaption}`}
          tone="danger"
        />
      </Grid>
      <H3>Always-pass — {win.yearLabel} (at least 3 inspections, 0 fails)</H3>
      <Table
        headers={["Place", "Address", "Category", "Inspections"]}
        columnAlign={["left", "left", "left", "right"]}
        rows={win.alwaysPass.map((p) => [
          p.name,
          `${p.address}, ${p.zip}`,
          p.category,
          String(p.inspections),
        ])}
      />
      <Caption>
        {`Source: Analyze Boston Food Establishment Inspections · ${windowCaption} · always-pass requires at least 3 collapsed visits in this window and zero HE_Fail / HE_FailExt / Fail / Failed / HE_FAILNOR · HE_Filed is not a fail · one lucky pass is excluded · names as recorded · mobile rows often use 1 CITYWIDE ST`}
      </Caption>
      <H3>Places to avoid — worst repeat offenders, {win.yearLabel}</H3>
      <Table
        headers={[
          "Place",
          "Address",
          "Category",
          "Fails",
          "Inspections",
          "Fail share",
        ]}
        columnAlign={["left", "left", "left", "right", "right", "right"]}
        rows={win.avoid.map((p) => [
          p.name,
          `${p.address}, ${p.zip}`,
          p.category,
          String(p.fails),
          String(p.inspections),
          `${p.failRate}%`,
        ])}
      />
      <Caption>
        {`Source: Analyze Boston Food Establishment Inspections · ${windowCaption} · within-window repeat offenders (≥2 failed visits) ranked by fail count, then fail rate · top 10 · KMB(TEST) is as the City recorded it · not licenses`}
      </Caption>
      <H3>Repeat offenders across years — 2012–2025 complete years</H3>
      <Table
        headers={[
          "Place",
          "Address",
          "Category",
          "Years with a fail",
          "Fails",
          "Inspections",
        ]}
        columnAlign={["left", "left", "left", "right", "right", "right"]}
        rows={REPEAT_ACROSS.map((p) => [
          p.name,
          `${p.address}, ${p.zip}`,
          p.category,
          String(p.yearsFailed ?? 0),
          String(p.fails),
          String(p.inspections),
        ])}
      />
      <Caption>
        Source: Analyze Boston Food Establishment Inspections · 2012–2025
        complete years · failed in multiple years (at least 2 distinct
        complete years) · 2026 YTD is excluded from this list · this is
        not the same as two fails inside one year
      </Caption>
    </Stack>
  );
}

function SectionQuality() {
  return (
    <Stack gap={12}>
      <H2>What these files are, and are not</H2>
      <Table
        headers={["Rule", "Why it matters"]}
        rows={[
          [
            "Inspection rows kept 894,176 of 900,574",
            "Drop 6,398 with no resultdttm. Span 2006-04-04 to 2026-08-28. Collapse to 217,847 inspections.",
          ],
          [
            "One dump row is a violation, not an inspection",
            "Same license number and resultdttm can have several star-coded rows.",
          ],
          [
            "Do not count 3,347 licenses as inspections",
            "Active licenses are a snapshot of licensed places. 2025 inspections are 12,414.",
          ],
          [
            "2026 is not a full year",
            "Results through 28 Aug (8,894). Do not annualize.",
          ],
          [
            "Compare 2025 to 2019, not 2020",
            "2020 COVID. Inspections 10,116 → 7,932.",
          ],
          [
            "Fail is an exact result code",
            "HE_Fail, HE_FailExt, Fail, Failed, HE_FAILNOR. HE_Filed is not a fail.",
          ],
          [
            "2022 volume is as recorded",
            "19,648 inspections and a 24.9% fail share. Not a baseline.",
          ],
        ]}
        rowTone={["success", "warning", "danger", "warning", "warning", "info", "warning"]}
      />
      <Caption>
        Source: Analyze Boston datasets food-establishment-inspections and
        active-food-establishment-licenses · dumps pulled 31 Aug 2026
      </Caption>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={20}>
      <Callout
        tone="warning"
        title="Inspections rose versus 2019. The fail share rose with them."
      >
        Collapsed food inspections were 12,414 in 2025 against 10,116 in
        2019 (+22.7%). Fail share was 40.3% against 37.0%. Do not add
        3,347 licenses into 12,414.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="12,414" label="Inspections in 2025 · 34.0 a day" />
        <Stat value="+22.7%" label="Inspections vs 2019" tone="info" />
        <Stat value="40.3%" label="Fail share, 2025" tone="warning" />
        <Stat value="3,347" label="Active licenses (separate file)" />
      </Grid>
      <Table
        headers={["Finding", "Number"]}
        columnAlign={["left", "right"]}
        rows={[
          ["2025 vs 2019 inspections", "12,414 vs 10,116 (+22.7%)"],
          ["2025 vs 2019 fail share", "40.3% vs 37.0%"],
          ["HE_Pass / HE_Fail / HE_FailExt, 2025", "6,191 / 3,867 / 1,134"],
          ["Starred violation rows, 2025", "* 24,219 · ** 11,929 · *** 4,498"],
          ["Peak result hour, 2025", "4 p.m. (2,667) · Wednesday 2,682"],
          ["2026 YTD inspections (through 28 Aug)", "8,894 · 37.1 a day"],
        ]}
        rowTone={["info", "warning", "info", "warning", "info", "warning"]}
      />
      <Text>
        Open Overview for the citywide trend, Department for the result
        clock, City / Mayor for ZIP fail rates, Public for plain language,
        Places for always-pass and repeat-offender lists by year (2019,
        2024, 2025, and 2026 YTD).
      </Text>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={28}>
      <Grid columns={4} gap={16}>
        <Stat value="12,414" label="Inspections in 2025" />
        <Stat value="34.0" label="Average inspections per day" />
        <Stat value="40.3%" label="Fail share, 2025" tone="warning" />
        <Stat value="217,847" label="Inspections 2006–2026 YTD" />
      </Grid>
      <SectionDemand />
      <Divider />
      <SectionMix />
    </Stack>
  );
}

function TabDepartment() {
  return (
    <Stack gap={28}>
      <Text size="small" tone="secondary">
        What ISD Health needs: result clock, weekday load, star-level mix.
        resultdttm is not when customers got sick.
      </Text>
      <Callout tone="info" title="For Inspectional Services Health Division">
        Staff the afternoon peak, not a 311-style 8 a.m. open. Wednesday
        is the heavy day (2,682). Starred *** violations are 4,498 rows in
        2025. Active licenses (3,347) are the licensed-place denominator,
        not the inspection count.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="4 p.m." label="Peak result hour, 2025 (2,667)" />
        <Stat value="Wednesday" label="Heaviest weekday (2,682)" />
        <Stat value="October" label="Peak month (1,316)" />
      </Grid>
      <SectionClock />
      <Divider />
      <SectionPlace />
    </Stack>
  );
}

function TabCity() {
  return (
    <Stack gap={16}>
      <H2>Decisions this supports</H2>
      <Callout tone="danger" title="Do not brief 3,347 licenses as 12,414 inspections.">
        The license file is who is allowed to serve food. The inspection
        file is what ISD recorded after a visit. They will not match.
      </Callout>
      <Callout tone="warning" title="Do not treat East Boston volume as the worst fail rate.">
        East Boston 02128 is 1,025 inspections and a 30.2% fail share.
        02125 Dorchester is 517 inspections and 52.2%. South End 02118 is
        540 and 50.4%.
      </Callout>
      <Callout tone="info" title="Do not use 2022 as the new normal.">
        19,648 inspections in 2022 with a 24.9% fail share sits off the
        2012–2025 pattern. Compare 2025 to 2019.
      </Callout>
      <Table
        headers={["Ask", "Number"]}
        rows={[
          [
            "Do not treat inspection growth as a cleaner city",
            "12,414 inspections · 40.3% fail in 2025 vs 37.0% in 2019",
          ],
          [
            "Do not add licenses into inspections",
            "3,347 vs 12,414 — they will not match",
          ],
          [
            "Do not annualize 2026",
            "8,894 inspections through 28 Aug",
          ],
          [
            "Watch 02125 / 02118 / 02130 fail share",
            "52.2% · 50.4% · 50.3% (n ≥ 80)",
          ],
        ]}
      />
    </Stack>
  );
}

function TabPublic() {
  return (
    <Stack gap={16}>
      <H2>What Boston residents should know</H2>
      <Text>
        These are City of Boston food-establishment inspections, results
        recorded 4 April 2006 through 28 August 2026, plus a snapshot of
        3,347 active food licenses. This is not RentSmart, not building
        permits, and not 311.
      </Text>
      <Callout tone="info" title="One inspection can list several problems.">
        The public file is one row per violation. One 2025 fail can list
        Nonfood Contact Surfaces and Controlling Pests on the same visit.
      </Callout>
      <Callout tone="warning" title="HE_Pass is 49.9% of visits, not a majority.">
        HE_Pass is 6,191 of 12,414 visits in 2025. The same place can
        fail on a follow-up. Controlling Pests is 1,873 violation rows.
      </Callout>
      <Callout tone="warning" title="2026 is only part of a year.">
        Records in this dump run through 28 August 2026 (8,894 so far).
        2026 is not a full year.
      </Callout>
      <Callout tone="info" title="Always-pass and repeats are not 2025-only.">
        Open Places for lists in 2019, 2024, 2025, and 2026 YTD, plus
        places that failed in multiple years from 2012 through 2025.
        Always-pass needs at least 3 inspections in that window.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 inspections by result hour</H3>
          <LineChart
            categories={HOURS}
            height={180}
            fill
            series={[{ name: "Inspections", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" inspections"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections · 2025 ·
            most at 4 p.m. (2,667) · resultdttm, not meal hours
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>ZIP neighborhoods with the most 2025 inspections</H3>
          <BarChart
            horizontal
            height={180}
            categories={[
              "Dorchester",
              "East Boston",
              "Back Bay / Bay Village",
              "Fenway / Kenmore",
              "Seaport / Fort Point",
            ]}
            series={[{ name: "2025 inspections", data: [1282, 1025, 982, 956, 690] }]}
            valueSuffix=" inspections"
          />
          <Caption>
            Source: Analyze Boston Food Establishment Inspections · 2025 ·
            top 5 mapped of 12,414 · Dorchester is 02122 + 02124 + 02125
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function TabPlaces() {
  return <SectionPlaces />;
}

function TabFull() {
  return (
    <Stack gap={32}>
      <SectionDemand />
      <Divider />
      <SectionMix />
      <Divider />
      <SectionClock />
      <Divider />
      <SectionPlace />
      <Divider />
      <SectionPlaces />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

export default function BostonFoodSafetyBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston food safety — city briefing</H1>
        <Text tone="secondary">
          Analyze Boston Food Establishment Inspections, results 4 April
          2006 through 28 August 2026, and Active Food Establishment
          Licenses (3,347). 2012–2025 are complete inspection years. 2026
          is not a full year. 2020 is COVID. These two files are not
          RentSmart and are not building permits.
        </Text>
      </Stack>
      <Row gap={8} wrap>
        {TABS.map((t) => (
          <span key={t.id}>
            <Pill active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </Pill>
          </span>
        ))}
      </Row>
      <Text size="small" tone="tertiary">
        {TAB_BLURB[tab]}
      </Text>
      <Divider />
      {tab === "summary" ? <TabSummary /> : null}
      {tab === "overview" ? <TabOverview /> : null}
      {tab === "department" ? <TabDepartment /> : null}
      {tab === "city" ? <TabCity /> : null}
      {tab === "public" ? <TabPublic /> : null}
      {tab === "places" ? <TabPlaces /> : null}
      {tab === "full" ? <TabFull /> : null}
    </Stack>
  );
}
