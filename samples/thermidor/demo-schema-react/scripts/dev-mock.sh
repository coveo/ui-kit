#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SAMPLE_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(cd "$SAMPLE_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

# Build dependencies (--force ensures mock API picks up source changes)
echo "⚙️  Building dependencies..."
pnpm turbo run build --filter=@coveo/platform-mock-api --filter=@coveo/mock-converse-api --filter=@coveo/thermidor --force
pnpm turbo run build --filter=@samples/thermidor-demo-schema-react

# Start mock API in background
echo "🚀 Starting mock Converse API on port 3456..."
node --experimental-strip-types packages/mock-converse-api/src/server.ts &
MOCK_PID=$!
trap "kill $MOCK_PID 2>/dev/null" EXIT
sleep 1

# Start Vite dev server pointing directly to mock (bypass proxy regardless of .env.local)
cd "$SAMPLE_DIR"
echo "🌐 Starting Vite dev server..."
VITE_COVEO_ENDPOINT=http://localhost:3456/schema VITE_COVEO_USE_VITE_PROXY=false pnpm exec vite
