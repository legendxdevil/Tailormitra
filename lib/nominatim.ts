// Nominatim helper functions.
// Policy: https://nominatim.org/release-docs/latest/api/Overview/#acceptable-use-policy
// We add a descriptive User-Agent (optionally with contact email) and use JSON format.

import { ENV } from '@/constants/env';

export type GeocodeResult = {
  lat: number;
  lon: number;
  display_name: string;
};

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

function headers() {
  const email = ENV.MAPBOX_TOKEN ? undefined : undefined; // placeholder: leave email out unless we add ENV.NOMINATIM_EMAIL
  const ua = `TailorMitra/1.0 (expo)${email ? ` ${email}` : ''}`;
  return {
    Accept: 'application/json',
    'User-Agent': ua,
  } as Record<string, string>;
}

export async function geocodePincode(pincode: string): Promise<GeocodeResult | null> {
  const pin = (pincode || '').trim();
  if (!/^[1-9][0-9]{5}$/.test(pin)) return null;

  const params = new URLSearchParams({
    format: 'json',
    countrycodes: 'in',
    postalcode: pin,
    limit: '1',
    addressdetails: '1',
  });

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return null;
  const data = await res.json();
  const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (!item) return null;
  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
  };
}

export async function searchPlace(query: string, opts?: { countrycodes?: string; limit?: number }) {
  const q = (query || '').trim();
  if (!q) return [] as GeocodeResult[];
  const params = new URLSearchParams({
    format: 'json',
    q,
    limit: String(opts?.limit ?? 5),
    addressdetails: '1',
  });
  if (opts?.countrycodes) params.set('countrycodes', opts.countrycodes);
  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return [] as GeocodeResult[];
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((item: any) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
  })) as GeocodeResult[];
}

export async function reverseGeocode(lat: number, lon: number) {
  const params = new URLSearchParams({
    format: 'json',
    lat: String(lat),
    lon: String(lon),
    addressdetails: '1',
    zoom: '18',
  });
  const url = `${NOMINATIM_BASE}/reverse?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    lat,
    lon,
    display_name: data?.display_name as string,
  } as GeocodeResult;
}
