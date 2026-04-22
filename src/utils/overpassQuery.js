export const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';

const KATHMANDU_SCHOOLS_QUERY = `
[out:json];
(
  node["amenity"="school"](27.62,85.25,27.80,85.45);
  way["amenity"="school"](27.62,85.25,27.80,85.45);
);
out center tags;
`;

async function runOverpassQuery(query, timeoutMs, attempt) {
    console.log(`[Overpass] request start (attempt ${attempt})`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);
    try {
        const response = await fetch(OVERPASS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(query)}`,
            signal: controller.signal,
        });
        console.log(`[Overpass] response received (attempt ${attempt}) status=${response.status}`);
        if (!response.ok) {
            throw new Error(`Overpass API responded with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            const reason = controller.signal?.reason || 'unknown';
            console.warn(`[Overpass] request aborted (attempt ${attempt}) reason=${String(reason)}`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function fetchSchools(retries = 2, timeoutMs = 25000) {
    for (let i = 0; i <= retries; i++) {
        try {
            const attempt = i + 1;
            const result = await runOverpassQuery(KATHMANDU_SCHOOLS_QUERY, timeoutMs, attempt);
            const count = Array.isArray(result?.elements) ? result.elements.length : 0;
            const nodeCount = Array.isArray(result?.elements)
                ? result.elements.filter((e) => e?.type === 'node').length
                : 0;
            const wayCount = Array.isArray(result?.elements)
                ? result.elements.filter((e) => e?.type === 'way').length
                : 0;
            console.log(`[Overpass] elements=${count}, nodes=${nodeCount}, ways=${wayCount}`);
            if (count > 0) {
                return result;
            }
            console.warn('[Overpass] query returned 0 elements.');
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('[Overpass] retrying after abort...');
            } else {
                console.warn(`[Overpass] fetch attempt ${i + 1} failed:`, error.message);
            }
        }
        if (i < retries) {
            await new Promise(res => setTimeout(res, 2000));
        }
    }
    throw new Error('Failed to fetch schools from Overpass (empty or failed response after retries).');
}
