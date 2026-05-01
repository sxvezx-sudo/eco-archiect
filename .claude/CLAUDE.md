# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

Production DEMO website for **Eco Architect Co.,Ltd.**, a Thai architecture firm based in Phuket. Four static HTML pages share a common CSS file and JavaScript-injected nav/footer components. No build step, no framework — deploy to any static host.

---

## Development

**A local HTTP server is required** — `fetch()` in `components.js` does not work with `file://` protocol:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or `:8080`). Browser DevTools responsive mode at 390px, 768px, 1024px, 1440px is the primary testing tool.

---

## File Structure

- `*.html` (root) — page files
- `components/navbar.html`, `components/footer.html` — fragments injected at runtime
- `css/styles.css` — **shared styles only** (tokens, reset, nav, footer, buttons).
  Page-specific styles go in the HTML's `<style>` block.
- `js/components.js` — nav/footer injection + active link
- `js/main.js` — page-specific JS only (currently: index portfolio CTA switcher)
- `docs/` — reference docs (read on-demand per pointers in this file)


## Reusable Components

Before creating any UI element, check if a similar one already exists.
- Extend or generalize existing components instead of duplicating them
- Use props to handle variations (title, image, tags, actions, etc.)
- All shared components live in `/components/ui/`
- One change should only require editing one file

Injected at runtime via `components.js` into `<div data-component="navbar/footer">` placeholders.
- **Never** write nav/footer HTML inline in pages
- To edit: modify `components/navbar.html` or `components/footer.html` only
- To add a new page: see `docs/components.md`

Ask yourself: *"If this needs to change, how many files do I touch?"*
If more than one → make it a shared component.

### Active-link logic

`components.js` derives the active nav link from `window.location.pathname`.

Convention: detail pages inherit their parent's active link
(e.g., `project-detail.html` → "ผลงาน" because it's a child of projects).

## Class Naming Consistency

Before writing a new class, check if the same section already exists on another page.
- Same section = same base class, always
- Layout variations use a modifier: `.block--home`, `.block--page`
- Never name a class after the page it appears on (no `.about`, `.home`, `.index`)
- Name classes by **what it is**, not **where it lives**

---

## Image Sizing

Never use fixed `height` on images. Always use `aspect-ratio`:
- Landscape → `16/9` · Portrait → `3/4` · Square → `1/1`
- Container: `overflow: hidden` · Image: `width/height: 100%; object-fit: cover`
- Do not change `aspect-ratio` at any breakpoint
- Do not touch `.proj-card-img` or `.media-cell`

---

## Design System

For all CSS tokens (colors, typography, spacing, grid, buttons), read `docs/design-tokens.md` before writing CSS.

Critical rules that apply every session:
- Never hardcode a value that already has a token in `:root`
- Every section uses `display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--sp-gap)`
- Section padding is always `var(--sp-xl) var(--sp-margin)`
- Mobile collapse: `grid-column: 1 / -1` inside `@media (max-width: 768px)`

---

## Responsive Breakpoints

Shared nav/footer/token overrides live in `css/styles.css`. Page-specific layout overrides live in the HTML file's `<style>` block.

| Block | Query | Target |
|---|---|---|
| Default | (none) | ≥ 1440px desktop |
| Tablet | `(min-width: 769px) and (max-width: 1023px)` | iPad landscape |
| Laptop | `(min-width: 1024px) and (max-width: 1439px)` | MacBook |
| Mobile | `(max-width: 768px)` | iPhone (~390px) |

---

## Nav & Footer Conventions

- **Logo** is `<a class="nav-logo" href="index.html">` — always links home
- **ผลงาน** nav link → `projects.html`
- **ผลงาน** footer link → `projects.html`
- **บริการ / ติดต่อ** → `href="#"` (pages not yet built)
- `active` class is added dynamically by `js/components.js`, not hardcoded in HTML

---

## Page Structure

All sections live inside `<div class="page">` (max-width: 1440px, centered).
Footer (`<div data-component="footer">`) is **outside** `.page`.

---

## Migration

Do not add a framework for this DEMO. If migration to Vite or React/Vue is needed, see `docs/migration.md`.
