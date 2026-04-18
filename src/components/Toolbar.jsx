import React from 'react';
import { Ruler, Sparkles, MapPin, BarChart3, Thermometer, Satellite, Navigation } from 'lucide-react';

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
    onSearchSchoolsNearYou,
}) {

    return (
        <div className="absolute top-3 left-4 z-20 flex flex-col items-start gap-2 max-w-[calc(100vw-160px)]">
            {/* Map Interaction Modes */}
            <div className="bg-slate-50 shadow-md rounded-full border border-slate-400 p-1 flex gap-0.5 flex-wrap">
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

            <button
                type="button"
                onClick={() => onSearchSchoolsNearYou?.()}
                title="Use your current location to analyze schools within 0.5 km"
                className="bg-slate-50 shadow-md rounded-full border border-slate-400 px-3 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
            >
                <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Search schools near your location</span>
                <span className="sm:hidden">Near me</span>
            </button>

            {/* Map View Controls */}
            <div className="bg-slate-50 shadow-md rounded-full border border-slate-400 p-1 flex gap-0.5 flex-wrap">
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

        </div>
    );
}
