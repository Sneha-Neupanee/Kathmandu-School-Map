import React, { useRef } from 'react';
import { useSchoolsData } from './hooks/useSchoolsData';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import { Loader2, AlertCircle } from 'lucide-react';

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

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">

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
            if (handleFlyToRef.current) {
              handleFlyToRef.current(school);
            }
          }}
          schools={filteredData}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
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
        />

      </div>
    </div>
  );
}

export default App;