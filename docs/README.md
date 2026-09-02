# GitHub Pages site

The live briefings are static HTML under this folder. GitHub Pages is set to serve `/docs` from `main`.

**https://dharit13.github.io/boston_public_data_analysis/**

| Path | Briefing |
| --- | --- |
| [index.html](index.html) | Hub |
| [earnings/](earnings/) | Employee earnings 2015–2025 |
| [fire/](fire/) | Fire incidents 2012–2024 |
| [crime/](crime/) | Police incidents 2016–2025 |
| [311/](311/) | 311 service requests 2016–2026 YTD |
| [vision-zero/](vision-zero/) | Vision Zero crashes and fatalities 2015–2026 YTD |
| [building-permits/](building-permits/) | Approved building permits 2006–2026 YTD |
| [food-safety/](food-safety/) | Food establishment inspections 2006–2026 YTD |
| [public-works/](public-works/) | Public Works Code Enforcement tickets 2008–2026 YTD |

Charts use [Chart.js](https://www.chartjs.org/) from a CDN. Series live in each folder’s `data.js`. Shared CSS/JS: `assets/style.css`, `assets/ui.js`.

These pages are the public analysis. Markdown writeups (for reading on GitHub without opening Pages) live next to each project:

- [../employee-earnings/boston-earnings-summary.md](../employee-earnings/boston-earnings-summary.md)
- [../fire-incidents/boston-fire-summary.md](../fire-incidents/boston-fire-summary.md)
- [../crime-incidents/boston-police-summary.md](../crime-incidents/boston-police-summary.md)
- [../311-service-requests/boston-311-summary.md](../311-service-requests/boston-311-summary.md)
- [../vision-zero/boston-vision-zero-summary.md](../vision-zero/boston-vision-zero-summary.md)
- [../building-permits/boston-building-permits-summary.md](../building-permits/boston-building-permits-summary.md)
- [../food-safety/boston-food-safety-summary.md](../food-safety/boston-food-safety-summary.md)
- [../public-works/boston-public-works-summary.md](../public-works/boston-public-works-summary.md)

Do not put raw City CSVs here.
