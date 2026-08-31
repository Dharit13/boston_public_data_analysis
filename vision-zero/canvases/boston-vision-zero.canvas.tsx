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
  "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025",
];

const CRASHES = [
  4098, 4362, 4529, 4372, 4354, 3346, 3913, 3302, 3536, 3459, 3411,
];
const DEATHS = [
  20, 21, 14, 10, 11, 14, 15, 10, 11, 16, 14,
];
const MV = [
  2814, 3045, 3366, 3265, 3292, 2653, 3318, 2610, 2558, 2628, 2584,
];
const PED = [
  782, 894, 772, 682, 697, 398, 356, 449, 588, 465, 571,
];
const BIKE = [
  502, 423, 391, 425, 365, 295, 239, 243, 390, 366, 256,
];

const HOURS = [
  "12a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "12p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];
const HOUR_2025 = [
  174, 176, 131, 131, 113, 108, 80, 67, 53, 52, 85, 104,
  156, 158, 148, 181, 154, 178, 177, 208, 188, 212, 202, 175,
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_2025 = [
  233, 217, 237, 282, 309, 254, 307, 355, 321, 314, 298, 284,
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_2025 = [487, 469, 488, 457, 535, 518, 457];

const STREET_LABELS = [
  "Washington St",
  "Interstate 93",
  "Blue Hill Ave",
  "Dorchester Ave",
  "Hyde Park Ave",
  "Massachusetts Ave",
  "River St",
  "Centre St",
];
const STREET_2025 = [111, 106, 78, 47, 37, 34, 34, 33];

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
    "Citywide Vision Zero crashes and deaths. 2020 is COVID — not a baseline. 2026 is not a full year.",
  department:
    "What BTD, BPD, and Public Works need: when crashes happen, which streets repeat, how the clock differs from 311.",
  city: "What the Mayor and Council need: crashes are down vs 2019; deaths are not. Do not mix the two files.",
  public:
    "Plain language: most crashes are motor vehicles; most people who die are walking.",
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
      <H2>Crashes fell versus 2019. Deaths did not.</H2>
      <Text>
        Use 2019 as the last normal pre-COVID year, not 2020. Vision Zero
        crashes peaked at 4,529 in 2017, then 4,372 in 2018 and 4,354 in 2019.
        2025 is 3,411 — 9.3 a day, 21.7% below 2019. Fatalities in the
        companion file were 11 in 2019 and 14 in 2025. Those are not the
        same series: do not add 14 deaths into 3,411 crashes.
      </Text>
      <Callout tone="warning" title="2020 is a COVID year. Do not use it as a baseline.">
        Crashes fell 23.2% in 2020 (4,354 → 3,346) while deaths rose (11 →
        14). Compare 2025 to 2019, then show 2020 as the shock.
      </Callout>
      <Callout tone="danger" title="2026 is not a full year. Fatalities and crashes end on different dates.">
        Crashes run through 1 July 2026 (1,661 year-to-date, 9.1 a day).
        Fatalities run through 15 May 2026 (5 deaths). Do not annualize
        either figure, and do not treat them as the same cutoff.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="3,411" label="Crashes in 2025 · 9.3 a day" />
        <Stat value="14" label="Deaths in 2025" tone="danger" />
        <Stat value="−21.7%" label="Crashes vs 2019 (4,354)" tone="info" />
        <Stat value="1,661" label="2026 YTD crashes through 1 Jul" />
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Vision Zero crashes per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            fill
            series={[{ name: "Crashes", data: CRASHES, tone: "info" }]}
            valueSuffix=" crashes"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2015–2025
            complete years · 2026 YTD omitted (through 1 Jul, 1,661)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Traffic deaths per year</H3>
          <LineChart
            categories={YEARS}
            height={220}
            series={[{ name: "Deaths", data: DEATHS, tone: "danger" }]}
            valueSuffix=" deaths"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Fatality Records · 2015–2025
            · a separate file from crashes · 2026 YTD omitted (5 through 15
            May)
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionMix() {
  return (
    <Stack gap={12}>
      <H2>Most crashes are motor vehicles. Most deaths are people walking.</H2>
      <Text>
        In 2025, motor vehicles were 2,584 of 3,411 crashes (75.8%).
        Pedestrians were 571 (16.7%) and bicycles 256 (7.5%). Of 14 deaths
        that year, 11 were pedestrians and 3 were motor-vehicle mode
        (mode_type mv — the file does not split drivers, passengers, or
        motorcyclists). Across complete years 2015–2025, pedestrians are
        92 of 156 deaths.
      </Text>
      <Callout tone="danger" title="Do not mix deaths into the crash total.">
        3,411 crashes and 14 deaths in 2025 come from two files. Brief them
        side by side. Adding them is not a citywide total.
      </Callout>
      <BarChart
        categories={YEARS}
        height={260}
        stacked
        normalized
        valueSuffix="%"
        series={[
          { name: "Motor vehicle", data: MV, tone: "neutral" },
          { name: "Pedestrian", data: PED, tone: "danger" },
          { name: "Bicycle", data: BIKE, tone: "info" },
        ]}
      />
      <Caption>
        Source: Analyze Boston Vision Zero Crash Records · mode_type ·
        2015–2025 complete years · 2025: motor vehicle 2,584 · pedestrian
        571 · bicycle 256
      </Caption>
      <Grid columns="1.1fr 0.9fr" gap={24}>
        <Stack gap={8}>
          <H3>2025 crash mix</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Motor vehicle", value: 2584, tone: "neutral" },
              { label: "Pedestrian", value: 571, tone: "danger" },
              { label: "Bicycle", value: 256, tone: "info" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025
            (n = 3,411)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>How the mix changed, 2019 → 2025</H3>
          <Table
            headers={["Measure", "2019", "2025", "Change"]}
            columnAlign={["left", "right", "right", "right"]}
            rows={[
              ["All crashes", "4,354", "3,411", "−21.7%"],
              ["Deaths", "11", "14", "+3"],
              ["Motor vehicle crashes", "3,292", "2,584", "−21.5%"],
              ["Pedestrian crashes", "697", "571", "−18.1%"],
              ["Bicycle crashes", "365", "256", "−29.9%"],
              ["Pedestrian share of deaths", "8 of 11", "11 of 14", "still most"],
            ]}
            rowTone={["info", "danger", undefined, "danger", "info", "danger"]}
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records and Fatality
            Records · complete years 2019 and 2025
          </Caption>
        </Stack>
      </Grid>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 deaths by mode</H3>
          <PieChart
            donut
            size={200}
            data={[
              { label: "Pedestrian", value: 11, tone: "danger" },
              { label: "Motor vehicle", value: 3, tone: "neutral" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Vision Zero Fatality Records · 2025
            (n = 14) · no bicycle deaths that year
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Deaths by mode, 2015–2025</H3>
          <PieChart
            donut
            size={200}
            data={[
              { label: "Pedestrian", value: 92, tone: "danger" },
              { label: "Motor vehicle", value: 53, tone: "neutral" },
              { label: "Bicycle", value: 11, tone: "info" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Vision Zero Fatality Records · complete
            years 2015–2025 (n = 156) · 2026 YTD omitted
          </Caption>
        </Stack>
      </Grid>
    </Stack>
  );
}

function SectionClock() {
  return (
    <Stack gap={12}>
      <H2>Crashes peak at 9 p.m., not the morning commute.</H2>
      <Text>
        In 2025 the busiest hour is 9 p.m. (212 crashes). The quietest is
        9 a.m. (52). Friday is heaviest (535); Thursday and Sunday are
        lightest (457). Tuesday is 469. August is the peak month (355);
        February is the lightest (217). This is the opposite clock from
        311, which opens most cases at 8 a.m.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 crashes by hour</H3>
          <LineChart
            categories={HOURS}
            height={200}
            fill
            series={[{ name: "Crashes", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" crashes"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025 · peak
            9 p.m. (212) · quietest 9 a.m. (52)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>2025 crashes by weekday</H3>
          <BarChart
            categories={WEEKDAYS}
            height={200}
            series={[{ name: "Crashes", data: WEEKDAY_2025, tone: "info" }]}
            valueSuffix=" crashes"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025 ·
            Friday 535 · Thursday and Sunday 457
          </Caption>
        </Stack>
      </Grid>
      <Stack gap={8}>
        <H3>2025 crashes by month</H3>
        <BarChart
          categories={MONTHS}
          height={200}
          series={[{ name: "Crashes", data: MONTH_2025, tone: "info" }]}
          valueSuffix=" crashes"
        />
        <Caption>
          Source: Analyze Boston Vision Zero Crash Records · 2025 · August
          355 · February 217 · a complete calendar year
        </Caption>
      </Stack>
    </Stack>
  );
}

function SectionPlace() {
  return (
    <Stack gap={12}>
      <H2>Washington Street, I-93, and Blue Hill Avenue lead 2025 volume.</H2>
      <Text>
        Street names are as recorded. Blank street fields at intersections
        are filled from the two cross streets. Interstate 93 is in this
        file as a named location — it is highway crashes the Vision Zero
        extract kept, not a neighborhood street.
      </Text>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>Top streets, 2025 crashes</H3>
          <BarChart
            horizontal
            height={260}
            categories={STREET_LABELS}
            series={[{ name: "2025 crashes", data: STREET_2025, tone: "info" }]}
            valueSuffix=" crashes"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025 ·
            street / xstreet1 & xstreet2 · top 8 of 3,411 · names as recorded
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Where 2025 crashes were recorded</H3>
          <PieChart
            donut
            size={220}
            data={[
              { label: "Street", value: 1858, tone: "info" },
              { label: "Intersection", value: 1384, tone: "warning" },
              { label: "Other", value: 169, tone: "neutral" },
            ]}
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025
            location_type as recorded · street 1,858 · intersection 1,384 ·
            other 169
          </Caption>
        </Stack>
      </Grid>
      <Table
        headers={["Street", "2025 crashes"]}
        columnAlign={["left", "right"]}
        rows={[
          ["Washington St", "111"],
          ["Interstate 93", "106"],
          ["Blue Hill Ave", "78"],
          ["Dorchester Ave", "47"],
          ["Hyde Park Ave", "37"],
          ["Massachusetts Ave", "34"],
          ["River St", "34"],
          ["Centre St", "33"],
          ["Columbia Rd", "32"],
          ["William T Morrissey Blvd", "30"],
          ["Tremont St", "29"],
        ]}
      />
      <Caption>
        Source: Analyze Boston Vision Zero Crash Records · 2025 · remaining
        streets not shown · names as recorded
      </Caption>
    </Stack>
  );
}

function SectionPolice() {
  return (
    <Stack gap={12}>
      <H2>BPD MV crash / traffic incidents are not Vision Zero crashes.</H2>
      <Callout
        tone="warning"
        title="RMS MV crash / traffic is a different file. The two counts will not match."
      >
        BPD recorded 13,138 MV crash / traffic incidents in 2025
        (leaving-scene, OUI, crash, and other traffic). Analyze Boston
        Vision Zero recorded 3,411 crashes the same year. Brief them as two
        numbers. Do not substitute one for the other.
      </Callout>
      <Table
        headers={["Source", "2025 count", "What it is"]}
        columnAlign={["left", "right", "left"]}
        rows={[
          ["Vision Zero Crash Records", "3,411", "Traffic crashes in the Vision Zero extract"],
          ["BPD RMS MV crash / traffic", "13,138", "Police incidents: crash, leaving-scene, OUI, other traffic"],
          ["Vision Zero Fatality Records", "14", "People killed — a third file, not a subset you can add"],
        ]}
        rowTone={["info", "warning", "danger"]}
      />
      <Caption>
        Source: BPD RMS unique incidents 2025 · MV crash / traffic family
        13,138 · Analyze Boston Vision Zero Crash Records 2025 · 3,411
        crashes and 14 deaths
      </Caption>
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
          ["Crashes kept 44,343 of 44,343 rows", "No timestamp drop. Span 2015-01-01 to 2026-07-01."],
          ["Fatalities kept 161 of 161 rows", "A separate file. Span 2015-01-22 to 2026-05-15."],
          ["2026 is not a full year", "Crashes through 1 Jul (1,661). Deaths through 15 May (5)."],
          ["Compare 2025 to 2019, not 2020", "2020 COVID. Crashes −23.2%; deaths 11 → 14."],
          ["Do not add RMS 13,138 to Vision Zero 3,411", "Different files. They will not match."],
        ]}
        rowTone={["success", "info", "warning", "warning", "danger"]}
      />
      <Caption>
        Source: Analyze Boston datasets vision-zero-crash-records and
        vision-zero-fatality-records · dumps pulled 31 Aug 2026
      </Caption>
    </Stack>
  );
}

function TabSummary() {
  return (
    <Stack gap={20}>
      <Callout
        tone="danger"
        title="Crashes are down versus 2019. Traffic deaths are not."
      >
        Vision Zero recorded 3,411 crashes in 2025 against 4,354 in 2019
        (−21.7%). Deaths were 14 against 11. Pedestrians were 16.7% of
        crashes and 11 of 14 deaths.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="3,411" label="Crashes in 2025 · 9.3 a day" />
        <Stat value="14" label="Deaths in 2025" tone="danger" />
        <Stat value="−21.7%" label="Crashes vs 2019" tone="info" />
        <Stat value="11 of 14" label="2025 deaths were pedestrians" tone="danger" />
      </Grid>
      <Table
        headers={["Finding", "Number"]}
        columnAlign={["left", "right"]}
        rows={[
          ["2025 vs 2019 crashes", "3,411 vs 4,354 (−21.7%)"],
          ["2025 vs 2019 deaths", "14 vs 11"],
          ["Pedestrians, 2025", "571 crashes · 11 of 14 deaths"],
          ["Peak hour, 2025", "9 p.m. (212) · quietest 9 a.m. (52)"],
          ["2026 YTD crashes (through 1 Jul)", "1,661 · 9.1 a day"],
          ["BPD RMS MV vs Vision Zero, 2025", "13,138 vs 3,411 — different files"],
        ]}
        rowTone={["info", "danger", "danger", "info", "warning", "warning"]}
      />
      <Text>
        Open Overview for the citywide trend, Department for the clock and
        streets, City / Mayor for policy, Public for plain language.
      </Text>
    </Stack>
  );
}

function TabOverview() {
  return (
    <Stack gap={28}>
      <Grid columns={4} gap={16}>
        <Stat value="3,411" label="Crashes in 2025" />
        <Stat value="9.3" label="Average crashes per day" />
        <Stat value="14" label="Deaths in 2025" tone="danger" />
        <Stat value="44,343" label="Crash rows 2015–2026 YTD" />
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
      <Callout tone="info" title="For BTD, BPD, and Public Works">
        Staff the evening peak, not the 311 morning open. Friday is the
        heavy crash day. Washington Street, Interstate 93, and Blue Hill
        Avenue lead 2025 volume. 1,384 of 3,411 crashes are intersections.
      </Callout>
      <Grid columns={3} gap={16}>
        <Stat value="9 p.m." label="Peak crash hour, 2025" />
        <Stat value="Friday" label="Heaviest weekday (535)" />
        <Stat value="August" label="Peak month (355)" />
      </Grid>
      <SectionClock />
      <Divider />
      <SectionPlace />
      <Divider />
      <H2>What each shop should take from this</H2>
      <Table
        headers={["Shop", "Use this"]}
        rows={[
          ["BTD / Vision Zero", "Crashes −21.7% vs 2019 is not the same as fewer deaths (14 vs 11)."],
          ["BPD", "RMS MV crash / traffic 13,138 is not the Vision Zero crash count (3,411)."],
          ["Public Works / streets", "Washington St 111, I-93 106, Blue Hill Ave 78. Intersections 1,384."],
          ["EMS / hospitals", "Evening peak (9 p.m.), not 8 a.m. Friday is heaviest."],
        ]}
      />
    </Stack>
  );
}

function TabCity() {
  return (
    <Stack gap={28}>
      <Callout
        tone="danger"
        title="For the Mayor: fewer crashes than 2019 is not Vision Zero success if deaths are up."
      >
        Boston recorded 21.7% fewer Vision Zero crashes in 2025 than in
        2019, and 3 more traffic deaths (14 vs 11). Pedestrians remain most
        of the people killed. Do not brief RMS traffic incidents as Vision
        Zero crashes.
      </Callout>
      <Grid columns={4} gap={16}>
        <Stat value="−21.7%" label="2025 vs 2019 crashes" />
        <Stat value="14 vs 11" label="2025 vs 2019 deaths" tone="danger" />
        <Stat value="11 of 14" label="2025 deaths who were walking" tone="danger" />
        <Stat value="4,529" label="Peak crash year (2017)" />
      </Grid>
      <SectionMix />
      <Divider />
      <SectionPolice />
      <Divider />
      <H2>Decisions this supports</H2>
      <Table
        headers={["Ask", "Number"]}
        rows={[
          ["Do not treat crash decline as a death decline", "3,411 crashes · 14 deaths in 2025"],
          ["Protect people walking first", "11 of 14 deaths · 92 of 156 in 2015–2025"],
          ["Do not add RMS MV to Vision Zero", "13,138 vs 3,411 — they will not match"],
          ["Do not annualize 2026", "1,661 crashes through 1 Jul · 5 deaths through 15 May"],
        ]}
        rowTone={["danger", "danger", "warning", "info"]}
      />
    </Stack>
  );
}

function TabPublic() {
  return (
    <Stack gap={20}>
      <H2>What Boston residents should know</H2>
      <Text>
        These are City of Boston Vision Zero crash and fatality records,
        2015 through mid-2026. This is not 911, and it is not the Boston
        Police incident file.
      </Text>
      <Callout tone="info" title="Most recorded crashes are motor vehicles.">
        In 2025, 2,584 of 3,411 crashes were motor-vehicle mode, 571 were
        pedestrian mode, and 256 were bicycle mode.
      </Callout>
      <Callout tone="danger" title="Most people who die in this file were walking.">
        11 of 14 traffic deaths in 2025 were pedestrians. From 2015 through
        2025, 92 of 156 deaths were pedestrians.
      </Callout>
      <Callout tone="warning" title="2026 is only part of a year.">
        Crash records in this dump run through 1 July 2026 (1,661 so far).
        Fatality records run through 15 May (5 deaths). 2026 is not a full
        year.
      </Callout>
      <Grid columns={2} gap={24}>
        <Stack gap={8}>
          <H3>2025 crashes by hour</H3>
          <LineChart
            categories={HOURS}
            height={180}
            fill
            series={[{ name: "Crashes", data: HOUR_2025, tone: "info" }]}
            valueSuffix=" crashes"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025 · most at
            9 p.m. (212)
          </Caption>
        </Stack>
        <Stack gap={8}>
          <H3>Streets with the most 2025 crashes</H3>
          <BarChart
            horizontal
            height={180}
            categories={[
              "Washington St",
              "Interstate 93",
              "Blue Hill Ave",
              "Dorchester Ave",
              "Hyde Park Ave",
            ]}
            series={[{ name: "2025 crashes", data: [111, 106, 78, 47, 37], tone: "info" }]}
            valueSuffix=" crashes"
          />
          <Caption>
            Source: Analyze Boston Vision Zero Crash Records · 2025 · top 5
            of 3,411 · names as recorded
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
      <SectionPolice />
      <Divider />
      <SectionQuality />
    </Stack>
  );
}

export default function BostonVisionZeroBriefing() {
  const [tab, setTab] = useCanvasState<TabId>("briefing-tab", "summary");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Boston Vision Zero — city briefing</H1>
        <Text tone="secondary">
          Analyze Boston Vision Zero Crash Records, 1 January 2015 through
          1 July 2026, and Vision Zero Fatality Records, 22 January 2015
          through 15 May 2026. 2015–2025 are complete years. 2026 is not a
          full year. 2020 is COVID. These two files are not Boston Police
          RMS.
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
