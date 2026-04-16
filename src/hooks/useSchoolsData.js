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
            const rawData = await fetchSchools();
            const formattedData = formatSchoolData(rawData);
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
            // Name filter
            if (filterType === 'named' && !school.isNamed) return false;
            if (filterType === 'unnamed' && school.isNamed) return false;

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

        return { total, named, unnamed };
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
