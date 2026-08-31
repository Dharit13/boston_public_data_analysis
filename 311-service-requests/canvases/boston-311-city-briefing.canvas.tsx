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

const VOLUME = [
  210483, 245475, 257610, 253782, 246165, 269665, 272931, 307791, 306756, 276093,
];
const SANITATION = [
  55889, 67038, 74718, 76662, 85692, 85796, 84718, 91500, 97358, 96796,
];
const PARKING = [
  30151, 41648, 44855, 47211, 43366, 62682, 62739, 61630, 68212, 65615,
];
const ROAD = [
  17822, 28019, 31404, 30155, 16658, 18741, 25429, 18351, 20461, 24725,
];
const LIGHTS = [
  22677, 23003, 23897, 21713, 16201, 17434, 17076, 17297, 16809, 17103,
];
const PARKS = [
  15194, 15583, 15830, 15871, 16987, 17691, 16448, 18280, 19715, 14766,
];
const ANIMALS = [
  8818, 9115, 9003, 9598, 11269, 12492, 14114, 14352, 17018, 15463,
];
const HOUSING = [
  5139, 4929, 4636, 4330, 5506, 5243, 4946, 5445, 5375, 5250,
];
const OTHER = [
  52815, 50199, 48226, 45860, 48957, 48834, 45196, 80464, 60573, 35213,
];

const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_2025 = [
  3729, 2699, 2027, 1675, 1404, 2455, 8005, 17349, 23430, 22787, 21780, 20106,
  19137, 17923, 16778, 16327, 15793, 14307, 13454, 10606, 8183, 6126, 5345, 4668,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2025 = [
  19285, 21510, 22803, 22441, 24106, 25047, 25435, 28933, 28847, 22634, 18478, 16574,
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2025 = [44264, 46984, 45671, 41627, 40506, 29408, 27633];

const NB_LABELS = [
  "Dorchester",
  "Roxbury",
  "South End",
  "South Boston / South Boston Waterfront",
  "Allston / Brighton",
  "East Boston",
  "Downtown / Financial District",
  "Jamaica Plain",
  "Back Bay",
  "Greater Mattapan",
  "Roslindale",
  "Hyde Park",
];
const NB_2025 = [
  34831, 25174, 22455, 22015, 21874, 17487, 16146, 15975, 15398, 9955, 9601, 9513,
];

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
  overview: "Citywide 311 demand, mix, and the Oct 2025 CRM split. 2020 is COVID — not a baseline.",
  department:
    "What 311, Public Works, and Transportation need: when cases open, which districts are overdue, which streets repeat.",
  city: "What the Mayor and Council need: volume vs 2019, SLA, neighborhood load, and the dual-system footnote.",
  public:
    "Plain language: what Bostonians ask 311 for, whether cases close on time, what changed in 2025.",
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
      <H2>Volume peaked in 2023. 2025 is not a collapse — it is a CRM split.</H2>
      <Text>
        Use 2019 as the last normal pre-COVID year, not 2020. Legacy 311
        climbed from 210,483 in 2016 to 307,791 in 2023, then held 306,756
        in 2024. 2025 is 276,093 on the legacy file — 8.8% above 2019, 10%
        below the 2023 peak. December is the lightest month (16,574). The
        Oct CRM split is part of that drop, not the whole story: NEW SYSTEM
        2025 is only 4,132 cases, and seasonal demand falls after August
        (28,933).
      </Text>
      <Callout tone="warning" title="2020 is a COVID year. Do not use it as a baseline.">
        311 dipped only 3% in 2020 (253,782 → 246,165). Housing / ISD rose
        (4,330 → 5,506). Compare 2025 to 2019, then show 2020 as the shock.
      </Callout>
      <Callout tone="danger" title="Oct 2025: two 311 systems. Do not add them.">
        A NEW SYSTEM file starts in October 2025 (4,132 cases that year,
        42,304 in 2026 YTD, 46,436 in all). Parks, trees, and some other
        types moved. Parking enforcement stayed on the legacy file. Adding
        276,093 + 46,436 is not a citywide total.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Legacy 311 cases per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            fill
            series={[{ name: "Cases", data: VOLUME, tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: Analyze Boston 311 Service Requests · legacy annual files
            · 2016–2025 · 2026 YTD omitted (through 30 Aug, 172,886)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Sanitation vs parking</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[
              { name: "Sanitation / streets", data: SANITATION, tone: "info" },
              { name: "Parking / vehicles", data: PARKING, tone: "warning" },
            ]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: unified type family · 2016–2025 legacy · 2025 sanitation
            96,796 · parking 65,615
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionMix() {
  return (
    <Stack gap={12}>
      <H3>What people asked for — share of cases by year</H3>
      <BarChart
        categories={YEARS}
        height={260}
        stacked
        normalized
        valueSuffix="%"
        series={[
          { name: "Sanitation / streets", data: SANITATION, tone: "info" },
          { name: "Parking / vehicles", data: PARKING, tone: "warning" },
          { name: "Other", data: OTHER, tone: "neutral" },
          { name: "Road defects", data: ROAD },
          { name: "Lights / signs", data: LIGHTS },
          { name: "Animals", data: ANIMALS },
          { name: "Parks / trees", data: PARKS, tone: "success" },
          { name: "Housing / ISD", data: HOUSING, tone: "danger" },
        ]}
      />
      <Caption>
        Source: Analyze Boston 311 · 2016–2025 complete years · legacy file
        only · snow / fire-CO omitted (under 1% most years; snow is higher
        in storm winters)
      </Caption>
      <Grid columns="1.1fr 0.9fr" gap={24}>
        <Stack gap={8}>
          <H3>2025 mix (legacy)</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Sanitation / streets", value: 96796, tone: "info" },
              { label: "Parking / vehicles", value: 65615, tone: "warning" },
              { label: "Other", value: 35213, tone: "neutral" },
              { label: "Road defects", value: 24725 },
              { label: "Lights / signs", value: 17103 },
              { label: "Animals", value: 15463 },
              { label: "Parks / trees", value: 14766, tone: "success" },
              { label: "Housing / ISD", value: 5250, tone: "danger" },
            ]}
          />
          <Caption>Source: 2025 legacy 311 (n = 276,093) · snow 819 and fire/CO 343 omitted</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>How the job changed, 2019 → 2025</H3>
          <Table
            headers={["Category", "2019", "2025", "Change"]}
            columnAlign={["left", "right", "right", "right"]}
            rows={[
              ["All cases (legacy)", "253,782", "276,093", "+8.8%"],
              ["Sanitation / streets", "76,662", "96,796", "+26%"],
              ["Parking / vehicles", "47,211", "65,615", "+39%"],
              ["Road defects", "30,155", "24,725", "−18%"],
              ["Lights / signs", "21,713", "17,103", "−21%"],
              ["Parks / trees", "15,871", "14,766", "−7% · vs 2024 19,715"],
              ["Housing / ISD", "4,330", "5,250", "+21%"],
            ]}
            rowTone={["info", "info", "warning", undefined, undefined, "warning", "danger"]}
          />
          <Caption>
            Source: complete years · parks/trees 2024→2025 drop is the Oct
            CRM split (NEW SYSTEM 2026 already has 5,932 parks/trees), not
            fewer trees
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>When 311 opens cases</H2>
      <Text>
        2025 demand peaks at 8 a.m. (23,430). The overnight trough is 4 a.m.
        (1,404). Tuesday is heaviest; Sunday is lightest. August is the peak
        month; December is the lightest — seasonal demand plus the Oct CRM
        split pulling some work off this file.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 cases by hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "Cases", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: 2025 legacy 311 · peak 8 a.m. (23,430) · quietest 4 a.m.
            (1,404) · Boston, all neighborhoods
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>On time vs overdue, 2025</H3>
          <PieChart
            donut
            size={200}
            data={[
              { label: "On time", value: 187812, tone: "success" },
              { label: "Overdue", value: 88281, tone: "danger" },
            ]}
          />
          <Caption>
            Source: 2025 legacy on_time flag · 187,812 ONTIME · 88,281
            OVERDUE · 68.0% on time · unknown 0
          </Caption>
        </Stack>
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 by weekday</H3>
          <BarChart
            categories={WEEKDAYS}
            height={180}
            series={[{ name: "Cases", data: WEEKDAY_2025, tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>Source: 2025 legacy 311 · Tuesday 46,984 · Sunday 27,633</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 by month</H3>
          <BarChart
            categories={MONTHS}
            height={180}
            series={[{ name: "Cases", data: MONTH_2025, tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: 2025 legacy 311 · August 28,933 peak · December 16,574
            (seasonal + Oct CRM split)
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionPlace() {
  return (
    <Stack gap={12}>
      <H2>Where cases land</H2>
      <Text>
        Dorchester leads 2025 volume (34,831). D4 South End leads by police
        district (52,999) because that district covers more than one
        neighborhood (Police briefing: D4 South End / Back Bay). Charlestown
        (A15) has the worst overdue share at 44.5%.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 neighborhoods</H3>
          <BarChart
            horizontal
            height={280}
            categories={NB_LABELS}
            series={[{ name: "2025 cases", data: NB_2025, tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: 2025 legacy 311 neighborhood field · top 12 · “Boston”
            catch-all (12,442) omitted
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 police district</H3>
          <Table
            headers={["District", "Cases", "Overdue", "Overdue %", "Sanitation"]}
            columnAlign={["left", "right", "right", "right", "right"]}
            striped
            rows={[
              ["D4 South End", "52,999", "13,930", "26.3%", "26,726"],
              ["A1 Downtown", "33,507", "10,728", "32.0%", "14,852"],
              ["C6 South Boston", "28,804", "11,499", "39.9%", "6,761"],
              ["D14 Brighton", "25,379", "8,027", "31.6%", "7,303"],
              ["C11 Dorchester", "25,306", "7,871", "31.1%", "7,677"],
              ["B2 Roxbury", "23,537", "6,736", "28.6%", "8,025"],
              ["A7 East Boston", "17,484", "5,890", "33.7%", "5,680"],
              ["E13 Jamaica Plain", "16,683", "5,764", "34.6%", "4,930"],
              ["E5 West Roxbury", "16,212", "5,741", "35.4%", "3,957"],
              ["B3 Mattapan", "14,973", "4,431", "29.6%", "4,671"],
              ["E18 Hyde Park", "11,697", "3,840", "32.8%", "4,305"],
              ["A15 Charlestown", "7,721", "3,437", "44.5%", "1,841"],
            ]}
            rowTone={[
              "info",
              undefined,
              "warning",
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              "danger",
            ]}
          />
          <Caption>
            Source: 2025 legacy 311 · police_district · overdue = OVERDUE
            flag · A15 worst SLA
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionWorkload() {
  return (
    <Stack gap={12}>
      <H2>What the desks actually close</H2>
      <Text>
        Parking enforcement is the #1 type (60,632). Street cleaning, trash
        barrels, and CE collection follow. Needle pickup is 11,689 cases —
        not a rounding error.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Most frequent 2025 types</H3>
          <Table
            headers={["Type", "Count"]}
            columnAlign={["left", "right"]}
            striped
            rows={[
              ["Parking Enforcement", "60,632"],
              ["Requests for Street Cleaning", "20,917"],
              ["Improper Storage of Trash (Barrels)", "20,083"],
              ["CE Collection", "18,653"],
              ["Needle Pickup", "11,689"],
              ["Request for Pothole Repair", "11,064"],
              ["Missed Trash/Recycling/Yard Waste/Bulk Item", "9,972"],
              ["Poor Conditions of Property", "9,063"],
              ["Pick up Dead Animal", "8,699"],
              ["Sidewalk Repair (Make Safe)", "6,707"],
              ["Unshoveled Sidewalk", "6,478"],
              ["Sign Repair", "6,398"],
            ]}
            rowTone={[
              "warning",
              "info",
              "info",
              "info",
              "danger",
              undefined,
              "info",
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ]}
          />
          <Caption>Source: 2025 legacy 311 type field · top 12 of 276,093</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Repeat streets, 2025</H3>
          <Table
            headers={["Street (neighborhood)", "Cases"]}
            columnAlign={["left", "right"]}
            rows={[
              ["391-397 Congress St (Boston)", "377"],
              ["1138-1138 Washington St (South End)", "360"],
              ["1 City Hall Plz (Boston)", "271"],
              ["77 Chandler St (South End)", "257"],
              ["79 Chandler St (South End)", "173"],
              ["1 City Hall Plz (Downtown / Financial District)", "171"],
              ["4-6 Greendale Rd (Greater Mattapan)", "156"],
              ["62 Kirkwood Rd (Allston / Brighton)", "152"],
            ]}
            rowTone={["warning", "warning", "info", "warning"]}
          />
          <Caption>
            Source: 2025 legacy · street + neighborhood as recorded · City
            Hall Plaza is the intake address, not a cluster of potholes
          </Caption>
          <H3>NEW SYSTEM 2026 mix</H3>
          <BarChart
            horizontal
            height={180}
            categories={[
              "Sanitation / streets",
              "Other",
              "Animals",
              "Parks / trees",
              "Road defects",
              "Lights / signs",
            ]}
            series={[{ name: "2026 NEW SYSTEM", data: [11322, 10550, 6511, 5932, 4076, 3867], tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: NEW SYSTEM 2026 YTD (n = 42,304) · parking is 44 cases —
            that work stayed on legacy
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionQuality() {
  return (
    <Stack gap={12}>
      <H2>What this file is, and is not</H2>
      <Table
        headers={["Rule", "Why it matters"]}
        rows={[
          ["Legacy 2016–2026 YTD kept 2,819,637 of 2,819,637 rows", "No date/id drop. Counts match the datastore dumps."],
          ["NEW SYSTEM kept 46,436 of 46,436", "Parallel CRM from Oct 2025. 4,132 of those are calendar 2025."],
          ["2026 is YTD through 30 Aug", "Legacy 172,886 · NEW SYSTEM 42,304. Not a full year."],
          ["Do not add 2025 legacy + NEW SYSTEM", "Oct CRM split. Parks/trees and other types moved."],
          ["Compare 2025 to 2019, not 2020", "2020 COVID. 311 only dipped 3%; housing/ISD rose 4,330 → 5,506."],
        ]}
        rowTone={["success", "warning", "info", "danger", "warning"]}
      />
      <Caption>
        Source: Analyze Boston dataset 311-service-requests · dumps pulled
        31 Aug 2026 · date span 2016-01-01 to 2026-08-30
      </Caption>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={20}>
      <Callout tone="warning" title="311 is busier than 2019. The 2025 drop is a system change, not fewer complaints.">
        Legacy cases 253,782 in 2019 → 276,093 in 2025 (+8.8%). Peak year is
        2023 (307,791). 59% of 2025 is sanitation or parking. 32% of
        cases closed overdue.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="276,093" label="Legacy cases in 2025 · 756 a day" />
        <Stat value="68%" label="Closed on time in 2025" tone="warning" />
        <Stat value="59%" label="Sanitation + parking, 2025" tone="info" />
        <Stat value="46,436" label="NEW SYSTEM cases (Oct 2025–)" tone="danger" />
      </Grid>
      <Table
        headers={["Finding", "Number"]}
        columnAlign={["left", "right"]}
        rows={[
          ["2025 vs 2019 (legacy)", "276,093 vs 253,782 (+8.8%)"],
          ["2023 peak, then 2024", "307,791 → 306,756"],
          ["Parking enforcement, 2025", "60,632 · #1 type"],
          ["On time / overdue, 2025", "187,812 / 88,281 · 68% on time"],
          ["Dorchester cases, 2025", "34,831 · #1 neighborhood"],
          ["2026 YTD (legacy, through 30 Aug)", "172,886 · 717 a day"],
        ]}
        rowTone={["info", "info", "warning", "warning", "danger", "info"]}
      />
      <Text>
        Open Overview for the citywide trend, Department for the clock and
        SLA, City / Mayor for policy, Public for plain language.
      </Text>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={28}>
      <Grid columns={4} gap={16}>
        <Stat value="276,093" label="Legacy cases in 2025" />
        <Stat value="756" label="Average cases per day" />
        <Stat value="172,886" label="2026 YTD through 30 Aug" />
        <Stat value="2.82M" label="Legacy rows 2016–2026 YTD" />
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
      <Callout tone="info" title="For 311, Public Works, Transportation, and ISD">
        Staff the 8 a.m. open. D4 is the volume district; A15 is the SLA
        district. Needle pickup is a real caseload (11,689). Most parks/trees
        after October 2025 live on the NEW SYSTEM file.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="8 a.m." label="Peak open hour, 2025" />
        <Stat value="44.5%" label="A15 Charlestown overdue" tone="danger" />
        <Stat value="26.3%" label="D4 South End overdue" tone="success" />
      </Grid>
      <SectionClock />
      <Divider />
      <SectionWorkload />
      <Divider />
      <H2>What each shop should take from this</H2>
      <Table
        headers={["Shop", "Use this"]}
        rows={[
          ["311 intake", "Peak 8 a.m., not evenings. Tuesday is the heavy day. Sunday is 41% below Tuesday."],
          ["Public Works", "Sanitation is 96,796 of 276,093. Street cleaning, barrels, CE collection, missed trash."],
          ["Transportation", "Parking enforcement 60,632. Abandoned vehicles 4,706. That work stayed on the legacy file in 2026."],
          ["ISD / housing", "Housing/ISD 5,250 in 2025, above 2019 (4,330). 2020 was 5,506 — up, not a doubling."],
          ["Parks", "Do not read the 2025 parks/trees drop as fewer trees. NEW SYSTEM 2026 already has 5,932 parks/trees cases."],
          ["District A15", "Worst overdue share (44.5%) on the smallest district volume (7,721)."],
        ]}
      />
    </Stack>
  );
}

function TabCity() {
  return (
    <Stack gap={28}>
      <Callout tone="warning" title="For the Mayor: 311 demand is above 2019. SLA is the policy number.">
        Boston took 8.8% more 311 cases in 2025 than in 2019. One in three
        closed overdue. The October CRM cut makes 2025 look smaller than
        2023 — do not brief that as a service win until both files are
        counted, with a footnote.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="+8.8%" label="2025 vs 2019 volume" />
        <Stat value="32%" label="Overdue share, 2025" tone="danger" />
        <Stat value="60,632" label="Parking enforcement cases" tone="warning" />
        <Stat value="11,689" label="Needle pickups, 2025" tone="danger" />
      </Grid>
      <SectionMix />
      <Divider />
      <SectionPlace />
      <Divider />
      <H2>Decisions this supports</H2>
      <Table
        headers={["Ask", "Number"]}
        rows={[
          ["Do not add 2025 legacy + NEW SYSTEM as one citywide total", "276,093 + 46,436 is a double-count trap"],
          ["SLA is the City metric, not raw volume", "68% on time · A15 44.5% overdue"],
          ["Needle pickup is a public-health 311 load", "11,689 cases in 2025"],
          ["Parking stayed on the old CRM in 2026", "46,546 parking on legacy YTD · 44 on NEW SYSTEM"],
        ]}
        rowTone={["danger", "warning", "danger", "info"]}
      />
    </Stack>
  );
}

function TabPublic() {
  return (
    <Stack gap={20}>
      <H2>What Boston residents should know</H2>
      <Text>
        These are City of Boston 311 service requests, 2016 through 30
        August 2026. This is not 911, and it is not Boston Police or Fire
        incident records.
      </Text>
      <Callout tone="info" title="Most 311 is trash, streets, and parking.">
        In 2025, 96,796 cases were sanitation or streets and 65,615 were
        parking or vehicles. Together that is 59% of the file. The single
        biggest type is parking enforcement (60,632).
      </Callout>
      <Callout tone="warning" title="About one in three cases closed late.">
        187,812 of 276,093 cases in 2025 were marked on time (68%). 88,281
        were overdue. Charlestown had the highest overdue share.
      </Callout>
      <Callout tone="warning" title="The city changed 311 systems in October 2025.">
        Some request types (especially parks and trees) now live in a new
        system. If a 2025 total looks lower than 2023, ask whether both
        systems were counted.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 cases by hour</H3>
          <LineChart
            categories={HOURS}
            height={180}
            fill
            series={[{ name: "Cases", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>Source: 2025 legacy 311 · most opens at 8 a.m. (23,430)</Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Neighborhoods with the most 2025 cases</H3>
          <BarChart
            horizontal
            height={180}
            categories={[
              "Dorchester",
              "Roxbury",
              "South End",
              "South Boston / South Boston Waterfront",
              "Allston / Brighton",
            ]}
            series={[{ name: "2025 cases", data: [34831, 25174, 22455, 22015, 21874], tone: "info" }]}
            valueSuffix=" cases"
          />
          <Caption>
            Source: 2025 legacy 311 neighborhood field · top 5 of 276,093 ·
            names as recorded
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
      <SectionWorkload />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

export default function Boston311CityBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston 311 — city briefing</H1>
        <Text tone="secondary">
          Cleaned Analyze Boston 311 Service Requests, 1 January 2016 through
          30 August 2026. Legacy annual files are the citywide series.
          2016–2025 are complete years on that file. 2026 is year-to-date.
          A parallel NEW SYSTEM file starts October 2025 — do not add the
          two. 2020 is COVID.
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
