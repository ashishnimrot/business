#!/bin/bash
# Check public access to EC2 instance
# Usage: bash scripts/check-public-access.sh [region] [aws-profile]

set -e

REGION=${1:-ap-south-1}
AWS_PROFILE=${AWS_PROFILE:-${2:-business-app}}

AWS_CMD="aws"
if [ -n "$AWS_PROFILE" ]; then
    AWS_CMD="aws --profile $AWS_PROFILE"
    export AWS_PROFILE
fi

echo "🔍 Checking Public Access Configuration"
echo "========================================"
echo ""

# Get instance details
echo "1️⃣ Finding EC2 instance..."
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
        echo "❌ No running instance found"
        exit 1
    fi
    echo "   Found instance: $INSTANCE_ID (may not be business-app-beta)"
fi

echo "✅ Found instance: $INSTANCE_ID"
echo ""

# Get public IP
echo "2️⃣ Getting instance details..."
PUBLIC_IP=$($AWS_CMD ec2 describe-instances \
    --region $REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

SG_ID=$($AWS_CMD ec2 describe-instances \
    --region $REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)

echo "   Public IP: $PUBLIC_IP"
echo "   Security Group: $SG_ID"
echo ""

# Check security group rules
echo "3️⃣ Checking security group rules..."
HTTP_RULE=$($AWS_CMD ec2 describe-security-groups \
    --region $REGION \
    --group-ids $SG_ID \
    --query 'SecurityGroups[0].IpPermissions[?FromPort==`80`]' \
    --output json 2>/dev/null || echo "[]")

HTTPS_RULE=$($AWS_CMD ec2 describe-security-groups \
    --region $REGION \
    --group-ids $SG_ID \
    --query 'SecurityGroups[0].IpPermissions[?FromPort==`443`]' \
    --output json 2>/dev/null || echo "[]")

if echo "$HTTP_RULE" | grep -q "80"; then
    echo "✅ Port 80 (HTTP) is allowed"
else
    echo "❌ Port 80 (HTTP) is NOT allowed"
    echo ""
    echo "   Adding port 80 to security group..."
    $AWS_CMD ec2 authorize-security-group-ingress \
        --region $REGION \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 2>/dev/null && echo "   ✅ Port 80 added" || echo "   ⚠️  Failed to add (may already exist)"
fi

if echo "$HTTPS_RULE" | grep -q "443"; then
    echo "✅ Port 443 (HTTPS) is allowed"
else
    echo "⚠️  Port 443 (HTTPS) is NOT allowed (needed for SSL)"
fi
echo ""

# Check DNS
echo "4️⃣ Checking DNS configuration..."
DOMAIN="samriddhi.buzz"
DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null | head -1 || echo "")

if [ -z "$DOMAIN_IP" ]; then
    echo "⚠️  Domain $DOMAIN is not resolving"
    echo "   DNS may not be configured yet"
elif [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
    echo "✅ Domain $DOMAIN resolves to correct IP: $DOMAIN_IP"
else
    echo "⚠️  Domain $DOMAIN resolves to: $DOMAIN_IP"
    echo "   Expected: $PUBLIC_IP"
    echo "   DNS may need to be updated"
fi
echo ""

# Test connectivity
echo "5️⃣ Testing connectivity..."
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
    echo "   Testing HTTP connection to $PUBLIC_IP..."
    if curl -s -f -m 5 "http://$PUBLIC_IP" > /dev/null 2>&1; then
        echo "✅ HTTP connection successful: http://$PUBLIC_IP"
    else
        echo "❌ HTTP connection failed: http://$PUBLIC_IP"
        echo "   This may indicate:"
        echo "   - Security group blocking port 80"
        echo "   - Nginx not running on instance"
        echo "   - Firewall blocking connection"
    fi
    
    if [ -n "$DOMAIN_IP" ] && [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
        echo ""
        echo "   Testing HTTP connection to $DOMAIN..."
        if curl -s -f -m 5 "http://$DOMAIN" > /dev/null 2>&1; then
            echo "✅ HTTP connection successful: http://$DOMAIN"
        else
            echo "❌ HTTP connection failed: http://$DOMAIN"
            echo "   DNS may not be fully propagated"
        fi
    fi
else
    echo "⚠️  Public IP not available"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📋 SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Instance: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Security Group: $SG_ID"
echo ""
echo "🌐 Access URLs:"
echo "   http://$PUBLIC_IP"
if [ -n "$DOMAIN_IP" ] && [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
    echo "   http://$DOMAIN"
fi
echo ""
echo "💡 Next Steps:"
if echo "$HTTP_RULE" | grep -q "80"; then
    echo "   ✅ Port 80 is open"
else
    echo "   ⚠️  Port 80 needs to be added to security group"
    echo "      Run: bash scripts/add-https-port.sh $REGION (for port 80)"
fi

if [ -z "$DOMAIN_IP" ] || [ "$DOMAIN_IP" != "$PUBLIC_IP" ]; then
    echo "   ⚠️  DNS needs to be configured"
    echo "      Add A record: $DOMAIN → $PUBLIC_IP"
fi
echo ""

