import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./app/styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Не найден #root элемент в index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
