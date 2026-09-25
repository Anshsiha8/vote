import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_STORAGE_URL_KEY = 'campus_vote_custom_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'campus_vote_custom_supabase_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const customUrl = localStorage.getItem(SUPABASE_STORAGE_URL_KEY);
  const customKey = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY);

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = (customUrl || envUrl || '').trim();
  const key = (customKey || envKey || '').trim();

  return { url, key };
}

export function saveCustomSupabaseCredentials(url: string, key: string): void {
  if (url && key) {
    localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
    localStorage.removeItem(SUPABASE_STORAGE_KEY_KEY);
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project.supabase.co') &&
    key !== 'your-anon-key'
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseCredentials();
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}
