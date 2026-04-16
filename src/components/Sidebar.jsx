import React, { useState } from 'react';
import SearchBar from './SearchBar';
import Stats from './Stats';
import Charts from './Charts';
import { School, MapPin } from 'lucide-react';

export default function Sidebar({
    stats,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredCount,
    onSchoolSelect,
    schools
}) {
    return (
        <div className="flex flex-col h-full bg-white z-20 relative">
            <div className="p-5 border-b border-slate-100 flex-shrink-0 bg-white">
                <div className="flex items-center space-x-3 mb-1">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                        <School className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">KTM Schools</h1>
                        <p className="text-xs text-slate-500 font-medium">Intelligence Dashboard</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50">

                {/* Search & Filters */}
                <div className="p-5 space-y-4 bg-white border-b border-slate-200">
                    <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Filter Schools
                        </label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <FilterTab
                                active={filterType === 'all'}
                                onClick={() => setFilterType('all')}
                                label="All"
                            />
                            <FilterTab
                                active={filterType === 'named'}
                                onClick={() => setFilterType('named')}
                                label="Named"
                            />
                            <FilterTab
                                active={filterType === 'unnamed'}
                                onClick={() => setFilterType('unnamed')}
                                label="Unnamed"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-5">
                    <Stats stats={stats} filteredCount={filteredCount} />
                </div>

                {/* Charts and Insights */}
                <div className="px-5 pb-6">
                    <Charts stats={stats} />
                </div>

                {/* Search Results / Directory */}
                {searchTerm && (
                    <div className="border-t border-slate-200 bg-white mt-auto sticky bottom-0 max-h-60 overflow-y-auto">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                            Results found: {schools.length}
                        </div>
                        {schools.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {schools.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => onSchoolSelect(s)}
                                        className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start space-x-3 text-sm group"
                                    >
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-slate-700">{s.name}</p>
                                            {s.type && <p className="text-xs text-slate-500 capitalize">{s.type}</p>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                No schools found matching '{searchTerm}'.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterTab({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${active
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
        >
            {label}
        </button>
    );
}
