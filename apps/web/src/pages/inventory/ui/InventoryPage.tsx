import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { isMaterialLowStock, type MaterialType } from "@prient-flow/shared";
import { selectSessionUser } from "@/entities/session";
import { useGetWorkspaceByOwnerQuery } from "@/entities/workspace";
import {
  formatAmount,
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_UNITS,
  useGetMaterialsQuery,
  type Material,
} from "@/entities/material";
import { MaterialFormDialog } from "@/features/material-form";
import { MaterialAdjustDialog } from "@/features/material-adjust";
import { getQueryErrorMessage } from "@/shared/api";
import { Badge, Button, Select, Spinner } from "@/shared/ui";

type TypeFilter = "all" | MaterialType;

export function InventoryPage() {
  const user = useSelector(selectSessionUser);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [adjusting, setAdjusting] = useState<Material | null>(null);

  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceFailed,
    error: workspaceError,
  } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);

  const materialsQueryArg =
    workspace && typeFilter === "all"
      ? { workspaceId: workspace.id }
      : workspace && typeFilter !== "all"
        ? { workspaceId: workspace.id, type: typeFilter }
        : skipToken;

  const {
    data: materials,
    isLoading: materialsLoading,
    isError: materialsFailed,
    error: materialsError,
    refetch,
  } = useGetMaterialsQuery(materialsQueryArg);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(material: Material) {
    setEditing(material);
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

  if (workspaceFailed) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Склад</h1>
        <p className="mt-4 text-sm text-red-600">
          {getQueryErrorMessage(workspaceError, "Не удалось загрузить workspace")}
        </p>
      </section>
    );
  }

  if (!workspace) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Склад</h1>
        <p className="mt-4 text-sm text-red-600">Для текущего пользователя нет workspace</p>
      </section>
    );
  }

  const loading = materialsLoading;
  const failed = materialsFailed;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Склад</h1>
          <p className="mt-1 text-slate-500">Катушки, смолы, краски и грунты</p>
        </div>
        <Button onClick={openCreate}>Добавить материал</Button>
      </div>

      <div className="mt-6 max-w-xs">
        <Select
          aria-label="Фильтр по типу"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
        >
          <option value="all">Все типы</option>
          {(Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[]).map((type) => (
            <option key={type} value={type}>
              {MATERIAL_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </div>

      {failed ? (
        <div className="mt-6">
          <p className="text-sm text-red-600">
            {getQueryErrorMessage(materialsError, "Не удалось загрузить склад")}
          </p>
          <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>
            Повторить
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : null}

      {!loading && !failed && materials && materials.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-700">На складе пока нет материалов</p>
          <p className="mt-1 text-sm text-slate-500">Добавьте катушку, смолу, краску или грунт</p>
          <Button className="mt-4" onClick={openCreate}>
            Добавить материал
          </Button>
        </div>
      ) : null}

      {!loading && !failed && materials && materials.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Бренд</th>
                <th className="px-4 py-3 font-medium">Цвет</th>
                <th className="px-4 py-3 font-medium">Остаток</th>
                <th className="px-4 py-3 font-medium">Порог</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => {
                const low = isMaterialLowStock(
                  material.remaining_amount,
                  material.low_stock_threshold,
                );
                const unit = MATERIAL_TYPE_UNITS[material.type];
                return (
                  <tr
                    key={material.id}
                    className={`border-b border-slate-100 last:border-0 ${low ? "bg-red-50" : ""}`}
                  >
                    <td className="px-4 py-3">{MATERIAL_TYPE_LABELS[material.type]}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        {material.name}
                        {low ? <Badge variant="danger">Мало</Badge> : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{material.brand ?? "—"}</td>
                    <td className="px-4 py-3">
                      {material.color_hex ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-slate-200"
                            style={{ backgroundColor: material.color_hex }}
                            aria-hidden
                          />
                          {material.color_hex}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {formatAmount(material.remaining_amount)} {unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatAmount(material.low_stock_threshold)} {unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatAmount(material.cost_per_unit)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setAdjusting(material)}
                        >
                          Остаток
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(material)}>
                          Изменить
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <MaterialFormDialog
        open={formOpen}
        onClose={closeForm}
        workspaceId={workspace.id}
        material={editing}
      />
      <MaterialAdjustDialog
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        workspaceId={workspace.id}
        material={adjusting}
      />
    </section>
  );
}
