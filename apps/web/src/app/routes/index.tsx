import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { BaseLayout } from "../layouts/BaseLayout";
import { RequireAuth } from "./RequireAuth";
import { DashboardPage } from "@/pages/dashboard";
import { OrdersPage } from "@/pages/orders";
import { InventoryPage } from "@/pages/inventory";
import { PrintersPage } from "@/pages/printers";
import { ClientsPage } from "@/pages/clients";
import { SettingsPage } from "@/pages/settings";
import { CalculatorPage } from "@/pages/calculator";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";

export const router = createBrowserRouter([
  // Админка — только для авторизованных
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.dashboard,
        element: <BaseLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: ROUTES.orders, element: <OrdersPage /> },
          { path: ROUTES.inventory, element: <InventoryPage /> },
          { path: ROUTES.printers, element: <PrintersPage /> },
          { path: ROUTES.clients, element: <ClientsPage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: ROUTES.login, element: <LoginPage /> },
  // Публичный калькулятор для клиентов — вне админ-лейаута
  { path: ROUTES.calculator, element: <CalculatorPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
