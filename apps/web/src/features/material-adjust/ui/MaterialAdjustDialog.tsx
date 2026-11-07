import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatAmount,
  MATERIAL_TYPE_UNITS,
  useAdjustMaterialStockMutation,
  type Material,
} from "@/entities/material";
import { Button, Input, Label, Modal, Select } from "@/shared/ui";
import { getQueryErrorMessage } from "@/shared/api";

const adjustFormSchema = z.object({
  direction: z.enum(["restock", "writeoff"]),
  amount: z.coerce.number().positive("Укажите количество больше нуля"),
});

type AdjustFormValues = z.infer<typeof adjustFormSchema>;

export interface MaterialAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  material: Material | null;
}

export function MaterialAdjustDialog({
  open,
  onClose,
  workspaceId,
  material,
}: MaterialAdjustDialogProps) {
  const [adjustStock, { isLoading }] = useAdjustMaterialStockMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustFormSchema),
    defaultValues: { direction: "restock", amount: 0 },
  });

  useEffect(() => {
    if (open) {
      reset({ direction: "restock", amount: 0 });
    }
  }, [open, material?.id, reset]);

  async function onSubmit(values: AdjustFormValues) {
    if (!material) return;
    const deltaAmount = values.direction === "restock" ? values.amount : -values.amount;
    const reason = values.direction === "restock" ? "restock" : "manual_adjustment";
    const result = await adjustStock({
      materialId: material.id,
      workspaceId,
      deltaAmount,
      reason,
    });
    if ("error" in result) {
      setError("root", {
        message: getQueryErrorMessage(result.error, "Не удалось изменить остаток"),
      });
      return;
    }
    onClose();
  }

  const unit = material ? MATERIAL_TYPE_UNITS[material.type] : "";

  return (
    <Modal open={open} onClose={onClose} title="Движение остатка">
      {material ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">
            {material.name}
            {material.brand ? ` · ${material.brand}` : ""} — сейчас{" "}
            <span className="font-medium text-slate-900">
              {formatAmount(material.remaining_amount)} {unit}
            </span>
          </p>
          <div>
            <Label htmlFor="adjust-direction">Операция</Label>
            <Select id="adjust-direction" disabled={isLoading} {...register("direction")}>
              <option value="restock">Пополнить</option>
              <option value="writeoff">Списать</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="adjust-amount">Количество, {unit}</Label>
            <Input
              id="adjust-amount"
              type="number"
              min="0"
              step="0.01"
              disabled={isLoading}
              invalid={Boolean(errors.amount)}
              {...register("amount")}
            />
            {errors.amount ? (
              <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
            ) : null}
          </div>
          {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" loading={isLoading}>
              Применить
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}
