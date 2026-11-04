import { RouterProvider } from "react-router-dom";
import { StoreProvider } from "./providers/StoreProvider";
import { router } from "./routes";

export function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  );
}
