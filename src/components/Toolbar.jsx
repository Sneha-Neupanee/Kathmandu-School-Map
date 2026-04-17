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
    const activeLabel = modes.find(m => m.id === activeMode)?.label || activeMode;
    let instruction = 'Select a mode to begin';
    if (activeMode === 'analyze') instruction = 'Click anywhere to analyze location';
    if (activeMode === 'compare') instruction = 'Search and select schools to compare';
    if (activeMode === 'bestLocation') instruction = 'Click map for accessibility score';

    return (
        <div className="absolute top-4 left-[40%] transform -translate-x-1/2 z-20 flex flex-col items-center">
            {/* Mode Indicator & Instruction */}
            <div className="bg-slate-800 text-white px-5 py-2 rounded-t-2xl shadow-md text-xs font-bold flex flex-col items-center opacity-95 mb-[-10px] pb-3">
                <span className="uppercase tracking-widest text-blue-300 text-[10px] mb-0.5">Mode: {activeLabel}</span>
                <span className="opacity-90">{instruction}</span>
            </div>

            {/* Toolbar Buttons */}
            <div className="bg-white shadow-xl rounded-full border border-slate-200 p-1.5 flex gap-1 z-10 w-max">
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
        </div>
    );
}
