import { RouterProvider } from "react-router-dom";
import { StoreProvider } from "./providers/StoreProvider";
import { SessionProvider } from "./providers/SessionProvider";
import { WorkspaceBootstrap } from "./providers/WorkspaceBootstrap";
import { router } from "./routes";

export function App() {
  return (
    <StoreProvider>
      <SessionProvider>
        <WorkspaceBootstrap />
        <RouterProvider router={router} />
      </SessionProvider>
    </StoreProvider>
  );
}
