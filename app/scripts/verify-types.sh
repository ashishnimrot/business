#!/bin/bash
# TypeScript Type Checking Script for backend services
# This script verifies TypeScript types for all services

set -e

echo "🔍 TypeScript Type Verification (Backend Services)"
echo "==================================================="
echo ""

cd "$(dirname "$0")/.."

# Check if nx is available
if ! command -v nx &> /dev/null; then
    echo "⚠️  Nx not found, using npx..."
    NX_CMD="npx nx"
else
    NX_CMD="nx"
fi

echo "📋 Running TypeScript type check for all services..."
echo ""

# Run type check for all services
SERVICES=("auth-service" "business-service" "party-service" "inventory-service" "invoice-service" "payment-service")
FAILED=0

for service in "${SERVICES[@]}"; do
    echo "Checking $service..."
    if $NX_CMD run "$service:typecheck" 2>/dev/null || npx tsc --noEmit -p "apps/$service/tsconfig.app.json" 2>/dev/null; then
        echo "✅ $service: PASSED"
    else
        echo "❌ $service: FAILED"
        FAILED=$((FAILED + 1))
    fi
    echo ""
done

if [ $FAILED -eq 0 ]; then
    echo "✅ All services passed type checking!"
    exit 0
else
    echo "❌ $FAILED service(s) failed type checking"
    exit 1
fi

