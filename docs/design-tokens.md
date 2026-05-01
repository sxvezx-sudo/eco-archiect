# Design Tokens

## Colors

All tokens declared on `:root` in `css/styles.css`. Never hardcode a hex that has a token.

```css
--c-bg:          #f9f9f9   /* Page background, nav fill, open-menu overlay */
--c-bg-inv:      #000000
--c-text:        #000000
--c-text-inv:    #f9f9f9
--c-muted:       #808080   /* Secondary copy */
--c-brand:       #8c9271   /* Sage green — CTAs, eyebrow icon */
--c-border:      #000000
--c-divider:     #000000
--c-divider-sec: #aaaaaa
--c-inv-sec:     #555555   /* Dividers on dark surfaces (footer nav) */
```

## Typography

| Token | Family | Usage |
|---|---|---|
| `--font` | `'Noto Sans Thai'` | Headings, labels, UI copy, nav links |
| `--font-loop` | `'Noto Sans Thai Looped'` | Body paragraphs, captions, footer copy |

### Type Scale

Fluid sizing via `clamp()`, anchored 390px → 1440px:

| Token | Min | Max | Usage |
|---|---|---|---|
| `--fs-h1` | 2.5rem | 6rem | Hero heading |
| `--fs-h2a` | 1.5rem | 3rem | About, Testimonial, Studio headings |
| `--fs-h2b` | 2.25rem | 4rem | Portfolio heading |
| `--fs-body` | 1rem | 1rem | Body text (fixed) |
| `--fs-label` | 1rem | 1rem | Buttons, nav links, eyebrows (fixed) |

Each `--fs-*` has matching `--lh-*` (line-height) and `--ls-*` (letter-spacing). Always set all three together.

## Spacing Scale

Re-declared inside each breakpoint block in `css/styles.css`.

| Token | Desktop | Tablet | Mobile | Role |
|---|---|---|---|---|
| `--sp-margin` | 1rem | 1rem | 1rem | Left/right page edge padding |
| `--sp-xxxl` | 6rem | 4.5rem | 4rem | Section top padding / nav clearance |
| `--sp-xl` | 4rem | 2.5rem | 2rem | Section bottom padding |
| `--sp-md` | 2rem | 1.5rem | 2rem | Inter-element gaps |
| `--sp-sm` | 1rem | 1rem | 1rem | Small gaps |
| `--sp-xs` | 0.5rem | — | 0.5rem | Tight gaps (icons, eyebrow) |
| `--sp-gap` | 1rem | 1rem | 1rem | CSS grid column gap |

## Grid System

Every section uses a 12-column CSS grid:

```css
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: var(--sp-gap);
```

### Adding a new section

1. Add `<section>` inside `<div class="page">`, before `</div>`
2. Use `padding: var(--sp-xl) var(--sp-margin)` to match other sections
3. Create inner grid wrapper with 12-col grid
4. Assign `grid-column` spans to children for desktop
5. In `@media (max-width: 768px)` in the page's `<style>` block, collapse to `grid-column: 1 / -1`

## Button Utilities

Defined in `css/styles.css`, available on every page.

| Class | Appearance | Usage |
|---|---|---|
| `.btn-text` | Bare text + icon, black | Inline CTAs |
| `.btn-text-brand` | Bare text + icon, sage green | Mobile brand CTAs |
| `.btn-outline` | 1px black border, no fill | Section CTAs |
| `.btn-inv` | Black fill, white text | Dark CTAs (projects page) |

Hover states: `.btn-text`, `.btn-text-brand`, `.btn-outline` → `opacity: 0.65`; `.btn-inv` → `opacity: 0.85`. All use `:focus-visible` as well.

## Eyebrow Pattern

Used above section headings to label sections:

```html
<div class="eyebrow">
    <div class="ico-filled"></div>
    <span>SECTION LABEL</span>
</div>
```

- `.ico-filled` — 12×12px filled square in `--c-brand` (sage green)
- `.ico-outline` — 12×12px outlined square in `--c-text` (black), used in some variants
- The `<span>` uses `--fs-label` with `font-weight: 700` and `text-transform: uppercase`
