---
name: testing-monkyfi
description: Test the monkyfi static site end-to-end. Use when verifying email links, language translations, chat widget, or layout changes.
---

# Testing Monkyfi Website

## Overview
Monkyfi is a static single-page site (`index.html`) with inline CSS, JavaScript, and an i18n dictionary. It deploys to Vercel.

## Local Testing Setup

The Vercel preview deployments are behind SSO authentication. Test locally instead — the static site behaves identically:

```bash
cd /home/ubuntu/repos/monkyfi
python3 -m http.server 9000
```

Then open `http://localhost:9000` in the browser.

## Key Test Areas

### 1. Email Links
- **What to check:** All email links should use `mailto:` format (not `/cdn-cgi/l/email-protection#...` which is Cloudflare-only and 404s on Vercel)
- **Locations:** ROI CTA button, Contact section CTA, footer (2 links)
- **How to verify:** Hover over links and check status bar shows `mailto:hello@monkyfi.com` or `mailto:dante@monkyfi.com`
- **Console check:** `document.documentElement.innerHTML.includes('cdn-cgi')` should return `false`

### 2. Language Switcher (i18n)
- **How to switch:** Click the language button (top-right, shows EN/ES/PT) and select a language
- **Spanish checks:**
  - Hero heading uses "Activa" (NOT "Activá" — voseo)
  - Products heading uses "Conecta"/"Vigila" (NOT "Conectá"/"Vigilá")
  - Process section eyebrow uses "Cómo contratar" (NOT "Cómo nos contratás")
  - Chat placeholder uses "Pregunta" (NOT "Preguntá")
  - Chat welcome uses "Pregúntame" (NOT "Preguntame")
  - CTA body uses "operes"/"saber de ti" (NOT "operés"/"saber de vos")
- **Portuguese checks:** Verify all sections translate (no English remnants)
- **English checks:** Verify switching back restores English correctly

### 3. Chat Widget
- Click the chat bubble (bottom-right) to open
- Verify welcome message, suggestion chips, and placeholder text all match current language
- Chat requires Anthropic API key for actual responses — test UI rendering only locally

### 4. Comparing with Production
- Production URL: `https://www.monkyfi.com`
- Useful for proving a bug exists before merging a fix
- Check the same elements on production vs local to show the difference

## Tips
- The i18n dictionary is defined inline in `index.html` (around lines 1007-1184)
- All translations are applied via `data-i18n` attributes on HTML elements
- The language switcher stores selection in `localStorage` and applies on page load
- When testing email links, the browser won't actually open an email client in headless/VM environments — verify via href inspection and status bar hover

## No Secrets Needed
This is a static site with no backend auth required for testing.
