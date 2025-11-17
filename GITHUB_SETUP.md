# GitHub Setup - Quick Guide

## Step 1: Initialize Git (if not already done)

```bash
# From your project root directory
git init
```

## Step 2: Add All Files

```bash
git add .
```

This will add all files **except** those in `.gitignore`:
- ✅ Source code
- ✅ Configuration files
- ✅ Documentation
- ❌ node_modules/ (excluded)
- ❌ dist/ and build/ (excluded)
- ❌ storage/ (excluded - your PDFs stay local)
- ❌ .env files (excluded - sensitive)

## Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: PDF Form Filler app"
```

## Step 4: Create GitHub Repository

1. Go to GitHub.com
2. Click "New repository"
3. Name it (e.g., `pdf-form-filler`)
4. **Don't** initialize with README, .gitignore, or license (you already have these)
5. Click "Create repository"

## Step 5: Push to GitHub

GitHub will show you commands, but here they are:

```bash
# Add your GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## What Gets Pushed

✅ **Included:**
- All source code (`server/src/`, `client/src/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`README.md`, `DEPLOYMENT.md`, etc.)
- `.gitignore` file

❌ **Excluded (via .gitignore):**
- `node_modules/` - Dependencies (installed via `npm install`)
- `dist/` and `build/` - Build outputs (generated on server)
- `storage/` - Your uploaded PDFs and schemas (stays on server)
- `.env` - Environment variables (sensitive, stays on server)
- Log files

## After Pushing

On your Digital Ocean server, you'll:
1. Clone the repo
2. Run `npm install` to get dependencies
3. Run `npm run build` to build the app
4. Start the server

The build happens **on the server**, not before pushing to GitHub.

## Future Updates

```bash
# Make changes locally
# Then:
git add .
git commit -m "Description of changes"
git push
```

Then on your server:
```bash
git pull
npm run build
pm2 restart pdf-form-filler
```

