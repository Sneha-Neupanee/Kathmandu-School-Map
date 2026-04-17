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

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(true); // default to dark
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Toolbar */}
        <Toolbar activeMode={activeMode} setActiveMode={setActiveMode} />

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Loading overlay */}
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