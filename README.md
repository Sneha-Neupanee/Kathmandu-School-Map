# Kathmandu School Intelligence Dashboard

A production-quality interactive geospatial analytics dashboard visualizing schools in Kathmandu using OpenStreetMap data. 
Built as a professional portfolio project demonstrating advanced capabilities in React, MapLibre GL JS, and geospatial data visualization.

---

## ⚡ Tech Stack

- **React 19 (Vite)**
- **MapLibre GL JS** - Open-source mapping platform used for high-performance vector maps.
- **Recharts** - Composable charting library for React.
- **Tailwind CSS 3** - Utility-first CSS framework for rapid and modern UI development.
- **Lucide React** - Clean and beautiful icons.
- **Overpass API** - Data source fetching raw OSM nodes/ways dynamically.

## 🚀 Features

- **Interactive Geospatial View**: Centers automatically on Kathmandu, displaying accurate markers for all educational facilities utilizing MapLibre's rendering engine.
- **Dynamic Overpass Queries**: Fetches live OpenStreetMap data over nodes and ways corresponding to 'amenity=school' bounding the Kathmandu Valley.
- **Intelligent Filtering & Search**: Features a debounced search function and categorical filters (All, Named, Unnamed schools) updating the UI instantly without redrawing the map entirely.
- **Insights & Charts**: Dynamically aggregates the dataset, rendering a composition Pie-chart mapping data quality (named vs unnamed).
- **Smooth Navigation**: Auto fly-to functionality on selecting schools from the sidebar.
- **Polished Presentation**: Features a clean, soft, modern dashboard aesthetic with proper typography, spacing, and micro-interactions.

## 📦 How to Run Locally

1. **Clone the repository:**
   \`\`\`bash
   git clone <repo-url>
   cd kathmandu-school
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Navigate to:** \`http://localhost:5173\`

## 📡 API Information

The dashboard fetches data securely and anonymously from the OpenStreetMap Overpass Interpreter via the following dynamic query:
\`\`\`text
[out:json];
(
  node["amenity"="school"](27.6,85.2,27.8,85.4);
  way["amenity"="school"](27.6,85.2,27.8,85.4);
);
out center;
\`\`\`
*(Warning: Public Overpass endpoints are rate-limited. Heavy refreshing may result in temporary API blocks).*

## 🔭 Future Improvements

- Marker Clustering logic for dense map areas.
- Detailed POI (Point of Interest) drawer on marker click.
- GeoJSON export capability.
- Multi-layer toggle (Satellite vs Streets).

---
*Built as a showcase for Geospatial Frontend Engineering roles.*
