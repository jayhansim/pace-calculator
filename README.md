# Pace Calculator

A running pace calculator for 5K, 10K, half marathon, 30K, and full marathon distances. Enter a target pace or cadence to see total finish time, speed, stride length, and a full split table — with even or progressive (negative-split) pacing.

## Features

- **Pace ↔ time ↔ cadence**, kept in sync — adjust any one and the others update
- **Split table** with even or first/last segment pacing per distance
- **Shareable links** — distance, pace, and cadence are encoded in the URL query string and restored on load
- **Export splits** as a PNG (via `html2canvas`) or PDF (via the browser print dialog)
- **Footer particle effect** — ambient animation via `particles.js`
- **Design system preview** at `components.html` for the shared UI components

## Getting started

```bash
npm install
npm run dev      # start Vite dev server (http://localhost:5173)
```

## Scripts

```bash
npm run build    # production build → dist/
npm run preview  # serve the dist/ build locally
```

## Tech stack

Vanilla JavaScript + [Vite](https://vitejs.dev/), no framework. State lives in a single plain object (`src/state.js`); user interactions mutate state and call `updateUI()` to re-render the DOM in place.

| File | Role |
|---|---|
| `src/calculator.js` | Pure math — pace/time/cadence/split calculations |
| `src/state.js` | State object + `updateUI()` dispatcher |
| `src/main.js` | DOM event listeners → state mutations → `updateUI()` |
| `src/urlParams.js` | Parse/sync state to URL query params |
| `src/export.js` | PNG/PDF export of the split table |
| `src/styles/tokens.css` | Design tokens (colors, spacing, radii, type scale) |

See `CLAUDE.md` for more detailed architecture notes.

## License

Private project — no license specified.
