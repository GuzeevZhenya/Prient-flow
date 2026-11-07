import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientCreateSchema, clientUpdateSchema } from "@prient-flow/shared";
import { useCreateClientMutation, useUpdateClientMutation, type Client } from "@/entities/client";
import { Button, Input, Label, Modal } from "@/shared/ui";
import { getQueryErrorMessage } from "@/shared/api";

type ClientFormInput = z.input<typeof clientCreateSchema>;
type ClientFormOutput = z.output<typeof clientCreateSchema>;

const EMPTY_VALUES: ClientFormInput = {
  name: "",
  phone: "",
  telegram_username: "",
  telegram_chat_id: "",
};

export interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  client?: Client | null;
}

export function ClientFormDialog({ open, onClose, workspaceId, client }: ClientFormDialogProps) {
  const isEdit = Boolean(client);
  const [createClient, { isLoading: creating }] = useCreateClientMutation();
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation();
  const submitting = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClientFormInput, unknown, ClientFormOutput>({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (client) {
      reset({
        name: client.name,
        phone: client.phone ?? "",
        telegram_username: client.telegram_username ?? "",
        telegram_chat_id: client.telegram_chat_id ?? "",
      });
      return;
    }
    reset(EMPTY_VALUES);
  }, [open, client, reset]);

  async function onSubmit(values: ClientFormOutput) {
    if (isEdit && client) {
      const parsed = clientUpdateSchema.safeParse(values);
      if (!parsed.success) {
        setError("root", { message: parsed.error.issues[0]?.message ?? "Проверьте поля формы" });
        return;
      }
      const result = await updateClient({ id: client.id, workspaceId, input: parsed.data });
      if ("error" in result) {
        setError("root", {
          message: getQueryErrorMessage(result.error, "Не удалось сохранить клиента"),
        });
        return;
      }
      onClose();
      return;
    }

    const result = await createClient({ workspaceId, input: values });
    if ("error" in result) {
      setError("root", {
        message: getQueryErrorMessage(result.error, "Не удалось добавить клиента"),
      });
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Редактировать клиента" : "Новый клиент"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <Label htmlFor="client-name">Имя</Label>
          <Input
            id="client-name"
            disabled={submitting}
            invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="client-phone">Телефон</Label>
          <Input
            id="client-phone"
            disabled={submitting}
            placeholder="+375..."
            {...register("phone")}
          />
        </div>
        <div>
          <Label htmlFor="client-tg">Telegram</Label>
          <Input
            id="client-tg"
            disabled={submitting}
            placeholder="@username"
            {...register("telegram_username")}
          />
        </div>
        <div>
          <Label htmlFor="client-chat">Telegram chat id</Label>
          <Input id="client-chat" disabled={submitting} {...register("telegram_chat_id")} />
          {errors.telegram_chat_id ? (
            <p className="mt-1 text-xs text-red-600">{errors.telegram_chat_id.message}</p>
          ) : null}
        </div>
        {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
