/** Единый реестр маршрутов приложения. Хардкод путей в компонентах запрещён. */
export const ROUTES = {
  dashboard: "/",
  orders: "/orders",
  inventory: "/inventory",
  printers: "/printers",
  clients: "/clients",
  settings: "/settings",
  calculator: "/calc",
  login: "/login",
} as const;
