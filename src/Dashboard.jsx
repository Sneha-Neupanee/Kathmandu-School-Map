import React from 'react';
import { useSchoolsData } from './hooks/useSchoolsData';
import Charts from './components/Charts';
import Stats from './components/Stats';
import { Link } from 'react-router-dom';
import { MapIcon, LayoutDashboard, School } from 'lucide-react';

export default function Dashboard() {
    const { stats, isLoading } = useSchoolsData();

    if (isLoading) return <div className="p-10 text-center font-semibold text-black animate-pulse">Loading Analytics Data...</div>;

    const densityInsightText = stats.total > 0 && stats.private > stats.public
        ? `Private schools dominate with ${((stats.private / stats.total) * 100).toFixed(1)}% of all mapped schools.`
        : `Public and Community mapping represent a significant portion of education infrastructure.`;

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-black p-8 font-sans">
            <header className="flex justify-between items-center mb-8 border-b border-slate-200/60 pb-4 max-w-6xl mx-auto flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-[0_8px_16px_rgb(37,99,235,0.25)]">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-black">Kathmandu Education Insights</h1>
                        <p className="text-sm text-black font-medium">Macro-level dashboard & analytics overview</p>
                    </div>
                </div>
                <Link to="/" className="flex items-center gap-2 bg-white border border-slate-200/60 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
                    <MapIcon className="w-4 h-4 text-slate-500" /> Return to Map Space
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 max-w-6xl mx-auto">
                <div className="md:col-span-1 space-y-6">
                    <Stats stats={stats} filteredCount={stats.total} />
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="font-bold border-b border-slate-100 pb-3 mb-5 text-black flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-slate-400" /> Key Insights</h3>
                        <ul className="space-y-4 text-sm text-black">
                            <li className="flex gap-3 items-start"><School className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" /> <span><strong className="text-black block mb-0.5">Ownership Distribution</strong>{densityInsightText}</span></li>
                            <li className="flex gap-3 items-start"><School className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" /> <span><strong className="text-black block mb-0.5">Density Disparity</strong>Sparse zones are visibly identified in suburban fringes when viewing the Heatmap layer.</span></li>
                            <li className="flex gap-3 items-start"><School className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" /> <span><strong className="text-black block mb-0.5">Naming Accuracy</strong>{stats.named} schools formally named and documented securely within OpenStreetMap data layer.</span></li>
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
