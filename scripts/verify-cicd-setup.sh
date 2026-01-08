#!/bin/bash
# =============================================================================
# CI/CD SETUP VERIFICATION SCRIPT
# =============================================================================
# Verifies that all prerequisites for CI/CD pipeline are in place
# =============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     CI/CD SETUP VERIFICATION                                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION=${1:-ap-south-1}
AWS_PROFILE=${AWS_PROFILE:-business-app}
INSTANCE_TAG=${2:-business-app-beta}
KEY_NAME=${3:-business-app-key}

AWS_CMD="aws --profile $AWS_PROFILE"
export AWS_PROFILE

# Track verification status
ALL_CHECKS_PASSED=true

# =============================================================================
# CHECK 1: AWS Credentials
# =============================================================================
echo "🔍 Check 1/5: Verifying AWS credentials..."

if $AWS_CMD sts get-caller-identity &>/dev/null; then
    ACCOUNT_ID=$($AWS_CMD sts get-caller-identity --query Account --output text)
    USER_ARN=$($AWS_CMD sts get-caller-identity --query Arn --output text)
    echo -e "${GREEN}✅ AWS credentials configured${NC}"
    echo "   Account ID: $ACCOUNT_ID"
    echo "   User: $USER_ARN"
else
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "   Run: aws configure --profile $AWS_PROFILE"
    ALL_CHECKS_PASSED=false
fi
echo ""

# =============================================================================
# CHECK 2: SSH Key File
# =============================================================================
echo "🔍 Check 2/5: Verifying SSH key file..."

SSH_KEY_FILE="$HOME/.ssh/$KEY_NAME.pem"
if [ -f "$SSH_KEY_FILE" ]; then
    PERMISSIONS=$(stat -f "%OLp" "$SSH_KEY_FILE" 2>/dev/null || stat -c "%a" "$SSH_KEY_FILE" 2>/dev/null || echo "unknown")
    if [ "$PERMISSIONS" == "600" ] || [ "$PERMISSIONS" == "400" ]; then
        echo -e "${GREEN}✅ SSH key file exists: $SSH_KEY_FILE${NC}"
        echo "   Permissions: $PERMISSIONS (correct)"
    else
        echo -e "${YELLOW}⚠️  SSH key file exists but permissions may be incorrect${NC}"
        echo "   Current: $PERMISSIONS, Expected: 600"
        echo "   Fix: chmod 600 $SSH_KEY_FILE"
    fi
else
    echo -e "${RED}❌ SSH key file not found: $SSH_KEY_FILE${NC}"
    echo "   Download from AWS Console or create a new key pair"
    ALL_CHECKS_PASSED=false
fi
echo ""

# =============================================================================
# CHECK 3: EC2 Instance
# =============================================================================
echo "🔍 Check 3/5: Verifying EC2 instance..."

INSTANCE_ID=$($AWS_CMD ec2 describe-instances \
    --region $REGION \
    --filters "Name=tag:Name,Values=$INSTANCE_TAG" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text 2>/dev/null || echo "None")

if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
    PUBLIC_IP=$($AWS_CMD ec2 describe-instances \
        --region $REGION \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    echo -e "${GREEN}✅ EC2 instance found${NC}"
    echo "   Instance ID: $INSTANCE_ID"
    echo "   Tag: $INSTANCE_TAG"
    echo "   Public IP: $PUBLIC_IP"
else
    echo -e "${RED}❌ EC2 instance not found${NC}"
    echo "   Looking for tag: $INSTANCE_TAG"
    echo ""
    echo "   Available instances:"
    $AWS_CMD ec2 describe-instances \
        --region $REGION \
        --filters "Name=instance-state-name,Values=running" \
        --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0],State.Name]' \
        --output table || true
    ALL_CHECKS_PASSED=false
fi
echo ""

# =============================================================================
# CHECK 4: GitHub Repository
# =============================================================================
echo "🔍 Check 4/5: Verifying GitHub repository..."

if git remote get-url origin &>/dev/null; then
    REPO_URL=$(git remote get-url origin)
    echo -e "${GREEN}✅ Git repository configured${NC}"
    echo "   Remote: $REPO_URL"
    
    # Check if it's a GitHub repo
    if echo "$REPO_URL" | grep -q "github.com"; then
        echo -e "${GREEN}✅ GitHub repository detected${NC}"
    else
        echo -e "${YELLOW}⚠️  Not a GitHub repository${NC}"
        echo "   CI/CD pipeline requires GitHub"
    fi
else
    echo -e "${RED}❌ Git remote not configured${NC}"
    ALL_CHECKS_PASSED=false
fi
echo ""

# =============================================================================
# CHECK 5: GitHub Workflow File
# =============================================================================
echo "🔍 Check 5/5: Verifying GitHub workflow file..."

WORKFLOW_FILE=".github/workflows/deploy-services.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    echo -e "${GREEN}✅ GitHub workflow file exists${NC}"
    echo "   Path: $WORKFLOW_FILE"
    
    # Check if workflow has correct structure
    if grep -q "deploy-services" "$WORKFLOW_FILE" && grep -q "EC2_SSH_PRIVATE_KEY" "$WORKFLOW_FILE"; then
        echo -e "${GREEN}✅ Workflow file structure looks correct${NC}"
    else
        echo -e "${YELLOW}⚠️  Workflow file may need review${NC}"
    fi
else
    echo -e "${RED}❌ GitHub workflow file not found${NC}"
    echo "   Expected: $WORKFLOW_FILE"
    ALL_CHECKS_PASSED=false
fi
echo ""

# =============================================================================
# SUMMARY
# =============================================================================
echo "═══════════════════════════════════════════════════════════════"
if [ "$ALL_CHECKS_PASSED" == true ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Add GitHub Secrets (see CICD_SETUP_GUIDE.md):"
    echo "      - AWS_ACCESS_KEY_ID"
    echo "      - AWS_SECRET_ACCESS_KEY"
    echo "      - EC2_SSH_PRIVATE_KEY"
    echo ""
    echo "   2. Test the pipeline:"
    echo "      - Make a small change to any service"
    echo "      - Commit and push to main branch"
    echo "      - Check GitHub Actions tab"
    echo ""
    echo "   3. Monitor deployment in GitHub Actions"
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before using the CI/CD pipeline."
    echo "See CICD_SETUP_GUIDE.md for detailed instructions."
fi
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Exit with appropriate code
if [ "$ALL_CHECKS_PASSED" == true ]; then
    exit 0
else
    exit 1
fi


