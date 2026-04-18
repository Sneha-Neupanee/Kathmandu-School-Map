import React from 'react';
import { useSchoolsData } from './hooks/useSchoolsData';
import Charts from './components/Charts';
import Stats from './components/Stats';
import { Link } from 'react-router-dom';
import { MapIcon, LayoutDashboard, School } from 'lucide-react';

export default function Dashboard() {
    const { stats, isLoading } = useSchoolsData();

    if (isLoading) return <div className="p-10 text-center font-semibold text-slate-500 animate-pulse">Loading Analytics Data...</div>;

    const densityInsightText = stats.total > 0 && stats.private > stats.public
        ? `Private schools dominate with ${((stats.private / stats.total) * 100).toFixed(1)}% of all mapped schools.`
        : `Public and Community mapping represent a significant portion of education infrastructure.`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800 p-8 font-sans">
            <header className="flex justify-between items-center mb-8 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur-xl border border-white shadow-[0_12px_40px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.03)] p-5 rounded-2xl max-w-6xl mx-auto flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-[0_8px_24px_rgba(37,99,235,0.2)] border border-blue-50">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Kathmandu Education Insights</h1>
                        <p className="text-sm text-slate-500 font-medium tracking-wide mt-0.5">Macro-level dashboard & analytics overview</p>
                    </div>
                </div>
                <Link to="/" className="flex items-center gap-2 bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 px-5 py-3 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:shadow-[0_8px_24px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,1)] hover:border-blue-300/60 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_14px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(15,23,42,0.04)]">
                    <MapIcon className="w-4 h-4 text-slate-500 transition-colors" /> Return to Map Space
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 max-w-6xl mx-auto">
                <div className="md:col-span-1 space-y-6">
                    <Stats stats={stats} filteredCount={stats.total} />
                    <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-white shadow-[0_12px_40px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.03)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-400 opacity-90"></div>
                        <h3 className="font-extrabold border-b border-slate-200/60 pb-3 mb-5 text-slate-800 flex items-center gap-2 tracking-wide"><LayoutDashboard className="w-4 h-4 text-indigo-500" /> Key Insights</h3>
                        <ul className="space-y-4 text-sm text-slate-500 leading-relaxed">
                            <li className="flex gap-3 items-start group/item"><School className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0 group-hover/item:text-blue-500 transition-colors" /> <span><strong className="text-slate-700 font-semibold block mb-0.5">Ownership Distribution</strong>{densityInsightText}</span></li>
                            <li className="flex gap-3 items-start group/item"><School className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0 group-hover/item:text-amber-500 transition-colors" /> <span><strong className="text-slate-700 font-semibold block mb-0.5">Density Disparity</strong>Sparse zones are visibly identified in suburban fringes when viewing the Heatmap layer.</span></li>
                            <li className="flex gap-3 items-start group/item"><School className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover/item:text-emerald-500 transition-colors" /> <span><strong className="text-slate-700 font-semibold block mb-0.5">Naming Accuracy</strong>{stats.named} schools formally named and documented securely within OpenStreetMap data layer.</span></li>
                        </ul>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <Charts stats={stats} />
                </div>
            </div>
        </div>
    );
}
