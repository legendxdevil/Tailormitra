import { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const [pin, setPin] = useState('');
  const tint = Colors[theme].tint;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F3F6FF', dark: '#162032' }}
      headerImage={<ThemedView />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">TailorMitra</ThemedText>
        <ThemedText>Find nearby tailors. Book easily.</ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText type="subtitle">Quick actions</ThemedText>
        <View style={styles.row}>
          <ActionTile
            title="Search Map"
            iconName="paperplane.fill"
            color={tint}
            onPress={() => router.push('/(tabs)/explore' as any)}
          />
          <ActionTile
            title="My Bookings"
            iconName="bookmark.fill"
            color={tint}
            onPress={() => router.push('/(tabs)/bookings' as any)}
          />
        </View>
        <View style={styles.row}>
          <ActionTile
            title="Profile"
            iconName="person.fill"
            color={tint}
            onPress={() => router.push('/(tabs)/profile' as any)}
          />
          <ActionTile
            title="Sign In"
            iconName="chevron.right"
            color={tint}
            onPress={() => router.push('/(auth)/signin' as any)}
          />
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Search by PIN</ThemedText>
        <View style={styles.pinRow}>
          <TextInput
            value={pin}
            onChangeText={setPin}
            placeholder="Enter 6-digit PIN"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/explore', params: { pin } } as any)}
            style={[styles.pinBtn, { backgroundColor: tint }]}
          >
            <ThemedText style={styles.pinBtnText}>Go</ThemedText>
          </Pressable>
        </View>
      </View>
    </ParallaxScrollView>
  );
}

function ActionTile({
  title,
  iconName,
  color,
  onPress,
}: {
  title: string;
  iconName: 'paperplane.fill' | 'bookmark.fill' | 'person.fill' | 'chevron.right';
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <IconSymbol name={iconName} color={color} size={28} />
      <ThemedText>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  card: {
    gap: 8,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    alignItems: 'center',
    gap: 6,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  pinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pinBtnText: { color: '#fff', fontWeight: '600' },
});
