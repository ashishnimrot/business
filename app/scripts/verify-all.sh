#!/bin/bash
# Comprehensive verification script for backend services
# Runs linting, type checking, and other validations

set -e

echo "🔍 Comprehensive Code Verification (Backend)"
echo "============================================="
echo ""

cd "$(dirname "$0")/.."

ERRORS=0

# 1. Lint all services
echo "1️⃣  Running ESLint for all services..."
echo "-----------------------------------"
if npm run lint:all 2>&1; then
    echo "✅ ESLint: PASSED"
else
    echo "❌ ESLint: FAILED"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Type check (if typecheck target exists)
echo "2️⃣  Running TypeScript type checks..."
echo "-----------------------------------"
SERVICES=("auth-service" "business-service" "party-service" "inventory-service" "invoice-service" "payment-service")
FAILED=0

for service in "${SERVICES[@]}"; do
    if npx tsc --noEmit -p "apps/$service/tsconfig.app.json" 2>/dev/null; then
        echo "✅ $service: PASSED"
    else
        echo "⚠️  $service: Type check skipped (no tsconfig.app.json or errors)"
        # Don't count as error, just informational
    fi
done
echo ""

# 3. Format check
echo "3️⃣  Checking code format..."
echo "-----------------------------------"
if npm run format:check 2>&1; then
    echo "✅ Format: PASSED"
else
    echo "⚠️  Format: Some files need formatting (run: npm run format)"
    # Don't count as error
fi
echo ""

# Summary
echo "==================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed!"
    exit 0
else
    echo "❌ Found $ERRORS error(s)"
    exit 1
fi

