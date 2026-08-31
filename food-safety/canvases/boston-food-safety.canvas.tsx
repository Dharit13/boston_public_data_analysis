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
    "Citywide food inspections. 2020 is COVID — not a baseline. 2026 is not a full year. Licenses are a separate file.",
  department:
    "What ISD Health needs: weekday load, afternoon peak, star-level mix. resultdttm is the result timestamp, not a kitchen clock.",
  city: "What the Mayor and Council need: more inspections than 2019, a higher fail share, and ZIP fail rates that are not the same as volume.",
  public:
    "Plain language: one inspection can have several violation rows. A license is not an inspection.",
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
        clock, City / Mayor for ZIP fail rates, Public for plain language.
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
      {tab === "full" ? <TabFull /> : null}
    </Stack>
  );
}
