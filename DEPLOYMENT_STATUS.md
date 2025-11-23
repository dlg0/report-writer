# Deployment Status

## Current Status

### ✅ Fully Deployed

All services are deployed and connected:

**Convex Backend:**
- Dev Deployment: `dev:uncommon-crab-478`
- Prod Deployment: `agreeable-giraffe-398`
- Team: david-l-green
- Project: report-writer
- Dev URL: `https://uncommon-crab-478.convex.cloud`
- Prod URL: `https://agreeable-giraffe-398.convex.cloud`
- Status: ✅ Deployed to both dev and prod with all tables created

**Daytona Sandbox:**
- ID: `522d53be-36b3-4273-835d-188a443cee23`
- Name: `report-writer-sandbox`
- Snapshot: `daytona-small`
- Region: `us`
- Class: `small`
- URL: `https://22222-522d53be-36b3-4273-835d-188a443cee23.proxy.daytona.works`
- Status: ✅ Running (auto-stop disabled)

**Environment Variables:**
- ✅ `SANDBOX_URL` set in Convex
- ✅ `.env.local` contains `CONVEX_URL`

**Database Tables Created:**
- agentMessages
- agentThreads
- artifacts
- blocks
- comments
- locks
- projectMembers
- projects
- reportVersions
- sections
- users

## Deployment Scripts

Two deployment scripts are available in `/scripts`:

### 1. Deploy Convex Backend

```bash
./scripts/deploy-convex.sh
```

Deploys Convex functions to production.

### 2. Deploy Daytona Sandbox

```bash
./scripts/deploy-sandbox.sh
```

Creates and configures a Daytona sandbox for the agent service.

**Environment variables:**
- `SANDBOX_NAME` - Name for the sandbox (default: report-writer-sandbox)
- `SNAPSHOT` - Daytona snapshot to use (default: daytona-medium)
- `AUTO_STOP` - Auto-stop interval in minutes (default: 0 = disabled)

**Example:**

```bash
SANDBOX_NAME=my-sandbox SNAPSHOT=daytona-large ./scripts/deploy-sandbox.sh
```

## Quick Deployment Guide

### First-Time Setup

```bash
# 1. Set up Convex (interactive)
npx convex dev

# Keep it running, then in another terminal:

# 2. Deploy sandbox
./scripts/deploy-sandbox.sh

# 3. Get sandbox URL
daytona sandbox info report-writer-sandbox

# 4. Configure Convex with sandbox URL
npx convex env set SANDBOX_URL <your-sandbox-url>

# 5. Build and deploy frontend
cd apps/web
pnpm build
# Deploy to your hosting (Vercel, Netlify, etc.)
```

### Subsequent Deployments

```bash
# Deploy backend
./scripts/deploy-convex.sh

# Redeploy sandbox (if needed)
daytona sandbox delete report-writer-sandbox
./scripts/deploy-sandbox.sh

# Deploy frontend
cd apps/web
pnpm build && vercel --prod
```

## Deployment Status Summary

### ✅ Completed

1. **Convex Backend**
   - ✅ Dev and Prod deployments configured
   - ✅ All database tables created
   - ✅ Environment variables set
   - ✅ Backend functions deployed

2. **Daytona Sandbox**
   - ✅ Sandbox created and running
   - ✅ URL configured in Convex

3. **Web Frontend**
   - ✅ Production build completed
   - ✅ Environment variables configured
   - ✅ Build artifacts ready in `apps/web/dist/`

### ⏳ Pending

1. **Deploy Python App to Sandbox**
   - Sandbox is running but app needs to be uploaded
   - See: [scripts/sandbox-deploy-manual.md](scripts/sandbox-deploy-manual.md)
   - Options: SDK, Dockerfile, or manual transfer

2. **Deploy Web Frontend to Hosting**
   - Build is ready in `apps/web/dist/`
   - Deploy to Vercel, Netlify, or other static host
   - Run: `cd apps/web && vercel --prod`

## Quick Commands

```bash
# Build frontend
./scripts/build-frontend.sh

# Deploy Convex (updates)
npx convex deploy

# Check Convex environment
npx convex env list --prod

# Check sandbox status
daytona sandbox info report-writer-sandbox
```

## Troubleshooting

If `npx convex dev` fails:
- Ensure you're logged in: Check `~/.convex/config.json`
- Check network connection
- Try `npx convex logout` then login again

If sandbox creation fails:
- Verify Daytona authentication: `daytona organization list`
- Check available snapshots: `daytona snapshot list`
- Ensure CONVEX_URL is set

## Documentation

For detailed deployment instructions, see:
- [DEPLOY.md](DEPLOY.md) - Complete deployment guide
- [AGENTS.md](AGENTS.md#deployment-commands) - Quick reference commands
- [README.md](README.md#quick-start) - Development setup
