
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabaseInstance = null;
let initializationError = "";

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
  initializationError += "Supabase URL is missing or is a placeholder. Please set a valid SUPABASE_URL in your environment (e.g., in index.html).\n";
}
if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  initializationError += "Supabase Anon Key is missing or is a placeholder. Please set a valid SUPABASE_ANON_KEY in your environment (e.g., in index.html).\n";
}

if (initializationError) {
  console.error("Supabase client initialization failed:\n" + initializationError);
} else {
  try {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        // Supabase-js automatically persists session to localStorage.
        // You can disable this or change storage type if needed.
        // persistSession: true,
        // autoRefreshToken: true,
        // detectSessionInUrl: true, // For OAuth and magic links
      }
    });
  } catch (e) {
    console.error("Error during Supabase client creation (likely due to invalid URL even after placeholder check):", e);
    initializationError += `Failed to create Supabase client: ${e instanceof Error ? e.message : String(e)}\n`;
  }
}

export const supabase = supabaseInstance;

if (supabase === null && !initializationError.includes("initialization failed")) { // Check if error wasn't already logged for placeholders
    console.warn("Supabase client could not be initialized. Authentication and database features will not work.");
} else if (supabase === null && initializationError) {
    // Already logged specific errors for placeholders or creation failure
}
