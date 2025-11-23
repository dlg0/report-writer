# Vercel Deployment Setup

## Quick Setup Steps

### 1. Get Convex Production Deploy Key

1. Run `convex dashboard` (or visit https://dashboard.convex.dev)
2. Select your project: **report-writer**
3. Go to **Settings** → **Deploy Keys**
4. Click **Generate Production Deploy Key**
5. Copy the generated key

### 2. Set Environment Variable in Vercel

Run this command and paste your deploy key when prompted:

```bash
cd apps/web
vercel env add CONVEX_DEPLOY_KEY production
```

Paste the production deploy key from step 1.

**OR** set it via Vercel Dashboard:
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add `CONVEX_DEPLOY_KEY` with your production deploy key
4. Set environment to **Production** only

### 3. Deploy

```bash
cd apps/web
vercel --prod
```

## How It Works

The `vercel.json` configuration:
```json
{
  "buildCommand": "npx convex deploy --cmd 'npm run build'",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

During deployment:
1. `npx convex deploy` reads `CONVEX_DEPLOY_KEY`
2. Deploys Convex functions to production
3. Sets `VITE_CONVEX_URL` environment variable
4. Runs `npm run build` which builds the frontend with the correct Convex URL
5. Vercel serves the built static files

## Current Configuration

**Convex Production Deployment:**
- URL: `https://agreeable-giraffe-398.convex.cloud`

**Daytona Sandbox:**
- URL: `https://8000-5e0839ba-cbbe-4269-8204-ba9ab7768de8.proxy.daytona.works`

**Environment Variables Needed:**
- `CONVEX_DEPLOY_KEY` - Set in Vercel (production only)
- `VITE_CONVEX_URL` - Auto-set by `npx convex deploy`
- `VITE_SANDBOX_URL` - Set manually in Vercel if needed

To set VITE_SANDBOX_URL in Vercel:
```bash
cd apps/web
vercel env add VITE_SANDBOX_URL production
# Paste: https://8000-5e0839ba-cbbe-4269-8204-ba9ab7768de8.proxy.daytona.works
```

## Verify Deployment

After deployment:
1. Check the Vercel deployment URL
2. Open browser console
3. Verify Convex connection
4. Test creating a project
