import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// When no backend URL is configured, install simulated REST endpoints
if (!import.meta.env.VITE_API_URL) {
  import("@/services/mockServer").then(({ installMockServer }) => installMockServer());
}

createRoot(document.getElementById("root")!).render(<App />);
