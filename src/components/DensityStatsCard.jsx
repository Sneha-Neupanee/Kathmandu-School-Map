import React, { useEffect, useState } from 'react';
import supercluster from 'supercluster';
import { Layers } from 'lucide-react';

export default function DensityStatsCard({ data }) {
    const [stats, setStats] = useState({
        high: { total: 0, avg: 0, pct: 0 },
        medium: { total: 0, avg: 0, pct: 0 },
        low: { total: 0, avg: 0, pct: 0 },
    });

    useEffect(() => {
        if (!data || data.length === 0) return;

        const sc = new supercluster({ radius: 60, maxZoom: 15 });
        const points = data.map(s => ({
            type: "Feature",
            properties: { cluster: false, ...s },
            geometry: { type: "Point", coordinates: [s.lon, s.lat] }
        }));

        sc.load(points);
        // Zoom 12 matches map default view to get city-wide density clusters
        const clusters = sc.getClusters([-180, -90, 180, 90], 12);

        let highCount = 0, highSchools = 0;
        let medCount = 0, medSchools = 0;
        let lowCount = 0, lowSchools = 0;

        clusters.forEach(c => {
            const isCluster = c.properties.cluster;
            const pts = isCluster ? c.properties.point_count : 1;

            if (pts > 30) {
                highCount++;
                highSchools += pts;
            } else if (pts > 10) {
                medCount++;
                medSchools += pts;
            } else {
                lowCount++;
                lowSchools += pts;
            }
        });

        const total = data.length;
        setStats({
            high: {
                total: highSchools,
                avg: highCount > 0 ? (highSchools / highCount).toFixed(1) : 0,
                pct: ((highSchools / total) * 100).toFixed(1)
            },
            medium: {
                total: medSchools,
                avg: medCount > 0 ? (medSchools / medCount).toFixed(1) : 0,
                pct: ((medSchools / total) * 100).toFixed(1)
            },
            low: {
                total: lowSchools,
                avg: lowCount > 0 ? (lowSchools / lowCount).toFixed(1) : 0,
                pct: ((lowSchools / total) * 100).toFixed(1)
            }
        });

    }, [data]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_10px_32px_rgba(15,23,42,0.08)] mt-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 border-b border-slate-200/60 pb-3 mb-4">
                <Layers className="h-5 w-5 text-indigo-500" />
                Density Statistics Overview
            </h3>

            <div className="space-y-4">
                {/* High Density */}
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:bg-red-50/80">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                        <h4 className="font-semibold text-red-900 text-sm">High Density Areas</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-red-200/60">
                        <div>
                            <div className="text-[10px] font-semibold text-red-600/70 uppercase tracking-tight">Total Schools</div>
                            <div className="font-bold text-slate-800">{stats.high.total}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-red-600/70 uppercase tracking-tight">Avg per Region</div>
                            <div className="font-bold text-slate-800">{stats.high.avg}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-red-600/70 uppercase tracking-tight">% of Dataset</div>
                            <div className="font-bold text-slate-800">{stats.high.pct}%</div>
                        </div>
                    </div>
                </div>

                {/* Medium Density */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:bg-amber-50/80">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                        <h4 className="font-semibold text-amber-900 text-sm">Medium Density Areas</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-amber-200/60">
                        <div>
                            <div className="text-[10px] font-semibold text-amber-700/70 uppercase tracking-tight">Total Schools</div>
                            <div className="font-bold text-slate-800">{stats.medium.total}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-amber-700/70 uppercase tracking-tight">Avg per Region</div>
                            <div className="font-bold text-slate-800">{stats.medium.avg}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-amber-700/70 uppercase tracking-tight">% of Dataset</div>
                            <div className="font-bold text-slate-800">{stats.medium.pct}%</div>
                        </div>
                    </div>
                </div>

                {/* Low Density */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:bg-blue-50/80">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>
                        <h4 className="font-semibold text-blue-900 text-sm">Low Density Areas</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-blue-200/60">
                        <div>
                            <div className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-tight">Total Schools</div>
                            <div className="font-bold text-slate-800">{stats.low.total}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-tight">Avg per Region</div>
                            <div className="font-bold text-slate-800">{stats.low.avg}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-tight">% of Dataset</div>
                            <div className="font-bold text-slate-800">{stats.low.pct}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
