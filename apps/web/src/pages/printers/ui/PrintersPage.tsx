import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectSessionUser } from "@/entities/session";
import { useGetWorkspaceByOwnerQuery } from "@/entities/workspace";
import {
  CONNECTION_TYPE_LABELS,
  PRINTER_STATUS_LABELS,
  useGetPrintersQuery,
  type Printer,
} from "@/entities/printer";
import { getQueryErrorMessage } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { Badge, Button, Spinner } from "@/shared/ui";

function statusVariant(status: Printer["status"]): "success" | "warning" | "danger" | "default" {
  if (status === "printing") return "success";
  if (status === "paused") return "warning";
  if (status === "error") return "danger";
  return "default";
}

export function PrintersPage() {
  const user = useSelector(selectSessionUser);
  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceFailed,
    error: workspaceError,
  } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);

  const {
    data: printers,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPrintersQuery(workspace ? { workspaceId: workspace.id } : skipToken);

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
        <h1 className="text-2xl font-bold">Принтеры</h1>
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
      <div>
        <h1 className="text-2xl font-bold">Принтеры</h1>
        <p className="mt-1 text-slate-500">
          Парк: кто свободен, кто печатает, кто упал. Живые команды и телеметрия — этап 6.
        </p>
      </div>

      {isError ? (
        <div className="mt-6">
          <p className="text-sm text-red-600">
            {getQueryErrorMessage(error, "Не удалось загрузить принтеры")}
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

      {!isLoading && !isError && printers && printers.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-700">В парке пока нет принтеров</p>
          <p className="mt-1 text-sm text-slate-500">
            Заполни демо-цех в настройках — появятся Bambu, Voron и Photon.
          </p>
          <Link
            to={ROUTES.settings}
            className="mt-4 inline-flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
          >
            Открыть настройки
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && printers && printers.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {printers.map((printer) => (
            <article
              key={printer.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium text-slate-900">{printer.name}</h2>
                <Badge variant={statusVariant(printer.status)}>
                  {PRINTER_STATUS_LABELS[printer.status]}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {printer.technology} · {CONNECTION_TYPE_LABELS[printer.connection_type]}
              </p>
              <p className="mt-1 text-sm text-slate-500">{printer.local_ip ?? "IP не задан"}</p>
              <p className="mt-3 text-xs text-slate-500">
                {printer.power_watts ?? "—"} Вт · амортизация {printer.depreciation_per_hour ?? "—"}{" "}
                / час
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
