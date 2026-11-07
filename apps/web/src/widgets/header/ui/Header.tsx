import { useSelector } from "react-redux";
import { selectSessionUser } from "@/entities/session";
import { LogoutButton } from "@/features/auth";

export function Header() {
  const user = useSelector(selectSessionUser);

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <span className="text-sm text-slate-500">ERP мастерской 3D-печати и покраса</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">{user?.email ?? ""}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
