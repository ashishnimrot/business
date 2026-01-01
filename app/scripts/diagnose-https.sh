#!/bin/bash
# Diagnose HTTPS/SSL Issues on EC2
# Usage: sudo bash scripts/diagnose-https.sh [domain]
# Example: sudo bash scripts/diagnose-https.sh samriddhi.buzz

set -e

DOMAIN=${1:-samriddhi.buzz}

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     HTTPS/SSL DIAGNOSTIC TOOL                                  ║"
echo "║     Domain: $DOMAIN                                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs sudo privileges"
    echo "   Run: sudo bash $0"
    exit 1
fi

# Step 1: Check Nginx status
echo "📋 Step 1/8: Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running"
    echo "   Run: sudo systemctl start nginx"
    exit 1
fi
echo ""

# Step 2: Check if Nginx is listening on port 443
echo "📋 Step 2/8: Checking if Nginx is listening on port 443..."
if netstat -tlnp 2>/dev/null | grep -q ":443 " || ss -tlnp 2>/dev/null | grep -q ":443 "; then
    echo "✅ Nginx is listening on port 443"
else
    echo "❌ Nginx is NOT listening on port 443"
    echo "   This means HTTPS is not configured"
fi
echo ""

# Step 3: Check Nginx configuration
echo "📋 Step 3/8: Checking Nginx SSL configuration..."
if grep -q "listen 443" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    echo "✅ Nginx config has 'listen 443' directive"
else
    echo "❌ Nginx config missing 'listen 443' directive"
    echo "   SSL may not be properly configured"
fi

if grep -q "ssl_certificate" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    echo "✅ Nginx config has SSL certificate paths"
    SSL_CERT=$(grep "ssl_certificate " /etc/nginx/conf.d/business-app.conf | head -1 | awk '{print $2}' | tr -d ';')
    if [ -f "$SSL_CERT" ]; then
        echo "✅ SSL certificate file exists: $SSL_CERT"
    else
        echo "❌ SSL certificate file NOT found: $SSL_CERT"
    fi
else
    echo "❌ Nginx config missing SSL certificate configuration"
fi
echo ""

# Step 4: Check Certbot certificates
echo "📋 Step 4/8: Checking Certbot certificates..."
if command -v certbot &> /dev/null; then
    CERT_STATUS=$(certbot certificates 2>/dev/null | grep -A 5 "$DOMAIN" || echo "")
    if [ -n "$CERT_STATUS" ]; then
        echo "✅ Certificate found for $DOMAIN"
        echo "$CERT_STATUS" | head -10
    else
        echo "❌ No certificate found for $DOMAIN"
        echo "   Run: sudo certbot certificates"
    fi
else
    echo "⚠️  Certbot not installed"
fi
echo ""

# Step 5: Test Nginx configuration
echo "📋 Step 5/8: Testing Nginx configuration..."
if nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    nginx -t
    exit 1
fi
echo ""

# Step 6: Check local HTTPS connectivity
echo "📋 Step 6/8: Testing local HTTPS connectivity..."
if curl -k -s -f -m 5 "https://localhost" > /dev/null 2>&1; then
    echo "✅ HTTPS is working locally"
elif curl -k -s -f -m 5 "https://127.0.0.1" > /dev/null 2>&1; then
    echo "✅ HTTPS is working on 127.0.0.1"
else
    echo "❌ HTTPS is NOT working locally"
    echo "   This suggests Nginx SSL configuration issue"
fi
echo ""

# Step 7: Check public IP and DNS
echo "📋 Step 7/8: Checking public IP and DNS..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Unable to fetch")
DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null | head -1 || echo "")

echo "EC2 Public IP: $PUBLIC_IP"
echo "Domain resolves to: $DOMAIN_IP"

if [ -n "$DOMAIN_IP" ] && [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
    echo "✅ Domain is pointing to correct IP"
elif [ -n "$DOMAIN_IP" ]; then
    echo "⚠️  Domain IP ($DOMAIN_IP) doesn't match EC2 IP ($PUBLIC_IP)"
else
    echo "⚠️  Domain not resolving (DNS propagation may be in progress)"
fi
echo ""

# Step 8: Check security group (from EC2 metadata)
echo "📋 Step 8/8: Security Group Information..."
echo "⚠️  Note: Cannot directly check security group rules from EC2"
echo "   You need to check from AWS Console or CLI:"
echo "   - AWS Console: EC2 > Security Groups > Find your instance's SG"
echo "   - CLI: aws ec2 describe-security-groups --group-ids <sg-id>"
echo "   - Make sure port 443 (HTTPS) is allowed from 0.0.0.0/0"
echo ""

# Summary and recommendations
echo "═══════════════════════════════════════════════════════════════"
echo "📊 DIAGNOSTIC SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if port 443 is listening
if netstat -tlnp 2>/dev/null | grep -q ":443 " || ss -tlnp 2>/dev/null | grep -q ":443 "; then
    echo "✅ Port 443: Listening"
else
    echo "❌ Port 443: NOT listening"
    echo "   → Run: sudo bash scripts/setup-ssl-ec2.sh $DOMAIN"
fi

# Check if SSL cert exists
if grep -q "ssl_certificate" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    SSL_CERT=$(grep "ssl_certificate " /etc/nginx/conf.d/business-app.conf | head -1 | awk '{print $2}' | tr -d ';')
    if [ -f "$SSL_CERT" ]; then
        echo "✅ SSL Certificate: Found"
    else
        echo "❌ SSL Certificate: Missing"
        echo "   → Run: sudo bash scripts/setup-ssl-ec2.sh $DOMAIN"
    fi
else
    echo "❌ SSL Certificate: Not configured"
    echo "   → Run: sudo bash scripts/setup-ssl-ec2.sh $DOMAIN"
fi

# Check Nginx status
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Running"
else
    echo "❌ Nginx: Not running"
    echo "   → Run: sudo systemctl start nginx"
fi

echo ""
echo "🔧 RECOMMENDED ACTIONS:"
echo "─────────────────────────────────────────────────────────────"
echo ""

# If port 443 not listening, suggest SSL setup
if ! (netstat -tlnp 2>/dev/null | grep -q ":443 " || ss -tlnp 2>/dev/null | grep -q ":443 "); then
    echo "1. Re-run SSL setup:"
    echo "   sudo bash scripts/setup-ssl-ec2.sh $DOMAIN admin@$DOMAIN"
    echo ""
fi

echo "2. Check security group from your local machine:"
echo "   cd app"
echo "   AWS_PROFILE=business-app bash scripts/add-https-port.sh ap-south-1"
echo ""

echo "3. Test HTTPS from EC2:"
echo "   curl -I https://$DOMAIN"
echo "   curl -I https://localhost"
echo ""

echo "4. Check Nginx error logs:"
echo "   sudo tail -50 /var/log/nginx/error.log"
echo ""

echo "5. Check Certbot logs:"
echo "   sudo tail -50 /var/log/letsencrypt/letsencrypt.log"
echo ""

