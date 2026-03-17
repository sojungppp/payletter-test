---
name: Payletter Character Diagnosis Web App
description: Project context for the Payletter MBTI-style character diagnosis test — a client-side SPA with Supabase backend
type: project
---

Multi-file vanilla JS SPA (no bundler) serving a 10-question character diagnosis quiz.

Key files:
- `index.html` — single HTML shell; all screens are sections toggled by JS
- `js/config.js` — Supabase URL/key and admin password constants
- `js/data.js` — QUESTIONS array (10 items) and CHARACTERS map (16 codes)
- `js/engine.js` — pure calculation functions: `_accumulateWeights`, `_weightsToCode`, `calculateResult`, `getAxisSummary`
- `js/app.js` — screen routing, rendering, event wiring, Supabase `saveResult` fetch
- `js/admin.js` — admin dashboard (auth, stats fetch, chart render)
- `css/style.css` — all styling

**Why:** No build toolchain — changes deploy by editing files directly.
**How to apply:** Keep changes self-contained within the relevant JS file; no imports/exports are used.

Character code scheme: [S|C][P|T][F|T][I|E] — 16 combinations, all defined in CHARACTERS.
Axis 3 (style): flexible→F, structured→T (not S — S is taken by Axis 1 "swift").

Optimizations applied 2026-03-17:
- html2canvas lazy-loaded on demand in saveAsImage() (was eagerly loaded on every page load)
- Dead Engine IIFE module removed (referenced nonexistent DOM IDs and undefined renderResult_app)
- _devTest() IIFE removed (was logging to console on every page load)
- getAxisSummary style axis bug fixed: structured winner was 'S', corrected to 'T'
- config.js var declarations changed to const
- Double-submit guard added to finishTest() via appState.resultSaved flag
