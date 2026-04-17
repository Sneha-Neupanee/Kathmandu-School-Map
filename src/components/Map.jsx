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

function Map({ data, registerFlyTo, onSchoolSelect, activeMode, onMapClick, selectedSchool, comparisonSchools, mapStyle, setMapStyle, viewMode, setViewMode, modeState, setModeState, registerResetMap, registerFlyToLocation }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const nearestPopupRef = useRef(null);
    const nearestMarkerRef = useRef(null);

    const selectedPopupRef = useRef(null);
    const selectedMarkerRef = useRef(null);

    // Refs to always have fresh values inside map event handlers (avoids stale closures)
    const activeModeRef = useRef(activeMode);
    const dataRef = useRef(data);
    const modeStateRef = useRef(modeState);
    const onMapClickRef = useRef(onMapClick);
    useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);
    useEffect(() => { dataRef.current = data; }, [data]);
    useEffect(() => { modeStateRef.current = modeState; }, [modeState]);
    useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
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

        if (registerFlyToLocation) {
            registerFlyToLocation(({ lat, lng }) => {
                if (!map.current) return;
                map.current.flyTo({ center: [lng, lat], zoom: 16, speed: 1.2, curve: 1.4, essential: true });
            });
        }

        if (registerResetMap) {
            registerResetMap(() => {
                if (!map.current) return;
                map.current.flyTo({
                    center: KATHMANDU_CENTER,
                    zoom: DEFAULT_ZOOM,
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

    // React to mapStyle prop changes (satellite toggle from Toolbar)
    useEffect(() => {
        if (!map.current) return;
        map.current.setStyle(mapStyle === 'satellite' ? SATELLITE_STYLE : LIGHT_STYLE);
    }, [mapStyle]);

    // React to viewMode prop changes (heatmap toggle from Toolbar)
    useEffect(() => {
        if (!map.current) return;
        // viewMode change triggers marker re-render via the clusters useEffect
        // and heatmap update via updateHeatmapLayer inside it
    }, [viewMode]);

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

    // Selected School effect — blue dot + popup
    useEffect(() => {
        if (!map.current) return;

        // Clean up previous
        if (selectedMarkerRef.current) selectedMarkerRef.current.remove();
        if (selectedPopupRef.current) selectedPopupRef.current.remove();
        selectedMarkerRef.current = null;
        selectedPopupRef.current = null;

        if (selectedSchool) {
            // Blue dot element
            const el = document.createElement('div');
            el.style.cssText = [
                'width:16px', 'height:16px',
                'background:#2563eb',
                'border-radius:50%',
                'border:3px solid white',
                'box-shadow:0 0 0 3px rgba(37,99,235,0.35)',
                'animation:pulse-blue 1.5s infinite',
            ].join(';');

            const popupHtml = `
                <div style="font-family:sans-serif;text-align:center;min-width:110px">
                    <h3 style="font-weight:700;font-size:0.875rem;color:#1e293b;margin:0 0 4px">${selectedSchool.name || 'School'}</h3>
                    ${selectedSchool.schoolType ? `<span style="font-size:0.65rem;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:4px;font-weight:600;text-transform:capitalize">${selectedSchool.schoolType}</span>` : ''}
                </div>
            `;

            selectedPopupRef.current = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: false,
                offset: 22,
                className: 'selected-school-popup',
            })
                .setLngLat([selectedSchool.lon, selectedSchool.lat])
                .setHTML(popupHtml);

            selectedMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([selectedSchool.lon, selectedSchool.lat])
                .setPopup(selectedPopupRef.current)
                .addTo(map.current);

            selectedMarkerRef.current.togglePopup();
        }

        return () => {
            if (selectedMarkerRef.current) selectedMarkerRef.current.remove();
            if (selectedPopupRef.current) selectedPopupRef.current.remove();
        };
    }, [selectedSchool]);

    // Cleanup nearest markers on activeMode change
    useEffect(() => {
        if (!map.current) return;
        if (activeMode !== 'default' && activeMode !== 'analyze' && activeMode !== 'bestLocation') {
            if (nearestMarkerRef.current) nearestMarkerRef.current.remove();
            if (nearestPopupRef.current) nearestPopupRef.current.remove();
        }
    }, [activeMode]);

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
                    let colorClass = pointCount > 30 ? 'bg-red-500 border-red-200' : pointCount > 10 ? 'bg-amber-500 border-amber-200 text-amber-950' : 'bg-blue-500 border-blue-200 text-white';
                    let sizeClass = pointCount > 30 ? 'w-10 h-10 text-sm' : pointCount > 10 ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-[10px]';

                    el.className = `${sizeClass} ${colorClass} rounded-full border-[3px] flex items-center justify-center font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 z-0`;
                    el.innerText = pointCount;
                    el.title = "Click to zoom into this area";

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
                    const isCompared = comparisonSchools && comparisonSchools.some(s => s.id === school.id);
                    el.className = `w-3 h-3 ${isCompared ? 'bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.3)]' : 'bg-blue-600'} rounded-full border border-white shadow-sm cursor-pointer hover:scale-150 transition-transform duration-200 z-0`;

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
    }, [data, onSchoolSelect, activeMode, clusters, comparisonSchools]);

    // Map Click Listener — registered ONCE, reads fresh values via refs
    useEffect(() => {
        if (!map.current) return;

        const placeBlueDot = (lng, lat) => {
            if (nearestMarkerRef.current) nearestMarkerRef.current.remove();
            if (nearestPopupRef.current) nearestPopupRef.current.remove();
            nearestMarkerRef.current = null;
            nearestPopupRef.current = null;

            const el = document.createElement('div');
            el.style.cssText = 'width:16px;height:16px;background:#2563eb;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(37,99,235,0.5);z-index:1;';
            nearestMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map.current);
        };

        const handleMapClick = (e) => {
            const { lng, lat } = e.lngLat;
            const mode = activeModeRef.current;
            const currentData = dataRef.current;
            const currentModeState = modeStateRef.current;

            if (mode === 'analyze') {
                setModeState(m => ({ ...m, analyze: { ...m.analyze, center: { lng, lat } } }));
                placeBlueDot(lng, lat);
                return;
            }

            if (mode === 'measure') {
                if (!currentModeState.measure.start || (currentModeState.measure.start && currentModeState.measure.end)) {
                    setModeState(m => ({ ...m, measure: { start: { lng, lat }, end: null, distance: null } }));
                } else if (currentModeState.measure.start && !currentModeState.measure.end) {
                    const dist = turf.distance(
                        turf.point([currentModeState.measure.start.lng, currentModeState.measure.start.lat]),
                        turf.point([lng, lat]),
                        { units: 'kilometers' }
                    );
                    setModeState(m => ({ ...m, measure: { start: m.measure.start, end: { lng, lat }, distance: dist } }));
                }
                return;
            }

            if (mode === 'compare') {
                if (onMapClickRef.current) onMapClickRef.current({ lng, lat });
                placeBlueDot(lng, lat);
                return;
            }

            if (!currentData || currentData.length === 0) return;

            if (mode === 'bestLocation') {
                const centerPt = turf.point([lng, lat]);
                const sorted = [...currentData].map(s => {
                    const dist = turf.distance(centerPt, turf.point([s.lon, s.lat]), { units: 'kilometers' });
                    return { ...s, dist };
                }).sort((a, b) => a.dist - b.dist);

                const nearest3 = sorted.slice(0, 3);
                const within2km = sorted.filter(s => s.dist <= 2);
                const rawScore = (within2km.length * 1) + (within2km.filter(s => s.schoolType === 'public').length * 1.5);
                let score = Math.min(10, rawScore / 2);
                let scoreLabel = score > 7 ? 'Excellent' : score > 4 ? 'Good' : 'Poor';
                const scoreBadgeColor = score > 7 ? '#16a34a' : score > 4 ? '#d97706' : '#dc2626';

                setModeState(m => ({
                    ...m,
                    bestLocation: { selectedPoint: { lng, lat }, nearestSchools: nearest3, score, scoreLabel }
                }));

                placeBlueDot(lng, lat);

                const schoolsHtml = nearest3.map((s, i) => {
                    const distStr = s.dist > 1 ? s.dist.toFixed(1) + ' km' : Math.round(s.dist * 1000) + ' m';
                    const name = s.name || 'Unnamed School';
                    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;gap:8px;">
                        <span style="font-weight:600;color:#1e293b;font-size:12px;">${i + 1}. ${name}</span>
                        <span style="color:#2563eb;font-weight:700;font-size:11px;white-space:nowrap;">${distStr}</span>
                    </div>`;
                }).join('');

                const popupHtml = `
                    <div style="font-family:system-ui,sans-serif;min-width:220px;max-width:280px;">
                        <div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;">Best Location Analysis</div>
                        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Nearest Schools</div>
                        ${schoolsHtml}
                        <div style="margin-top:10px;background:#eff6ff;border-radius:6px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:11px;color:#64748b;font-weight:600;">Accessibility Score</span>
                            <span style="font-weight:700;font-size:13px;color:${scoreBadgeColor};">${score.toFixed(1)}/10 &nbsp;<span style="font-size:11px;">${scoreLabel}</span></span>
                        </div>
                    </div>`;

                nearestPopupRef.current = new maplibregl.Popup({
                    closeButton: true,
                    closeOnClick: false,
                    offset: 20,
                    maxWidth: '300px'
                })
                    .setLngLat([lng, lat])
                    .setHTML(popupHtml)
                    .addTo(map.current);

                // Force z-index above everything
                setTimeout(() => {
                    const el = nearestPopupRef.current && nearestPopupRef.current.getElement();
                    if (el) el.style.zIndex = '9999';
                }, 0);
                return;
            }

            if (mode === 'default') {
                const centerPt = turf.point([lng, lat]);
                let nearest = null;
                let minDistance = Infinity;
                let nearbyCount = 0;

                for (const s of currentData) {
                    const dist = turf.distance(centerPt, turf.point([s.lon, s.lat]), { units: 'kilometers' });
                    if (dist < minDistance) { minDistance = dist; nearest = s; }
                    if (dist <= 1) nearbyCount++;
                }

                if (nearest) {
                    if (nearestMarkerRef.current) nearestMarkerRef.current.remove();
                    if (nearestPopupRef.current) nearestPopupRef.current.remove();

                    let densityLevel = nearbyCount > 5 ? 'High Density' : nearbyCount > 2 ? 'Medium Density' : 'Low Density';
                    let densityColor = nearbyCount > 5 ? 'bg-red-100 text-red-700' : nearbyCount > 2 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';

                    const el = document.createElement('div');
                    el.className = 'w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md animate-pulse z-0';

                    nearestMarkerRef.current = new maplibregl.Marker({ element: el })
                        .setLngLat([lng, lat])
                        .addTo(map.current);

                    const distanceStr = minDistance > 1 ? minDistance.toFixed(2) + ' km' : Math.round(minDistance * 1000) + ' m';

                    nearestPopupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 15, className: 'maplibre-gl-popup-z' })
                        .setLngLat([lng, lat])
                        .setHTML(`
                            <div class="font-sans text-xs min-w-40 z-50">
                               <p class="mb-1 text-slate-500 font-semibold border-b pb-1">Nearest School Insight</p>
                               <p class="font-bold text-slate-800 text-sm mt-1 mb-0">${nearest.name}</p>
                               <p class="text-red-600 font-bold mb-2">${distanceStr} block distance</p>
                               
                               <div class="bg-slate-50 p-1.5 rounded border border-slate-100">
                                   <p class="text-[10px] text-slate-500 mb-1">Within 1km Radius:</p>
                                   <p class="font-bold"><span class="text-blue-600">${nearbyCount}</span> total schools</p>
                                   <span class="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${densityColor}">${densityLevel}</span>
                               </div>
                            </div>
                        `)
                        .addTo(map.current);

                    // Force the maplibre popup container to overlap absolutely everything else
                    if (nearestPopupRef.current.getElement()) {
                        nearestPopupRef.current.getElement().style.zIndex = '50';
                    }
                }
            }
        };

        map.current.on('click', handleMapClick);
        return () => { if (map.current) map.current.off('click', handleMapClick); };
        // Register only once — reads fresh values via refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map.current]);

    // Measure Visualization
    useEffect(() => {
        if (!map.current || activeMode !== 'measure') {
            if (map.current && map.current.getSource('measure-source')) {
                map.current.getSource('measure-source').setData({ type: 'FeatureCollection', features: [] });
            }
            return;
        }

        const features = [];
        if (modeState.measure.start) {
            features.push(turf.point([modeState.measure.start.lng, modeState.measure.start.lat], { type: 'point' }));
        }
        if (modeState.measure.end) {
            features.push(turf.point([modeState.measure.end.lng, modeState.measure.end.lat], { type: 'point' }));
        }
        if (modeState.measure.start && modeState.measure.end) {
            features.push(turf.lineString([
                [modeState.measure.start.lng, modeState.measure.start.lat],
                [modeState.measure.end.lng, modeState.measure.end.lat]
            ]));
        }

        if (map.current.getSource('measure-source')) {
            map.current.getSource('measure-source').setData(turf.featureCollection(features));
        } else {
            map.current.addSource('measure-source', { type: 'geojson', data: turf.featureCollection(features) });
            map.current.addLayer({
                id: 'measure-line',
                type: 'line',
                source: 'measure-source',
                paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-dasharray': [2, 2] }
            });
            map.current.addLayer({
                id: 'measure-points',
                type: 'circle',
                source: 'measure-source',
                filter: ['==', 'type', 'point'],
                paint: { 'circle-radius': 6, 'circle-color': '#ffffff', 'circle-stroke-width': 3, 'circle-stroke-color': '#2563eb' }
            });
        }
    }, [modeState.measure, activeMode]);

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
        if (!modeState.analyze.center || activeMode !== 'analyze') {
            if (map.current && map.current.getSource('analysis-circle')) {
                map.current.getSource('analysis-circle').setData({ type: 'FeatureCollection', features: [] });
            }
            return;
        }

        const centerPt = turf.point([modeState.analyze.center.lng, modeState.analyze.center.lat]);
        let total = 0;
        let privateSchools = 0;
        let publicSchools = 0;
        let community = 0;

        data.forEach(s => {
            const pt = turf.point([s.lon, s.lat]);
            const dist = turf.distance(centerPt, pt, { units: 'kilometers' });
            if (dist <= modeState.analyze.radius) {
                total++;
                if (s.schoolType === 'private') privateSchools++;
                else if (s.schoolType === 'public') publicSchools++;
                else if (s.schoolType === 'community') community++;
            }
        });

        const area = Math.PI * Math.pow(modeState.analyze.radius, 2);
        const density = total / area;
        let densityLabel = 'Low';
        if (density > 10) densityLabel = 'High';
        else if (density > 3) densityLabel = 'Medium';

        // we only set stats if it changed to prevent infinite loops, but here we can just update it
        // Note: setting state here might trigger re-render, but modeState.analyze is stable except stats.
        // Doing this safely using a functional update, though React batches it.
        setModeState(m => {
            if (m.analyze.stats?.total === total && m.analyze.stats?.density === density) return m;
            return {
                ...m,
                analyze: { ...m.analyze, stats: { total, private: privateSchools, public: publicSchools, community, density, densityLabel } }
            };
        });

        if (!map.current || !map.current.isStyleLoaded()) return;

        const circle = turf.circle([modeState.analyze.center.lng, modeState.analyze.center.lat], modeState.analyze.radius, { steps: 64, units: 'kilometers' });

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
    }, [modeState.analyze.center, modeState.analyze.radius, activeMode, data, setModeState]);

    const toggleMapStyle = () => {
        const nextStyle = mapStyle === 'light' ? 'satellite' : 'light';
        if (setMapStyle) setMapStyle(nextStyle);
        if (map.current) {
            map.current.setStyle(nextStyle === 'light' ? LIGHT_STYLE : SATELLITE_STYLE);
        }
    };

    const toggleViewMode = () => {
        if (setViewMode) setViewMode(prev => prev === 'markers' ? 'heatmap' : 'markers');
    };

    return (
        <div className="absolute inset-0 w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Map Legend */}
            {viewMode !== 'heatmap' && (
                <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200">
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 border-b border-slate-100 pb-1">Map Legend</h4>
                    <div className="space-y-2 text-[10px] text-slate-700 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm inline-block"></span>
                            School
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-yellow-500 border border-yellow-200 flex items-center justify-center text-[8px] font-bold text-yellow-900 shadow-sm">&gt;</span>
                            Cluster (10+)
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-red-500 border border-red-200 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">&gt;</span>
                            Cluster (30+)
                        </div>
                        {activeMode === 'compare' && (
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.3)] border border-white inline-block"></span>
                                Compared
                            </div>
                        )}
                        {activeMode === 'analyze' && (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-600 inline-block"></span>
                                Analysis Area
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Heatmap Legend */}
            {viewMode === 'heatmap' && (
                <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-slate-200 w-60">
                    <h4 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-100 pb-1">Heatmap Density</h4>
                    <p className="text-[10px] text-slate-500 mb-2 font-medium">Shows school clustering density across Kathmandu.</p>
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-300 via-green-400 to-red-500 mb-1 shadow-inner"></div>
                    <div className="flex justify-between text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">
                        <span>Low Density</span>
                        <span>High Density</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default React.memo(Map);
