import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ searchTerm, onSearch, exactMatchAction }) {
    const [localValue, setLocalValue] = useState(searchTerm || '');

    // Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== searchTerm) {
                onSearch(localValue);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [localValue, onSearch, searchTerm]);

    // Sync external changes (e.g. resets) — defer to avoid cascading render lint
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setLocalValue(searchTerm || '');
        });
        return () => cancelAnimationFrame(id);
    }, [searchTerm]);

    const handleSearchClick = () => {
        onSearch(localValue);
        if (exactMatchAction) exactMatchAction(localValue);
    };

    return (
        <div data-tour="search-name" className="relative flex items-center border border-slate-300 rounded-lg bg-slate-100 transition-all shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <input
                type="text"
                className="block w-full pl-3 pr-20 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                placeholder="Search schools by name..."
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
            />
            {localValue && (
                <button
                    onClick={() => {
                        setLocalValue('');
                        onSearch('');
                    }}
                    className="absolute inset-y-0 right-11 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                    title="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            <button
                onClick={handleSearchClick}
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-slate-100 text-blue-600 rounded-r-lg border-l border-slate-400 hover:bg-blue-50 transition-colors"
                title="Search"
            >
                <Search className="h-4 w-4" />
            </button>
        </div>
    );
}
