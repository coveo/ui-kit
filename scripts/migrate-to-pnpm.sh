#!/bin/bash

# PNPM Migration Script for ui-kit repository
# This script helps complete the migration from npm to pnpm

echo "🚀 Starting pnpm migration for ui-kit repository..."

# Remove npm-specific files
echo "📁 Removing npm-specific files..."
find . -name "package-lock.json" -not -path "./node_modules/*" -exec rm -f {} \;
find . -name "npm-shrinkwrap.json" -not -path "./node_modules/*" -exec rm -f {} \;

# Remove node_modules to ensure clean install
echo "🧹 Cleaning node_modules directories..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Install pnpm if not already installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9.15.0
fi

# Install dependencies with pnpm
echo "📥 Installing dependencies with pnpm..."
pnpm install

# Build the project
echo "🔨 Building the project..."
pnpm run build

echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test the build: pnpm run test"
echo "2. Run e2e tests: pnpm run e2e"  
echo "3. Commit the changes including pnpm-lock.yaml"
echo "4. Update CI/CD pipelines if any remaining references to npm exist"
echo ""
echo "🎉 Welcome to pnpm!"
