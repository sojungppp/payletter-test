---
name: Payletter Character Diagnosis Test — Project Context
description: UX context, patterns, and decisions for the Payletter MBTI-style character diagnosis web app
type: project
---

This is a single-page web app (no framework) with three screens: intro, question (10 questions), result.
Files: index.html, js/app.js, js/engine.js, js/data.js, js/admin.js, css/style.css.

Backend: Supabase (fire-and-forget result saving). AWS Lambda + S3 presigned URL handler is a separate service.

**Why:** The test is a branded marketing/engagement tool. Target audience is general Korean-speaking users including non-technical users on mobile.

**UX decisions implemented (2026-03-17):**
- Progress bar uses `((index + 1) / total) * 100` so Q1 immediately shows 10% progress, not 0%. Prevents the "nothing happened" perception on first question.
- Save failure uses a non-blocking toast (`showToast()` in app.js) positioned bottom-center, auto-dismisses after 4s. Result display is NOT delayed by Supabase save — UX is fire-and-forget with silent success, toast on failure only.
- Nickname counter shows "0 / 20" beside the label, updates live on `input` event, turns red at 20 chars. Counter resets when "다시 테스트하기" is clicked.
- Image load error handler uses `addEventListener('error', ...)` on a `createElement('img')` — NOT inline `onerror` attribute. This is required for CSP compatibility.
- "이전으로" button on Q1 uses `visibility: hidden` (not `display: none` and not just `disabled`). This preserves layout space so the screen doesn't jump, while making it invisible and unreachable.
- Keyboard shortcut: `1` or `A` selects option A; `2` or `B` selects option B. Guard: checks `appState.currentScreen === 'question'` and `btn.disabled` to prevent double-firing during the 200ms answer animation.

**How to apply:** Reference these decisions when reviewing future changes to the quiz flow or suggesting new interaction patterns.
