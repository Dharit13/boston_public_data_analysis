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

const PERMITS = [
  38478, 40673, 43758, 43541, 44703, 45030, 43919, 45291,
  32112, 37897, 39918, 38546, 37345, 36801,
];
const VALUATION = [
  5468288516, 5895963309, 6892694613, 8615553151, 8822482304,
  10869332452, 10066294377, 11090742466, 8559637173, 11795342755,
  16631986639, 17663308331, 13101493874, 12463006184,
];

const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_2025 = [
  282, 259, 145, 97, 131, 92, 33, 28, 76, 177, 407, 1014,
  3212, 4273, 4492, 4577, 4190, 3388, 3400, 3079, 1733, 871, 547, 298,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2025 = [
  2993, 2415, 2975, 2824, 3016, 2932, 3513, 3453, 3224, 3879, 2795, 2782,
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2025 = [6781, 8115, 7720, 7315, 6387, 309, 174];

const TYPE_LABELS = [
  "Short Form Bldg Permit",
  "Electrical Permit",
  "Plumbing Permit",
  "Gas Permit",
  "Long Form/Alteration Permit",
  "Electrical Low Voltage",
  "Electrical Fire Alarms",
  "Certificate of Occupancy",
];
const TYPE_2025 = [11442, 8615, 4995, 2943, 2889, 1967, 1665, 1199];

const SHORT_FORM = [
  10657, 11298, 11719, 12544, 12235, 12193, 12096, 12372,
  8979, 12075, 11819, 11670, 11714, 11442,
];
const ELECTRICAL = [
  7667, 8162, 8915, 8881, 9136, 9071, 9580, 9782,
  7084, 8731, 9365, 9057, 9096, 8615,
];
const PLUMBING = [
  5457, 5659, 6144, 5663, 5969, 6367, 5901, 6352,
  4334, 4987, 5447, 5261, 5081, 4995,
];
const GAS = [
  4167, 4300, 4839, 4266, 4422, 4807, 4329, 4759,
  3242, 3519, 3730, 3375, 3056, 2943,
];
const LONG_FORM = [
  2570, 2986, 2951, 3190, 3168, 2969, 3021, 3021,
  2217, 2426, 2718, 2808, 2383, 2889,
];

const OCC_LABELS = [
  "1–2 family",
  "Commercial",
  "Multifamily",
  "1–3 family",
  "Mixed",
  "Other",
  "1–4 family",
  "Vacant land",
];
const OCC_2025 = [14501, 9924, 4480, 3693, 1511, 1284, 1181, 227];

const VAL_OCC_LABELS = [
  "Commercial",
  "Mixed",
  "Multifamily",
  "Other",
  "1–2 family",
  "1–3 family",
];
const VAL_OCC_2025 = [
  6084858077, 2469198483, 1719971551, 1080898137, 797415981, 207761351,
];

const NB_LABELS = [
  "Dorchester",
  "Back Bay / Bay Village",
  "Jamaica Plain",
  "Hyde Park",
  "West Roxbury",
  "Roslindale",
  "South Boston",
  "East Boston",
  "Brighton",
  "South End",
  "Fenway / Longwood",
  "Financial District / Waterfront",
];
const NB_2025 = [
  4779, 2694, 2275, 2263, 2208, 1995, 1851, 1741, 1622, 1468, 1461, 1321,
];

const ZBA_YEARS = [
  "2014", "2015", "2016", "2017", "2018", "2019",
  "2020", "2021", "2022", "2023", "2024", "2025",
];
const ZBA = [1167, 1399, 1528, 1445, 1787, 1616, 1164, 1189, 1447, 1086, 883, 906];

type TabId = "summary" | "overview" | "department" | "city" | "public" | "full";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Overview" },
  { id: "department", label: "Department" },
  { id: "city", label: "City / Mayor" },
  { id: "public", label: "Public" },
  { id: "full", label: "Full analysis" },
];

const TAB_BLURB: Record<TabId, string> = {
  summary: "Six findings. Numbers a reader can take into a meeting.",
  overview:
    "Citywide approved building permits. 2020 is COVID — not a baseline. 2026 is not a full year. ZBA is a separate file.",
  department:
    "What ISD needs: issuance clock, weekday load, short-form and trade mix. issued_date is not construction hours.",
  city: "What the Mayor and Council need: fewer permits than 2019, more declared value. Do not add ZBA into permit totals.",
  public:
    "Plain language: most 2025 permits are short-form and trades, not Erect/New Construction.",
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
      <H2>Fewer permits than 2019. More declared value.</H2>
      <Text>
        Use 2019 as the last normal pre-COVID year, not 2020. Approved
        building permits peaked at 45,291 in 2019 (124.1 a day). 2025 is
        36,801 — 100.8 a day, 18.7% below 2019. Declared valuation moved
        the other way: $12.46 billion in 2025 against $11.09 billion in
        2019 (+12.4%). Peak declared value was 2023 ($17.66 billion), not
        the peak-count year.
      </Text>
      <Callout tone="warning" title="2020 is a COVID year. Do not use it as a baseline.">
        Permits fell 29.1% in 2020 (45,291 → 32,112). Compare 2025 to
        2019, then show 2020 as the shock.
      </Callout>
      <Callout tone="danger" title="2026 is not a full year.">
        Issued permits in this dump run through 29 August 2026 (24,086
        year-to-date, 99.9 a day). Do not annualize that figure, and do
        not treat 24,086 as a calendar year.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="36,801" label="Permits in 2025 · 100.8 a day" />
        <Stat value="−18.7%" label="Permits vs 2019 (45,291)" tone="info" />
        <Stat value="$12.46B" label="Declared valuation, 2025" />
        <Stat value="+12.4%" label="Valuation vs 2019 ($11.09B)" tone="info" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Approved building permits per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            fill
            series={[{ name: "Permits", data: PERMITS, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · issued_date
            · 2012–2025 complete years · 2026 YTD omitted (through 29 Aug,
            24,086)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Declared valuation per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[{ name: "Declared valuation", data: VALUATION, tone: "warning" }]}
            valueSuffix=" dollars"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits ·
            declared_valuation · 2012–2025 complete years · dollars as
            recorded · 2023 peak $17.66 billion
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionMix() {
  return (
    <Stack gap={12}>
      <H2>Most 2025 permits are short-form and trades, not Erect/New Construction.</H2>
      <Text>
        Short Form Bldg Permit is 11,442 of 36,801 (31.1%). Electrical,
        plumbing, and gas add 16,553. Erect/New Construction is 210
        (0.57%). Occupancy is an exact code, not a substring: 1–2 family
        is 14,501 permits (39.4%) but only $797 million of declared
        value (6.4%). Commercial is 9,924 permits and $6.08 billion
        (48.8% of value).
      </Text>
      <Callout tone="warning" title="Do not add ZBA cases into the permit year series.">
        Zoning Board of Appeal recorded 906 dated cases in 2025 against
        1,616 in 2019. That is a different file from 36,801 issued
        permits. Brief them side by side.
      </Callout>
      <Grid columns="1.1fr 0.9fr" gap={24}>
        <Stack gap={8}>
          <H3>2025 permit types (top 8)</H3>
          <BarChart
            horizontal
            height={260}
            categories={TYPE_LABELS}
            series={[{ name: "2025 permits", data: TYPE_2025, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits ·
            permittypedescr · 2025 · top 8 of 36,801 · Erect/New
            Construction is 210 and is not in this top 8
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 occupancy mix</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "1–2 family", value: 14501, tone: "info" },
              { label: "Commercial", value: 9924, tone: "warning" },
              { label: "Multifamily", value: 4480, tone: "neutral" },
              { label: "1–3 family", value: 3693 },
              { label: "Mixed", value: 1511 },
              { label: "Other", value: 1284 },
              { label: "1–4 family", value: 1181 },
              { label: "Vacant land", value: 227 },
            ]}
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · occupancytype
            exact codes · 2025 (n = 36,801)
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>Permit type mix, 2012–2025</H3>
        <BarChart
          categories={YEARS}
          height={240}
          stacked
          normalized
          valueSuffix="%"
          series={[
            { name: "Short Form Bldg Permit", data: SHORT_FORM, tone: "info" },
            { name: "Electrical Permit", data: ELECTRICAL, tone: "neutral" },
            { name: "Plumbing Permit", data: PLUMBING },
            { name: "Gas Permit", data: GAS },
            { name: "Long Form/Alteration Permit", data: LONG_FORM, tone: "warning" },
          ]}
        />
        <Caption>
          Source: Analyze Boston Approved Building Permits ·
          permittypedescr · 2012–2025 complete years · share of these five
          types, not of all permits
        </Caption>
      </Stack>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 permits by occupancy</H3>
          <BarChart
            horizontal
            height={220}
            categories={OCC_LABELS}
            series={[{ name: "2025 permits", data: OCC_2025, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · occupancytype
            · 2025 · 1–2 family 14,501
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 declared valuation by occupancy</H3>
          <BarChart
            horizontal
            height={220}
            categories={VAL_OCC_LABELS}
            series={[{ name: "Declared valuation", data: VAL_OCC_2025, tone: "warning" }]}
            valueSuffix=" dollars"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits ·
            declared_valuation by occupancytype · 2025 · top 6 ·
            Commercial $6.08 billion · 1–2 family $797 million
          </Caption>
        </Stack>
      </Grid>
      <Table
        headers={["Measure", "2019", "2025", "Change"]}
        columnAlign={["left", "right", "right", "right"]}
        rows={[
          ["Issued permits", "45,291", "36,801", "−18.7%"],
          ["Declared valuation", "$11.09B", "$12.46B", "+12.4%"],
          ["Total fees", "$70.1M", "$53.2M", "−24.1%"],
          ["Erect/New Construction", "—", "210", "0.57% of 2025"],
          ["ZBA dated cases (separate file)", "1,616", "906", "−43.9%"],
        ]}
        rowTone={["info", "warning", undefined, "info", "danger"]}
      />
      <Caption>
        Source: Analyze Boston Approved Building Permits and Zoning Board
        of Appeal Decisions · complete years 2019 and 2025 · do not add
        906 into 36,801
      </Caption>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>Issuance peaks at 3 p.m. on weekdays, not on the weekend.</H2>
      <Text>
        In 2025 the busiest issued_date hour is 3 p.m. (4,577 permits).
        The quietest is 7 a.m. (28). Tuesday is heaviest (8,115); Sunday
        is lightest (174); Saturday is 309. October is the peak month
        (3,879); February is the lightest (2,415). This clock is when
        ISD recorded the issue timestamp — not when crews were on site.
      </Text>
      <Callout tone="info" title="issued_date hour is not construction hours.">
        After-hours construction is a different Analyze Boston file and is
        not in this briefing (junk dates include 1753 and 2202). Do not
        read 3 p.m. as a job-site peak.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 permits by issued hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "Permits", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · issued_date
            hour · 2025 · peak 3 p.m. (4,577) · quietest 7 a.m. (28)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 permits by weekday</H3>
          <BarChart
            categories={WEEKDAYS}
            height={200}
            series={[{ name: "Permits", data: WEEKDAY_2025, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · issued_date
            weekday · 2025 · Tuesday 8,115 · Sunday 174 · Saturday 309
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>2025 permits by month</H3>
        <BarChart
          categories={MONTHS}
          height={200}
          series={[{ name: "Permits", data: MONTH_2025, tone: "info" }]}
          valueSuffix=" permits"
        />
        <Caption>
          Source: Analyze Boston Approved Building Permits · issued_date
          month · 2025 · October 3,879 · February 2,415 · a complete
          calendar year
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionPlace() {
  return (
    <Stack gap={12}>
      <H2>Dorchester leads only as three ZIPs rolled together.</H2>
      <Text>
        Neighborhood is ZIP via the Fire ZIP_NEIGHBORHOOD map — not a
        neighborhood field on the permit. Dorchester is 02122 + 02124 +
        02125 (4,779). Roxbury, Mission Hill / Roxbury, and Roxbury /
        Dorchester are separate map labels, so Roxbury 02119 does not
        appear in this top 12. Chart is the top 12 ZIP neighborhoods of
        36,801.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Top ZIP neighborhoods, 2025 permits</H3>
          <BarChart
            horizontal
            height={280}
            categories={NB_LABELS}
            series={[{ name: "2025 permits", data: NB_2025, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · ZIP via Fire
            ZIP_NEIGHBORHOOD · 2025 · top 12 of 36,801 · Dorchester =
            02122, 02124, 02125
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 status as recorded</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Closed", value: 19251, tone: "success" },
              { label: "Open", value: 17550, tone: "warning" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · status ·
            2025 · Closed 19,251 · Open 17,550 · Open = still valid;
            Closed = expired (City data dictionary), not work finished
          </Caption>
        </Stack>
      </Grid>
      <Table
        headers={["ZIP neighborhood", "2025 permits", "What the map is"]}
        columnAlign={["left", "right", "left"]}
        rows={[
          ["Dorchester", "4,779", "02122 + 02124 + 02125"],
          ["Back Bay / Bay Village", "2,694", "02116 + 02199"],
          ["Jamaica Plain", "2,275", "02130"],
          ["Hyde Park", "2,263", "02136"],
          ["West Roxbury", "2,208", "02132"],
          ["Roslindale", "1,995", "02131"],
        ]}
        rowTone={["info"]}
      />
      <Caption>
        Source: Analyze Boston Approved Building Permits · 2025 · ZIP
        neighborhood from common.ZIP_NEIGHBORHOOD · Roxbury 02119 is a
        different map label from Dorchester and is outside this top 12
      </Caption>
    </Stack>
  );
}

function SectionZba() {
  return (
    <Stack gap={12}>
      <H2>ZBA is a different file. Do not add ZBA into permit totals.</H2>
      <Text>
        The Zoning Board of Appeal tracker has 16,394 rows; 16,392 have a
        usable date after falling back from submitted_date to
        received_date to final_decision_date (submitted_date is often
        null). 2013 has 350 dated cases against 1,167 in 2014; the chart
        below starts in 2014. 2025 is 906 dated cases against 1,616 in
        2019 (−43.9%). 2026 is 425 through 28 August — not a full year.
      </Text>
      <Callout tone="danger" title="Do not add ZBA counts into the permit year series.">
        36,801 issued permits and 906 ZBA cases in 2025 are not a
        combined construction total.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="906" label="ZBA dated cases, 2025" />
        <Stat value="1,616" label="ZBA dated cases, 2019" />
        <Stat value="13,074" label="Approved / AppProv, all years" />
        <Stat value="425" label="ZBA 2026 YTD through 28 Aug" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>ZBA dated cases per year</H3>
          <LineChart
            categories={ZBA_YEARS}
            height={200}
            fill
            series={[{ name: "ZBA cases", data: ZBA, tone: "warning" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: Analyze Boston Zoning Board of Appeal Decisions ·
            submitted / received / final_decision_date · 2014–2025 · 2013
            (350 vs 1,167 in 2014) omitted · 2026 YTD omitted (425
            through 28 Aug)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>ZBA classified decision as recorded</H3>
          <PieChart
            donut
            size={200}
            data={[
              { label: "Approved", value: 13074, tone: "success" },
              { label: "Denied", value: 1398, tone: "danger" },
              { label: "Withdrawn", value: 433, tone: "warning" },
              { label: "Void", value: 8, tone: "neutral" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Zoning Board of Appeal Decisions ·
            decision exact codes (AppProv + Approved → Approved; Denied +
            DeniedPrej → Denied) · 13,074 of 16,392 dated cases · 1,479
            have no decision recorded
          </Caption>
        </Stack>
      </Grid>
      <Table
        headers={["Zoning district as recorded", "2025 cases"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Dorchester Neighborhood", "140"],
          ["South Boston Neighborhood", "75"],
          ["Jamaica Plain Neighborhood", "75"],
          ["Hyde Park Neighborhood", "70"],
          ["West Roxbury Neighborhood", "67"],
          ["Roxbury Neighborhood", "62"],
          ["Roslindale Neighborhood", "59"],
          ["Allston/Brighton Neighborhood", "54"],
        ]}
      />
      <Caption>
        Source: Analyze Boston Zoning Board of Appeal Decisions ·
        zoning_district as recorded · 2025 · top 8 of 906
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
            "Permits kept 661,589 of 661,589 rows",
            "issued_date span 2006-09-26 to 2026-08-29. Complete years 2012–2025.",
          ],
          [
            "ZBA kept 16,392 of 16,394 rows",
            "Date fallback: submitted, then received, then final_decision. Span 2013-01-31 to 2026-08-28.",
          ],
          [
            "2026 is not a full year",
            "Permits through 29 Aug (24,086). ZBA through 28 Aug (425).",
          ],
          [
            "Compare 2025 to 2019, not 2020",
            "2020 COVID. Permits −29.1% (45,291 → 32,112).",
          ],
          [
            "Do not add ZBA 906 to permits 36,801",
            "Different files. Occupancy and ZBA decisions are exact codes, not substrings.",
          ],
          [
            "After-hours construction is not in this briefing",
            "That dump has junk dates (1753, 2202). issued_date hour is ISD issuance.",
          ],
        ]}
        rowTone={["success", "info", "warning", "warning", "danger", "warning"]}
      />
      <Caption>
        Source: Analyze Boston datasets approved-building-permits and
        zoning-board-of-appeal-decisions · dumps pulled 31 Aug 2026
      </Caption>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={20}>
      <Callout
        tone="warning"
        title="Permit counts fell versus 2019. Declared valuation did not."
      >
        Approved building permits were 36,801 in 2025 against 45,291 in
        2019 (−18.7%). Declared valuation was $12.46 billion against
        $11.09 billion (+12.4%). Erect/New Construction is 210 of those
        permits. Do not add ZBA (906) into the permit total.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="36,801" label="Permits in 2025 · 100.8 a day" />
        <Stat value="−18.7%" label="Permits vs 2019" tone="info" />
        <Stat value="+12.4%" label="Declared value vs 2019" tone="warning" />
        <Stat value="210" label="Erect/New Construction, 2025" />
      </Grid>
      <Table
        headers={["Finding", "Number"]}
        columnAlign={["left", "right"]}
        rows={[
          ["2025 vs 2019 permits", "36,801 vs 45,291 (−18.7%)"],
          ["2025 vs 2019 declared valuation", "$12.46B vs $11.09B (+12.4%)"],
          ["Erect/New Construction, 2025", "210 of 36,801"],
          ["Peak issued hour, 2025", "3 p.m. (4,577) · quietest 7 a.m. (28)"],
          ["Heaviest weekday, 2025", "Tuesday 8,115 · Sunday 174"],
          ["2026 YTD permits (through 29 Aug)", "24,086 · 99.9 a day"],
        ]}
        rowTone={["info", "warning", "info", "info", "info", "warning"]}
      />
      <Text>
        Open Overview for the citywide trend, Department for the issuance
        clock, City / Mayor for policy, Public for plain language.
      </Text>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={28}>
      <Grid columns={4} gap={16}>
        <Stat value="36,801" label="Permits in 2025" />
        <Stat value="100.8" label="Average permits per day" />
        <Stat value="$12.46B" label="Declared valuation, 2025" />
        <Stat value="661,589" label="Permit rows 2006–2026 YTD" />
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
      <Callout tone="info" title="For Inspectional Services">
        Staff issuance around the afternoon peak, not the 311 8 a.m.
        open. Tuesday is the heavy day (8,115). Short form plus electrical,
        plumbing, and gas is 27,995 of 36,801 in 2025. issued_date is not
        when construction happens.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="3 p.m." label="Peak issued hour, 2025 (4,577)" />
        <Stat value="Tuesday" label="Heaviest weekday (8,115)" />
        <Stat value="October" label="Peak month (3,879)" />
      </Grid>
      <SectionClock />
      <Divider />
      <SectionPlace />
      <Divider />
      <H2>What each shop should take from this</H2>
      <Table
        headers={["Shop", "Use this"]}
        rows={[
          [
            "ISD / permits",
            "36,801 in 2025 is −18.7% vs 2019. Short form 11,442. Peak 3 p.m.",
          ],
          [
            "ISD / ZBA",
            "906 dated ZBA cases in 2025 vs 1,616 in 2019. Do not add ZBA into 36,801.",
          ],
          [
            "Planning / housing",
            "1–2 family is 14,501 permits and $797M. Commercial is $6.08B of $12.46B.",
          ],
          [
            "Neighborhoods",
            "Dorchester 4,779 is three ZIPs (02122, 02124, 02125). Roxbury 02119 is outside the top 12.",
          ],
        ]}
      />
    </Stack>
  );
}

function TabCity() {
  return (
    <Stack gap={28}>
      <Callout
        tone="warning"
        title="For the Mayor: fewer permits than 2019 is not less construction value."
      >
        Boston issued 18.7% fewer approved building permits in 2025 than
        in 2019, and 12.4% more declared valuation ($12.46B vs $11.09B).
        Only 210 of 36,801 permits are Erect/New Construction. Do not
        brief ZBA volume as permit volume.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="−18.7%" label="2025 vs 2019 permits" />
        <Stat value="+12.4%" label="2025 vs 2019 declared value" tone="warning" />
        <Stat value="210" label="Erect/New Construction, 2025" />
        <Stat value="45,291" label="Peak permit year (2019)" />
      </Grid>
      <SectionMix />
      <Divider />
      <SectionZba />
      <Divider />
      <H2>Decisions this supports</H2>
      <Table
        headers={["Ask", "Number"]}
        rows={[
          [
            "Do not treat permit decline as a valuation decline",
            "36,801 permits · $12.46B declared in 2025",
          ],
          [
            "Do not brief short-form volume as Erect/New Construction",
            "Erect/New Construction 210 of 36,801",
          ],
          [
            "Do not add ZBA into permits",
            "906 vs 36,801 — they will not match",
          ],
          [
            "Do not annualize 2026",
            "24,086 permits through 29 Aug · 425 ZBA through 28 Aug",
          ],
        ]}
        rowTone={["warning", "info", "danger", "info"]}
      />
    </Stack>
  );
}

function TabPublic() {
  return (
    <Stack gap={20}>
      <H2>What Boston residents should know</H2>
      <Text>
        These are City of Boston approved building permits, issued 26
        September 2006 through 29 August 2026, plus Zoning Board of
        Appeal cases. This is not after-hours construction, and it is
        not 311 or Fire.
      </Text>
      <Callout tone="info" title="Most 2025 permits are short-form and trades.">
        Short Form Bldg Permit is 11,442 of 36,801. Electrical is 8,615.
        Plumbing is 4,995. Gas is 2,943. Erect/New Construction is 210.
      </Callout>
      <Callout tone="warning" title="1–2 family leads the count, not the dollars.">
        1–2 family occupancy is 14,501 permits and $797 million of
        declared value. Commercial occupancy is 9,924 permits and $6.08
        billion.
      </Callout>
      <Callout tone="warning" title="2026 is only part of a year.">
        Permit records in this dump run through 29 August 2026 (24,086
        so far). ZBA records run through 28 August (425). 2026 is not a
        full year.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 permits by issued hour</H3>
          <LineChart
            categories={HOURS}
            height={180}
            fill
            series={[{ name: "Permits", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · 2025 · most
            at 3 p.m. (4,577) · issued_date, not job-site hours
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>ZIP neighborhoods with the most 2025 permits</H3>
          <BarChart
            horizontal
            height={180}
            categories={[
              "Dorchester",
              "Back Bay / Bay Village",
              "Jamaica Plain",
              "Hyde Park",
              "West Roxbury",
            ]}
            series={[{ name: "2025 permits", data: [4779, 2694, 2275, 2263, 2208], tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Approved Building Permits · 2025 · top 5
            of 36,801 · Dorchester is 02122 + 02124 + 02125
          </Caption>
        </Stack>
      </Grid>
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
      <SectionClock />
      <Divider />
      <SectionPlace />
      <Divider />
      <SectionZba />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

export default function BostonBuildingPermitsBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston building permits — city briefing</H1>
        <Text tone="secondary">
          Analyze Boston Approved Building Permits, issued 26 September
          2006 through 29 August 2026, and Zoning Board of Appeal
          Decisions, 31 January 2013 through 28 August 2026. 2012–2025
          are complete permit years. 2026 is not a full year. 2020 is
          COVID. These two files are not after-hours construction.
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
      {tab === "full" ? <TabFull /> : null}
    </Stack>
  );
}
