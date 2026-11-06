import { createSupabaseClient } from "@prient-flow/database";

/**
 * Клиент Supabase для браузера (anon key, RLS ограничивает данные workspace'ом).
 * Env приходят из .env (VITE_ префикс обязателен для Vite).
 */
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
);
