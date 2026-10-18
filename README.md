# Marketing Analytics Dashboard — Demo

A lightweight, dependency-free marketing analytics dashboard. It reads a static
`metrics.json` — the kind of output a **medallion data pipeline** (Bronze → Silver → Gold)
would publish — and renders KPIs, channel performance, trends, and brand revenue.

> ⚠️ **Demo project.** All figures are **synthetic** ("Northwind Home Services"). Built to
> demonstrate dashboard design and data modeling, not to report on a real business.

**Companion repo:** [medallion-pipeline-demo](https://github.com/benielpineda-maker/medallion-pipeline-demo) —
the pipeline that produces the kind of marts this dashboard consumes.

## Features

- **KPI row** — total/valid leads, ad spend, cost per lead, booked jobs, lead→job rate
- **Leads by channel** — normalized marketing channels with spend context
- **Leads vs booked jobs by month** — inline SVG column chart
- **Top landing pages** — users, form fills, and calls
- **Revenue by brand**
- **Light/dark themes**, responsive down to phone width
- **Zero dependencies** — plain HTML, CSS, and vanilla JS; charts are hand-rolled SVG

## Run it

It's a static site — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

### Host free on GitHub Pages

Settings → Pages → Deploy from branch → `main` / root. Done.

## How the data flows

```
Sources → Bronze (raw, R2) → Silver (conformed, D1) → Gold (marts, D1 views) → metrics.json → this dashboard
```

The dashboard intentionally reads a **flat published file** rather than querying the warehouse
directly — the Gold layer owns the business logic, and the front end just presents it.

## Structure

```
marketing-dashboard-demo/
├── index.html        # layout
├── styles.css        # theming + responsive grid
├── app.js            # fetch + render (KPIs, SVG charts, table)
└── data/metrics.json # synthetic Gold-layer output
```

## License

MIT — see [LICENSE](LICENSE).
