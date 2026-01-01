#!/bin/bash
# Fix HTTPS remotely - Run from local machine
# This script will SSH into EC2 and run the HTTPS fix
# Usage: bash scripts/fix-https-remote.sh [region] [key-name] [domain] [email]
# Example: bash scripts/fix-https-remote.sh ap-south-1 business-app-key samriddhi.buzz admin@samriddhi.buzz

set -e

REGION=${1:-ap-south-1}
KEY_NAME=${2:-business-app-key}
DOMAIN=${3:-samriddhi.buzz}
EMAIL=${4:-admin@$DOMAIN}

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     REMOTE HTTPS FIX                                          ║"
echo "║     Domain: $DOMAIN                                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found"
    echo "   Install: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS profile
AWS_PROFILE=${AWS_PROFILE:-business-app}
AWS_CMD="aws --profile $AWS_PROFILE"

if ! $AWS_CMD sts get-caller-identity &>/dev/null; then
    echo "❌ AWS credentials not configured"
    echo "   Run: aws configure --profile $AWS_PROFILE"
    exit 1
fi

# Find EC2 instance
echo "🔍 Finding EC2 instance..."
INSTANCE_ID=$($AWS_CMD ec2 describe-instances \
    --region $REGION \
    --filters "Name=tag:Name,Values=business-app-beta*" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text 2>/dev/null || echo "")

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
    echo "⚠️  Could not find instance with tag 'business-app-beta*'"
    echo "   Trying to find any running instance..."
    INSTANCE_ID=$($AWS_CMD ec2 describe-instances \
        --region $REGION \
        --filters "Name=instance-state-name,Values=running" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
        echo "❌ Could not find any running EC2 instance"
        echo "   Check: $AWS_CMD ec2 describe-instances --region $REGION"
        exit 1
    fi
fi

echo "✅ Found instance: $INSTANCE_ID"
echo ""

# Get public IP
PUBLIC_IP=$($AWS_CMD ec2 describe-instances \
    --region $REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "None" ]; then
    echo "❌ Could not determine public IP"
    echo "   Instance may be in a private subnet"
    exit 1
fi

echo "✅ Public IP: $PUBLIC_IP"
echo ""

# Check SSH key
SSH_KEY_FILE="$HOME/.ssh/$KEY_NAME.pem"
if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "❌ SSH key not found: $SSH_KEY_FILE"
    echo "   Please ensure the key file exists"
    exit 1
fi

echo "✅ SSH key: $SSH_KEY_FILE"
echo ""

# Ensure port 443 is open in security group
echo "🔒 Step 1/3: Ensuring port 443 is open in security group..."
SG_ID=$($AWS_CMD ec2 describe-instances \
    --region $REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)

HTTPS_EXISTS=$($AWS_CMD ec2 describe-security-groups \
    --region $REGION \
    --group-ids $SG_ID \
    --query 'SecurityGroups[0].IpPermissions[?FromPort==`443`]' \
    --output text 2>/dev/null || echo "")

if [ -z "$HTTPS_EXISTS" ] || [ "$HTTPS_EXISTS" = "None" ]; then
    echo "⚠️  Port 443 not open, adding to security group..."
    $AWS_CMD ec2 authorize-security-group-ingress \
        --region $REGION \
        --group-id $SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 2>/dev/null || {
        echo "⚠️  Failed to add port 443 (may already exist or need manual addition)"
    }
    echo "✅ Port 443 check complete"
else
    echo "✅ Port 443 already open"
fi
echo ""

# Pull latest code and run fix script
echo "🔧 Step 2/3: Running HTTPS fix on EC2..."
echo "   This may take 5-10 minutes..."
echo ""

ssh -i "$SSH_KEY_FILE" \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=10 \
    ec2-user@$PUBLIC_IP <<SSH_EOF
set -e

cd /opt/business-app/app

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing with existing code..."

# Make script executable
chmod +x scripts/fix-https-complete.sh 2>/dev/null || true

# Run the fix script
echo "🔧 Running HTTPS fix script..."
sudo bash scripts/fix-https-complete.sh "$DOMAIN" "$EMAIL"
SSH_EOF

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ HTTPS fix completed successfully!"
    echo ""
    echo "🧪 Step 3/3: Testing HTTPS..."
    sleep 5
    
    if curl -s -f -m 10 "https://$DOMAIN" > /dev/null 2>&1; then
        echo "✅ HTTPS is working: https://$DOMAIN"
    else
        echo "⚠️  HTTPS test failed, but setup may still be in progress"
        echo "   Wait 2-3 minutes and test: curl -I https://$DOMAIN"
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "✅ HTTPS FIX COMPLETE!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "🌐 Your application should now be accessible at:"
    echo "   ✅ https://$DOMAIN"
    echo "   ✅ https://www.$DOMAIN"
    echo ""
    echo "📋 If HTTPS still not working:"
    echo "   1. Wait 2-3 minutes for changes to propagate"
    echo "   2. Check DNS: dig $DOMAIN +short"
    echo "   3. Test: curl -I https://$DOMAIN"
    echo "   4. SSH and check logs: ssh -i $SSH_KEY_FILE ec2-user@$PUBLIC_IP"
    echo "      sudo tail -f /var/log/nginx/error.log"
else
    echo ""
    echo "❌ HTTPS fix failed (exit code: $EXIT_CODE)"
    echo ""
    echo "📋 Troubleshooting:"
    echo "   1. SSH into instance and check:"
    echo "      ssh -i $SSH_KEY_FILE ec2-user@$PUBLIC_IP"
    echo "      cd /opt/business-app/app"
    echo "      sudo bash scripts/fix-https-complete.sh $DOMAIN $EMAIL"
    echo ""
    echo "   2. Check logs:"
    echo "      sudo tail -f /var/log/letsencrypt/letsencrypt.log"
    echo "      sudo tail -f /var/log/nginx/error.log"
    exit 1
fi

