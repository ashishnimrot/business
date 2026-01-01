#!/bin/bash
# Complete fix for HTTPS/SSL issues on EC2
# This script diagnoses and fixes common HTTPS problems
# Usage: sudo bash scripts/fix-https-complete.sh [domain] [email]
# Example: sudo bash scripts/fix-https-complete.sh samriddhi.buzz admin@samriddhi.buzz

set -e

DOMAIN=${1:-samriddhi.buzz}
DOMAIN_WWW="www.$DOMAIN"
EMAIL=${2:-admin@$DOMAIN}

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     HTTPS/SSL COMPLETE FIX                                    ║"
echo "║     Domain: $DOMAIN                                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ This script needs sudo privileges"
    echo "   Run: sudo bash $0"
    exit 1
fi

# Step 1: Check current state
echo "🔍 Step 1/8: Diagnosing current state..."
echo "─────────────────────────────────────────────────────────────"

SSL_CERT_EXISTS=false
NGINX_HTTPS_CONFIGURED=false
PORT_443_LISTENING=false
NGINX_RUNNING=false

# Check SSL certificate
if [ -d /etc/letsencrypt/live/$DOMAIN ]; then
    SSL_CERT_EXISTS=true
    echo "✅ SSL certificate exists"
else
    echo "❌ SSL certificate NOT found"
fi

# Check Nginx HTTPS config
if grep -q "listen 443" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    NGINX_HTTPS_CONFIGURED=true
    echo "✅ Nginx configured for HTTPS"
else
    echo "❌ Nginx NOT configured for HTTPS"
fi

# Check port 443
if netstat -tuln 2>/dev/null | grep -q ":443 " || ss -tuln 2>/dev/null | grep -q ":443 "; then
    PORT_443_LISTENING=true
    echo "✅ Port 443 is listening"
else
    echo "⚠️  Port 443 is NOT listening"
fi

# Check Nginx status
if systemctl is-active --quiet nginx; then
    NGINX_RUNNING=true
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running"
fi

echo ""

# Step 2: Ensure domain is configured in Nginx
echo "🔧 Step 2/8: Ensuring domain is configured in Nginx..."
if ! grep -q "$DOMAIN" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    echo "⚠️  Domain not found in Nginx config, updating..."
    
    # Backup current config
    cp /etc/nginx/conf.d/business-app.conf /etc/nginx/conf.d/business-app.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    
    # Update server_name if it exists
    if grep -q "server_name" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
        sed -i "s/server_name .*/server_name $DOMAIN $DOMAIN_WWW;/" /etc/nginx/conf.d/business-app.conf
    else
        # Add server_name after listen 80
        sed -i "/listen 80;/a\    server_name $DOMAIN $DOMAIN_WWW;" /etc/nginx/conf.d/business-app.conf
    fi
    echo "✅ Domain added to Nginx config"
else
    echo "✅ Domain already in Nginx config"
fi
echo ""

# Step 3: Ensure Let's Encrypt validation path is accessible
echo "🔧 Step 3/8: Ensuring Let's Encrypt validation path is accessible..."
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R nginx:nginx /var/www/html 2>/dev/null || chown -R www-data:www-data /var/www/html 2>/dev/null || true
chmod -R 755 /var/www/html

# Check if validation path is in Nginx config
if ! grep -q "\.well-known/acme-challenge" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    echo "⚠️  Adding Let's Encrypt validation path to Nginx config..."
    
    # Find the server block and add validation path before location /
    if grep -q "location /" /etc/nginx/conf.d/business-app.conf; then
        # Insert validation path before location /
        sed -i '/location \//i\    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n        try_files $uri =404;\n    }\n' /etc/nginx/conf.d/business-app.conf
    fi
    echo "✅ Validation path added"
else
    echo "✅ Validation path already configured"
fi

# Test validation path
TEST_FILE="/var/www/html/.well-known/acme-challenge/test-https-fix"
echo "test" > $TEST_FILE
chmod 644 $TEST_FILE
if curl -s -f "http://localhost/.well-known/acme-challenge/test-https-fix" > /dev/null 2>&1; then
    echo "✅ Validation path is accessible"
else
    echo "⚠️  Validation path test failed, but continuing..."
fi
rm -f $TEST_FILE
echo ""

# Step 4: Test and reload Nginx
echo "🔧 Step 4/8: Testing and reloading Nginx..."
if nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
    systemctl reload nginx 2>/dev/null || systemctl restart nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx reloaded successfully"
        NGINX_RUNNING=true
    else
        echo "❌ Nginx failed to reload"
        echo "   Checking error log..."
        tail -20 /var/log/nginx/error.log 2>/dev/null || true
        exit 1
    fi
else
    echo "❌ Nginx configuration has errors"
    nginx -t
    exit 1
fi
echo ""

# Step 5: Check security group (if AWS CLI available)
echo "🔒 Step 5/8: Checking security group for port 443..."
if command -v aws &> /dev/null; then
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "")
    if [ -n "$INSTANCE_ID" ]; then
        REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || echo "ap-south-1")
        SG_ID=$(aws ec2 describe-instances --region $REGION --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text 2>/dev/null || echo "")
        
        if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
            HTTPS_RULE=$(aws ec2 describe-security-groups --region $REGION --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissions[?FromPort==`443`]' --output text 2>/dev/null || echo "")
            
            if [ -n "$HTTPS_RULE" ] && [ "$HTTPS_RULE" != "None" ]; then
                echo "✅ Security group allows port 443"
            else
                echo "⚠️  Security group does NOT allow port 443"
                echo "   Attempting to add port 443 rule..."
                if aws ec2 authorize-security-group-ingress \
                    --region $REGION \
                    --group-id $SG_ID \
                    --protocol tcp \
                    --port 443 \
                    --cidr 0.0.0.0/0 2>/dev/null; then
                    echo "✅ Port 443 added to security group"
                else
                    echo "❌ Failed to add port 443 (may already exist or need manual addition)"
                    echo "   Run manually: aws ec2 authorize-security-group-ingress --region $REGION --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0"
                fi
            fi
        else
            echo "⚠️  Could not determine security group"
        fi
    else
        echo "⚠️  Could not determine instance ID"
    fi
else
    echo "⚠️  AWS CLI not available"
    echo "   Please manually check: EC2 Console → Security Groups → Inbound Rules"
    echo "   Should have: Port 443, Protocol TCP, Source 0.0.0.0/0"
fi
echo ""

# Step 6: Install Certbot if needed
echo "📦 Step 6/8: Checking Certbot installation..."
if ! command -v certbot &> /dev/null; then
    echo "⚠️  Certbot not installed, installing..."
    if [ -f /etc/os-release ] && grep -q "Amazon Linux" /etc/os-release; then
        yum install -y certbot python3-certbot-nginx 2>/dev/null || {
            echo "❌ Failed to install Certbot"
            echo "   Try manually: sudo yum install -y certbot python3-certbot-nginx"
            exit 1
        }
    else
        apt-get update && apt-get install -y certbot python3-certbot-nginx 2>/dev/null || {
            echo "❌ Failed to install Certbot"
            exit 1
        }
    fi
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi
echo ""

# Step 7: Setup SSL certificate
echo "🔐 Step 7/8: Setting up SSL certificate..."
if [ "$SSL_CERT_EXISTS" = false ] || [ "$NGINX_HTTPS_CONFIGURED" = false ]; then
    echo "   Obtaining SSL certificate from Let's Encrypt..."
    echo "   This may take a few minutes..."
    echo ""
    
    # Verify HTTP is working first
    if ! curl -s -f -m 5 "http://$DOMAIN" > /dev/null 2>&1 && ! curl -s -f -m 5 "http://localhost" > /dev/null 2>&1; then
        echo "⚠️  HTTP not responding. Make sure:"
        echo "   1. Nginx is running"
        echo "   2. Services are running"
        echo "   3. DNS is pointing to this server"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Run certbot
    certbot --nginx \
        -d $DOMAIN \
        -d $DOMAIN_WWW \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --redirect 2>&1 || {
        echo ""
        echo "❌ SSL certificate generation failed"
        echo ""
        echo "Common issues:"
        echo "   1. Domain not pointing to this server (check DNS)"
        echo "   2. Port 80 not accessible from internet (check security group)"
        echo "   3. Let's Encrypt rate limit (wait 1 hour)"
        echo ""
        echo "Troubleshooting:"
        echo "   - Check DNS: dig $DOMAIN +short"
        echo "   - Check Nginx: sudo nginx -t"
        echo "   - Check security group allows port 80 and 443"
        echo "   - Check validation path: curl http://$DOMAIN/.well-known/acme-challenge/test"
        echo ""
        echo "⚠️  Continuing with manual SSL setup instructions..."
    }
    
    # Verify SSL was configured
    if [ -d /etc/letsencrypt/live/$DOMAIN ]; then
        echo "✅ SSL certificate obtained"
        SSL_CERT_EXISTS=true
    fi
    
    # Check if Nginx was updated
    if grep -q "listen 443" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
        echo "✅ Nginx configured for HTTPS"
        NGINX_HTTPS_CONFIGURED=true
        systemctl reload nginx
    fi
else
    echo "✅ SSL certificate already exists and Nginx is configured"
fi
echo ""

# Step 8: Final verification
echo "🧪 Step 8/8: Final verification..."
sleep 3

# Check certificate
if [ -d /etc/letsencrypt/live/$DOMAIN ]; then
    echo "✅ SSL certificate: Found"
    if [ -f /etc/letsencrypt/live/$DOMAIN/cert.pem ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem 2>/dev/null | cut -d= -f2 || echo "Unknown")
        echo "   Expires: $EXPIRY"
    fi
else
    echo "❌ SSL certificate: NOT found"
fi

# Check Nginx HTTPS config
if grep -q "listen 443" /etc/nginx/conf.d/business-app.conf 2>/dev/null; then
    echo "✅ Nginx HTTPS config: Present"
else
    echo "❌ Nginx HTTPS config: Missing"
fi

# Check port 443
if netstat -tuln 2>/dev/null | grep -q ":443 " || ss -tuln 2>/dev/null | grep -q ":443 "; then
    echo "✅ Port 443: Listening"
else
    echo "⚠️  Port 443: NOT listening (may need Nginx restart)"
    systemctl restart nginx
    sleep 2
fi

# Test HTTPS locally
echo ""
echo "Testing HTTPS connectivity..."
if curl -s -k -f -m 10 "https://localhost" > /dev/null 2>&1; then
    echo "✅ HTTPS works locally"
elif curl -s -k -f -m 10 "https://127.0.0.1" > /dev/null 2>&1; then
    echo "✅ HTTPS works on localhost"
else
    echo "⚠️  HTTPS not responding locally"
    echo "   Check: sudo tail -20 /var/log/nginx/error.log"
fi

# Test HTTPS externally (if domain resolves)
DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null | head -1 || echo "")
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")

if [ -n "$DOMAIN_IP" ] && [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
    echo ""
    echo "Testing HTTPS externally..."
    if curl -s -f -m 10 "https://$DOMAIN" > /dev/null 2>&1; then
        echo "✅ HTTPS is working externally: https://$DOMAIN"
    else
        echo "⚠️  HTTPS test failed externally"
        echo "   This may be normal if:"
        echo "   - DNS is still propagating"
        echo "   - Certificate was just issued (wait 1-2 minutes)"
        echo "   - Security group needs time to update"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ HTTPS FIX COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$SSL_CERT_EXISTS" = true ] && [ "$NGINX_HTTPS_CONFIGURED" = true ]; then
    echo "🌐 Your application should now be accessible via HTTPS:"
    echo "   ✅ https://$DOMAIN"
    echo "   ✅ https://$DOMAIN_WWW"
    echo "   ✅ http://$DOMAIN (redirects to HTTPS)"
    echo ""
    echo "📋 If HTTPS still not working:"
    echo "   1. Wait 2-3 minutes for changes to propagate"
    echo "   2. Check DNS: dig $DOMAIN +short"
    echo "   3. Check security group allows port 443"
    echo "   4. Test: curl -I https://$DOMAIN"
    echo "   5. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
else
    echo "⚠️  SSL setup may not be complete"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Ensure DNS is pointing to this server"
    echo "   2. Ensure security group allows port 443"
    echo "   3. Run SSL setup manually:"
    echo "      sudo certbot --nginx -d $DOMAIN -d $DOMAIN_WWW --redirect"
    echo "   4. Check logs: sudo tail -f /var/log/letsencrypt/letsencrypt.log"
fi

echo ""
echo "💡 Troubleshooting commands:"
echo "   - Check SSL status: sudo bash scripts/check-ssl-status.sh"
echo "   - View certificate: sudo certbot certificates"
echo "   - Test renewal: sudo certbot renew --dry-run"
echo "   - Check Nginx: sudo nginx -t && sudo systemctl status nginx"
echo ""

