import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useLocation } from "react-router-dom";
import { selectSessionStatus } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { Card, CardContent, CardHeader, CardTitle, Spinner } from "@/shared/ui";
import { LoginForm, RegisterForm } from "@/features/auth";

type AuthTab = "login" | "register";

export function LoginPage() {
  const status = useSelector(selectSessionStatus);
  const location = useLocation();
  const [tab, setTab] = useState<AuthTab>("login");

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
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="hidden flex-col justify-center bg-slate-900 px-12 py-16 text-slate-100 lg:flex">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-400">
          Prient-flow
        </p>
        <h1 className="mt-4 max-w-md text-3xl font-semibold leading-tight">
          Операционка 3D-печатной мастерской, а не склад таблиц
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
          Заказы, себестоимость, склад филамента и смолы, парк принтеров. Дальше — модель в
          браузере, Telegram-бот и мост к слайсеру.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-slate-200">
          <li>Канбан от черновика до выдачи и покраски</li>
          <li>Цена из материала, кВт⋅ч, амортизации и труда</li>
          <li>Остатки с порогом «пора заказать катушку»</li>
        </ul>
      </section>

      <div className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{tab === "login" ? "Вход в цех" : "Регистрация мастерской"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-500 lg:hidden">
              ERP для 3D-печати и покраса: заказы, склад, цена, принтеры.
            </p>
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm ${
                  tab === "login" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() => setTab("login")}
              >
                Вход
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm ${
                  tab === "register" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() => setTab("register")}
              >
                Регистрация
              </button>
            </div>
            {tab === "login" ? <LoginForm /> : <RegisterForm />}
            <p className="mt-4 text-center text-sm text-slate-500">
              <Link to={ROUTES.calculator} className="font-medium text-slate-800 underline">
                Открыть калькулятор
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
