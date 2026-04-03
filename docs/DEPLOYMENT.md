# Deployment Guide

This guide explains how to deploy the PS5 Jailbreak Checker to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed locally
- Node.js 20+ installed

## Initial Setup

### 1. Push Code to GitHub

```bash
# If repository doesn't exist yet
git init
git add .
git commit -m "Initial commit: PS5 Jailbreak Checker v2.0"
git branch -M main
git remote add origin https://github.com/kemalsanli/is-my-ps5-jailbreakable.git
git push -u origin main
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save the settings

### 3. Enable GitHub Actions

The workflows are already configured in `.github/workflows/`:
- `ci.yml` — Runs on pull requests and pushes to main
- `deploy.yml` — Deploys to GitHub Pages on push to main

No additional configuration needed!

## First Deployment

```bash
# Make sure all files are committed
git add .
git commit -m "Deploy: PS5 Jailbreak Checker v2.0"
git push origin main
```

The GitHub Actions workflow will:
1. Run linting and type checks
2. Run all tests
3. Build the static site
4. Deploy to GitHub Pages

Check the **Actions** tab on GitHub to monitor progress.

## Custom Domain Setup (controlserial.com)

### DNS Configuration

Add the following DNS records at your domain registrar:

```
Type: CNAME
Name: www
Value: kemalsanli.github.io

Type: A
Name: @
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

### GitHub Settings

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter: `www.controlserial.com`
3. Check "Enforce HTTPS"
4. Save

The `CNAME` file in the `public/` directory ensures the domain persists after deployments.

## Continuous Deployment

Every push to `main` automatically triggers a deployment:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
```

## Manual Deployment

To trigger a deployment manually:

1. Go to **Actions** tab on GitHub
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Local Testing

Before deploying, test the production build locally:

```bash
# Build
npm run build

# Serve the 'out' directory
npx serve out

# Open http://localhost:3000
```

## Rollback

To rollback to a previous version:

```bash
# Find the commit hash of the version you want
git log

# Create a new branch from that commit
git checkout -b rollback COMMIT_HASH

# Force push to main (careful!)
git push origin rollback:main --force
```

## Troubleshooting

### Build Fails

1. Check the Actions tab for error logs
2. Run `npm run build` locally to reproduce
3. Fix errors and push again

### Images Not Loading

- Ensure images are in `public/images/`
- Use correct paths: `/images/filename.png`
- Check `next.config.js` has `unoptimized: true`

### 404 Errors

- Ensure `next.config.js` has `output: 'export'`
- Check that all routes are static (no dynamic routes without proper export)

### Custom Domain Not Working

- Wait up to 24 hours for DNS propagation
- Verify CNAME file exists in `public/`
- Check DNS settings with `dig www.controlserial.com`

## Monitoring

- **GitHub Actions**: Monitor build/deploy status
- **GitHub Pages**: Check deployment history in Settings → Pages
- **Browser DevTools**: Check for console errors
- **Lighthouse**: Run audits for performance/SEO

## Environment Variables

This project doesn't use environment variables for the static build. All configuration is in:
- `next.config.js`
- `tailwind.config.ts`
- `src/lib/i18n/config.ts`

## Performance Optimization

The build is already optimized with:
- Static generation
- Tree shaking
- CSS purging via Tailwind
- Image optimization (when serving from CDN)

For further optimization:
- Consider a CDN for the `out` directory
- Enable Cloudflare or similar for caching
- Use WebP images
