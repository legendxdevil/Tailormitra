// Centralized env access for Expo. Set these in your environment as EXPO_PUBLIC_* variables.
import Constants from 'expo-constants';

const extra = (Constants?.expoConfig as any)?.extra ?? {};

export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? extra.EXPO_PUBLIC_MAPBOX_TOKEN ?? '',
};

export function assertEnv() {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    console.warn(
      '[env] Missing Supabase URL/key. Ensure both are set as EXPO_PUBLIC_* in app.json -> expo.extra, or env variables.'
    );
  }
}