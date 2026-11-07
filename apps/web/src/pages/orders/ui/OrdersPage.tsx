import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { selectSessionUser } from "@/entities/session";
import { useGetWorkspaceByOwnerQuery } from "@/entities/workspace";
import { useGetClientsQuery } from "@/entities/client";
import { useGetMaterialsQuery } from "@/entities/material";
import { useGetOrdersQuery, type Order } from "@/entities/order";
import { OrderFormDialog } from "@/features/order-form";
import { KanbanBoard } from "@/widgets/kanban-board";
import { getQueryErrorMessage } from "@/shared/api";
import { Button, Spinner } from "@/shared/ui";

export function OrdersPage() {
  const user = useSelector(selectSessionUser);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceFailed,
    error: workspaceError,
  } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);

  const workspaceArg = workspace ? { workspaceId: workspace.id } : skipToken;
  const { data: orders, isLoading, isError, error, refetch } = useGetOrdersQuery(workspaceArg);
  const { data: clients } = useGetClientsQuery(workspaceArg);
  const { data: materials } = useGetMaterialsQuery(workspaceArg);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  if (workspaceLoading) {
    return (
      <section className="flex justify-center py-16">
        <Spinner size="lg" />
      </section>
    );
  }

  if (workspaceFailed || !workspace) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Заказы</h1>
        <p className="mt-4 text-sm text-red-600">
          {workspaceFailed
            ? getQueryErrorMessage(workspaceError, "Не удалось загрузить workspace")
            : "Для текущего пользователя нет workspace"}
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="mt-1 text-slate-500">
            Очередь цеха: просчёт → печать → постобработка → покраска → выдача. Карточку можно
            перетащить.
          </p>
        </div>
        <Button onClick={openCreate}>Новый заказ</Button>
      </div>

      {isError ? (
        <div className="mt-6">
          <p className="text-sm text-red-600">
            {getQueryErrorMessage(error, "Не удалось загрузить заказы")}
          </p>
          <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>
            Повторить
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : null}

      {!isLoading && !isError && orders ? (
        <div className="mt-6">
          {orders.length === 0 ? (
            <div className="mb-6 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
              <p className="text-slate-700">Заказов пока нет — колонки ниже пустые</p>
            </div>
          ) : null}
          <KanbanBoard workspaceId={workspace.id} orders={orders} onEdit={setEditing} />
        </div>
      ) : null}

      <OrderFormDialog
        open={formOpen || Boolean(editing)}
        onClose={closeForm}
        workspaceId={workspace.id}
        order={editing}
        clients={clients ?? []}
        materials={materials ?? []}
      />
    </section>
  );
}
