import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://llsnhqujzjmqovgsglsf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsc25ocXVqemptcW92Z3NnbHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzA3MDAsImV4cCI6MjA5Mjk0NjcwMH0.397Caqr_lRuHZnkM0sLplTIHPQfN3zFvzMvfYek8x9c";

export const hasSupabaseConfig = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
