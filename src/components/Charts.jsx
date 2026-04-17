import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Lightbulb, PieChart as PieChartIcon } from 'lucide-react';

const QUALITY_COLORS = ['#10b981', '#f59e0b']; // Emerald for named, Amber for unnamed
const OWNERSHIP_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#94a3b8']; // Blue for Public, Purple for Private, Red for Community, Gray for Unknown

export default function Charts({ stats }) {
    const qualityData = [
        { name: 'Named Schools', value: stats.named },
        { name: 'Unnamed Schools', value: stats.unnamed }
    ];

    const ownershipData = [
        { name: 'Public', value: stats.public || 0 },
        { name: 'Private', value: stats.private || 0 },
        { name: 'Community', value: stats.community || 0 },
        { name: 'Unknown', value: stats.unknown || 0 }
    ].filter(d => d.value > 0);

    const namedPercentage = stats.total > 0 ? ((stats.named / stats.total) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-4">
            {/* Chart 1: Quality */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-slate-500" />
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Data Quality
                    </label>
                </div>

                <div className="pt-2 pb-2 w-full" style={{ minWidth: "100%", height: 160 }}>
                    {stats.total > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={qualityData}
                                    cx="50%" cy="50%"
                                    innerRadius={40} outerRadius={60}
                                    paddingAngle={5} dataKey="value" stroke="none"
                                >
                                    {qualityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={QUALITY_COLORS[index % QUALITY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--bg-card, #ffffff)' }} itemStyle={{ color: 'var(--text-main, #334155)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>
                    )}
                </div>
            </div>

            {/* Chart 2: Ownership */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-slate-500" />
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Ownership Types
                    </label>
                </div>

                <div className="pt-2 pb-2 w-full" style={{ minWidth: "100%", height: 160 }}>
                    {ownershipData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ownershipData}
                                    cx="50%" cy="50%"
                                    innerRadius={40} outerRadius={60}
                                    paddingAngle={5} dataKey="value" stroke="none"
                                >
                                    {ownershipData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={OWNERSHIP_COLORS[index % OWNERSHIP_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--bg-card, #ffffff)' }} itemStyle={{ color: 'var(--text-main, #334155)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50/50 p-4 border border-slate-100 rounded-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
                    <Lightbulb className="w-24 h-24 text-blue-500" />
                </div>
                <div className="relative z-10 flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 tracking-tight block mb-1">Dynamic Insight</span>
                        {stats.unnamed > stats.named ? (
                            <p>A majority of schools lack names. Mapping efforts highly required.</p>
                        ) : (
                            <p>Data quality is strong. <strong>{namedPercentage}%</strong> of queried schools possess valid names.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
