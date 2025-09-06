import { useEffect, useRef, useState, useMemo } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { Linking } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { bboxFromCenter, fetchTailorsByBBox, TailorPoi } from '@/lib/overpass';
import { geocodePincode, searchPlace } from '@/lib/nominatim';
import { LoadingGif } from '@/components/LoadingGif';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ENV } from '@/constants/env';

// Define Region locally to avoid importing from native-only module on web
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function ExploreMapScreen() {
  const theme = useColorScheme() ?? 'light';
  const isWeb = Platform.OS === 'web';
  // Dynamically load react-native-maps only on native to avoid web bundler errors
  const Maps = useMemo(() => {
    if (isWeb) return null as any;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const maps = require('react-native-maps');
    return {
      MapView: maps.default,
      Marker: maps.Marker,
      UrlTile: maps.UrlTile,
      Callout: maps.Callout,
    } as any;
  }, [isWeb]);
  const [region, setRegion] = useState<Region | null>({
    // Default to New Delhi so map renders immediately
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });
  const [loading, setLoading] = useState(false);
  const [tailors, setTailors] = useState<TailorPoi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const [tileOk, setTileOk] = useState<boolean>(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Default to New Delhi center if not granted
          setRegion((prev) => prev || { latitude: 28.6139, longitude: 77.209, latitudeDelta: 0.1, longitudeDelta: 0.1 });
          setError('Location permission denied. Using default location.');
          return;
        }
        // Try last known for faster render
        const last = await Location.getLastKnownPositionAsync();
        if (last?.coords) {
          setRegion({
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      } catch (e: any) {
        console.warn('Location error', e);
        setError(e?.message || 'Failed to get current location');
      }
    })();
  }, []);

  const themeColor = Colors[theme].tint;
  // Prefer Mapbox raster tiles if a token is provided; fallback to OSM/Carto
  const mapboxStyle = theme === 'dark' ? 'dark-v11' : 'light-v11';
  const tileUrl = ENV.MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/${mapboxStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${ENV.MAPBOX_TOKEN}`
    : theme === 'dark'
      ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const calloutTextStyle = theme === 'dark' ? { color: '#111' } : undefined; // Map callout bubble is white; force dark text in dark mode

  // Google Maps dark style (applied when UrlTile is not used or tiles are blocked)
  const googleDarkStyle = theme === 'dark' ? [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
  ] : [];

  const onRegionChangeComplete = (r: Region) => {
    setRegion(r);
  };

  const openMapsSearch = async (q: string = 'tailor') => {
    // Use current region if available, else try to fetch current location quickly
    let lat = region?.latitude;
    let lon = region?.longitude;
    try {
      if (!lat || !lon) {
        const last = await Location.getLastKnownPositionAsync();
        if (last?.coords) {
          lat = last.coords.latitude;
          lon = last.coords.longitude;
        }
      }
    } catch {}
    const query = encodeURIComponent(q);
    const coords = lat && lon ? `${lat},${lon}` : '';

    let url = '';
    if (Platform.OS === 'android') {
      // geo:latitude,longitude?q=query
      url = coords ? `geo:${coords}?q=${query}` : `geo:0,0?q=${query}`;
    } else if (Platform.OS === 'ios') {
      // Apple Maps: maps://?q=query&ll=lat,lon
      url = `maps://?q=${query}${coords ? `&ll=${coords}` : ''}`;
    } else {
      // Web fallback to Google Maps
      url = coords
        ? `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${coords}`
        : `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    try {
      await Linking.openURL(url);
    } catch (e) {
      setError('Could not open Maps');
    }
  };

  const onMyLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== 'granted') {
          setError('Location permission not granted');
          return;
        }
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    } catch (e: any) {
      setError('Unable to get current location');
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!region) return;
      try {
        setLoading(true);
        setError(null);
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const radii = [2, 4, 8, 12];
        let results: TailorPoi[] = [];
        for (const km of radii) {
          const bbox = bboxFromCenter(region.latitude, region.longitude, km);
          try {
            results = await fetchTailorsByBBox(bbox, controller.signal);
          } catch (inner) {
            // propagate aborts
            if ((inner as any)?.name === 'AbortError') throw inner;
            // otherwise continue to next radius
          }
          if (results.length > 0) break;
        }
        setTailors(results);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.warn('Overpass fetch error', e);
          setError(e?.message || 'Failed to load tailors');
        }
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region?.latitude, region?.longitude, refreshTick]);

  // Probe tile server once per theme to decide whether to use UrlTile or fallback to default
  useEffect(() => {
    const testUrl = (theme === 'dark')
      ? 'https://basemaps.cartocdn.com/dark_all/0/0/0.png'
      : 'https://tile.openstreetmap.org/0/0/0.png';
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(testUrl, { method: 'HEAD' });
        if (!cancelled) setTileOk(res.ok);
      } catch {
        if (!cancelled) setTileOk(false);
      }
    })();
    return () => { cancelled = true; };
  }, [theme]);

  const onSearchPin = async () => {
    Keyboard.dismiss();
    if (!pin) return;
    setLoading(true);
    try {
      // Try PIN code first
      const g = await geocodePincode(pin);
      if (g) {
        const next: Region = {
          latitude: g.lat,
          longitude: g.lon,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        };
        setRegion(next);
      } else {
        // Fallback to free-text place search (Nominatim)
        const matches = await searchPlace(pin, { countrycodes: 'in', limit: 1 });
        if (matches.length > 0) {
          const m = matches[0];
          const next: Region = {
            latitude: m.lat,
            longitude: m.lon,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          };
          setRegion(next);
        } else {
          setError('Location not found');
        }
      }
    } catch (e: any) {
      setError('Unable to search location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN code"
          keyboardType="number-pad"
          style={[
            styles.input,
            theme === 'dark' && {
              backgroundColor: '#1f1f1f',
              color: '#fff',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: '#333',
            },
          ]}
          maxLength={6}
          placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
        />
        <Pressable onPress={onSearchPin} style={[styles.btn, { backgroundColor: themeColor }]}>
          <ThemedText style={styles.btnText}>Search</ThemedText>
        </Pressable>
      </View>
      <ThemedView style={styles.panel}>
        <ThemedText type="subtitle">Find tailors near you</ThemedText>
        <ThemedText>
          Open your device's Maps app for the best live results and directions.
        </ThemedText>
        <View style={styles.categoriesRow}>
          {['Tailor', 'Alteration', 'Seamstress', 'Suit Fitting'].map((c) => (
            <Pressable key={c} style={styles.categoryChip} onPress={() => openMapsSearch(c)}>
              <ThemedText>{c}</ThemedText>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => openMapsSearch('tailor')} style={[styles.primaryBtn, { backgroundColor: themeColor }]}>
          <ThemedText style={styles.primaryBtnText}>Open in Maps</ThemedText>
        </Pressable>
      </ThemedView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingGif size={64} />
        </View>
      )}
      {error && (
        <View style={styles.errorBar}>
          <ThemedText>{error}</ThemedText>
        </View>
      )}
      {!loading && tailors.length === 0 && region && (
        <ThemedView style={styles.infoCard}>
          <ThemedText type="defaultSemiBold">No tailors found in this area</ThemedText>
          <ThemedText>Try a nearby PIN or open Maps to explore more results.</ThemedText>
          <View style={styles.actionRow}>
            <Pressable onPress={() => setRefreshTick((x) => x + 1)} style={[styles.btn, { backgroundColor: themeColor }]}>
              <ThemedText style={styles.btnText}>Retry</ThemedText>
            </Pressable>
            <Pressable onPress={() => openMapsSearch('tailor')} style={[styles.btn, { backgroundColor: themeColor }]}>
              <ThemedText style={styles.btnText}>Open in Maps</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}
      <Pressable
        onPress={onMyLocation}
        style={[styles.fab, styles.fabShadow, { backgroundColor: themeColor }]}
        accessibilityLabel="My Location"
        accessibilityRole="button"
      >
        <IconSymbol name="location.fill" color="#fff" size={20} />
      </Pressable>
      <Pressable
        onPress={() => openMapsSearch('tailor')}
        style={[styles.fab, styles.fabShadow, { backgroundColor: themeColor, right: 68 }]}
        accessibilityLabel="Search tailors in Maps"
        accessibilityRole="button"
      >
        <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Maps</ThemedText>
      </Pressable>
      {/* Attribution not required since we open external maps for search */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  panel: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    gap: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bbb',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    ...Platform.select({ web: { outlineStyle: 'none' as any } }),
  },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  primaryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    right: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  errorBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.1)'
  },
  infoCard: {
    marginHorizontal: 12,
    marginTop: 8,
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  attribution: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  fab: {
    position: 'absolute',
    right: 12,
    bottom: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },
  fabShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    shadowOffset: { width: 0, height: 2 },
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: { color: '#fff', fontWeight: '700' },
});
