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

            return {
                id: element.id,
                name,
                isNamed,
                lat,
                lon,
                type: element.type,
                tags
            };
        })
        .filter(item => item !== null); // Remove elements without valid coordinates
}
