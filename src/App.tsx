import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import LoginPage from './features/auth/LoginPage';
import Layout from './components/Layout';
import RecipesPage from './features/recipes/RecipesPage';
import NewRecipePage from './features/recipes/NewRecipePage';
import GroupsPage from './features/groups/GroupsPage';

function Protected() {
  const { session, loading } = useAuth();
  if (loading) return <p className="p-6">…</p>;
  return session ? <Layout /> : <LoginPage />;
}

// HashRouter : pas de 404 au rechargement sur GitHub Pages
export default function App() {
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
