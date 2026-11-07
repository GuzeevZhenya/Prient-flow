import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  orderCreateSchema,
  orderItemCreateSchema,
  orderUpdateSchema,
  PRINTER_TECHNOLOGIES,
} from "@prient-flow/shared";
import { type Client } from "@/entities/client";
import { type Material } from "@/entities/material";
import {
  generateOrderNumber,
  TECHNOLOGY_LABELS,
  useCreateOrderItemMutation,
  useCreateOrderMutation,
  useDeleteOrderItemMutation,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
  type Order,
} from "@/entities/order";
import { Button, Input, Label, Modal, Select } from "@/shared/ui";
import { getQueryErrorMessage } from "@/shared/api";

type OrderFormInput = z.input<typeof orderCreateSchema>;

const EMPTY_ITEM = {
  name: "",
  quantity: 1,
  technology: "FDM" as const,
  material_id: "",
  estimated_weight_g: "",
  estimated_time_sec: "",
  post_processing_mins: "",
};

function emptyValues(): OrderFormInput {
  return {
    client_id: "",
    order_number: generateOrderNumber(),
    status: "draft",
    total_price: "",
    calculated_cost: "",
    is_paid: false,
    items: [{ ...EMPTY_ITEM }],
  };
}

export interface OrderFormDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  order?: Order | null;
  clients: Client[];
  materials: Material[];
}

export function OrderFormDialog({
  open,
  onClose,
  workspaceId,
  order,
  clients,
  materials,
}: OrderFormDialogProps) {
  const isEdit = Boolean(order);
  const [createOrder, { isLoading: creating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: updating }] = useUpdateOrderMutation();
  const [createItem, { isLoading: addingItem }] = useCreateOrderItemMutation();
  const [deleteItem, { isLoading: removingItem }] = useDeleteOrderItemMutation();
  const [deleteOrder, { isLoading: removingOrder }] = useDeleteOrderMutation();
  const submitting = creating || updating || addingItem || removingItem || removingOrder;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors },
  } = useForm<OrderFormInput>({
    defaultValues: emptyValues(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!open) return;
    if (order) {
      reset({
        client_id: order.client_id,
        order_number: order.order_number,
        status: order.status,
        total_price: order.total_price ?? "",
        calculated_cost: order.calculated_cost ?? "",
        is_paid: order.is_paid,
        items: [{ ...EMPTY_ITEM }],
      });
      return;
    }
    reset(emptyValues());
  }, [open, order, reset]);

  async function onSubmit(values: OrderFormInput) {
    if (isEdit && order) {
      const parsed = orderUpdateSchema.safeParse({
        client_id: values.client_id,
        order_number: values.order_number,
        total_price: values.total_price,
        calculated_cost: values.calculated_cost,
        is_paid: values.is_paid,
      });
      if (!parsed.success) {
        setError("root", { message: parsed.error.issues[0]?.message ?? "Проверьте поля формы" });
        return;
      }
      const result = await updateOrder({ id: order.id, workspaceId, input: parsed.data });
      if ("error" in result) {
        setError("root", {
          message: getQueryErrorMessage(result.error, "Не удалось сохранить заказ"),
        });
        return;
      }
      onClose();
      return;
    }

    const parsed = orderCreateSchema.safeParse(values);
    if (!parsed.success) {
      setError("root", { message: parsed.error.issues[0]?.message ?? "Проверьте поля формы" });
      return;
    }
    const result = await createOrder({ workspaceId, input: parsed.data });
    if ("error" in result) {
      setError("root", { message: getQueryErrorMessage(result.error, "Не удалось создать заказ") });
      return;
    }
    onClose();
  }

  async function handleAddItem() {
    if (!order) return;
    const draft = getValues("items")[0];
    const parsed = orderItemCreateSchema.safeParse(draft);
    if (!parsed.success) {
      setError("root", { message: parsed.error.issues[0]?.message ?? "Проверьте позицию" });
      return;
    }
    const result = await createItem({ orderId: order.id, workspaceId, input: parsed.data });
    if ("error" in result) {
      setError("root", {
        message: getQueryErrorMessage(result.error, "Не удалось добавить позицию"),
      });
      return;
    }
    reset({ ...getValues(), items: [{ ...EMPTY_ITEM }] });
  }

  async function handleDeleteItem(itemId: string) {
    if (!order) return;
    if (order.items.length <= 1) {
      setError("root", { message: "В заказе должна остаться хотя бы одна позиция" });
      return;
    }
    const result = await deleteItem({ id: itemId, workspaceId });
    if ("error" in result) {
      setError("root", {
        message: getQueryErrorMessage(result.error, "Не удалось удалить позицию"),
      });
    }
  }

  async function handleDeleteOrder() {
    if (!order) return;
    const result = await deleteOrder({ id: order.id, workspaceId });
    if ("error" in result) {
      setError("root", { message: getQueryErrorMessage(result.error, "Не удалось удалить заказ") });
      return;
    }
    onClose();
  }

  const noClients = clients.length === 0;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Редактировать заказ" : "Новый заказ"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {noClients ? (
          <p className="text-sm text-amber-700">Сначала добавьте клиента на странице «Клиенты».</p>
        ) : null}
        <div>
          <Label htmlFor="order-client">Клиент</Label>
          <Select id="order-client" disabled={submitting || noClients} {...register("client_id")}>
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          {errors.client_id ? (
            <p className="mt-1 text-xs text-red-600">{errors.client_id.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="order-number">Номер</Label>
          <Input
            id="order-number"
            disabled={submitting}
            invalid={Boolean(errors.order_number)}
            {...register("order_number")}
          />
          {errors.order_number ? (
            <p className="mt-1 text-xs text-red-600">{errors.order_number.message}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="order-price">Цена</Label>
            <Input
              id="order-price"
              type="number"
              min="0"
              step="0.01"
              disabled={submitting}
              {...register("total_price")}
            />
          </div>
          <div>
            <Label htmlFor="order-cost">Себестоимость</Label>
            <Input
              id="order-cost"
              type="number"
              min="0"
              step="0.01"
              disabled={submitting}
              {...register("calculated_cost")}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" disabled={submitting} {...register("is_paid")} />
          Оплачен
        </label>

        {isEdit && order ? (
          <div className="rounded-md border border-slate-200 p-3">
            <p className="mb-2 text-sm font-medium text-slate-800">Позиции</p>
            <ul className="flex flex-col gap-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {item.name} × {item.quantity} ({TECHNOLOGY_LABELS[item.technology]})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => void handleDeleteItem(item.id)}
                  >
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Input placeholder="Название" disabled={submitting} {...register("items.0.name")} />
              <Input
                type="number"
                min="1"
                disabled={submitting}
                {...register("items.0.quantity")}
              />
              <Select disabled={submitting} {...register("items.0.technology")}>
                {PRINTER_TECHNOLOGIES.map((tech) => (
                  <option key={tech} value={tech}>
                    {TECHNOLOGY_LABELS[tech]}
                  </option>
                ))}
              </Select>
              <Select disabled={submitting} {...register("items.0.material_id")}>
                <option value="">Без материала</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              disabled={submitting}
              onClick={() => void handleAddItem()}
            >
              Добавить позицию
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 p-3">
            <p className="mb-2 text-sm font-medium text-slate-800">Позиции</p>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="mb-3 grid grid-cols-2 gap-2 border-b border-slate-100 pb-3 last:mb-0 last:border-0"
              >
                <Input
                  placeholder="Название"
                  disabled={submitting}
                  {...register(`items.${index}.name`)}
                />
                <Input
                  type="number"
                  min="1"
                  disabled={submitting}
                  {...register(`items.${index}.quantity`)}
                />
                <Select disabled={submitting} {...register(`items.${index}.technology`)}>
                  {PRINTER_TECHNOLOGIES.map((tech) => (
                    <option key={tech} value={tech}>
                      {TECHNOLOGY_LABELS[tech]}
                    </option>
                  ))}
                </Select>
                <Select disabled={submitting} {...register(`items.${index}.material_id`)}>
                  <option value="">Без материала</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </Select>
                {fields.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    Убрать
                  </Button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ ...EMPTY_ITEM })}
            >
              Ещё позиция
            </Button>
            {errors.items ? (
              <p className="mt-2 text-xs text-red-600">
                {Array.isArray(errors.items)
                  ? errors.items[0]?.name?.message
                  : errors.items.message}
              </p>
            ) : null}
          </div>
        )}

        {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
        <div className="mt-2 flex justify-end gap-2">
          {isEdit ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => void handleDeleteOrder()}
              disabled={submitting}
            >
              Удалить заказ
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button type="submit" loading={submitting} disabled={noClients}>
            {isEdit ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
