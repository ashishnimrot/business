#!/bin/bash
# =============================================================================
# CI/CD DEPLOYMENT TEST SCRIPT
# =============================================================================
# Creates a test change and helps you verify the CI/CD pipeline
# =============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     CI/CD DEPLOYMENT TEST                                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're not on the main branch${NC}"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Select service to test
echo "Select a service to test:"
echo "  1. auth-service"
echo "  2. business-service"
echo "  3. inventory-service"
echo "  4. invoice-service"
echo "  5. party-service"
echo "  6. payment-service"
echo "  7. web-app"
echo "  8. Cancel"
echo ""
read -p "Choose option (1-8): " -n 1 -r
echo ""

case $REPLY in
    1) SERVICE="auth-service"; SERVICE_PATH="app/apps/auth-service" ;;
    2) SERVICE="business-service"; SERVICE_PATH="app/apps/business-service" ;;
    3) SERVICE="inventory-service"; SERVICE_PATH="app/apps/inventory-service" ;;
    4) SERVICE="invoice-service"; SERVICE_PATH="app/apps/invoice-service" ;;
    5) SERVICE="party-service"; SERVICE_PATH="app/apps/party-service" ;;
    6) SERVICE="payment-service"; SERVICE_PATH="app/apps/payment-service" ;;
    7) SERVICE="web-app"; SERVICE_PATH="web-app" ;;
    8) echo "Cancelled"; exit 0 ;;
    *) echo -e "${RED}Invalid option${NC}"; exit 1 ;;
esac

echo ""
echo -e "${BLUE}Selected: $SERVICE${NC}"
echo ""

# Create test file
TEST_FILE="$SERVICE_PATH/.cicd-test-$(date +%s).txt"
TEST_MESSAGE="CI/CD Test - $(date '+%Y-%m-%d %H:%M:%S')"

echo "Creating test file: $TEST_FILE"
mkdir -p "$(dirname "$TEST_FILE")"
echo "$TEST_MESSAGE" > "$TEST_FILE"

echo -e "${GREEN}✅ Test file created${NC}"
echo ""

# Show what will be committed
echo "Files to be committed:"
git status --short "$TEST_FILE"
echo ""

# Confirm
read -p "Do you want to commit and push this test change? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Test file created but not committed."
    echo "You can commit it manually later."
    exit 0
fi

# Commit
echo ""
echo "Committing test change..."
git add "$TEST_FILE"
git commit -m "test(ci/cd): Test deployment for $SERVICE

This is a test commit to verify the CI/CD pipeline.
Service: $SERVICE
Test file: $TEST_FILE
Time: $TEST_MESSAGE"

echo -e "${GREEN}✅ Committed${NC}"
echo ""

# Push
echo "Pushing to main branch..."
read -p "Are you sure you want to push to main? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Change is committed but not pushed."
    echo "You can push manually: git push origin main"
    exit 0
fi

git push origin main

echo ""
echo -e "${GREEN}✅ Pushed to main branch${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to GitHub → Actions tab"
echo "2. You should see 'Service-Based CI/CD Pipeline' running"
echo "3. Click on it to monitor the deployment"
echo ""
echo "The workflow will:"
echo "   ✅ Detect changes in $SERVICE"
echo "   ✅ Deploy to EC2 instance"
echo "   ✅ Rebuild and restart $SERVICE"
echo ""
echo "4. After deployment completes, verify on EC2:"
echo "   ssh -i ~/.ssh/business-app-key.pem ec2-user@<EC2_IP>"
echo "   cd /opt/business-app"
echo "   ls -la $SERVICE_PATH/.cicd-test-*.txt"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""


