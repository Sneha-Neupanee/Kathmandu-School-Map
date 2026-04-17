import React from 'react';
import { Building2, CheckCircle2, FileQuestion } from 'lucide-react';

export default function Stats({ stats, filteredCount }) {
    return (
        <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Overview Statistics
            </label>
            <div className="grid grid-cols-2 gap-3">
                {/* Total Schools */}
                <StatCard
                    title="Total Schools"
                    value={stats.total.toLocaleString()}
                    icon={<Building2 className="w-5 h-5 text-blue-500" />}
                    className="col-span-2 bg-blue-50 border-blue-100"
                />

                {/* Named Schools */}
                <StatCard
                    title="Named"
                    value={`${stats.named.toLocaleString()} (${stats.total > 0 ? ((stats.named / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    className="bg-emerald-50 border-emerald-100"
                />

                {/* Unnamed Schools */}
                <StatCard
                    title="Unnamed"
                    value={`${stats.unnamed.toLocaleString()} (${stats.total > 0 ? ((stats.unnamed / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<FileQuestion className="w-4 h-4 text-amber-500" />}
                    className="bg-amber-50 border-amber-100"
                />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                <span className="text-sm font-medium text-slate-600">Currently Showing</span>
                <span className="text-base font-bold text-blue-600">{filteredCount.toLocaleString()}</span>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, className }) {
    return (
        <div className={`p-3 rounded-xl border flex flex-col justify-between ${className}`}>
            <div className="flex items-center space-x-2 mb-2">
                {icon}
                <h3 className="text-xs font-semibold text-slate-600">{title}</h3>
            </div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
    );
}
