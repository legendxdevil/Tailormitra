import { StyleSheet, Pressable, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { LoadingGif } from '@/components/LoadingGif';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) setEmail(data.session?.user?.email ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setEmail(null);
    setLoading(false);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E3F2FD', dark: '#142233' }}
      headerImage={<ThemedView />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      {loading ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <LoadingGif />
          <ThemedText>Loading...</ThemedText>
        </View>
      ) : email ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Signed in</ThemedText>
          <ThemedText>{email}</ThemedText>
          <Pressable style={styles.btn} onPress={onSignOut}>
            <ThemedText style={styles.btnText}>Sign Out</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView style={styles.card}>
          <ThemedText>You are not signed in</ThemedText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={styles.btn} onPress={() => router.push('/(auth)/signin' as any)}>
              <ThemedText style={styles.btnText}>Sign In</ThemedText>
            </Pressable>
            <Pressable style={styles.btn} onPress={() => router.push('/(auth)/signup' as any)}>
              <ThemedText style={styles.btnText}>Create Account</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  btn: {
    marginTop: 6,
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
