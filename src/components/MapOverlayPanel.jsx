import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { stripDistanceKm } from '../utils/analyzeArea';

function formatRadiusKm(r) {
    const n = Number(r);
    if (Number.isNaN(n)) return '0';
    return parseFloat(n.toFixed(2)).toString();
}

function truncateLabel(name, maxLen = 18) {
    if (!name) return '';
    if (name.length <= maxLen) return name;
    return `${name.slice(0, maxLen - 1)}...`;
}

export default function MapOverlayPanel({
    activeMode,
    setActiveMode,
    modeState,
    setModeState,
    comparisonSchools,
    setComparisonSchools,
    showComparePanel,
    setShowComparePanel,
    onRetryLocation,
    onAreaListSchoolClick,
    areaCompareActive,
}) {
    const sortedAreaSchools = useMemo(() => {
        const list = modeState.analyze.schoolsInRadius || [];
        return [...list].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }, [modeState.analyze.schoolsInRadius]);

    if (activeMode === 'default') return null;

    const handleExit = () => {
        setActiveMode('default');
    };

    return (
        <>
            <div className="absolute bottom-6 left-4 z-[40] w-[22rem] max-h-[60vh] flex flex-col pointer-events-none">
                {!showComparePanel && (
                    <div className="bg-slate-50/95 shadow-md border border-slate-200/80 rounded-2xl p-5 flex flex-col pointer-events-auto overflow-hidden backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/80">
                            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                                {activeMode === 'measure' && 'Measure Distance'}
                                {activeMode === 'analyze' && 'Analyze Area'}
                                {activeMode === 'bestLocation' && 'Best Location'}
                                {activeMode === 'compare' && 'Compare Schools'}
                            </h3>
                            <button
                                onClick={handleExit}
                                className="text-[11px] uppercase font-semibold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1 shadow-sm transition-colors"
                            >
                                Exit Mode
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar">
                            {activeMode === 'measure' && (
                                <div className="text-sm space-y-3">
                                    <p className="text-xs text-slate-600">Click two points on the map to calculate distance.</p>
                                    {modeState.measure.start && modeState.measure.end ? (
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex justify-between items-center">
                                            <span className="font-semibold text-blue-800">Distance:</span>
                                            <span className="font-semibold text-xl text-blue-700">{modeState.measure.distance.toFixed(2)} km</span>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-xs italic">Waiting for points...</p>
                                    )}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setModeState((m) => ({ ...m, measure: { start: null, end: null, distance: null } }))}
                                            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                                        >
                                            Clear Measurement
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeMode === 'analyze' && (
                                <div className="space-y-4">
                                    {modeState.analyze.locationError === 'denied' && (
                                        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                            <p className="font-semibold">Location access denied</p>
                                            <p className="mt-1 text-amber-800/90">Enable location in your browser settings, or use Analyze Area and click the map instead.</p>
                                            <button
                                                type="button"
                                                onClick={() => onRetryLocation?.()}
                                                className="mt-2 text-[11px] font-semibold uppercase text-blue-700 hover:text-blue-900"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    {modeState.analyze.locationError === 'failed' && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
                                            <p className="font-semibold">Could not get your location</p>
                                            <button
                                                type="button"
                                                onClick={() => onRetryLocation?.()}
                                                className="mt-2 text-[11px] font-semibold uppercase text-blue-700 hover:text-blue-900"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                                            {modeState.analyze.isLocationMode && modeState.analyze.center
                                                ? 'Analyzing around your location'
                                                : 'Analyzing selected area'}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {modeState.analyze.isLocationMode
                                                ? 'Schools within your GPS radius are shown. Adjust radius anytime.'
                                                : 'Click on the map to set center, then choose a radius.'}
                                        </p>
                                    </div>

                                    {modeState.analyze.center && (
                                        <>
                                            <div>
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <span className="text-xs font-medium text-slate-600">
                                                        Radius:{' '}
                                                        <span className="font-semibold text-blue-700 tabular-nums">
                                                            {formatRadiusKm(modeState.analyze.radius)} km
                                                        </span>
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={0.25}
                                                    max={5}
                                                    step={0.25}
                                                    value={modeState.analyze.radius}
                                                    onChange={(e) => setModeState((m) => ({
                                                        ...m,
                                                        analyze: {
                                                            ...m.analyze,
                                                            radius: Number(e.target.value),
                                                            listFocusSchoolId: null,
                                                        },
                                                    }))}
                                                    className="mt-2 w-full accent-blue-600 h-1.5 cursor-pointer rounded-full"
                                                />
                                                <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400 tabular-nums">
                                                    <span>0.25 km</span>
                                                    <span>5 km</span>
                                                </div>
                                            </div>

                                            {modeState.analyze.stats && (
                                                <div className="text-sm text-slate-700 bg-slate-100/80 p-3 rounded-xl border border-slate-200 space-y-2.5">
                                                    <p className="flex justify-between items-center text-xs">Total Schools: <span className="font-semibold text-lg text-slate-800">{modeState.analyze.stats.total}</span></p>
                                                    {modeState.analyze.nearestSchool && (
                                                        <div className="rounded-lg border border-blue-200 bg-blue-50/80 px-2 py-1.5 text-xs">
                                                            <span className="font-medium text-slate-600">Nearest school: </span>
                                                            <span className="font-semibold text-slate-800">{modeState.analyze.nearestSchool.school.name}</span>
                                                            <span className="text-blue-700 font-semibold">
                                                                {' '}(
                                                                {modeState.analyze.nearestSchool.distanceKm > 1
                                                                    ? `${modeState.analyze.nearestSchool.distanceKm.toFixed(2)} km`
                                                                    : `${Math.round(modeState.analyze.nearestSchool.distanceKm * 1000)} m`}
                                                                )
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setModeState((m) => ({
                                                                ...m,
                                                                analyze: { ...m.analyze, showBreakdown: !m.analyze.showBreakdown },
                                                            }))}
                                                            className="rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                                        >
                                                            {modeState.analyze.showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setModeState((m) => ({
                                                                ...m,
                                                                analyze: { ...m.analyze, showSchoolList: !m.analyze.showSchoolList },
                                                            }))}
                                                            className="rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                                        >
                                                            {modeState.analyze.showSchoolList ? 'Hide School List' : 'Show School List'}
                                                        </button>
                                                    </div>

                                                    {modeState.analyze.showBreakdown && (
                                                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs space-y-1.5">
                                                            <p className="font-semibold text-slate-700">School Type Breakdown</p>
                                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
                                                                <span className="flex justify-between">Public <b className="text-slate-800">{modeState.analyze.stats.public}</b></span>
                                                                <span className="flex justify-between">Private <b className="text-slate-800">{modeState.analyze.stats.private}</b></span>
                                                                <span className="flex justify-between">Community <b className="text-slate-800">{modeState.analyze.stats.community}</b></span>
                                                                <span className="flex justify-between">Unknown <b className="text-slate-800">{modeState.analyze.stats.unknown ?? 0}</b></span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeMode === 'bestLocation' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-600">Click anywhere on the map to find nearest schools and accessibility score.</p>
                                </div>
                            )}

                            {activeMode === 'compare' && (
                                <div className="space-y-4">
                                    {areaCompareActive && (
                                        <p className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-[11px] font-medium text-blue-900">
                                            Comparing schools inside your analyzed area only. Use the sidebar search to pick from that list.
                                        </p>
                                    )}
                                    <div className="mb-1">
                                        <ol className="text-xs text-slate-600 space-y-1.5 list-none">
                                            <li className="flex gap-2"><span className="font-semibold text-blue-600">1.</span>{areaCompareActive ? 'Distances use your analysis center.' : 'Select a location on the map where you want to compare.'}</li>
                                            <li className="flex gap-2"><span className="font-semibold text-blue-600">2.</span>Select up to 3 schools from the search bar.</li>
                                            <li className="flex gap-2"><span className="font-semibold text-blue-600">3.</span>Click <b>Compare Now</b> to view comparison.</li>
                                        </ol>
                                    </div>
                                    <div className="bg-slate-100 border border-slate-300 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-300">
                                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Selection (<span className="text-blue-600">{comparisonSchools.length}/3</span>)
                                            </p>
                                            <button
                                                onClick={() => setComparisonSchools([])}
                                                className="text-[10px] font-semibold text-slate-500 hover:text-red-600 uppercase transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        {comparisonSchools.length > 0 ? (
                                            <ul className="space-y-1.5 mb-3">
                                                {comparisonSchools.map((s) => (
                                                    <li key={s.id} className="text-xs bg-slate-50 border border-slate-200 p-1.5 rounded-lg flex justify-between items-center">
                                                        <span className="truncate font-medium text-slate-700">{s.name}</span>
                                                        <button onClick={() => setComparisonSchools((prev) => prev.filter((sc) => sc.id !== s.id))} className="ml-2 p-1 rounded-md bg-red-100 text-red-700 hover:bg-red-100 transition-colors">
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
                                            className={`w-full py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors ${comparisonSchools.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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

            {activeMode === 'analyze' && modeState.analyze.showSchoolList && modeState.analyze.center && (
                <div className="absolute top-20 right-4 z-[42] w-[22rem] max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-md backdrop-blur-sm pointer-events-auto">
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80 bg-slate-50/90">
                        <h4 className="text-sm font-semibold text-slate-900 tracking-tight">Schools in Radius</h4>
                        <button
                            type="button"
                            onClick={() => setModeState((m) => ({
                                ...m,
                                analyze: { ...m.analyze, showSchoolList: false },
                            }))}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-400 text-white shadow-sm transition-colors hover:bg-red-500"
                            title="Close school list"
                            aria-label="Close school list"
                        >
                            <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                    </div>
                    <ul className="max-h-[calc(70vh-52px)] overflow-y-auto custom-scrollbar divide-y divide-slate-100 text-xs">
                        {sortedAreaSchools.length === 0 ? (
                            <li className="p-3 text-slate-500 italic">No schools in this radius.</li>
                        ) : (
                            sortedAreaSchools.map((s) => {
                                const distStr = s.distanceKm > 1 ? `${s.distanceKm.toFixed(2)} km` : `${Math.round(s.distanceKm * 1000)} m`;
                                const school = stripDistanceKm(s);
                                return (
                                    <li key={school.id}>
                                        <button
                                            type="button"
                                            onClick={() => onAreaListSchoolClick?.(school)}
                                            className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors"
                                        >
                                            <span className="font-medium text-slate-800" title={school.name}>{truncateLabel(school.name, 28)}</span>
                                            <span className="flex-shrink-0 font-semibold text-blue-600">{distStr}</span>
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </>
    );
}


