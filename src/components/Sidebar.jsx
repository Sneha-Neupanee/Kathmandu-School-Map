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
    onCloseDetails
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
                    <Link to="/dashboard" className="text-xs font-bold bg-slate-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm ml-auto" title="Go to Analytics">
                        Analytics
                    </Link>
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
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <FilterChip active={!selectedSchool && filterType === 'all'} onClick={() => setFilterType('all')} label="All" count={stats.total} percentage={100} />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <FilterChip active={(selectedSchool ? !!selectedSchool.name : filterType === 'named')} onClick={() => setFilterType('named')} label="Named" count={stats.named} percentage={stats.total ? (stats.named / stats.total * 100) : 0} />
                                <FilterChip active={(selectedSchool ? !selectedSchool.name : filterType === 'unnamed')} onClick={() => setFilterType('unnamed')} label="Unnamed" count={stats.unnamed} percentage={stats.total ? (stats.unnamed / stats.total * 100) : 0} />
                            </div>
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
