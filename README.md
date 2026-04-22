# Kathmandu School Intelligence Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![MapLibre](https://img.shields.io/badge/MapLibre-GL-green?logo=maplibre)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)

A powerful, interactive mapping and analytics dashboard designed to explore, analyze, and visualize school distributions across the Kathmandu Valley. The platform leverages OpenStreetMap data (via the Overpass API) to deliver real-time insights, location-based intelligence, and density analytics within a highly responsive, modern UI.

---

## Key Features

### Interactive Map Explorer
- **High-Performance Rendering**: Built on MapLibre GL JS with seamless vector tiles, satellite, and street basemaps.
- **Dynamic Clustering & Aggregation**: Uses `supercluster` for smooth, responsive marker clustering at varying zoom levels.
- **Density Visualization Layers**: Advanced layer-based density system allowing users to exclusively filter and highlight high, medium, and low-density school clusters without permanently mutating the underlying dataset.

### Advanced Search & Location Analysis
- **Geolocation Intelligence**: Utilize the browser's Geolocation API to find and analyze schools near your exact current location (defaulting to a 0.5 km radius).
- **Nominatim Integration**: Search for specific areas or addresses with automatic map panning and bounding box zooming.
- **Area & Distance Tools**: Built-in modes to measure distances between points, determine the best locations, and analyze custom radii.

### Real-Time Analytics & Filters
- **Non-Destructive Filtering**: Robust filtering capabilities by school type (Public, Private, Community) that seamlessly updates the map layer and secondary charts.
- **Analytics Dashboard**: Synchronized visualizations (powered by Recharts) showing aggregate statistics, distributions, and demographic comparisons.
- **Multi-School Comparison**: Select multiple schools from the map to compare proximity, type, and specific details side-by-side.

### Modern UI / UX
- **Refined Data Interface**: Clean, accessible sidebar layout combining filters, search, and school lists without layout overlapping. Defaulting to a bright, crisp Light Mode.
- **First-Time Guided Tour**: Integrated `SchoolAtlasTour` context that gracefully onboards new users with a one-time walkthrough. (Easily reset via `localStorage`).
- **Production-Ready Theming**: Deeply integrated with Tailwind CSS v4 for optimized, consistent styling across components and overlays.

---

## Technology Stack

| Category | Technology |
|---|---|
| **Core UI** | React 19, React Router DOM 7 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4, Vanilla CSS |
| **Maps & Spatial** | MapLibre GL JS, Supercluster, Turf.js |
| **Visualizations** | Recharts |
| **Data Fetching** | Axios, OpenStreetMap Overpass API |
| **Icons** | Lucide React |

---

## Project Structure

```text
Kathmandu School/
├── public/                 # Static assets (favicons, tour imagery)
├── src/
│   ├── components/         # Reusable UI Blocks (Sidebar, MapOverlayPanel, Toolbar)
│   ├── hooks/              # Custom Hooks (useSchoolsData for fetching & caching)
│   ├── utils/              # Helper logic (formatData, analyzeArea, overpassQuery)
│   ├── App.jsx             # Root layout and Tour context wrapper
│   ├── MapPage.jsx         # Main interactive map and toolkit surface
│   ├── Dashboard.jsx       # Analytics and charts views
│   └── main.jsx            # React bootstrap and router injection
├── package.json
└── tailwind.config.js
```

---

## Getting Started

### Prerequisites
- Node.js 18 or newer
- npm 9 or newer

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Kathmandu School"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

### Production Build

To build the application for production, run:
```bash
npm run build
```

You can preview the production build locally using:
```bash
npm run preview
```

### Code Quality

Run ESLint to check for stylistic and programmatic issues:
```bash
npm run lint
```

---

## Data Strategy & Performance

To guarantee performance and reduce API rate-limiting issues from public endpoints, this project employs an aggressive client-side caching mechanism via `localStorage`. The primary dataset is fetched once per session via Overpass API, normalized via `useSchoolsData`, and persisted. Subsequent spatial filters, density switches, and type toggles are handled purely client-side without extra network traffic.

---

## Routing Architecture

The application is structured as a Single Page Application (SPA) using React Router DOM:

- `/` (`<MapPage />` rendered in `<App />`): The core mapping experience, toolbar tools, and guided tour.
- `/dashboard` (`<Dashboard />`): Isolated analytics surface for data digest.
