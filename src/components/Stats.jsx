import React from 'react';
import { Building2, CheckCircle2, FileQuestion, Users, BookOpen } from 'lucide-react';

export default function Stats({ stats, filteredCount }) {
    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider drop-shadow-sm px-1">
                Overview Statistics
            </label>
            <div className="flex flex-col gap-2.5">
                {/* Total Schools */}
                <StatCard
                    title="Total Schools"
                    value={stats.total.toLocaleString()}
                    icon={<Building2 className="w-5 h-5 text-blue-600" />}
                    className="bg-gradient-to-r from-blue-50 to-white/60 shadow-[0_8px_24px_rgba(59,130,246,0.12)]"
                    numberColor="text-blue-800"
                />

                <hr className="border-t border-slate-200/50 my-1.5" />

                {/* Named Schools */}
                <StatCard
                    title="Named"
                    value={`${stats.named.toLocaleString()} (${stats.total > 0 ? ((stats.named / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    className="bg-gradient-to-r from-emerald-50 to-white/50 shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
                    numberColor="text-emerald-800"
                />

                {/* Unnamed Schools */}
                <StatCard
                    title="Unnamed"
                    value={`${stats.unnamed.toLocaleString()} (${stats.total > 0 ? ((stats.unnamed / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<FileQuestion className="w-4 h-4 text-amber-600" />}
                    className="bg-gradient-to-r from-amber-50 to-white/50 shadow-[0_8px_24px_rgba(245,158,11,0.12)]"
                    numberColor="text-amber-800"
                />

                <hr className="border-t border-slate-200/50 my-1.5" />

                {/* Public Schools */}
                <StatCard
                    title="Public"
                    value={`${(stats.public || 0).toLocaleString()} (${stats.total > 0 ? (((stats.public || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<Building2 className="w-4 h-4 text-indigo-600" />}
                    className="bg-gradient-to-r from-indigo-50 to-white/50 shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
                    numberColor="text-indigo-800"
                />

                {/* Private Schools */}
                <StatCard
                    title="Private"
                    value={`${(stats.private || 0).toLocaleString()} (${stats.total > 0 ? (((stats.private || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    className="bg-gradient-to-r from-emerald-50 to-white/50 shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
                    numberColor="text-emerald-800"
                />

                {/* Community Schools */}
                <StatCard
                    title="Community"
                    value={`${(stats.community || 0).toLocaleString()} (${stats.total > 0 ? (((stats.community || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<Users className="w-4 h-4 text-orange-600" />}
                    className="bg-gradient-to-r from-orange-50 to-white/50 shadow-[0_8px_24px_rgba(249,115,22,0.12)]"
                    numberColor="text-orange-800"
                />

                {/* Unknown Schools */}
                <StatCard
                    title="Unknown"
                    value={`${(stats.unknown || 0).toLocaleString()} (${stats.total > 0 ? (((stats.unknown || 0) / stats.total) * 100).toFixed(1) : 0}%)`}
                    icon={<FileQuestion className="w-4 h-4 text-slate-500" />}
                    className="bg-gradient-to-r from-slate-100 to-white/50 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                    numberColor="text-slate-700"
                />
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200/60 flex justify-between items-center bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition-all duration-300 border border-white/80 group">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Showing</span>
                <span className="text-base font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/80 shadow-[0_2px_6px_rgba(15,23,42,0.07)] transition-transform duration-300 group-hover:scale-105">{filteredCount.toLocaleString()}</span>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, className, numberColor }) {
    return (
        <div className={`p-4 rounded-2xl border border-white/80 flex flex-row items-center justify-between group hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-[0_6px_20px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(15,23,42,0.04)] ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-3.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-white group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    {icon}
                </div>
                <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">{title}</h3>
            </div>
            <p className={`text-[1.15rem] font-black ${numberColor} tracking-tight relative z-10 mr-1`}>{value}</p>
        </div>
    );
}
