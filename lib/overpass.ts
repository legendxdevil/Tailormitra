// Overpass API query helper to find tailors around a bounding box or center+radius.
// Uses OSM tag: shop=tailor

export type TailorPoi = {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  phone?: string;
  opening_hours?: string;
  address?: string;
};

function buildBBox(minLat: number, minLon: number, maxLat: number, maxLon: number) {
  return `${minLat},${minLon},${maxLat},${maxLon}`;
}

export async function fetchTailorsByBBox(
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number },
  abortSignal?: AbortSignal
): Promise<TailorPoi[]> {
  const fetchWithTimeout = async (url: string, body: string, signal?: AbortSignal) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'TailorMitra/1.0 (expo)'
        },
        body,
        signal: signal ?? controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  };

  const bboxStr = buildBBox(bbox.minLat, bbox.minLon, bbox.maxLat, bbox.maxLon);
  const query = `[
    out:json][timeout:25];
    (
      node["shop"="tailor"](${bboxStr});
      way["shop"="tailor"](${bboxStr});
      relation["shop"="tailor"](${bboxStr});
      node["craft"="tailor"](${bboxStr});
      way["craft"="tailor"](${bboxStr});
      relation["craft"="tailor"](${bboxStr});
      node["craft"="seamstress"](${bboxStr});
      way["craft"="seamstress"](${bboxStr});
      relation["craft"="seamstress"](${bboxStr});
      node["name"~"(?i)(tailor|darzi|alteration|sewing)"](${bboxStr});
      way["name"~"(?i)(tailor|darzi|alteration|sewing)"](${bboxStr});
      relation["name"~"(?i)(tailor|darzi|alteration|sewing)"](${bboxStr});
    );
    out center tags;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter',
  ];

  let lastErr: any;
  let data: any = null;
  for (const url of endpoints) {
    try {
      // small retry loop per endpoint
      const body = new URLSearchParams({ data: query }).toString();
      let res: Response | null = null;
      for (let i = 0; i < 2; i++) {
        try {
          res = await fetchWithTimeout(url, body, abortSignal);
          break;
        } catch (inner) {
          lastErr = inner;
          if (i === 1) throw inner;
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      if (!res) continue;
      if (!res.ok) {
        lastErr = new Error(`Overpass error ${res.status} @ ${url}`);
        continue;
      }
      data = await res.json();
      break;
    } catch (e) {
      lastErr = e;
      // try next endpoint
    }
  }
  if (!data) throw lastErr ?? new Error('Overpass unknown error');

  const tailors: TailorPoi[] = (data.elements || []).map((el: any) => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    const tags = el.tags || {};
    const address = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:state'],
      tags['addr:postcode'],
    ]
      .filter(Boolean)
      .join(', ');

    return {
      id: el.id,
      lat,
      lon,
      name: tags.name,
      phone: tags.phone || tags['contact:phone'],
      opening_hours: tags.opening_hours,
      address,
    } as TailorPoi;
  });

  return tailors.filter((t) => typeof t.lat === 'number' && typeof t.lon === 'number');
}

export function bboxFromCenter(lat: number, lon: number, km: number = 2) {
  // Rough bbox calculation based on km offsets
  const dLat = km / 110.574; // degrees per km
  const dLon = km / (111.320 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - dLat,
    maxLat: lat + dLat,
    minLon: lon - dLon,
    maxLon: lon + dLon,
  };
}
