import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const KATHMANDU_CENTER = [85.3240, 27.7172];
const DEFAULT_ZOOM = 12.5;

function Map({ data, registerFlyTo }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (map.current) return; // Initialize map only once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // Clean, light dashboard base map
            center: KATHMANDU_CENTER,
            zoom: DEFAULT_ZOOM,
            attributionControl: false,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.AttributionControl({
            compact: true,
            customAttribution: '© OpenStreetMap contributors | Kathmandu Schools'
        }));

        if (registerFlyTo) {
            registerFlyTo((school) => {
                map.current.flyTo({
                    center: [school.lon, school.lat],
                    zoom: 16,
                    speed: 1.2,
                    curve: 1.4,
                    essential: true
                });
            });
        }

        return () => {
            // Cleanup on unmount
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [registerFlyTo]);

    // Sync Markers
    useEffect(() => {
        if (!map.current || !data) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        data.forEach(school => {
            const el = document.createElement('div');
            el.className = 'w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform duration-200';

            const popupHtml = `
        <div class="font-sans">
          <h3 class="font-bold text-slate-800 text-base mb-1">${school.name}</h3>
          ${school.type ? `<p class="text-xs text-slate-500 mb-1 capitalize border border-slate-200 inline-block px-1.5 py-0.5 rounded-md bg-slate-50">Type: ${school.type}</p>` : ''}
          <div class="mt-2 text-xs text-slate-600 space-y-1">
            ${Object.entries(school.tags).slice(0, 3).map(([k, v]) => {
                if (k === 'name' || k === 'amenity') return '';
                return `<div class="flex"><span class="font-semibold w-16">${k}:</span> <span class="truncate" title="${v}">${v}</span></div>`;
            }).join('')}
          </div>
        </div>
      `;

            const popup = new maplibregl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
                .setHTML(popupHtml);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([school.lon, school.lat])
                .setPopup(popup)
                .addTo(map.current);

            // Auto-fly to when opening popup
            marker.getElement().addEventListener('click', () => {
                map.current.flyTo({ center: [school.lon, school.lat], zoom: 15 });
            });

            markersRef.current.push(marker);
        });
    }, [data]);

    return (
        <div className="absolute inset-0 w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
}

export default React.memo(Map);
