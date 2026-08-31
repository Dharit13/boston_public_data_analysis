function dollars(n) {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}
function moneyM(n) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1000) return "$" + (n / 1000).toFixed(2) + "B";
  if (Math.abs(n) >= 10) return "$" + n.toFixed(1) + "M";
  if (n === 0) return "$0";
  return "$" + n.toFixed(2) + "M";
}
function num(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US");
}
function pct(n) {
  if (n == null) return "—";
  return n.toFixed(1) + "%";
}

Chart.defaults.color = "#aaa";
Chart.defaults.borderColor = "#333";
Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function lineChart(id, labels, series, opts) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: series.map((s) => ({
        label: s.label,
        data: s.data,
        borderColor: s.color || "#599ce7",
        backgroundColor: "transparent",
        tension: 0.15,
        pointRadius: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: series.length > 1 } },
      scales: {
        y: { beginAtZero: !!(opts && opts.zero) },
      },
    },
  });
}

function barChart(id, labels, series, opts) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: series.map((s) => ({
        label: s.label,
        data: s.data,
        backgroundColor: s.color || "#599ce7",
        stack: opts && opts.stacked ? "s" : undefined,
      })),
    },
    options: {
      indexAxis: opts && opts.horizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: series.length > 1 } },
      scales: {
        x: { stacked: !!(opts && opts.stacked), beginAtZero: true },
        y: { stacked: !!(opts && opts.stacked), beginAtZero: true },
      },
    },
  });
}

function pieChart(id, slices) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: slices.map((s) => s.label),
      datasets: [{
        data: slices.map((s) => s.value),
        backgroundColor: slices.map((s) => s.color || "#599ce7"),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "right" } },
    },
  });
}

function bindTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === id));
      requestAnimationFrame(() => {
        document.querySelectorAll("canvas").forEach((c) => {
          const ch = typeof Chart !== "undefined" ? Chart.getChart(c) : null;
          if (ch) ch.resize();
        });
      });
    });
  });
}

function parseSortValue(text, numericHint) {
  const raw = (text || "").replace(/\u2212/g, "-").replace(/\s+/g, " ").trim();
  if (!raw || raw === "—" || raw === "-") return { empty: true, n: 0, s: "" };
  const compact = raw.replace(/,/g, "");
  let mult = 1;
  if (/\$?-?\d/.test(compact)) {
    if (/\d(\.\d+)?\s*[bB]\b/.test(compact) || /\$[\d.]+[bB]\b/.test(compact)) mult = 1e9;
    else if (/\d(\.\d+)?\s*[mM]\b/.test(compact) || /\$[\d.]+[mM]\b/.test(compact)) mult = 1e6;
    else if (/\d(\.\d+)?\s*[kK]\b/.test(compact) || /\$[\d.]+[kK]\b/.test(compact)) mult = 1e3;
  }
  const m = compact.replace(/[$+%()]/g, " ").match(/-?\d+(?:\.\d+)?/);
  const looksNum = numericHint || /^[-$0-9#]/.test(raw) || /%$/.test(raw);
  if (m && looksNum) return { empty: false, n: parseFloat(m[0]) * mult, s: raw.toLowerCase() };
  return { empty: false, n: null, s: raw.toLowerCase() };
}

function applyTableSort(table) {
  const col = Number(table.dataset.sortCol);
  const dir = table.dataset.sortDir === "desc" ? -1 : 1;
  const tbody = table.tBodies[0];
  if (!tbody || Number.isNaN(col)) return;
  table._sorting = true;
  table.querySelectorAll("thead th").forEach((th, i) => {
    th.classList.toggle("sort-asc", i === col && dir === 1);
    th.classList.toggle("sort-desc", i === col && dir === -1);
    th.setAttribute("aria-sort", i === col ? (dir === 1 ? "ascending" : "descending") : "none");
  });
  const th = table.querySelectorAll("thead th")[col];
  const numericHint = !!(th && th.classList.contains("num"));
  const rows = Array.from(tbody.rows).map((tr, idx) => {
    const cell = tr.cells[col];
    const key = parseSortValue(cell ? cell.textContent : "", numericHint || !!(cell && cell.classList.contains("num")));
    return { tr, idx, key };
  });
  const anyNum = rows.some((r) => r.key.n != null && !r.key.empty);
  rows.sort((a, b) => {
    if (a.key.empty && b.key.empty) return a.idx - b.idx;
    if (a.key.empty) return 1;
    if (b.key.empty) return -1;
    if (anyNum && a.key.n != null && b.key.n != null) {
      if (a.key.n !== b.key.n) return (a.key.n - b.key.n) * dir;
    } else {
      const c = a.key.s.localeCompare(b.key.s, "en", { numeric: true, sensitivity: "base" });
      if (c) return c * dir;
    }
    return a.idx - b.idx;
  });
  rows.forEach((r) => tbody.appendChild(r.tr));
  table._sorting = false;
}

function bindSortableTables() {
  document.querySelectorAll(".tabs").forEach((tabs) => {
    if (tabs.nextElementSibling && tabs.nextElementSibling.classList.contains("sort-hint")) return;
    const hint = document.createElement("p");
    hint.className = "sort-hint";
    hint.textContent = "Click any column header to sort. Click again to reverse (A→Z / low→high, then Z→A / high→low).";
    tabs.after(hint);
  });
  document.querySelectorAll("table").forEach((table) => {
    if (table.dataset.sortable === "1") return;
    table.dataset.sortable = "1";
    table.addEventListener("click", (e) => {
      const th = e.target.closest("th");
      if (!th || !table.querySelector("thead").contains(th)) return;
      const col = Array.from(th.parentNode.children).indexOf(th);
      if (col < 0) return;
      const same = table.dataset.sortCol === String(col);
      table.dataset.sortCol = String(col);
      table.dataset.sortDir = same && table.dataset.sortDir === "asc" ? "desc" : "asc";
      applyTableSort(table);
    });
    const tbody = table.tBodies[0];
    if (tbody) {
      new MutationObserver(() => {
        if (table._sorting) return;
        if (table.dataset.sortCol != null) applyTableSort(table);
      }).observe(tbody, { childList: true });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindTabs();
  bindSortableTables();
});
