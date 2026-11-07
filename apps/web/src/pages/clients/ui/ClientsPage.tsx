import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { selectSessionUser } from "@/entities/session";
import { useGetWorkspaceByOwnerQuery } from "@/entities/workspace";
import { useDeleteClientMutation, useGetClientsQuery, type Client } from "@/entities/client";
import { ClientFormDialog } from "@/features/client-form";
import { getQueryErrorMessage } from "@/shared/api";
import { Button, Spinner } from "@/shared/ui";

export function ClientsPage() {
  const user = useSelector(selectSessionUser);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceFailed,
    error: workspaceError,
  } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);

  const {
    data: clients,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClientsQuery(workspace ? { workspaceId: workspace.id } : skipToken);
  const [deleteClient, { isLoading: deleting }] = useDeleteClientMutation();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete(client: Client) {
    if (!workspace) return;
    setActionError(null);
    const result = await deleteClient({ id: client.id, workspaceId: workspace.id });
    if ("error" in result) {
      setActionError(getQueryErrorMessage(result.error, "Не удалось удалить клиента"));
    }
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
        <h1 className="text-2xl font-bold">Клиенты</h1>
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
          <h1 className="text-2xl font-bold">Клиенты</h1>
          <p className="mt-1 text-slate-500">База клиентов мастерской</p>
        </div>
        <Button onClick={openCreate}>Добавить клиента</Button>
      </div>

      {actionError ? <p className="mt-4 text-sm text-red-600">{actionError}</p> : null}

      {isError ? (
        <div className="mt-6">
          <p className="text-sm text-red-600">
            {getQueryErrorMessage(error, "Не удалось загрузить клиентов")}
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

      {!isLoading && !isError && clients && clients.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-700">Клиентов пока нет</p>
          <Button className="mt-4" onClick={openCreate}>
            Добавить клиента
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && clients && clients.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
                <th className="px-4 py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                  <td className="px-4 py-3 text-slate-600">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {client.telegram_username ?? client.telegram_chat_id ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setFormOpen(false);
                          setEditing(client);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleting}
                        onClick={() => void handleDelete(client)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ClientFormDialog
        open={formOpen || Boolean(editing)}
        onClose={closeForm}
        workspaceId={workspace.id}
        client={editing}
      />
    </section>
  );
}
