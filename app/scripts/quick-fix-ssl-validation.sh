#!/bin/bash
# Quick fix for SSL validation - Run this on EC2 to fix Let's Encrypt validation

set -e

echo "🔧 Quick Fix: SSL Validation for Let's Encrypt"
echo "================================================"
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Run with sudo: sudo bash $0"
    exit 1
fi

# Create validation directory
echo "1. Creating Let's Encrypt validation directory..."
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R nginx:nginx /var/www/html 2>/dev/null || chown -R apache:apache /var/www/html 2>/dev/null || true
chmod -R 755 /var/www/html
echo "✅ Directory created"
echo ""

# Check if Nginx config exists
if [ ! -f /etc/nginx/conf.d/business-app.conf ]; then
    echo "❌ Nginx config file not found: /etc/nginx/conf.d/business-app.conf"
    echo "   Run domain setup first: sudo bash scripts/setup-domain-ec2.sh"
    exit 1
fi

# Check if validation path already exists
if grep -q "\.well-known/acme-challenge" /etc/nginx/conf.d/business-app.conf; then
    echo "✅ Validation path already configured in Nginx"
else
    echo "2. Updating Nginx configuration..."
    
    # Backup
    cp /etc/nginx/conf.d/business-app.conf /etc/nginx/conf.d/business-app.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
    
    # Use Python to properly insert the validation block
    python3 << 'PYTHON_EOF'
import re

config_file = '/etc/nginx/conf.d/business-app.conf'

with open(config_file, 'r') as f:
    content = f.read()

# Check if already added
if '.well-known/acme-challenge' in content:
    print("Already configured")
else:
    # Find the server block and add validation path after server_name line
    # Pattern: server_name line followed by optional whitespace and then location or other directives
    pattern = r'(server_name[^;]+;)\s*\n'
    
    # Replacement: add validation block after server_name
    replacement = r'\1\n    \n    # CRITICAL: Allow Let\'s Encrypt validation\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n        try_files $uri =404;\n    }\n    \n'
    
    content = re.sub(pattern, replacement, content, count=1)
    
    # If that didn't work, try a simpler approach - find server_name and add after it
    if '.well-known/acme-challenge' not in content:
        # Find line with server_name
        lines = content.split('\n')
        new_lines = []
        added = False
        
        for i, line in enumerate(lines):
            new_lines.append(line)
            # If we find server_name line and haven't added validation yet
            if 'server_name' in line and not added and '#' not in line:
                # Add validation block after this line
                new_lines.append('')
                new_lines.append('    # CRITICAL: Allow Let\'s Encrypt validation')
                new_lines.append('    location /.well-known/acme-challenge/ {')
                new_lines.append('        root /var/www/html;')
                new_lines.append('        try_files $uri =404;')
                new_lines.append('    }')
                new_lines.append('')
                added = True
        
        content = '\n'.join(new_lines)
    
    with open(config_file, 'w') as f:
        f.write(content)
    print("✅ Nginx configuration updated")
PYTHON_EOF
    
    echo "✅ Configuration updated"
fi
echo ""

# Test and restart Nginx
echo "3. Testing and restarting Nginx..."
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
    echo "❌ Nginx config test failed"
    nginx -t
    exit 1
fi
echo ""

# Test validation path
echo "4. Testing validation path..."
TEST_FILE="/var/www/html/.well-known/acme-challenge/test-$(date +%s)"
echo "test-content" > $TEST_FILE
chmod 644 $TEST_FILE
TEST_NAME=$(basename $TEST_FILE)

DOMAIN="samriddhi.buzz"
sleep 2

# Test from localhost first
if curl -s -f "http://localhost/.well-known/acme-challenge/$TEST_NAME" 2>/dev/null | grep -q "test-content"; then
    echo "✅ Validation path is accessible locally"
    
    # Test from domain (may fail if DNS not propagated)
    if curl -s -f "http://$DOMAIN/.well-known/acme-challenge/$TEST_NAME" 2>/dev/null | grep -q "test-content"; then
        echo "✅ Validation path is accessible via domain"
    else
        echo "⚠️  Domain test failed (may need DNS propagation)"
        echo "   But local test passed, so configuration is correct"
    fi
else
    echo "⚠️  Local validation path test failed"
    echo "   Check Nginx config manually"
fi

rm -f $TEST_FILE
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ FIX COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Next: Run SSL setup again"
echo "   sudo bash scripts/setup-ssl-ec2.sh"
echo ""
echo "💡 If SSL still fails, check:"
echo "   1. DNS is pointing to this server (remove 'Parked' A record)"
echo "   2. Port 80 is accessible from internet"
echo "   3. Nginx config: sudo nginx -t"
echo ""
