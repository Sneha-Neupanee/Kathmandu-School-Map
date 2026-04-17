import React from 'react';
import { X, MapPin, Phone, Globe, User, Info } from 'lucide-react';

export default function SchoolDetails({ school, onClose }) {
    if (!school) return null;

    return (
        <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full relative pointer-events-auto">
            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                title="Close Details"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 pr-8">{school.name}</h2>
                {school.type && (
                    <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                        {school.type}
                    </span>
                )}
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {school.address && (
                    <div className="flex gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-slate-600">{school.address}</span>
                    </div>
                )}

                {school.phone && (
                    <div className="flex gap-3 text-sm">
                        <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-slate-600">{school.phone}</span>
                    </div>
                )}

                {school.website && (
                    <div className="flex gap-3 text-sm items-center">
                        <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                        <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                            {school.website}
                        </a>
                    </div>
                )}

                {school.operator && (
                    <div className="flex gap-3 text-sm">
                        <User className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-slate-600"><span className="font-semibold">Operator:</span> {school.operator}</span>
                    </div>
                )}


            </div>
        </div>
    );
}
