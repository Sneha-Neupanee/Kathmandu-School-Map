<div align="center">
  <img src="public/favicon.svg" alt="Kathmandu School Logo" width="120" />
  <h1>Kathmandu School Intelligence Dashboard</h1>
  <p><strong>Spatial Analytics & Geographic Information System for Kathmandu Valley Schools</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/MapLibre-GL-green?style=for-the-badge&logo=maplibre" alt="MapLibre" />
    <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
  </p>
</div>

---

## Live Demo

Deployed Application:  
https://kathmandu-school-map.vercel.app/

---

## What This Project Does (Quick Overview)

- Displays schools across Kathmandu on an interactive map  
- Allows filtering by school type (Public, Private, Community)  
- Visualizes school density (High, Medium, Low)  
- Supports location-based search and navigation  
- Provides real-time analytics and comparisons  
- Enables geolocation-based radius analysis  

---

## Screenshots

## Screenshots

### 1. Default Map View with School Clustering
Displays the initial map interface with dynamically clustered school markers. Clustering helps maintain clarity and performance when visualizing large numbers of schools across Kathmandu Valley.

![Default Map View](public/screenshots/1.png)

---

### 2. Geolocation-Based Radius Analysis with Filtering
Shows nearby private schools within a user-defined 1 km radius using geolocation. Demonstrates combined functionality of spatial analysis and real-time filtering.

![Radius Analysis](public/screenshots/2.png)

---

### 3. Analytics Dashboard and Data Insights
Presents statistical insights including school ownership distribution and data completeness (e.g., named vs unnamed institutions), enabling deeper understanding of the dataset.

![Analytics Dashboard](public/screenshots/3.png)

---

### 4. Density Heatmap with Satellite View
Displays medium-density school areas using a heatmap overlay on satellite view, providing a visual understanding of geographic distribution patterns.

![Density Heatmap](public/screenshots/4.png)


## Executive Summary

The Kathmandu School Intelligence Dashboard is an interactive Single Page Application (SPA) designed to simplify the process of discovering, analyzing, and visualizing educational institutions across the Kathmandu Valley.

Engineered with React 19, Vite, and MapLibre GL JS, it pulls geographic data from the OpenStreetMap Overpass API. The application includes non-destructive filtering, density visualization, dynamic bounds detection, and a synchronized analytics dashboard powered by Recharts.

The system focuses on usability, performance, and efficient data handling while providing meaningful insights through interactive exploration.

---

## Core Capabilities & Features

### Geographic Exploration (MapLibre JS)
- High-performance rendering of thousands of school markers  
- Multiple basemap styles (light, street, satellite)  
- Dynamic clustering using Supercluster  
- Density visualization overlay (High, Medium, Low)  

### Advanced Contextual Analysis
- Geolocation-based radial scanning using the browser Geolocation API  
- Location search via Nominatim API (forward and reverse geocoding)  
- Spatial interaction tools for map-based exploration  

### Real-Time Charts & Non-Destructive Filtering
- Toggle between Public, Private, and Community schools  
- Instant updates without removing underlying data  
- Analytics dashboard using Recharts  
- Multi-select comparison of schools  

### UI/UX Design
- Clean, responsive layout using Tailwind CSS v4  
- Sidebar navigation without obstructing map interaction  
- First-time user walkthrough using localStorage  
- Smooth transitions, overlays, and loading states  

---

## Complete Project Architecture & File Directory

The project follows a modular React architecture that separates UI components, business logic, and data handling.


```
Kathmandu School/
├── .git/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vercel.json
├── vite.config.js
│
├── public/
│   ├── favicon.svg
│   └── screenshots/
│
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── MapPage.jsx
    ├── Dashboard.jsx
    ├── index.css
    ├── App.css
    │
    ├── components/
    │   ├── Charts.jsx
    │   ├── ComparisonPanel.jsx
    │   ├── DensityStatsCard.jsx
    │   ├── Map.jsx
    │   ├── MapOverlayPanel.jsx
    │   ├── SchoolAtlasTour.jsx
    │   ├── SchoolDetails.jsx
    │   ├── SearchBar.jsx
    │   ├── Sidebar.jsx
    │   ├── Stats.jsx
    │   └── Toolbar.jsx
    │
    ├── hooks/
    │   └── useSchoolsData.js
    │
    └── utils/
        ├── analyzeArea.js
        ├── formatData.js
        └── overpassQuery.js
```
---

## Setup & Deployment Guidelines

### Prerequisites
- Node.js v18 or higher  
- npm v9 or higher  

### Local Development

git clone <your-repository-url>  
cd "Kathmandu School"  
npm install  
npm run dev  

Open in browser:  
http://localhost:5173  

---

### Production Build

npm run build  
npm run preview  

---

### Code Quality

npm run lint  

---

## Caching & Rate Limit Mitigation Strategy

Querying geographic data from the OpenStreetMap Overpass API can introduce latency and rate limiting.

To improve performance and avoid HTTP 429 errors, the application implements an in-browser caching system:

- Data is stored in localStorage  
- Cached responses are reused within a valid time window  
- Reduces repeated API calls  
- Enables faster load times and smoother interaction  

All filtering, density calculations, and search operations are executed client-side after initial data hydration.

---

## Technical Highlights

- Modular React architecture with separation of concerns  
- Custom hooks for data fetching and caching  
- Client-side spatial analysis  
- Efficient rendering with clustering  
- Real-time synchronization between map and dashboard  

---

## Design Approach

The application emphasizes clarity, responsiveness, and usability:

- Minimal UI obstruction over the map  
- Structured layout for intuitive navigation  
- Consistent visual hierarchy  
- Focus on performance and smooth user interaction  

---

## Notes

- Data is sourced from OpenStreetMap via the Overpass API  
- Accuracy depends on publicly available OSM data  
- Application is optimized for modern browsers  

---

> Built for exploring and understanding Kathmandu’s educational landscape.