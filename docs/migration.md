# Migration Path

## Stage 1 — Component extraction (already done)

Nav/footer are in `components/` and injected via `fetch()`. CSS tokens and shared rules are in `css/styles.css`.

## Stage 2 — Vite (static, no framework)

```bash
npm create vite@latest eco-architect -- --template vanilla
```

Move `css/styles.css` → `src/styles.css`, `js/` → `src/js/`. Components stay in `components/`. Vite handles cache-busting, HMR, and minification. HTML structure is unchanged.

## Stage 3 — Component model (React or Vue)

Only warranted if the site adds dynamic data (CMS portfolio, contact form with state). At that point each section becomes a component and `components/navbar.html` + `components/footer.html` become proper framework components.

**Do not add a framework for the DEMO alone.**
