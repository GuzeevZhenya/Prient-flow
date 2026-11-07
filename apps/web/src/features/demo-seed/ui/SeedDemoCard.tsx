import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { selectSessionUser } from "@/entities/session";
import { useGetWorkspaceByOwnerQuery } from "@/entities/workspace";
import { getQueryErrorMessage } from "@/shared/api";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useSeedDemoWorkshopMutation } from "../api/seedDemoApi";
import { DEMO_WORKSHOP_NAME } from "../lib/catalog";

export function SeedDemoCard() {
  const user = useSelector(selectSessionUser);
  const { data: workspace } = useGetWorkspaceByOwnerQuery(user?.id ?? skipToken);
  const [seedDemo, { isLoading }] = useSeedDemoWorkshopMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function handleSeed() {
    if (!workspace) return;
    setMessage(null);
    setFailed(false);
    const result = await seedDemo({ workspaceId: workspace.id });
    if ("error" in result) {
      setFailed(true);
      setMessage(getQueryErrorMessage(result.error, "Не удалось заполнить демо-цех"));
      return;
    }
    if (result.data.status === "already") {
      setMessage(`Демо уже есть: заказы с префиксом DEMO- и название «${DEMO_WORKSHOP_NAME}».`);
      return;
    }
    setMessage(
      "Готово: клиенты, склад, парк принтеров и канбан заполнены. Открой дашборд и заказы.",
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Демо-цех</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Подставляет живой пример мастерской: 6 клиентов, 9 позиций склада, 6 принтеров и 14
          заказов по всем колонкам канбана. Можно нажать один раз.
        </p>
        <Button className="mt-4" onClick={() => void handleSeed()} loading={isLoading}>
          Заполнить демо-цех
        </Button>
        {message ? (
          <p className={`mt-3 text-sm ${failed ? "text-red-600" : "text-slate-600"}`}>{message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
