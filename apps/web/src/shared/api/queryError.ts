import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function toQueryError(message: string): FetchBaseQueryError {
  return { status: "CUSTOM_ERROR", error: message };
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
