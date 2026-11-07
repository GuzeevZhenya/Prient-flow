import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Дашборд" },
  { to: ROUTES.orders, label: "Заказы" },
  { to: ROUTES.inventory, label: "Склад" },
  { to: ROUTES.printers, label: "Принтеры" },
  { to: ROUTES.clients, label: "Клиенты" },
  { to: ROUTES.calculator, label: "Калькулятор" },
  { to: ROUTES.settings, label: "Настройки" },
] as const;

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <Link to={ROUTES.dashboard} className="mb-6 block">
        <div className="text-lg font-bold text-slate-900">Prient-flow</div>
        <p className="mt-0.5 text-xs text-slate-500">Цех 3D-печати и покраса</p>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.dashboard}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-slate-900 font-medium text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
