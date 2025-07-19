#!/bin/bash

# Fast development setup script for Codespaces
# This script optimizes the development environment for quick demo/development

set -e

echo "🚀 Setting up Coveo UI Kit for fast development..."

# Only install if node_modules doesn't exist or package.json is newer
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies with optimized flags..."
    npm ci --prefer-offline --no-audit --progress=false
fi

# Check if build artifacts exist and are recent
if [ ! -d "packages/atomic/dist" ] || [ "packages/atomic/package.json" -nt "packages/atomic/dist" ]; then
    echo "🔨 Building essential packages for demo..."
    
    # Build headless first (dependency for atomic)
    echo "  📦 Building headless..."
    npx nx run headless:build
    
    # Build only minimal atomic components needed for demo
    echo "  🎨 Building atomic locales..."
    npx nx run atomic:build:locales
    
    echo "  ⚡ Building atomic components..."
    npx nx run atomic:build:stencil-lit
    
    echo "✅ Essential build complete! Demo-ready in ~2 minutes."
else
    echo "✅ Build artifacts are up to date, skipping build"
fi

# Setup git hooks if needed
if [ ! -d ".husky/_" ]; then
    echo "🪝 Setting up git hooks..."
    npx husky install
fi

echo "🎉 Setup complete! Ready for development."
echo ""
echo "Quick start commands:"
echo "  npm run dev:atomic  - Start Atomic development server"
echo "  npm run start       - Start Storybook"
echo "  npm test            - Run tests"
echo ""
