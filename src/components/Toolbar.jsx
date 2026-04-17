import React from 'react';
import { Ruler, Sparkles, MapPin, BarChart3, Layers, Orbit } from 'lucide-react';

const modes = [
    { id: 'default', label: 'Default', icon: Layers },
    { id: 'measure', label: 'Measure Distance', icon: Ruler },
    { id: 'analyze', label: 'Analyze Area', icon: Sparkles },
    { id: 'bestLocation', label: 'Find Best Location', icon: MapPin },
    { id: 'compare', label: 'Compare Schools', icon: BarChart3 }
];

export default function Toolbar({ activeMode, setActiveMode }) {
    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white shadow-xl rounded-full border border-slate-200 p-1.5 flex gap-1">
            {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                    <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        title={mode.label}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
