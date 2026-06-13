import { createRoot } from "react-dom/client";
// HelmetProvider must wrap the entire app so any <Helmet> inside a route
// can safely register tags without "no provider" errors during SSR/CSR.
import { HelmetProvider } from "react-helmet-async";
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
  createRoot(document.getElementById("root")!).render(
    // HelmetProvider lives OUTSIDE BrowserRouter (which is in App) — it has
    // no dependency on routing context, so placing it at the top guarantees
    // every page can override head tags per route.
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}

boot();
