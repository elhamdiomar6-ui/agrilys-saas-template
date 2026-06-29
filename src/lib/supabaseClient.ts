import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

function validateSupabaseConfig() {
  if (!supabaseUrl && !supabaseAnonKey) {
    return 'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont absentes ou vides.';
  }
  if (!supabaseUrl) {
    return 'VITE_SUPABASE_URL est absente ou vide.';
  }
  if (!supabaseAnonKey) {
    return 'VITE_SUPABASE_ANON_KEY est absente ou vide.';
  }
  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== 'https:') {
      return 'VITE_SUPABASE_URL doit commencer par https://.';
    }
  } catch {
    return 'VITE_SUPABASE_URL n’est pas une URL valide.';
  }
  if (supabaseAnonKey.length < 20) {
    return 'VITE_SUPABASE_ANON_KEY semble trop courte.';
  }
  return null;
}

export const supabaseConfigError = validateSupabaseConfig();
export const isSupabaseConfigured = !supabaseConfigError;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(`Supabase non configuré. ${supabaseConfigError || 'Définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'}`);
  }
  return supabase;
}

export async function getDocumentUrl(path: string) {
  const client = requireSupabase();
  const { data, error } = await client.storage
    .from('documents-association')
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}
