import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectSessionUser } from "@/entities/session";
import { useGetWorkspaceByOwnerQuery } from "@/entities/workspace";
import { useGetOrdersQuery } from "@/entities/order";
import { useGetMaterialsQuery } from "@/entities/material";
import { useGetPrintersQuery } from "@/entities/printer";
import { useGetClientsQuery } from "@/entities/client";
import { WorkshopOverview } from "@/widgets/workshop-overview";
import { getQueryErrorMessage } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { Button, Spinner } from "@/shared/ui";

export function DashboardPage() {
  const user = useSelector(selectSessionUser);
  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceFailed,
    error: workspaceError,
  } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);

  const workspaceArg = workspace ? { workspaceId: workspace.id } : skipToken;
  const ordersQuery = useGetOrdersQuery(workspaceArg);
  const materialsQuery = useGetMaterialsQuery(workspaceArg);
  const printersQuery = useGetPrintersQuery(workspaceArg);
  const clientsQuery = useGetClientsQuery(workspaceArg);

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
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="mt-4 text-sm text-red-600">
          {workspaceFailed
            ? getQueryErrorMessage(workspaceError, "Не удалось загрузить workspace")
            : "Для текущего пользователя нет workspace"}
        </p>
      </section>
    );
  }

  const loading =
    ordersQuery.isLoading ||
    materialsQuery.isLoading ||
    printersQuery.isLoading ||
    clientsQuery.isLoading;
  const failed =
    ordersQuery.isError || materialsQuery.isError || printersQuery.isError || clientsQuery.isError;

  if (loading) {
    return (
      <section className="flex justify-center py-16">
        <Spinner size="lg" />
      </section>
    );
  }

  if (failed) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="mt-4 text-sm text-red-600">
          {getQueryErrorMessage(
            ordersQuery.error ?? materialsQuery.error ?? printersQuery.error ?? clientsQuery.error,
            "Не удалось загрузить сводку цеха",
          )}
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => {
            void ordersQuery.refetch();
            void materialsQuery.refetch();
            void printersQuery.refetch();
            void clientsQuery.refetch();
          }}
        >
          Повторить
        </Button>
      </section>
    );
  }

  const orders = ordersQuery.data ?? [];
  const materials = materialsQuery.data ?? [];
  const printers = printersQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const empty = orders.length === 0 && materials.length === 0 && printers.length === 0;

  return (
    <section>
      {empty ? (
        <div className="mb-6 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-8">
          <p className="font-medium text-slate-800">Цех пока пустой</p>
          <p className="mt-1 text-sm text-slate-500">
            Чтобы сразу увидеть, как выглядит живая мастерская, заполни демо-данные в настройках.
          </p>
          <Link
            to={ROUTES.settings}
            className="mt-4 inline-flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
          >
            Заполнить демо-цех
          </Link>
        </div>
      ) : null}
      <WorkshopOverview
        workspaceName={workspace.name}
        currency={workspace.settings.currency}
        orders={orders}
        materials={materials}
        printers={printers}
        clientCount={clients.length}
      />
    </section>
  );
}
