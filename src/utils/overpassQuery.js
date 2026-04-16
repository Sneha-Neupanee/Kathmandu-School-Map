export const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export const KATHMANDU_SCHOOLS_QUERY = `
[out:json];
(
  node["amenity"="school"](27.6,85.2,27.8,85.4);
  way["amenity"="school"](27.6,85.2,27.8,85.4);
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
            console.warn(`Fetch attempt ${i + 1} failed:`, error.message);

            if (i === retries) {
                console.error("Failed to fetch from Overpass API after all retries:", error);
                throw new Error(error.name === 'AbortError' ? 'Request timed out. Please try again.' : error.message);
            }

            // wait 2 seconds before retrying
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}
