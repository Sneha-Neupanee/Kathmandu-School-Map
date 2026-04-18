import * as turf from '@turf/turf';

const DEFAULT_RADIUS_KM = 0.5;

/**
 * Pure area analysis: schools within radius, type counts, density, nearest school.
 * @param {{ lng: number, lat: number }} center
 * @param {number} radiusKm
 * @param {Array<object>} schools
 */
export function analyzeArea(center, radiusKm, schools) {
    if (!center || typeof center.lng !== 'number' || typeof center.lat !== 'number') {
        return {
            schoolsInRadius: [],
            stats: null,
            nearestSchool: null,
        };
    }

    const r = radiusKm ?? DEFAULT_RADIUS_KM;
    const list = Array.isArray(schools) ? schools : [];
    const centerPt = turf.point([center.lng, center.lat]);

    const withDist = list.map((s) => {
        const distanceKm = turf.distance(centerPt, turf.point([s.lon, s.lat]), { units: 'kilometers' });
        return { ...s, distanceKm };
    });

    const schoolsInRadius = withDist
        .filter((s) => s.distanceKm <= r)
        .sort((a, b) => a.distanceKm - b.distanceKm);

    let privateSchools = 0;
    let publicSchools = 0;
    let community = 0;
    let unknown = 0;

    for (const s of schoolsInRadius) {
        if (s.schoolType === 'private') privateSchools++;
        else if (s.schoolType === 'public') publicSchools++;
        else if (s.schoolType === 'community') community++;
        else unknown++;
    }

    const total = schoolsInRadius.length;
    const area = Math.PI * Math.pow(r, 2);
    const density = area > 0 ? total / area : 0;
    let densityLabel = 'Low';
    if (density > 10) densityLabel = 'High';
    else if (density > 3) densityLabel = 'Medium';

    const stats = {
        total,
        private: privateSchools,
        public: publicSchools,
        community,
        unknown,
        density,
        densityLabel,
    };

    const nearestSchool =
        schoolsInRadius.length > 0
            ? { school: schoolsInRadius[0], distanceKm: schoolsInRadius[0].distanceKm }
            : null;

    return { schoolsInRadius, stats, nearestSchool };
}

export { DEFAULT_RADIUS_KM };

/** Strip distance field added by analyzeArea for map / heatmap payloads */
export function stripDistanceKm(row) {
    const copy = { ...row };
    delete copy.distanceKm;
    return copy;
}
