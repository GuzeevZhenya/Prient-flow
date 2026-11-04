import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";

export function NotFoundPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-500">Страница не найдена</p>
      <Link to={ROUTES.dashboard} className="text-blue-600 underline">
        На дашборд
      </Link>
    </section>
  );
}
