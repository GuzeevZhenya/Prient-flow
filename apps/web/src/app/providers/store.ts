import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/shared/api/baseApi";
import { sessionReducer } from "@/entities/session";
import "@/entities/workspace";
import "@/entities/material";
import "@/entities/client";
import "@/entities/order";
import "@/entities/printer";
import "@/features/demo-seed";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
