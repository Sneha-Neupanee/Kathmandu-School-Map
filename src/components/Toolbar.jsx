import React, { useState, useRef, useEffect } from 'react';
import { Ruler, Sparkles, MapPin, BarChart3, Thermometer, Satellite, Search, X, Loader2 } from 'lucide-react';

const MODES = [
    { id: 'measure', label: 'Measure', icon: Ruler, tooltip: 'Click two points on the map to measure distance' },
    { id: 'analyze', label: 'Analyze Area', icon: Sparkles, tooltip: 'Analyze school density within a selected radius' },
    { id: 'bestLocation', label: 'Best Location', icon: MapPin, tooltip: 'Find nearest schools and calculate accessibility score' },
    { id: 'compare', label: 'Compare', icon: BarChart3, tooltip: 'Select up to 3 schools to compare side-by-side' },
];

export default function Toolbar({
    activeMode,
    setActiveMode,
    viewMode,
    toggleViewMode,
    mapStyle,
    toggleMapStyle,
    onLocationFound,
}) {
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setResults([]);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleQueryChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!val.trim()) { setResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ' Kathmandu')}&format=json&limit=5&countrycodes=np`;
                const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
                const data = await res.json();
                setResults(data);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleSelect = (place) => {
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        if (onLocationFound) onLocationFound({ lat, lng: lon, name: place.display_name });
        setQuery(place.display_name.split(',')[0]);
        setResults([]);
        setShowSearch(false);
    };

    return (
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 flex-wrap max-w-[calc(100vw-160px)]">
            {/* Map Interaction Modes */}
            <div className="bg-white shadow-md rounded-full border border-slate-200 p-1 flex gap-0.5">
                {MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => setActiveMode(isActive ? 'default' : mode.id)}
                            title={mode.tooltip}
                            aria-label={mode.label}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="hidden md:inline">{mode.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Map View Controls */}
            <div className="bg-white shadow-md rounded-full border border-slate-200 p-1 flex gap-0.5">
                <button
                    onClick={toggleViewMode}
                    title="Toggle density heat visualization"
                    aria-label="Heatmap View"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${viewMode === 'heatmap'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                >
                    <Thermometer className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden md:inline">Heatmap</span>
                </button>
                <button
                    onClick={toggleMapStyle}
                    title="Switch map to satellite imagery"
                    aria-label="Satellite View"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${mapStyle === 'satellite'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <Satellite className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden md:inline">Satellite</span>
                </button>
            </div>

            {/* Location Search */}
            <div className="relative" ref={searchRef}>
                {!showSearch ? (
                    <button
                        onClick={() => { setShowSearch(true); setTimeout(() => document.getElementById('loc-search-input')?.focus(), 50); }}
                        title="Search for a location on the map"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-all"
                    >
                        <Search className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="hidden md:inline">Search Location</span>
                    </button>
                ) : (
                    <div className="flex items-center bg-white shadow-md rounded-full border border-slate-200 pl-3 pr-1 py-0.5 gap-1">
                        <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <input
                            id="loc-search-input"
                            type="text"
                            value={query}
                            onChange={handleQueryChange}
                            placeholder="Search place..."
                            className="text-[11px] font-medium text-slate-700 placeholder-slate-400 outline-none bg-transparent w-36"
                        />
                        {isSearching && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                        <button onClick={() => { setShowSearch(false); setQuery(''); setResults([]); }} className="p-0.5 text-slate-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        {results.map((r) => (
                            <button
                                key={r.place_id}
                                onClick={() => handleSelect(r)}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-100 last:border-0 font-medium truncate"
                            >
                                {r.display_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
