import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import supercluster from 'supercluster';

const KATHMANDU_CENTER = [85.3240, 27.7172];
const DEFAULT_ZOOM = 12.5;

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const SATELLITE_STYLE = {
    "version": 8,
    "sources": {
        "satellite": {
            "type": "raster",
            "tiles": ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            "tileSize": 256
        }
    },
    "layers": [{
        "id": "satellite",
        "type": "raster",
        "source": "satellite"
    }]
};

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function Map({ data, registerFlyTo, onSchoolSelect, activeMode, onMapClick }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const nearestPopupRef = useRef(null);
    const nearestMarkerRef = useRef(null);

    const [mapStyle, setMapStyle] = useState('light');
    const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'

    // Area analysis
    const [analysisCenter, setAnalysisCenter] = useState(null);
    const [analysisRadius, setAnalysisRadius] = useState(2); // km
    const [areaStats, setAreaStats] = useState(null);

    // Clustering
    const [clusterer, setClusterer] = useState(null);
    const [clusters, setClusters] = useState([]);

    useEffect(() => {
        if (map.current) return; // Initialize map only once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: LIGHT_STYLE,
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
                if (!map.current) return;
                map.current.flyTo({
                    center: [school.lon, school.lat],
                    zoom: 16,
                    speed: 1.2,
                    curve: 1.4,
                    essential: true
                });
            });
        }

        map.current.on('style.load', () => {
            updateHeatmapLayer(data, viewMode);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Initialize supercluster
    useEffect(() => {
        if (!data || data.length === 0) return;
        const sc = new supercluster({ radius: 60, maxZoom: 15 });
        const points = data.map(s => ({
            type: "Feature",
            properties: { cluster: false, schoolId: s.id, ...s },
            geometry: { type: "Point", coordinates: [s.lon, s.lat] }
        }));
        sc.load(points);
        setClusterer(sc);
    }, [data]);

    // Handle cluster updates on movement
    useEffect(() => {
        if (!map.current || !clusterer) return;

        const updateClusters = () => {
            if (!map.current) return;
            const b = map.current.getBounds();
            const z = Math.floor(map.current.getZoom());
            if (b) {
                const c = clusterer.getClusters(
                    [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
                    z
                );
                setClusters(c);
            }
        };

        map.current.on('moveend', updateClusters);
        map.current.on('zoomend', updateClusters);

        map.current.on('idle', updateClusters); // also when styles load

        return () => {
            if (map.current) {
                map.current.off('moveend', updateClusters);
                map.current.off('zoomend', updateClusters);
                map.current.off('idle', updateClusters);
            }
        };
    }, [clusterer]);

    // Sync Markers and click listener
    useEffect(() => {
        if (!map.current || !clusters) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (viewMode === 'heatmap') {
            // Let heatmap handle the view
            updateHeatmapLayer(data, viewMode);
        } else {
            clusters.forEach(cluster => {
                const [lon, lat] = cluster.geometry.coordinates;
                const { cluster: isCluster, point_count: pointCount, schoolId } = cluster.properties;

                const el = document.createElement('div');

                if (isCluster) {
                    let colorClass = pointCount > 30 ? 'bg-red-500 border-red-200' : pointCount > 10 ? 'bg-yellow-500 border-yellow-200 text-yellow-900' : 'bg-blue-500 border-blue-200 text-white';
                    let sizeClass = pointCount > 30 ? 'w-10 h-10 text-sm' : pointCount > 10 ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-[10px]';

                    el.className = `${sizeClass} ${colorClass} rounded-full border-[3px] flex items-center justify-center font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 z-10`;
                    el.innerText = pointCount;

                    const marker = new maplibregl.Marker({ element: el })
                        .setLngLat([lon, lat])
                        .addTo(map.current);

                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!map.current) return;
                        const expansionZoom = clusterer.getClusterExpansionZoom(cluster.id);
                        map.current.flyTo({ center: [lon, lat], zoom: expansionZoom });
                    });
                    markersRef.current.push(marker);
                } else {
                    const school = cluster.properties;
                    el.className = 'w-3 h-3 bg-blue-600 rounded-full border border-white shadow-sm cursor-pointer hover:scale-150 transition-transform duration-200';

                    const popupHtml = `
                        <div class="font-sans">
                        <h3 class="font-bold text-slate-800 text-base mb-1">${school.name}</h3>
                        ${school.type ? `<p class="text-xs text-slate-500 mb-1 capitalize border border-slate-200 inline-block px-1.5 py-0.5 rounded-md bg-slate-50">Type: ${school.type}</p>` : ''}
                        </div>
                    `;

                    const popup = new maplibregl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
                        .setHTML(popupHtml);

                    const marker = new maplibregl.Marker({ element: el })
                        .setLngLat([lon, lat])
                        .setPopup(popup)
                        .addTo(map.current);

                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!map.current) return;
                        map.current.flyTo({ center: [lon, lat], zoom: 15 });
                        if (onSchoolSelect) onSchoolSelect(school);
                    });

                    markersRef.current.push(marker);
                }
            });
            updateHeatmapLayer(data, viewMode);
        }

        const handleMapClick = (e) => {
            if (!map.current) return;
            const { lng, lat } = e.lngLat;

            if (activeMode === 'analyze') {
                setAnalysisCenter({ lng, lat });
                return;
            }

            if (activeMode === 'compare') {
                if (onMapClick) onMapClick({ lng, lat });

                if (nearestMarkerRef.current) nearestMarkerRef.current.remove();
                if (nearestPopupRef.current) nearestPopupRef.current.remove();

                const el = document.createElement('div');
                el.className = 'w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md animate-pulse';

                nearestMarkerRef.current = new maplibregl.Marker({ element: el })
                    .setLngLat([lng, lat])
                    .addTo(map.current);
                return;
            }

            if (data.length === 0) return;

            if (activeMode === 'bestLocation') {
                const centerPt = turf.point([lng, lat]);
                const sorted = [...data].map(s => {
                    const dist = turf.distance(centerPt, turf.point([s.lon, s.lat]), { units: 'kilometers' });
                    return { ...s, dist };
                }).sort((a, b) => a.dist - b.dist);

                const nearest3 = sorted.slice(0, 3);

                const within2km = sorted.filter(s => s.dist <= 2);
                const rawScore = (within2km.length * 1) + (within2km.filter(s => s.schoolType === 'public').length * 1.5);
                let score = Math.min(10, rawScore / 2); // Normalize somewhat to 10
                let scoreLabel = score > 7 ? 'Excellent' : score > 4 ? 'Good' : 'Poor';

                if (nearestMarkerRef.current) nearestMarkerRef.current.remove();
                if (nearestPopupRef.current) nearestPopupRef.current.remove();

                const el = document.createElement('div');
                el.className = 'w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-bounce';

                nearestMarkerRef.current = new maplibregl.Marker({ element: el })
                    .setLngLat([lng, lat])
                    .addTo(map.current);

                const htmlStr = `
                    <div class="font-sans text-xs w-48">
                       <h4 class="font-bold border-b pb-1 mb-2 text-slate-800">Best Location Insight</h4>
                       <div class="bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded inline-block mb-2 text-sm">
                           Score: ${score.toFixed(1)}/10 - ${scoreLabel}
                       </div>
                       <p class="font-semibold text-slate-600 mb-1 border-b pb-1">Nearest 3 Schools:</p>
                       <ul class="space-y-1.5">
                           ${nearest3.map(s => `
                               <li class="flex justify-between items-center bg-slate-50 p-1 rounded">
                                   <span class="truncate w-20 font-medium" title="${s.name}">${s.name}</span>
                                   <span class="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase tracking-wider">${s.schoolType}</span>
                                   <span class="font-bold text-slate-500 text-[10px] w-8 text-right">${s.dist > 1 ? s.dist.toFixed(1) + 'km' : (s.dist * 1000).toFixed(0) + 'm'}</span>
                               </li>
                           `).join('')}
                       </ul>
                    </div>
                `;

                nearestPopupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 15, maxWidth: '250px' })
                    .setLngLat([lng, lat])
                    .setHTML(htmlStr)
                    .addTo(map.current);

                return;
            }

            if (activeMode === 'measure' || activeMode === 'default') {
                const centerPt = turf.point([lng, lat]);
                let nearest = null;
                let minDistance = Infinity;
                let nearbyCount = 0;

                for (const s of data) {
                    const dist = turf.distance(centerPt, turf.point([s.lon, s.lat]), { units: 'kilometers' });
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearest = s;
                    }
                    if (dist <= 1) nearbyCount++;
                }

                if (nearest) {
                    if (nearestMarkerRef.current) nearestMarkerRef.current.remove();
                    if (nearestPopupRef.current) nearestPopupRef.current.remove();

                    let densityLevel = nearbyCount > 5 ? 'High Density' : nearbyCount > 2 ? 'Medium Density' : 'Low Density';
                    let densityColor = nearbyCount > 5 ? 'bg-red-100 text-red-700' : nearbyCount > 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';

                    const el = document.createElement('div');
                    el.className = 'w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse';

                    nearestMarkerRef.current = new maplibregl.Marker({ element: el })
                        .setLngLat([lng, lat])
                        .addTo(map.current);

                    const distanceStr = minDistance > 1 ? minDistance.toFixed(2) + ' km' : Math.round(minDistance * 1000) + ' m';

                    nearestPopupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 15 })
                        .setLngLat([lng, lat])
                        .setHTML(`
                            <div class="font-sans text-xs min-w-40">
                               <p class="mb-1 text-slate-500 font-semibold border-b pb-1">Nearest School Insight</p>
                               <p class="font-bold text-slate-800 text-sm mt-1">${nearest.name}</p>
                               <p class="text-red-600 font-bold mb-2">${distanceStr} away from click</p>
                               
                               <div class="bg-slate-50 p-1.5 rounded border border-slate-100">
                                   <p class="text-[10px] text-slate-500 mb-1">Within 1km Radius:</p>
                                   <p class="font-bold"><span class="text-blue-600">${nearbyCount}</span> total schools</p>
                                   <span class="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${densityColor}">${densityLevel}</span>
                               </div>
                            </div>
                        `)
                        .addTo(map.current);
                }
            }
        };

        map.current.on('click', handleMapClick);

        return () => {
            if (map.current) {
                map.current.off('click', handleMapClick);
            }
        };

    }, [data, onSchoolSelect, activeMode]);

    const updateHeatmapLayer = (currentData, mode) => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        if (mode === 'heatmap' && currentData && currentData.length > 0) {
            const geojsonData = {
                type: "FeatureCollection",
                features: currentData.map(s => ({
                    type: "Feature",
                    properties: { intensity: 1 },
                    geometry: {
                        type: "Point",
                        coordinates: [s.lon, s.lat]
                    }
                }))
            };

            if (!map.current.getSource('schools')) {
                map.current.addSource('schools', {
                    type: 'geojson',
                    data: geojsonData
                });
            } else {
                map.current.getSource('schools').setData(geojsonData);
            }

            if (!map.current.getLayer('schools-heat')) {
                map.current.addLayer({
                    id: 'schools-heat',
                    type: 'heatmap',
                    source: 'schools',
                    paint: {
                        'heatmap-weight': 1,
                        'heatmap-intensity': 1,
                        'heatmap-radius': ["interpolate", ["linear"], ["zoom"], 10, 15, 15, 30],
                        'heatmap-opacity': 0.7
                    }
                }, mapStyle === 'light' ? 'watername_ocean' : undefined);
            } else {
                map.current.setLayoutProperty('schools-heat', 'visibility', 'visible');
            }
        } else {
            if (map.current.getLayer('schools-heat')) {
                map.current.setLayoutProperty('schools-heat', 'visibility', 'none');
            }
        }
    };

    // Calculate Area Analysis Stats and Draw Circle
    useEffect(() => {
        if (!analysisCenter || activeMode !== 'analyze') {
            if (map.current && map.current.getSource('analysis-circle')) {
                map.current.getSource('analysis-circle').setData({ type: 'FeatureCollection', features: [] });
            }
            return;
        }

        const centerPt = turf.point([analysisCenter.lng, analysisCenter.lat]);
        let total = 0;
        let privateSchools = 0;
        let publicSchools = 0;
        let community = 0;

        data.forEach(s => {
            const pt = turf.point([s.lon, s.lat]);
            const dist = turf.distance(centerPt, pt, { units: 'kilometers' });
            if (dist <= analysisRadius) {
                total++;
                if (s.schoolType === 'private') privateSchools++;
                else if (s.schoolType === 'public') publicSchools++;
                else if (s.schoolType === 'community') community++;
            }
        });

        const area = Math.PI * Math.pow(analysisRadius, 2);
        const density = total / area;
        let densityLabel = 'Low';
        if (density > 10) densityLabel = 'High';
        else if (density > 3) densityLabel = 'Medium';

        setAreaStats({ total, private: privateSchools, public: publicSchools, community, density, densityLabel });

        if (!map.current || !map.current.isStyleLoaded()) return;

        const circle = turf.circle([analysisCenter.lng, analysisCenter.lat], analysisRadius, { steps: 64, units: 'kilometers' });

        if (map.current.getSource('analysis-circle')) {
            map.current.getSource('analysis-circle').setData(circle);
        } else {
            map.current.addSource('analysis-circle', { type: 'geojson', data: circle });
            map.current.addLayer({
                id: 'analysis-circle-fill',
                type: 'fill',
                source: 'analysis-circle',
                paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.2 }
            });
            map.current.addLayer({
                id: 'analysis-circle-outline',
                type: 'line',
                source: 'analysis-circle',
                paint: { 'line-color': '#2563eb', 'line-width': 2 }
            });
        }
    }, [analysisCenter, analysisRadius, activeMode, data]);

    const toggleMapStyle = () => {
        const nextStyle = mapStyle === 'light' ? 'satellite' : 'light';
        setMapStyle(nextStyle);
        if (map.current) {
            map.current.setStyle(nextStyle === 'light' ? LIGHT_STYLE : SATELLITE_STYLE);
        }
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'markers' ? 'heatmap' : 'markers');
    };

    return (
        <div className="absolute inset-0 w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            <div className="absolute top-4 right-14 z-10 flex gap-2">
                <button
                    onClick={toggleMapStyle}
                    className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200"
                >
                    {mapStyle === 'light' ? '🛰️ Satellite' : '🗺️ Map'}
                </button>
                <button
                    onClick={toggleViewMode}
                    className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200"
                >
                    {viewMode === 'markers' ? '🔥 Heatmap' : '📍 Markers'}
                </button>
            </div>

            {/* Smart Area Analysis Panel */}
            {activeMode === 'analyze' && (
                <div className="absolute bottom-6 left-6 z-10 bg-white p-4 rounded-xl shadow-xl border border-slate-200 w-72">
                    <h3 className="font-bold text-slate-800 mb-2 border-b pb-2">Smart Area Analysis</h3>
                    {!analysisCenter ? (
                        <p className="text-sm text-slate-500">Click anywhere on the map to analyze the area.</p>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase">Analysis Radius ({analysisRadius} km)</label>
                                <input
                                    type="range" min="1" max="5" step="0.5"
                                    value={analysisRadius}
                                    onChange={(e) => setAnalysisRadius(Number(e.target.value))}
                                    className="w-full mt-1"
                                />
                            </div>
                            {areaStats && (
                                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                                    <p>Total Schools: <span className="font-bold">{areaStats.total}</span></p>
                                    <p className="flex items-center">Density: <span className="font-bold ml-1">{areaStats.density.toFixed(1)} / km²</span> <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 text-white ${areaStats.densityLabel === 'High' ? 'bg-red-500' : areaStats.densityLabel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}>{areaStats.densityLabel}</span></p>
                                    <div className="pt-2 mt-2 border-t border-slate-200 pt-2 text-xs">
                                        <p>Public: <b>{areaStats.public}</b> | Private: <b>{areaStats.private}</b> | Community: <b>{areaStats.community}</b></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Heatmap Upgrade Additions */}
            {viewMode === 'heatmap' && (
                <div className="absolute bottom-6 right-6 z-10 bg-white p-4 rounded-xl shadow-xl w-60 border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-sm mb-2 border-b pb-1">Heatmap Density</h4>
                    <p className="text-xs text-slate-500 mb-2">Shows school clustering density across Kathmandu.</p>
                    <div className="h-3 w-full rounded bg-gradient-to-r from-blue-300 via-green-400 to-red-500 mb-1"></div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        <span>Low</span>
                        <span>High</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default React.memo(Map);
