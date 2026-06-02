# ForgeBurn — Carry the Zero

**A debt chain breaker.** Track your loans, visualize payoff strategies, break your chains.

Built with Vite + React + Dexie.js. All data stays in your browser (IndexedDB) — zero backend, works offline.

## Local development

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Deploy

Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically.

## Tech stack

- React 18 + Vite 6
- Dexie.js (IndexedDB for local storage)
- TanStack Query (data fetching)
- Framer Motion (animations)
- Tailwind CSS (styling)
- shadcn/ui components
