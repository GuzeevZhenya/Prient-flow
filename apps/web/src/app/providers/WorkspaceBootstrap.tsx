import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSessionUser } from "@/entities/session";
import { useEnsureWorkspaceMutation } from "@/entities/workspace";

/** Создаёт workspace владельца, если после входа/регистрации его ещё нет. */
export function WorkspaceBootstrap() {
  const user = useSelector(selectSessionUser);
  const [ensureWorkspace] = useEnsureWorkspaceMutation();

  useEffect(() => {
    if (!user) return;
    void ensureWorkspace({ ownerId: user.id, name: "Мастерская" });
  }, [user, ensureWorkspace]);

  return null;
}
