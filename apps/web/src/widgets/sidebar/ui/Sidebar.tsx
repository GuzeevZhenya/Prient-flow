import { NavLink } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Дашборд" },
  { to: ROUTES.orders, label: "Заказы" },
  { to: ROUTES.inventory, label: "Склад" },
  { to: ROUTES.printers, label: "Принтеры" },
  { to: ROUTES.clients, label: "Клиенты" },
  { to: ROUTES.settings, label: "Настройки" },
] as const;

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <div className="mb-6 text-lg font-bold">🖨️ Prient-flow</div>
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
