---
name: testing-monkyfi
description: Test the Monkyfi static site end-to-end. Use when verifying UI changes to the landing page, product cards, chat widget, or pricing/engagement sections.
---

# Testing Monkyfi Static Site

## Overview
Monkyfi is a static HTML site (no build step, no dependencies). The main file is `index.html` at the repo root. The chat API lives in `api/chat.js` (Vercel serverless function) and is NOT testable locally — only client-side rendering can be tested locally.

## Local Server Setup
```bash
cd /home/ubuntu/repos/monkyfi
python3 -m http.server 8080 &
```
Then open `http://localhost:8080` in Chrome.

## Launching Chrome
The VM has a CDP wrapper at `/home/ubuntu/.local/bin/google-chrome`. If Chrome is not already running, launch it directly:
```bash
DISPLAY=:0 /opt/.devin/chrome/chrome/linux-133.0.6943.126/chrome-linux64/chrome \
  --no-first-run --disable-gpu \
  --remote-debugging-port=29229 \
  --user-data-dir=/home/ubuntu/.config/google-chrome \
  http://localhost:8080 &
```
Note: The Chrome binary path may change across VM versions. Check `/opt/.devin/chrome/` for available versions if the above path doesn't exist.

Maximize the window before recording:
```bash
sudo apt-get install -y wmctrl 2>/dev/null
wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz
```

## Key Sections to Test

### Product Cards (scroll to #products)
- Three cards: **Monkyfi Connect**, **Monkyfi Atlas**, **Monkyfi Sentinel**
- Each has a stat row at the bottom with 3 metrics
- Verify stats match expected values (outcome metrics, not dollar amounts)
- Use `zoom` on the stat rows to get readable screenshots

### ROI Framing Block
- Located below the 3 product cards
- Should contain outcome-based messaging and a CTA button
- Verify the CTA `href` points to `mailto:hello@monkyfi.com`

### Chat Widget
- Click the chat FAB (bottom-right corner, cyan bubble icon)
- Verify welcome message text, suggestion chips, and input placeholder
- The chat API (`/api/chat`) requires Vercel backend — messages won't get AI responses locally
- You CAN test: widget opens, welcome message renders, chips display, input placeholder text

### Source Verification
Use `curl` + `grep` to verify removed content is gone:
```bash
curl -s http://localhost:8080 | grep -iEc 'PATTERN_TO_CHECK'
```

## Deployments
- **Production**: https://monkyfi.com
- **Preview**: Vercel auto-deploys PR branches to `https://monkyfi-web-git-<branch>-danteruiz23s-projects.vercel.app`
- Preview deployments may require Vercel SSO — if blocked, test locally instead

## Devin Secrets Needed
- None required for local static testing
- Vercel preview deployments may need Vercel team SSO access (not currently available)
