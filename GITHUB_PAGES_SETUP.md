# GitHub Pages Deployment Guide

## Current Setup
Your Next.js application is configured for static export and GitHub Pages deployment.

**Repository URL:** `https://github.com/sumantkumarraj20/game`  
**GitHub Pages URL:** `https://sumantkumarraj20.github.io/game`

## What Was Configured

### 1. Next.js Configuration (`next.config.js`)
- ✅ `output: "export"` - Generates static HTML files
- ✅ `basePath: "/game"` - Sets correct path for GitHub subdirectory
- ✅ `assetPrefix: "/game/"` - Serves assets from correct path
- ✅ `trailingSlash: true` - Ensures proper routing
- ✅ `images.unoptimized: true` - Works with static export

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- ✅ Builds on push to `main` branch
- ✅ Exports static files to `out/` directory
- ✅ Deploys to GitHub Pages automatically

### 3. Jekyll Configuration
- ✅ `.nojekyll` file created to prevent Jekyll processing

## Steps to Enable GitHub Pages

### Via GitHub Web Interface:
1. Go to your repository: `https://github.com/sumantkumarraj20/game`
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - Select **Source**: "GitHub Actions"
   - This will automatically use the deploy.yml workflow
4. Wait a few moments, then check the "Deployments" section

### That's it! 🎉

The workflow will:
1. Build your Next.js app to static files
2. Push to `gh-pages` branch automatically
3. GitHub Pages will serve from there

## Testing
Once deployed, test the site at:
- Main page: `https://sumantkumarraj20.github.io/game/`
- Game page: `https://sumantkumarraj20.github.io/game/game/`
- Game with params: `https://sumantkumarraj20.github.io/game/game/?domain=language&level=1`

## Local Testing (Before Deployment)

To test the production build locally:
```bash
# Build the site
npm run build

# The output will be in the ./out directory
# Serve it locally with any static server:
npx http-server out
# Then visit: http://localhost:8080/game/
```

## Troubleshooting

### "404 - There isn't a GitHub Pages site here"
1. Check Settings → Pages
2. Ensure Pages is enabled with "GitHub Actions" as source
3. Wait a few minutes for the deployment to complete
4. Check the "Deployments" tab to see if build succeeded

### Pages not updating after push
1. Check the **Actions** tab in your repository
2. Click on the latest workflow run
3. Check for build errors in the logs
4. Make sure you're pushing to the `main` branch

### CSS or images not loading
- Already handled by `basePath` and `assetPrefix` in next.config.js
- No manual changes needed

### Dynamic routes not working
- Make sure all pages are in the `pages/` directory
- Next.js static export supports all file-based routing

## Files Modified for GitHub Pages

1. **next.config.js** - Added basePath and assetPrefix
2. **.nojekyll** - Empty file to disable Jekyll processing
3. **.github/workflows/deploy.yml** - Already configured (no changes needed)

## Environment Variables
If your app uses environment variables:
1. Add secrets in **Settings** → **Secrets and variables** → **Actions**
2. Reference in the workflow file if needed

---

**Questions?** Check Next.js docs: https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
