export function formatSchoolData(rawData) {
    if (!rawData || !rawData.elements) return [];

    return rawData.elements
        .map(element => {
            // For elements of type "way", the coordinates are in the "center" object.
            // For elements of type "node", they are at the top level.
            const lat = element.lat || (element.center && element.center.lat);
            const lon = element.lon || (element.center && element.center.lon);

            if (!lat || !lon) {
                return null; // Skip elements without valid coordinates
            }

            const tags = element.tags || {};
            const name = tags.name || "Unnamed School";
            const isNamed = !!tags.name;

            // Derive schoolType
            const operator = (tags.operator || "").toLowerCase();
            const operatorType = (tags['operator:type'] || "").toLowerCase();
            const ownership = (tags.ownership || "").toLowerCase();
            const combinedTags = `${operator} ${operatorType} ${ownership}`;

            let schoolType = "unknown";
            if (combinedTags.includes('private') || combinedTags.includes('ngo')) {
                schoolType = "private";
            } else if (combinedTags.includes('public') || combinedTags.includes('government') || combinedTags.includes('gov')) {
                schoolType = "public";
            } else if (combinedTags.includes('community')) {
                schoolType = "community";
            }

            return {
                id: element.id,
                name,
                isNamed,
                lat,
                lon,
                type: element.type,
                schoolType, // Added
                phone: tags.phone || null,
                website: tags.website || null,
                address: tags['addr:street'] || null,
                operator: tags.operator || null,
                tags
            };
        })
        .filter(item => item !== null); // Remove elements without valid coordinates
}
