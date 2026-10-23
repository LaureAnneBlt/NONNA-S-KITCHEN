import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
const missing =
  !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (missing) {
  root.render(
    <p className="p-6">
      ⚠️ Configuration manquante : les secrets VITE_SUPABASE_URL et
      VITE_SUPABASE_ANON_KEY ne sont pas présents dans ce build.
    </p>,
  );
} else {
  import("./App").then(({ default: App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  );
}
