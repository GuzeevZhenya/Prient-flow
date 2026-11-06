import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { WorkspaceSettingsForm } from "@/features/workspace-settings";

export function SettingsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Настройки</h1>
      <p className="mt-2 text-slate-500">
        Тарифы мастерской: стоимость кВт⋅ч, маржа, часовой тариф, валюта.
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Тарифы workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkspaceSettingsForm />
        </CardContent>
      </Card>
    </section>
  );
}
