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
  "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020",
  "2021", "2022", "2023", "2024",
];

const VOLUME = [
  37290, 39356, 41058, 46332, 46039, 46255, 49360, 48862, 43946, 48274, 53428,
  58185, 60096,
];
const FIRES = [
  5609, 5751, 5651, 5960, 5996, 5455, 4798, 4458, 4612, 3878, 4298, 3842, 3716,
];
const BUILDING = [
  491, 479, 449, 428, 476, 405, 378, 374, 362, 369, 350, 305, 354,
];
const FALSE_ALARMS = [
  12264, 13598, 14032, 14874, 15336, 15953, 17640, 18044, 15927, 17835, 19494,
  20807, 21752,
];
const SERVICE = [
  9147, 10000, 10867, 13458, 11669, 11740, 14308, 14249, 13686, 16373, 19772,
  25126, 25931,
];
const GOOD_INTENT = [
  6406, 6290, 7063, 8233, 7717, 8305, 8426, 8618, 6874, 7679, 7132, 5742, 6326,
];
const HAZARD = [
  3746, 3591, 3282, 3625, 3923, 3750, 3868, 3260, 2627, 2283, 2484, 2362, 2132,
];
const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_ALL = [
  1753, 1538, 1331, 1119, 1033, 1197, 1461, 1962, 2535, 2904, 3266, 3645, 3532,
  3392, 3388, 3240, 3429, 3163, 3190, 3099, 2878, 2618, 2436, 1987,
];
const HOUR_FIRE = [
  100, 66, 45, 40, 43, 43, 59, 81, 107, 156, 160, 184, 223, 224, 229, 223, 237,
  235, 286, 279, 226, 204, 146, 120,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2024 = [
  4737, 3953, 4473, 4335, 4953, 5492, 5717, 5687, 5302, 5415, 4881, 5151,
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2024 = [8657, 8911, 8678, 8726, 8791, 8422, 7911];

const AREA_FIRE = {
  Dorchester: [1178, 1229, 1294, 1379, 1335, 1247, 1147, 1049, 1107, 892, 990, 889, 830],
  Fenway: [692, 723, 609, 647, 583, 568, 464, 495, 408, 369, 393, 361, 308],
  Roxbury: [583, 569, 561, 604, 557, 521, 471, 441, 421, 353, 406, 379, 356],
  AllstonBrighton: [540, 508, 552, 624, 572, 498, 434, 390, 438, 355, 380, 346, 320],
  Downtown: [414, 463, 401, 418, 506, 422, 351, 293, 279, 240, 278, 226, 242],
  Mattapan: [237, 287, 234, 248, 264, 235, 210, 217, 194, 181, 244, 233, 241],
};
const AREA_VOLUME = {
  Dorchester: [6750, 7313, 7332, 8193, 8852, 8544, 8534, 8476, 8093, 9123, 9742, 10832, 10919],
  Downtown: [4325, 4858, 5385, 6219, 5844, 5628, 6057, 6214, 4646, 5495, 6197, 6901, 7109],
  Roxbury: [3279, 3180, 3187, 3908, 3976, 4066, 4304, 4072, 3936, 4071, 4712, 5333, 5804],
  Fenway: [3685, 3804, 3689, 3937, 4040, 4092, 4386, 4310, 3145, 3583, 4108, 4555, 4422],
  AllstonBrighton: [3053, 3023, 3346, 3765, 3488, 3725, 3818, 3657, 3525, 3778, 3940, 4332, 4669],
};
const DORCHESTER_MIX = {
  service: [1912, 2080, 2125, 2437, 2247, 2021, 2546, 2455, 2504, 3181, 3830, 4816, 4715],
  falseAlarm: [1750, 2041, 2007, 2159, 2224, 2427, 2628, 2902, 2648, 3127, 3323, 3687, 3835],
  goodIntent: [1214, 1206, 1308, 1499, 1371, 1521, 1478, 1424, 1308, 1383, 1113, 961, 1125],
  fire: [1178, 1229, 1294, 1379, 1335, 1247, 1147, 1049, 1107, 892, 990, 889, 830],
  hazard: [686, 739, 586, 695, 764, 691, 697, 621, 495, 504, 452, 443, 383],
};
const FIRE_FAMILY = {
  cooking: [3596, 3719, 3742, 3625, 3578, 3626, 3310, 3080, 2805, 2448, 2475, 2482, 2355],
  building: [521, 507, 460, 466, 497, 424, 394, 400, 393, 404, 384, 328, 370],
  trash: [564, 512, 449, 543, 606, 503, 362, 449, 616, 449, 532, 457, 432],
  vegetation: [457, 489, 482, 810, 837, 459, 303, 241, 515, 307, 640, 292, 304],
  vehicle: [273, 292, 294, 305, 248, 216, 235, 193, 176, 178, 180, 190, 156],
};
const COOKING = [3319, 3453, 3536, 3440, 3398, 3431, 3124, 2880, 2599, 2289, 2304, 2290, 2174];
const LOSS_M = [
  53.3, 48.0, 38.6, 28.6, 47.8, 74.7, 35.7, 51.2, 34.8, 38.7, 41.1, 34.9, 44.9,
];
const BLDG_LOSS_M = [
  49.6, 33.7, 34.6, 25.0, 43.4, 71.0, 32.8, 46.8, 32.6, 35.8, 37.2, 30.0, 41.4,
];
const CUM_LOSS_M = [53, 101, 140, 169, 216, 291, 327, 378, 413, 451, 492, 527, 572];
const BLDG_AREA = {
  Dorchester: [132, 139, 126, 116, 131, 121, 121, 97, 121, 124, 107, 92, 92],
  Roxbury: [53, 49, 37, 35, 42, 41, 38, 49, 37, 26, 32, 30, 40],
  AllstonBrighton: [40, 41, 32, 32, 37, 26, 25, 20, 34, 32, 29, 29, 30],
  JamaicaPlain: [32, 31, 26, 28, 35, 22, 22, 40, 20, 23, 22, 17, 30],
  Downtown: [29, 35, 25, 36, 50, 22, 23, 26, 14, 25, 11, 13, 27],
  EastBoston: [31, 24, 31, 40, 31, 33, 11, 13, 18, 15, 15, 15, 12],
  Mattapan: [24, 18, 14, 17, 16, 17, 27, 20, 17, 21, 22, 25, 23],
};

type TabId = "summary" | "overview" | "department" | "city" | "public" | "efficiency" | "full";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Overview" },
  { id: "department", label: "Department" },
  { id: "city", label: "City / Mayor" },
  { id: "public", label: "Public" },
  { id: "efficiency", label: "Efficiency / OT" },
  { id: "full", label: "Full analysis" },
];

const TAB_BLURB: Record<TabId, string> = {
  summary: "Five findings. Numbers a reader can take into a meeting.",
  overview: "Citywide demand, mix, and data coverage, 2012–2025.",
  department:
    "What Operations, Prevention, and the houses need: when we run, which districts, which streets, which fire types.",
  city: "What the Mayor and Council need: safety trend, equity, dollars, and decisions.",
  public:
    "Plain language: are fires down, why trucks still roll, what to watch at home.",
  efficiency:
    "What Tokyo, London, FDNY and UK brigades do that Boston can copy. 2025 overtime and headcount, with January–February 2025 incidents (the complete months on file).",
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
      <H2>Demand is up. Fire is not what grew.</H2>
      <Text>
        After a 2020 dip, volume climbed through 2024. Service calls nearly
        tripled. False alarms rose 77%. Fires are at a 13-year low.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Primary incidents per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            fill
            series={[{ name: "Incidents", data: VOLUME, tone: "info" }]}
          />
          <Caption>Source: BFD open files · 2012–2024 · Boston primary incidents</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Fires vs building fires</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[
              { name: "All fires", data: FIRES, tone: "warning" },
              { name: "Building fires (111)", data: BUILDING, tone: "danger" },
            ]}
          />
          <Caption>Source: NFIRS · 2012–2024 · building fire = code 111</Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionMix() {
  return (
    <Stack gap={12}>
      <H3>What we responded to — share of incidents by year</H3>
      <BarChart
        categories={YEARS}
        height={260}
        stacked
        normalized
        series={[
          { name: "Service call", data: SERVICE, tone: "info" },
          { name: "False alarm / false call", data: FALSE_ALARMS, tone: "warning" },
          { name: "Good intent", data: GOOD_INTENT, tone: "neutral" },
          { name: "Hazardous condition", data: HAZARD },
          { name: "Fire", data: FIRES, tone: "danger" },
        ]}
      />
      <Caption>
        Source: NFIRS series · 2012–2024 · weather / special / overpressure under
        0.5% omitted
      </Caption>
      <Grid columns="1.1fr 0.9fr" gap={24}>
        <Stack gap={8}>
          <H3>2024 mix</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Service call", value: 25931, tone: "info" },
              { label: "False alarm", value: 21752, tone: "warning" },
              { label: "Good intent", value: 6326, tone: "neutral" },
              { label: "Fire", value: 3716, tone: "danger" },
              { label: "Hazardous condition", value: 2132 },
              { label: "Other", value: 239 },
            ]}
          />
          <Caption>Source: 2024 Boston primary incidents (n = 60,096)</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>How the job changed, 2012 → 2024</H3>
          <Table
            headers={["Category", "2012", "2024", "Change"]}
            columnAlign={["left", "right", "right", "right"]}
            rows={[
              ["All incidents", "37,290", "60,096", "+61%"],
              ["Service call", "24.5%", "43.1%", "+183% count"],
              ["False alarm", "32.9%", "36.2%", "+77% count"],
              ["Fire", "15.0%", "6.2%", "−34% count"],
              ["Building fire (111)", "491", "354", "−28%"],
              ["Hazardous condition", "10.0%", "3.5%", "−43% count"],
            ]}
            rowTone={["info", "info", "warning", "success", "success", undefined]}
          />
        </Stack>
      </Grid>
      <H3>2025 vs 2024 — January and February only</H3>
      <Text>
        2025 is not a complete incident year. The extract has January–February,
        1–10 March, and 19–31 December. These two months are complete in both
        years and use the same NFIRS codes.
      </Text>
      <Table
        headers={["Category", "Jan–Feb 2024", "Jan–Feb 2025", "Change"]}
        columnAlign={["left", "right", "right", "right"]}
        rows={[
          ["Boston primaries", "8,661", "8,521", "−2%"],
          ["Fires", "564 (6.5%)", "601 (7.1%)", "+37"],
          ["False alarm", "3,159 (36.5%)", "3,187 (37.4%)", "same mix"],
          ["Service call", "3,677 (42.5%)", "3,373 (39.6%)", "−8%"],
          ["Public service (553)", "2,382", "2,298", "−4%"],
          ["Building fire (111)", "59", "51", "−8"],
        ]}
        rowTone={["info", "success", "warning", "info", "info", "success"]}
      />
      <Caption>
        Source: same ZIP-filtered Boston primaries as 2012–2024 · 2025 full-year
        payroll is on the Efficiency / OT tab
      </Caption>
    </Stack>
  );
}

function SectionDorchester() {
  return (
    <Stack gap={12}>
      <H2>Thirteen years, one neighborhood</H2>
      <Text>
        ZIP-mapped areas (Dorchester includes 02121 Grove Hall). Ranked every
        year 2012–2024, and every 2025 window on file. The leader never changed.
      </Text>
      <Callout tone="danger" title="Dorchester is #1 for fires and volume in every year we have.">
        112,703 incidents and 14,566 fires in 2012–2024 — 18% of runs, 23% of
        fires, 29% of building fires, $172M estimated loss. Fires there are
        falling. The rank is not.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="13 / 13" label="Years as #1 for fires" tone="danger" />
        <Stat value="14,566" label="Dorchester fires, 2012–2024" />
        <Stat value="1,519" label="Building fires — 29% of Boston" tone="danger" />
        <Stat value="$172M" label="Estimated loss in Dorchester" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Fires by neighborhood</H3>
          <LineChart
            categories={YEARS}
            height={240}
            series={[
              { name: "Dorchester", data: AREA_FIRE.Dorchester, tone: "danger" },
              { name: "Fenway / Longwood / Kenmore", data: AREA_FIRE.Fenway, tone: "warning" },
              { name: "Roxbury", data: AREA_FIRE.Roxbury, tone: "info" },
              { name: "Allston-Brighton", data: AREA_FIRE.AllstonBrighton },
              { name: "Downtown core", data: AREA_FIRE.Downtown, tone: "neutral" },
              { name: "Mattapan", data: AREA_FIRE.Mattapan },
            ]}
          />
          <Caption>Source: NFIRS 100-series · zip-mapped area · 2012–2024</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>All incidents by neighborhood</H3>
          <LineChart
            categories={YEARS}
            height={240}
            series={[
              { name: "Dorchester", data: AREA_VOLUME.Dorchester, tone: "danger" },
              { name: "Downtown core", data: AREA_VOLUME.Downtown, tone: "neutral" },
              { name: "Roxbury", data: AREA_VOLUME.Roxbury, tone: "info" },
              { name: "Fenway / Longwood / Kenmore", data: AREA_VOLUME.Fenway, tone: "warning" },
              { name: "Allston-Brighton", data: AREA_VOLUME.AllstonBrighton },
            ]}
          />
          <Caption>Source: Boston primary incidents · 2012–2024</Caption>
        </Stack>
      </Grid>
      <H3>Who was #1 each year</H3>
      <Table
        headers={["Year", "#1 volume", "Runs", "#1 fires", "Fires"]}
        columnAlign={["left", "left", "right", "left", "right"]}
        striped
        rows={[
          ["2012", "Dorchester", "6,750", "Dorchester", "1,178"],
          ["2013", "Dorchester", "7,313", "Dorchester", "1,229"],
          ["2014", "Dorchester", "7,332", "Dorchester", "1,294"],
          ["2015", "Dorchester", "8,193", "Dorchester", "1,379"],
          ["2016", "Dorchester", "8,852", "Dorchester", "1,335"],
          ["2017", "Dorchester", "8,544", "Dorchester", "1,247"],
          ["2018", "Dorchester", "8,534", "Dorchester", "1,147"],
          ["2019", "Dorchester", "8,476", "Dorchester", "1,049"],
          ["2020", "Dorchester", "8,093", "Dorchester", "1,107"],
          ["2021", "Dorchester", "9,123", "Dorchester", "892"],
          ["2022", "Dorchester", "9,742", "Dorchester", "990"],
          ["2023", "Dorchester", "10,832", "Dorchester", "889"],
          ["2024", "Dorchester", "10,919", "Dorchester", "830"],
          ["2025 (1 Jan–10 Mar)", "Dorchester", "1,755", "Dorchester", "142"],
          ["2025 (19–31 Dec added)", "Dorchester", "375", "Dorchester", "24"],
        ]}
        rowTone={[
          "danger", "danger", "danger", "danger", "danger", "danger", "danger",
          "danger", "danger", "danger", "danger", "danger", "danger", "info",
          "info",
        ]}
      />
      <Caption>
        Source: zip-mapped neighborhoods · 2025 still missing 11 March–18
        December · Dorchester 2,130 incidents and 166 fires across all 2025
        records on file
      </Caption>
      <H3>Dorchester’s mix over time</H3>
      <BarChart
        categories={YEARS}
        height={240}
        stacked
        series={[
          { name: "Service call", data: DORCHESTER_MIX.service, tone: "info" },
          { name: "False alarm / false call", data: DORCHESTER_MIX.falseAlarm, tone: "warning" },
          { name: "Good intent", data: DORCHESTER_MIX.goodIntent, tone: "neutral" },
          { name: "Fire", data: DORCHESTER_MIX.fire, tone: "danger" },
          { name: "Hazardous condition", data: DORCHESTER_MIX.hazard },
        ]}
      />
      <Caption>Source: Dorchester ZIPs 02121, 02122, 02124, 02125 · 2012–2024</Caption>
    </Stack>
  );
}

function SectionCommonFire() {
  return (
    <Stack gap={12}>
      <H2>Common fire issues — every neighborhood, every year</H2>
      <Callout tone="danger" title="Cooking fire is the common issue. Building fire is the costly one.">
        Confined cooking (113) is 38,237 fires — 60% of all fires, and #1 in
        all 16 neighborhoods. Those stay in the pan ($6.3M). Building fires
        are 8% of fires and 90% of the dollars.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="60%" label="Fires that are cooking (113)" tone="danger" />
        <Stat value="16 / 16" label="Neighborhoods where cooking is #1" />
        <Stat value="65%" label="Fires in residential property" />
        <Stat value="8%" label="Fires that are building fires (111)" />
      </Grid>
      <H3>Fire families citywide, 2012–2024</H3>
      <BarChart
        categories={YEARS}
        height={250}
        stacked
        series={[
          { name: "Cooking / confined (113–118)", data: FIRE_FAMILY.cooking, tone: "danger" },
          { name: "Outside trash / dumpster", data: FIRE_FAMILY.trash, tone: "warning" },
          { name: "Brush / grass / vegetation", data: FIRE_FAMILY.vegetation },
          { name: "Building / structure (111–112)", data: FIRE_FAMILY.building, tone: "info" },
          { name: "Vehicle", data: FIRE_FAMILY.vehicle, tone: "neutral" },
        ]}
      />
      <Caption>Source: NFIRS 100-series · Boston ZIP · 2012–2024 · n = 63,830 fires</Caption>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Cooking vs building fire</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[
              { name: "Cooking, confined (113)", data: COOKING, tone: "danger" },
              { name: "Building fire (111)", data: BUILDING, tone: "info" },
            ]}
          />
          <Caption>Cooking 3,319 → 2,174 · building 491 → 352 · rank never flipped</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>How common across 16 areas</H3>
          <Table
            headers={["Fire type", "Fires", "Top 3 in"]}
            columnAlign={["left", "right", "right"]}
            rows={[
              ["Cooking, confined (113)", "38,237", "16 of 16 — #1 in all"],
              ["Building fire (111)", "5,210", "15 of 16"],
              ["Outside trash (151)", "3,782", "8 of 16"],
              ["Brush (142)", "3,105", "5 of 16"],
              ["Passenger vehicle (131)", "2,522", "2 of 16"],
            ]}
            rowTone={["danger", "danger", "warning", undefined, undefined]}
          />
        </Stack>
      </Grid>
      <Table
        headers={["Fire family", "Fires 2012–2024", "Share", "Est. loss"]}
        columnAlign={["left", "right", "right", "right"]}
        rows={[
          ["Cooking / confined (mostly 113)", "40,841", "64%", "$6.3M"],
          ["Outside trash / dumpster", "6,474", "10%", "$0.5M"],
          ["Brush / grass / vegetation", "6,136", "10%", "$1.2M"],
          ["Building / structure", "5,548", "9%", "$516M"],
          ["Vehicle", "2,936", "5%", "$33M"],
        ]}
        rowTone={["danger", undefined, undefined, "danger", "warning"]}
      />
    </Stack>
  );
}

function SectionBuildingArea() {
  return (
    <Stack gap={12}>
      <H2>Building fires by neighborhood</H2>
      <Text>
        Code 111 — the fires that hold 90% of estimated loss. Dorchester is #1
        every year, including 2025 year-to-date (18 of 62).
      </Text>
      <LineChart
        categories={YEARS}
        height={250}
        series={[
          { name: "Dorchester", data: BLDG_AREA.Dorchester, tone: "danger" },
          { name: "Roxbury", data: BLDG_AREA.Roxbury, tone: "warning" },
          { name: "Allston-Brighton", data: BLDG_AREA.AllstonBrighton, tone: "info" },
          { name: "Jamaica Plain", data: BLDG_AREA.JamaicaPlain },
          { name: "Downtown core", data: BLDG_AREA.Downtown, tone: "neutral" },
          { name: "East Boston", data: BLDG_AREA.EastBoston },
          { name: "Mattapan", data: BLDG_AREA.Mattapan },
        ]}
      />
      <Caption>
        Source: NFIRS 111 · 2012–2024 · Dorchester never below 92; no other area
        ever reaches 54
      </Caption>
      <Table
        headers={["Area", "Building fires", "Share", "#1 years", "Est. loss"]}
        columnAlign={["left", "right", "right", "right", "right"]}
        striped
        rows={[
          ["Dorchester", "1,519", "29%", "13 of 13", "$162M"],
          ["Roxbury", "509", "10%", "0", "$36M"],
          ["Allston-Brighton", "407", "8%", "0", "$42M"],
          ["Jamaica Plain", "348", "7%", "0", "$15M"],
          ["Downtown core", "336", "6%", "0", "$29M"],
          ["East Boston", "289", "6%", "0", "$50M"],
          ["Fenway / Longwood / Kenmore", "271", "5%", "0", "$42M"],
          ["Mattapan", "261", "5%", "0", "$23M"],
          ["Hyde Park", "223", "4%", "0", "$18M"],
          ["South Boston", "217", "4%", "0", "$19M"],
        ]}
        rowTone={["danger", "warning", undefined, undefined, undefined, "warning", undefined, undefined, undefined, undefined]}
      />
      <Caption>
        Source: 5,210 building fires 2012–2024 · East Boston is 6% of count and
        ~10% of dollars
      </Caption>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>When companies are running</H2>
      <Text>
        Total demand peaks at 11 a.m. Actual fires peak at 6–7 p.m. (cooking).
        Sunday is lightest. July–August are heaviest.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2024 incidents by hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "All incidents", data: HOUR_ALL, tone: "info" }]}
          />
          <Caption>Quietest 4 a.m. (1,033) · peak 11 a.m. (3,645)</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2024 fires by hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "Fires", data: HOUR_FIRE, tone: "danger" }]}
          />
          <Caption>Peak 6 p.m. (286) · overnight trough 3–5 a.m.</Caption>
        </Stack>
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2024 by weekday</H3>
          <BarChart
            categories={WEEKDAYS}
            height={180}
            series={[{ name: "Incidents", data: WEEKDAY_2024, tone: "info" }]}
          />
          <Caption>Source: 2024 · Tuesday 8,911 · Sunday 7,911</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2024 by month</H3>
          <BarChart
            categories={MONTHS}
            height={180}
            series={[{ name: "Incidents", data: MONTH_2024, tone: "info" }]}
          />
          <Caption>July 5,717 peak · February 3,953</Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionWorkload() {
  return (
    <Stack gap={12}>
      <H2>What the houses actually run on</H2>
      <Text>
        2024’s top codes are not fires. Public service (553) is 18,214 runs.
        False alarms are the second workload. Cooking is the first fire type,
        rank 8 overall.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Most frequent 2024 types</H3>
          <Table
            headers={["Code", "Type", "Count"]}
            columnAlign={["left", "left", "right"]}
            rows={[
              ["553", "Public service", "18,214"],
              ["745", "Alarm activation, no fire", "5,978"],
              ["600", "Good intent, other", "4,117"],
              ["743", "Smoke detector, no fire", "4,089"],
              ["714", "Malicious false alarm (central st.)", "2,821"],
              ["554", "Assist invalid", "2,593"],
              ["735", "Alarm malfunction", "2,358"],
              ["113", "Cooking fire, confined", "2,180"],
              ["733", "Smoke detector malfunction", "1,379"],
              ["552", "Police matter", "1,177"],
            ]}
            rowTone={[
              "info", "warning", undefined, "warning", "warning", "info",
              "warning", "danger", "warning", undefined,
            ]}
            striped
          />
        </Stack>
        <Stack gap={8}>
          <H3>2024 fire types</H3>
          <BarChart
            horizontal
            height={260}
            categories={[
              "Cooking, confined (113)",
              "Building fire (111)",
              "Outside trash (151)",
              "Brush (142)",
              "Passenger vehicle (131)",
              "Contained trash (118)",
            ]}
            series={[{ name: "2024 fires", data: [2180, 354, 291, 167, 135, 123], tone: "danger" }]}
          />
          <Caption>3,716 fires · cooking 59% · 1,030 of cooking fires in multifamily</Caption>
        </Stack>
      </Grid>
      <H3>Repeat false-alarm streets, 2024</H3>
      <Table
        headers={["Street (ZIP)", "False alarms"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Commonwealth (02215 Fenway)", "215"],
          ["Broadway (02127 South Boston)", "195"],
          ["Huntington (02115 Longwood)", "191"],
          ["Boylston (02116 Back Bay)", "184"],
          ["Centre (02130 Jamaica Plain)", "181"],
          ["Harrison (02118 South End)", "181"],
          ["River (02126 Mattapan)", "168"],
          ["Washington (02135 Brighton)", "167"],
        ]}
        rowTone={["warning", undefined, "warning", "warning", undefined, undefined, undefined, undefined]}
      />
      <Caption>Source: 2024 false-alarm series · street + ZIP, not a single address</Caption>
      <H3>Fire district workload, 2024</H3>
      <Table
        headers={["District", "Incidents", "Fires", "Fire %"]}
        columnAlign={["left", "right", "right", "right"]}
        rows={[
          ["4  Back Bay / Fenway / South End", "10,737", "605", "5.6%"],
          ["9  Roxbury / Mission Hill", "8,695", "566", "6.5%"],
          ["3  Downtown / North End", "7,790", "274", "3.5%"],
          ["7  Dorchester", "7,545", "496", "6.6%"],
          ["6  South Boston", "5,859", "328", "5.6%"],
          ["11 Allston-Brighton", "4,917", "332", "6.8%"],
          ["8  Mattapan / Dorchester", "4,138", "334", "8.1%"],
          ["12 Hyde Park", "4,135", "369", "8.9%"],
          ["10 West Roxbury / Roslindale", "3,380", "251", "7.4%"],
          ["1  East Boston", "2,899", "161", "5.6%"],
        ]}
        rowTone={[
          "info", undefined, undefined, undefined, undefined, undefined,
          "danger", "danger", undefined, undefined,
        ]}
      />
      <Caption>District 4 is busiest. Districts 8 and 12 have the highest fire share.</Caption>
      <Text>
        Still in the hazard pile: 425 carbon monoxide incidents and 392 gas
        leaks in 2024. Those are not fires. Minutes still matter.
      </Text>
    </Stack>
  );
}

function SectionLoss() {
  return (
    <Stack gap={12}>
      <H2>Total loss, 2012–2024</H2>
      <Text>
        NFIRS estimated property plus content — officer’s figure, not insurance.
        18,380 incidents reported any dollars.
      </Text>
      <Grid columns={4} gap={16}>
        <Stat value="$572M" label="Total estimated loss, 2012–2024" tone="danger" />
        <Stat value="$8.1M" label="2025 estimated loss on file" />
        <Stat value="$514M" label="From building fires (90%)" tone="danger" />
        <Stat value="$6.3M" label="From cooking / confined fires" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Loss by year ($ millions)</H3>
          <BarChart
            categories={YEARS}
            height={210}
            series={[
              { name: "All estimated loss", data: LOSS_M, tone: "neutral" },
              { name: "Building-fire loss", data: BLDG_LOSS_M, tone: "danger" },
            ]}
          />
          <Caption>2017 ($75M) is a few large building fires, not a new baseline</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Cumulative estimated loss ($ millions)</H3>
          <LineChart
            categories={YEARS}
            height={210}
            fill
            series={[{ name: "Running total", data: CUM_LOSS_M, tone: "danger" }]}
          />
          <Caption>$572M through 2024 · plus $8.1M in 2025 on file · 2025 year is incomplete</Caption>
        </Stack>
      </Grid>
      <Table
        headers={["Where the $572M sat", "Estimated loss", "Share"]}
        columnAlign={["left", "right", "right"]}
        rows={[
          ["Building fires (111)", "$514M", "90%"],
          ["Vehicle fires", "$33M", "6%"],
          ["Cooking / confined fires", "$6.3M", "1%"],
          ["All other incidents", "$19M", "3%"],
          ["Dorchester (all types)", "$172M", "30%"],
          ["East Boston", "$53M", "9%"],
          ["Allston-Brighton", "$44M", "8%"],
          ["Property (vs contents)", "$483M of $572M", "84%"],
        ]}
        rowTone={["danger", "warning", undefined, undefined, "danger", undefined, undefined, undefined]}
      />
      <Table
        headers={["Date", "Type", "Neighborhood", "Property", "Est. loss"]}
        columnAlign={["left", "left", "left", "left", "right"]}
        rows={[
          ["2024-04-02", "Building fire", "East Boston", "Multifamily", "$5.1M"],
          ["2024-06-24", "Building fire", "Back Bay", "Other property use", "$4.0M"],
          ["2024-06-15", "Building fire", "Dorchester", "Multifamily", "$2.1M"],
          ["2024-06-26", "Building fire", "Mission Hill", "Bar / nightclub", "$2.0M"],
          ["2024-03-02", "Building fire", "Allston", "Multifamily", "$2.0M"],
        ]}
        rowTone={["danger", "danger", "danger", "danger", "danger"]}
      />
      <Caption>Largest 2024 estimated-loss jobs · not independently audited</Caption>
    </Stack>
  );
}

function SectionQuality() {
  return (
    <Stack gap={12}>
      <H2>What was cleaned</H2>
      <Text>
        Five source files: 2012 and 2013 BFD extracts, the 2014–2025 open-data
        file, an updated extract that adds 19–31 December 2025 (and 2026, not
        used on Efficiency), plus NFIRS incident-type and property-use lists.
        Kept: valid incident number, parseable date, three-digit incident type,
        non-negative loss under $50M.
      </Text>
      <Table
        headers={["Quality check", "Records"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Raw rows (all files)", "641,615"],
          ["Kept after cleaning", "631,890"],
          ["Dropped — invalid incident type", "9,706"],
          ["Dropped — duplicate incident + exposure", "19"],
          ["Primary incidents (exposure 0)", "631,585"],
          ["Boston geography used here", "628,291"],
          ["2024 Boston primaries", "60,096"],
          ["2025 Boston primaries on file", "11,480"],
          ["2025 windows on file", "Jan–Feb, 1–10 Mar, 19–31 Dec"],
        ]}
      />
      <Text size="small" tone="secondary">
        2012–2013 neighborhood field is blank; geography is zip-mapped. City
        section “BO” was not used because it collapses Back Bay, Fenway, South
        End, and downtown. Boston EMS is a separate system — almost no 300-series
        in these files. Estimated loss is not an audited total. Drop rate 1.52%
        on the 2012–March 2025 clean. 2025 is not a complete year: 11 March–18
        December is still missing. Do not annualize 11,480 into a 2025 total.
        19–31 December uses different close codes (500/641/740), so mix tables
        use January–February only.
      </Text>
    </Stack>
  );
}

function SectionAsksCity() {
  return (
    <Stack gap={12}>
      <H2>Decisions for the Mayor and Council</H2>
      <Callout tone="danger" title="1. Do not trade fire companies for the mix shift">
        Building fires are down, not gone: 354 in 2024, $41.5M that year,
        $514M over 13 years. Districts 8 and 12 still show the highest fire
        share. A 6% fire rate is not a staffing formula.
      </Callout>
      <Callout tone="warning" title="2. Put a price on chronic automatic alarms">
        21,752 false alarms in 2024. Fenway, Back Bay, Longwood, and repeat
        streets (Commonwealth, Huntington, Boylston). Inspection, repair
        orders, escalating fees after repeated unintentional activations.
      </Callout>
      <Callout tone="info" title="3. Decide what public service belongs to Fire">
        18,214 code-553 runs plus 2,593 assist-invalid calls. Some is
        life-safety. Much is lockouts, water, and lift assists that 311, EMS,
        or a community team could take. Each one still leaves a district uncovered.
      </Callout>
      <Callout tone="success" title="4. Fund cooking-fire prevention first in Dorchester">
        #1 fire neighborhood every year since 2012. 8,570 cooking fires in
        homes there. Then Roxbury, Allston-Brighton, and Mattapan — not a
        citywide pamphlet drop.
      </Callout>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={20}>
      <Callout tone="warning" title="We are busier. Boston is not burning more.">
        Responses +61% since 2012. Fires −34%. Building fires −28%. Four in
        five 2024 runs were service calls or false alarms.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="60,096" label="Incidents in 2024 · 164 a day" />
        <Stat value="6.2%" label="Share that were fires" tone="success" />
        <Stat value="$572M" label="Estimated loss, 2012–2024" tone="danger" />
        <Stat value="13 / 13" label="Years Dorchester led fires" tone="danger" />
      </Grid>
      <Table
        headers={["Finding", "Number"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Fires citywide, 2012 → 2024", "5,609 → 3,716 (−34%)"],
          ["Cooking share of all fires", "60% · #1 in all 16 neighborhoods"],
          ["Building fires, 13 years", "5,210 · $514M (90% of loss)"],
          ["Dorchester building fires", "1,519 · 29% of the city · $162M"],
          ["False alarms, 2024", "21,752 · 36% of all runs"],
          ["Public service (553), 2024", "18,214 runs"],
        ]}
        rowTone={["success", "danger", "danger", "danger", "warning", "info"]}
      />
      <Text>
        Open Overview for the citywide trend, Department for how to run the
        houses, City / Mayor for policy, Efficiency / OT for how peer
        departments cut wasted runs without cutting companies, Public for
        plain language. Efficiency / OT is calendar 2025 payroll with
        January–February 2025 incidents.
      </Text>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={28}>
      <Grid columns={4} gap={16}>
        <Stat value="60,096" label="Incidents in 2024" />
        <Stat value="164" label="Average runs per day" />
        <Stat value="3,716" label="Fires in 2024" tone="success" />
        <Stat value="11,480" label="2025 Boston primaries on file" />
      </Grid>
      <SectionDemand />
      <Divider />
      <SectionMix />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

function TabDepartment() {
  return (
    <Stack gap={28}>
      <Callout tone="info" title="For Operations, Prevention, and the district chiefs">
        Staff to the clock and the houses, not to the 6% fire share. Prevention
        owns cooking in multifamily. Fire prevention / alarm unit owns the
        repeat streets. Districts 8 and 12 are the fire-share districts;
        District 4 is the volume district.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="11 a.m." label="Peak total demand" />
        <Stat value="6–7 p.m." label="Peak fires (cooking hour)" tone="danger" />
        <Stat value="D4 / D8–12" label="Busiest vs highest fire share" />
      </Grid>
      <SectionClock />
      <Divider />
      <SectionWorkload />
      <Divider />
      <H2>What each shop should take from this</H2>
      <Table
        headers={["Shop", "Use this"]}
        rows={[
          ["Operations", "11 a.m. peak for all-calls; 6 p.m. for fire. Do not thin nights only because volume is lower — building fires still happen at 3 a.m."],
          ["District 4", "Highest raw volume (10,737). Alarm and service load from Fenway / Back Bay / South End."],
          ["Districts 7, 8, 12", "Dorchester–Mattapan–Hyde Park fire share. First-due strength stays."],
          ["Prevention", "Cooking in multifamily, Dorchester first (1,030 of 2,180 cooking fires citywide were multifamily in 2024)."],
          ["Alarm / FPB", "Repeat corridors: Commonwealth 02215, Huntington 02115, Boylston 02116. 21,752 false alarms."],
          ["Hazmat / CO", "425 CO incidents and 392 gas leaks in 2024 — still a first-due skill, not a leftover."],
        ]}
      />
    </Stack>
  );
}

function TabCity() {
  return (
    <Stack gap={28}>
      <Callout tone="warning" title="For the Mayor: safer on fire, more expensive on everything else.">
        Boston had 34% fewer fires than in 2012 and 28% fewer building fires.
        The department still ran 61% more incidents because service calls and
        false alarms took over the tape. That is a policy mix, not a fire mix.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="−34%" label="Fires since 2012" tone="success" />
        <Stat value="+61%" label="Total runs since 2012" />
        <Stat value="$572M" label="13-year estimated loss" tone="danger" />
        <Stat value="29%" label="Building fires in Dorchester" tone="danger" />
      </Grid>
      <SectionMix />
      <Divider />
      <SectionDorchester />
      <Divider />
      <SectionBuildingArea />
      <Divider />
      <SectionLoss />
      <Divider />
      <SectionAsksCity />
    </Stack>
  );
}

function TabPublic() {
  return (
    <Stack gap={20}>
      <H2>What Boston residents should know</H2>
      <Text>
        These are Boston Fire’s official incident records, 2012 through early
        2025. EMS ambulance work is a different agency and is not in this file.
      </Text>
      <Callout tone="success" title="Serious fires are down.">
        The department went to 5,609 fires in 2012 and 3,716 in 2024. Building
        fires — the kind that destroy homes — went from 491 to 354. That is
        the safety trend.
      </Callout>
      <Callout tone="warning" title="If you see fire trucks a lot, it is often not a fire.">
        In 2024, only about 6 out of every 100 runs were fires. The rest were
        mostly helping with public-service calls (lockouts, water, lifting
        someone who fell) and alarms that were not fires — burned toast,
        system trouble, or a pulled box with no smoke.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="6 of 100" label="Runs that were fires in 2024" tone="success" />
        <Stat value="3 in 5" label="Fires that started with cooking" tone="danger" />
        <Stat value="$572M" label="Estimated damage, 2012–2024" />
      </Grid>
      <H3>The fire that happens in every neighborhood</H3>
      <Text>
        Cooking is the number-one fire in all 16 parts of the city — not just
        Dorchester. Most stay in the pan. Stay in the kitchen, use a timer,
        keep a lid nearby. That is the fire we can prevent without a new
        station.
      </Text>
      <BarChart
        horizontal
        height={200}
        categories={[
          "Cooking (stayed in the pan)",
          "Trash / outside",
          "Brush / grass",
          "Building (home or business)",
          "Car / vehicle",
        ]}
        series={[
          { name: "Fires 2012–2024", data: [40841, 6474, 6136, 5548, 2936], tone: "danger" },
        ]}
      />
      <Caption>Source: 63,830 Boston fires, 2012–2024</Caption>
      <H3>Where building fires concentrate</H3>
      <Text>
        Dorchester has had the most building fires every year for 13 years —
        about 3 in 10 citywide. Roxbury and Allston-Brighton are next. That is
        not a one-year blip. Homes, not downtown offices, are where the loss
        sits ($514 million of $572 million estimated damage was building fire).
      </Text>
      <Table
        headers={["Neighborhood", "Building fires, 13 years"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Dorchester", "1,519"],
          ["Roxbury", "509"],
          ["Allston-Brighton", "407"],
          ["Jamaica Plain", "348"],
          ["East Boston (fewer fires, high dollar loss)", "289"],
        ]}
        rowTone={["danger", "warning", undefined, undefined, "warning"]}
      />
      <H3>What you can do</H3>
      <Table
        headers={["If you live here", "Do this"]}
        rows={[
          ["Any neighborhood", "Working smoke and CO alarms. Stay with food on the stove."],
          ["Apartment / multifamily", "Most cooking fires are in these buildings. Don’t leave oil unattended."],
          ["Near campus / hospital corridors", "You will hear more trucks for alarms than for fires. That is the data."],
          ["Dorchester, Roxbury, Mattapan, Hyde Park", "This is where fire share is highest. Alarms and an escape plan matter most."],
        ]}
      />
    </Stack>
  );
}

function TabEfficiency() {
  return (
    <Stack gap={24}>
      <Callout tone="warning" title="Efficient fire departments do not run fewer firefighters. They run fewer wasted assignments.">
        There is no official “world’s most efficient fire department.” Tokyo,
        London, FDNY, and UK brigades that get praised for productivity all
        do the same three things: send only the force the call type needs,
        stop going to unconfirmed commercial automatic alarms in daylight,
        and stop covering vacancies with overtime as the default. Boston’s
        incident file and payroll file point at the same gap.
      </Callout>
      <Callout tone="info" title="This tab is calendar 2025 payroll. Incidents are January–February 2025 — the only complete months on file.">
        2025 earnings are a full year. The incident extract still has a hole:
        11 March–18 December is missing. December 19–31 is on file but uses
        different close codes, so it is not in the mix tables. January–February
        2025 vs the same two months in 2024 is the fair comparison.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="$49.9M" label="BFD overtime, 2025 (15.8% of pay)" tone="danger" />
        <Stat value="1,805" label="BFD people on the 2025 earnings file" />
        <Stat value="3,187" label="False alarms, Jan–Feb 2025" tone="warning" />
        <Stat value="27%" label="Share of all city overtime, 2025" />
      </Grid>
      <H2>What the efficient services actually do</H2>
      <Table
        headers={["Service", "Practice", "Result they published"]}
        rows={[
          [
            "London Fire Brigade (2024–26)",
            "Do not attend unconfirmed commercial automatic fire alarms 07:00–20:30. Always attend sleeping risk, schools, and any 999 that reports fire.",
            "~10,000 fewer AFA attendances a year (8% of LFB calls). 23,500 staff-hours returned. AFA monthly KPI 1,667 → 1,300. Pre-arranged OT overspend £12.5M → ~£7M by filling vacancies, not closing pumps.",
          ],
          [
            "Greater Manchester / Merseyside / N. Yorkshire",
            "Call-challenge commercial AFAs. Charge the 4th+ false alarm in 12 months at real appliance cost (~£446 / ~$560).",
            "Owners fix detectors. UK law (FRSA s.18C) bills persistent commercial false alarms. Domestic 999 is never billed.",
          ],
          [
            "Tokyo Fire Department",
            "Computer-selected dispatch by incident type. Automatic alarms get a small emergency-confirmation assignment, not a full fire turnout, unless fire is confirmed.",
            "The company that is not needed stays in its district.",
          ],
          [
            "FDNY modified response",
            "Automatic alarms, electrical, odor (not smoke): first-due engine + ladder emergency; extra units no lights/sirens and cancel if nothing showing.",
            "Fewer collisions, less time out of first-due, less fuel. St. Louis ~90% fewer apparatus crashes after adaptive response.",
          ],
          [
            "San Diego Fire-Rescue OT audit (2025)",
            "Most fire OT is vacant seats and a wrong relief factor — not extra fires. Build a relief pool; count all leave in the staffing math.",
            "Hiring into a relief pool is cheaper than paying time-and-a-half forever.",
          ],
        ]}
      />
      <Caption>
        Sources: LFB LFC-24-022 and 2026–27 Productivity Plan; North Yorkshire
        2024 false-alarm charges; Tokyo Fire Service white paper; FDNY
        modified-response pilot; City of San Diego Fire-Rescue overtime audit 2025
      </Caption>
      <H2>Boston vs that model — using our files</H2>
      <Text>
        2025 earnings: 1,805 people, $317M gross, $49.9M overtime (15.8% of
        BFD pay, 27% of city OT). Retro is $0.1M — unlike 2024, this OT line
        is not mixed with contract catch-up. Roster fell from 1,919 in 2024
        (~202 names left, ~88 new). January–February 2025: 8,521 Boston
        primaries, 7.1% fire, 37% false alarm. Same two months in 2024 were
        8,661 and 6.5% fire. The mix did not change. The seats did.
      </Text>
      <Table
        headers={["Boston fact", "Efficient-department move", "Staff and OT"]}
        rows={[
          [
            "Jan–Feb 2025: 3,187 false alarms (37.4%), vs 3,159 (36.5%) the same months in 2024. Mix is unchanged.",
            "London rule: no auto-dispatch to unconfirmed commercial AFA 07:00–20:30. Still go to residences, hospitals, dorms, nursing homes, and any human report of fire or smoke.",
            "If ~40% of these two months’ false alarms are daytime commercial AFA (~1,270), that is on the order of 1,000 company-hours in January and February alone not spent rolling.",
          ],
          [
            "Ordinance 11-5A.5: fines start on the 4th malfunction in a half-year, $50 then $200. Too small to change a campus system.",
            "UK cost recovery: ~$560 per appliance-hour from the 4th commercial false alarm in 12 months.",
            "Behavior change first. Token $50 fines do not buy a single extra tour.",
          ],
          [
            "Jan–Feb 2025: 2,298 public-service (553) + 403 assist-invalid. Service share 39.6% in these two months (42.5% same months 2024).",
            "Lockouts, water, lift-assist without injury go to 311 or a two-person unit. Fire goes only if there is a medical or fire risk.",
            "A 50% diversion of 553 is ~1,150 fewer engine runs in two winter months, concentrated on the 11 a.m. peak.",
          ],
          [
            "Peak all-calls 11 a.m. Peak fires 6–7 p.m. (2024 clock — last complete year). Full assignment to morning alarms pulls companies off the dinner-hour fire problem.",
            "Tokyo / FDNY: small confirmation assignment on alarms; full box only on report of fire.",
            "Fewer Code-3 miles, fewer wrecks and IOD tours. First-due stays home for cooking fires.",
          ],
          [
            "2025 Fire earnings: 1,805 people (down from 1,919 in 2024), $49.9M OT — 15.8% of BFD pay, 27% of city OT. About 202 people on the 2024 file are gone; 88 names are new.",
            "2025 is the empty-seat year. OT rose while the roster shrank. Fill vacancies and change the run mix. Do not shrink companies.",
            "Vacancy OT and wasted assignments are both on this tape. Hiring without AFA/service reform just staffs the same 37% false-alarm load.",
          ],
        ]}
      />
      <H2>Hire and shift people — instead of paying time-and-a-half</H2>
      <Text>
        2025 overtime is $49.9M on 1,805 people. Median firefighter regular
        pay that year was $134k; median overtime $26k. Covering a seat with
        overtime costs about 1.5× regular. Putting a person on that seat at
        regular pay costs 1.0× and cuts the extra tours.
      </Text>
      <Grid columns={4} gap={16}>
        <Stat value="$49.9M" label="Overtime, 2025" tone="danger" />
        <Stat value="$16.0M" label="Injured pay, 2025 (people off the line)" tone="warning" />
        <Stat value="$134k" label="Median firefighter regular, 2025" />
        <Stat value="50" label="Hires that replace OT seats (~$3.4M premium saved)" />
      </Grid>
      <Callout tone="info" title="The 2025 math: 50 firefighters cost ~$6.7M regular. The same hours on overtime cost ~$10.1M.">
        Net to the City: about $3.4M less, and 50 people are not working a
        second tour. 80 hires: ~$10.7M regular vs ~$16.1M OT, about $5.4M
        less. That only works if the new people take seats that are today
        filled by callback — not if they are added on top of the same OT
        list. Injured pay is another $16.0M of people not in quarters; every
        IOD tour is someone else’s overtime. Unlike 2024, 2025 actually has
        empty seats to fill.
      </Callout>
      <H3>Who earned the overtime in 2025</H3>
      <Table
        headers={["Title", "People", "Overtime", "OT per person"]}
        columnAlign={["left", "right", "right", "right"]}
        rows={[
          ["Fire Fighter", "809", "$21.3M", "$26,400"],
          ["Fire Fighter-Technician", "158", "$4.5M", "$28,200"],
          ["Fire Lieutenant", "138", "$4.3M", "$30,800"],
          ["Fire Fighter-AdvanceTechnician", "55", "$1.9M", "$35,100"],
          ["Fire Captain", "46", "$1.7M", "$37,800"],
          ["Fire Lieutenant Administration", "41", "$1.7M", "$41,900"],
          ["FF Investigator Admin", "19", "$1.1M", "$55,100"],
          ["Dist Fire Chief", "26", "$0.9M", "$35,500"],
        ]}
        rowTone={[
          "danger",
          undefined,
          undefined,
          undefined,
          undefined,
          "warning",
          "warning",
          undefined,
        ]}
      />
      <Caption>
        Source: City of Boston 2025 earnings file, department = Boston Fire
        Department · 1,658 of 1,805 had some overtime · 241 people at $50k+ OT
      </Caption>
      <H3>Where to put people — fire load, not alarm load</H3>
      <Text>
        Hire and float into the districts that burn. Do not add suppression
        headcount in District 4 to chase automatic alarms — change the
        dispatch rule there instead, and let those companies stay in first-due.
      </Text>
      <Table
        headers={["Jan–Feb 2025 district", "Incidents", "Fires", "Fire %", "Put people here?"]}
        columnAlign={["left", "right", "right", "right", "left"]}
        rows={[
          ["7  Dorchester", "1,045", "68", "6.5%", "Yes — hire / float. Dorchester is still 29% of city building fires in the complete years."],
          ["9  Roxbury / Mission Hill", "1,273", "102", "8.0%", "Yes — hire / float."],
          ["8  Mattapan / Dorchester", "587", "52", "8.9%", "Yes — highest fire share with District 12."],
          ["12 Hyde Park", "633", "77", "12.2%", "Yes — highest fire share in these two months."],
          ["11 Allston-Brighton", "738", "45", "6.1%", "Yes — building-fire dollars stay high over the complete years."],
          ["4  Back Bay / Fenway / South End", "1,491", "129", "8.7%", "Do not add engines for alarms. AFA policy + modified response. Keep first-due; stop the extra assignment."],
          ["3  Downtown / North End", "1,099", "23", "2.1%", "Same as District 4 — alarm/service mix, not a hiring target."],
        ]}
        rowTone={[
          "danger",
          "danger",
          "danger",
          "danger",
          undefined,
          "warning",
          "warning",
        ]}
      />
      <Caption>
        Source: January–February 2025 Boston primaries · fire % = 100-series /
        all incidents in that district · two months, not a full year
      </Caption>
      <H3>Shift work off Fire — other city departments</H3>
      <Text>
        These January–February 2025 codes are how the job was closed — not how
        to ignore a 911 call. If the caller reports fire, smoke, flames, or a
        burning vehicle, Fire goes. Passenger vehicle fires are a separate
        code (131): 19 of them in these two months, and they stay with us.
      </Text>
      <Table
        headers={["Jan–Feb 2025 work", "Runs", "Move to", "What Fire keeps"]}
        columnAlign={["left", "right", "left", "left"]}
        rows={[
          ["Public service (553)", "2,298", "311 / Public Works / Inspectional", "Only if fire, CO, or medical risk"],
          ["Assist invalid (554)", "403", "Boston EMS", "Fire if a fall with fire/CO or no EMS unit"],
          ["Police matter (552)", "141", "Boston Police — after it is clear there is no fire", "A burning vehicle is a fire (code 131, 19 of them in Jan–Feb). Flames, smoke, or fuel leak: Fire goes. 552 means we already went and it was not a fire."],
          ["Water or steam leak (522)", "210", "Water/Sewer or Public Works", "Fire if electrical or structural risk"],
          ["Lock-out (511)", "88", "311 / private locksmith", "Fire if a child/elder/medical inside"],
          ["Alarm malfunction / unintentional (commercial, daytime)", "~1,270 of 3,187 false alarms", "Building owner + Fire Prevention inspection, not a box", "Sleeping risk, hospitals, any report of smoke"],
        ]}
        rowTone={["info", "info", undefined, undefined, undefined, "warning"]}
      />
      <H3>Shift people inside Fire</H3>
      <Table
        headers={["From", "To", "Why"]}
        rows={[
          [
            "Citywide overtime list (callback to wherever a seat is empty)",
            "A relief / float pool assigned first to Districts 7, 8, 9, 12",
            "OT today follows vacancies. New regular seats should follow fires.",
          ],
          [
            "Fire Lieutenant Administration (41 people, $1.7M OT) and investigator-admin ($55k OT each)",
            "Fire Prevention field: cooking-fire visits in Dorchester multifamily, and commercial alarm inspections on the repeat streets",
            "Admin overtime does not put water on a fire. Prevention cuts the 6 p.m. cooking job and the Fenway alarm.",
          ],
          [
            "Extra companies on a District 4 automatic alarm",
            "Stay in quarters or return on cancel (FDNY modified / London AFA)",
            "Those firefighters are then available for a Dorchester building fire without a citywide callback.",
          ],
        ]}
      />
      <Callout tone="warning" title="Do not transfer suppression firefighters into 311 to ‘save’ Fire’s budget.">
        Move the *calls*, not the engine riders, unless you are building a
        dedicated two-person public-service unit. Taking 50 firefighters out
        of District 7 to staff lockouts would raise overtime and slow the
        first-due in the neighborhood that already has 29% of building fires.
      </Callout>
      <Table
        headers={["Step", "Action", "Staff burden", "City money"]}
        rows={[
          [
            "1. Hire into fire districts, not onto the OT list",
            "50 firefighters at 2025 median regular ($134k) = $6.7M. Put them in Districts 7, 8, 9, 12. They take seats now filled by callback.",
            "Down — 50 fewer people working a second tour.",
            "Same hours today cost ~$10.1M in OT. Net ~$3.4M less. 80 hires → ~$5.4M less. Only if OT tours actually fall.",
          ],
          [
            "2. Commercial AFA",
            "Pilot London policy in Districts 3 and 4: unconfirmed commercial automatic alarms 07:00–20:30 get call-challenge, not a box.",
            "Down immediately in the busiest houses.",
            "Direct OT maybe $1–3M plus fuel. Bigger win: companies in quarters so Dorchester fires do not trigger citywide move-up. London treated cash OT as secondary to hours returned.",
          ],
          [
            "3. Fines that hurt",
            "Rewrite 11-5A.5: charge actual company cost (~$400–600) from the 4th commercial false alarm in 12 months.",
            "Down as systems get fixed.",
            "Revenue plus fewer runs. $50 fines do not pay for a tour.",
          ],
          [
            "4. Public service",
            "With OEM / BEMS / 311: lockouts, water, non-injury lift-assist off the engine.",
            "Down on the 11 a.m. peak.",
            "Hours back. OT falls if those hours were holdovers and move-ups.",
          ],
          [
            "5. Modified response",
            "FDNY rule on remaining alarm/electrical/odor: first-due emergency, rest no lights, cancel if nothing showing.",
            "Less Code-3 driving. Fewer collisions.",
            "Fuel, apparatus, injury OT. Compounds with step 2.",
          ],
          [
            "6. Prevention",
            "Cooking is 60% of fires everywhere. Devices and inspection in Dorchester multifamily first.",
            "Fewer 6 p.m. working fires = fewer callbacks and injuries.",
            "Avoided loss ($514M of $572M is building fire). Slow, but it is the fire problem.",
          ],
        ]}
        rowTone={["danger", "warning", "warning", "info", undefined, "success"]}
      />
      <Callout tone="danger" title="Do not ‘save’ OT by thinning suppression.">
        Building fires fell 28% and still cost $514M over 13 years. Districts
        8 and 12 have the highest fire share. A smaller on-duty force means
        more callback, more overtime, and a slower first-due. London cut
        overtime by cutting automatic-alarm attendance and filling vacancies
        — not by closing pumps.
      </Callout>
      <H3>Hours we can give back without a study committee</H3>
      <BarChart
        horizontal
        height={200}
        categories={[
          "False alarms, Jan–Feb 2025",
          "Public service 553",
          "Assist invalid 554",
          "All fires",
          "Building fires",
        ]}
        series={[
          { name: "Jan–Feb 2025 incidents", data: [3187, 2298, 403, 601, 51], tone: "warning" },
        ]}
      />
      <Caption>
        Source: January–February 2025 Boston primaries · first two bars are the
        efficiency target · last two are what we must keep staffing for · not a
        full year
      </Caption>
      <Text size="small" tone="secondary">
        Overtime and headcount from the City of Boston 2025 earnings file
        (BFD 1,805 people, $49.9M OT, $316.7M gross, $0.1M retro). Incidents
        from January–February 2025 Boston primaries (8,521). Same two months
        in 2024: 8,661 runs, 36.5% false alarm. One payroll year throughout.
        Do not read 11,480 as a 2025 incident total — April through
        mid-December is missing. No tour-level OT reason code, so callback vs
        shop vs holdover cannot be split. City of Boston v. Local 718 (Mass.
        Superior Court 2026) confirmed the Commissioner’s authority over
        whether non-emergency shop overtime is worked.
      </Text>
    </Stack>
  );
}

function TabFull() {
  return (
    <Stack gap={32}>
      <SectionDemand />
      <Divider />
      <SectionMix />
      <Divider />
      <SectionDorchester />
      <Divider />
      <SectionCommonFire />
      <Divider />
      <SectionBuildingArea />
      <Divider />
      <SectionClock />
      <Divider />
      <SectionWorkload />
      <Divider />
      <SectionLoss />
      <Divider />
      <SectionAsksCity />
      <Divider />
      <TabEfficiency />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

export default function BostonFireCityBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston Fire Department — incident analysis</H1>
        <Text tone="secondary">
          Cleaned NFIRS records, 1 January 2012 through the 2025 windows on
          file (January–February, 1–10 March, 19–31 December). Primary
          incidents inside Boston. 2012–2024 are complete years. Efficiency /
          OT uses 2025 earnings with January–February 2025 incidents.
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
      {tab === "efficiency" ? <TabEfficiency /> : null}
      {tab === "full" ? <TabFull /> : null}
    </Stack>
  );
}
