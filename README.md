# 🍅 Nonna Mia
Partage de recettes en famille. React + Vite + Tailwind v4 + Supabase, déployé sur GitHub Pages.

## Lancer en local
1. Crée un projet sur supabase.com, puis exécute `supabase/schema.sql` dans le SQL Editor.
2. `cp .env.example .env` et renseigne URL + clé anon (Project Settings > API).
3. `npm install && npm run dev`

## Déployer
Repo GitHub > Settings > Pages > Source: GitHub Actions. Ajoute les secrets
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis push sur `main`.
Dans Supabase > Authentication > URL Configuration, mets l'URL GitHub Pages en Site URL.

## Structure
src/features/{auth,recipes,groups} : une feature = pages + api.
src/lib : client Supabase et hooks utilitaires. src/components : UI partagée.

## Design system
Tout est dans `src/index.css` (`@theme`) : primitives (tomato-500…) puis tokens sémantiques
(`bg-canvas`, `text-primary`, `border-line`…). Les composants n'utilisent que les sémantiques.

## PWA
Config dans `vite.config.ts`, icônes dans `public/`. Android/Chrome : bouton « Installer ».
iOS : Safari > Partager > Sur l'écran d'accueil.
