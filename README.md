# Kathmandu Valley SchoolAtlas

Interactive map and analytics for exploring schools across the Kathmandu Valley using OpenStreetMap data.

---

## Overview

The application is a React (Vite) single-page app with two main surfaces: a **map** experience for spatial exploration, filtering, and analysis tools, and an **analytics dashboard** for aggregate statistics and charts. School data is loaded from the Overpass API, normalized in the client, and cached in the browser to limit repeat network calls.

---

## Features

### Map (`/`)

- Vector map (MapLibre GL) with school markers, clustering, heatmap option, and satellite or street basemaps
- Sidebar search, type filters, and school list aligned with the map
- Toolbar-driven modes: measure distance, analyze area, best location, and multi-school compare
- School detail panel from marker or list selection
- Optional location-based analysis using the browser geolocation API

### Analytics dashboard (`/dashboard`)

- Summary statistics and Recharts visualizations
- Navigation link back to the map

### Data and performance

- Overpass API queries with client-side caching in `localStorage`
- Memoized filtering and derived stats in hooks and components

### First-time tour (map only)

On the map route, a welcome overlay (`SchoolAtlasTour`) can introduce the app. Dismissal is stored in `localStorage` under `schoolAtlasTourDismissed_v2` (value `"true"`). The initial open state is read synchronously on load; the overlay is rendered with a portal to `document.body` so it is not clipped by the main layout. When the user **skips** or **finishes** the slideshow, that key is set and the parent stops rendering the tour. To see the tour again after dismissing it, remove `schoolAtlasTourDismissed_v2` from `localStorage` and reload.

---

## Tech stack

| Area | Technology |
|------|----------------|
| UI | React 19, React Router DOM 7 |
| Build | Vite 8 |
| Map | MapLibre GL JS, Supercluster, Turf |
| Charts | Recharts |
| Styling | Tailwind CSS 4 |
| HTTP | Axios |
| Icons | Lucide React |
| Data | OpenStreetMap Overpass API |

---

## Folder structure

```
public/                 # Static assets (favicon, tour images, icons)
src/
├── components/
│   ├── Charts.jsx
│   ├── ComparisonPanel.jsx
│   ├── Map.jsx
│   ├── MapOverlayPanel.jsx
│   ├── SchoolAtlasTour.jsx   # Welcome / guided tour overlay (map route)
│   ├── SchoolDetails.jsx
│   ├── SearchBar.jsx
│   ├── Sidebar.jsx
│   ├── Stats.jsx
│   └── Toolbar.jsx
├── hooks/
│   └── useSchoolsData.js      # Fetch, cache, filter, stats
├── utils/
│   ├── analyzeArea.js
│   ├── formatData.js
│   └── overpassQuery.js
├── App.jsx                    # Map page layout, modes, tour gate
├── Dashboard.jsx              # Analytics dashboard page
├── main.jsx                   # Router and app bootstrap
├── index.css
└── App.css
index.html
package.json
vite.config.js
```

---

## Setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install and run

```bash
git clone <repository-url>
cd "Kathmandu School"
npm install
npm run dev
```

Open the URL printed in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Data source

School features are queried from the OpenStreetMap Overpass API. Public endpoints can be rate-limited; the app caches responses in `localStorage` to reduce repeated requests.

---

## Routing

| Path | Component | Description |
|------|-------------|-------------|
| `/` | `App` | Main map application |
| `/dashboard` | `Dashboard` | Charts and aggregate stats |

The one-time tour runs only on the map route inside `App.jsx`.
