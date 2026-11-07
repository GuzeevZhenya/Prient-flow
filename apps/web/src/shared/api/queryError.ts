import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function toQueryError(message: string): FetchBaseQueryError {
  return { status: "CUSTOM_ERROR", error: message };
}

export function mapSupabaseError(
  error: { message?: string; code?: string },
  fallback: string,
): string {
  const code = error.code ?? "";
  const message = error.message ?? "";
  const haystack = `${code} ${message}`.toLowerCase();
  if (
    code === "PGRST205" ||
    code === "42P01" ||
    haystack.includes("could not find the table") ||
    haystack.includes("schema cache")
  ) {
    return "Таблицы БД не созданы. В SQL Editor облака выполни по порядку файлы из supabase/migrations.";
  }
  return message || fallback;
}

export function getQueryErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error: unknown }).error;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return fallback;
}
