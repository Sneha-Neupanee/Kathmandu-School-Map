<div align="center">
  <img src="public/favicon.svg" alt="Kathmandu School Logo" width="120" />
  <h1> Kathmandu School Intelligence Dashboard</h1>
  <p><strong>Advanced Spatial Analytics & Geographic Information System for Kathmandu Valley Schools</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/MapLibre-GL-green?style=for-the-badge&logo=maplibre" alt="MapLibre" />
    <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
  </p>
</div>

---

## Executive Summary

The **Kathmandu School Intelligence Dashboard** is a highly interactive, state-of-the-art Single Page Application (SPA) designed to solve the complexities of finding, analyzing, and visualizing educational institutions across the Kathmandu Valley. 

Engineered with **React 19**, **Vite**, and **MapLibre GL JS**, it pulls real-time geographic data from the **OpenStreetMap Overpass API**. The app features a powerful non-destructive layer-filtering system, localized density visualization, dynamic bounds detection, and an accompanying rich analytics dashboard powered by **Recharts**.

---

## Core Capabilities & Features

### Geographic Exploration (MapLibre JS)
- **High-Performance Vector Graphics**: Fluid 60fps rendering of thousands of school markers, equipped with customized light, street, and satellite basemaps.
- **Dynamic Clustering Engine**: Utilizes **Supercluster** to beautifully aggregate nearby schools at lower zoom levels, expanding dynamically as the user dives deeper into the valley.
- **Density Visualization Overlay**: An advanced analytical map mode that allows users to isolate and highlight clusters by density (High, Medium, Low) using custom styling functions, *without* stripping data from memory.

### Advanced Contextual Analysis
- **Geolocation & Radial Scanning**: Integrates browser `Geolocation API` allowing users to plot their current coordinates and instantaneously analyze all institutions within a customizable radius (defaulting to 0.5km).
- **Intelligent Omnibox Search**: Integrated **Nominatim API** reverse/forward geocoding allows users to search exact neighborhoods in Kathmandu, smoothly flying the camera to bounding boxes around the queried regions.
- **Spatial Toolset**: Built-in interactive modes for measuring point-to-point distances, highlighting optimum locations, and defining custom analysis boundaries.

### Real-Time Charts & Non-Destructive Filtering
- **Granular Institutional Filters**: Instantly toggle between Public, Private, and Community schools. State updates trigger immediate, non-destructive re-renders on the map layer and synchronize seamlessly with the dashboard.
- **Synchronized Data Visualizations**: A dedicated `/dashboard` route leverages **Recharts** to plot school distributions across municipalities, demographic insights, and comparative analysis charts.
- **Multi-select Comparison**: Select multiple markers directly off the map and throw them into a transient comparison tray to analyze attributes side-by-side.

### Next-Generation UI/UX Flow
- **Elegant, Accessible Interface**: Built entirely upon **Tailwind CSS v4**, featuring an optimized Light Theme, robust responsive gridding, and intuitive visual hierarchies. The sidebar safely avoids map occlusion through smart layout structures.
- **Contextual First-Time Walkthrough**: A `SchoolAtlasTour` mechanism actively detects first-time visitors using `localStorage` heuristics, serving an elegant modal walkthrough of features before diving in.
- **Production-Ready Polish**: Custom scrollbars, glass-morphism overlays, Lucide-react iconography, and strict loading skeletons.

---

## Complete Project Architecture & File Directory

The project follows a remarkably strict, modular React architecture distinguishing presentational logic, shared state, data-fetching, and geospatial math tools.

```text
Kathmandu School/
├── .git/                      # Git repository data
├── .gitignore                 # Negated Git tracking configurations
├── eslint.config.js           # Strict ESLint v9 flat config rules specifically tailored for React 19
├── index.html                 # Root HTML document and Vite entry vector
├── package.json               # NPM dependency manifests and command scripts
├── package-lock.json          # Deterministic dependency resolution tree
├── postcss.config.js          # PostCSS processor configurations for deep Tailwind support
├── README.md                  # This document
├── tailwind.config.js         # Custom Tailwind configurations, theme extensions, and plugins
├── vercel.json                # Serverless deployment configuration for Vercel SPA routing
├── vite.config.js             # High-performance build directives for the Vite bundler
│
├── public/                    # Raw static assets delivered unmodified to build
│   └── favicon.svg            # Highly optimized vector application icon
│
└── src/                       # Application Source Directory
    ├── main.jsx               # React DOM bootstrap, error boundary wrap, and Router init
    ├── App.jsx                # Global App Layout, Tour Context Provider, and active mode state
    ├── MapPage.jsx            # The primary map experience orchestrator integrating sidebar & overlays
    ├── Dashboard.jsx          # Analytics layout, pulling cached data to populate rich visual charts
    ├── index.css              # Core Tailwind directives and lowest-level generic styles
    ├── App.css                # Scoped global application aesthetic variables
    │
    ├── components/            # Reusable Presentational & Layout Components
    │   ├── Charts.jsx               # Recharts composition analyzing the distributions
    │   ├── ComparisonPanel.jsx      # Multi-select tray to view varying school details side-by-side
    │   ├── DensityStatsCard.jsx     # Floating widget reporting current viewport distribution density
    │   ├── Map.jsx                  # The heavy MapLibre GL wrapper, source/layer management, and clusters
    │   ├── MapOverlayPanel.jsx      # UI overlay controls resting above the primary Map canvas
    │   ├── SchoolAtlasTour.jsx      # Onboarding carousel powered by localized storage memory
    │   ├── SchoolDetails.jsx        # Drill-down card displaying deep data on a single institution
    │   ├── SearchBar.jsx            # Nominatim connected search orchestrator
    │   ├── Sidebar.jsx              # Collapsible left navigation housing filters, stats, and lists
    │   ├── Stats.jsx                # High-level aggregate number displays
    │   └── Toolbar.jsx              # Central floating tray dictating interactive tools (Distance, Area etc.)
    │
    ├── hooks/                 # Custom React Hooks
    │   └── useSchoolsData.js        # The monolithic hook responsible for Overpass API networking, 
    │                                # caching, error states, data normalization, and filtering mechanisms.
    │
    └── utils/                 # Pure Functional Utility Module
        ├── analyzeArea.js           # Turf.js enabled bounding box collision and proximity math
        ├── formatData.js            # Translation layer interpreting Overpass raw nodes to JS domain objects
        └── overpassQuery.js         # Definition of OSM Overpass query language strings specific to Nepal
```

---

## Setup & Deployment Guidelines

### Foundational Prerequisites
- **Engine**: Node.js `v18.x`+ recommended.
- **Package Manager**: NPM `v9.x`+.

### Local Development Initialization

1. **Clone & Traverse**
   ```bash
   git clone <your-repository-url>
   cd "Kathmandu School"
   ```

2. **Hydrate Dependencies**
   ```bash
   npm install
   ```

3. **Ignite Development Server**
   ```bash
   npm run dev
   ```
   > Head over to `http://localhost:5173`. Vite's Hot Module Replacement (HMR) guarantees near-instant visual updates on source tweaks.

### Production Release Build

Yield a highly optimized static bundle payload suitable for any modern edge network.
```bash
npm run build
npm run preview
```

### Sustaining Code Quality

Enforce formatting and semantic rules to keep the architecture pristine.
```bash
npm run lint
```

---

## Caching & Rate Limit Mitigation Strategy

Querying geographic node data from the public OpenStreetMap Overpass APIs is subjected to rate-limiting and heavy latency on complex bounds.

To entirely eradicate poor UX and avoid API HTTP `429 (Too Many Requests)` errors, this platform uses an **Aggressive In-Browser Caching System**.
When the application mounts, `useSchoolsData.js` interrogates `localStorage`. If viable JSON payload data exists from a reasonable timestamp window, it parses and hydrates memory bypassing the network entirely. Thus, all density manipulations, search traversals, and filter executions run on the client’s GPU/CPU securely at speeds impossible with live network dependence.

---

> Crafted carefully for discovering Kathmandu.
