import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { materialCreateSchema, materialUpdateSchema, type MaterialType } from "@prient-flow/shared";
import {
  MATERIAL_TYPE_LABELS,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  type Material,
} from "@/entities/material";
import { Button, Input, Label, Modal, Select } from "@/shared/ui";
import { getQueryErrorMessage } from "@/shared/api";

type MaterialFormInput = z.input<typeof materialCreateSchema>;
type MaterialFormOutput = z.output<typeof materialCreateSchema>;

const EMPTY_VALUES: MaterialFormInput = {
  type: "filament",
  brand: "",
  name: "",
  color_hex: "",
  initial_amount: 0,
  cost_per_unit: 0,
  low_stock_threshold: 0,
};

export interface MaterialFormDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  material?: Material | null;
}

export function MaterialFormDialog({
  open,
  onClose,
  workspaceId,
  material,
}: MaterialFormDialogProps) {
  const isEdit = Boolean(material);
  const [createMaterial, { isLoading: creating }] = useCreateMaterialMutation();
  const [updateMaterial, { isLoading: updating }] = useUpdateMaterialMutation();
  const submitting = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MaterialFormInput, unknown, MaterialFormOutput>({
    resolver: zodResolver(materialCreateSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (material) {
      reset({
        type: material.type,
        brand: material.brand ?? "",
        name: material.name,
        color_hex: material.color_hex ?? "",
        initial_amount: material.initial_amount,
        cost_per_unit: material.cost_per_unit,
        low_stock_threshold: material.low_stock_threshold,
      });
      return;
    }
    reset(EMPTY_VALUES);
  }, [open, material, reset]);

  async function onSubmit(values: MaterialFormOutput) {
    if (isEdit && material) {
      const parsed = materialUpdateSchema.safeParse({
        type: values.type,
        brand: values.brand,
        name: values.name,
        color_hex: values.color_hex,
        cost_per_unit: values.cost_per_unit,
        low_stock_threshold: values.low_stock_threshold,
      });
      if (!parsed.success) {
        setError("root", { message: parsed.error.issues[0]?.message ?? "Проверьте поля формы" });
        return;
      }
      const result = await updateMaterial({
        id: material.id,
        workspaceId,
        input: parsed.data,
      });
      if ("error" in result) {
        setError("root", {
          message: getQueryErrorMessage(result.error, "Не удалось сохранить материал"),
        });
        return;
      }
      onClose();
      return;
    }

    const result = await createMaterial({ workspaceId, input: values });
    if ("error" in result) {
      setError("root", {
        message: getQueryErrorMessage(result.error, "Не удалось добавить материал"),
      });
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Редактировать материал" : "Новый материал"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <Label htmlFor="material-type">Тип</Label>
          <Select id="material-type" disabled={submitting} {...register("type")}>
            {(Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[]).map((type) => (
              <option key={type} value={type}>
                {MATERIAL_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="material-name">Название</Label>
          <Input
            id="material-name"
            disabled={submitting}
            invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="material-brand">Бренд</Label>
          <Input
            id="material-brand"
            disabled={submitting}
            placeholder="необязательно"
            {...register("brand")}
          />
        </div>
        <div>
          <Label htmlFor="material-color">Цвет, #RRGGBB</Label>
          <Input
            id="material-color"
            disabled={submitting}
            placeholder="#00A3E0"
            invalid={Boolean(errors.color_hex)}
            {...register("color_hex")}
          />
          {errors.color_hex ? (
            <p className="mt-1 text-xs text-red-600">{errors.color_hex.message}</p>
          ) : null}
        </div>
        {isEdit ? null : (
          <div>
            <Label htmlFor="material-initial">Начальное количество</Label>
            <Input
              id="material-initial"
              type="number"
              min="0"
              step="0.01"
              disabled={submitting}
              invalid={Boolean(errors.initial_amount)}
              {...register("initial_amount")}
            />
            {errors.initial_amount ? (
              <p className="mt-1 text-xs text-red-600">{errors.initial_amount.message}</p>
            ) : null}
          </div>
        )}
        <div>
          <Label htmlFor="material-cost">Цена за единицу</Label>
          <Input
            id="material-cost"
            type="number"
            min="0"
            step="0.01"
            disabled={submitting}
            invalid={Boolean(errors.cost_per_unit)}
            {...register("cost_per_unit")}
          />
          {errors.cost_per_unit ? (
            <p className="mt-1 text-xs text-red-600">{errors.cost_per_unit.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="material-threshold">Порог low-stock</Label>
          <Input
            id="material-threshold"
            type="number"
            min="0"
            step="0.01"
            disabled={submitting}
            invalid={Boolean(errors.low_stock_threshold)}
            {...register("low_stock_threshold")}
          />
          {errors.low_stock_threshold ? (
            <p className="mt-1 text-xs text-red-600">{errors.low_stock_threshold.message}</p>
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
