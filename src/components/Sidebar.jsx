import React from 'react';
import SearchBar from './SearchBar';
import Stats from './Stats';
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
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50/60 to-slate-100/60 backdrop-blur-md z-20 relative shadow-[16px_0_48px_rgba(15,23,42,0.1),inset_-1px_0_0_rgba(255,255,255,0.6)] border-r border-slate-300/30">
            <div className="p-6 border-b border-slate-200/50 flex-shrink-0 bg-gradient-to-b from-white to-transparent relative shadow-[0_4px_16px_rgba(15,23,42,0.03),inset_0_-1px_0_rgba(255,255,255,0.8)]">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 opacity-50"></div>
                <div className="flex items-center space-x-3 mb-3 mt-1">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-2.5 rounded-xl shadow-[0_6px_18px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] flex-shrink-0">
                        <School className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">KTM Schools</h1>
                        <p className="text-[11px] text-slate-500 font-medium tracking-wide">Intelligence Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <button onClick={resetView} className="flex-1 text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:text-slate-900 hover:border-slate-300 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(15,23,42,0.04)]" title="Reset all selections and modes">
                        Reset
                    </button>
                    <Link to="/dashboard" className="flex-[2] text-center text-[11px] font-semibold bg-gradient-to-br from-slate-800 to-slate-900 text-white/90 border border-slate-700/60 px-3 py-2 rounded-lg hover:shadow-[0_8px_24px_rgba(15,23,42,0.3),0_0_0_1px_rgba(148,163,184,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_14px_rgba(15,23,42,0.22),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.1)]" title="View Analytics">
                        View Analytics
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-b from-slate-50/60 to-slate-100/80">

                {/* Search & Filters */}
                <div className="p-6 space-y-5 bg-gradient-to-b from-white/60 to-slate-100/50 border-b border-slate-200/60 relative shadow-[0_4px_16px_rgba(15,23,42,0.02),inset_0_-1px_0_rgba(255,255,255,0.7)]">
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
                        <div className="absolute top-[88px] left-6 right-6 border border-slate-200/80 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.15)] max-h-60 overflow-y-auto z-50">
                            <div className="p-3 bg-slate-50/80 border-b border-slate-100/80 text-[10px] uppercase font-bold tracking-wider text-slate-500">
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
                                            className="w-full text-left p-3 hover:bg-slate-100 transition-colors flex items-start space-x-3 text-sm group"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-500 flex-shrink-0 transition-colors duration-300" />
                                            <div>
                                                <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">{s.name}</p>
                                                {s.type && <p className="text-[11px] font-medium text-slate-500 capitalize mt-0.5">{s.type}</p>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-black text-sm">
                                    No schools found matching '{searchTerm}'.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filter Section */}
                    <div>
                        {/* Header */}
                        <label className="block text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2.5">
                            Filter Schools
                        </label>

                        {/* All button — own row, left-aligned */}
                        <div className="mb-4">
                            <FilterChip
                                active={filterType === 'all'}
                                onClick={() => setFilterType('all')}
                                label="All"
                                count={stats.total}
                                percentage={100}
                            />
                        </div>

                        <div className="flex flex-col gap-4">

                            {/* Name Status group */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-semibold text-slate-600">
                                    Filter by name status
                                </span>
                                <div className="flex gap-2">
                                    <FilterChip
                                        active={filterType === 'named'}
                                        onClick={() => setFilterType('named')}
                                        label="Named"
                                        count={stats.named}
                                        percentage={stats.total ? (stats.named / stats.total * 100) : 0}
                                    />
                                    <FilterChip
                                        active={filterType === 'unnamed'}
                                        onClick={() => setFilterType('unnamed')}
                                        label="Unnamed"
                                        count={stats.unnamed}
                                        percentage={stats.total ? (stats.unnamed / stats.total * 100) : 0}
                                    />
                                </div>
                            </div>

                            {/* School Type group */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-semibold text-slate-600">
                                    Filter by school types
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                    <FilterChip
                                        active={filterType === 'private'}
                                        onClick={() => setFilterType('private')}
                                        label="Private"
                                        count={stats.private || 0}
                                        percentage={stats.total && stats.private ? (stats.private / stats.total * 100) : 0}
                                    />
                                    <FilterChip
                                        active={filterType === 'public'}
                                        onClick={() => setFilterType('public')}
                                        label="Public"
                                        count={stats.public || 0}
                                        percentage={stats.total && stats.public ? (stats.public / stats.total * 100) : 0}
                                    />
                                    <FilterChip
                                        active={filterType === 'community'}
                                        onClick={() => setFilterType('community')}
                                        label="Community"
                                        count={stats.community || 0}
                                        percentage={stats.total && stats.community ? (stats.community / stats.total * 100) : 0}
                                    />
                                    <FilterChip
                                        active={filterType === 'unknown'}
                                        onClick={() => setFilterType('unknown')}
                                        label="Unknown"
                                        count={stats.unknown || 0}
                                        percentage={stats.total && stats.unknown ? (stats.unknown / stats.total * 100) : 0}
                                    />
                                </div>
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
                    </>
                )}
            </div>

        </div>
    );
}

function FilterChip({ active, onClick, label, count, percentage }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 py-2 px-3.5 text-[11px] font-semibold rounded-lg border hover:-translate-y-0.5 transition-all duration-300 ${active
                ? 'bg-slate-900 text-white border-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.1)]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] shadow-[0_2px_8px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(15,23,42,0.03)]'
                }`}
            title={`${count} schools (${percentage ? percentage.toFixed(1) : 0}%)`}
        >
            <span>{label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
            </span>
        </button>
    );
}
