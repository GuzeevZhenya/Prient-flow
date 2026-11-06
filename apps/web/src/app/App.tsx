import { RouterProvider } from "react-router-dom";
import { StoreProvider } from "./providers/StoreProvider";
import { SessionProvider } from "./providers/SessionProvider";
import { router } from "./routes";

export function App() {
  return (
    <StoreProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </StoreProvider>
  );
}
