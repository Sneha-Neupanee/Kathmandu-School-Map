import React, { useState } from 'react';
import SearchBar from './SearchBar';
import Stats from './Stats';
import Charts from './Charts';
import { School, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SchoolDetails from './SchoolDetails';

export default function Sidebar({
    stats,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredCount,
    onSchoolSelect,
    schools,
    selectedSchool,
    onCloseDetails,
    activeMode,
    setActiveMode,
    modeState,
    setModeState,
    resetView
}) {
    return (
        <div className="flex flex-col h-full bg-white z-20 relative">
            <div className="p-5 border-b border-slate-100 flex-shrink-0 bg-white">
                <div className="flex items-center space-x-3 mb-1">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-sm flex-shrink-0">
                        <School className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">KTM Schools</h1>
                        <p className="text-xs text-slate-500 font-medium">Intelligence Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={resetView} className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm" title="Reset all selections and modes">
                            Reset
                        </button>
                        <Link to="/dashboard" className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm" title="View Analytics">
                            View Analytics
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50">

                {/* Search & Filters */}
                <div className="p-5 space-y-4 bg-white border-b border-slate-200 relative">
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearch={setSearchTerm}
                        exactMatchAction={(val) => {
                            const match = schools.find(s => s.name.toLowerCase() === val.toLowerCase());
                            if (match) {
                                setSearchTerm(match.name);
                                onSchoolSelect(match);
                            }
                        }}
                    />

                    {/* Results Dropdown */}
                    {searchTerm && !selectedSchool && (
                        <div className="absolute top-[88px] left-5 right-5 border border-slate-200 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                            <div className="p-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                Results found: {schools.length}
                            </div>
                            {schools.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {schools.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setSearchTerm(s.name);
                                                onSchoolSelect(s);
                                            }}
                                            className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start space-x-3 text-sm group"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-slate-700">{s.name}</p>
                                                {s.type && <p className="text-xs text-slate-400 capitalize">{s.type}</p>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No schools found matching '{searchTerm}'.
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Filter Schools
                        </label>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <FilterChip active={!selectedSchool && filterType === 'all'} onClick={() => setFilterType('all')} label="All" count={stats.total} percentage={100} />
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex gap-2 flex-wrap">
                                <FilterChip active={(selectedSchool ? !!selectedSchool.name : filterType === 'named')} onClick={() => setFilterType('named')} label="Named" count={stats.named} percentage={stats.total ? (stats.named / stats.total * 100) : 0} />
                                <FilterChip active={(selectedSchool ? !selectedSchool.name : filterType === 'unnamed')} onClick={() => setFilterType('unnamed')} label="Unnamed" count={stats.unnamed} percentage={stats.total ? (stats.unnamed / stats.total * 100) : 0} />
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex gap-2 flex-wrap">
                                <FilterChip active={(selectedSchool ? selectedSchool.schoolType === 'private' : filterType === 'private')} onClick={() => setFilterType('private')} label="Private" count={stats.private || 0} percentage={stats.total && stats.private ? (stats.private / stats.total * 100) : 0} />
                                <FilterChip active={(selectedSchool ? selectedSchool.schoolType === 'public' : filterType === 'public')} onClick={() => setFilterType('public')} label="Public" count={stats.public || 0} percentage={stats.total && stats.public ? (stats.public / stats.total * 100) : 0} />
                                <FilterChip active={(selectedSchool ? selectedSchool.schoolType === 'community' : filterType === 'community')} onClick={() => setFilterType('community')} label="Community" count={stats.community || 0} percentage={stats.total && stats.community ? (stats.community / stats.total * 100) : 0} />
                                <FilterChip active={(selectedSchool ? selectedSchool.schoolType === 'unknown' : filterType === 'unknown')} onClick={() => setFilterType('unknown')} label="Unknown" count={stats.unknown || 0} percentage={stats.total && stats.unknown ? (stats.unknown / stats.total * 100) : 0} />
                            </div>
                        </div>
                    </div>
                </div>

                {selectedSchool ? (
                    <div className="p-5 flex-1 relative">
                        <SchoolDetails school={selectedSchool} onClose={() => {
                            onCloseDetails();
                            setSearchTerm('');
                        }} />
                    </div>
                ) : (
                    <>
                        <div className="p-5">
                            <Stats stats={stats} filteredCount={filteredCount} />
                        </div>
                        <div className="px-5 pb-6">
                            <Charts stats={stats} />
                        </div>
                    </>
                )}
            </div>

            {/* Mode Instructions embedded entirely in Sidebar */}
            {activeMode !== 'default' && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex-shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300 z-30">
                    <div className="flex justify-end mb-3">
                        <button onClick={() => setActiveMode('default')} className="text-[10px] uppercase font-bold text-slate-500 hover:text-red-500 bg-white border border-slate-200 rounded px-2 py-0.5 shadow-sm transition-colors">
                            Exit Mode
                        </button>
                    </div>

                    {activeMode === 'measure' && (
                        <div className="text-xs text-slate-600 space-y-2">
                            {modeState.measure.start && !modeState.measure.end && (
                                <p className="font-semibold text-blue-600 animate-pulse">Select second point...</p>
                            )}
                            {modeState.measure.start && modeState.measure.end && (
                                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                                    <span className="font-semibold text-slate-500">Distance:</span>
                                    <span className="font-bold text-lg text-blue-700">{modeState.measure.distance.toFixed(2)} km</span>
                                </div>
                            )}
                        </div>
                    )}

                    {activeMode === 'analyze' && (
                        <div className="space-y-3">
                            {modeState.analyze.center && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                            <span>Radius</span>
                                            <span className="text-blue-600">{modeState.analyze.radius} km</span>
                                        </label>
                                        <input
                                            type="range" min="0.5" max="5" step="0.5"
                                            value={modeState.analyze.radius}
                                            onChange={(e) => setModeState(m => ({ ...m, analyze: { ...m.analyze, radius: Number(e.target.value) } }))}
                                            className="w-full mt-1.5 accent-blue-600"
                                        />
                                    </div>
                                    {modeState.analyze.stats && (
                                        <div className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
                                            <p className="flex justify-between items-center text-xs">Total Schools: <span className="font-bold text-base text-slate-800">{modeState.analyze.stats.total}</span></p>
                                            <p className="flex justify-between items-center text-xs">
                                                Density:
                                                <span className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{modeState.analyze.stats.density.toFixed(1)} / km²</span>
                                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white shadow-sm ${modeState.analyze.stats.densityLabel === 'High' ? 'bg-red-500' : modeState.analyze.stats.densityLabel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{modeState.analyze.stats.densityLabel}</span>
                                                </span>
                                            </p>
                                            <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] flex justify-between font-medium text-slate-500">
                                                <span>Public: <b className="text-slate-700">{modeState.analyze.stats.public}</b></span>
                                                <span>Private: <b className="text-slate-700">{modeState.analyze.stats.private}</b></span>
                                                <span>Community: <b className="text-slate-700">{modeState.analyze.stats.community}</b></span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeMode === 'bestLocation' && (
                        <div className="text-xs text-slate-600">
                            {modeState.bestLocation.nearestSchools.length > 0 && (
                                <div className="bg-white border border-purple-200 p-2.5 rounded-lg shadow-sm">
                                    <div className="bg-purple-50 text-purple-800 font-bold px-2 py-1.5 rounded-md mb-2.5 w-full flex justify-between items-center border border-purple-100">
                                        <span>Accessibility Score</span>
                                        <span>{modeState.bestLocation.score.toFixed(1)}/10 - {modeState.bestLocation.scoreLabel}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nearest 3 Schools</p>
                                    <ul className="space-y-1.5">
                                        {modeState.bestLocation.nearestSchools.map(s => (
                                            <li key={s.id} className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 p-1.5 rounded group hover:border-purple-200 transition-colors cursor-pointer" title="Locate on map">
                                                <div className="flex flex-col">
                                                    <span className="truncate w-40 font-bold text-slate-700 group-hover:text-purple-700 transition-colors">{s.name}</span>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-wider">{s.type || s.schoolType || 'School'}</span>
                                                </div>
                                                <span className="font-bold text-slate-500 bg-white px-1.5 rounded border border-slate-200">{s.dist > 1 ? s.dist.toFixed(1) + 'km' : (s.dist * 1000).toFixed(0) + 'm'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeMode === 'compare' && (
                        <div className="text-xs text-slate-600">
                            <div className="flex gap-2 items-center bg-blue-50 text-blue-700 py-2 px-3 border border-blue-100 rounded-lg font-semibold shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                                Selection active on map
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
function FilterChip({ active, onClick, label, count, percentage }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 py-1.5 px-3 text-sm font-medium rounded-full border transition-all ${active
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            title={`${count} schools (${percentage ? percentage.toFixed(1) : 0}%)`}
        >
            <span>{label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                {count}
            </span>
        </button>
    );
}
