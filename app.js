// Marketing Analytics Dashboard — demo.
// Fetches synthetic metrics and renders KPIs + hand-rolled SVG charts (no dependencies).

const COLORS = ["#4c8dff", "#2fd4a7", "#ffb454", "#a98eff", "#f06595", "#63e6be"];
const fmt = (n) => n.toLocaleString("en-US");
const usd = (n) => "$" + Number(n).toLocaleString("en-US");

async function main() {
  let d;
  try {
    d = await (await fetch("data/metrics.json")).json();
  } catch (e) {
    document.getElementById("subtitle").textContent = "Could not load metrics.json";
    return;
  }

  document.getElementById("subtitle").textContent = `${d.meta.company} · ${d.meta.period}`;

  renderKpis(d.kpis);
  renderBars("chartChannel", d.leads_by_channel, "channel", "leads");
  renderTrend("chartTrend", d.leads_trend);
  renderPages("tablePages", d.top_landing_pages);
  renderBars("chartBrand", d.brands.map(b => ({ label: b.brand, value: b.revenue_usd })), "label", "value", usd);
}

function renderKpis(k) {
  const tiles = [
    ["Total leads", fmt(k.total_leads)],
    ["Valid leads", fmt(k.valid_leads)],
    ["Ad spend", usd(k.ad_spend_usd)],
    ["Cost / lead", usd(k.cost_per_lead_usd)],
    ["Booked jobs", fmt(k.booked_jobs)],
    ["Lead→job", k.lead_to_job_rate_pct + "%"],
  ];
  document.getElementById("kpis").innerHTML = tiles
    .map(([label, value]) => `<div class="kpi"><div class="label">${label}</div><div class="value">${value}</div></div>`)
    .join("");
}

// Horizontal bars. rows: [{<keyField>, <valField>}], optional value formatter.
function renderBars(id, rows, keyField, valField, valFmt = fmt) {
  const labelOf = (r) => r[keyField] ?? r.label;
  const valOf = (r) => r[valField] ?? r.value;
  const max = Math.max(...rows.map(valOf));
  document.getElementById(id).innerHTML = rows
    .map((r, i) => {
      const w = Math.max(2, (valOf(r) / max) * 100);
      return `<div class="bar-row">
        <span>${labelOf(r)}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${w}%;background:${COLORS[i % COLORS.length]}"></span></span>
        <span class="bar-val">${valFmt(valOf(r))}</span>
      </div>`;
    })
    .join("");
}

// Grouped column chart: leads vs jobs by month, drawn as inline SVG.
function renderTrend(id, rows) {
  const W = 460, H = 220, pad = 34;
  const max = Math.max(...rows.map(r => r.leads));
  const bw = (W - pad * 2) / rows.length;
  const y = (v) => H - pad - (v / max) * (H - pad * 2);

  const bars = rows.map((r, i) => {
    const x = pad + i * bw;
    const leadsH = (H - pad) - y(r.leads);
    const jobsH = (H - pad) - y(r.jobs);
    return `
      <rect x="${x + bw*0.18}" y="${y(r.leads)}" width="${bw*0.28}" height="${leadsH}" rx="3" fill="${COLORS[0]}"></rect>
      <rect x="${x + bw*0.50}" y="${y(r.jobs)}"  width="${bw*0.28}" height="${jobsH}"  rx="3" fill="${COLORS[1]}"></rect>
      <text x="${x + bw/2}" y="${H - pad + 16}" text-anchor="middle" font-size="11" fill="var(--muted)">${r.month}</text>`;
  }).join("");

  const gridlines = [0, 0.5, 1].map(f => {
    const yy = H - pad - f * (H - pad * 2);
    return `<line x1="${pad}" y1="${yy}" x2="${W-pad}" y2="${yy}" stroke="var(--grid)"></line>
            <text x="${pad-6}" y="${yy+4}" text-anchor="end" font-size="10" fill="var(--muted)">${fmt(Math.round(max*f))}</text>`;
  }).join("");

  document.getElementById(id).innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Leads and jobs by month">
      ${gridlines}${bars}
      <g font-size="11" fill="var(--muted)">
        <rect x="${W-150}" y="8" width="10" height="10" rx="2" fill="${COLORS[0]}"></rect><text x="${W-135}" y="17">Leads</text>
        <rect x="${W-80}" y="8" width="10" height="10" rx="2" fill="${COLORS[1]}"></rect><text x="${W-65}" y="17">Jobs</text>
      </g>
    </svg>`;
}

function renderPages(id, rows) {
  document.getElementById(id).innerHTML = `
    <table>
      <thead><tr><th>Page</th><th class="num">Users</th><th class="num">Forms</th><th class="num">Calls</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td>${r.page}</td><td class="num">${fmt(r.users)}</td>
          <td class="num">${fmt(r.forms)}</td><td class="num">${fmt(r.calls)}</td>
        </tr>`).join("")}
      </tbody>
    </table>`;
}

// Theme toggle (persists per browser; falls back gracefully).
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});
try { const t = localStorage.getItem("theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) {}

main();
