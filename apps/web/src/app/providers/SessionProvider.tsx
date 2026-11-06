import { useEffect, type PropsWithChildren } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "@/shared/api";
import { sessionSet, sessionCleared } from "@/entities/session";

/** Подписывает Redux-сессию на состояние Supabase Auth. */
export function SessionProvider({ children }: PropsWithChildren) {
  const dispatch = useDispatch();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        dispatch(sessionSet({ id: user.id, email: user.email ?? "" }));
      } else {
        dispatch(sessionCleared());
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        dispatch(sessionSet({ id: user.id, email: user.email ?? "" }));
      } else {
        dispatch(sessionCleared());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return children;
}
