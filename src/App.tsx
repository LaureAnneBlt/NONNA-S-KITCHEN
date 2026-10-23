import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import LoginPage from './features/auth/LoginPage';
import Layout from './components/Layout';
import RecipesPage from './features/recipes/RecipesPage';
import NewRecipePage from './features/recipes/NewRecipePage';
import GroupsPage from './features/groups/GroupsPage';
import { useKeyboardAvoidance } from './lib/useKeyboardAvoidance';

const DOOR_MS = 2200; // doit couvrir la durée de l'animation des portes (index.css)

type Phase = 'init' | 'login' | 'opening' | 'app';

/**
 * Machine à états :  init → login → opening (portes qui s'ouvrent) → app
 * Si la personne est déjà connectée au lancement : init → app, sans les portes.
 */
function Protected() {
  const { session, loading } = useAuth();
  const [phase, setPhase] = useState<Phase>('init');

  const next: Phase = loading ? phase
    : !session ? 'login'
    : phase === 'login' ? 'opening'
    : phase === 'init' ? 'app'
    : phase;
  if (next !== phase) setPhase(next);

  useEffect(() => {
    if (phase !== 'opening') return;
    const t = setTimeout(() => setPhase('app'), DOOR_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'init') return <p className="p-6">…</p>;

  // Même position dans l'arbre pour LoginPage : il n'est pas remonté, les portes s'animent
  return (
    <>
      {phase !== 'login' && (
        <div className={phase === 'opening' ? 'enter-app' : undefined}><Layout /></div>
      )}
      {(phase === 'login' || phase === 'opening') && <LoginPage open={phase === 'opening'} />}
    </>
  );
}

// HashRouter : pas de 404 au rechargement sur GitHub Pages
export default function App() {
  useKeyboardAvoidance();
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Protected />}>
            <Route index element={<RecipesPage />} />
            <Route path="recettes/nouvelle" element={<NewRecipePage />} />
            <Route path="famiglie" element={<GroupsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
