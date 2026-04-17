import React from 'react';
import { Building2, CheckCircle2, FileQuestion, Users, BookOpen } from 'lucide-react';

export default function Stats({ stats, filteredCount }) {
    return (
        <div className="space-y-4">
            <label className="block text-base font-bold text-black mb-2 uppercase tracking-wider">
                Overview Statistics
            </label>
            <div className="grid grid-cols-2 gap-3">
                {/* Total Schools */}
                <StatCard
                    title="Total Schools"
                    value={stats.total.toLocaleString()}
                    icon={<Building2 className="w-5 h-5 text-blue-500" />}
                    className="col-span-2 bg-white border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                />

                <hr className="col-span-2 border-t border-slate-200/60 my-2" />

                {/* Named Schools */}
                <StatCard
                    title="Named"
                    value={`${stats.named.toLocaleString()} (${stats.total > 0 ? ((stats.named / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    className="bg-white border-emerald-100/60 shadow-[0_3px_10px_rgb(16,185,129,0.05)]"
                />

                {/* Unnamed Schools */}
                <StatCard
                    title="Unnamed"
                    value={`${stats.unnamed.toLocaleString()} (${stats.total > 0 ? ((stats.unnamed / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<FileQuestion className="w-4 h-4 text-amber-500" />}
                    className="bg-white border-amber-100/60 shadow-[0_3px_10px_rgb(245,158,11,0.05)]"
                />

                <hr className="col-span-2 border-t border-slate-200/60 my-2" />

                {/* Public Schools */}
                <StatCard
                    title="Public"
                    value={`${(stats.public || 0).toLocaleString()} (${stats.total > 0 ? (((stats.public || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<Building2 className="w-4 h-4 text-indigo-500" />}
                    className="bg-white border-indigo-100/60 shadow-[0_3px_10px_rgb(99,102,241,0.05)]"
                />

                {/* Private Schools */}
                <StatCard
                    title="Private"
                    value={`${(stats.private || 0).toLocaleString()} (${stats.total > 0 ? (((stats.private || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    className="bg-white border-emerald-100/60 shadow-[0_3px_10px_rgb(16,185,129,0.05)]"
                />

                {/* Community Schools */}
                <StatCard
                    title="Community"
                    value={`${(stats.community || 0).toLocaleString()} (${stats.total > 0 ? (((stats.community || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<Users className="w-4 h-4 text-orange-500" />}
                    className="bg-white border-orange-100/60 shadow-[0_3px_10px_rgb(249,115,22,0.05)]"
                />

                {/* Unknown Schools */}
                <StatCard
                    title="Unknown"
                    value={`${(stats.unknown || 0).toLocaleString()} (${stats.total > 0 ? (((stats.unknown || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<FileQuestion className="w-4 h-4 text-slate-400" />}
                    className="bg-white border-slate-100 shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
                />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center bg-white p-4 rounded-xl border shadow-[0_4px_16px_rgb(0,0,0,0.03)]">
                <span className="text-sm font-medium text-black">Currently Showing</span>
                <span className="text-base font-bold text-blue-600">{filteredCount.toLocaleString()}</span>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, className }) {
    return (
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${className}`}>
            <div className="flex items-center space-x-2 mb-2">
                {icon}
                <h3 className="text-xs font-semibold text-black">{title}</h3>
            </div>
            <p className="text-xl font-bold text-black">{value}</p>
        </div>
    );
}
