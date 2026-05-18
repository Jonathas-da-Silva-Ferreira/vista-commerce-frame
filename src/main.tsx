import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Side-effect import: initializes i18next before any component renders so
// useTranslation() never sees an uninitialized instance.
import "./i18n";

async function boot() {
  // When no backend URL is configured, install simulated REST endpoints
  if (!import.meta.env.VITE_API_URL) {
    const { installMockServer } = await import("@/services/mockServer");
    installMockServer();
  }
  createRoot(document.getElementById("root")!).render(<App />);
}

boot();
