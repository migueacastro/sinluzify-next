import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error(
    "❌ CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_SUPABASE_URL environment variable is missing!"
  );
}
if (!supabaseKey) {
  console.error(
    "❌ CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing!"
  );
}

// Fallback to placeholders to avoid throwing a fatal exception during module import / page hydration
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseKey || "placeholder-anon-key",
  {
    auth: { persistSession: false }
  }
);
