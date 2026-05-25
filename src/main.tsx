import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Bootstraps the app. We install a mock REST layer only when no real backend
// URL is configured so the same components work against either source without
// extra branching at the call sites.
async function boot() {
  if (!import.meta.env.VITE_API_URL) {
    const { installMockServer } = await import("@/services/mockServer");
    installMockServer();
  }
  createRoot(document.getElementById("root")!).render(<App />);
}

boot();
