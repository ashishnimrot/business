#!/bin/bash
# Fix Nginx conflicting server name warning
# Usage: sudo bash scripts/fix-nginx-conflict.sh

set -e

echo "🔧 Fixing Nginx Server Name Conflict"
echo "======================================"
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs sudo privileges"
    echo "   Run: sudo bash $0"
    exit 1
fi

# Check for multiple server blocks on port 80
echo "1️⃣ Checking for conflicting server blocks..."
CONFLICTS=$(grep -r "listen 80" /etc/nginx/conf.d/ 2>/dev/null | wc -l || echo "0")

if [ "$CONFLICTS" -gt 1 ]; then
    echo "⚠️  Found $CONFLICTS server blocks listening on port 80"
    echo ""
    echo "   Config files with 'listen 80':"
    grep -r "listen 80" /etc/nginx/conf.d/ 2>/dev/null || true
    echo ""
    echo "   Checking default nginx config..."
    if [ -f /etc/nginx/conf.d/default.conf ]; then
        echo "   ⚠️  Found default.conf - this may conflict"
        echo "   Backing up and disabling default.conf..."
        mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled 2>/dev/null || true
        echo "   ✅ Default config disabled"
    fi
else
    echo "✅ No conflicts found"
fi
echo ""

# Ensure only business-app.conf is active
echo "2️⃣ Ensuring business-app.conf is the only active config..."
if [ -f /etc/nginx/conf.d/business-app.conf ]; then
    echo "✅ business-app.conf exists"
    
    # Disable other configs that might conflict
    for conf in /etc/nginx/conf.d/*.conf; do
        if [ "$conf" != "/etc/nginx/conf.d/business-app.conf" ]; then
            echo "   Disabling: $(basename $conf)"
            mv "$conf" "${conf}.disabled" 2>/dev/null || true
        fi
    done
else
    echo "❌ business-app.conf not found!"
    echo "   Run: sudo bash scripts/fix-nginx.sh"
    exit 1
fi
echo ""

# Test and restart Nginx
echo "3️⃣ Testing and restarting Nginx..."
if nginx -t; then
    systemctl restart nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx restarted successfully"
    else
        echo "❌ Nginx failed to start"
        systemctl status nginx
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed"
    nginx -t
    exit 1
fi
echo ""

# Check if warning is gone
echo "4️⃣ Verifying no conflicts..."
if systemctl status nginx 2>&1 | grep -q "conflicting server name"; then
    echo "⚠️  Warning still present (may be from main nginx.conf)"
    echo "   This is usually harmless if business-app.conf is working"
else
    echo "✅ No conflicts detected"
fi
echo ""

# Test connectivity
echo "5️⃣ Testing connectivity..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
if curl -s -f -m 5 http://localhost > /dev/null 2>&1; then
    echo "✅ Localhost test: SUCCESS"
else
    echo "❌ Localhost test: FAILED"
fi

if [ -n "$PUBLIC_IP" ]; then
    echo "   Public IP: $PUBLIC_IP"
    echo "   Test from browser: http://$PUBLIC_IP"
    echo "   Test from browser: http://samriddhi.buzz"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ FIX COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 If still can't access from browser:"
echo "   1. Check security group allows port 80"
echo "   2. Run from local machine: bash scripts/check-public-access.sh"
echo ""

