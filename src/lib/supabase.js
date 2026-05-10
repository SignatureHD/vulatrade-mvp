import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://llsnhqujzjmqovgsglsf.supabase.co";
const fallbackSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsc25ocXVqemptcW92Z3NnbHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzA3MDAsImV4cCI6MjA5Mjk0NjcwMH0.397Caqr_lRuHZnkM0sLplTIHPQfN3zFvzMvfYek8x9c";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
