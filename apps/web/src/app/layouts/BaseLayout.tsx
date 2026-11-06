import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/sidebar";
import { Header } from "@/widgets/header";

export function BaseLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
