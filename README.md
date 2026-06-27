# Technology Events Calendar Web App

A polished, responsive calendar generated from the supplied Excel workbook:

`mega_technology_events_jul2026_jul2027_boss_ready (1).xlsx`

## Dataset

- 307 total records
- 245 confirmed events (Tier A + B)
- 12 Tier A records with published fee/details
- 233 Tier B records with official dates/location and some details TBA
- 34 Tier C directory/CFP candidates
- 28 Tier D undated community/watchlist records
- Coverage: July 2026 through July 2027
- Workbook audit date: 27 June 2026

## Open the app

Double-click `index.html`, or on Windows double-click `OPEN_WEBAPP.bat`.

No installation, npm command, server, CDN, or internet connection is required for the interface. External official-event links naturally require internet access.

## Features

- Monthly calendar with July 2026 default view
- Previous/next and month-jump navigation through July 2027
- Multi-day events shown on every date they span
- Search by event, topic, organizer, location, country, and ID
- Region, category, mode, and verification filters
- Quick summary filters for all, confirmed, Tier A, and research leads
- Date agenda modal and complete event-details modal
- All workbook source, verification, discovery, fee, deadline, and note fields
- Separate Tier D undated watchlist
- Current-month event sidebar
- CSV export of the currently filtered records
- Responsive desktop and mobile design
- Keyboard support: `/` focuses search, `Esc` closes modals, `Alt + ←/→` changes month

## Project structure

- `index.html` — page structure
- `assets/styles.css` — visual design and responsive rules
- `assets/app.js` — calendar, filters, modals, export, and accessibility behavior
- `data/events.js` — all 307 records extracted from the workbook
- `assets/favicon.svg` — local favicon

## Verification note

Tier A and B events are confirmed according to the workbook methodology. Tier C and D entries should be independently reconfirmed before payment, travel, or management commitment.
