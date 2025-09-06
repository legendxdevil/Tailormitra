import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Navigate away as soon as session is available (after OAuth redirect)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(tabs)' as any);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const onSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      setMessage('Account created. Please verify your email (if required), then sign in.');
      setTimeout(() => router.push('/(auth)/signin' as any), 700);
    } catch (e: any) {
      setError(e?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFDE7', dark: '#2a2a14' }}
      headerImage={<ThemedView />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Create Account</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Pressable
          onPress={async () => {
            try {
              setError(null);
              const isExpoGo = Constants.appOwnership === 'expo';
              const redirectTo = isExpoGo
                ? (makeRedirectUri as any)({ useProxy: true })
                : makeRedirectUri({ scheme: 'tailormitra' });
              const { error: err } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
              });
              if (err) setError(err.message);
            } catch (e: any) {
              setError(e?.message || 'Google sign-in failed');
            }
          }}
          style={[styles.btn, { backgroundColor: '#DB4437' }]}
        >
          <ThemedText style={styles.btnText}>Continue with Google</ThemedText>
        </Pressable>
        <View style={styles.inputGroup}>
          <ThemedText>Email</ThemedText>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            style={styles.input}
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText>Password</ThemedText>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            style={styles.input}
          />
        </View>
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
        <Pressable onPress={onSubmit} style={styles.btn} disabled={loading}>
          <ThemedText style={styles.btnText}>{loading ? 'Creating...' : 'Create Account'}</ThemedText>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/signin' as any)}>
          <ThemedText style={styles.link}>Already have an account? Sign In</ThemedText>
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  link: {
    color: '#1976D2',
    fontWeight: '600',
  },
  inputGroup: { gap: 6 },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  error: { color: '#c62828' },
  message: { color: '#2e7d32' },
});
