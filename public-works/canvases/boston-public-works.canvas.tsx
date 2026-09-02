import {
  BarChart,
  Callout,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  LineChart,
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
const TICKETS = [
  26153, 29236, 41950, 49009, 50316, 49229, 51432, 46214,
  42275, 44689, 48489, 57066, 64603, 63226,
];
const TRASH = [
  22566, 22524, 35828, 36335, 39909, 35984, 41371, 37498,
  34693, 36292, 39426, 49105, 54077, 50587,
];
const WEEDS = [
  3086, 3277, 4215, 6264, 6432, 6331, 4883, 3891,
  4985, 4305, 4117, 5447, 5235, 6001,
];
const SNOW = [
  122, 3704, 1715, 6606, 3728, 5410, 3414, 3553,
  1805, 2761, 3723, 802, 3377, 6039,
];
const DUMPING = [
  708, 653, 1875, 1707, 1386, 998, 1443, 1084,
  1027, 2015, 2196, 2400, 2419, 2303,
];
const OCCUPY = [
  451, 483, 597, 457, 465, 585, 979, 663,
  310, 798, 855, 905, 1125, 1638,
];

const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_2025 = [
  2031, 1932, 1796, 1623, 908, 760, 3081, 7210, 6778, 6120, 6623, 5170,
  5882, 3143, 2208, 2616, 2154, 617, 43, 5, 20, 38, 782, 1686,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2025 = [
  4946, 5910, 4821, 5112, 4407, 5625, 5045, 6475, 5966, 5057, 4471, 5391,
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2025 = [12140, 12538, 12301, 10578, 4980, 4153, 6536];

const FAM_LABELS = [
  "Trash storage",
  "Snow / ice sidewalk",
  "Overgrown weeds",
  "Illegal dumping",
  "Occupying city property",
  "Illegal parking on property",
  "Site cleanliness / admin",
];
const FAM_2025 = [50587, 6039, 6001, 2303, 1638, 745, 458];

const FINE_LABELS = [
  "Trash storage",
  "Illegal dumping",
  "Snow / ice sidewalk",
  "Illegal parking on property",
  "Site cleanliness / admin",
  "Occupying city property",
  "Overgrown weeds",
];
const FINE_2025 = [2424075, 587800, 470500, 192300, 145150, 123100, 90015];

const NB_LABELS = [
  "Dorchester",
  "South Boston",
  "Brighton",
  "Back Bay / Bay Village",
  "East Boston",
  "Allston",
  "South End",
  "Roxbury",
  "Mattapan",
  "Mission Hill / Roxbury",
  "North End",
  "West End / Beacon Hill",
];
const NB_2025 = [
  10541, 4933, 4402, 4399, 4187, 3333, 3068, 2867, 2811, 2779, 2740, 2487,
];

const STREET_LABELS = [
  "Washington", "Newbury", "Beacon", "Boylston", "Commonwealth", "Tremont",
  "Blue Hill", "Dorchester", "Massachusetts", "Columbus", "Marlborough", "Foster",
];
const STREET_2025 = [
  1407, 1103, 1063, 1039, 954, 783, 742, 675, 651, 601, 554, 536,
];

const OPEN_NB_LABELS = [
  "Dorchester",
  "Brighton",
  "Allston",
  "South Boston",
  "Back Bay / Bay Village",
  "Mission Hill / Roxbury",
  "Mattapan",
  "Roxbury",
];
const OPEN_NB = [21012, 8206, 7873, 7362, 7263, 6686, 6188, 5827];

const WZ_CAT_LABELS = [
  "EMERGENCY",
  "MAINTENANCE",
  "NEW CONDUIT AND/OR MAIN",
  "Unspecified",
  "SERVICE",
  "CAPITAL",
];
const WZ_CAT = [246, 198, 162, 91, 85, 18];

const WZ_NB_LABELS = [
  "Allston / Brighton",
  "South End / Back Bay",
  "South Dorchester / Mattapan",
  "Roxbury",
  "West Roxbury / Roslindale",
  "North Dorchester",
  "South Boston",
  "Mission Hill / Fenway",
];
const WZ_NB = [100, 86, 80, 79, 76, 69, 60, 58];

type TabId = "summary" | "overview" | "place" | "clock" | "construction" | "quality";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Overview" },
  { id: "place", label: "Place" },
  { id: "clock", label: "Clock" },
  { id: "construction", label: "Construction" },
  { id: "quality", label: "Quality" },
];

const TAB_BLURB: Record<TabId, string> = {
  summary: "Five findings. The live Public Works event file is tickets, not repairs.",
  overview:
    "Code Enforcement tickets 2012–2025. 2026 is year-to-date. Work zones and lights are snapshots.",
  place: "2025 issued tickets by neighborhood and street name. Not a career list. Not open caseload.",
  clock: "When Code Enforcement writes tickets in 2025. status_dttm hour, not a work-order clock.",
  construction:
    "Active work zones as of 1 September 2026, 2016 streetlight inventory, snow-emergency routes.",
  quality:
    "Collapse grain, leftover codes, 311 isolation, missing Cartegraph work orders.",
};

function Caption({ children }: { children: string }) {
  return (
    <Text size="small" tone="tertiary">
      {children}
    </Text>
  );
}

function SectionLead() {
  return (
    <Stack gap={12}>
      <H2>The live Public Works event dump is Code Enforcement tickets, mostly trash storage.</H2>
      <Text>
        Analyze Boston does not publish a DPW work-order history. The
        event clock for this briefing is unique Code Enforcement tickets
        after exact-duplicate rows are dropped. In 2025 that is 63,226
        tickets — not 73,219 raw rows, and not 11,064 pothole-repair
        requests. Trash storage is on 50,587 of those tickets (80.0%).
        Code 1, “Improper storage trash: res,” is 39,697.
      </Text>
      <Callout tone="warning" title="311 is overlap. Do not add it into the year chart.">
        Pothole repair requests, streetlight outages, and most snow work
        live in 311 (and internally in Cartegraph). Boston does not
        publish Cartegraph work orders on Analyze Boston. Traffic signals
        are BTD, not DPW.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="63,226" label="Tickets issued in 2025 · 173.2 a day" />
        <Stat value="+36.8%" label="Tickets vs 2019 (46,214)" tone="info" />
        <Stat value="80%" label="2025 tickets with a trash-storage code" />
        <Stat value="116,431" label="Open caseload (snapshot, not a year)" />
      </Grid>
    </Stack>
  );
}

function SectionDemand() {
  return (
    <Stack gap={12}>
      <H2>More tickets than 2019. 2020 is not the baseline.</H2>
      <Text>
        Complete citation years are 2012–2025. 2025 is 63,226 tickets
        against 46,214 in 2019. 2020 fell to 42,275 — COVID, not a
        comparison year. 2026 is 44,684 through 1 September (183.1 a
        day), not a 13th bar.
      </Text>
      <Callout tone="danger" title="2026 is year-to-date, not a calendar year.">
        Dump max date is 1 September 2026. Do not annualize 44,684, and
        do not mix it onto the 2012–2025 year chart.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Code Enforcement tickets per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            fill
            series={[{ name: "Tickets", data: TICKETS, tone: "info" }]}
            valueSuffix=" tickets"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · unique
            ticket_no after exact-dup drop and Void out · min(status_dttm)
            · 2012–2025 complete years · 2026 YTD omitted
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 ticket families (a ticket can count in two)</H3>
          <BarChart
            horizontal
            height={220}
            categories={FAM_LABELS}
            series={[{ name: "2025 tickets with family", data: FAM_2025, tone: "info" }]}
            valueSuffix=" tickets"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · unique
            (ticket, family) in 2025 · family from pw_code_table.json ·
            stacked families (67,859) exceed ticket n (63,226)
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>Ticket families, 2012–2025</H3>
        <BarChart
          stacked
          categories={YEARS}
          height={240}
          series={[
            { name: "Trash storage", data: TRASH, tone: "info" },
            { name: "Overgrown weeds", data: WEEDS, tone: "warning" },
            { name: "Snow / ice sidewalk", data: SNOW },
            { name: "Illegal dumping", data: DUMPING, tone: "danger" },
            { name: "Occupying city property", data: OCCUPY, tone: "neutral" },
          ]}
          valueSuffix=" tickets"
        />
        <Caption>
          Source: Analyze Boston Public Works Violations · unique (ticket,
          family) per year · 2012–2025 · not raw rows · not 311 requests
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionOverlap() {
  return (
    <Stack gap={12}>
      <H2>What is not in this file</H2>
      <Text>
        311 is how a resident files a request. A Code Enforcement ticket
        is written to a property owner. Chicago publishes both 311
        requests and work orders. Boston publishes the request file and
        this citation file. The Cartegraph work-order table is not on
        Analyze Boston.
      </Text>
      <Table
        headers={["311 (Session 1, 2025)", "Requests", "In the citation year chart?"]}
        rows={[
          ["Request for Pothole Repair", "11,064", "No — no repair log here"],
          ["Requests for Street Cleaning", "20,917", "No"],
          ["Improper Storage of Trash (Barrels)", "20,083", "No — overlap with code 1, different grain"],
          ["CE Collection", "18,653", "No"],
          ["Lights / signs family", "17,103", "No — lights here are a 2016 inventory"],
          ["Snow family", "819", "No — sidewalk-snow tickets are a different file"],
        ]}
      />
      <Caption>
        Source: 311_briefing_stats.json Session 1 · 2025 complete year ·
        276,093 requests. Citation y2025 n is 63,226. Do not add these
        columns.
      </Caption>
    </Stack>
  );
}

function SectionCodes() {
  return (
    <Stack gap={12}>
      <H2>2025 codes are ordinance tickets, not NAICS.</H2>
      <Text>
        Families come from dump (code, description) clusters confirmed
        against boston.gov Code Enforcement — not a three-name regex.
        Assessed fines on 2025 tickets sum to $4.05 million. Trash
        storage is most of the count ($2.42 million); illegal dumping is
        a smaller count and a larger share of dollars.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Top 2025 codes</H3>
          <Table
            headers={["Code", "Description", "Tickets"]}
            rows={[
              ["1", "Improper storage trash: res", "39,697"],
              ["3", "Overfilling of barrel/dumpster", "11,538"],
              ["24", "Overgrown weeds on property", "6,001"],
              ["17a", "Failure clear sidewalk — snow", "4,751"],
              ["2", "Improper storage trash: com", "4,264"],
              ["9a", "Illegal dumping < 1 cubic yd", "1,950"],
              ["27a", "Occupying City property w/o permit", "1,264"],
              ["17c", "Failure clear sidewalk — snow", "1,070"],
            ]}
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · unique
            (ticket, code) · issued 2025 · Void excluded
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Assessed fines by family, 2025</H3>
          <BarChart
            horizontal
            height={260}
            categories={FINE_LABELS}
            series={[{ name: "Assessed fines", data: FINE_2025, tone: "warning" }]}
            valueSuffix=" dollars"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · value parsed
            as dollars · unique (ticket, code) in 2025 · $4,050,220 total
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionOpen() {
  return (
    <Stack gap={12}>
      <H2>Open caseload is a separate stat.</H2>
      <Text>
        116,431 tickets currently Open. That is not 2025 issued (63,226)
        and not 2026 year-to-date (44,684). A 2025 ticket can still be
        Open; those IDs may overlap. Counts must not be added, and Open
        IDs must not be treated as extra 2026 events.
      </Text>
      <Grid columns={3} gap={16}>
        <Stat value="63,226" label="Issued in 2025" />
        <Stat value="44,684" label="Issued 2026 YTD (through 1 Sep)" />
        <Stat value="116,431" label="Latest status Open" tone="warning" />
      </Grid>
      <Stack gap={8}>
        <H3>Open tickets by neighborhood</H3>
        <BarChart
          horizontal
          height={220}
          categories={OPEN_NB_LABELS}
          series={[{ name: "Open tickets", data: OPEN_NB, tone: "warning" }]}
          valueSuffix=" tickets"
        />
        <Caption>
          Source: Analyze Boston Public Works Violations · latest status
          per ticket = Open · ZIP via ZIP_NEIGHBORHOOD · snapshot, not a
          2025 street list
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionPlace() {
  return (
    <Stack gap={12}>
      <H2>2025 issued tickets, not a career ranking.</H2>
      <Text>
        Dorchester leads 2025 issued tickets (10,541). Street names are
        2025 only. Washington, Newbury, and Beacon are long streets — not
        a single block, and not “the worst street in Boston.”
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Neighborhoods, 2025 issued tickets</H3>
          <BarChart
            horizontal
            height={280}
            categories={NB_LABELS}
            series={[{ name: "2025 tickets", data: NB_2025, tone: "info" }]}
            valueSuffix=" tickets"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · unique
            tickets · min(status_dttm) in 2025 · ZIP via ZIP_NEIGHBORHOOD
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Street names, 2025 issued tickets</H3>
          <BarChart
            horizontal
            height={280}
            categories={STREET_LABELS}
            series={[{ name: "2025 tickets", data: STREET_2025 }]}
            valueSuffix=" tickets"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations ·
            violation_street · 2025 issued tickets only · not open
            caseload · not 2008–2026 career
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>Patrol hours, not a repair clock.</H2>
      <Text>
        status_dttm on 2025 tickets peaks at 7 a.m. (7,210). Evening
        hours are near zero. Tuesday is the busiest weekday (12,538);
        Saturday is the quietest (4,153). August is the peak month
        (6,475). This is when tickets were written, not when a pothole
        was filled.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Hour of status_dttm, 2025</H3>
          <BarChart
            categories={HOURS}
            height={200}
            series={[{ name: "Tickets", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" tickets"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · hour of
            min(status_dttm) · 2025 issued tickets · peak 7 a.m.
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Weekday, 2025</H3>
          <BarChart
            categories={WEEKDAYS}
            height={200}
            series={[{ name: "Tickets", data: WEEKDAY_2025, tone: "info" }]}
            valueSuffix=" tickets"
          />
          <Caption>
            Source: Analyze Boston Public Works Violations · weekday of
            min(status_dttm) · 2025 · Tuesday 12,538 · Saturday 4,153
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>Month, 2025</H3>
        <BarChart
          categories={MONTHS}
          height={200}
          series={[{ name: "Tickets", data: MONTH_2025, tone: "info" }]}
          valueSuffix=" tickets"
        />
        <Caption>
          Source: Analyze Boston Public Works Violations · month of
          min(status_dttm) · 2025 complete year · August 6,475 · May 4,407
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionConstruction() {
  return (
    <Stack gap={12}>
      <H2>Construction and assets are snapshots, not a year series.</H2>
      <Text>
        The CIU active-work-zone file is a daily report of jobs in the
        street: 810 permits, 907 locations, as of 1 September 2026.
        Collapse to Permit. Do not stack these onto citation years.
        Streetlight Locations is a 2016 inventory (74,065 points with
        coordinates). The city now cites roughly 68k–71k city-owned
        lights — treat 74,065 as a vintage denominator. Outages are 311.
        Snow-emergency routes are 736 named segments (214 street names),
        not plow GPS.
      </Text>
      <Grid columns={4} gap={16}>
        <Stat value="810" label="Active work-zone permits" />
        <Stat value="907" label="Work-zone locations in the daily report" />
        <Stat value="74,065" label="Streetlight points (2016 inventory)" />
        <Stat value="736" label="Snow-emergency route segments" />
      </Grid>
      <Callout tone="info" title="Traffic signals are BTD, not DPW.">
        The traffic-signal inventory is a Boston Transportation
        Department file. It is not a Public Works year series.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Active jobs by project category</H3>
          <BarChart
            horizontal
            height={220}
            categories={WZ_CAT_LABELS}
            series={[{ name: "Permits", data: WZ_CAT, tone: "info" }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Public Works Active Work Zones ·
            unique Permit · Project_Category whitespace-normalized · as
            of 1 Sep 2026 · Unspecified = blank category
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Active jobs by neighborhood</H3>
          <BarChart
            horizontal
            height={220}
            categories={WZ_NB_LABELS}
            series={[{ name: "Permits", data: WZ_NB }]}
            valueSuffix=" permits"
          />
          <Caption>
            Source: Analyze Boston Public Works Active Work Zones ·
            unique Permit · Neighborhood as published · snapshot 1 Sep
            2026 · not citation ZIP neighborhoods
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionQuality() {
  return (
    <Stack gap={12}>
      <H2>Grain, clocks, leftovers.</H2>
      <Table
        headers={["Check", "Result"]}
        rows={[
          ["Raw citation rows", "916,375"],
          ["Unique tickets (identity)", "807,528"],
          ["Volume after Void out", "807,282"],
          ["Exact-duplicate rows dropped", "386"],
          ["Tickets with more than one code", "100,993"],
          ["Tickets with both Closed and Open rows", "41 — not a status-history file"],
          ["Void tickets excluded from volume", "246"],
          ["Null ticket_no rows (fell back to case_no)", "72"],
          ["Pre-2012 tickets (quality only)", "98,711"],
          ["2025 raw rows vs tickets", "73,219 rows → 63,226 tickets"],
          ["Leftover codes in table as Other", "7 codes / 912 tickets"],
          ["311 2025 requests vs citation 2025", "276,093 ≠ 63,226"],
        ]}
      />
      <Caption>
        Source: pw_dump_audit.json and pw_stats.json · dumps downloaded
        1 September 2026 · leftover codes 26, 37, 42, 45, 43, 32, 31
        stay Other (vacant/board-up/rental and rare vending)
      </Caption>
      <Callout tone="warning" title="Do not mix these clocks.">
        Year pill = unique tickets issued that year. Open caseload =
        latest status Open. Work zones = permits in the daily CIU
        report. Streetlights = 2016 points. 311 = resident requests.
        None of those n’s belong in citation by_year.
      </Callout>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={24}>
      <SectionLead />
      <Divider />
      <SectionOverlap />
      <Divider />
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Tickets vs 2019</H3>
          <Text>
            63,226 in 2025 is 36.8% above 46,214 in 2019. Use 2019, not
            2020 (42,275).
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>What DPW publishes vs what it does</H3>
          <Text>
            Citations, a current work-zone list, and stale inventories.
            Repair history is not in this dump.
          </Text>
        </Stack>
      </Grid>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={32}>
      <SectionLead />
      <Divider />
      <SectionDemand />
      <Divider />
      <SectionCodes />
      <Divider />
      <SectionOpen />
    </Stack>
  );
}

function TabPlace() {
  return <SectionPlace />;
}

function TabClock() {
  return <SectionClock />;
}

function TabConstruction() {
  return (
    <Stack gap={32}>
      <SectionConstruction />
      <Divider />
      <SectionOverlap />
    </Stack>
  );
}

function TabQuality() {
  return (
    <Stack gap={32}>
      <SectionQuality />
      <Divider />
      <SectionOpen />
    </Stack>
  );
}

export default function BostonPublicWorksBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston Public Works — city briefing</H1>
        <Text tone="secondary">
          Code Enforcement tickets 14 June 2008 through 1 September 2026,
          collapsed to unique ticket_no. Complete years 2012–2025. 2026
          is year-to-date. Active work zones, streetlight points, and
          snow-emergency routes are snapshots. This is not a second 311
          briefing, and it is not a work-order log.
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
      {tab === "place" ? <TabPlace /> : null}
      {tab === "clock" ? <TabClock /> : null}
      {tab === "construction" ? <TabConstruction /> : null}
      {tab === "quality" ? <TabQuality /> : null}
    </Stack>
  );
}
