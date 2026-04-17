import React, { useState } from 'react';
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
        <div className="flex flex-col h-full bg-white z-20 relative shadow-[10px_0_30px_rgb(0,0,0,0.03)]">
            <div className="p-5 border-b border-slate-200/60 flex-shrink-0 bg-white">
                <div className="flex items-center space-x-3 mb-1">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_4px_16px_rgb(37,99,235,0.2)] flex-shrink-0">
                        <School className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-black tracking-tight">KTM Schools</h1>
                        <p className="text-xs text-black font-medium">Intelligence Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={resetView} className="text-[10px] font-bold bg-white text-black border border-slate-200/80 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm" title="Reset all selections and modes">
                            Reset
                        </button>
                        <Link to="/dashboard" className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm" title="View Analytics">
                            View Analytics
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#f8fafc]">

                {/* Search & Filters */}
                <div className="p-5 space-y-4 bg-white border-b border-slate-200/60 relative">
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
                        <div className="absolute top-[88px] left-5 right-5 border border-slate-200 bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] max-h-60 overflow-y-auto z-50">
                            <div className="p-3 bg-[#f8fafc] border-b border-slate-100 text-xs font-semibold text-slate-500">
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
                                            <MapPin className="w-4 h-4 text-black mt-0.5 group-hover:text-blue-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-black">{s.name}</p>
                                                {s.type && <p className="text-xs text-black capitalize">{s.type}</p>}
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

                    <div>
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                            Filter Schools
                        </label>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <FilterChip active={!selectedSchool && filterType === 'all'} onClick={() => setFilterType('all')} label="All" count={stats.total} percentage={100} />
                            </div>

                            <hr className="border-slate-200/60" />

                            <div className="flex gap-2 flex-wrap">
                                <FilterChip active={(selectedSchool ? !!selectedSchool.name : filterType === 'named')} onClick={() => setFilterType('named')} label="Named" count={stats.named} percentage={stats.total ? (stats.named / stats.total * 100) : 0} />
                                <FilterChip active={(selectedSchool ? !selectedSchool.name : filterType === 'unnamed')} onClick={() => setFilterType('unnamed')} label="Unnamed" count={stats.unnamed} percentage={stats.total ? (stats.unnamed / stats.total * 100) : 0} />
                            </div>

                            <hr className="border-slate-200/60" />

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
            className={`flex items-center space-x-2 py-1.5 px-3 text-sm font-medium rounded-full border transition-all ${active
                ? 'bg-blue-50 text-blue-700 border-blue-200/60 shadow-[0_2px_8px_rgb(37,99,235,0.08)]'
                : 'bg-white text-black border-slate-200/80 hover:bg-slate-50 shadow-[0_2px_4px_rgb(0,0,0,0.02)]'
                }`}
            title={`${count} schools (${percentage ? percentage.toFixed(1) : 0}%)`}
        >
            <span>{label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-[#e2e8f0] text-black'}`}>
                {count}
            </span>
        </button>
    );
}
