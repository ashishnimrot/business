#!/bin/bash
# Diagnose and fix Nginx connection issues
# Usage: sudo bash scripts/diagnose-and-fix-nginx.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     NGINX DIAGNOSTIC & FIX SCRIPT                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs sudo privileges"
    echo "   Run: sudo bash $0"
    exit 1
fi

# Step 1: Check Nginx status
echo "1️⃣ Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running"
    echo "   Attempting to start..."
    systemctl start nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx started successfully"
    else
        echo "❌ Failed to start Nginx"
        systemctl status nginx
        exit 1
    fi
fi
echo ""

# Step 2: Check Nginx config
echo "2️⃣ Checking Nginx configuration..."
if [ -f /etc/nginx/conf.d/business-app.conf ]; then
    echo "✅ Nginx config file exists"
    if nginx -t 2>&1 | grep -q "successful"; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration has errors:"
        nginx -t
        echo ""
        echo "   Attempting to fix..."
        # Will be fixed in step 3
    fi
else
    echo "❌ Nginx config file NOT found"
    echo "   Will create it in next step"
fi
echo ""

# Step 3: Ensure Nginx config exists and is correct
echo "3️⃣ Ensuring Nginx configuration is correct..."
tee /etc/nginx/conf.d/business-app.conf <<'NGINX_EOF'
upstream auth_service { server localhost:3002; }
upstream business_service { server localhost:3003; }
upstream party_service { server localhost:3004; }
upstream inventory_service { server localhost:3005; }
upstream invoice_service { server localhost:3006; }
upstream payment_service { server localhost:3007; }
upstream web_app { server localhost:3000; }

server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://web_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/v1/auth {
        proxy_pass http://auth_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/v1/businesses {
        proxy_pass http://business_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/v1/parties {
        proxy_pass http://party_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/v1/items {
        proxy_pass http://inventory_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/v1/stock {
        proxy_pass http://inventory_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/v1/invoices {
        proxy_pass http://invoice_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/v1/payments {
        proxy_pass http://payment_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

echo "✅ Nginx configuration updated"
echo ""

# Step 4: Test and restart Nginx
echo "4️⃣ Testing and restarting Nginx..."
if nginx -t; then
    systemctl restart nginx
    sleep 2
    systemctl enable nginx
    echo "✅ Nginx restarted and enabled"
else
    echo "❌ Nginx configuration test failed"
    nginx -t
    exit 1
fi
echo ""

# Step 5: Check if port 80 is listening
echo "5️⃣ Checking if port 80 is listening..."
if netstat -tuln 2>/dev/null | grep -q ":80 " || ss -tuln 2>/dev/null | grep -q ":80 "; then
    echo "✅ Port 80 is listening"
else
    echo "❌ Port 80 is NOT listening"
    echo "   Nginx may not have started correctly"
    systemctl status nginx
    exit 1
fi
echo ""

# Step 6: Check if web app is accessible
echo "6️⃣ Checking if web app is accessible..."
if curl -s -f -m 5 http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Web app is responding on port 3000"
else
    echo "⚠️  Web app not responding on port 3000 (may still be starting)"
fi
echo ""

# Step 7: Test Nginx proxy
echo "7️⃣ Testing Nginx proxy..."
if curl -s -f -m 5 http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx proxy is working (localhost)"
else
    echo "⚠️  Nginx proxy test failed (localhost)"
    echo "   Check Nginx error logs: tail -f /var/log/nginx/error.log"
fi
echo ""

# Step 8: Check security group (if AWS CLI available)
echo "8️⃣ Checking security group configuration..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
if [ -n "$PUBLIC_IP" ]; then
    echo "   Public IP: $PUBLIC_IP"
    echo "   Please verify security group allows port 80 from 0.0.0.0/0"
    echo "   Check: AWS Console → EC2 → Security Groups → Your SG → Inbound Rules"
else
    echo "   Could not determine public IP"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ DIAGNOSTIC COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Summary:"
echo "   - Nginx status: $(systemctl is-active nginx)"
echo "   - Port 80 listening: $(netstat -tuln 2>/dev/null | grep -q ':80 ' && echo 'Yes' || echo 'No')"
echo "   - Config valid: $(nginx -t 2>&1 | grep -q 'successful' && echo 'Yes' || echo 'No')"
echo ""
echo "🌐 Test your domain:"
if [ -n "$PUBLIC_IP" ]; then
    echo "   http://$PUBLIC_IP"
    echo "   http://samriddhi.buzz (if DNS is configured)"
fi
echo ""
echo "💡 If still not accessible:"
echo "   1. Check security group allows port 80"
echo "   2. Check DNS: dig samriddhi.buzz +short"
echo "   3. Check Nginx logs: tail -f /var/log/nginx/error.log"
echo ""

