import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file.");
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

export const supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            if (typeof document === "undefined") return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${key}=`);
            if (parts.length === 2)
              return parts.pop()?.split(";").shift() || null;
            return null;
          },
          setItem: (key, value) => {
            if (typeof document === "undefined") return;
            // Only use Secure flag on HTTPS connections
            const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
            const secureFlag = isSecure ? "; Secure" : "";
            document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
          },
          removeItem: (key) => {
            if (typeof document === "undefined") return;
            document.cookie = `${key}=; path=/; max-age=0`;
          },
        },
      },
      db: {
        schema: 'public', // Explicitly set schema
      },
      global: {
        fetch: async (url, options = {}) => {
          // Add timeout to all Supabase requests to prevent hanging
          const existingSignal = options?.signal;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          // Combine existing signal with timeout signal if present
          let combinedSignal = controller.signal;
          if (existingSignal) {
            existingSignal.addEventListener('abort', () => controller.abort());
            combinedSignal = controller.signal;
          }

          try {
            const response = await fetch(url, {
              ...options,
              signal: combinedSignal,
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              // Don't log if it was the existing signal that aborted
              if (!existingSignal?.aborted) {
                console.error("❌ Supabase request timed out after 30s:", url);
              }
              throw error; // Re-throw the original error
            } else if (error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
              console.error("❌ Network error fetching from Supabase:", {
                url: String(url),
                error: error.message,
                supabaseUrl
              });
              const friendlyError = new Error(
                  `Network error: Unable to connect to Supabase at ${supabaseUrl}. ` +
                  `Please check: 1) Your internet connection, 2) Supabase URL is correct, 3) Supabase project is active.`
              );
              (friendlyError as any).originalError = error;
              throw friendlyError;
            }
            throw error;
          }
        },
      },
    }
);