import { createClient } from '@supabase/supabase-js';
import { ENV, assertEnv } from '@/constants/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

assertEnv();

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
