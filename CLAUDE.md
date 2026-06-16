# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # serve the dist/ build locally
```

No test runner or linter is configured.

## Architecture

**Vanilla JS + Vite, no framework.** Two HTML entry points at the repo root:

- `index.html` — the pace calculator app, entry script `src/main.js`
- `components.html` — design system preview, entry script `src/components-preview.js`

Both are registered in `vite.config.js` via `rollupOptions.input`.

### Data flow

State lives in a single plain object in `src/state.js`. Any user interaction mutates `state` and immediately calls `updateUI()`, which re-renders the DOM in place. The split table (`#split-tbody`) is fully rebuilt on every update (max ~42 rows).

```
User event → mutate state → updateUI() → DOM writes
```

### Key files

| File | Role |
|---|---|
| `src/calculator.js` | Pure math — no DOM. All pace/time/cadence/split calculations live here. |
| `src/state.js` | State object + `updateUI()` dispatcher. Imports from `calculator.js`. |
| `src/main.js` | Wires DOM event listeners → state mutations → `updateUI()`. Also imports all CSS. |
| `src/styles/tokens.css` | Single source of truth for all design tokens (colors, spacing, radii, type scale). |
| `src/styles/components.css` | `.btn`, `.icon-btn`, `.segmented`, `.table-wrap`, `.overlay-backdrop`, `.text-link` — all reusable component styles. |

### Design tokens

All CSS custom properties are declared in `tokens.css` and consumed everywhere else. Never hard-code colors or spacing — always use the `--color-*`, `--space-*`, `--radius-*`, `--fs-*`, `--fw-*` variables.

`font-variant-numeric: tabular-nums` is intentionally scoped to only five places: `.pace-input` (landing.css), `.table` (components.css), `.wheel-picker__row` (components.css), `.split-adjust__primary` (landing.css), and `.stat-item__value` (landing.css, keeps digit columns stable during the slot-text roll animation). Do not add it globally or to other elements.

### Fonts

- **Geist Variable** — imported via `@fontsource-variable/geist` npm package in each JS entry file.
- **Cafe24PROUP** — self-hosted `.woff2` in `src/fonts/`, declared via `@font-face` in `typography.css`, used only for `.font-korean` decorative text (hero + footer).

### Responsive strategy

Mobile-first. One breakpoint at `768px` in `layout.css` and `landing.css`. Key differences above 768px: horizontal padding increases to `var(--space-96)` (96px), table rows shrink from 64px to 44px, stats row expands from 2-column to 4-column grid.
