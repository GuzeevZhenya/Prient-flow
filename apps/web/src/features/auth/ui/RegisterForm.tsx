import { useState, type FormEvent } from "react";
import { registerCredentialsSchema } from "@prient-flow/shared";
import { useEnsureWorkspaceMutation } from "@/entities/workspace";
import { supabase } from "@/shared/api";
import { Button, Input, Label } from "@/shared/ui";
import { authErrorMessage } from "../lib/authError";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Мастерская");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ensureWorkspace] = useEnsureWorkspaceMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const parsed = registerCredentialsSchema.safeParse({ email, password, workspaceName });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте поля формы");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (authError) {
      setLoading(false);
      setError(authErrorMessage(authError, "Не удалось зарегистрироваться"));
      return;
    }

    const userId = data.user?.id ?? data.session?.user.id;
    if (data.session && userId) {
      const workspaceResult = await ensureWorkspace({
        ownerId: userId,
        name: parsed.data.workspaceName,
      });
      setLoading(false);
      if ("error" in workspaceResult) {
        setError("Аккаунт создан, но workspace не записался. Войдите и откройте настройки.");
        return;
      }
      return;
    }

    setLoading(false);
    setInfo(
      "Аккаунт создан. Если вход не открылся — в Supabase отключите Confirm email (Authentication → Providers → Email) и войдите.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="register-email">Email или логин</Label>
        <Input
          id="register-email"
          type="text"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin"
        />
      </div>
      <div>
        <Label htmlFor="register-password">Пароль</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="минимум 6 символов"
        />
      </div>
      <div>
        <Label htmlFor="register-workspace">Название мастерской</Label>
        <Input
          id="register-workspace"
          type="text"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {info ? <p className="text-sm text-slate-600">{info}</p> : null}
      <p className="text-xs text-slate-500">
        Authentication → Providers → Email: провайдер Email включён, Confirm email выключен.
      </p>
      <Button type="submit" loading={loading} className="w-full">
        Зарегистрироваться
      </Button>
    </form>
  );
}
