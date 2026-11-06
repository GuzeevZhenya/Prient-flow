import { useState } from "react";
import { supabase } from "@/shared/api";
import { Button } from "@/shared/ui";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} loading={loading}>
      Выйти
    </Button>
  );
}
