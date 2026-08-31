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
document.addEventListener("DOMContentLoaded", bindTabs);
