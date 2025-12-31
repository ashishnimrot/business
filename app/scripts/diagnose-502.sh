#!/bin/bash
# Diagnostic script for 502 Bad Gateway errors

set -e

echo "🔍 Diagnosing 502 Bad Gateway Error"
echo "===================================="
echo ""

# 1. Check if auth service container is running
echo "1️⃣ Checking Auth Service Container:"
echo "-----------------------------------"
if docker ps | grep -q business-auth; then
    echo "✅ Container 'business-auth' is running"
    docker ps | grep business-auth
else
    echo "❌ Container 'business-auth' is NOT running"
    echo "   Run: docker ps -a | grep auth"
fi
echo ""

# 2. Check if auth service is accessible on port 3002
echo "2️⃣ Testing Auth Service on Port 3002:"
echo "-----------------------------------"
if curl -s -f -m 5 http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Auth service responding on port 3002"
    curl -s http://localhost:3002/health | head -5
else
    echo "❌ Auth service NOT responding on port 3002"
    echo "   Testing connection..."
    nc -zv localhost 3002 2>&1 || echo "   Port 3002 is not accessible"
fi
echo ""

# 3. Check Nginx configuration
echo "3️⃣ Checking Nginx Configuration:"
echo "-----------------------------------"
if [ -f "/etc/nginx/conf.d/business-app.conf" ]; then
    echo "✅ Nginx config file exists"
    echo ""
    echo "Auth service location block:"
    grep -A 5 "location /api/v1/auth" /etc/nginx/conf.d/business-app.conf || echo "   ⚠️  Location block not found!"
    echo ""
    echo "Upstream definition:"
    grep "upstream auth_service" /etc/nginx/conf.d/business-app.conf || echo "   ⚠️  Upstream not found!"
else
    echo "❌ Nginx config file NOT found: /etc/nginx/conf.d/business-app.conf"
fi
echo ""

# 4. Test Nginx configuration
echo "4️⃣ Testing Nginx Configuration:"
echo "-----------------------------------"
if sudo nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
fi
echo ""

# 5. Check Nginx error logs
echo "5️⃣ Recent Nginx Error Logs:"
echo "-----------------------------------"
if [ -f "/var/log/nginx/error.log" ]; then
    echo "Last 20 error log entries:"
    sudo tail -20 /var/log/nginx/error.log | grep -i "auth\|502\|bad gateway\|upstream" || echo "   No relevant errors found"
else
    echo "⚠️  Error log file not found"
fi
echo ""

# 6. Test Nginx proxy to auth service
echo "6️⃣ Testing Nginx Proxy to Auth Service:"
echo "-----------------------------------"
echo "Testing: curl -v http://localhost/api/v1/auth/send-otp"
curl -v -X POST http://localhost/api/v1/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"phone":"1234567890"}' \
    2>&1 | head -30
echo ""

# 7. Check Docker network connectivity
echo "7️⃣ Checking Docker Network:"
echo "-----------------------------------"
if docker network ls | grep -q business-network; then
    echo "✅ Docker network 'business-network' exists"
    docker network inspect business-network --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || echo "   Could not inspect network"
else
    echo "⚠️  Docker network 'business-network' not found"
fi
echo ""

# 8. Check if services are on the same network
echo "8️⃣ Checking Service Connectivity:"
echo "-----------------------------------"
AUTH_IP=$(docker inspect business-auth --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null || echo "unknown")
echo "Auth service container IP: $AUTH_IP"
echo ""

# 9. Suggested fixes
echo "═══════════════════════════════════════════════════════════════"
echo "🔧 Suggested Fixes:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "If auth service is not running:"
echo "  cd /opt/business-app/app"
echo "  docker-compose -f docker-compose.prod.yml up -d auth-service"
echo ""
echo "If Nginx config is wrong:"
echo "  cd /opt/business-app/app"
echo "  bash scripts/fix-nginx-routing.sh"
echo ""
echo "If port 3002 is not accessible:"
echo "  docker logs business-auth"
echo "  docker exec business-auth curl http://localhost:3002/health"
echo ""
echo "To check all services:"
echo "  docker ps"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""

