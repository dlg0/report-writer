#!/bin/bash
set -e

echo "🚀 Deploying Agent Sandbox to Daytona..."

# Check if we have a Convex URL
if [ -z "$CONVEX_URL" ]; then
  if [ -f ".env.local" ]; then
    export $(cat .env.local | grep CONVEX_URL | xargs)
  else
    echo "⚠️  CONVEX_URL not set. Please deploy Convex first."
    exit 1
  fi
fi

SANDBOX_NAME="${SANDBOX_NAME:-report-writer-sandbox}"
SNAPSHOT="${SNAPSHOT:-daytona-medium}"
AUTO_STOP="${AUTO_STOP:-0}"

echo "Creating Daytona sandbox..."
echo "  Name: $SANDBOX_NAME"
echo "  Snapshot: $SNAPSHOT"
echo "  Auto-stop: $AUTO_STOP"

# Create sandbox
SANDBOX_INFO=$(daytona sandbox create \
  --name "$SANDBOX_NAME" \
  --snapshot "$SNAPSHOT" \
  --env CONVEX_URL="$CONVEX_URL" \
  --env PORT=8000 \
  --auto-stop "$AUTO_STOP" \
  --class medium)

echo "$SANDBOX_INFO"

# Extract sandbox ID and URL
SANDBOX_ID=$(daytona sandbox list | grep "$SANDBOX_NAME" | awk '{print $1}')
echo ""
echo "✅ Sandbox created: $SANDBOX_ID"

# Get sandbox info
echo ""
echo "📋 Sandbox details:"
daytona sandbox info "$SANDBOX_NAME"

echo ""
echo "Next steps:"
echo "  1. Get sandbox URL: daytona sandbox info $SANDBOX_NAME"
echo "  2. Set in Convex: npx convex env set SANDBOX_URL <sandbox-url>"
echo "  3. Deploy frontend with VITE_SANDBOX_URL=<sandbox-url>"
