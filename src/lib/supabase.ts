import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || 'https://lhqrcpfxihibtamynoyj.supabase.co';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxocXJjcGZ4aWhpYnRhbXlub3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MzQwNzAsImV4cCI6MjEwMTUxMDA3MH0.vJRD51HhtM1NCBAijomkSBd-zfY1e3wl7kWwpxsjmwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

