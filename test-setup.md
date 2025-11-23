# API Setup Test Plan

## Convex Setup
- ✅ Convex CLI installed (v1.29.3)
- ✅ Convex CLI authenticated
- ✅ Access token verified
- ⏳ Need to run `npx convex dev` to set up deployment
- 📁 Convex functions directory exists at `/convex`

### Next Steps for Convex:
1. Run `npx convex dev` to create/link deployment
2. This will generate `.env.local` with `CONVEX_URL`
3. Test with: `convex run <functionName>`

## Daytona Setup
- ✅ Daytona CLI installed (v0.117.0)
- ✅ Daytona CLI authenticated
- ✅ Organization found: Personal (f2b9c669-b3f5-43e2-bea9-bc23ee87e102)
- ✅ Snapshots available: daytona-small, daytona-medium, daytona-large
- ✅ Test sandbox created and deleted successfully

### Daytona Test Results:
- Created sandbox: f8343aac-70a8-4be2-bb5f-3f77591a2f0b
- Region: us, Class: small
- Public URL: https://22222-f8343aac-70a8-4be2-bb5f-3f77591a2f0b.proxy.daytona.works
- ✅ Sandbox lifecycle tested (create, info, delete)

### Daytona Capabilities:
- ✅ Create sandboxes with custom configs (CPU, memory, disk, GPU)
- ✅ Auto-lifecycle management (auto-stop, auto-archive, auto-delete)
- ✅ Network controls (allow-list, block-all)
- ✅ Volume mounting support
- ✅ Environment variables and labels
- ✅ Dockerfile/snapshot-based deployments

## Commands Summary

**Convex:**
```bash
npx convex dev              # Start dev deployment & watch
npx convex deploy           # Deploy to production
npx convex run <function>   # Run a function
npx convex env list         # List environment variables
npx convex dashboard        # Open dashboard
```

**Daytona:**
```bash
daytona sandbox create      # Create new sandbox
daytona sandbox list        # List sandboxes
daytona snapshot list       # List available snapshots
daytona organization list   # List organizations
```
