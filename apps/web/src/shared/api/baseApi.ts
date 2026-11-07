import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Базовый RTK Query API. Эндпоинты добавляются в слайсах entities/features
 * через `baseApi.injectEndpoints()` (Спринты 2.3–2.4).
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Workspace", "Material", "Client", "Order", "Printer"],
  endpoints: () => ({}),
});
