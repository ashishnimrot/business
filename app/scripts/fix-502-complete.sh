#!/bin/bash
# Complete fix for 502 Bad Gateway - Restart services with port mappings and fix Nginx

set -e

echo "🔧 Complete 502 Fix - Port Mappings + Nginx"
echo "============================================"
echo ""

cd /opt/business-app/app

# 1. Pull latest code
echo "1️⃣ Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing..."
echo ""

# 2. Stop all services
echo "2️⃣ Stopping all services..."
docker-compose -f docker-compose.prod.yml down
echo ""

# 3. Start services with new port mappings
echo "3️⃣ Starting services with port mappings..."
docker-compose -f docker-compose.prod.yml up -d
echo ""

# 4. Wait for services to start
echo "4️⃣ Waiting for services to start (30 seconds)..."
sleep 30
echo ""

# 5. Check if ports are exposed
echo "5️⃣ Checking exposed ports..."
EXPOSED_PORTS=$(netstat -tuln 2>/dev/null | grep -E ":300[2-7]" || echo "")
if [ -n "$EXPOSED_PORTS" ]; then
    echo "✅ Ports exposed:"
    echo "$EXPOSED_PORTS"
else
    echo "⚠️  No ports found on 3002-3007"
    echo "   Checking Docker port mappings..."
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep business
fi
echo ""

# 6. Test services directly
echo "6️⃣ Testing services directly..."
for port in 3002 3003 3004 3005 3006 3007; do
    if curl -s -f -m 3 http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ Port $port: Service responding"
    else
        echo "❌ Port $port: Service NOT responding"
    fi
done
echo ""

# 7. Fix Nginx configuration
echo "7️⃣ Updating Nginx configuration..."
sudo tee /etc/nginx/conf.d/business-app.conf <<'NGINX_EOF'
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
    
    # Auth service - preserve full path
    location /api/v1/auth {
        proxy_pass http://auth_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Business service
    location /api/v1/businesses {
        proxy_pass http://business_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Party service
    location /api/v1/parties {
        proxy_pass http://party_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Inventory service
    location /api/v1/items {
        proxy_pass http://inventory_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Stock endpoints
    location /api/v1/stock {
        proxy_pass http://inventory_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Invoice service
    location /api/v1/invoices {
        proxy_pass http://invoice_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Payment service
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

# 8. Test Nginx config
echo "8️⃣ Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi
echo ""

# 9. Restart Nginx
echo "9️⃣ Restarting Nginx..."
sudo systemctl restart nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start"
    exit 1
fi
echo ""

# 10. Final tests
echo "🔟 Final connectivity tests..."
echo ""

echo "Testing auth service directly:"
if curl -s -f -m 5 http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Auth service (port 3002): OK"
else
    echo "❌ Auth service (port 3002): FAILED"
    echo "   Check: docker logs business-auth"
fi

echo ""
echo "Testing via Nginx:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost/api/v1/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"phone":"1234567890","purpose":"login"}' 2>&1)

if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "429" ]; then
    echo "✅ Nginx proxy working (got HTTP $RESPONSE - expected for invalid request)"
elif [ "$RESPONSE" = "502" ]; then
    echo "❌ Still getting 502 - check service logs"
    echo "   docker logs business-auth"
else
    echo "⚠️  Got HTTP $RESPONSE - check response"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps if still failing:"
echo "   1. Check service logs: docker logs business-auth"
echo "   2. Check if ports are exposed: docker ps | grep business"
echo "   3. Check Nginx error log: sudo tail -20 /var/log/nginx/error.log"
echo ""

