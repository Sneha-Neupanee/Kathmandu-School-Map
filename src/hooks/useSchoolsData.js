import { useState, useEffect, useMemo } from 'react';
import { fetchSchools } from '../utils/overpassQuery';
import { formatSchoolData } from '../utils/formatData';

const CACHE_KEY = 'schoolsData_v2'; // bump version to bust stale cache

export function useSchoolsData() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const cached = localStorage.getItem(CACHE_KEY);

            if (cached) {
                const parsed = JSON.parse(cached);
                // Re-run format to ensure all fields are present (handles stale cache)
                const safeData = Array.isArray(parsed) ? parsed.map(s => ({
                    ...s,
                    schoolType: s.schoolType || 'unknown',
                    isNamed: s.isNamed !== undefined ? s.isNamed : !!s.name,
                    name: s.name || 'Unnamed School',
                })) : [];
                setData(safeData);
                setIsLoading(false);
                return;
            }

            const rawData = await fetchSchools();
            if (!rawData) {
                setIsLoading(false);
                return;
            }
            const formattedData = formatSchoolData(rawData);

            localStorage.setItem(CACHE_KEY, JSON.stringify(formattedData));
            setData(formattedData);
        } catch (err) {
            setError(err.message || 'An unknown error occurred while fetching data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter(school => {
            if (!school) return false;
            if (filterType === 'named' && !school.isNamed) return false;
            if (filterType === 'unnamed' && school.isNamed) return false;
            if (filterType === 'private' && school.schoolType !== 'private') return false;
            if (filterType === 'public' && school.schoolType !== 'public') return false;
            if (filterType === 'community' && school.schoolType !== 'community') return false;
            if (filterType === 'unknown' && school.schoolType !== 'unknown') return false;

            if (searchTerm) {
                const name = school.name || '';
                if (!name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            }

            return true;
        });
    }, [data, searchTerm, filterType]);

    const stats = useMemo(() => {
        const safeData = Array.isArray(data) ? data.filter(Boolean) : [];
        const total = safeData.length;
        const named = safeData.filter(s => s.isNamed === true).length;
        const unnamed = total - named;
        const privateCount = safeData.filter(s => s.schoolType === 'private').length;
        const publicCount = safeData.filter(s => s.schoolType === 'public').length;
        const communityCount = safeData.filter(s => s.schoolType === 'community').length;
        const unknownCount = safeData.filter(s => s.schoolType === 'unknown').length;

        return {
            total,
            named,
            unnamed,
            private: privateCount,
            public: publicCount,
            community: communityCount,
            unknown: unknownCount,
        };
    }, [data]);

    return {
        data,
        filteredData,
        stats,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        retry: loadData,
    };
}
