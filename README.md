# Dari.dz — Immobilier en Algérie

## Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer ton projet Supabase
- Va sur https://supabase.com → New project
- Région : **Europe (Frankfurt)** — la plus proche de l'Algérie
- Copie tes clés depuis : Settings → API

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```
Puis remplis `.env.local` avec tes vraies clés Supabase.

### 4. Créer les tables en base
- Va sur Supabase → **SQL Editor**
- Copie-colle le contenu de `supabase-schema.sql`
- Clique **Run**

### 5. Lancer le projet
```bash
npm run dev
```

Ouvre http://localhost:3000 — tu dois voir un indicateur vert "Supabase connecté".

---

## Structure du projet

```
src/
├── app/             # Pages (Next.js App Router)
├── components/      # Composants réutilisables
├── lib/supabase/    # Clients Supabase (server + client)
├── types/           # Types TypeScript
└── middleware.ts    # Protection des routes auth
```

## Stack

- **Frontend** : Next.js 15 + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Vercel (frontend) + Supabase Cloud (backend)
