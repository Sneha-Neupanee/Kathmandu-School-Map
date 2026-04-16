import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ searchTerm, onSearch }) {
    const [localValue, setLocalValue] = useState(searchTerm);

    // Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(localValue);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [localValue, onSearch]);

    // Sync external changes (e.g. resets)
    useEffect(() => {
        setLocalValue(searchTerm);
    }, [searchTerm]);

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Search schools by name..."
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
            />
            {localValue && (
                <button
                    onClick={() => setLocalValue('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
