import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, View, TextInput, Pressable, Alert } from 'react-native';
import { LoadingGif } from '@/components/LoadingGif';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BookingsScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const theme = useColorScheme() ?? 'light';
  const tint = Colors[theme].tint;

  useEffect(() => {
    // Initial load
    load();
  }, []);

  async function load() {
    setLoading(true);
    // TODO: Replace with Supabase fetch later
    await new Promise((r) => setTimeout(r, 700));
    setItems(sampleData);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (items.length > 0 && !loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={getFilteredSorted(items, filter, query)}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <BookingCard item={item} onCancel={() => onCancel(item)} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 12, paddingBottom: 8, gap: 8 }}>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">My Bookings</ThemedText>
              </ThemedView>
              <View style={styles.filtersRow}>
                <Chip label="Upcoming" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} tint={tint} />
                <Chip label="Past" active={filter === 'past'} onPress={() => setFilter('past')} tint={tint} />
                <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} tint={tint} />
              </View>
              <TextInput
                placeholder="Search by tailor or service"
                value={query}
                onChangeText={setQuery}
                style={[styles.searchInput, theme === 'dark' && styles.searchInputDark]}
                placeholderTextColor={theme === 'dark' ? '#9aa0a6' : '#9e9e9e'}
              />
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F5E9', dark: '#1b2a1d' }}
      headerImage={<ThemedView />}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Bookings</ThemedText>
      </ThemedView>
      {loading ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <LoadingGif />
          <ThemedText>Loading bookings...</ThemedText>
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
          <ThemedText>No bookings yet</ThemedText>
          <ThemedText>Use the map to find a tailor and book.</ThemedText>
        </View>
      )}
    </ParallaxScrollView>
  );
}

type BookingItem = {
  id: string;
  tailor: string;
  date: string; // ISO date string
  service: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  address?: string;
};

function BookingCard({ item, onCancel }: { item: BookingItem; onCancel: () => void }) {
  return (
    <ThemedView style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText type="defaultSemiBold">{item.tailor}</ThemedText>
        <StatusBadge status={item.status} />
      </View>
      <ThemedText>{item.service}</ThemedText>
      <ThemedText>{new Date(item.date).toLocaleString()}</ThemedText>
      {item.address ? <ThemedText>{item.address}</ThemedText> : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Pressable style={[styles.actionBtn, { backgroundColor: '#1976D2' }]}
          onPress={() => Alert.alert('Booking', 'Details screen coming soon')}
        >
          <ThemedText style={styles.actionBtnText}>View</ThemedText>
        </Pressable>
        {item.status === 'upcoming' && (
          <Pressable style={[styles.actionBtn, { backgroundColor: '#C62828' }]} onPress={onCancel}>
            <ThemedText style={styles.actionBtnText}>Cancel</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const sampleData: BookingItem[] = [
  {
    id: '1',
    tailor: 'Sharma Tailors',
    date: new Date(Date.now() + 86400000).toISOString(),
    service: 'Blouse Stitching',
    status: 'upcoming',
    address: 'Main Bazaar, Jaipur',
  },
  {
    id: '2',
    tailor: 'Royal Gents Tailor',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    service: 'Pant Alteration',
    status: 'completed',
    address: 'MG Road, Pune',
  },
  {
    id: '3',
    tailor: 'Elegant Stitch',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    service: 'Suit Fitting',
    status: 'upcoming',
    address: 'Connaught Place, Delhi',
  },
  {
    id: '4',
    tailor: 'Quick Alterations',
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    service: 'Kurta Sleeve Fix',
    status: 'cancelled',
    address: 'Bandra West, Mumbai',
  },
];

function StatusBadge({ status }: { status: BookingItem['status'] }) {
  const stylesMap = {
    upcoming: { bg: 'rgba(25,118,210,0.12)', color: '#1976D2', label: 'Upcoming' },
    completed: { bg: 'rgba(56,142,60,0.12)', color: '#388E3C', label: 'Completed' },
    cancelled: { bg: 'rgba(198,40,40,0.12)', color: '#C62828', label: 'Cancelled' },
  } as const;
  const s = stylesMap[status];
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: s.bg }}>
      <ThemedText style={{ color: s.color, fontSize: 12, fontWeight: '600' }}>{s.label}</ThemedText>
    </View>
  );
}

function Chip({ label, active, onPress, tint }: { label: string; active: boolean; onPress: () => void; tint: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: active ? tint : '#ccc',
        backgroundColor: active ? tint : 'transparent',
      }}
    >
      <ThemedText style={{ color: active ? '#fff' : undefined }}>{label}</ThemedText>
    </Pressable>
  );
}

function getFilteredSorted(items: BookingItem[], filter: 'all' | 'upcoming' | 'past', query: string) {
  const now = Date.now();
  const filtered = items.filter((it) => {
    const isUpcoming = new Date(it.date).getTime() >= now && it.status === 'upcoming';
    const isPast = new Date(it.date).getTime() < now || it.status !== 'upcoming';
    const byFilter = filter === 'all' ? true : filter === 'upcoming' ? isUpcoming : isPast;
    const byQuery = (it.tailor + ' ' + it.service).toLowerCase().includes(query.toLowerCase());
    return byFilter && byQuery;
  });
  const sorted = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (filter === 'past') sorted.reverse();
  return sorted;
}

async function onCancel(item: BookingItem) {
  Alert.alert('Cancel booking', `Are you sure you want to cancel with ${item.tailor}?`, [
    { text: 'No' },
    { text: 'Yes, cancel', style: 'destructive', onPress: () => {/* TODO: Supabase update later */} },
  ]);
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchInputDark: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: '700' },
});
