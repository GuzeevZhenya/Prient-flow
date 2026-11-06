import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectSessionStatus } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { Card, CardContent, CardHeader, CardTitle, Spinner } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginPage() {
  const status = useSelector(selectSessionStatus);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === "authenticated") {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? ROUTES.dashboard} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Вход в Prient-flow</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
