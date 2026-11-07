import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SessionUser {
  id: string;
  email: string;
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionState {
  user: SessionUser | null;
  status: SessionStatus;
}

const initialState: SessionState = {
  user: null,
  status: "loading",
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionSet(state, action: PayloadAction<SessionUser>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    sessionCleared(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { sessionSet, sessionCleared } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;

// Селекторы типизированы минимальной формой состояния, чтобы entities
// не импортировал RootState из app-слоя (FSD: импорты только вниз).
export const selectSessionStatus = (state: { session: SessionState }) => state.session.status;
export const selectSessionUser = (state: { session: SessionState }) => state.session.user;
