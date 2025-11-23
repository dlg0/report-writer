#!/bin/bash
set -e

echo "🚀 Deploying Convex Backend..."

# Check if CONVEX_DEPLOYMENT is set
if [ -z "$CONVEX_DEPLOYMENT" ] && [ ! -f ".env.local" ]; then
  echo "⚠️  No Convex deployment configured."
  echo "Please run 'npx convex dev' first to set up your deployment."
  echo "This is an interactive process that will:"
  echo "  1. Create or select a Convex project"
  echo "  2. Generate .env.local with CONVEX_URL"
  echo "  3. Link this directory to your deployment"
  exit 1
fi

# Deploy to production
echo "📦 Deploying functions..."
npx convex deploy

echo "✅ Convex backend deployed successfully!"
echo ""
echo "Next steps:"
echo "  1. Get your deployment URL: npx convex dashboard"
echo "  2. Set SANDBOX_URL: npx convex env set SANDBOX_URL <your-daytona-url>"
echo "  3. Deploy sandbox: ./scripts/deploy-sandbox.sh"
