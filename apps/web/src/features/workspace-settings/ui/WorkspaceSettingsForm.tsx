import { useEffect, useState, type FormEvent } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import {
  workspaceSettingsSchema,
  defaultWorkspaceSettings,
  type WorkspaceSettings,
} from "@prient-flow/shared";
import {
  useGetWorkspaceByOwnerQuery,
  useUpdateWorkspaceSettingsMutation,
} from "@/entities/workspace";
import { selectSessionUser } from "@/entities/session";
import { getQueryErrorMessage } from "@/shared/api";
import { Button, Input, Label, Select, Spinner } from "@/shared/ui";

const CURRENCIES = ["BYN", "RUB", "USD", "EUR"] as const;

/**
 * Тарифы мастерской: читаются и пишутся через RTK Query entity workspace,
 * валидируются Zod-схемой из packages/shared перед сохранением.
 */
export function WorkspaceSettingsForm() {
  const user = useSelector(selectSessionUser);
  const {
    data: workspace,
    isLoading,
    isError,
    error,
  } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);
  const [updateSettings, { isLoading: saving }] = useUpdateWorkspaceSettingsMutation();
  const [values, setValues] = useState<WorkspaceSettings>(defaultWorkspaceSettings);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (workspace) {
      setValues(workspace.settings);
    }
  }, [workspace]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace) return;
    setFormError(null);
    setSaved(false);

    const parsed = workspaceSettingsSchema.safeParse(values);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Проверьте поля формы");
      return;
    }

    const result = await updateSettings({
      workspaceId: workspace.id,
      settings: parsed.data,
    });
    if ("error" in result) {
      setFormError(getQueryErrorMessage(result.error, "Не удалось сохранить настройки"));
      return;
    }
    setValues(parsed.data);
    setSaved(true);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        {getQueryErrorMessage(error, "Не удалось загрузить настройки workspace")}
      </p>
    );
  }

  if (!workspace) {
    return <p className="text-sm text-red-600">Для текущего пользователя нет workspace</p>;
  }

  const disabled = saving;

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
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      {saved ? <p className="text-sm text-green-600">Настройки сохранены</p> : null}
      <Button type="submit" loading={saving} disabled={disabled}>
        Сохранить
      </Button>
    </form>
  );
}
