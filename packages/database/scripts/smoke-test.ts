// Смоук-тест Спринта 1.5: обе фабрики клиентов читают список таблиц
// из локального Supabase. Запуск: pnpm --filter @prient-flow/database smoke
// (подхватывает корневой .env через --env-file).
import { createSupabaseClient, createServiceRoleClient } from "../src/index";

const TABLES = [
  "workspaces",
  "clients",
  "materials",
  "printers",
  "orders",
  "order_items",
  "print_jobs",
  "inventory_logs",
] as const;

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error(
      "Нужны VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY и SUPABASE_SERVICE_ROLE_KEY в .env",
    );
  }

  const anon = createSupabaseClient(url, anonKey);
  const { error: anonError } = await anon.from("workspaces").select("id").limit(1);
  if (anonError) throw new Error(`anon-клиент: ${anonError.message}`);
  console.log("ok: anon-клиент подключился (RLS скрывает строки — это ожидаемо)");

  const service = createServiceRoleClient(url, serviceRoleKey);
  for (const table of TABLES) {
    const { error } = await service.from(table).select("id").limit(1);
    if (error) throw new Error(`service-role ${table}: ${error.message}`);
    console.log(`ok: ${table}`);
  }
  console.log("smoke-test: все 8 таблиц читаются, спринт 1.5 закрыт");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
