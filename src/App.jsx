import React, { useRef, useState } from 'react';
import { useSchoolsData } from './hooks/useSchoolsData';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SchoolDetails from './components/SchoolDetails';
import Toolbar from './components/Toolbar';
import ComparisonPanel from './components/ComparisonPanel';
import { Loader2, AlertCircle, Moon, Sun } from 'lucide-react';
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

  const handleFlyToRef = useRef(null); // Ref to hold FlyTo function from Map
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [activeMode, setActiveMode] = useState('default'); // Modes for toolbar

  const [comparisonSchools, setComparisonSchools] = useState([]);
  const [compareRefPoint, setCompareRefPoint] = useState(null);
  const [showComparePanel, setShowComparePanel] = useState(false);

  const [modeState, setModeState] = useState({
    measure: { start: null, end: null, distance: null },
    analyze: { center: null, radius: 2, stats: null },
    bestLocation: { selectedPoint: null, nearestSchools: [], score: 0, scoreLabel: '' }
  });

  const handleResetMapRef = useRef(null);

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

  const [isDarkMode, setIsDarkMode] = useState(false); // default LIGHT mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Map view state (lifted up so Toolbar can control them)
  const [mapStyle, setMapStyle] = useState('light');
  const [viewMode, setViewMode] = useState('markers');

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 overflow-hidden font-sans ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 z-10 shadow-xl border-r border-slate-200">
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

        {/* Floating Mode Instruction Box */}
        {activeMode !== 'default' && (
          <div className="absolute top-[68px] left-4 z-20 bg-white/95 backdrop-blur-sm shadow-md border border-slate-200 rounded-lg p-3 w-64 pointer-events-auto">
            <h4 className="font-bold text-slate-800 text-sm mb-1">
              {activeMode === 'measure' && 'Measure Distance'}
              {activeMode === 'analyze' && 'Analyze Area'}
              {activeMode === 'bestLocation' && 'Best Location'}
              {activeMode === 'compare' && 'Compare Schools'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activeMode === 'measure' && 'Click two points on the map to calculate distance.'}
              {activeMode === 'analyze' && 'Click anywhere to analyze school density within a selected radius.'}
              {activeMode === 'bestLocation' && 'Click anywhere to find nearest schools and accessibility score.'}
              {activeMode === 'compare' && 'Select up to 3 schools from map or search to compare.'}
            </p>
          </div>
        )}

        {/* Theme toggle — anchored top-right, shifted left from map controls */}
        <div className="absolute top-3 right-16 z-20">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-slate-800">Loading Geographic Data</h2>
            <p className="text-slate-500 mt-2">Fetching schools from OpenStreetMap...</p>
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
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
          onSchoolSelect={(school) => {
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
          }}
          onMapClick={(point) => {
            if (activeMode === 'compare') setCompareRefPoint(point);
          }}
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
        />


        {/* Comparison Multi-Select Overlay & Panel */}
        {activeMode === 'compare' && (
          <>
            {comparisonSchools.length > 0 && !showComparePanel && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 bg-white px-5 py-3 rounded-xl shadow-2xl border border-slate-200 flex items-center gap-4 animate-bounce shrink-0">
                <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                  <span className="text-blue-600 font-bold">{comparisonSchools.length}</span> / 3 selected
                </p>
                <button
                  onClick={() => setShowComparePanel(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-colors whitespace-nowrap"
                >
                  Compare Now
                </button>
                <button
                  onClick={() => setComparisonSchools([])}
                  className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {showComparePanel && (
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
          </>
        )}

      </div>
    </div>
  );
}

export default App;