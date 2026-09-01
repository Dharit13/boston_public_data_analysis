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
const OVERLAY_LABELS = [
  "Ice cream",
  "Cultural / attraction",
  "Hospital",
  "Hotel",
  "School",
  "Cafe",
  "Pharmacy",
  "Grocery",
  "Food and drinks",
  "Take-out",
  "Retail food",
  "Mobile food",
  "Other / unclassified",
];
const OVERLAY_2019 = [
  78,
  31,
  44,
  188,
  86,
  1039,
  131,
  248,
  4041,
  3061,
  950,
  219,
  0,
];
const OVERLAY_2024 = [
  147,
  49,
  67,
  218,
  138,
  1441,
  155,
  293,
  5721,
  4787,
  1217,
  343,
  0,
];
const OVERLAY_2025 = [
  119,
  30,
  55,
  210,
  104,
  1208,
  155,
  306,
  4864,
  4093,
  1013,
  257,
  0,
];
const OVERLAY_2026 = [
  69,
  25,
  35,
  161,
  56,
  861,
  71,
  214,
  3486,
  2849,
  799,
  268,
  0,
];

type PlaceYearKey = "2019" | "2024" | "2025" | "2026_ytd";
type PlaceRow = {
  name: string;
  address: string;
  addressDisplay: string;
  zip: string;
  license: string;
  category: string;
  inspections: number;
  fails: number;
  failRate: number;
  yearsFailed?: number;
};
function placeAddress(p: PlaceRow): string {
  if (p.addressDisplay) return p.addressDisplay;
  const compact = p.address.replace(/\s+/g, " ").trim().toUpperCase();
  if (compact.includes("CITYWIDE")) {
    return p.license
      ? `Mobile (citywide) · License ${p.license}`
      : "Mobile (citywide)";
  }
  return p.zip ? `${p.address}, ${p.zip}` : p.address;
}
const INSTITUTION_CATS = new Set([
  "Cultural / attraction",
  "Hospital",
  "School",
  "Hotel",
]);
function cautionHeadline(catLabel: string): string {
  return `Be cautious — repeated fails — ${catLabel} (failed in ≥2 calendar years)`;
}
function cautionNote(catLabel: string): string {
  const inst =
    catLabel === "all categories" || INSTITUTION_CATS.has(catLabel)
      ? " Cultural / attraction, Hospital, School, and Hotel are often destinations or institutions people still use — this is inspection history, not “skip this museum.”"
      : "";
  return (
    " This is our reconstruction from ISD result codes, not an official ISD list. Letter grade is on the door / Mayor’s Food Court." +
    inst
  );
}
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
  alwaysPass: PlaceRow[];
  byCategory: Record<string, { alwaysN: number; alwaysPass: PlaceRow[] }>;
}> = {
  "2019": {
    ytd: false,
    yearLabel: "2019",
    alwaysN: 60,
    alwaysPass: [
      { name: "Roxy's Gourmet Grilled Cheese No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 74860", zip: "02128", license: "74860", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "The Bacon Truck No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 389249", zip: "02128", license: "389249", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "Emmanuel College", address: "400  FENWAY", addressDisplay: "400  FENWAY, 02115", zip: "02115", license: "20052", category: "School", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "HILTON BOSTON LOGAN AIRPORT", address: "1  HOTEL DR", addressDisplay: "1  HOTEL DR, 02128", zip: "02128", license: "21184", category: "Hotel", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Mama Ana", address: "197  EIGHTH ST", addressDisplay: "197  EIGHTH ST, 02129", zip: "02129", license: "84994", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Mcdonalds", address: "315  WASHINGTON ST", addressDisplay: "315  WASHINGTON ST, 02108", zip: "02108", license: "76336", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "THE BARKING CRAB", address: "88  SLEEPER ST", addressDisplay: "88  SLEEPER ST, 02210", zip: "02210", license: "20104", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "AFC Sushi @ Walgreens No. 15390", address: "10  SCHOOL ST", addressDisplay: "10  SCHOOL ST, 02108", zip: "02108", license: "90461", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "AFC Sushi @Liberty Mutual Ins.", address: "157  BERKELEY ST", addressDisplay: "157  BERKELEY ST, 02116", zip: "02116", license: "374652", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Bella Luna Restaurant @ the Brewery", address: "284  AMORY ST", addressDisplay: "284  AMORY ST, 02130", zip: "02130", license: "31331", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 }
    ],
    byCategory: {
      "Hospital": {
        alwaysN: 2,
        alwaysPass: [
          { name: "CHILDRENS HOSPITAL MAIN CAF", address: "300  LONGWOOD AV", addressDisplay: "300  LONGWOOD AV, 02115", zip: "02115", license: "18886", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Spaulding Rehabilitation Hospital", address: "300  FIRST AV", addressDisplay: "300  FIRST AV, 02129", zip: "02129", license: "77115", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Hotel": {
        alwaysN: 1,
        alwaysPass: [
          { name: "HILTON BOSTON LOGAN AIRPORT", address: "1  HOTEL DR", addressDisplay: "1  HOTEL DR, 02128", zip: "02128", license: "21184", category: "Hotel", inspections: 4, fails: 0, failRate: 0.0 }
        ]
      },
      "School": {
        alwaysN: 1,
        alwaysPass: [
          { name: "Emmanuel College", address: "400  FENWAY", addressDisplay: "400  FENWAY, 02115", zip: "02115", license: "20052", category: "School", inspections: 4, fails: 0, failRate: 0.0 }
        ]
      },
      "Cafe": {
        alwaysN: 9,
        alwaysPass: [
          { name: "Boston News Cafe (90 Arch St.)", address: "90  ARCH ST", addressDisplay: "90  ARCH ST, 02110", zip: "02110", license: "77595", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "GLOBE BAR & CAFE", address: "384  BOYLSTON ST", addressDisplay: "384  BOYLSTON ST, 02116", zip: "02116", license: "353804", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Solid Ground Cafe", address: "742  HUNTINGTON AV", addressDisplay: "742  HUNTINGTON AV, 02115", zip: "02115", license: "364838", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Starbucks Coffee Co. No. 875", address: "228  WASHINGTON ST", addressDisplay: "228  WASHINGTON ST, 02109", zip: "02109", license: "25657", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Starbucks Coffee No.  7224", address: "364  BROOKLINE AV", addressDisplay: "364  BROOKLINE AV, 02115", zip: "02115", license: "26636", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Starbucks Coffee No.  7805", address: "90  OLIVER ST", addressDisplay: "90  OLIVER ST, 02110", zip: "02110", license: "26659", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Starbucks Coffee No. 22566", address: "48  NORTHERN AV", addressDisplay: "48  NORTHERN AV, 02210", zip: "02210", license: "127085", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Sunny Cafe", address: "1000  BENNINGTON ST", addressDisplay: "1000  BENNINGTON ST, 02128", zip: "02128", license: "201545", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Tatte Bakery & Cafe", address: "70  CHARLES ST", addressDisplay: "70  CHARLES ST, 02114", zip: "02114", license: "134181", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Food and drinks": {
        alwaysN: 21,
        alwaysPass: [
          { name: "Mama Ana", address: "197  EIGHTH ST", addressDisplay: "197  EIGHTH ST, 02129", zip: "02129", license: "84994", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "THE BARKING CRAB", address: "88  SLEEPER ST", addressDisplay: "88  SLEEPER ST, 02210", zip: "02210", license: "20104", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "AFC Sushi @Liberty Mutual Ins.", address: "157  BERKELEY ST", addressDisplay: "157  BERKELEY ST, 02116", zip: "02116", license: "374652", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Bella Luna Restaurant @ the Brewery", address: "284  AMORY ST", addressDisplay: "284  AMORY ST, 02130", zip: "02130", license: "31331", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Boston Chops", address: "1375  WASHINGTON ST", addressDisplay: "1375  WASHINGTON ST, 02118", zip: "02118", license: "86604", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Canary Square", address: "435 S HUNTINGTON AV", addressDisplay: "435 S HUNTINGTON AV, 02130", zip: "02130", license: "68719", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Chipotle Mexican Grill", address: "1924  BEACON ST", addressDisplay: "1924  BEACON ST, 02135", zip: "02135", license: "27303", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dorchester Brewing Company", address: "1246  MASSACHUSETTS AV", addressDisplay: "1246  MASSACHUSETTS AV, 02125", zip: "02125", license: "166847", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "EL PENOL RESTAURANT", address: "54  BENNINGTON ST", addressDisplay: "54  BENNINGTON ST, 02128", zip: "02128", license: "23581", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "GRASSHOPPER VEGETARIAN", address: "1 N BEACON ST", addressDisplay: "1 N BEACON ST, 02134", zip: "02134", license: "23973", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Take-out": {
        alwaysN: 18,
        alwaysPass: [
          { name: "Mcdonalds", address: "315  WASHINGTON ST", addressDisplay: "315  WASHINGTON ST, 02108", zip: "02108", license: "76336", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "AFC Sushi @ Walgreens No. 15390", address: "10  SCHOOL ST", addressDisplay: "10  SCHOOL ST, 02108", zip: "02108", license: "90461", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Boloco", address: "48  CONGRESS ST", addressDisplay: "48  CONGRESS ST, 02109", zip: "02109", license: "27549", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Burger King", address: "1  MAVERICK SQ", addressDisplay: "1  MAVERICK SQ, 02128", zip: "02128", license: "73889", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "C11", address: "4  JERSEY ST", addressDisplay: "4  JERSEY ST, 02215", zip: "02215", license: "31653", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Chacarero", address: "93  ARCH ST", addressDisplay: "93  ARCH ST, 02110", zip: "02110", license: "28085", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cisco Brewery", address: "200  LOGAN AIRPORT TRMNL B", addressDisplay: "200  LOGAN AIRPORT TRMNL B, 02128", zip: "02128", license: "27909", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dumpling King", address: "40  HARRISON AV", addressDisplay: "40  HARRISON AV, 02111", zip: "02111", license: "74577", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dunkin Donuts", address: "616  MASSACHUSETTS AV", addressDisplay: "616  MASSACHUSETTS AV, 02118", zip: "02118", license: "20593", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dunkin Donuts", address: "77  MILK ST ST", addressDisplay: "77  MILK ST ST, 02110", zip: "02110", license: "25962", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Retail food": {
        alwaysN: 4,
        alwaysPass: [
          { name: "Berezka International Food Store", address: "1215  COMMONWEALTH AV", addressDisplay: "1215  COMMONWEALTH AV, 02134", zip: "02134", license: "78439", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Daniel Beauty Supply & Dollar Store", address: "3115  WASHINGTON ST", addressDisplay: "3115  WASHINGTON ST, 02119", zip: "02119", license: "142739", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Genji Sushi No. 10087", address: "181  CAMBRIDGE ST", addressDisplay: "181  CAMBRIDGE ST, 02114", zip: "02114", license: "24004", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Los Paisanos Market", address: "11  MERIDIAN ST", addressDisplay: "11  MERIDIAN ST, 02128", zip: "02128", license: "25942", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Mobile food": {
        alwaysN: 4,
        alwaysPass: [
          { name: "Roxy's Gourmet Grilled Cheese No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 74860", zip: "02128", license: "74860", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
          { name: "The Bacon Truck No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 389249", zip: "02128", license: "389249", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
          { name: "Hometown Poke", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 411005", zip: "02128", license: "411005", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "The Bacon Truck", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 97097", zip: "02128", license: "97097", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      }
    }
  },
  "2024": {
    ytd: false,
    yearLabel: "2024",
    alwaysN: 328,
    alwaysPass: [
      { name: "Limani Grille", address: "100  NORTHERN AV", addressDisplay: "100  NORTHERN AV, 02210", zip: "02210", license: "490013", category: "Food and drinks", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "Zaaki", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 353809", zip: "02128", license: "353809", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "CHECKMATE CAFE", address: "900  SOUTH ST", addressDisplay: "900  SOUTH ST, 02131", zip: "02131", license: "160958", category: "Cafe", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "Dave's Hot Chicken", address: "123  STUART ST", addressDisplay: "123  STUART ST, 02116", zip: "02116", license: "539852", category: "Food and drinks", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "Lincoln Tavern", address: "425 W BROADWAY", addressDisplay: "425 W BROADWAY, 02127", zip: "02127", license: "79301", category: "Food and drinks", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "SALSAS MEXICAN GRILL", address: "417  WASHINGTON ST", addressDisplay: "417  WASHINGTON ST, 02108", zip: "02108", license: "90395", category: "Take-out", inspections: 5, fails: 0, failRate: 0.0 },
      { name: "311", address: "605  TREMONT ST", addressDisplay: "605  TREMONT ST, 02118", zip: "02118", license: "488587", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "A & N PIZZA", address: "1409  CENTRE ST", addressDisplay: "1409  CENTRE ST, 02132", zip: "02132", license: "23626", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Burger King", address: "100  WASHINGTON ST", addressDisplay: "100  WASHINGTON ST, 02121", zip: "02121", license: "18425", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Chubby Chickpea Mobile", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 77929", zip: "02128", license: "77929", category: "Mobile food", inspections: 4, fails: 0, failRate: 0.0 }
    ],
    byCategory: {
      "Ice cream": {
        alwaysN: 3,
        alwaysPass: [
          { name: "Far Out Ice Cream", address: "201  BROOKLINE AV", addressDisplay: "201  BROOKLINE AV, 02215", zip: "02215", license: "556063", category: "Ice cream", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Fomu Ice Cream", address: "200  FANEUIL HALL MARKETPLACE", addressDisplay: "200  FANEUIL HALL MARKETPLACE, 02109", zip: "02109", license: "522597", category: "Ice cream", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Lazy Bear Creamery", address: "383  NEPONSET AV", addressDisplay: "383  NEPONSET AV, 02122", zip: "02122", license: "489989", category: "Ice cream", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Hospital": {
        alwaysN: 4,
        alwaysPass: [
          { name: "3rd Floor @ Tufts Medical Center", address: "750  WASHINGTON ST", addressDisplay: "750  WASHINGTON ST, 02111", zip: "02111", license: "541352", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Mass General Hospital Cafe", address: "55  FRUIT ST", addressDisplay: "55  FRUIT ST, 02114", zip: "02114", license: "18550", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Patient Dining @ Tufts Medical Center", address: "750  WASHINGTON ST", addressDisplay: "750  WASHINGTON ST, 02111", zip: "02111", license: "541354", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Spaulding Rehabilitation Hospital", address: "300  FIRST AV", addressDisplay: "300  FIRST AV, 02129", zip: "02129", license: "77115", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Hotel": {
        alwaysN: 9,
        alwaysPass: [
          { name: "HYATT CONF. & HOTEL (FS)", address: "101  HARBORSIDE DR", addressDisplay: "101  HARBORSIDE DR, 02128", zip: "02128", license: "19765", category: "Hotel", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "The Westin Boston Waterfront", address: "425  SUMMER ST", addressDisplay: "425  SUMMER ST, 02210", zip: "02210", license: "26427", category: "Hotel", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "The Westin Boston Waterfront/Starbucks", address: "425  SUMMER ST", addressDisplay: "425  SUMMER ST, 02210", zip: "02210", license: "28965", category: "Hotel", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Battery Wharf Hotel/Grille", address: "3  BATTERY WH", addressDisplay: "3  BATTERY WH, 02109", zip: "02109", license: "331775", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Canopy Hotel", address: "99  BLACKSTONE ST", addressDisplay: "99  BLACKSTONE ST, 02109", zip: "02109", license: "415043", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Four Seasons Hotel Boston", address: "200  BOYLSTON ST", addressDisplay: "200  BOYLSTON ST, 02116", zip: "02116", license: "18140", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "HILTON BOSTON LOGAN AIRPORT", address: "1  HOTEL DR", addressDisplay: "1  HOTEL DR, 02128", zip: "02128", license: "21184", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Residence Inn by Marriott", address: "370  CONGRESS ST", addressDisplay: "370  CONGRESS ST, 02210", zip: "02210", license: "380877", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Roof Top Pool at The Colonnade Hotel", address: "120  HUNTINGTON AV", addressDisplay: "120  HUNTINGTON AV, 02116", zip: "02116", license: "480768", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "School": {
        alwaysN: 4,
        alwaysPass: [
          { name: "Suffolk University Sawyer Cafe", address: "8  ASHBURTON PL", addressDisplay: "8  ASHBURTON PL, 02108", zip: "02108", license: "456494", category: "School", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "BU 4thFl SCHOOL OF MGMT", address: "595  COMMONWEALTH AV", addressDisplay: "595  COMMONWEALTH AV, 02215", zip: "02215", license: "22460", category: "School", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Northeastern University Belvidere", address: "39  DALTON ST", addressDisplay: "39  DALTON ST, 02199", zip: "02199", license: "537896", category: "School", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "University Club of Boston-Rooftop Bar", address: "426  STUART ST", addressDisplay: "426  STUART ST, 02116", zip: "02116", license: "526306", category: "School", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Cafe": {
        alwaysN: 32,
        alwaysPass: [
          { name: "CHECKMATE CAFE", address: "900  SOUTH ST", addressDisplay: "900  SOUTH ST, 02131", zip: "02131", license: "160958", category: "Cafe", inspections: 5, fails: 0, failRate: 0.0 },
          { name: "The Well Coffee House Boston", address: "62  WILLIAM C KELLY SQ", addressDisplay: "62  WILLIAM C KELLY SQ, 02128", zip: "02128", license: "372405", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Unidine Cafe Coffee Bar", address: "529  MAIN ST", addressDisplay: "529  MAIN ST, 02129", zip: "02129", license: "144284", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "960 Cafe", address: "960  MASSACHUSETTS AV", addressDisplay: "960  MASSACHUSETTS AV, 02118", zip: "02118", license: "534002", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "B I DEACONESS/WEST END CAFE", address: "1  DEACONESS RD", addressDisplay: "1  DEACONESS RD, 02215", zip: "02215", license: "21931", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Blank Street Coffee", address: "489 E BROADWAY", addressDisplay: "489 E BROADWAY, 02127", zip: "02127", license: "542405", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Boston News Cafe (90 Arch St.)", address: "90  ARCH ST", addressDisplay: "90  ARCH ST, 02110", zip: "02110", license: "77595", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Capital One Cafe", address: "795  BOYLSTON ST", addressDisplay: "795  BOYLSTON ST, 02116", zip: "02116", license: "479008", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Capital One Cafe", address: "55  SEAPORT BL", addressDisplay: "55  SEAPORT BL, 02210", zip: "02210", license: "515362", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dug Out Cafe Inc", address: "722  COMMONWEALTH AV", addressDisplay: "722  COMMONWEALTH AV, 02115", zip: "02115", license: "18360", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Pharmacy": {
        alwaysN: 3,
        alwaysPass: [
          { name: "CVS/Pharmacy No. 1889", address: "427  WASHINGTON ST", addressDisplay: "427  WASHINGTON ST, 02135", zip: "02135", license: "20759", category: "Pharmacy", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Walgreens No.  05756", address: "1  WM C KELLY SQ", addressDisplay: "1  WM C KELLY SQ, 02128", zip: "02128", license: "25352", category: "Pharmacy", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Walgreens No. 11797", address: "465  CAMBRIDGE ST", addressDisplay: "465  CAMBRIDGE ST, 02134", zip: "02134", license: "33162", category: "Pharmacy", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Grocery": {
        alwaysN: 9,
        alwaysPass: [
          { name: "Daily Table", address: "450  WASHINGTON ST", addressDisplay: "450  WASHINGTON ST, 02124", zip: "02124", license: "129653", category: "Grocery", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Star Market No. 4572", address: "370  WESTERN AV", addressDisplay: "370  WESTERN AV, 02135", zip: "02135", license: "25692", category: "Grocery", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Tropical Food Mart", address: "4545  WASHINGTON ST", addressDisplay: "4545  WASHINGTON ST, 02131", zip: "02131", license: "89935", category: "Grocery", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Bob's Grocery", address: "160  ENDICOTT ST", addressDisplay: "160  ENDICOTT ST, 02113", zip: "02113", license: "19919", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Star Market Company", address: "50  CAUSEWAY ST", addressDisplay: "50  CAUSEWAY ST, 02114", zip: "02114", license: "359367", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "TRADER JOE'S No. 510", address: "893  BOYLSTON ST", addressDisplay: "893  BOYLSTON ST, 02115", zip: "02115", license: "25622", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Trader Joe's No. 561", address: "199 N HARVARD ST", addressDisplay: "199 N HARVARD ST, 02134", zip: "02134", license: "334435", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Trader Joe's No. 566", address: "44  THOMSON PL", addressDisplay: "44  THOMSON PL, 02210", zip: "02210", license: "398730", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "WHOLE FOODS MARKET", address: "310  HARRISON AV", addressDisplay: "310  HARRISON AV, 02118", zip: "02118", license: "127863", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Food and drinks": {
        alwaysN: 115,
        alwaysPass: [
          { name: "Limani Grille", address: "100  NORTHERN AV", addressDisplay: "100  NORTHERN AV, 02210", zip: "02210", license: "490013", category: "Food and drinks", inspections: 6, fails: 0, failRate: 0.0 },
          { name: "Dave's Hot Chicken", address: "123  STUART ST", addressDisplay: "123  STUART ST, 02116", zip: "02116", license: "539852", category: "Food and drinks", inspections: 5, fails: 0, failRate: 0.0 },
          { name: "Lincoln Tavern", address: "425 W BROADWAY", addressDisplay: "425 W BROADWAY, 02127", zip: "02127", license: "79301", category: "Food and drinks", inspections: 5, fails: 0, failRate: 0.0 },
          { name: "311", address: "605  TREMONT ST", addressDisplay: "605  TREMONT ST, 02118", zip: "02118", license: "488587", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "El Jefe's Taqueria", address: "80  BOYLSTON ST", addressDisplay: "80  BOYLSTON ST, 02116", zip: "02116", license: "415054", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Laugh Boston", address: "425  SUMMER ST", addressDisplay: "425  SUMMER ST, 02210", zip: "02210", license: "86989", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Levy Premium Main Kitchen & Commissary", address: "415  SUMMER ST", addressDisplay: "415  SUMMER ST, 02210", zip: "02210", license: "68093", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Lucia Ristorante", address: "415  HANOVER ST", addressDisplay: "415  HANOVER ST, 02109", zip: "02109", license: "301099", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Moxies", address: "899  CONGRESS ST", addressDisplay: "899  CONGRESS ST, 02210", zip: "02210", license: "533058", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Mud House", address: "389  NEPONSET AV", addressDisplay: "389  NEPONSET AV, 02122", zip: "02122", license: "90223", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 }
        ]
      },
      "Take-out": {
        alwaysN: 118,
        alwaysPass: [
          { name: "SALSAS MEXICAN GRILL", address: "417  WASHINGTON ST", addressDisplay: "417  WASHINGTON ST, 02108", zip: "02108", license: "90395", category: "Take-out", inspections: 5, fails: 0, failRate: 0.0 },
          { name: "A & N PIZZA", address: "1409  CENTRE ST", addressDisplay: "1409  CENTRE ST, 02132", zip: "02132", license: "23626", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Burger King", address: "100  WASHINGTON ST", addressDisplay: "100  WASHINGTON ST, 02121", zip: "02121", license: "18425", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Dunkin Donuts", address: "1931  DORCHESTER AV", addressDisplay: "1931  DORCHESTER AV, 02124", zip: "02124", license: "480908", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Dunkin Donuts", address: "210  HARVARD AV", addressDisplay: "210  HARVARD AV, 02134", zip: "02134", license: "32504", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "DUNKIN DONUTS(ARRIVAL)", address: "100  TERMINAL RD", addressDisplay: "100  TERMINAL RD, 02128", zip: "02128", license: "23670", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Dunkin Donuts-Amer Airlines/Landside", address: "200  LOGAN AIRPORT TRMNL B", addressDisplay: "200  LOGAN AIRPORT TRMNL B, 02128", zip: "02128", license: "25854", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Frio Rico", address: "360  BENNINGTON ST", addressDisplay: "360  BENNINGTON ST, 02128", zip: "02128", license: "28731", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "JIMMY JOHN'S", address: "100  TERMINAL RD", addressDisplay: "100  TERMINAL RD, 02128", zip: "02128", license: "536728", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Shanti Express", address: "49  WARREN ST", addressDisplay: "49  WARREN ST, 02119", zip: "02119", license: "446731", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 }
        ]
      },
      "Retail food": {
        alwaysN: 14,
        alwaysPass: [
          { name: "AFC Zenshi @ Shaw's 3588", address: "1065  COMMONWEALTH AV", addressDisplay: "1065  COMMONWEALTH AV, 02215", zip: "02215", license: "378993", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "AFC Zenshi @ Shaw's 4572", address: "370  WESTERN AV", addressDisplay: "370  WESTERN AV, 02135", zip: "02135", license: "21946", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "BOB'S PITA MARKET.", address: "4198  WASHINGTON ST", addressDisplay: "4198  WASHINGTON ST, 02131", zip: "02131", license: "91975", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cibao Market", address: "3936  WASHINGTON ST", addressDisplay: "3936  WASHINGTON ST, 02131", zip: "02131", license: "30694", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Donna's Cakes", address: "100  SPRING ST", addressDisplay: "100  SPRING ST, 02132", zip: "02132", license: "460716", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Eagle Hill Convenience Store", address: "215  TRENTON ST", addressDisplay: "215  TRENTON ST, 02128", zip: "02128", license: "80141", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "HENRY'S MARKET", address: "892  SOUTH ST", addressDisplay: "892  SOUTH ST, 02131", zip: "02131", license: "21759", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Lilly Boston-Retail", address: "15  NECCO ST", addressDisplay: "15  NECCO ST, 02210", zip: "02210", license: "568808", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Obrian's Market", address: "1660  DORCHESTER AV", addressDisplay: "1660  DORCHESTER AV, 02122", zip: "02122", license: "521061", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Philips Candy House", address: "818  WM T MORRISSEY BL", addressDisplay: "818  WM T MORRISSEY BL, 02122", zip: "02122", license: "18262", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Mobile food": {
        alwaysN: 17,
        alwaysPass: [
          { name: "Zaaki", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 353809", zip: "02128", license: "353809", category: "Mobile food", inspections: 6, fails: 0, failRate: 0.0 },
          { name: "Chubby Chickpea Mobile", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 77929", zip: "02128", license: "77929", category: "Mobile food", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Berry Sweets No. 1", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 396032", zip: "02128", license: "396032", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "BM3:BON ME RED", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 86676", zip: "02128", license: "86676", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Boston Trolley DogsNo. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 531943", zip: "02128", license: "531943", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Chicken and Rice Guys No. 1", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 523270", zip: "02128", license: "523270", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dezz Kitchen", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 481891", zip: "02128", license: "481891", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "How's Your Meat", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 460308", zip: "02128", license: "460308", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Indulge India", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 524220", zip: "02128", license: "524220", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Moyzilla No. 4", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 401890", zip: "02128", license: "401890", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      }
    }
  },
  "2025": {
    ytd: false,
    yearLabel: "2025",
    alwaysN: 92,
    alwaysPass: [
      { name: "Dunkin Donuts", address: "1627  TREMONT ST", addressDisplay: "1627  TREMONT ST, 02120", zip: "02120", license: "548628", category: "Take-out", inspections: 6, fails: 0, failRate: 0.0 },
      { name: "Blue Ribbon Barbecue", address: "401  PARK DR", addressDisplay: "401  PARK DR, 02215", zip: "02215", license: "539029", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "CVS/Pharmacy No. 10517", address: "77  SEAPORT BL", addressDisplay: "77  SEAPORT BL, 02210", zip: "02210", license: "301882", category: "Pharmacy", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "CVS/Pharmacy No. 1900", address: "218  HANOVER ST", addressDisplay: "218  HANOVER ST, 02113", zip: "02113", license: "19949", category: "Pharmacy", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Honeygrow", address: "100  NORTHERN AV", addressDisplay: "100  NORTHERN AV, 02210", zip: "02210", license: "333091", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Lala's Neapolitan-ish Pizza", address: "401  PARK DR", addressDisplay: "401  PARK DR, 02215", zip: "02215", license: "517981", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Shake Shack", address: "234  NEWBURY ST", addressDisplay: "234  NEWBURY ST, 02116", zip: "02116", license: "134172", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Sodexo @ Liberty Mutual Fl. 2", address: "157  BERKELEY ST", addressDisplay: "157  BERKELEY ST, 02116", zip: "02116", license: "465753", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "STARBUCKS COFFEE No.  7823", address: "470  WASHINGTON ST", addressDisplay: "470  WASHINGTON ST, 02135", zip: "02135", license: "26054", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Taco Bell", address: "74  SUMMER ST", addressDisplay: "74  SUMMER ST, 02110", zip: "02110", license: "409207", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 }
    ],
    byCategory: {
      "Ice cream": {
        alwaysN: 1,
        alwaysPass: [
          { name: "Crescent Ridge Dairy", address: "100  HANOVER ST", addressDisplay: "100  HANOVER ST, 02114", zip: "02114", license: "141802", category: "Ice cream", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Hospital": {
        alwaysN: 2,
        alwaysPass: [
          { name: "Mass General Hospital Cafe", address: "55  FRUIT ST", addressDisplay: "55  FRUIT ST, 02114", zip: "02114", license: "18550", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Spaulding Rehabilitation Hospital", address: "300  FIRST AV", addressDisplay: "300  FIRST AV, 02129", zip: "02129", license: "77115", category: "Hospital", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Hotel": {
        alwaysN: 4,
        alwaysPass: [
          { name: "Aloft Boston Seaport Hotel Refuel", address: "401  D ST", addressDisplay: "401  D ST, 02210", zip: "02210", license: "465167", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "CitizenM Hotel Boston Back Bay", address: "1001  BOYLSTON ST", addressDisplay: "1001  BOYLSTON ST, 02215", zip: "02215", license: "519755", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "HILTON BOSTON LOGAN AIRPORT", address: "1  HOTEL DR", addressDisplay: "1  HOTEL DR, 02128", zip: "02128", license: "21184", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "HYATT CONF. & HOTEL (FS)", address: "101  HARBORSIDE DR", addressDisplay: "101  HARBORSIDE DR, 02128", zip: "02128", license: "19765", category: "Hotel", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "School": {
        alwaysN: 1,
        alwaysPass: [
          { name: "Suffolk University Sargent Hall", address: "120  TREMONT ST", addressDisplay: "120  TREMONT ST, 02108", zip: "02108", license: "456504", category: "School", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Cafe": {
        alwaysN: 9,
        alwaysPass: [
          { name: "STARBUCKS COFFEE No.  7823", address: "470  WASHINGTON ST", addressDisplay: "470  WASHINGTON ST, 02135", zip: "02135", license: "26054", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Anna's Cafe", address: "267  MEDFORD ST", addressDisplay: "267  MEDFORD ST, 02129", zip: "02129", license: "135886", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cafe Presto", address: "1  HOTEL DR", addressDisplay: "1  HOTEL DR, 02128", zip: "02128", license: "308963", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Code 10 Restaurant Cafe", address: "2 E CONCORD ST", addressDisplay: "2 E CONCORD ST, 02118", zip: "02118", license: "125523", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "COURTYARD CAFE", address: "200  LONGWOOD AV", addressDisplay: "200  LONGWOOD AV, 02115", zip: "02115", license: "23923", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Pressed Cafe Seaport", address: "43-61  PIER 4 BL", addressDisplay: "43-61  PIER 4 BL, 02210", zip: "02210", license: "580589", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Revival Cafe & Kitchen", address: "15  NECCO ST", addressDisplay: "15  NECCO ST, 02210", zip: "02210", license: "568855", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Tatte Bakery & Cafe", address: "70  CHARLES ST", addressDisplay: "70  CHARLES ST, 02114", zip: "02114", license: "134181", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Tatte Bakery & Cafe", address: "201  WASHINGTON ST", addressDisplay: "201  WASHINGTON ST, 02108", zip: "02108", license: "385584", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Pharmacy": {
        alwaysN: 3,
        alwaysPass: [
          { name: "CVS/Pharmacy No. 10517", address: "77  SEAPORT BL", addressDisplay: "77  SEAPORT BL, 02210", zip: "02210", license: "301882", category: "Pharmacy", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "CVS/Pharmacy No. 1900", address: "218  HANOVER ST", addressDisplay: "218  HANOVER ST, 02113", zip: "02113", license: "19949", category: "Pharmacy", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Walgreens No.  06349", address: "583  WASHINGTON ST", addressDisplay: "583  WASHINGTON ST, 02124", zip: "02124", license: "25360", category: "Pharmacy", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Grocery": {
        alwaysN: 5,
        alwaysPass: [
          { name: "Trader Joe's No. 566", address: "44  THOMSON PL", addressDisplay: "44  THOMSON PL, 02210", zip: "02210", license: "398730", category: "Grocery", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "WHOLE FOODS MARKET", address: "15  WASHINGTON ST", addressDisplay: "15  WASHINGTON ST, 02135", zip: "02135", license: "24017", category: "Grocery", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Star Market Company", address: "50  CAUSEWAY ST", addressDisplay: "50  CAUSEWAY ST, 02114", zip: "02114", license: "359367", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "TRADER JOE'S No. 510", address: "893  BOYLSTON ST", addressDisplay: "893  BOYLSTON ST, 02115", zip: "02115", license: "25622", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "WHOLE FOODS MARKET(Cambridge St.)", address: "181  CAMBRIDGE ST", addressDisplay: "181  CAMBRIDGE ST, 02114", zip: "02114", license: "24001", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Food and drinks": {
        alwaysN: 27,
        alwaysPass: [
          { name: "Honeygrow", address: "100  NORTHERN AV", addressDisplay: "100  NORTHERN AV, 02210", zip: "02210", license: "333091", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Shake Shack", address: "234  NEWBURY ST", addressDisplay: "234  NEWBURY ST, 02116", zip: "02116", license: "134172", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Sodexo @ Liberty Mutual Fl. 2", address: "157  BERKELEY ST", addressDisplay: "157  BERKELEY ST, 02116", zip: "02116", license: "465753", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Taco Bell", address: "74  SUMMER ST", addressDisplay: "74  SUMMER ST, 02110", zip: "02110", license: "409207", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Vejigantes Restaurant", address: "57 W DEDHAM ST", addressDisplay: "57 W DEDHAM ST, 02118", zip: "02118", license: "77974", category: "Food and drinks", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Ali Baba", address: "99A  CAMBRIDGE ST", addressDisplay: "99A  CAMBRIDGE ST, 02129", zip: "02129", license: "422123", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Bambu", address: "287  ADAMS ST", addressDisplay: "287  ADAMS ST, 02122", zip: "02122", license: "310779", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Bleacher Bar", address: "70  LANSDOWNE ST", addressDisplay: "70  LANSDOWNE ST, 02215", zip: "02215", license: "29474", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cava", address: "125  SUMMER ST", addressDisplay: "125  SUMMER ST, 02110", zip: "02110", license: "480212", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cava", address: "669  BOYLSTON ST", addressDisplay: "669  BOYLSTON ST, 02116", zip: "02116", license: "353940", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Take-out": {
        alwaysN: 28,
        alwaysPass: [
          { name: "Dunkin Donuts", address: "1627  TREMONT ST", addressDisplay: "1627  TREMONT ST, 02120", zip: "02120", license: "548628", category: "Take-out", inspections: 6, fails: 0, failRate: 0.0 },
          { name: "Blue Ribbon Barbecue", address: "401  PARK DR", addressDisplay: "401  PARK DR, 02215", zip: "02215", license: "539029", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Lala's Neapolitan-ish Pizza", address: "401  PARK DR", addressDisplay: "401  PARK DR, 02215", zip: "02215", license: "517981", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "The Monkey Bar", address: "200  FANEUIL HALL MARKET PL", addressDisplay: "200  FANEUIL HALL MARKET PL, 02109", zip: "02109", license: "582964", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "AFC Zenshi @ Shaws No. 1208", address: "246  BORDER ST", addressDisplay: "246  BORDER ST, 02128", zip: "02128", license: "364776", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Alamo Drafthouse", address: "23  NORTHERN AV", addressDisplay: "23  NORTHERN AV, 02210", zip: "02210", license: "522086", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "B. Good Burger", address: "200  TERMINAL RD", addressDisplay: "200  TERMINAL RD, 02128", zip: "02128", license: "371852", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Beantown Pastrami", address: "100  HANOVER ST", addressDisplay: "100  HANOVER ST, 02114", zip: "02114", license: "140128", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Charley's Philly Steaks", address: "350  LONGWOOD AV", addressDisplay: "350  LONGWOOD AV, 02215", zip: "02215", license: "143575", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Craft Food Hall", address: "135  WILLIAM T MORRISSEY BL", addressDisplay: "135  WILLIAM T MORRISSEY BL, 02125", zip: "02125", license: "450802", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Retail food": {
        alwaysN: 6,
        alwaysPass: [
          { name: "ADAMS CONVENIENCE STORE", address: "114  BLACKSTONE ST", addressDisplay: "114  BLACKSTONE ST, 02108", zip: "02108", license: "139414", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "ALBA PRODUCE", address: "18  PARMENTER ST", addressDisplay: "18  PARMENTER ST, 02113", zip: "02113", license: "21026", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dollar General Store No. 19117", address: "500  GENEVA AV", addressDisplay: "500  GENEVA AV, 02122", zip: "02122", license: "344417", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "KAREN MARKET", address: "41  BENNINGTON ST", addressDisplay: "41  BENNINGTON ST, 02128", zip: "02128", license: "24070", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "MASS. AVE. SUNOCO MART", address: "895  MASSACHUSETTS AV", addressDisplay: "895  MASSACHUSETTS AV, 02118", zip: "02118", license: "20073", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Walden Local Butcher", address: "316  SHAWMUT AV", addressDisplay: "316  SHAWMUT AV, 02118", zip: "02118", license: "332174", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Mobile food": {
        alwaysN: 6,
        alwaysPass: [
          { name: "Boston Trolley DogsNo. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 531943", zip: "02128", license: "531943", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Eloti No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 550426", zip: "02128", license: "550426", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Madame Chervilo", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 595710", zip: "02128", license: "595710", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Papi's Stuffed Sopapillas", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 528241", zip: "02128", license: "528241", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Twizted Pickle", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 531319", zip: "02128", license: "531319", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Zaz Food Truck", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 482060", zip: "02128", license: "482060", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      }
    }
  },
  "2026_ytd": {
    ytd: true,
    yearLabel: "2026 YTD",
    alwaysN: 49,
    alwaysPass: [
      { name: "BM2: Bon Me OrangeNo. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 523524", zip: "02128", license: "523524", category: "Mobile food", inspections: 9, fails: 0, failRate: 0.0 },
      { name: "Cool Shade 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 599905", zip: "02128", license: "599905", category: "Mobile food", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Dave's Hot Chicken", address: "1260  BOYLSTON ST", addressDisplay: "1260  BOYLSTON ST, 02215", zip: "02215", license: "554038", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Grace Note Coffee", address: "100  HIGH ST", addressDisplay: "100  HIGH ST, 02110", zip: "02110", license: "413549", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Olu's African Market", address: "4400  WASHINGTON ST", addressDisplay: "4400  WASHINGTON ST, 02131", zip: "02131", license: "607074", category: "Retail food", inspections: 4, fails: 0, failRate: 0.0 },
      { name: "Ashmont Convenience Store", address: "1996  DORCHESTER AV", addressDisplay: "1996  DORCHESTER AV, 02124", zip: "02124", license: "76483", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "B/SPOKE", address: "54  OLD COLONY AV", addressDisplay: "54  OLD COLONY AV, 02127", zip: "02127", license: "467384", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Bibim Box", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 317902", zip: "02128", license: "317902", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Boston Trolley Dogs", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 139282", zip: "02128", license: "139282", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
      { name: "Boston Trolley DogsNo. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 531943", zip: "02128", license: "531943", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 }
    ],
    byCategory: {
      "Cafe": {
        alwaysN: 2,
        alwaysPass: [
          { name: "Grace Note Coffee", address: "100  HIGH ST", addressDisplay: "100  HIGH ST, 02110", zip: "02110", license: "413549", category: "Cafe", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "FLOUR BAKERY & CAFE", address: "1595  WASHINGTON ST", addressDisplay: "1595  WASHINGTON ST, 02118", zip: "02118", license: "21518", category: "Cafe", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Pharmacy": {
        alwaysN: 1,
        alwaysPass: [
          { name: "CVS  Pharmacy", address: "214  HARVARD AV", addressDisplay: "214  HARVARD AV, 02134", zip: "02134", license: "425214", category: "Pharmacy", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Grocery": {
        alwaysN: 1,
        alwaysPass: [
          { name: "WHOLE FOODS MARKET(415 Centre St.)", address: "415  CENTRE ST", addressDisplay: "415  CENTRE ST, 02130", zip: "02130", license: "75480", category: "Grocery", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Food and drinks": {
        alwaysN: 9,
        alwaysPass: [
          { name: "Bubble Bath", address: "100  HIGH ST", addressDisplay: "100  HIGH ST, 02110", zip: "02110", license: "416143", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Chipotle Mexican Grill", address: "1924  BEACON ST", addressDisplay: "1924  BEACON ST, 02135", zip: "02135", license: "27303", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Irashai Sushi and Teriyaki", address: "8  KNEELAND ST", addressDisplay: "8  KNEELAND ST, 02111", zip: "02111", license: "75249", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Island Cuisine Restaurant and Bakery", address: "554  DUDLEY ST", addressDisplay: "554  DUDLEY ST, 02125", zip: "02125", license: "586682", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Ropes & Gray L L P", address: "800  BOYLSTON ST", addressDisplay: "800  BOYLSTON ST, 02199", zip: "02199", license: "73849", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Starbucks", address: "1341  BOYLSTON ST", addressDisplay: "1341  BOYLSTON ST, 02215", zip: "02215", license: "144417", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Tasty Burger", address: "86  VAN NESS ST", addressDisplay: "86  VAN NESS ST, 02215", zip: "02215", license: "526245", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "The Ancient Bakers", address: "1199  TREMONT ST", addressDisplay: "1199  TREMONT ST, 02120", zip: "02120", license: "621550", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Trillium at Farnsworth", address: "47  FARNSWORTH ST", addressDisplay: "47  FARNSWORTH ST, 02210", zip: "02210", license: "348174", category: "Food and drinks", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Take-out": {
        alwaysN: 15,
        alwaysPass: [
          { name: "Dave's Hot Chicken", address: "1260  BOYLSTON ST", addressDisplay: "1260  BOYLSTON ST, 02215", zip: "02215", license: "554038", category: "Take-out", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "B/SPOKE", address: "54  OLD COLONY AV", addressDisplay: "54  OLD COLONY AV, 02127", zip: "02127", license: "467384", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Burger King", address: "210  BRIGHTON AV", addressDisplay: "210  BRIGHTON AV, 02134", zip: "02134", license: "86902", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Charming Gardener/Dive Bar", address: "100  HIGH ST", addressDisplay: "100  HIGH ST, 02110", zip: "02110", license: "413556", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cumin Club Indian Kitchen", address: "100  HIGH ST", addressDisplay: "100  HIGH ST, 02110", zip: "02110", license: "577760", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dunkin", address: "214 N BEACON ST", addressDisplay: "214 N BEACON ST, 02135", zip: "02135", license: "582382", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dunkin Donuts", address: "210  HARVARD AV", addressDisplay: "210  HARVARD AV, 02134", zip: "02134", license: "32504", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "DUNKIN DONUTS/SCNVANOS", address: "440  MASSACHUSETTS AV", addressDisplay: "440  MASSACHUSETTS AV, 02118", zip: "02118", license: "23314", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dunkin' Donuts", address: "1131  TREMONT ST", addressDisplay: "1131  TREMONT ST, 02120", zip: "02120", license: "19970", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Gary's Pizza", address: "1744  WASHINGTON ST", addressDisplay: "1744  WASHINGTON ST, 02118", zip: "02118", license: "565935", category: "Take-out", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Retail food": {
        alwaysN: 6,
        alwaysPass: [
          { name: "Olu's African Market", address: "4400  WASHINGTON ST", addressDisplay: "4400  WASHINGTON ST, 02131", zip: "02131", license: "607074", category: "Retail food", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Ashmont Convenience Store", address: "1996  DORCHESTER AV", addressDisplay: "1996  DORCHESTER AV, 02124", zip: "02124", license: "76483", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Dollar Tree", address: "1230  VFW PW", addressDisplay: "1230  VFW PW, 02132", zip: "02132", license: "144741", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "HENRY'S MARKET", address: "892  SOUTH ST", addressDisplay: "892  SOUTH ST, 02131", zip: "02131", license: "21759", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Kaba African Market", address: "11  ROXBURY ST", addressDisplay: "11  ROXBURY ST, 02119", zip: "02119", license: "27956", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Wild Duck Food Market", address: "362  COMMONWEALTH AV", addressDisplay: "362  COMMONWEALTH AV, 02115", zip: "02115", license: "543772", category: "Retail food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      },
      "Mobile food": {
        alwaysN: 15,
        alwaysPass: [
          { name: "BM2: Bon Me OrangeNo. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 523524", zip: "02128", license: "523524", category: "Mobile food", inspections: 9, fails: 0, failRate: 0.0 },
          { name: "Cool Shade 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 599905", zip: "02128", license: "599905", category: "Mobile food", inspections: 4, fails: 0, failRate: 0.0 },
          { name: "Bibim Box", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 317902", zip: "02128", license: "317902", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Boston Trolley Dogs", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 139282", zip: "02128", license: "139282", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Boston Trolley DogsNo. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 531943", zip: "02128", license: "531943", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Caribbean Hibachi", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 529989", zip: "02128", license: "529989", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Cousins Maine Lobster", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 597760", zip: "02128", license: "597760", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "El Dugout", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 598183", zip: "02128", license: "598183", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Extreme Flavor", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 598092", zip: "02128", license: "598092", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 },
          { name: "Gogi On The Block No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 354104", zip: "02128", license: "354104", category: "Mobile food", inspections: 3, fails: 0, failRate: 0.0 }
        ]
      }
    }
  }
};

const REPEAT_N_TOTAL = 5945;
const REPEAT_ACROSS: PlaceRow[] = [
    { name: "Go Fresh 365", address: "1102  WASHINGTON ST", addressDisplay: "1102  WASHINGTON ST, 02118", zip: "02118", license: "34585", category: "Grocery", inspections: 111, fails: 58, failRate: 52.3, yearsFailed: 15 },
    { name: "BOURBON ST. CAFE", address: "417  WASHINGTON ST", addressDisplay: "417  WASHINGTON ST, 02108", zip: "02108", license: "21201", category: "Cafe", inspections: 118, fails: 57, failRate: 48.3, yearsFailed: 15 },
    { name: "Fan Fan Restaurant", address: "15  HARVARD AV", addressDisplay: "15  HARVARD AV, 02136", zip: "02136", license: "37129", category: "Food and drinks", inspections: 105, fails: 54, failRate: 51.4, yearsFailed: 15 },
    { name: "Bonchon Allston", address: "101  BRIGHTON AV", addressDisplay: "101  BRIGHTON AV, 02134", zip: "02134", license: "78286", category: "Food and drinks", inspections: 109, fails: 53, failRate: 48.6, yearsFailed: 15 },
    { name: "The Real Deal", address: "1882  CENTRE ST", addressDisplay: "1882  CENTRE ST, 02132", zip: "02132", license: "23987", category: "Food and drinks", inspections: 103, fails: 53, failRate: 51.5, yearsFailed: 15 },
    { name: "Nhu Lan Fast Food", address: "1155  DORCHESTER AV", addressDisplay: "1155  DORCHESTER AV, 02125", zip: "02125", license: "74834", category: "Take-out", inspections: 103, fails: 51, failRate: 49.5, yearsFailed: 15 },
    { name: "Yamato Japanese Cuisine", address: "111  CHISWICK RD", addressDisplay: "111  CHISWICK RD, 02135", zip: "02135", license: "74763", category: "Food and drinks", inspections: 99, fails: 49, failRate: 49.5, yearsFailed: 15 },
    { name: "Yely's Coffee Shop", address: "284  CENTRE ST", addressDisplay: "284  CENTRE ST, 02130", zip: "02130", license: "20071", category: "Cafe", inspections: 104, fails: 49, failRate: 47.1, yearsFailed: 15 },
    { name: "BALE RESTAURANT", address: "1052  DORCHESTER AV", addressDisplay: "1052  DORCHESTER AV, 02125", zip: "02125", license: "22464", category: "Take-out", inspections: 104, fails: 48, failRate: 46.2, yearsFailed: 15 },
    { name: "MCKENNA'S CAFE", address: "109  SAVIN HILL AV", addressDisplay: "109  SAVIN HILL AV, 02125", zip: "02125", license: "23628", category: "Cafe", inspections: 92, fails: 48, failRate: 52.2, yearsFailed: 15 },
    { name: "NEW YORK FRIED CHICKEN & PIZZA", address: "531  COLUMBIA RD", addressDisplay: "531  COLUMBIA RD, 02125", zip: "02125", license: "23286", category: "Take-out", inspections: 90, fails: 48, failRate: 53.3, yearsFailed: 15 },
    { name: "NICOLE'S PIZZA", address: "639  TREMONT ST", addressDisplay: "639  TREMONT ST, 02118", zip: "02118", license: "21851", category: "Take-out", inspections: 83, fails: 48, failRate: 57.8, yearsFailed: 15 },
    { name: "BERTUCCI'S", address: "633  V F W PK", addressDisplay: "633  V F W PK, 02132", zip: "02132", license: "19320", category: "Food and drinks", inspections: 91, fails: 47, failRate: 51.6, yearsFailed: 15 },
    { name: "Los Amigos Mexican Grill", address: "1741  CENTRE ST", addressDisplay: "1741  CENTRE ST, 02132", zip: "02132", license: "75844", category: "Take-out", inspections: 103, fails: 47, failRate: 45.6, yearsFailed: 15 },
    { name: "PARAMOUNT", address: "44  CHARLES ST", addressDisplay: "44  CHARLES ST, 02114", zip: "02114", license: "20157", category: "Food and drinks", inspections: 95, fails: 47, failRate: 49.5, yearsFailed: 15 }
  ];
const REPEAT_BY_CATEGORY: Record<string, { repeatN: number; avoid: PlaceRow[] }> = {
  "Ice cream": {
    repeatN: 45,
    avoid: [
      { name: "J.P. LICKS INC.", address: "659  CENTRE ST", addressDisplay: "659  CENTRE ST, 02130", zip: "02130", license: "21069", category: "Ice cream", inspections: 59, fails: 26, failRate: 44.1, yearsFailed: 15 },
      { name: "P & R ICE CREAM", address: "1284  BLUE HILL AV", addressDisplay: "1284  BLUE HILL AV, 02126", zip: "02126", license: "18908", category: "Ice cream", inspections: 60, fails: 30, failRate: 50.0, yearsFailed: 14 },
      { name: "THE BOSTON ICE CREAM FACTORY", address: "777  WILLIAM T MORRISSEY BL", addressDisplay: "777  WILLIAM T MORRISSEY BL, 02122", zip: "02122", license: "21556", category: "Ice cream", inspections: 50, fails: 23, failRate: 46.0, yearsFailed: 13 },
      { name: "Cold Stone Creamery", address: "800  BOYLSTON ST", addressDisplay: "800  BOYLSTON ST, 02199", zip: "02199", license: "141000", category: "Ice cream", inspections: 68, fails: 36, failRate: 52.9, yearsFailed: 11 },
      { name: "P & R Restaurant & Ice Cream Parlor", address: "208  DUDLEY ST", addressDisplay: "208  DUDLEY ST, 02119", zip: "02119", license: "134804", category: "Ice cream", inspections: 48, fails: 22, failRate: 45.8, yearsFailed: 11 },
      { name: "J.P. LICKS AT W.R.  INC.", address: "661  V F W PK", addressDisplay: "661  V F W PK, 02467", zip: "02467", license: "21821", category: "Ice cream", inspections: 55, fails: 20, failRate: 36.4, yearsFailed: 11 },
      { name: "Emack & Bolio's", address: "290  NEWBURY ST", addressDisplay: "290  NEWBURY ST, 02115", zip: "02115", license: "25678", category: "Ice cream", inspections: 43, fails: 17, failRate: 39.5, yearsFailed: 11 },
      { name: "Emack & Bolio's", address: "1  CHELSEA ST", addressDisplay: "1  CHELSEA ST, 02129", zip: "02129", license: "67656", category: "Ice cream", inspections: 43, fails: 15, failRate: 34.9, yearsFailed: 10 },
      { name: "J.P. Licks @ Boylston St.", address: "1106  BOYLSTON ST", addressDisplay: "1106  BOYLSTON ST, 02215", zip: "02215", license: "81090", category: "Ice cream", inspections: 44, fails: 13, failRate: 29.5, yearsFailed: 10 },
      { name: "Ben & Jerry's", address: "174  NEWBURY ST", addressDisplay: "174  NEWBURY ST, 02116", zip: "02116", license: "22630", category: "Ice cream", inspections: 38, fails: 12, failRate: 31.6, yearsFailed: 10 }
    ]
  },
  "Cultural / attraction": {
    repeatN: 13,
    avoid: [
      { name: "Museum of Fine Arts Cafeteria", address: "465  HUNTINGTON AV", addressDisplay: "465  HUNTINGTON AV, 02115", zip: "02115", license: "28124", category: "Cultural / attraction", inspections: 53, fails: 23, failRate: 43.4, yearsFailed: 13 },
      { name: "Museum of Science", address: "10  CHARLES RIVER DM", addressDisplay: "10  CHARLES RIVER DM, 02114", zip: "02114", license: "23721", category: "Cultural / attraction", inspections: 49, fails: 21, failRate: 42.9, yearsFailed: 13 },
      { name: "Fenway Park-Aura Club", address: "4  JERSEY ST", addressDisplay: "4  JERSEY ST, 02215", zip: "02215", license: "24578", category: "Cultural / attraction", inspections: 50, fails: 17, failRate: 34.0, yearsFailed: 12 },
      { name: "GAME ON FENWAY PARK", address: "70  LANSDOWNE", addressDisplay: "70  LANSDOWNE, 02215", zip: "02215", license: "23739", category: "Cultural / attraction", inspections: 55, fails: 28, failRate: 50.9, yearsFailed: 11 },
      { name: "Gardner Museum Cafe", address: "2  PALACE RD", addressDisplay: "2  PALACE RD, 02115", zip: "02115", license: "74435", category: "Cultural / attraction", inspections: 42, fails: 16, failRate: 38.1, yearsFailed: 10 },
      { name: "Museum of Fine Arts New American Cafe", address: "465  HUNTINGTON AV", addressDisplay: "465  HUNTINGTON AV, 02115", zip: "02115", license: "73908", category: "Cultural / attraction", inspections: 43, fails: 15, failRate: 34.9, yearsFailed: 10 },
      { name: "Museum of Fine Arts-465 Bar and Restaurant", address: "465  HUNTINGTON AV", addressDisplay: "465  HUNTINGTON AV, 02215", zip: "02215", license: "19405", category: "Cultural / attraction", inspections: 38, fails: 11, failRate: 28.9, yearsFailed: 10 },
      { name: "NEW ENGLAND AQUARIUM CORP.", address: "250  ATLANTIC AV", addressDisplay: "250  ATLANTIC AV, 02110", zip: "02110", license: "20675", category: "Cultural / attraction", inspections: 22, fails: 9, failRate: 40.9, yearsFailed: 6 },
      { name: "Museum of Fine Arts-Taste D/B/A No. 19285", address: "465  HUNTINGTON AV", addressDisplay: "465  HUNTINGTON AV, 02115", zip: "02115", license: "19285", category: "Cultural / attraction", inspections: 36, fails: 7, failRate: 19.4, yearsFailed: 6 },
      { name: "Fenway Stadium 13", address: "201  BROOKLINE AV", addressDisplay: "201  BROOKLINE AV, 02215", zip: "02215", license: "24725", category: "Cultural / attraction", inspections: 25, fails: 5, failRate: 20.0, yearsFailed: 5 }
    ]
  },
  "Hospital": {
    repeatN: 19,
    avoid: [
      { name: "Brighams & Womens Hospital - Tower Cafe", address: "75  FRANCIS ST", addressDisplay: "75  FRANCIS ST, 02115", zip: "02115", license: "18544", category: "Hospital", inspections: 82, fails: 29, failRate: 35.4, yearsFailed: 12 },
      { name: "N.E. Deaconess Hospital Cafe", address: "1  DEACONESS RD", addressDisplay: "1  DEACONESS RD, 02215", zip: "02215", license: "26029", category: "Hospital", inspections: 67, fails: 20, failRate: 29.9, yearsFailed: 12 },
      { name: "St. Elizabeth's Medical Center", address: "736  CAMBRIDGE ST", addressDisplay: "736  CAMBRIDGE ST, 02135", zip: "02135", license: "74465", category: "Hospital", inspections: 57, fails: 19, failRate: 33.3, yearsFailed: 12 },
      { name: "BRIGHAM & WOMENS FAULKNER HOSPITAL", address: "1153  CENTRE", addressDisplay: "1153  CENTRE, 02130", zip: "02130", license: "18286", category: "Hospital", inspections: 43, fails: 13, failRate: 30.2, yearsFailed: 11 },
      { name: "CHILDRENS HOSPITAL MAIN CAF", address: "300  LONGWOOD AV", addressDisplay: "300  LONGWOOD AV, 02115", zip: "02115", license: "18886", category: "Hospital", inspections: 70, fails: 18, failRate: 25.7, yearsFailed: 10 },
      { name: "CARNEY HOSPITAL", address: "2100  DORCHESTER AV", addressDisplay: "2100  DORCHESTER AV, 02124", zip: "02124", license: "74470", category: "Hospital", inspections: 44, fails: 17, failRate: 38.6, yearsFailed: 8 },
      { name: "CARTER FULLER MENTAL HOSPITAL", address: "85 E NEWTON ST", addressDisplay: "85 E NEWTON ST, 02118", zip: "02118", license: "145991", category: "Hospital", inspections: 39, fails: 17, failRate: 43.6, yearsFailed: 8 },
      { name: "Mass General Hospital Cafe", address: "55  FRUIT ST", addressDisplay: "55  FRUIT ST, 02114", zip: "02114", license: "18550", category: "Hospital", inspections: 52, fails: 9, failRate: 17.3, yearsFailed: 7 },
      { name: "Boston Medical Center (Shapiro Bldg.)", address: "830  HARRISON AV", addressDisplay: "830  HARRISON AV, 02118", zip: "02118", license: "67365", category: "Hospital", inspections: 41, fails: 6, failRate: 14.6, yearsFailed: 5 },
      { name: "Brigham & Womens Hospital d/b/a O'Naturals", address: "70  FRANCIS ST", addressDisplay: "70  FRANCIS ST, 02115", zip: "02115", license: "30323", category: "Hospital", inspections: 19, fails: 8, failRate: 42.1, yearsFailed: 4 }
    ]
  },
  "Hotel": {
    repeatN: 86,
    avoid: [
      { name: "Seaport Hotel", address: "1  SEAPORT LN", addressDisplay: "1  SEAPORT LN, 02210", zip: "02210", license: "20783", category: "Hotel", inspections: 75, fails: 29, failRate: 38.7, yearsFailed: 15 },
      { name: "Colonnade Hotel", address: "120  HUNTINGTON AV", addressDisplay: "120  HUNTINGTON AV, 02116", zip: "02116", license: "18614", category: "Hotel", inspections: 71, fails: 30, failRate: 42.3, yearsFailed: 13 },
      { name: "The Bostonian Boston - A Millennium Hotel", address: "20  NORTH ST", addressDisplay: "20  NORTH ST, 02109", zip: "02109", license: "18649", category: "Hotel", inspections: 83, fails: 36, failRate: 43.4, yearsFailed: 12 },
      { name: "MARRIOTT HOTEL-COPLEY PLACE", address: "110  HUNTINGTON AV", addressDisplay: "110  HUNTINGTON AV, 02116", zip: "02116", license: "19114", category: "Hotel", inspections: 59, fails: 27, failRate: 45.8, yearsFailed: 12 },
      { name: "Four Seasons Hotel Boston", address: "200  BOYLSTON ST", addressDisplay: "200  BOYLSTON ST, 02116", zip: "02116", license: "18140", category: "Hotel", inspections: 69, fails: 25, failRate: 36.2, yearsFailed: 12 },
      { name: "Lenox Hotel (5 Food Serv. Loc.)", address: "704  BOYLSTON ST", addressDisplay: "704  BOYLSTON ST, 02199", zip: "02199", license: "22241", category: "Hotel", inspections: 55, fails: 24, failRate: 43.6, yearsFailed: 12 },
      { name: "BOSTON BACK BAY HILTON", address: "40  DALTON ST", addressDisplay: "40  DALTON ST, 02115", zip: "02115", license: "21118", category: "Hotel", inspections: 54, fails: 27, failRate: 50.0, yearsFailed: 11 },
      { name: "SHERATON BOSTON (R.S./CAFE)", address: "39  DALTON ST", addressDisplay: "39  DALTON ST, 02199", zip: "02199", license: "127712", category: "Hotel", inspections: 53, fails: 27, failRate: 50.9, yearsFailed: 11 },
      { name: "The Liberty Hotel", address: "215  CHARLES ST", addressDisplay: "215  CHARLES ST, 02114", zip: "02114", license: "124860", category: "Hotel", inspections: 45, fails: 20, failRate: 44.4, yearsFailed: 11 },
      { name: "WESTIN COPLEY Place -BAR 10", address: "10  HUNTINGTON AV", addressDisplay: "10  HUNTINGTON AV, 02116", zip: "02116", license: "23572", category: "Hotel", inspections: 52, fails: 18, failRate: 34.6, yearsFailed: 11 }
    ]
  },
  "School": {
    repeatN: 45,
    avoid: [
      { name: "UNIVERSITY HOUSE OF PIZZA", address: "452  HUNTINGTON AV", addressDisplay: "452  HUNTINGTON AV, 02115", zip: "02115", license: "20033", category: "School", inspections: 57, fails: 26, failRate: 45.6, yearsFailed: 15 },
      { name: "Simmons College-Bartol", address: "84  PILGRIM RD", addressDisplay: "84  PILGRIM RD, 02115", zip: "02115", license: "20585", category: "School", inspections: 56, fails: 25, failRate: 44.6, yearsFailed: 13 },
      { name: "Emmanuel College (Muddy River Cafe)", address: "400  FENWAY", addressDisplay: "400  FENWAY, 02115", zip: "02115", license: "27926", category: "School", inspections: 48, fails: 20, failRate: 41.7, yearsFailed: 13 },
      { name: "UNIVERSITY GRILL & PIZZA", address: "712  COMMONWEALTH AV", addressDisplay: "712  COMMONWEALTH AV, 02215", zip: "02215", license: "21100", category: "School", inspections: 37, fails: 14, failRate: 37.8, yearsFailed: 13 },
      { name: "Emmanuel College", address: "400  FENWAY", addressDisplay: "400  FENWAY, 02115", zip: "02115", license: "20052", category: "School", inspections: 62, fails: 27, failRate: 43.5, yearsFailed: 12 },
      { name: "SIMMONS COLLEGE-THE FENS", address: "300  FENWAY", addressDisplay: "300  FENWAY, 02115", zip: "02115", license: "20588", category: "School", inspections: 57, fails: 24, failRate: 42.1, yearsFailed: 12 },
      { name: "Berklee College of Music", address: "160  MASSACHUSETTS AV", addressDisplay: "160  MASSACHUSETTS AV, 02115", zip: "02115", license: "86666", category: "School", inspections: 49, fails: 23, failRate: 46.9, yearsFailed: 12 },
      { name: "FISHER COLLEGE", address: "118  BEACON ST", addressDisplay: "118  BEACON ST, 02116", zip: "02116", license: "20692", category: "School", inspections: 46, fails: 19, failRate: 41.3, yearsFailed: 11 },
      { name: "University Club of Boston", address: "426  STUART ST", addressDisplay: "426  STUART ST, 02116", zip: "02116", license: "18588", category: "School", inspections: 49, fails: 18, failRate: 36.7, yearsFailed: 11 },
      { name: "Dining Hall @Emerson", address: "122  BOYLSTON ST", addressDisplay: "122  BOYLSTON ST, 02116", zip: "02116", license: "364830", category: "School", inspections: 35, fails: 15, failRate: 42.9, yearsFailed: 9 }
    ]
  },
  "Cafe": {
    repeatN: 605,
    avoid: [
      { name: "BOURBON ST. CAFE", address: "417  WASHINGTON ST", addressDisplay: "417  WASHINGTON ST, 02108", zip: "02108", license: "21201", category: "Cafe", inspections: 118, fails: 57, failRate: 48.3, yearsFailed: 15 },
      { name: "Yely's Coffee Shop", address: "284  CENTRE ST", addressDisplay: "284  CENTRE ST, 02130", zip: "02130", license: "20071", category: "Cafe", inspections: 104, fails: 49, failRate: 47.1, yearsFailed: 15 },
      { name: "MCKENNA'S CAFE", address: "109  SAVIN HILL AV", addressDisplay: "109  SAVIN HILL AV, 02125", zip: "02125", license: "23628", category: "Cafe", inspections: 92, fails: 48, failRate: 52.2, yearsFailed: 15 },
      { name: "Bourbon Street Cafe", address: "350  LONGWOOD AV", addressDisplay: "350  LONGWOOD AV, 02215", zip: "02215", license: "29338", category: "Cafe", inspections: 69, fails: 39, failRate: 56.5, yearsFailed: 15 },
      { name: "Minina's Cafe", address: "430  GENEVA AV", addressDisplay: "430  GENEVA AV, 02122", zip: "02122", license: "74391", category: "Cafe", inspections: 73, fails: 38, failRate: 52.1, yearsFailed: 15 },
      { name: "My Thai Cafe Vegetarian & Bubble Tea Bristro", address: "3  BEACH ST", addressDisplay: "3  BEACH ST, 02111", zip: "02111", license: "23643", category: "Cafe", inspections: 69, fails: 31, failRate: 44.9, yearsFailed: 15 },
      { name: "Hong Kong 888 Cafe", address: "888  SOUTH ST", addressDisplay: "888  SOUTH ST, 02131", zip: "02131", license: "80208", category: "Cafe", inspections: 62, fails: 30, failRate: 48.4, yearsFailed: 15 },
      { name: "Jaho Coffee & Tea", address: "1651  WASHINGTON ST", addressDisplay: "1651  WASHINGTON ST, 02118", zip: "02118", license: "75022", category: "Cafe", inspections: 66, fails: 30, failRate: 45.5, yearsFailed: 15 },
      { name: "Nos Casa Cafe", address: "475  DUDLEY ST", addressDisplay: "475  DUDLEY ST, 02119", zip: "02119", license: "74493", category: "Cafe", inspections: 62, fails: 27, failRate: 43.5, yearsFailed: 15 },
      { name: "CAFE MIRROR", address: "362  WASHINGTON ST", addressDisplay: "362  WASHINGTON ST, 02135", zip: "02135", license: "23116", category: "Cafe", inspections: 54, fails: 26, failRate: 48.1, yearsFailed: 15 }
    ]
  },
  "Pharmacy": {
    repeatN: 67,
    avoid: [
      { name: "Walgreens No.  07189", address: "1620  TREMONT ST", addressDisplay: "1620  TREMONT ST, 02120", zip: "02120", license: "25358", category: "Pharmacy", inspections: 55, fails: 27, failRate: 49.1, yearsFailed: 13 },
      { name: "Walgreen's No.  3135", address: "825  MORTON ST", addressDisplay: "825  MORTON ST, 02126", zip: "02126", license: "25011", category: "Pharmacy", inspections: 51, fails: 22, failRate: 43.1, yearsFailed: 12 },
      { name: "CVS Pharmacy No. 1031", address: "4600  WASHINGTON ST", addressDisplay: "4600  WASHINGTON ST, 02131", zip: "02131", license: "34220", category: "Pharmacy", inspections: 37, fails: 21, failRate: 56.8, yearsFailed: 12 },
      { name: "CVS/Pharmacy No. 2070", address: "467  CENTRE ST", addressDisplay: "467  CENTRE ST, 02130", zip: "02130", license: "20126", category: "Pharmacy", inspections: 36, fails: 15, failRate: 41.7, yearsFailed: 12 },
      { name: "CVS/PHARMACY No. 2592", address: "468  BLUE HILL AV", addressDisplay: "468  BLUE HILL AV, 02121", zip: "02121", license: "21565", category: "Pharmacy", inspections: 41, fails: 15, failRate: 36.6, yearsFailed: 12 },
      { name: "Walgreen's No. 3016", address: "416  WARREN ST", addressDisplay: "416  WARREN ST, 02119", zip: "02119", license: "25005", category: "Pharmacy", inspections: 55, fails: 26, failRate: 47.3, yearsFailed: 11 },
      { name: "WALGREEN'S No.  4072", address: "1890  COLUMBUS AV", addressDisplay: "1890  COLUMBUS AV, 02119", zip: "02119", license: "25009", category: "Pharmacy", inspections: 52, fails: 25, failRate: 48.1, yearsFailed: 11 },
      { name: "CVS Pharmacy No. 5464", address: "1575  BLUE HILL AV", addressDisplay: "1575  BLUE HILL AV, 02126", zip: "02126", license: "80426", category: "Pharmacy", inspections: 36, fails: 17, failRate: 47.2, yearsFailed: 11 },
      { name: "Walgreen's No.  09538", address: "2275  WASHINGTON ST", addressDisplay: "2275  WASHINGTON ST, 02119", zip: "02119", license: "25013", category: "Pharmacy", inspections: 58, fails: 24, failRate: 41.4, yearsFailed: 10 },
      { name: "Walgreens No.  06349", address: "583  WASHINGTON ST", addressDisplay: "583  WASHINGTON ST, 02124", zip: "02124", license: "25360", category: "Pharmacy", inspections: 51, fails: 16, failRate: 31.4, yearsFailed: 10 }
    ]
  },
  "Grocery": {
    repeatN: 99,
    avoid: [
      { name: "Go Fresh 365", address: "1102  WASHINGTON ST", addressDisplay: "1102  WASHINGTON ST, 02118", zip: "02118", license: "34585", category: "Grocery", inspections: 111, fails: 58, failRate: 52.3, yearsFailed: 15 },
      { name: "Shaw's Supermarkets No. 602", address: "53  HUNTINGTON AV", addressDisplay: "53  HUNTINGTON AV, 02199", zip: "02199", license: "25674", category: "Grocery", inspections: 85, fails: 42, failRate: 49.4, yearsFailed: 15 },
      { name: "Star Market No. 3588", address: "1065  COMMONWEALTH AV", addressDisplay: "1065  COMMONWEALTH AV, 02215", zip: "02215", license: "25686", category: "Grocery", inspections: 72, fails: 35, failRate: 48.6, yearsFailed: 15 },
      { name: "Stop & Shop No. 412", address: "1622  TREMONT ST", addressDisplay: "1622  TREMONT ST, 02120", zip: "02120", license: "22727", category: "Grocery", inspections: 68, fails: 32, failRate: 47.1, yearsFailed: 15 },
      { name: "Stop & Shop Supermarket No. 004", address: "950  AMERICAN LEGION HW", addressDisplay: "950  AMERICAN LEGION HW, 02136", zip: "02136", license: "31709", category: "Grocery", inspections: 68, fails: 30, failRate: 44.1, yearsFailed: 15 },
      { name: "F & T Davey's Supermarket", address: "438  DUDLEY ST", addressDisplay: "438  DUDLEY ST, 02119", zip: "02119", license: "19236", category: "Grocery", inspections: 59, fails: 25, failRate: 42.4, yearsFailed: 15 },
      { name: "Star Market No. 4587", address: "45  WM T MORRISSEY BL", addressDisplay: "45  WM T MORRISSEY BL, 02122", zip: "02122", license: "25690", category: "Grocery", inspections: 97, fails: 49, failRate: 50.5, yearsFailed: 14 },
      { name: "Super Stop & Shop", address: "1100  MASSACHUSETTS AV", addressDisplay: "1100  MASSACHUSETTS AV, 02125", zip: "02125", license: "24174", category: "Grocery", inspections: 97, fails: 48, failRate: 49.5, yearsFailed: 14 },
      { name: "Shaw's Supermarkets No. 2579", address: "1377  HYDE PARK AV", addressDisplay: "1377  HYDE PARK AV, 02136", zip: "02136", license: "25676", category: "Grocery", inspections: 76, fails: 33, failRate: 43.4, yearsFailed: 14 },
      { name: "Stop & Shop Supermarket No. 075", address: "301  CENTRE ST", addressDisplay: "301  CENTRE ST, 02130", zip: "02130", license: "26027", category: "Grocery", inspections: 68, fails: 31, failRate: 45.6, yearsFailed: 14 }
    ]
  },
  "Food and drinks": {
    repeatN: 2270,
    avoid: [
      { name: "Fan Fan Restaurant", address: "15  HARVARD AV", addressDisplay: "15  HARVARD AV, 02136", zip: "02136", license: "37129", category: "Food and drinks", inspections: 105, fails: 54, failRate: 51.4, yearsFailed: 15 },
      { name: "Bonchon Allston", address: "101  BRIGHTON AV", addressDisplay: "101  BRIGHTON AV, 02134", zip: "02134", license: "78286", category: "Food and drinks", inspections: 109, fails: 53, failRate: 48.6, yearsFailed: 15 },
      { name: "The Real Deal", address: "1882  CENTRE ST", addressDisplay: "1882  CENTRE ST, 02132", zip: "02132", license: "23987", category: "Food and drinks", inspections: 103, fails: 53, failRate: 51.5, yearsFailed: 15 },
      { name: "Yamato Japanese Cuisine", address: "111  CHISWICK RD", addressDisplay: "111  CHISWICK RD, 02135", zip: "02135", license: "74763", category: "Food and drinks", inspections: 99, fails: 49, failRate: 49.5, yearsFailed: 15 },
      { name: "BERTUCCI'S", address: "633  V F W PK", addressDisplay: "633  V F W PK, 02132", zip: "02132", license: "19320", category: "Food and drinks", inspections: 91, fails: 47, failRate: 51.6, yearsFailed: 15 },
      { name: "PARAMOUNT", address: "44  CHARLES ST", addressDisplay: "44  CHARLES ST, 02114", zip: "02114", license: "20157", category: "Food and drinks", inspections: 95, fails: 47, failRate: 49.5, yearsFailed: 15 },
      { name: "Pho Le", address: "1356  DORCHESTER AV", addressDisplay: "1356  DORCHESTER AV, 02122", zip: "02122", license: "68290", category: "Food and drinks", inspections: 92, fails: 47, failRate: 51.1, yearsFailed: 15 },
      { name: "Victoria Seafood", address: "1029  COMMONWEALTH AV", addressDisplay: "1029  COMMONWEALTH AV, 02215", zip: "02215", license: "20579", category: "Food and drinks", inspections: 98, fails: 44, failRate: 44.9, yearsFailed: 15 },
      { name: "PHO 2000", address: "198  ADAMS ST", addressDisplay: "198  ADAMS ST, 02122", zip: "02122", license: "76202", category: "Food and drinks", inspections: 86, fails: 43, failRate: 50.0, yearsFailed: 15 },
      { name: "MERENGUE RESTAURANT", address: "156  BLUE HILL AV", addressDisplay: "156  BLUE HILL AV, 02119", zip: "02119", license: "19901", category: "Food and drinks", inspections: 97, fails: 42, failRate: 43.3, yearsFailed: 15 }
    ]
  },
  "Take-out": {
    repeatN: 1880,
    avoid: [
      { name: "Nhu Lan Fast Food", address: "1155  DORCHESTER AV", addressDisplay: "1155  DORCHESTER AV, 02125", zip: "02125", license: "74834", category: "Take-out", inspections: 103, fails: 51, failRate: 49.5, yearsFailed: 15 },
      { name: "BALE RESTAURANT", address: "1052  DORCHESTER AV", addressDisplay: "1052  DORCHESTER AV, 02125", zip: "02125", license: "22464", category: "Take-out", inspections: 104, fails: 48, failRate: 46.2, yearsFailed: 15 },
      { name: "NEW YORK FRIED CHICKEN & PIZZA", address: "531  COLUMBIA RD", addressDisplay: "531  COLUMBIA RD, 02125", zip: "02125", license: "23286", category: "Take-out", inspections: 90, fails: 48, failRate: 53.3, yearsFailed: 15 },
      { name: "NICOLE'S PIZZA", address: "639  TREMONT ST", addressDisplay: "639  TREMONT ST, 02118", zip: "02118", license: "21851", category: "Take-out", inspections: 83, fails: 48, failRate: 57.8, yearsFailed: 15 },
      { name: "Los Amigos Mexican Grill", address: "1741  CENTRE ST", addressDisplay: "1741  CENTRE ST, 02132", zip: "02132", license: "75844", category: "Take-out", inspections: 103, fails: 47, failRate: 45.6, yearsFailed: 15 },
      { name: "Jen Lai Noodle and Rice Co.", address: "1  FANEUIL HALL MKT PL PL", addressDisplay: "1  FANEUIL HALL MKT PL PL, 02109", zip: "02109", license: "25746", category: "Take-out", inspections: 95, fails: 46, failRate: 48.4, yearsFailed: 15 },
      { name: "Domino's Pizza", address: "205  ADAMS ST", addressDisplay: "205  ADAMS ST, 02122", zip: "02122", license: "79072", category: "Take-out", inspections: 91, fails: 45, failRate: 49.5, yearsFailed: 15 },
      { name: "CHUNG WAH", address: "199  BOWDOIN ST", addressDisplay: "199  BOWDOIN ST, 02122", zip: "02122", license: "22022", category: "Take-out", inspections: 94, fails: 44, failRate: 46.8, yearsFailed: 15 },
      { name: "EL CHALAN", address: "405  CHELSEA ST", addressDisplay: "405  CHELSEA ST, 02128", zip: "02128", license: "20637", category: "Take-out", inspections: 91, fails: 44, failRate: 48.4, yearsFailed: 15 },
      { name: "Comella's", address: "1882  CENTRE ST", addressDisplay: "1882  CENTRE ST, 02132", zip: "02132", license: "24754", category: "Take-out", inspections: 80, fails: 43, failRate: 53.8, yearsFailed: 15 }
    ]
  },
  "Retail food": {
    repeatN: 682,
    avoid: [
      { name: "A C Farm Market", address: "1429  DORCHESTER AV", addressDisplay: "1429  DORCHESTER AV, 02122", zip: "02122", license: "74325", category: "Retail food", inspections: 80, fails: 42, failRate: 52.5, yearsFailed: 15 },
      { name: "GARDEN HALAL MEAT MARKET INC.", address: "88  BLACKSTONE ST", addressDisplay: "88  BLACKSTONE ST, 02108", zip: "02108", license: "25919", category: "Retail food", inspections: 59, fails: 24, failRate: 40.7, yearsFailed: 15 },
      { name: "American Food Basket", address: "942  HYDE PARK AV", addressDisplay: "942  HYDE PARK AV, 02136", zip: "02136", license: "24624", category: "Retail food", inspections: 84, fails: 43, failRate: 51.2, yearsFailed: 14 },
      { name: "Los Caballeros Market Inc.", address: "796  WASHINGTON ST", addressDisplay: "796  WASHINGTON ST, 02124", zip: "02124", license: "22579", category: "Retail food", inspections: 60, fails: 27, failRate: 45.0, yearsFailed: 14 },
      { name: "BAZAAR ON CAMBRIDGE ST.", address: "424  CAMBRIDGE ST", addressDisplay: "424  CAMBRIDGE ST, 02134", zip: "02134", license: "23278", category: "Retail food", inspections: 70, fails: 25, failRate: 35.7, yearsFailed: 14 },
      { name: "Star Markets No. 2576", address: "33  KILMARNOCK ST", addressDisplay: "33  KILMARNOCK ST, 02215", zip: "02215", license: "25671", category: "Retail food", inspections: 55, fails: 24, failRate: 43.6, yearsFailed: 14 },
      { name: "Family Dollar Stores of MA No.  28063", address: "20  CORINTH ST", addressDisplay: "20  CORINTH ST, 02131", zip: "02131", license: "33358", category: "Retail food", inspections: 45, fails: 22, failRate: 48.9, yearsFailed: 14 },
      { name: "Quick Pick Convenience", address: "973  TREMONT ST", addressDisplay: "973  TREMONT ST, 02120", zip: "02120", license: "75276", category: "Retail food", inspections: 55, fails: 22, failRate: 40.0, yearsFailed: 14 },
      { name: "PHU CUONG MARKET(1188 Dor. Ave.)", address: "1188  DORCHESTER AV", addressDisplay: "1188  DORCHESTER AV, 02125", zip: "02125", license: "31901", category: "Retail food", inspections: 70, fails: 36, failRate: 51.4, yearsFailed: 13 },
      { name: "Compadres Meat Market", address: "3101  WASHINGTON ST", addressDisplay: "3101  WASHINGTON ST, 02119", zip: "02119", license: "75938", category: "Retail food", inspections: 58, fails: 29, failRate: 50.0, yearsFailed: 13 }
    ]
  },
  "Mobile food": {
    repeatN: 134,
    avoid: [
      { name: "Tenoch Mexican", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 138469", zip: "02128", license: "138469", category: "Mobile food", inspections: 37, fails: 11, failRate: 29.7, yearsFailed: 9 },
      { name: "BM3:BON ME RED", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 86676", zip: "02128", license: "86676", category: "Mobile food", inspections: 26, fails: 8, failRate: 30.8, yearsFailed: 8 },
      { name: "Chubby Chickpea Mobile", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 77929", zip: "02128", license: "77929", category: "Mobile food", inspections: 61, fails: 16, failRate: 26.2, yearsFailed: 7 },
      { name: "Vanderbilt Food Trolly @107 Ave Louis Pasteur", address: "1  CITYWIDE", addressDisplay: "Mobile (citywide) · License 37237", zip: "02128", license: "37237", category: "Mobile food", inspections: 33, fails: 13, failRate: 39.4, yearsFailed: 7 },
      { name: "Momogoose 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 68113", zip: "02128", license: "68113", category: "Mobile food", inspections: 35, fails: 12, failRate: 34.3, yearsFailed: 7 },
      { name: "Momogoose 3", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 78558", zip: "02128", license: "78558", category: "Mobile food", inspections: 32, fails: 11, failRate: 34.4, yearsFailed: 7 },
      { name: "Momogoose 4", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 76220", zip: "02128", license: "76220", category: "Mobile food", inspections: 31, fails: 10, failRate: 32.3, yearsFailed: 7 },
      { name: "Pennypackers 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 128072", zip: "02128", license: "128072", category: "Mobile food", inspections: 28, fails: 9, failRate: 32.1, yearsFailed: 7 },
      { name: "Roxy's Gourmet Grilled Cheese No. 2", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 74860", zip: "02128", license: "74860", category: "Mobile food", inspections: 45, fails: 9, failRate: 20.0, yearsFailed: 6 },
      { name: "Suya Joint", address: "1  CITYWIDE ST", addressDisplay: "Mobile (citywide) · License 390602", zip: "02128", license: "390602", category: "Mobile food", inspections: 20, fails: 8, failRate: 40.0, yearsFailed: 6 }
    ]
  }
};

type TabId =
  | "summary"
  | "overview"
  | "department"
  | "city"
  | "public"
  | "places"
  | "full";
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
    "Always-pass lists by year and category. Repeat offenders failed in at least two calendar years — two fails in the same year do not count.",
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
  const [catKey, setCatKey] = useCanvasState<string>(
    "places-category",
    "all",
  );
  const win = PLACE_WINDOWS[yearKey];
  const windowCaption = win.ytd
    ? `${win.yearLabel} through 28 August 2026 — not a full year`
    : `${win.yearLabel} complete year`;
  const catPills = [
    { id: "all", label: "All categories" },
    ...OVERLAY_LABELS.filter(
      (lab) => lab in win.byCategory || lab in REPEAT_BY_CATEGORY,
    ).map((lab) => ({ id: lab, label: lab })),
  ];
  const activeCat = catPills.some((p) => p.id === catKey) ? catKey : "all";
  const catAlways =
    activeCat === "all"
      ? win.alwaysPass
      : (win.byCategory[activeCat]?.alwaysPass ?? []);
  const catAlwaysN =
    activeCat === "all"
      ? win.alwaysN
      : (win.byCategory[activeCat]?.alwaysN ?? 0);
  const catAvoid =
    activeCat === "all"
      ? REPEAT_ACROSS
      : (REPEAT_BY_CATEGORY[activeCat]?.avoid ?? []);
  const catRepeatN =
    activeCat === "all"
      ? REPEAT_N_TOTAL
      : (REPEAT_BY_CATEGORY[activeCat]?.repeatN ?? 0);
  const catLabel = activeCat === "all" ? "all categories" : activeCat;

  return (
    <Stack gap={12}>
      <H2>Always-pass by year. Repeat offenders across years.</H2>
      <Text>
        Always-pass is still a year window (2019, 2024, 2025, 2026 YTD):
        at least 3 inspections in that window and zero fails. Repeat
        offender means a fail in at least two calendar years from 2012
        through 2026. Two failed inspections in 2025 count as one year —
        that place is not a repeat offender unless it also failed in
        another year. Be cautious lists the top of those multi-year
        repeats — inspection history, not a skip list. Museums, the
        aquarium, hospitals, schools, hotels, and cultural attractions
        are often destinations or institutions people still use. Use the
        category pills for ice cream, pharmacy, grocery, cafe, museums /
        attractions, food and drinks, take-out, and the rest. Do not
        count 3,347 licenses as inspections.
      </Text>
      <Callout tone="warning" title="Two fails in the same year are not a repeat.">
        Repeat offender = distinct calendar years with a fail. Children&apos;s
        Museum Shop with three 2025 fails and no other year is not on
        this list. Go Fresh 365 failed in 15 years.
      </Callout>
      <Table
        headers={[
          "Window",
          "Always-pass (≥3 inspections, 0 fails)",
        ]}
        columnAlign={["left", "right"]}
        rows={[
          ["2019 complete", "60"],
          ["2024 complete", "328"],
          ["2025 complete", "92"],
          ["2026 YTD through 28 Aug", "49"],
        ]}
        rowTone={["info", "info", "info", "warning"]}
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
        ]}
        valueSuffix=" places"
      />
      <Caption>
        Source: Analyze Boston Food Establishment Inspections · always-pass
        min 3 inspections in the window · 2026 YTD not a full year
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
        inspections · names are cleaned for matching and display: trailing
        Inc/LLC/Corp/Ltd only — not Company in Atlantic Fish Company; @ is
        a location suffix when the tail is a street, hospital, hotel, or
        college, not a trade name (A @ Time, EAST @ WEST). Licenses are
        not merged. Ice cream, Pharmacy, Grocery, Cafe, School, Hotel,
        Hospital, and Cultural / attraction are name overlays — not a
        City cuisine, not extra ISD license types — with word-boundary
        matching (ice cream, gelato, frozen yogurt, creamery; pharmacy /
        drugstore / CVS / Walgreens / Rite Aid; grocery / supermarket)
        plus public ice-cream and grocery roundups joined on brand key.
        Ben &amp; Jerry&apos;s is Ice cream from those sourced pages, not
        from a handwritten brand list. CVS/Pharmacy stays Pharmacy even
        when licensecat is RF. Leftover Retail food is other packaged
        retail. ICE Auto Services and All Spice are not ice cream. 7-Eleven
        is not grocery. School Street is not School. A coffee shop @ a
        hotel is Cafe, not Hotel; generic dining @ a hospital is Hospital.
        FT is Take-out, not Food. 1 CITYWIDE ST is ISD’s placeholder for
        mobile licenses, not a shared physical address. Other /
        unclassified is 0 on this dump. 2026 YTD is not a full year.
      </Caption>
      <H3>Year for always-pass lists</H3>
      <Row gap={8} wrap>
        {PLACE_YEAR_PILLS.map((p) => (
          <span key={p.id}>
            <Pill active={yearKey === p.id} onClick={() => setYearKey(p.id)}>
              {p.label}
            </Pill>
          </span>
        ))}
      </Row>
      <H3>Category — always-pass and repeated fails</H3>
      <Row gap={8} wrap>
        {catPills.map((p) => (
          <span key={p.id}>
            <Pill
              active={activeCat === p.id}
              onClick={() => setCatKey(p.id)}
            >
              {p.label}
            </Pill>
          </span>
        ))}
      </Row>
      {win.ytd ? (
        <Callout tone="danger" title="2026 is not a full year.">
          Always-pass below is 2026 year-to-date through 28 August. Repeat
          offenders still use whole calendar years (2026 counts as one
          year if there was a fail).
        </Callout>
      ) : null}
      <Grid columns={2} gap={16}>
        <Stat
          value={String(catAlwaysN)}
          label={`Always-pass, ${catLabel}, ${windowCaption}`}
          tone="success"
        />
        <Stat
          value={String(catRepeatN)}
          label={`Repeat offenders, ${catLabel} (fail in ≥2 years)`}
          tone="danger"
        />
      </Grid>
      {catAlways.length > 0 ? (
        <Stack gap={8}>
          <H3>
            Always-pass — {catLabel}, {win.yearLabel} (at least 3
            inspections, 0 fails)
          </H3>
          <Table
            headers={["Place", "Address", "Category", "Inspections"]}
            columnAlign={["left", "left", "left", "right"]}
            rows={catAlways.map((p) => [
              p.name,
              placeAddress(p),
              p.category,
              String(p.inspections),
            ])}
          />
          <Caption>
            {`Source: Analyze Boston Food Establishment Inspections · ${windowCaption} · ${catLabel} · always-pass requires at least 3 collapsed visits in this window and zero HE_Fail / HE_FailExt / Fail / Failed / HE_FAILNOR · HE_Filed is not a fail · one lucky pass is excluded · Place is the ISD businessname (raw); name_display in the briefing JSON strips trailing Inc/LLC/Corp/Ltd and @ location suffixes · 1 CITYWIDE ST is ISD’s placeholder for mobile licenses, not a shared physical address · BM3:BON ME RED and Chubby Chickpea can appear on 2024 always-pass and on multi-year repeated fails because the windows differ`}
          </Caption>
        </Stack>
      ) : null}
      {catAvoid.length > 0 ? (
        <Stack gap={8}>
          <H3>
            {cautionHeadline(catLabel)}
          </H3>
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
            rows={catAvoid.map((p) => [
              p.name,
              placeAddress(p),
              p.category,
              String(p.yearsFailed ?? 0),
              String(p.fails),
              String(p.inspections),
            ])}
          />
          <Caption>
            {`Source: Analyze Boston Food Establishment Inspections · 2012–2026 · repeated inspection fails = at least two calendar years with a fail · two fails in the same year count as one year · ranked by years with a fail, then fail count · top 10 · ${catLabel} · ${REPEAT_N_TOTAL.toLocaleString("en-US")} places citywide met this rule · Place is the ISD businessname (raw); name_display in the briefing JSON strips trailing Inc/LLC/Corp/Ltd · not a City cuisine field · 1 CITYWIDE ST is ISD’s placeholder for mobile licenses, not a shared physical address.${cautionNote(catLabel)}`}
          </Caption>
        </Stack>
      ) : null}
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
          [
            "Repeat offender = fail in ≥2 calendar years",
            "Two fails in the same year count as one year. Always-pass still uses the year window.",
          ],
          [
            "Names: strip Inc/LLC/Corp/Ltd, not Company",
            "Atlantic Fish Company keeps Company. @ is a location only after a street/hospital/hotel/college. A @ Time is a trade name. Ice cream, Pharmacy, and Grocery are not City license types.",
          ],
        ]}
        rowTone={["success", "warning", "danger", "warning", "warning", "info", "warning", "warning", "info"]}
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
        Places for always-pass by year and category, and repeat offenders
        who failed in at least two calendar years.
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
      <Callout tone="info" title="Always-pass is by year. Repeats are by calendar year.">
        Open Places. Always-pass uses 2019 / 2024 / 2025 / 2026 YTD with
        a category pill. Repeat offenders failed in at least two calendar
        years — two fails in 2025 are not enough. Category pills cover
        ice cream, pharmacy, grocery, cafe, museums, food and drinks,
        take-out, and the rest. Repeated fails are a reason to be
        cautious, not a skip list.
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
