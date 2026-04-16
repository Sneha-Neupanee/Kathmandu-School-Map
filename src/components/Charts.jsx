import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Lightbulb } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b']; // Emerald for named, Amber for unnamed

export default function Charts({ stats }) {
    const data = [
        { name: 'Named Schools', value: stats.named },
        { name: 'Unnamed Schools', value: stats.unnamed }
    ];

    const namedPercentage = stats.total > 0 ? ((stats.named / stats.total) * 100).toFixed(1) : 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Data Quality Composition
                </label>
            </div>

            <div className="pt-4 pb-2 w-full" style={{ minWidth: "100%", height: 192 }}>
                {stats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                        No data available
                    </div>
                )}
            </div>

            <div className="bg-blue-50/50 p-4 border-t border-slate-100">
                <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800 tracking-tight block mb-1">Dynamic Insight</span>
                        {stats.unnamed > stats.named ? (
                            <p>A significant majority of Kathmandu schools are missing names in the OSM DB. Community mapping efforts should focus on identifying unnamed facilities.</p>
                        ) : (
                            <p>Overall data quality is adequate. <strong>{namedPercentage}%</strong> of queried schools possess valid name metadata in OpenStreetMap.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
