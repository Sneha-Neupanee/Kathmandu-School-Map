import React, { useRef, useState, useCallback } from 'react';
import { useSchoolsData } from './hooks/useSchoolsData';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SchoolDetails from './components/SchoolDetails';
import Toolbar from './components/Toolbar';
import MapOverlayPanel from './components/MapOverlayPanel';
import ComparisonPanel from './components/ComparisonPanel';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

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

  const [modeState, setModeState] = useState({
    measure: { start: null, end: null, distance: null },
    analyze: { center: null, radius: 2, stats: null },
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
      analyze: { center: null, radius: 2, stats: null },
      bestLocation: { selectedPoint: null, nearestSchools: [], score: 0, scoreLabel: '' }
    });
    if (handleResetMapRef.current) handleResetMapRef.current();
  };

  useEffect(() => {
    if (activeMode !== 'default') {
      setSelectedSchool(null);
    }
    // Do NOT reset searchTerm here — it clears filter context on tab switch
    setComparisonSchools([]);
    setCompareRefPoint(null);
    setShowComparePanel(false);
    setModeState({
      measure: { start: null, end: null, distance: null },
      analyze: { center: null, radius: 2, stats: null },
      bestLocation: { selectedPoint: null, nearestSchools: [], score: 0, scoreLabel: '' }
    });
  }, [activeMode]);

  // Map view state (lifted up so Toolbar can control them)
  const [mapStyle, setMapStyle] = useState('light');
  const [viewMode, setViewMode] = useState('markers');

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800">

      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(15,23,42,0.04)] border-r border-slate-200/50 relative bg-white/80 backdrop-blur-xl">
        <Sidebar
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filteredCount={filteredData.length}
          onSchoolSelect={(school) => {
            if (activeMode === 'compare') {
              setComparisonSchools(prev => {
                if (prev.find(s => s.id === school.id)) return prev.filter(s => s.id !== school.id);
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
          schools={filteredData}
          selectedSchool={selectedSchool}
          onCloseDetails={() => setSelectedSchool(null)}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          modeState={modeState}
          setModeState={setModeState}
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
          onSchoolSelect={useCallback((school) => {
            if (activeMode === 'compare') {
              setComparisonSchools(prev => {
                if (prev.find(s => s.id === school.id)) return prev.filter(s => s.id !== school.id);
                if (prev.length < 3) return [...prev, school];
                return prev;
              });
            } else {
              setSelectedSchool(school);
              if (handleFlyToRef.current) {
                handleFlyToRef.current(school);
              }
            }
          }, [activeMode])}
          onMapClick={useCallback((point) => {
            if (activeMode === 'compare') setCompareRefPoint(point);
          }, [activeMode])}
          activeMode={activeMode}
          selectedSchool={selectedSchool}
          comparisonSchools={comparisonSchools}
          mapStyle={mapStyle}
          setMapStyle={setMapStyle}
          viewMode={viewMode}
          setViewMode={setViewMode}
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
          compareRefPoint={compareRefPoint}
        />

        {/* The actual Comparison Panel overlaying if expanded */}
        {activeMode === 'compare' && showComparePanel && (
          <ComparisonPanel
            schools={comparisonSchools}
            referencePoint={compareRefPoint}
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
  );
}

export default App;