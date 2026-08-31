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
  "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025",
];
const SHOOT_YEARS = [
  "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024",
  "2025",
];

const VOLUME = [87994, 89486, 86734, 87184, 70894, 71721, 73852, 78055, 79124, 81162];
const SERVICE = [34051, 37259, 35675, 35855, 28930, 31217, 33843, 34258, 35358, 38197];
const PROPERTY = [22805, 21414, 20496, 20604, 20464, 17197, 16709, 18875, 18403, 17584];
const MV = [13301, 13467, 13159, 13134, 10314, 12395, 12348, 12569, 13069, 13138];
const VIOLENCE = [12090, 11995, 12186, 12444, 8155, 7904, 8008, 8951, 8794, 8101];
const SERIOUS = [3756, 3633, 3463, 3341, 2634, 2287, 2336, 2396, 2463, 2213];
const DRUGS = [3293, 2883, 3052, 3020, 1401, 1591, 1527, 1866, 1998, 2688];
const SHOP = [2453, 2435, 2696, 2361, 2025, 2316, 2234, 2893, 3755, 4340];
const SICK = [6568, 7219, 7745, 7800, 8236, 8129, 7919, 9043, 8833, 9718];
const INVEST_P = [5773, 6667, 5460, 5743, 5122, 6841, 8070, 7006, 7705, 8935];

const SHOOT = [245, 226, 260, 203, 190, 274, 196, 180, 143, 127, 120];
const FATAL = [33, 38, 46, 48, 28, 44, 25, 32, 27, 20, 19];
const SHOTS = [807, 795, 1078, 882, 825, 1209, 1124, 743, 650, 538, 604];
const GUNS_CRIME = [578, 472, 453, 559, 571, 636, 691, 611, 588, 590];
const GUNS_SAFE = [178, 193, 223, 179, 234, 180, 195, 261, 320, 281];
const GUNS_BUYBACK = [23, 67, 58, 10, 0, 17, 38, 12, 5, 0];
const NONFATAL = [212, 188, 214, 155, 162, 230, 171, 148, 116, 107, 101];
const CORE_SHARE = [69.8, 80.1, 75.4, 71.4, 72.1, 70.1, 76.0, 68.9, 72.0, 66.1, 70.0];
const CORE_N = [171, 181, 196, 145, 137, 192, 149, 124, 103, 84, 84];

const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_ALL = [
  6271, 1838, 1587, 1015, 828, 890, 1241, 2358, 3388, 4002, 4481, 4521, 4937,
  4278, 4403, 4043, 5125, 5292, 4837, 4072, 3736, 3206, 2763, 2050,
];
const HOUR_VIOL = [
  700, 259, 258, 119, 77, 75, 114, 179, 225, 305, 333, 366, 446, 375, 441, 445,
  522, 521, 510, 435, 433, 376, 342, 245,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2025 = [6235, 5633, 6723, 6448, 7164, 6740, 7155, 7358, 7375, 7420, 6681, 6230];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2025 = [12109, 11943, 12112, 11547, 12408, 11034, 10009];

const AREA_VOL = {
  Roxbury: [13644, 13833, 13332, 13030, 10442, 9929, 10031, 10337, 10540, 10845],
  Dorchester: [12038, 11966, 11226, 11022, 8992, 9119, 9136, 9073, 9276, 9825],
  SouthEnd: [11562, 11055, 10767, 11276, 9283, 9245, 9592, 10408, 11319, 12762],
  Mattapan: [9779, 10162, 10177, 9591, 7828, 7422, 7316, 7903, 8124, 8107],
  Downtown: [9338, 9953, 9528, 9936, 7013, 8085, 8520, 9557, 9342, 9158],
};
const AREA_VIOL = {
  Roxbury: [2262, 2130, 2149, 1985, 1317, 1118, 1084, 1328, 1266, 1288],
  Dorchester: [1705, 1621, 1655, 1597, 1062, 1041, 975, 1042, 1091, 1003],
  SouthEnd: [1436, 1347, 1386, 1515, 1055, 951, 992, 1198, 1231, 1179],
  Mattapan: [1548, 1589, 1558, 1618, 982, 773, 834, 1023, 1010, 974],
  Downtown: [1295, 1410, 1499, 1476, 918, 1086, 1132, 1159, 1198, 1048],
};
const AREA_SERIOUS = {
  Roxbury: [795, 708, 674, 569, 513, 371, 343, 357, 371, 351],
  Dorchester: [515, 499, 474, 420, 352, 307, 309, 290, 324, 287],
  Mattapan: [489, 514, 432, 494, 329, 263, 254, 264, 291, 311],
  SouthEnd: [481, 436, 391, 414, 377, 271, 326, 363, 329, 315],
  Downtown: [459, 489, 462, 424, 310, 370, 327, 332, 378, 314],
};
const B2_MIX = {
  service: [5058, 5390, 5267, 5166, 4313, 4151, 4619, 4688, 4763, 5083],
  property: [2918, 2875, 2673, 2468, 2438, 2039, 1904, 1879, 2047, 2122],
  mv: [2387, 2416, 2212, 2280, 1842, 2133, 1954, 1951, 1935, 1901],
  violence: [2262, 2130, 2149, 1985, 1317, 1118, 1084, 1328, 1266, 1288],
};
const SHOOT_AREA = {
  Roxbury: [82, 76, 81, 65, 61, 78, 61, 39, 34, 35, 30],
  Mattapan: [49, 61, 61, 41, 52, 73, 60, 47, 43, 29, 37],
  Dorchester: [40, 44, 54, 39, 24, 41, 28, 38, 26, 20, 17],
  JP: [29, 14, 18, 18, 18, 20, 13, 12, 12, 9, 6],
  SouthEnd: [17, 6, 11, 9, 6, 13, 6, 8, 6, 8, 6],
};

type TabId =
  | "summary"
  | "overview"
  | "department"
  | "guns"
  | "city"
  | "public"
  | "efficiency"
  | "full";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Overview" },
  { id: "department", label: "Department" },
  { id: "guns", label: "Guns" },
  { id: "city", label: "City / Mayor" },
  { id: "public", label: "Public" },
  { id: "efficiency", label: "Efficiency / OT" },
  { id: "full", label: "Full analysis" },
];

const TAB_BLURB: Record<TabId, string> = {
  summary: "Five findings. Numbers a reader can take into a meeting.",
  overview: "Citywide demand, mix, and data coverage, 2016–2025. 2020 is COVID — not a baseline.",
  department:
    "What the districts need: when we run, which districts still own gun violence, which streets are retail theft.",
  guns:
    "Shootings, shots fired, and guns recovered. 2020 is the COVID spike. Compare 2025 to 2019.",
  city: "What the Mayor and Council need: safety trend, equity, overtime, and decisions.",
  public:
    "Plain language: is Boston safer, why officers still roll, what to watch in your neighborhood.",
  efficiency:
    "What peer departments do that Boston can copy. 2025 incidents + 2025 overtime and headcount.",
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
      <H2>Demand recovered. Violence did not come back with it.</H2>
      <Text>
        Use 2019 as the last normal pre-COVID year, not 2020. Volume fell
        19% in 2020 because streets emptied — then climbed through 2025 and
        is still below 2016–2019. Serious violence is down about a third
        from 2016. Shootings are below pre-COVID, not just below the 2020
        spike. The tape filled with sick-assist, investigate-person, and
        shoplifting.
      </Text>
      <Callout tone="warning" title="2020 is a COVID year. Do not use it as a baseline.">
        Reports −19% (87,184 → 70,894). Shootings +44% (190 → 274). Shots
        fired +47% (825 → 1,209). Verbal disputes collapsed; sick-assist did
        not. COVID took cars and disputes off the tape and put more gunfire
        on it. Compare 2025 to 2019, then show 2020 as the shock.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Unique incidents per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            fill
            series={[{ name: "Incidents", data: VOLUME, tone: "info" }]}
          />
          <Caption>
            Source: BPD RMS · 2016–2025 · 2020 is COVID (70,894) · 2015
            omitted (starts 15 Jun)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Violence vs serious violence</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[
              { name: "All violence (incl. simple assault / threats)", data: VIOLENCE, tone: "warning" },
              { name: "Serious violence (homicide, sex, robbery, agg. assault)", data: SERIOUS, tone: "danger" },
            ]}
          />
          <Caption>
            Source: primary offense per incident · RMS violence also dipped in
            2020; shootings (separate file) went the other way
          </Caption>
        </Stack>
      </Grid>
      <H3>2019 (pre-COVID) · 2020 (COVID) · 2025</H3>
      <Table
        headers={["Metric", "2019", "2020", "2025", "2025 vs 2019"]}
        columnAlign={["left", "right", "right", "right", "right"]}
        rows={[
          ["All incidents", "87,184", "70,894", "81,162", "−7%"],
          ["Shooting victims", "190", "274", "120", "−37%"],
          ["Shots fired", "825", "1,209", "604", "−27%"],
          ["Serious violence", "3,341", "2,634", "2,213", "−34%"],
          ["Verbal dispute", "3,583", "1,448", "1,743", "−51%"],
          ["Drug incidents", "3,020", "1,401", "2,688", "−11%"],
          ["Sick assist", "7,800", "8,236", "9,718", "+25%"],
        ]}
        rowTone={[
          "info", "danger", "warning", "success", undefined, undefined, "info",
        ]}
      />
      <Caption>
        Source: RMS unique incidents + shootings/shots-fired files · 2020
        volume is the COVID hole; 2020 shootings are the COVID spike
      </Caption>
    </Stack>
  );
}

function SectionMix() {
  return (
    <Stack gap={12}>
      <H3>What officers closed — share of incidents by year</H3>
      <BarChart
        categories={YEARS}
        height={260}
        stacked
        normalized
        series={[
          { name: "Non-crime service", data: SERVICE, tone: "info" },
          { name: "Property crime", data: PROPERTY, tone: "warning" },
          { name: "Motor vehicle", data: MV, tone: "neutral" },
          { name: "Violence", data: VIOLENCE, tone: "danger" },
          { name: "Drugs", data: DRUGS },
        ]}
      />
      <Caption>
        Source: BPD RMS primary offense · 2016–2025 · weapons / residual
        under 2% omitted
      </Caption>
      <Grid columns="1.1fr 0.9fr" gap={24}>
        <Stack gap={8}>
          <H3>2025 mix</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Non-crime service", value: 38197, tone: "info" },
              { label: "Property crime", value: 17584, tone: "warning" },
              { label: "Motor vehicle", value: 13138, tone: "neutral" },
              { label: "Violence", value: 8101, tone: "danger" },
              { label: "Drugs", value: 2688 },
              { label: "Other", value: 1454 },
            ]}
          />
          <Caption>Source: 2025 unique incidents (n = 81,162) · last complete year</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>How the job changed, 2016 → 2025</H3>
          <Table
            headers={["Category", "2016", "2025", "Change"]}
            columnAlign={["left", "right", "right", "right"]}
            rows={[
              ["All incidents", "87,994", "81,162", "−8%"],
              ["Non-crime service", "38.7%", "47.1%", "+4,146 count"],
              ["Investigate person", "5,773", "8,935", "+55%"],
              ["Sick assist", "6,568", "9,718", "+48%"],
              ["Violence (all)", "13.7%", "10.0%", "−33% count"],
              ["Serious violence", "3,756", "2,213", "−41%"],
              ["Shoplifting", "2,453", "4,340", "+77%"],
              ["Drug incidents", "3,293", "2,688", "−18%"],
            ]}
            rowTone={[
              "info", "info", "info", "info", "success", "success", "warning",
              "success",
            ]}
          />
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionRoxbury() {
  return (
    <Stack gap={12}>
      <H2>The paper moved. The guns did not.</H2>
      <Text>
        Roxbury (B2) led incident volume every year 2015–2022. In 2023 the
        South End / Back Bay district (D4) took over — shoplifting on
        Boylston and Newbury. Gun violence never left B2, B3, and C11.
      </Text>
      <Callout
        tone="danger"
        title="72% of shooting victims, 2015–2025, were in Roxbury, Mattapan, or Dorchester."
      >
        1,623 of 2,250 victims. That share was 80% in 2016 and 70% in 2025.
        D4 is now #1 for reports. It is not #1 for shootings (104 victims in
        11 years).
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="D4" label="#1 volume since 2023" tone="warning" />
        <Stat value="B2" label="#1 shootings every year" tone="danger" />
        <Stat value="72%" label="Shooting victims in B2+B3+C11" tone="danger" />
        <Stat value="36%" label="2025 shoplifting in D4 alone" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Incident volume by district</H3>
          <LineChart
            categories={YEARS}
            height={240}
            series={[
              { name: "B2 Roxbury", data: AREA_VOL.Roxbury, tone: "danger" },
              { name: "D4 South End / Back Bay", data: AREA_VOL.SouthEnd, tone: "warning" },
              { name: "C11 Dorchester", data: AREA_VOL.Dorchester, tone: "info" },
              { name: "B3 Mattapan", data: AREA_VOL.Mattapan },
              { name: "A1 Downtown", data: AREA_VOL.Downtown, tone: "neutral" },
            ]}
          />
          <Caption>Source: unique incidents · 2016–2025 · D4 passes B2 in 2023</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Shooting victims by district</H3>
          <LineChart
            categories={SHOOT_YEARS}
            height={240}
            series={[
              { name: "B2 Roxbury", data: SHOOT_AREA.Roxbury, tone: "danger" },
              { name: "B3 Mattapan", data: SHOOT_AREA.Mattapan, tone: "warning" },
              { name: "C11 Dorchester", data: SHOOT_AREA.Dorchester, tone: "info" },
              { name: "E13 Jamaica Plain", data: SHOOT_AREA.JP },
              { name: "D4 South End / Back Bay", data: SHOOT_AREA.SouthEnd, tone: "neutral" },
            ]}
          />
          <Caption>
            Source: BPD shootings file (victims, not incidents) · 2015–2025
          </Caption>
        </Stack>
      </Grid>
      <H3>Who was #1 each year</H3>
      <Table
        headers={["Year", "#1 volume", "Reports", "#1 shootings (B2 every year)"]}
        columnAlign={["left", "left", "right", "left"]}
        striped
        rows={[
          ["2016", "B2 Roxbury", "13,644", "B2 · 76 victims"],
          ["2017", "B2 Roxbury", "13,833", "B2 · 81"],
          ["2018", "B2 Roxbury", "13,332", "B2 · 65"],
          ["2019", "B2 Roxbury", "13,030", "B2 · 61"],
          ["2020 COVID", "B2 Roxbury", "10,442", "B2 · 78"],
          ["2021", "B2 Roxbury", "9,929", "B2 · 61"],
          ["2022", "B2 Roxbury", "10,031", "B2 · 39"],
          ["2023", "D4 South End / Back Bay", "10,408", "B2 · 34"],
          ["2024", "D4 South End / Back Bay", "11,319", "B2 · 35"],
          ["2025", "D4 South End / Back Bay", "12,762", "B2 · 30"],
        ]}
        rowTone={[
          undefined, undefined, undefined, undefined, "warning", undefined,
          undefined, "info", "info", "info",
        ]}
      />
      <Caption>
        Source: RMS volume · shootings victim file · 2025 D4 is 16% of city
        reports and 5% of shooting victims
      </Caption>
      <H3>Roxbury’s mix over time</H3>
      <BarChart
        categories={YEARS}
        height={240}
        stacked
        series={[
          { name: "Non-crime service", data: B2_MIX.service, tone: "info" },
          { name: "Property crime", data: B2_MIX.property, tone: "warning" },
          { name: "Motor vehicle", data: B2_MIX.mv, tone: "neutral" },
          { name: "Violence", data: B2_MIX.violence, tone: "danger" },
        ]}
      />
      <Caption>Source: B2 unique incidents · 2016–2025</Caption>
    </Stack>
  );
}

function SectionShootings() {
  return (
    <Stack gap={12}>
      <H2>Gun violence is the building-fire problem</H2>
      <Text>
        Like building fires for BFD: a small share of the tape, concentrated
        in the same neighborhoods every year, and still the thing that
        should set first-due strength. Open the Guns tab for recoveries,
        shots fired, and victims. 2020 was the COVID spike (274 victims,
        +44% vs 2019), not a new normal. 2025 is 120 — below pre-COVID 2019
        (190).
      </Text>
      <Grid columns={4} gap={16}>
        <Stat value="120" label="Shooting victims in 2025" tone="success" />
        <Stat value="19" label="Fatal, 2025" tone="danger" />
        <Stat value="−37%" label="Victims vs 2019 (pre-COVID)" tone="success" />
        <Stat value="72%" label="Still in B2+B3+C11" tone="danger" />
      </Grid>
    </Stack>
  );
}

function TabGuns() {
  return (
    <Stack gap={28}>
      <Callout tone="warning" title="2020 is COVID. Gunfire went up while reports went down.">
        Shooting victims 190 (2019) → 274 (2020) → 120 (2025). Shots fired
        825 → 1,209 → 604. Do not score 2025 against 2020 as if that year
        were normal. The honest before-picture is 2019.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="120" label="Shooting victims, 2025" tone="success" />
        <Stat value="19" label="Fatal, 2025" tone="danger" />
        <Stat value="604" label="Shots-fired incidents, 2025" />
        <Stat value="590" label="Crime guns recovered, 2025" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Shooting victims — fatal and non-fatal</H3>
          <BarChart
            categories={SHOOT_YEARS}
            height={240}
            stacked
            series={[
              { name: "Non-fatal", data: NONFATAL, tone: "warning" },
              { name: "Fatal", data: FATAL, tone: "danger" },
            ]}
          />
          <Caption>
            Source: BPD shootings (victims, not incidents) · 2015–2025 · 2,250
            victims · 373 fatal · 2020 is the spike
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Shots fired</H3>
          <LineChart
            categories={SHOOT_YEARS}
            height={240}
            fill
            series={[{ name: "Shots-fired incidents", data: SHOTS, tone: "warning" }]}
          />
          <Caption>
            Source: shots-fired file · 9,533 incidents 2015–mid-Aug 2026 ·
            2020 = 1,209 · 2025 = 604
          </Caption>
        </Stack>
      </Grid>
      <H2>Where the victims still are</H2>
      <Text>
        Paper moved to D4. Guns did not. B2, B3, and C11 are 72% of
        shooting victims across 11 years. That share was 80% in 2016 and
        70% in 2025 — including through the COVID spike.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Shooting victims by district</H3>
          <LineChart
            categories={SHOOT_YEARS}
            height={240}
            series={[
              { name: "B2 Roxbury", data: SHOOT_AREA.Roxbury, tone: "danger" },
              { name: "B3 Mattapan", data: SHOOT_AREA.Mattapan, tone: "warning" },
              { name: "C11 Dorchester", data: SHOOT_AREA.Dorchester, tone: "info" },
              { name: "E13 Jamaica Plain", data: SHOOT_AREA.JP },
              { name: "D4 South End / Back Bay", data: SHOOT_AREA.SouthEnd, tone: "neutral" },
            ]}
          />
          <Caption>Source: BPD shootings · 2015–2025 · B2 is #1 every year</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Share of victims in B2 + B3 + C11</H3>
          <LineChart
            categories={SHOOT_YEARS}
            height={240}
            beginAtZero={false}
            yMin={50}
            yMax={90}
            series={[{ name: "Core-district share (%)", data: CORE_SHARE, tone: "danger" }]}
          />
          <Caption>
            Source: same victim file · never below 66% · 2020 COVID year was
            70%, same geography
          </Caption>
        </Stack>
      </Grid>
      <Table
        headers={["District", "Victims 2015–2025", "Share", "Shots fired"]}
        columnAlign={["left", "right", "right", "right"]}
        striped
        rows={[
          ["B2 Roxbury", "666", "30%", "2,714"],
          ["B3 Mattapan", "573", "25%", "2,503"],
          ["C11 Dorchester", "384", "17%", "1,908"],
          ["E13 Jamaica Plain", "170", "8%", "562"],
          ["E18 Hyde Park", "119", "5%", "472"],
          ["D4 South End / Back Bay", "104", "5%", "405"],
          ["A1 Downtown", "40", "2%", "90"],
        ]}
        rowTone={["danger", "danger", "danger", "warning", undefined, undefined, "info"]}
      />
      <Caption>
        Source: 2,250 shooting victims · 9,533 shots-fired through mid-Aug
        2026 · D4 is #1 for RMS paper and #6 for shooting victims
      </Caption>
      <H3>Core vs rest, year by year</H3>
      <Table
        headers={["Year", "Victims", "In B2+B3+C11", "Share"]}
        columnAlign={["left", "right", "right", "right"]}
        rows={[
          ["2015", "245", "171", "70%"],
          ["2016", "226", "181", "80%"],
          ["2017", "260", "196", "75%"],
          ["2018", "203", "145", "71%"],
          ["2019 pre-COVID", "190", "137", "72%"],
          ["2020 COVID", "274", "192", "70%"],
          ["2021", "196", "149", "76%"],
          ["2022", "180", "124", "69%"],
          ["2023", "143", "103", "72%"],
          ["2024", "127", "84", "66%"],
          ["2025", "120", "84", "70%"],
        ]}
        rowTone={[
          undefined, undefined, undefined, undefined, "info", "warning",
          undefined, undefined, undefined, undefined, "success",
        ]}
      />
      <H2>Guns recovered did not fall with shootings</H2>
      <Text>
        Crime-gun takeoffs are still ~590 a year. Safeguard (guns turned in
        for safekeeping) rose. Buybacks essentially stopped. The street is
        not disarmed — fewer of those guns are being fired at people.
      </Text>
      <BarChart
        categories={YEARS}
        height={250}
        stacked
        series={[
          { name: "Crime guns recovered", data: GUNS_CRIME, tone: "danger" },
          { name: "Safeguard", data: GUNS_SAFE, tone: "info" },
          { name: "Buyback", data: GUNS_BUYBACK, tone: "neutral" },
        ]}
      />
      <Caption>
        Source: daily citywide gun-recovery file · 2016–2025 · 2015 and 2016
        files miss some days, so those years are slightly low
      </Caption>
      <Grid columns={3} gap={16}>
        <Stat value="590" label="Crime guns, 2025 · 578 in 2016" />
        <Stat value="281" label="Safeguard, 2025 · 178 in 2016" />
        <Stat value="0" label="Buyback, 2025 · 97 in 2015" tone="warning" />
      </Grid>
      <H2>Who was shot</H2>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Victims by race, 2015–2025</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Black or African American", value: 1742, tone: "danger" },
              { label: "White", value: 382, tone: "neutral" },
              { label: "Unknown", value: 114 },
              { label: "Asian", value: 12, tone: "info" },
            ]}
          />
          <Caption>Source: 2,250 victims · Black 77% · White 17%</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Victims by gender</H3>
          <Table
            headers={["", "Victims", "Share"]}
            columnAlign={["left", "right", "right"]}
            rows={[
              ["Male", "1,999", "89%"],
              ["Female", "240", "11%"],
              ["Multi-victim incidents (flag)", "693", "31% of victims"],
            ]}
            rowTone={["danger", undefined, "warning"]}
          />
          <Caption>
            Source: same shootings file · one row per victim · multi-victim
            flag is on the victim row
          </Caption>
        </Stack>
      </Grid>
      <H2>2026 year-to-date</H2>
      <Text>
        Through mid-August 2026: 86 shooting victims (13 fatal) and 278
        shots-fired incidents. Crime guns recovered: 362 through 28 August.
        That is not a full year — do not annualize it against 2025 yet.
      </Text>
      <Table
        headers={["", "2025 full year", "2026 through mid-August"]}
        columnAlign={["left", "right", "right"]}
        rows={[
          ["Shooting victims", "120", "86"],
          ["Fatal", "19", "13"],
          ["Shots fired", "604", "278"],
          ["Crime guns recovered", "590", "362 (through 28 Aug)"],
        ]}
      />
      <Callout tone="danger" title="Do not thin B2 / B3 / C11 because the citywide shooting count fell.">
        2025 is safer than 2019. The map is the same map. 84 of 120 victims
        were still in three districts. Crime-gun recoveries did not fall.
        Staff the gun work to that geography.
      </Callout>
    </Stack>
  );
}

function SectionCommonCrime() {
  return (
    <Stack gap={12}>
      <H2>Common workload — every district, every year</H2>
      <Callout
        tone="warning"
        title="Investigate-person and sick-assist are the cooking fires: everywhere, and not the lethal problem."
      >
        In 2025 those two codes were 18,653 incidents — 23% of everything
        BPD closed. Serious violence was 2,213 (2.7%). Shoplifting is the
        new growth line: 2,453 → 4,340.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="23%" label="2025 that is investigate-person or sick assist" tone="warning" />
        <Stat value="2.7%" label="Share that is serious violence" tone="success" />
        <Stat value="+77%" label="Shoplifting, 2016 → 2025" />
        <Stat value="12%" label="2025 that is sick assist" />
      </Grid>
      <H3>Service load vs shoplifting, citywide</H3>
      <BarChart
        categories={YEARS}
        height={250}
        series={[
          { name: "Sick assist", data: SICK, tone: "info" },
          { name: "Investigate person", data: INVEST_P, tone: "neutral" },
          { name: "Shoplifting", data: SHOP, tone: "warning" },
          { name: "Serious violence", data: SERIOUS, tone: "danger" },
        ]}
      />
      <Caption>
        Source: flags on the incident (any offense row) · 2016–2025
      </Caption>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>When officers are running</H2>
      <Text>
        Total demand peaks at 4–5 p.m. Violence peaks in the same window,
        not overnight. Friday is heaviest. Sunday is lightest. May–August
        are the high months.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 incidents by hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "All incidents", data: HOUR_ALL, tone: "info" }]}
          />
          <Caption>
            Quietest 4 a.m. (828) · peak 5 p.m. (5,292) · midnight (6,271) is
            mostly unknown-time dumps, not a real spike
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 violence by hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "Violence", data: HOUR_VIOL, tone: "danger" }]}
          />
          <Caption>Peak 4 p.m. (522) · overnight trough 4–6 a.m.</Caption>
        </Stack>
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 by weekday</H3>
          <BarChart
            categories={WEEKDAYS}
            height={180}
            series={[{ name: "Incidents", data: WEEKDAY_2025, tone: "info" }]}
          />
          <Caption>Source: 2025 · Friday 12,408 · Sunday 10,009</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 by month</H3>
          <BarChart
            categories={MONTHS}
            height={180}
            series={[{ name: "Incidents", data: MONTH_2025, tone: "info" }]}
          />
          <Caption>October 7,420 peak · February 5,633</Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionWorkload() {
  return (
    <Stack gap={12}>
      <H2>What the districts actually run on</H2>
      <Text>
        2024’s top codes are not Part One crime. Sick assist is 8,833.
        Investigate person is 7,705. Shoplifting is the first property
        crime — and 1,291 of 3,755 are in D4.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Most frequent 2024 types</H3>
          <Table
            headers={["Type", "Count"]}
            columnAlign={["left", "right"]}
            rows={[
              ["Sick assist (incl. drug-related illness)", "8,833"],
              ["Investigate person", "7,705"],
              ["M/V leaving scene — property damage", "4,687"],
              ["Larceny shoplifting", "3,755"],
              ["Towed motor vehicle", "3,492"],
              ["Investigate property", "3,467"],
              ["Assault — simple", "3,265"],
              ["Vandalism", "2,802"],
              ["Property lost / missing", "2,796"],
              ["Verbal dispute", "2,221"],
            ]}
            rowTone={[
              "info", "info", undefined, "warning", "info", "info",
              undefined, undefined, "info", undefined,
            ]}
            striped
          />
        </Stack>
        <Stack gap={8}>
          <H3>2024 shoplifting streets</H3>
          <BarChart
            horizontal
            height={260}
            categories={[
              "Boylston St (D4)",
              "Washington St (A1)",
              "Newbury St (D4)",
              "Washington St (C11)",
              "Allstate Rd (C6)",
              "Cambridge St (A1)",
              "Huntington Ave (D4)",
            ]}
            series={[{ name: "2024 shoplifting", data: [634, 353, 293, 182, 154, 151, 145], tone: "warning" }]}
          />
          <Caption>
            3,755 shoplifting incidents · D4 1,291 (34%) · Back Bay retail
            corridor
          </Caption>
        </Stack>
      </Grid>
      <H3>2024 district workload</H3>
      <Table
        headers={["District", "Incidents", "Serious violence", "Service %", "Shoplifting"]}
        columnAlign={["left", "right", "right", "right", "right"]}
        rows={[
          ["D4 South End / Back Bay", "11,319", "329", "44%", "1,291"],
          ["B2 Roxbury", "10,540", "371", "45%", "198"],
          ["A1 Downtown", "9,342", "378", "43%", "692"],
          ["C11 Dorchester", "9,276", "324", "39%", "509"],
          ["B3 Mattapan", "8,124", "291", "49%", "97"],
          ["C6 South Boston", "6,486", "194", "41%", "334"],
          ["D14 Brighton", "5,428", "114", "46%", "114"],
          ["E13 Jamaica Plain", "4,746", "116", "47%", "165"],
          ["A7 East Boston", "4,289", "122", "49%", "94"],
          ["E18 Hyde Park", "4,143", "100", "48%", "103"],
          ["E5 West Roxbury", "3,738", "68", "47%", "134"],
          ["A15 Charlestown", "1,392", "42", "47%", "10"],
        ]}
        rowTone={[
          "warning", "danger", undefined, "danger", "danger", undefined,
          undefined, undefined, undefined, undefined, undefined, undefined,
        ]}
      />
      <Caption>
        Source: 2024 unique incidents · service % = non-crime service /
        district total · B3 has the highest service share and almost no
        shoplifting
      </Caption>
    </Stack>
  );
}

function SectionQuality() {
  return (
    <Stack gap={12}>
      <H2>What we counted</H2>
      <Table
        headers={["Quality check", "Records"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Raw RMS rows (all files)", "947,034"],
          ["Unique incidents after collapse", "904,961"],
          ["2015–2018 multi-offense incidents", "31,269"],
          ["2015 (partial: 15 Jun–31 Dec)", "46,966"],
          ["2016–2025 complete years", "806,206"],
          ["2024 incidents", "79,124"],
          ["2025 incidents", "81,162"],
          ["2026 YTD through mid-August", "51,789"],
          ["Shooting victims (separate file)", "2,250"],
          ["Shots-fired incidents", "9,533"],
        ]}
      />
      <Text size="small" tone="secondary">
        2015–2018 files list one row per offense; we keep one incident and
        assign the most serious offense. 2019+ is already one row per
        incident. UCR Part and offense-group fields go blank after 2018, so
        mix is classified from description and code. Midnight hour is
        inflated by unknown times. Some high-count streets (Gibson St C11,
        Harrison Ave D4) include district / hospital reporting. Shootings are
        victims; one incident can have several. Crime-gun recoveries are
        daily citywide totals, not geocoded.
      </Text>
    </Stack>
  );
}

function SectionAsksCity() {
  return (
    <Stack gap={12}>
      <H2>Decisions for the Mayor and Council</H2>
      <Callout tone="danger" title="1. Do not trade B2 / B3 / C11 strength for D4 paper">
        Shootings are down, not gone: 120 victims in 2025, 72% still in
        three districts. D4’s volume is shoplifting and sick-assist. A
        2.7% serious-violence rate is not a staffing formula.
      </Callout>
      <Callout tone="warning" title="2. Take sick-assist and investigate-person off the sworn tape">
        18,653 of those two in 2025. Co-response, EMS, and civilian
        report-takers. Each one still leaves a sector car unavailable in the
        district that still has the guns.
      </Callout>
      <Callout tone="info" title="3. Treat Back Bay shoplifting as a retail problem, not a reason to strip Roxbury">
        4,340 shoplifting incidents in 2025. D4 is 34% of the 2024 count.
        Boylston, Newbury, Downtown Crossing. Store security, civilian
        larceny teams, and online reporting — not B2 overtime.
      </Callout>
      <Callout tone="success" title="4. Keep focused deterrence where the victims actually are">
        B2, B3, C11, then E13. That map has not moved in 11 years. Crime-gun
        recoveries are still ~590 a year. The street is not disarmed.
      </Callout>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={20}>
      <Callout tone="warning" title="We are still busy. Boston is not more violent.">
        Incidents −8% since 2016, −7% vs 2019. Serious violence −41% since
        2016. Shooting victims 190 (2019) → 120 (2025). 2020 is COVID: fewer
        reports, more shootings — do not use it as the before picture. In
        2025, 47% of reports were non-crime service. D4 took the volume
        lead; B2 still owns the guns.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="81,162" label="Incidents in 2025 · 222 a day" />
        <Stat value="2.7%" label="Share that were serious violence" tone="success" />
        <Stat value="120" label="Shooting victims, 2025" tone="success" />
        <Stat value="72%" label="Victims in B2+B3+C11" tone="danger" />
      </Grid>
      <Table
        headers={["Finding", "Number"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Incidents, 2016 → 2025 (skip 2020)", "87,994 → 81,162 (−8%)"],
          ["Serious violence, 2016 → 2025", "3,756 → 2,213 (−41%)"],
          ["Shooting victims, 2019 → 2025", "190 → 120 (−37%)"],
          ["2020 COVID: reports / shootings", "70,894 (−19%) · 274 victims (+44%)"],
          ["Investigate person + sick assist, 2025", "18,653 · 23% of all reports"],
          ["Shoplifting, 2016 → 2025", "2,453 → 4,340 (+77%)"],
          ["BPD overtime, 2025", "$102M · 56% of all city OT"],
        ]}
        rowTone={["info", "success", "success", "warning", "warning", "warning", "danger"]}
      />
      <Text>
        Open Overview for the citywide trend (2020 is COVID), Guns for
        shootings and recoveries, Department for how to run the districts,
        City / Mayor for policy, Efficiency / OT for how to cut wasted
        assignments without thinning the gun districts, Public for plain
        language.
      </Text>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={28}>
      <Grid columns={4} gap={16}>
        <Stat value="81,162" label="Incidents in 2025" />
        <Stat value="222" label="Average reports per day" />
        <Stat value="2,213" label="Serious violence in 2025" tone="success" />
        <Stat value="51,789" label="2026 YTD through mid-August" />
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
      <Callout tone="info" title="For Superintendents, district captains, and CompStat">
        Staff to the clock and the gun districts, not to the 3% serious
        share. D4 owns retail theft. B2 / B3 / C11 own shootings. Midnight
        is not a real peak — unknown times dump there. 4–5 p.m. is.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="4–5 p.m." label="Peak total demand and violence" />
        <Stat value="D4 / B2" label="Busiest vs highest shooting share" />
        <Stat value="Friday" label="Heaviest weekday" />
      </Grid>
      <SectionClock />
      <Divider />
      <SectionWorkload />
      <Divider />
      <H2>What each shop should take from this</H2>
      <Table
        headers={["Shop", "Use this"]}
        rows={[
          ["Operations", "4–5 p.m. peak for all-calls and violence. Do not thin nights only because volume is lower — fatal shootings still happen after midnight."],
          ["D4 (South End / Back Bay)", "Highest raw volume (12,762 in 2025). 1,559 shoplifting. Boylston and Newbury. Civilian larceny / retail liaison, not pulling cars from B2."],
          ["B2, B3, C11", "72% of shooting victims. First-due strength stays. B3 is 50% service — divert sick-assist there so cars are free for shots fired."],
          ["A1 Downtown", "Second shoplifting district (770) plus downtown assaults. Not the gun map."],
          ["BOS / detectives", "Crime-gun recoveries still ~590/year. Shootings fell vs 2019; guns did not. Trace and group-violence work still has a supply to go after."],
          ["EMS / co-response", "Sick assist 9,718 in 2025. This is the Fire public-service problem in a different uniform."],
        ]}
      />
    </Stack>
  );
}

function TabCity() {
  return (
    <Stack gap={28}>
      <Callout tone="warning" title="For the Mayor: safer on guns than 2019, more expensive on everything else.">
        Boston had 37% fewer shooting victims than in 2019 (pre-COVID) and
        41% less serious violence than in 2016. 2020 is the COVID spike, not
        the before-picture. The department still closed 81,162 incidents in
        2025 because service and shoplifting took over the tape. Police
        overtime is $102 million — 56% of all city overtime. Gun detail is
        on the Guns tab.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="−41%" label="Serious violence since 2016" tone="success" />
        <Stat value="−8%" label="Total incidents since 2016" />
        <Stat value="$102M" label="BPD overtime, 2025" tone="danger" />
        <Stat value="72%" label="Shooting victims in 3 districts" tone="danger" />
      </Grid>
      <SectionMix />
      <Divider />
      <SectionRoxbury />
      <Divider />
      <SectionShootings />
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
        These are Boston Police’s official incident records, 2016 through
        2025, plus the separate shootings, shots-fired, and gun-recovery
        files. One report is not always one crime — officers also write up
        sick people, towed cars, and “investigate person.”
      </Text>
      <Callout tone="success" title="Serious violence is down — measure it against 2019, not 2020.">
        Shooting victims went from 190 in 2019 to 120 in 2025 (−37%). 2020
        was COVID: 274 victims, the peak, not the baseline. Fatal shootings
        went from 28 (2019) to 19 (2025). Robbery, aggravated assault, and
        homicide as a group fell about 40% from 2016.
      </Callout>
      <Callout tone="warning" title="If you see police a lot, it is often not a shooting.">
        In 2024, only about 3 in 100 reports were serious violence. Almost
        half were non-crime work: checking on a person, helping someone who
        is sick, towing a car, a verbal dispute, or lost property.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="3 of 100" label="Reports that were serious violence in 2024" tone="success" />
        <Stat value="23 of 100" label="2025 reports that were investigate-person or sick assist" tone="warning" />
        <Stat value="3 districts" label="Where 7 in 10 shooting victims still are" tone="danger" />
      </Grid>
      <H3>The report that happens in every neighborhood</H3>
      <Text>
        Investigate-person and sick-assist are the number-one and
        number-two workloads citywide — not just in Roxbury. Shoplifting is
        the growth crime, and it is concentrated on Boylston, Newbury, and
        Downtown Crossing, not on Blue Hill Avenue.
      </Text>
      <BarChart
        horizontal
        height={200}
        categories={[
          "Non-crime service",
          "Property crime",
          "Motor vehicle",
          "Violence (all, incl. threats)",
          "Drugs",
        ]}
        series={[
          { name: "2024 incidents", data: [35358, 18403, 13069, 8794, 1998], tone: "info" },
        ]}
      />
      <Caption>Source: 79,124 unique incidents, 2024</Caption>
      <H3>Where shootings concentrate</H3>
      <Text>
        Roxbury, Mattapan, and Dorchester have had most of the city’s
        shooting victims every year for 11 years — about 7 in 10. That is
        not a one-year blip. Downtown and the South End generate a lot of
        police paper. They do not generate the gun deaths.
      </Text>
      <Table
        headers={["Neighborhood (district)", "Shooting victims, 2015–2025"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Roxbury (B2)", "666"],
          ["Mattapan (B3)", "573"],
          ["Dorchester (C11)", "384"],
          ["Jamaica Plain (E13)", "170"],
          ["South End / Back Bay (D4)", "104"],
        ]}
        rowTone={["danger", "danger", "danger", "warning", undefined]}
      />
      <H3>What you can do</H3>
      <Table
        headers={["If you live here", "Know this"]}
        rows={[
          ["Any neighborhood", "Most police responses are not shootings. Call 911 for violence. Use 311 / online for lost property and many larcenies."],
          ["Roxbury, Mattapan, Dorchester", "This is still where gun violence concentrates. Group-violence work belongs here, not a citywide pamphlet."],
          ["Back Bay / Downtown Crossing", "You will see more police for shoplifting than for shootings. That is the data."],
          ["Near a hospital or district station", "Some streets look busy on the map because reports are written there, not because every incident happened on that block."],
        ]}
      />
    </Stack>
  );
}

function TabEfficiency() {
  return (
    <Stack gap={24}>
      <Callout
        tone="warning"
        title="Efficient police departments do not run fewer officers in the gun districts. They run fewer wasted assignments."
      >
        Same lesson as Fire. Tokyo, London, NYPD, and US cities that get
        praised for productivity do three things: send a civilian or
        co-responder when the call is not a crime, take volume property
        crime off the sworn tape, and stop covering vacancies with overtime
        as the default. Boston’s incident file and payroll file point at the
        same gap.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="$102M" label="BPD overtime, 2025 (19% of pay)" tone="danger" />
        <Stat value="3,094" label="BPD people on the 2025 earnings file" />
        <Stat value="18,653" label="Investigate-person + sick assist, 2025" tone="warning" />
        <Stat value="56%" label="Share of all city overtime, 2025" />
      </Grid>
      <H2>What the efficient services actually do</H2>
      <Table
        headers={["Service", "Practice", "Why it matches Boston’s tape"]}
        rows={[
          [
            "NYPD / many US PDs — online reporting",
            "Theft from person, shoplifting, lost property, and many MV leaving-scene reports can be taken online or by a civilian, not a sector car.",
            "4,340 shoplifting + 2,796 lost-property + 4,687 leaving-scene in 2024. That is a report factory, not a radio car problem.",
          ],
          [
            "CAHOOTS (Eugene) / NYC B-HEARD / STAR (Denver)",
            "Behavioral-health and sick-person calls get a medic + clinician. Police only if there is a weapon or crime.",
            "Sick assist 9,718 in 2025. B3 is 49% service. Every one of those cars is not sitting on Blue Hill Avenue for a shots-fired.",
          ],
          [
            "London Met / UK volume-crime units",
            "Dedicated civilian investigators for theft and fraud. Patrol stays on harm.",
            "Property crime is 23% of 2024. Serious violence is 3%. The same officer should not be the default for both.",
          ],
          [
            "Boston’s own history — Operation Ceasefire / GVI",
            "Focus on the small number of groups that produce shootings. Do not confuse that with citywide patrol for shoplifting.",
            "72% of victims in three districts, every year. The map has not moved. The volume map has.",
          ],
          [
            "San Diego / vacancy math (same as Fire)",
            "Most OT is empty seats and a wrong relief factor — not extra crime. Hire into a relief pool.",
            "BPD 2025: 3,094 people, $102M OT, 18.8% attrition. 2024’s 3,491 roster was a bulge, not a new normal.",
          ],
        ]}
      />
      <Caption>
        Sources: City of Boston 2025 earnings file; BPD RMS 2024–2025;
        BPD shootings file. Peer practices are published operating models,
        not a claim that those cities are “safer.”
      </Caption>
      <H2>Boston vs that model — using our files</H2>
      <Text>
        2025 incidents (81,162) and the 2025 earnings file (3,094 people,
        $534M gross, $102M overtime). Serious violence is 2.7% of the tape.
        The department is staffed like a gun-violence force and run like a
        report-taking / sick-assist force — except the overtime still
        concentrates on police, not on the civilians who could take the
        paper.
      </Text>
      <Table
        headers={["Boston fact", "Efficient-department move", "Staff and OT"]}
        rows={[
          [
            "9,718 sick assist (2025). 8,833 in 2024. B3 49% service.",
            "Co-responder / EMS for sick and behavioral calls unless a weapon or crime is reported.",
            "If half of sick-assist leaves the sworn tape, that is ~4,800 car-hours a year back — concentrated in B2/B3/C11 where shots still happen.",
          ],
          [
            "8,935 investigate-person + 3,515 investigate-property (2025).",
            "Triage: crime or welfare check with a threat stays sworn. The rest goes to a civilian report desk or 311 callback.",
            "Together with sick-assist these are 23% of 2025. That is Fire’s false-alarm + public-service problem.",
          ],
          [
            "4,340 shoplifting, 34% of 2024 in D4. Boylston 634, Newbury 293, Washington A1 353.",
            "Retail liaison + civilian larceny teams + online reporting. Store security first. Arrest teams for repeat offenders, not a sector car for every $40 theft.",
            "D4 volume is not a reason to move bodies out of B2. It is a reason to change how D4 takes the report.",
          ],
          [
            "3,492 towed vehicles + 2,796 lost property (2024).",
            "Parking / tow contractor and online lost-property. Police if the car is a crime scene.",
            "Hours back on the 4–5 p.m. peak. These codes do not need a gun.",
          ],
          [
            "$102M overtime, 18.8% attrition, median $179k. All 20 highest-paid 2025 city employees are BPD.",
            "Hire to the relief factor in B2/B3/C11. Stop using OT as the default empty-seat filler (same finding as Fire).",
            "2024’s 3,491 headcount was retro/roster bulge. 2025 is 3,094. OT did not fall in proportion to shootings.",
          ],
        ]}
      />
      <H3>Shift work off Police — other city departments</H3>
      <Text>
        These 2024–2025 codes are how the job was closed — not how to ignore
        a 911 call. If the caller reports a weapon, a shooting, a robbery in
        progress, or an assault, Police go.
      </Text>
      <Table
        headers={["2025 work", "Count", "Move to", "What Police keeps"]}
        columnAlign={["left", "right", "left", "left"]}
        rows={[
          ["Sick assist", "9,718", "Boston EMS / co-responder", "Weapon, crime, or no EMS unit"],
          ["Investigate person", "8,935", "Civilian report desk / 311 callback", "Threat, missing child, or crime in progress"],
          ["Shoplifting", "4,340", "Online report + retail liaison; repeat-offender squad", "Force, organized retail, weapon"],
          ["Towed motor vehicle", "3,771", "Tow contractor / Parking", "Stolen car or crime scene"],
          ["Investigate property", "3,515", "Civilian report / online", "Burglary in progress or open door with suspect"],
          ["Verbal dispute", "1,743", "311 / community dispute, unless it is becoming an assault", "Any weapon or injury"],
        ]}
        rowTone={["info", "info", "warning", undefined, undefined, undefined]}
      />
      <H3>Shift people inside Police</H3>
      <Table
        headers={["From", "To", "Why"]}
        rows={[
          [
            "Citywide overtime list (callback to wherever a seat is empty)",
            "A relief / float pool assigned first to B2, B3, C11",
            "OT today follows vacancies. New regular seats should follow shootings.",
          ],
          [
            "Sworn cars taking shoplifting on Boylston",
            "Civilian larceny / retail team in D4 and A1",
            "D4 is #1 for paper and #6 for shooting victims. Do not staff it like B2.",
          ],
          [
            "Sector cars on sick-assist in B3 (49% service)",
            "Co-responder so the car is available for shots-fired on Blue Hill Ave",
            "B3 is 25% of shooting victims and almost none of the shoplifting.",
          ],
        ]}
      />
      <Callout tone="warning" title="Do not transfer B2 officers into a 311 shop to ‘save’ Police’s budget.">
        Move the calls, not the sector cars, unless you are building a
        dedicated civilian report unit. Taking 50 officers out of Roxbury
        to staff shoplifting reports would raise overtime and slow the
        first car in the districts that still have 72% of shooting victims.
      </Callout>
      <Table
        headers={["Step", "Action", "Staff burden", "City money"]}
        rows={[
          [
            "1. Hire into gun districts, not onto the OT list",
            "Fill B2/B3/C11 vacancies first. 2025 attrition was 18.8%.",
            "Down — fewer people working a second tour in the districts that still have the victims.",
            "Same hours today are time-and-a-half. Net savings only if OT tours actually fall.",
          ],
          [
            "2. Sick-assist / co-response",
            "Pilot with EMS in B3 and B2: sick and behavioral calls without a weapon.",
            "Down immediately in the highest-service, high-shooting districts.",
            "Hours back. OT falls if those hours were holdovers and backfill.",
          ],
          [
            "3. Civilian / online volume crime",
            "Shoplifting, lost property, leaving-scene, investigate-property without a suspect.",
            "Down on the 4–5 p.m. peak, especially D4 and A1.",
            "Sworn hours back to B2. D4 still needs a retail team, not 11,000 sworn reports.",
          ],
          [
            "4. Focused deterrence stays put",
            "GVI / group violence in B2, B3, C11. Crime-gun tracing stays funded.",
            "This is not a cut. Shootings are down; guns recovered are not.",
            "Avoided homicides. Slow, but it is the violence problem.",
          ],
        ]}
        rowTone={["danger", "warning", "warning", "success"]}
      />
      <Callout tone="danger" title="Do not ‘save’ OT by thinning the gun districts.">
        Shootings fell vs 2019, not just vs the 2020 COVID spike, and still
        sit in the same three districts. A smaller on-duty force in
        B2/B3/C11 means more callback, more overtime, and a slower first
        car. Efficient departments cut wasted assignments and fill
        vacancies — not the districts that produce 72% of the victims.
      </Callout>
      <H3>Hours we can give back without a study committee</H3>
      <BarChart
        horizontal
        height={220}
        categories={[
          "Sick assist, 2025",
          "Investigate person, 2025",
          "Shoplifting, 2025",
          "Serious violence, 2025",
          "Shooting victims, 2025",
        ]}
        series={[
          { name: "2025 counts", data: [9718, 8935, 4340, 2213, 120], tone: "warning" },
        ]}
      />
      <Caption>
        Source: 2025 RMS + shootings file · first three bars are the
        efficiency target · last two are what we must keep staffing for
      </Caption>
      <Text size="small" tone="secondary">
        Overtime and headcount from the City of Boston 2025 earnings file
        (BPD 3,094 people, $102M OT, $534M gross). Incidents from cleaned RMS
        (81,162 unique incidents). One calendar year for payroll; 2016–2025
        for the trend. No tour-level OT reason code, so callback vs court vs
        holdover cannot be split. 2024 headcount (3,491) is a roster bulge
        and should not be used as the baseline.
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
      <SectionRoxbury />
      <Divider />
      <TabGuns />
      <Divider />
      <SectionCommonCrime />
      <Divider />
      <SectionClock />
      <Divider />
      <SectionWorkload />
      <Divider />
      <SectionAsksCity />
      <Divider />
      <TabEfficiency />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

export default function BostonPoliceCityBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston Police Department — incident analysis</H1>
        <Text tone="secondary">
          Cleaned RMS records, 2016–2025, plus shootings, shots fired, and
          gun recoveries through mid-August 2026. One incident per report
          number. 2025 is the last complete year.
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
      {tab === "guns" ? <TabGuns /> : null}
      {tab === "city" ? <TabCity /> : null}
      {tab === "public" ? <TabPublic /> : null}
      {tab === "efficiency" ? <TabEfficiency /> : null}
      {tab === "full" ? <TabFull /> : null}
    </Stack>
  );
}
