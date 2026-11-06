import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectSessionStatus } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { Spinner } from "@/shared/ui";

/** Защита админских роутов: без сессии — редирект на /login с возвратом. */
export function RequireAuth() {
  const status = useSelector(selectSessionStatus);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
