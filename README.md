# 🗺️ Kathmandu School Intelligence Dashboard

> An interactive geospatial analytics platform for exploring, analyzing, and comparing schools across the Kathmandu Valley — built on live OpenStreetMap data.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MapLibre GL JS](https://img.shields.io/badge/MapLibre_GL_JS-5.x-396CB2?logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Overview

The **Kathmandu School Intelligence Dashboard** is a production-quality geospatial web application that fetches live school data from OpenStreetMap's Overpass API, renders it on a high-performance vector map, and exposes a rich set of analytical tools — all within a polished, modern interface.

![Dashboard Preview](./public/preview.png)

---

## 🚀 Features

### 🗺️ Interactive Map
- **Marker & Heatmap modes** — toggle between individual school pins and a density heatmap visualization to understand spatial distribution at a glance
- **Satellite / Street toggle** — switch between a clean street basemap and satellite imagery with one click
- **Smooth fly-to navigation** — clicking any school in the sidebar smoothly animates the map to center on it

### 🔍 Filtering & Search
- **Name-based search** — debounced real-time search that filters the school list and map markers simultaneously
- **Category filters** — filter by school type: **All · Named · Unnamed · Private · Public · Community · Unknown**
- **Live count** — the sidebar always shows how many schools match the current filter

### 🛠️ Analysis Modes (Toolbar)
All modes are accessible from the top toolbar and can be toggled on/off:

| Mode | Description |
|---|---|
| 📏 **Measure** | Click two points on the map to calculate the straight-line distance between them |
| 🔬 **Analyze Area** | Click a center point and set a radius to get school density stats within that area |
| 📍 **Best Location** | Click any point on the map to find the nearest schools and receive an accessibility score |
| 📊 **Compare** | Select up to 3 schools for a side-by-side comparison panel |

### 📈 Statistics & Charts
- **Stats bar** — total, named, unnamed, private, public, community, and unknown school counts displayed in real time
- **Charts panel** — interactive Recharts-powered visualizations aggregating the dataset by type and data quality

### 🏫 School Details Panel
- Click any school marker or sidebar entry to open a details panel showing name, type, location, and OSM metadata

### ⚡ Performance
- **LocalStorage caching** — Overpass API data is cached in the browser so repeat visits load instantly without hitting the API again
- **`useMemo` filtering** — all filter/search operations are memoized to avoid unnecessary re-renders
- **Supercluster** — marker clustering support for dense areas at lower zoom levels

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (Vite 8) |
| Map Engine | MapLibre GL JS 5 |
| Geospatial Utils | @turf/turf, Supercluster |
| Charts | Recharts |
| Styling | Tailwind CSS 4, PostCSS |
| Icons | Lucide React |
| HTTP | Axios |
| Routing | React Router DOM 7 |
| Data Source | OpenStreetMap Overpass API |

---

## 📦 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sneha-Neupanee/Kathmandu-School-Map.git
cd Kathmandu-School-Map

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Navigate to **`http://localhost:5173`** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📡 Data Source

School data is fetched live from the **OpenStreetMap Overpass API** using the following query:

```
[out:json];
(
  node["amenity"="school"](27.6,85.2,27.8,85.4);
  way["amenity"="school"](27.6,85.2,27.8,85.4);
);
out center;
```

> ⚠️ **Note:** Public Overpass endpoints are rate-limited. The app automatically caches results in `localStorage` to minimize API calls. Heavy, repeated refreshing may result in temporary API timeouts.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Map.jsx              # Core MapLibre GL JS map with all layers & interactions
│   ├── Sidebar.jsx          # School list, search, filters & stats
│   ├── Toolbar.jsx          # Analysis mode selector + view controls
│   ├── MapOverlayPanel.jsx  # In-map overlay results for active analysis modes
│   ├── Charts.jsx           # Recharts-based statistics visualizations
│   ├── Stats.jsx            # Stat card components
│   ├── SchoolDetails.jsx    # School detail drawer
│   ├── ComparisonPanel.jsx  # Side-by-side school comparison view
│   └── SearchBar.jsx        # Location search via Nominatim API
├── hooks/
│   └── useSchoolsData.js    # Data fetching, caching, filtering & stats logic
├── utils/
│   ├── overpassQuery.js     # Overpass API fetch logic
│   └── formatData.js        # Raw OSM data normalization
├── App.jsx                  # Root layout & shared state
└── main.jsx                 # App entry point
```

---

## 🔭 Roadmap

- [ ] User-defined custom bounding box selection
- [ ] GeoJSON data export
- [ ] School detail enrichment via Wikipedia/Wikidata
- [ ] Routing directions to nearest school (OSRM integration)
- [ ] Progressive Web App (PWA) support with offline caching

---

*Built as a showcase for Geospatial Frontend Engineering — by [Sneha Neupane](https://github.com/Sneha-Neupanee).*
