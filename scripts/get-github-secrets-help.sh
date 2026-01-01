#!/bin/bash
# =============================================================================
# GITHUB SECRETS HELPER SCRIPT
# =============================================================================
# Helps you prepare values for GitHub Secrets
# =============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     GITHUB SECRETS HELPER                                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
AWS_PROFILE=${AWS_PROFILE:-business-app}
KEY_NAME=${1:-business-app-key}

AWS_CMD="aws --profile $AWS_PROFILE"
export AWS_PROFILE

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "This script will help you prepare values for GitHub Secrets."
echo ""
echo "📋 You need to add these secrets in GitHub:"
echo "   1. AWS_ACCESS_KEY_ID"
echo "   2. AWS_SECRET_ACCESS_KEY"
echo "   3. EC2_SSH_PRIVATE_KEY"
echo ""

# =============================================================================
# AWS CREDENTIALS
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 AWS Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if AWS credentials are configured
if $AWS_CMD sts get-caller-identity &>/dev/null; then
    echo -e "${GREEN}✅ AWS credentials are configured${NC}"
    echo ""
    echo "To get your AWS credentials:"
    echo "   1. Go to AWS Console: https://console.aws.amazon.com"
    echo "   2. IAM → Users → Your User → Security Credentials"
    echo "   3. Create Access Key (if you don't have one)"
    echo "   4. Copy:"
    echo "      - Access Key ID → GitHub Secret: AWS_ACCESS_KEY_ID"
    echo "      - Secret Access Key → GitHub Secret: AWS_SECRET_ACCESS_KEY"
    echo ""
    echo "⚠️  Note: The secret key is only shown once when created!"
    echo ""
else
    echo -e "${YELLOW}⚠️  AWS credentials not configured${NC}"
    echo ""
    echo "Please configure AWS credentials first:"
    echo "   aws configure --profile $AWS_PROFILE"
    echo ""
fi

# =============================================================================
# SSH PRIVATE KEY
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 SSH Private Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SSH_KEY_FILE="$HOME/.ssh/$KEY_NAME.pem"

if [ -f "$SSH_KEY_FILE" ]; then
    echo -e "${GREEN}✅ SSH key file found: $SSH_KEY_FILE${NC}"
    echo ""
    echo "📋 To add to GitHub Secret (EC2_SSH_PRIVATE_KEY):"
    echo ""
    echo -e "${BLUE}Option 1: Copy the entire file contents${NC}"
    echo "   Run this command and copy everything (including BEGIN/END lines):"
    echo ""
    echo "   ${YELLOW}cat $SSH_KEY_FILE${NC}"
    echo ""
    echo -e "${BLUE}Option 2: View and copy manually${NC}"
    echo "   Open the file and copy all contents:"
    echo ""
    echo "   ${YELLOW}open $SSH_KEY_FILE${NC}"
    echo ""
    echo "⚠️  Important: Copy the ENTIRE file, including:"
    echo "   - -----BEGIN RSA PRIVATE KEY-----"
    echo "   - All the key content"
    echo "   - -----END RSA PRIVATE KEY-----"
    echo ""
    read -p "Do you want to display the key now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "SSH Private Key Contents:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat "$SSH_KEY_FILE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  SSH key file not found: $SSH_KEY_FILE${NC}"
    echo ""
    echo "To get your SSH key:"
    echo "   1. Check if you downloaded it from AWS when creating the key pair"
    echo "   2. Or download from AWS Console:"
    echo "      EC2 → Key Pairs → Select your key → Download"
    echo "   3. Save it to: $SSH_KEY_FILE"
    echo "   4. Set permissions: chmod 600 $SSH_KEY_FILE"
    echo ""
fi

# =============================================================================
# GITHUB INSTRUCTIONS
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 How to Add Secrets to GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to your GitHub repository"
echo "2. Navigate to: Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Add each secret:"
echo ""
echo "   Secret 1:"
echo "   - Name: AWS_ACCESS_KEY_ID"
echo "   - Value: [Your AWS Access Key ID]"
echo ""
echo "   Secret 2:"
echo "   - Name: AWS_SECRET_ACCESS_KEY"
echo "   - Value: [Your AWS Secret Access Key]"
echo ""
echo "   Secret 3:"
echo "   - Name: EC2_SSH_PRIVATE_KEY"
echo "   - Value: [Entire contents of your .pem file]"
echo ""
echo "5. Click 'Add secret' for each"
echo ""
echo "✅ Once all secrets are added, your CI/CD pipeline will work!"
echo ""

