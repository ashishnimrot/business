#!/bin/bash
# TypeScript Type Checking Script for web-app
# This script verifies TypeScript types without building

set -e

echo "🔍 TypeScript Type Verification"
echo "================================"
echo ""

cd "$(dirname "$0")/.."

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo "⚠️  TypeScript not found globally, using npx..."
    TSC_CMD="npx tsc"
else
    TSC_CMD="tsc"
fi

echo "📋 Running TypeScript type check..."
echo ""

# Run TypeScript compiler in check mode (no emit)
if $TSC_CMD --noEmit; then
    echo ""
    echo "✅ TypeScript type check passed!"
    exit 0
else
    echo ""
    echo "❌ TypeScript type check failed!"
    exit 1
fi

