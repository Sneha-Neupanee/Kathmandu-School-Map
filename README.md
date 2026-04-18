# Kathmandu School Intelligence Dashboard

An interactive geospatial analytics platform for exploring, analyzing, and comparing schools across the Kathmandu Valley, built on live OpenStreetMap data.

---

## Overview

The Kathmandu School Intelligence Dashboard is a production-quality web application that fetches real school data from the OpenStreetMap Overpass API, renders it on a high-performance vector map, and provides a rich set of spatial analysis tools all within a clean, responsive interface.

---

## Features

### Map

- **Marker view** - individual pins for every school in the dataset, color-coded by type
- **Heatmap view** - toggle to a density heatmap to visualize geographic clustering
- **Satellite / Street basemap toggle** - switch between street map and satellite imagery
- **Smooth fly-to** - selecting a school from the sidebar animates the map to that location
- **Marker clustering** - nearby markers group at lower zoom levels using Supercluster

### Filtering and Search

- **Name search** - real-time, debounced search that filters both the sidebar list and map markers
- **Type filters** - filter schools by: All, Named, Unnamed, Private, Public, Community, Unknown
- **Live filtered count** - the sidebar always displays how many schools match the current filters

### Analysis Modes

Accessible from the top toolbar. Each mode can be toggled on and off.

| Mode | Description |
|---|---|
| Measure | Click two points on the map to calculate straight-line distance between them |
| Analyze Area | Click a center point, set a radius, and get school density statistics for that area |
| Best Location | Click any map point to find the nearest schools and get an accessibility score |
| Compare | Select up to 3 schools for a side-by-side attribute comparison panel |

### Statistics and Charts

- Real-time stat cards showing total, named, unnamed, private, public, community, and unknown school counts
- Recharts-powered chart visualizations aggregating the dataset by type and data quality

### School Details

- Clicking any school marker or sidebar entry opens a detail panel showing name, type, coordinates, and OSM metadata

### Performance

- **LocalStorage caching** - API data is cached in the browser so repeat visits load instantly without re-fetching
- **Memoized filtering** - all filter and search operations use `useMemo` to avoid unnecessary re-renders
- **Error handling and retry** - graceful error state with a retry button if the API call fails

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React (Vite) | 19 / 8 |
| Map Engine | MapLibre GL JS | 5.x |
| Geospatial Utils | @turf/turf | 7.x |
| Marker Clustering | Supercluster | 8.x |
| Charts | Recharts | 3.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 1.x |
| HTTP Client | Axios | 1.x |
| Routing | React Router DOM | 7.x |
| Data Source | OpenStreetMap Overpass API | — |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/Sneha-Neupanee/Kathmandu-School-Map.git
cd Kathmandu-School-Map
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## Data Source

School data is fetched from the OpenStreetMap Overpass API:

```
[out:json];
(
  node["amenity"="school"](27.6,85.2,27.8,85.4);
  way["amenity"="school"](27.6,85.2,27.8,85.4);
);
out center;
```

> Note: Public Overpass endpoints are rate-limited. The app caches results in `localStorage` to minimize API calls. Excessive refreshing may cause temporary API timeouts.

---

## Project Structure

```
src/
├── components/
│   ├── Map.jsx              # MapLibre GL JS map — layers, markers, analysis interactions
│   ├── Sidebar.jsx          # School list, search input, type filters, stats
│   ├── Toolbar.jsx          # Analysis mode buttons and map view controls
│   ├── MapOverlayPanel.jsx  # Overlay UI showing results for active analysis modes
│   ├── Charts.jsx           # Recharts visualizations
│   ├── Stats.jsx            # Stat card components
│   ├── SchoolDetails.jsx    # School detail panel
│   ├── ComparisonPanel.jsx  # Side-by-side school comparison view
│   └── SearchBar.jsx        # Location geocoding via Nominatim API
├── hooks/
│   └── useSchoolsData.js    # Data fetching, caching, filtering, stats aggregation
├── utils/
│   ├── overpassQuery.js     # Overpass API request logic
│   └── formatData.js        # Raw OSM data normalization and typing
├── App.jsx                  # Root layout, shared state, mode management
└── main.jsx                 # Application entry point
```

---

*Built as a showcase for Geospatial Frontend Engineering.*
