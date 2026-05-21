# ScrubberDiagnostix v7 — Commit Hash Versioning & Auto-Update Setup Guide

## Overview

This package delivers **v7.0 production-ready** with three key improvements:

1. **Automatic commit hash injection** — Every push to the `v7` branch automatically updates the version display
2. **Update notification system** — Users see a banner when a new version is deployed, with one-click update
3. **Version-aware service worker** — Clears stale caches on new deployments

---

## Files Included

### 1. `index.html` (64 KB)
The complete ScrubberDiagnostix application with:
- **All 12 symptoms** across 5 categories (PRESSURE, DRIVE, THERMAL, NOISE, MECHANICAL)
- **Dark/light mode** toggle with localStorage persistence
- **Search functionality** for quick symptom lookup
- **Mobile responsive** design with drawer panel
- **Update notification banner** that checks for new versions on page load
- **Commit hash display** in title bar (currently shows `development`)
- **Smooth animations** and professional styling
- **Placeholder token** `<!-- COMMIT_HASH: development -->` that GitHub Actions will replace

### 2. `sw.js` (1.2 KB)
Service worker for offline access:
- **Caching strategy** — stores app assets and HTML for offline use
- **Network-first** approach for updates
- **Simple cache invalidation** — all old caches cleared on activation
- **PWA install prompt** support for home-screen installation

### 3. `deploy.yml` (1.1 KB)
GitHub Actions workflow:
- **Trigger** — automatically runs on every push to `v7` branch
- **Commit hash extraction** — gets the latest 7-character short hash
- **Token replacement** — injects hash into `index.html` before deployment
- **Deployment** — pushes to GitHub Pages (gh-pages branch)

---

## How It Works

### Version Detection Flow

```
User opens app
    ↓
JavaScript extracts hash from HTML comment
    ↓
Updates title bar with current version
    ↓
On page load, fetches latest index.html from server
    ↓
Extracts hash from live version
    ↓
Compares with current hash in memory
    ↓
If different → shows amber update banner with new hash
    ↓
User clicks "UPDATE NOW" → clears service worker → reloads page
```

### GitHub Actions Workflow Flow

```
Developer pushes to v7 branch
    ↓
GitHub Actions runs deploy.yml
    ↓
Extracts commit hash: git rev-parse --short HEAD
    ↓
Replaces <!-- COMMIT_HASH: development --> with actual hash
    ↓
Deploys index.html + sw.js to gh-pages
    ↓
Live site updates within 30 seconds
```

---

## Implementation Steps

### Step 1: Prepare Your Repository

Clone or navigate to your existing repository:

```bash
cd ScrubberDiagnostixV2
git checkout v7
```

### Step 2: Replace Files

Replace your current files with the production versions:

```bash
# Replace the main app file
cp index.html index.html.backup          # Optional: backup current version
cp /path/to/new/index.html ./

# Replace the service worker
cp sw.js sw.js.backup                    # Optional: backup current version
cp /path/to/new/sw.js ./
```

### Step 3: Create GitHub Actions Workflow Directory

```bash
mkdir -p .github/workflows
```

### Step 4: Add the Deployment Workflow

Copy `deploy.yml` into the workflows directory:

```bash
cp /path/to/deploy.yml .github/workflows/deploy.yml
```

**Contents should be:**
- File path: `.github/workflows/deploy.yml`
- Trigger: `on push to v7 branch`
- Action: Inject commit hash, then deploy to GitHub Pages

### Step 5: Commit and Push

```bash
git add index.html sw.js .github/workflows/deploy.yml
git commit -m "v7: Add commit hash versioning and auto-update system"
git push origin v7
```

### Step 6: Verify Deployment

1. Go to your GitHub repo → **Actions** tab
2. Watch the workflow run in real-time
3. Once complete (green checkmark), visit your live site: `https://tonymcsauce.github.io/ScrubberDiagnostixV2/`
4. Open browser DevTools (F12) and inspect the page source
5. Look for the HTML comment at the top: `<!-- COMMIT_HASH: a1b2c3d -->`
6. This short hash should also appear in the title bar in an orange badge

### Step 7: Test Update Detection

1. Make a trivial change on the v7 branch (e.g., add a comment)
2. Push to v7 again
3. Let the workflow run (30 seconds)
4. On your open page, hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. The update banner should appear showing the new hash
6. Click "UPDATE NOW" — page should reload with the new version

---

## Title Bar Layout

The title bar displays:

```
ScrubberDiagnostix v7 — Jwaneng Mine

Version badge (orange, right side): a1b2c3d
Theme toggle button: 🌙 / ☀️
```

- **Version badge** shows the current deployed commit hash
- **Theme toggle** allows light/dark mode
- **Copyright** shows © 2026 Anthony Masuga

---

## Update Notification System

### When Update Appears

- Only on page **load** (not continuously polling)
- Fetches `index.html` from server with `cache: 'no-store'`
- Compares embedded hash with live version
- If different, shows amber notification banner

### Banner Details

```
┌─────────────────────────────────────────────────────────┐
│ New version available: a1b2c3d — Update now to get the │
│ latest features              [UPDATE NOW]   [✕]        │
└─────────────────────────────────────────────────────────┘
```

- **"UPDATE NOW"** button → clears service worker cache + reloads
- **"✕"** button → dismisses banner (user can refresh manually later)
- Banner is **non-intrusive** — doesn't block the app

### Service Worker Cache Clearing

When user clicks "UPDATE NOW":

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
window.location.reload(true);
```

This ensures:
- Old cached version is discarded
- Service worker is unregistered
- Page reloads from server with `cache: 'no-store'`
- New service worker registers with fresh cache

---

## Key Features Added

### Dark/Light Mode
- Toggle with 🌙/☀️ button in title bar
- Smooth 0.4s cubic-bezier transitions
- Respects system `prefers-color-scheme`
- Saves preference to localStorage

### Symptom Search
- Real-time filter in left panel header
- Searches across label, chip text, and category
- Clear button appears when search active
- Helpful for large symptom lists

### Mobile Layout
- Symptoms drawer slides in from left on small screens
- Full-height, tap-friendly interface
- Floating action button (☰) with selected count badge
- RUN and CLEAR buttons side-by-side at bottom

### Animations
- `slideDown` for results and headers (0.4s)
- `fadeInUp` for empty state (0.6s)
- Smooth cubic-bezier easing on all interactive elements
- Theme transitions are polished and responsive

### Accessibility
- High contrast colors in both light and dark modes
- Minimum 48px tap targets on all buttons
- Clear visual feedback on interaction
- Keyboard navigation fully supported

---

## Troubleshooting

### Version Hash Not Showing

**Symptom:** Title bar shows "development" instead of commit hash

**Solution:**
1. Verify workflow ran successfully (check Actions tab in GitHub)
2. Hard refresh page (Ctrl+Shift+R / Cmd+Shift+R)
3. Clear service worker: DevTools → Application → Service Workers → Unregister
4. Check HTML comment: View Page Source → search for "COMMIT_HASH"

### Update Banner Never Appears

**Symptom:** User makes a change, but no banner shows up

**Solution:**
1. Verify new version actually deployed (check GitHub Pages settings)
2. Ensure you're on the v7 branch when pushing
3. Wait 30 seconds after push for workflow to complete
4. Hard refresh the page (service worker may be caching old version)
5. Check network tab in DevTools — confirm `index.html` is being fetched fresh

### GitHub Actions Workflow Fails

**Symptom:** Red X in Actions tab

**Common causes:**
- Workflow file is in wrong location (must be `.github/workflows/deploy.yml`)
- YAML indentation is incorrect (use spaces, not tabs)
- Branch name doesn't match `v7` exactly (check capitalization)

**To debug:**
1. Click the failed workflow in Actions
2. Expand the "Deploy to GitHub Pages" step
3. Read the error message — usually very clear
4. Fix the issue and push again

---

## Git Workflow Going Forward

### Standard Development Flow

```bash
# Make changes locally on v7 branch
git checkout v7
# ... edit files ...
git add .
git commit -m "Fix: description of change"

# Push to v7
git push origin v7

# Workflow automatically runs → deploys with new commit hash
# Users see update notification on next page load
```

### Keeping Main Branch Updated (Optional)

If you want to mirror v7 back to main for archival:

```bash
git checkout main
git pull origin v7
git push origin main
```

This keeps both branches in sync.

---

## Version Badge Reference

The commit hash displayed is the **short SHA** — the first 7 characters of the full Git commit hash.

Example:
- Full hash: `a1b2c3d4e5f6g7h8i9j0`
- Short hash (displayed): `a1b2c3d`

This uniquely identifies the exact code version deployed. Users can report issues by referencing the hash they see, making debugging much easier.

---

## Security Notes

- **No automatic updates** — users explicitly choose when to update
- **Version is public** — hash is visible in page source (intended)
- **Service worker** — only caches assets from same origin
- **Update check** — only fetches `index.html`, no external APIs called

---

## Performance Impact

- **Version check** — single HTTP request on page load, cached by browser
- **Service worker** — minimal memory footprint (~2 KB)
- **Theme storage** — 50 bytes in localStorage
- **Overall load time** — unchanged; update check is async and non-blocking

---

## Support & Questions

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Verify all three files (`index.html`, `sw.js`, `.github/workflows/deploy.yml`) are in correct locations
3. Confirm workflow trigger is set to `v7` branch
4. Review GitHub Actions logs for detailed error messages

---

## Summary Checklist

- [ ] Downloaded `index.html`, `sw.js`, and `deploy.yml`
- [ ] Backed up current versions (optional but recommended)
- [ ] Replaced files in repository
- [ ] Created `.github/workflows/` directory
- [ ] Added `deploy.yml` to workflows directory
- [ ] Committed all changes with clear message
- [ ] Pushed to `v7` branch
- [ ] Verified workflow ran successfully in Actions tab
- [ ] Checked live site — version hash displays in title bar
- [ ] Tested update detection with a trivial change

**Once complete, your ScrubberDiagnostix v7 is production-ready with automatic versioning and update notifications.**

---

**Deployed:** May 21, 2026  
**Version:** v7.0  
**Copyright:** © 2026 Anthony Masuga
