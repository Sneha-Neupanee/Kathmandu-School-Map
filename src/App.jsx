import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [schools, setSchools] = useState([]);

  // Fetch data
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    const query = `
      [out:json];
      (
        node["amenity"="school"](27.6,85.2,27.8,85.4);
        way["amenity"="school"](27.6,85.2,27.8,85.4);
      );
      out center;
    `;

    try {
      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: query,
        }
      );

      const data = await response.json();

      const cleaned = data.elements
        .map((el) => ({
          id: el.id,
          name: el.tags?.name || "Unnamed School",
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
        }))
        .filter((s) => s.lat && s.lon);

      console.log("SCHOOLS:", cleaned);
      setSchools(cleaned);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return; // prevent re-init

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [85.324, 27.7172], // Kathmandu
      zoom: 12,
    });
  }, []);

  // Add markers when schools load
  useEffect(() => {
    if (!map.current) return;

    schools.forEach((school) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setText(
        school.name
      );

      new maplibregl.Marker()
        .setLngLat([school.lon, school.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [schools]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Kathmandu Schools Map</h1>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "90vh",
        }}
      />
    </div>
  );
}

export default App;