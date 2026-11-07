type AuthLikeError = {
  message: string;
  code?: string;
};

export function authErrorMessage(error: AuthLikeError, fallback: string): string {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();

  if (
    code === "email_provider_disabled" ||
    message.includes("email signups are disabled") ||
    message.includes("email logins are disabled")
  ) {
    return "Вход по email выключен. Authentication → Providers → Email: включи сам провайдер Email, а Confirm email оставь выключенным.";
  }
  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Лимит писем Supabase. Confirm email должен быть выключен, сам провайдер Email — включён. Подожди несколько минут и попробуй снова.";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "Такой пользователь уже есть — открой вкладку «Вход».";
  }
  if (message.includes("invalid api key") || message.includes("jwt")) {
    return "Неверный ключ API. В apps/web/.env нужен anon/publishable из Settings → API.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Email не подтверждён. Выключи Confirm email в дашборде Supabase и войди снова.";
  }
  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "Неверный email или пароль";
  }
  return error.message || fallback;
}
