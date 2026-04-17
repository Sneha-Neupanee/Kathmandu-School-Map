import React from 'react';
import ComparisonPanel from './ComparisonPanel';

export default function MapOverlayPanel({
    activeMode,
    setActiveMode,
    modeState,
    setModeState,
    comparisonSchools,
    setComparisonSchools,
    showComparePanel,
    setShowComparePanel,
    compareRefPoint
}) {
    if (activeMode === 'default') return null;

    const handleExit = () => {
        setActiveMode('default');
    };

    return (
        <div className="absolute bottom-6 left-4 z-[40] w-80 max-h-[60vh] flex flex-col pointer-events-none">
            {/* Main overlay panel for measure, analyze, bestLocation, and Compare selection */}
            {(!showComparePanel) && (
                <div className="bg-slate-50 shadow-xl border border-slate-400 rounded-xl p-4 flex flex-col pointer-events-auto overflow-hidden">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-300">
                        <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                            {activeMode === 'measure' && 'Measure Distance'}
                            {activeMode === 'analyze' && 'Analyze Area'}
                            {activeMode === 'bestLocation' && 'Best Location'}
                            {activeMode === 'compare' && 'Compare Schools'}
                        </h3>
                        <button
                            onClick={handleExit}
                            className="text-[10px] uppercase font-bold text-slate-500 hover:text-red-500 bg-slate-100 border border-slate-400 rounded px-2 py-0.5 shadow-sm transition-colors"
                        >
                            Exit Mode
                        </button>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar">
                        {activeMode === 'measure' && (
                            <div className="text-sm space-y-3">
                                <div className="mb-3">
                                    <p className="text-xs text-slate-600">Click two points on the map to calculate distance.</p>
                                </div>
                                {modeState.measure.start && modeState.measure.end ? (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-300 flex justify-between items-center">
                                        <span className="font-semibold text-blue-800">Distance:</span>
                                        <span className="font-bold text-xl text-blue-700">{modeState.measure.distance.toFixed(2)} km</span>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-xs italic">Waiting for points...</p>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setModeState(m => ({ ...m, measure: { start: null, end: null, distance: null } }))}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                    >
                                        Clear Measurement
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeMode === 'analyze' && (
                            <div className="space-y-4">
                                <div className="mb-1">
                                    <p className="text-xs text-slate-600">Click anywhere on the map to analyze school density within a selected radius.</p>
                                </div>
                                {modeState.analyze.center && (
                                    <>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                                <span>Radius</span>
                                                <span className="text-blue-600">{modeState.analyze.radius} km</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="5" step="0.5"
                                                value={modeState.analyze.radius}
                                                onChange={(e) => setModeState(m => ({ ...m, analyze: { ...m.analyze, radius: Number(e.target.value) } }))}
                                                className="w-full mt-1.5 accent-blue-600"
                                            />
                                        </div>
                                        {modeState.analyze.stats && (
                                            <div className="text-sm text-slate-700 bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-2">
                                                <p className="flex justify-between items-center text-xs">Total Schools: <span className="font-bold text-lg text-slate-800">{modeState.analyze.stats.total}</span></p>
                                                <p className="flex justify-between items-center text-xs">
                                                    Density:
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">{modeState.analyze.stats.density.toFixed(1)} / km²</span>
                                                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white shadow-sm ${modeState.analyze.stats.densityLabel === 'High' ? 'bg-red-500' : modeState.analyze.stats.densityLabel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{modeState.analyze.stats.densityLabel}</span>
                                                    </span>
                                                </p>
                                                <div className="pt-2 mt-1 border-t border-slate-400 text-xs flex flex-col gap-1 font-medium">
                                                    <span className="text-slate-500 flex justify-between">Public Schools: <b className="text-slate-800">{modeState.analyze.stats.public}</b></span>
                                                    <span className="text-slate-500 flex justify-between">Private Schools: <b className="text-slate-800">{modeState.analyze.stats.private}</b></span>
                                                    <span className="text-slate-500 flex justify-between">Community Schools: <b className="text-slate-800">{modeState.analyze.stats.community}</b></span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeMode === 'bestLocation' && (
                            <div className="space-y-2">
                                <div className="mb-1">
                                    <p className="text-xs text-slate-600">Click anywhere on the map to find nearest schools and accessibility score.</p>
                                </div>
                            </div>
                        )}

                        {activeMode === 'compare' && (
                            <div className="space-y-4">
                                <div className="mb-1">
                                    <ol className="text-xs text-slate-600 space-y-1.5 list-none">
                                        <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span>Select a location on the map where you want to compare.</li>
                                        <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span>Select up to 3 schools from the search bar.</li>
                                        <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span>Click <b>Compare Now</b> to view comparison.</li>
                                    </ol>
                                </div>
                                <div className="bg-slate-100 border border-slate-400 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-300">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Selection (<span className="text-blue-600">{comparisonSchools.length}/3</span>)
                                        </p>
                                        <button
                                            onClick={() => setComparisonSchools([])}
                                            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    {comparisonSchools.length > 0 ? (
                                        <ul className="space-y-1.5 mb-3">
                                            {comparisonSchools.map(s => (
                                                <li key={s.id} className="text-xs bg-slate-50 border border-slate-300 p-1.5 rounded flex justify-between items-center">
                                                    <span className="truncate font-medium text-slate-700">{s.name}</span>
                                                    <button onClick={() => setComparisonSchools(prev => prev.filter(sc => sc.id !== s.id))} className="text-slate-400 hover:text-red-500 pl-2">
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic mb-3">Select schools from the map to compare context.</p>
                                    )}
                                    <button
                                        onClick={() => setShowComparePanel(true)}
                                        disabled={comparisonSchools.length === 0}
                                        className={`w-full py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${comparisonSchools.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        Compare Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
