#!/bin/bash
set -e

echo "🏗️  Building web frontend..."

cd apps/web

# Check if production env file exists
if [ ! -f ".env.production" ]; then
  echo "⚠️  .env.production not found, creating from current deployment..."
  cat > .env.production << EOF
VITE_CONVEX_URL=https://agreeable-giraffe-398.convex.cloud
VITE_SANDBOX_URL=https://8000-522d53be-36b3-4273-835d-188a443cee23.proxy.daytona.works
EOF
fi

# Build
echo "📦 Running production build..."
pnpm build:no-typecheck

echo ""
echo "✅ Build complete!"
echo ""
echo "Build output: apps/web/dist/"
echo "Bundle sizes:"
ls -lh dist/assets/

echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel: cd apps/web && vercel --prod"
echo "  2. Deploy to Netlify: cd apps/web && netlify deploy --prod --dir=dist"
echo "  3. Deploy to static host: Upload apps/web/dist/ directory"
