#!/bin/bash
# Comprehensive verification script for web-app
# Runs linting, type checking, and other validations

set -e

echo "🔍 Comprehensive Code Verification"
echo "==================================="
echo ""

cd "$(dirname "$0")/.."

ERRORS=0

# 1. TypeScript Type Check
echo "1️⃣  Running TypeScript type check..."
echo "-----------------------------------"
if npx tsc --noEmit 2>&1; then
    echo "✅ TypeScript: PASSED"
else
    echo "❌ TypeScript: FAILED"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. ESLint
echo "2️⃣  Running ESLint..."
echo "-----------------------------------"
if npm run lint 2>&1; then
    echo "✅ ESLint: PASSED"
else
    echo "❌ ESLint: FAILED"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Check for common issues
echo "3️⃣  Checking for common issues..."
echo "-----------------------------------"

# Check for JSX namespace issues
if grep -r "keyof JSX.IntrinsicElements" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules; then
    echo "❌ Found JSX.IntrinsicElements usage (should use React.ElementType)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No JSX namespace issues"
fi

# Check for missing exports
if grep -r "import.*ButtonProps.*from.*button" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules; then
    if ! grep -q "export.*ButtonProps" components/ui/button.tsx 2>/dev/null; then
        echo "❌ ButtonProps imported but not exported"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ ButtonProps export verified"
    fi
else
    echo "✅ ButtonProps imports verified"
fi

# Check for use-toast hook
if grep -r "import.*useToast.*from.*hooks/use-toast" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules; then
    if [ ! -f "hooks/use-toast.ts" ]; then
        echo "❌ use-toast hook imported but file missing"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ use-toast hook exists"
    fi
else
    echo "✅ use-toast hook verified"
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

