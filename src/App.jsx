import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSchoolsData } from './hooks/useSchoolsData';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SchoolDetails from './components/SchoolDetails';
import Toolbar from './components/Toolbar';
import MapOverlayPanel from './components/MapOverlayPanel';
import ComparisonPanel from './components/ComparisonPanel';
import SchoolAtlasTour from './components/SchoolAtlasTour';
import { Loader2, AlertCircle } from 'lucide-react';
import { DEFAULT_RADIUS_KM, stripDistanceKm } from './utils/analyzeArea';

/** Tour persistence: bumped from hasSeenSchoolAtlasTour so users stuck after earlier builds can see the tour again. */
const TOUR_DISMISSED_KEY = 'schoolAtlasTourDismissed_v2';

function readShouldShowAtlasTour() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TOUR_DISMISSED_KEY) !== 'true';
  } catch {
    return true;
  }
}

const emptyAnalyze = () => ({
  center: null,
  radius: DEFAULT_RADIUS_KM,
  stats: null,
  isLocationMode: false,
  schoolsInRadius: [],
  nearestSchool: null,
  showSchoolList: false,
  showBreakdown: false,
  locationError: null,
  listFocusSchoolId: null,
});

function App() {
  const {
    filteredData,
    stats,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    retry,
  } = useSchoolsData();

  const handleFlyToRef = useRef(null);
  const handleResetMapRef = useRef(null);
  const handleFlyToLocationRef = useRef(null); // Exposed from Map for location search
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [activeMode, setActiveMode] = useState('default');

  const [comparisonSchools, setComparisonSchools] = useState([]);
  const [compareRefPoint, setCompareRefPoint] = useState(null);
  const [showComparePanel, setShowComparePanel] = useState(false);

  const [showTour, setShowTour] = useState(readShouldShowAtlasTour);

  const [modeState, setModeState] = useState({
    measure: { start: null, end: null, distance: null },
    analyze: emptyAnalyze(),
    bestLocation: { selectedPoint: null, nearestSchools: [], score: 0, scoreLabel: '' }
  });

  const resetView = () => {
    setActiveMode('default');
    setSearchTerm('');
    setFilterType('all');
    setSelectedSchool(null);
    setComparisonSchools([]);
    setCompareRefPoint(null);
    setShowComparePanel(false);
    setModeState({
      measure: { start: null, end: null, distance: null },
      analyze: emptyAnalyze(),
      bestLocation: { selectedPoint: null, nearestSchools: [], score: 0, scoreLabel: '' }
    });
    if (handleResetMapRef.current) handleResetMapRef.current();
  };

  const areaCompareActive =
    activeMode === 'compare' &&
    modeState.analyze.center != null &&
    modeState.analyze.stats != null;

  const compareSchoolPool = useMemo(() => {
    if (areaCompareActive) {
      return modeState.analyze.schoolsInRadius.map(stripDistanceKm);
    }
    return filteredData;
  }, [areaCompareActive, modeState.analyze.schoolsInRadius, filteredData]);

  const requestNearbySchools = useCallback(() => {
    if (!navigator.geolocation) {
      setActiveMode('analyze');
      setModeState((m) => ({
        ...m,
        analyze: {
          ...emptyAnalyze(),
          locationError: 'failed',
          isLocationMode: true,
        },
      }));
      return;
    }
    setActiveMode('analyze');
    setModeState((m) => ({
      ...m,
      analyze: {
        ...emptyAnalyze(),
        locationError: null,
        isLocationMode: true,
      },
    }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setModeState((m) => ({
          ...m,
          analyze: {
            ...m.analyze,
            center: { lat, lng },
            radius: DEFAULT_RADIUS_KM,
            isLocationMode: true,
            locationError: null,
            listFocusSchoolId: null,
          },
        }));
        if (handleFlyToLocationRef.current) {
          handleFlyToLocationRef.current({ lat, lng });
        }
      },
      (err) => {
        const denied = err && (err.code === 1 || err.code === err.PERMISSION_DENIED);
        setModeState((m) => ({
          ...m,
          analyze: {
            ...emptyAnalyze(),
            locationError: denied ? 'denied' : 'failed',
            isLocationMode: true,
          },
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  /* Reset peripheral UI when switching map modes; intentional synchronous batch */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (activeMode !== 'default') {
      setSelectedSchool(null);
    }
    setComparisonSchools([]);
    setCompareRefPoint(null);
    setShowComparePanel(false);
    setModeState((prev) => ({
      measure: { start: null, end: null, distance: null },
      analyze: activeMode === 'default' ? emptyAnalyze() : prev.analyze,
      bestLocation:
        activeMode === 'bestLocation'
          ? prev.bestLocation
          : { selectedPoint: null, nearestSchools: [], score: 0, scoreLabel: '' },
    }));
  }, [activeMode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Map view state (lifted up so Toolbar can control them)
  const [mapStyle, setMapStyle] = useState('light');
  const [viewMode, setViewMode] = useState('markers');

  const onAreaListSchoolClick = useCallback((school) => {
    setModeState((m) => ({
      ...m,
      analyze: { ...m.analyze, listFocusSchoolId: school.id },
    }));
    setSelectedSchool(school);
    if (handleFlyToRef.current) {
      handleFlyToRef.current(school);
    }
  }, []);

  const sidebarSchools = compareSchoolPool;

  return (
    <>
    <div className="flex h-screen w-full overflow-hidden font-sans bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800">

      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(15,23,42,0.04)] border-r border-slate-200/50 relative bg-white/80 backdrop-blur-xl">
        <Sidebar
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filteredCount={sidebarSchools.length}
          onSchoolSelect={(school) => {
            if (activeMode === 'compare') {
              if (areaCompareActive) {
                const allowed = modeState.analyze.schoolsInRadius.some((s) => s.id === school.id);
                if (!allowed) return;
              }
              setComparisonSchools((prev) => {
                if (prev.find((s) => s.id === school.id)) return prev.filter((s) => s.id !== school.id);
                if (prev.length < 3) return [...prev, school];
                return prev;
              });
            } else {
              setSearchTerm(school.name);
              setSelectedSchool(school);
              if (handleFlyToRef.current) {
                handleFlyToRef.current(school);
              }
            }
          }}
          schools={sidebarSchools}
          selectedSchool={selectedSchool}
          onCloseDetails={() => setSelectedSchool(null)}
          resetView={resetView}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
        <Toolbar
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          viewMode={viewMode}
          toggleViewMode={() => setViewMode(prev => prev === 'markers' ? 'heatmap' : 'markers')}
          mapStyle={mapStyle}
          toggleMapStyle={() => {
            const next = mapStyle === 'light' ? 'satellite' : 'light';
            setMapStyle(next);
          }}
          onSearchSchoolsNearYou={requestNearbySchools}
        />

        {isLoading && (
          <div className="absolute inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-slate-800">Loading Geographic Data</h2>
            <p className="text-slate-500 mt-2">Fetching schools from OpenStreetMap...</p>
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Fetch Error</h2>
            <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 max-w-lg mb-6">
              {error}
            </p>
            <button
              onClick={retry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Map Component */}
        <Map
          data={filteredData}
          registerFlyTo={(flyToFn) => { handleFlyToRef.current = flyToFn; }}
          onSchoolSelect={useCallback(
            (school) => {
              if (activeMode === 'compare') {
                if (areaCompareActive) {
                  const allowed = modeState.analyze.schoolsInRadius.some((s) => s.id === school.id);
                  if (!allowed) return;
                }
                setComparisonSchools((prev) => {
                  if (prev.find((s) => s.id === school.id)) return prev.filter((s) => s.id !== school.id);
                  if (prev.length < 3) return [...prev, school];
                  return prev;
                });
              } else {
                setSelectedSchool(school);
                if (handleFlyToRef.current) {
                  handleFlyToRef.current(school);
                }
              }
            },
            [activeMode, areaCompareActive, modeState.analyze.schoolsInRadius]
          )}
          analyzeListHighlightId={modeState.analyze.listFocusSchoolId}
          onMapClick={useCallback((point) => {
            if (activeMode === 'compare') setCompareRefPoint(point);
          }, [activeMode])}
          activeMode={activeMode}
          selectedSchool={selectedSchool}
          comparisonSchools={comparisonSchools}
          mapStyle={mapStyle}
          viewMode={viewMode}
          modeState={modeState}
          setModeState={setModeState}
          registerResetMap={(resetFn) => { handleResetMapRef.current = resetFn; }}
          registerFlyToLocation={(fn) => { handleFlyToLocationRef.current = fn; }}
        />


        {/* Mode specific overlay mapped safely to UI bottom-left side */}
        <MapOverlayPanel
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          modeState={modeState}
          setModeState={setModeState}
          comparisonSchools={comparisonSchools}
          setComparisonSchools={setComparisonSchools}
          showComparePanel={showComparePanel}
          setShowComparePanel={setShowComparePanel}
          onRetryLocation={requestNearbySchools}
          onAreaListSchoolClick={onAreaListSchoolClick}
          areaCompareActive={areaCompareActive}
        />

        {/* The actual Comparison Panel overlaying if expanded */}
        {activeMode === 'compare' && showComparePanel && (
          <ComparisonPanel
            schools={comparisonSchools}
            referencePoint={
              compareRefPoint ||
              (areaCompareActive && modeState.analyze.center
                ? modeState.analyze.center
                : null)
            }
            onRemove={(id) => {
              const updated = comparisonSchools.filter(s => s.id !== id);
              setComparisonSchools(updated);
              if (updated.length === 0) setShowComparePanel(false);
            }}
            onClose={() => setShowComparePanel(false)}
          />
        )}

      </div>
    </div>
    {showTour &&
      createPortal(
        <SchoolAtlasTour
          dismissedStorageKey={TOUR_DISMISSED_KEY}
          onDismiss={() => setShowTour(false)}
        />,
        document.body
      )}
    </>
  );
}

export default App;