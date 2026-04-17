import { useState, useEffect, useMemo } from 'react';
import { fetchSchools } from '../utils/overpassQuery';
import { formatSchoolData } from '../utils/formatData';

export function useSchoolsData() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'named', 'unnamed'

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const cached = localStorage.getItem("schoolsData");

            if (cached) {
                setData(JSON.parse(cached));
                setIsLoading(false);
                return;
            }

            const rawData = await fetchSchools();
            if (!rawData) {
                setIsLoading(false);
                return;
            }
            const formattedData = formatSchoolData(rawData);

            localStorage.setItem("schoolsData", JSON.stringify(formattedData));
            setData(formattedData);
        } catch (err) {
            setError(err.message || "An unknown error occurred while fetching data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(school => {
            // Filter by type
            if (filterType === 'named' && !school.isNamed) return false;
            if (filterType === 'unnamed' && school.isNamed) return false;
            if (filterType === 'private' && school.schoolType !== 'private') return false;
            if (filterType === 'public' && school.schoolType !== 'public') return false;
            if (filterType === 'community' && school.schoolType !== 'community') return false;
            if (filterType === 'unknown' && school.schoolType !== 'unknown') return false;

            // Search filter
            if (searchTerm) {
                if (!school.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });
    }, [data, searchTerm, filterType]);

    const stats = useMemo(() => {
        const total = data.length;
        const named = data.filter(s => s.isNamed).length;
        const unnamed = total - named;
        const privateCount = data.filter(s => s.schoolType === 'private').length;
        const publicCount = data.filter(s => s.schoolType === 'public').length;
        const communityCount = data.filter(s => s.schoolType === 'community').length;
        const unknownCount = data.filter(s => s.schoolType === 'unknown').length;

        return {
            total,
            named,
            unnamed,
            private: privateCount,
            public: publicCount,
            community: communityCount,
            unknown: unknownCount
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
