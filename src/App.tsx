import { useEffect, useState } from "react";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthProvider";
import LoginPage from "./features/auth/LoginPage";
import Layout from "./components/Layout";
import RecipesPage from "./features/recipes/RecipesPage";
import NewRecipePage from "./features/recipes/NewRecipePage";
import RecipeDetailPage from "./features/recipes/RecipeDetailPage";
import EditRecipePage from "./features/recipes/EditRecipePage";
import GroupsPage from "./features/groups/GroupsPage";
import { useKeyboardAvoidance } from "./lib/useKeyboardAvoidance";

const DOOR_MS = 2200;

type Phase = "init" | "login" | "opening" | "app";

function Protected() {
  const { session, loading, recovery } = useAuth();
  const [phase, setPhase] = useState<Phase>("init");

  const next: Phase = loading
    ? phase
    : !session || recovery
      ? "login"
      : phase === "login"
        ? "opening"
        : phase === "init"
          ? "app"
          : phase;
  if (next !== phase) setPhase(next);

  useEffect(() => {
    if (phase !== "opening") return;
    const t = setTimeout(() => setPhase("app"), DOOR_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "init") return null;

  return (
    <>
      {phase !== "login" && (
        <div className={phase === "opening" ? "enter-app" : undefined}>
          <Layout />
        </div>
      )}
      {(phase === "login" || phase === "opening") && (
        <LoginPage open={phase === "opening"} />
      )}
    </>
  );
}

const router = createHashRouter([
  {
    element: <Protected />,
    children: [
      { index: true, element: <RecipesPage /> },
      { path: "recettes/nouvelle", element: <NewRecipePage /> },
      { path: "recettes/:id", element: <RecipeDetailPage /> },
      { path: "recettes/:id/modifier", element: <EditRecipePage /> },
      { path: "famiglie", element: <GroupsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" /> },
]);

export default function App() {
  useKeyboardAvoidance();
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
