import { useState, useEffect, useMemo } from 'react';
import { fetchSchools } from '../utils/overpassQuery';
import { formatSchoolData } from '../utils/formatData';

const CACHE_KEY = 'schoolsData_v4_kathmandu_valley_bbox'; // restore stable bbox dataset

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
            const rawLen = Array.isArray(rawData?.elements) ? rawData.elements.length : 0;
            const rawNodeLen = Array.isArray(rawData?.elements)
                ? rawData.elements.filter((e) => e?.type === 'node').length
                : 0;
            const rawWayLen = Array.isArray(rawData?.elements)
                ? rawData.elements.filter((e) => e?.type === 'way').length
                : 0;
            console.log('[SchoolsData] rawData length:', rawLen);
            console.log('[SchoolsData] rawData node/way:', { nodes: rawNodeLen, ways: rawWayLen });
            const formattedData = formatSchoolData(rawData);
            console.log('[SchoolsData] formattedData length:', formattedData.length);
            if (!formattedData.length && rawLen > 0) {
                console.warn('[SchoolsData] formattedData is empty even though rawData has elements.');
            }
            if (!formattedData.length) {
                // Debug-safe fallback to avoid complete UI collapse; keep the app functional while investigating.
                console.warn('[SchoolsData] Falling back to minimally mapped raw dataset.');
                const fallbackRaw = Array.isArray(rawData?.elements)
                    ? rawData.elements
                        .map((element) => {
                            const lat = element.lat || element.center?.lat;
                            const lon = element.lon || element.center?.lon;
                            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
                            const tags = element.tags || {};
                            return {
                                id: element.id,
                                name: tags.name || 'Unnamed School',
                                isNamed: Boolean(tags.name),
                                lat,
                                lon,
                                type: element.type,
                                schoolType: 'unknown',
                                phone: tags.phone || null,
                                website: tags.website || null,
                                address: tags['addr:street'] || null,
                                operator: tags.operator || null,
                                tags,
                            };
                        })
                        .filter(Boolean)
                    : [];
                if (fallbackRaw.length === 0) {
                    throw new Error('No schools could be parsed from Overpass response.');
                }
                localStorage.setItem(CACHE_KEY, JSON.stringify(fallbackRaw));
                setData(fallbackRaw);
                return;
            }

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

    const baseFilteredData = useMemo(() => {
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

    const filteredData = useMemo(() => {
        // Debug-safe fallback: if filtering unexpectedly wipes all data while no active user filter,
        // keep app functional and expose underlying Kathmandu dataset.
        if (baseFilteredData.length === 0 && data.length > 0 && !searchTerm && filterType === 'all') {
            console.warn('[SchoolsData] filteredData empty with all filters; falling back to base dataset.');
            return data;
        }
        return baseFilteredData;
    }, [baseFilteredData, data, searchTerm, filterType]);

    useEffect(() => {
        console.log('[SchoolsData] filteredData length:', filteredData.length);
    }, [filteredData.length]);

    const stats = useMemo(() => {
        // Stats must remain stable and represent the full dataset, not the current UI filter.
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
