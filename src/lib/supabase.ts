// Supabase client
// Project: Monsters props inc
// Design note: keep ALL secrets server-side. In the browser we only use the publishable (anon) key.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

// Public client (no session persistence) to avoid noisy 401s on public pages.
export const supabasePublic = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Admin client (session persistence enabled) for the back office.
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
