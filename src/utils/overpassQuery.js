export const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';

export const KATHMANDU_SCHOOLS_QUERY = `
[out:json];
(
  node["amenity"="school"](27.65,85.28,27.75,85.36);
  way["amenity"="school"](27.65,85.28,27.75,85.36);
);
out center;
`;

export async function fetchSchools(retries = 2, timeoutMs = 15000) {
    for (let i = 0; i <= retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(OVERPASS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `data=${encodeURIComponent(KATHMANDU_SCHOOLS_QUERY)}`,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Overpass API responded with status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                console.warn('Request aborted (timeout or re-render). Ignoring safely.');
                return null;
            }

            console.warn(`Fetch attempt ${i + 1} failed:`, error.message);

            if (i === retries) {
                console.error("Failed to fetch from Overpass API after all retries:", error);
                throw new Error('Server is busy (Overpass API). Please retry.');
            }

            // wait 2 seconds before retrying
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}
