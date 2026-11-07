import { useState, type FormEvent } from "react";
import { loginCredentialsSchema } from "@prient-flow/shared";
import { supabase } from "@/shared/api";
import { Button, Input, Label } from "@/shared/ui";
import { authErrorMessage } from "../lib/authError";

/**
 * Форма входа по email/паролю. После успешного входа редирект делает
 * LoginPage: SessionProvider меняет статус на authenticated.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = loginCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте поля формы");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);

    if (authError) {
      setError(authErrorMessage(authError, "Неверный email или пароль"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="login-email">Email или логин</Label>
        <Input
          id="login-email"
          type="text"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin"
        />
      </div>
      <div>
        <Label htmlFor="login-password">Пароль</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" loading={loading} className="w-full">
        Войти
      </Button>
    </form>
  );
}
