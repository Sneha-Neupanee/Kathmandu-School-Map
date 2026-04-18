import React from 'react';
import { X, Check } from 'lucide-react';
import * as turf from '@turf/turf';

export default function ComparisonPanel({ schools, referencePoint, onRemove, onClose }) {
    if (schools.length === 0) return null;

    return (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-slate-50 shadow-2xl rounded-2xl border border-slate-300 w-11/12 max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-slate-100">
                <h2 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                    School Comparison <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{schools.length}/3</span>
                </h2>
                <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-400 text-white hover:bg-red-500 transition-colors" title="Close comparison">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 bg-slate-50 overflow-x-auto">
                {!referencePoint && <p className="text-xs text-amber-700 mb-2 font-medium bg-amber-50 p-2 rounded border border-amber-300">Tip: Click anywhere on the map to set a reference point for distance calculation.</p>}

                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-y border-slate-300">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Feature / School</th>
                            {schools.map(s => (
                                <th key={s.id} className="px-4 py-3 font-semibold text-slate-800 border-l border-slate-200 relative">
                                    <div className="flex justify-between items-center">
                                        <span className="truncate w-32" title={s.name}>{s.name}</span>
                                        <button onClick={() => onRemove(s.id)} className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-100 transition-colors" title="Remove school">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-100 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">Type</td>
                            {schools.map(s => (
                                <td key={s.id} className="px-4 py-3 border-l border-slate-200 capitalize">{s.schoolType || 'Unknown'}</td>
                            ))}
                        </tr>
                        <tr className="hover:bg-slate-100 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">Operator</td>
                            {schools.map(s => (
                                <td key={s.id} className="px-4 py-3 border-l border-slate-200">
                                    {s.operator ? <span title={s.operator} className="truncate w-32 block">{s.operator}</span> : <span className="text-slate-400 italic">Not specified</span>}
                                </td>
                            ))}
                        </tr>
                        <tr className="hover:bg-slate-100 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">Distance from Click</td>
                            {schools.map(s => {
                                if (!referencePoint) return <td key={s.id} className="px-4 py-3 border-l border-slate-200 text-slate-400 italic">-</td>;
                                const dist = turf.distance(turf.point([referencePoint.lng, referencePoint.lat]), turf.point([s.lon, s.lat]), { units: 'kilometers' });
                                return (
                                    <td key={s.id} className="px-4 py-3 border-l border-slate-200 font-semibold text-blue-600">
                                        {dist > 1 ? dist.toFixed(2) + ' km' : Math.round(dist * 1000) + ' m'}
                                    </td>
                                );
                            })}
                        </tr>
                        <tr className="hover:bg-slate-100 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">Website</td>
                            {schools.map(s => (
                                <td key={s.id} className="px-4 py-3 border-l border-slate-200">
                                    {s.website ? <a href={s.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">Link <Check className="w-3 h-3" /></a> : 'No'}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

