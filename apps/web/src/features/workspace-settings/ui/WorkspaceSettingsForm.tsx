import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import {
  workspaceSettingsSchema,
  defaultWorkspaceSettings,
  type WorkspaceSettings,
} from "@prient-flow/shared";
import { supabase } from "@/shared/api";
import { selectSessionUser } from "@/entities/session";
import { Button, Input, Label, Select, Spinner } from "@/shared/ui";

const CURRENCIES = ["BYN", "RUB", "USD", "EUR"] as const;

type FormState = "loading" | "ready" | "saving";

/**
 * Тарифы мастерской: читаются из workspaces.settings текущего владельца,
 * валидируются Zod-схемой из packages/shared перед сохранением.
 */
export function WorkspaceSettingsForm() {
  const user = useSelector(selectSessionUser);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [values, setValues] = useState<WorkspaceSettings>(defaultWorkspaceSettings);
  const [state, setState] = useState<FormState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ownerId = user.id;

    async function load() {
      const { data, error: queryError } = await supabase
        .from("workspaces")
        .select("id, settings")
        .eq("owner_id", ownerId)
        .limit(1)
        .maybeSingle();

      if (queryError) {
        setError("Не удалось загрузить настройки workspace");
        setState("ready");
        return;
      }
      if (!data) {
        setError("Для текущего пользователя нет workspace");
        setState("ready");
        return;
      }

      const parsed = workspaceSettingsSchema.safeParse(data.settings);
      setWorkspaceId(data.id);
      setValues(parsed.success ? parsed.data : defaultWorkspaceSettings);
      setState("ready");
    }

    void load();
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspaceId) return;
    setError(null);
    setSaved(false);

    const parsed = workspaceSettingsSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте поля формы");
      return;
    }

    setState("saving");
    const { error: updateError } = await supabase
      .from("workspaces")
      .update({ settings: parsed.data })
      .eq("id", workspaceId);
    setState("ready");

    if (updateError) {
      setError("Не удалось сохранить настройки");
      return;
    }
    setValues(parsed.data);
    setSaved(true);
  }

  if (state === "loading") {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  const disabled = state === "saving" || !workspaceId;

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div>
        <Label htmlFor="settings-currency">Валюта</Label>
        <Select
          id="settings-currency"
          value={values.currency}
          onChange={(event) =>
            setValues({ ...values, currency: event.target.value as WorkspaceSettings["currency"] })
          }
          disabled={disabled}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="settings-electricity">Электричество, за кВт⋅ч</Label>
        <Input
          id="settings-electricity"
          type="number"
          min="0"
          step="0.01"
          value={values.electricityRatePerKwh}
          onChange={(event) =>
            setValues({ ...values, electricityRatePerKwh: Number(event.target.value) })
          }
          disabled={disabled}
        />
      </div>
      <div>
        <Label htmlFor="settings-labor">Ручной труд, за час</Label>
        <Input
          id="settings-labor"
          type="number"
          min="0"
          step="0.5"
          value={values.laborRatePerHour}
          onChange={(event) =>
            setValues({ ...values, laborRatePerHour: Number(event.target.value) })
          }
          disabled={disabled}
        />
      </div>
      <div>
        <Label htmlFor="settings-margin">Маржа, %</Label>
        <Input
          id="settings-margin"
          type="number"
          min="0"
          max="1000"
          step="1"
          value={values.marginPercent}
          onChange={(event) => setValues({ ...values, marginPercent: Number(event.target.value) })}
          disabled={disabled}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">Настройки сохранены</p> : null}
      <Button type="submit" loading={state === "saving"} disabled={disabled}>
        Сохранить
      </Button>
    </form>
  );
}
