import React from 'react';
import { Ruler, Sparkles, MapPin, BarChart3, Thermometer, Satellite, Navigation } from 'lucide-react';

const MODES = [
    { id: 'measure', label: 'Measure', icon: Ruler, tooltip: 'Click two points on the map to measure distance' },
    { id: 'analyze', label: 'Analyze Area', icon: Sparkles, tooltip: 'Analyze school density within a selected radius' },
    { id: 'bestLocation', label: 'Best Location', icon: MapPin, tooltip: 'Find nearest schools and calculate accessibility score' },
    { id: 'compare', label: 'Compare', icon: BarChart3, tooltip: 'Select up to 3 schools to compare side-by-side' },
];

const btnBase =
    'h-8 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold shadow-sm transition-all';

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
        <div className="absolute top-3 left-4 z-20 flex max-w-[calc(100%-4.5rem)] flex-col gap-2">
            <div data-tour="top-toolbar" className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/95 p-1 shadow-sm backdrop-blur-sm">
                {MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => setActiveMode(isActive ? 'default' : mode.id)}
                            title={mode.tooltip}
                            aria-label={mode.label}
                            className={`${btnBase} ${isActive
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="hidden md:inline">{mode.label}</span>
                        </button>
                    );
                })}

                <span className="mx-0.5 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />

                <button
                    type="button"
                    onClick={toggleViewMode}
                    title="Toggle density heat visualization"
                    aria-label="Heatmap View"
                    className={`${btnBase} ${viewMode === 'heatmap'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                >
                    <Thermometer className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="hidden md:inline">Heatmap</span>
                </button>
                <button
                    type="button"
                    onClick={toggleMapStyle}
                    title="Switch map to satellite imagery"
                    aria-label="Satellite View"
                    className={`${btnBase} ${mapStyle === 'satellite'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <Satellite className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="hidden md:inline">Satellite</span>
                </button>
            </div>

            <button
                type="button"
                onClick={() => onSearchSchoolsNearYou?.()}
                title="Use your current location to analyze schools nearby"
                data-tour="search-nearby"
                className="w-fit rounded-xl border border-slate-200/80 bg-slate-50/95 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
                <span className="inline-flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Search schools near your location</span>
                    <span className="sm:hidden">Near me</span>
                </span>
            </button>
        </div>
    );
}
