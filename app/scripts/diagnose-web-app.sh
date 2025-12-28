#!/bin/bash
# Diagnostic script for web-app container issues

set -e

echo "🔍 Web-App Container Diagnostics"
echo "=================================="
echo ""

# Check if container exists
if ! docker ps -a | grep -q business-web-app; then
    echo "❌ Container 'business-web-app' not found"
    exit 1
fi

echo "1️⃣ Container Status:"
echo "-------------------"
docker ps -a | grep business-web-app
echo ""

echo "2️⃣ Recent Logs (last 50 lines):"
echo "-------------------"
docker logs business-web-app --tail 50 2>&1 || true
echo ""

echo "3️⃣ Full Error Logs:"
echo "-------------------"
docker logs business-web-app 2>&1 | grep -i "error\|fatal\|exception" | tail -20 || echo "No errors found in logs"
echo ""

echo "4️⃣ Container Exit Code:"
echo "-------------------"
docker inspect business-web-app --format='{{.State.ExitCode}}' 2>/dev/null || echo "Could not get exit code"
echo ""

echo "5️⃣ Environment Variables:"
echo "-------------------"
docker inspect business-web-app --format='{{range .Config.Env}}{{println .}}{{end}}' | grep -E "NEXT_PUBLIC|NODE_ENV" || echo "No environment variables found"
echo ""

echo "6️⃣ Port Mapping:"
echo "-------------------"
docker port business-web-app 2>/dev/null || echo "No port mapping found"
echo ""

echo "7️⃣ Resource Usage:"
echo "-------------------"
docker stats business-web-app --no-stream 2>/dev/null || echo "Container not running"
echo ""

echo "8️⃣ Check if port 3000 is in use:"
echo "-------------------"
netstat -tuln | grep ":3000" || echo "Port 3000 is not in use"
echo ""

echo "9️⃣ Docker Compose Status:"
echo "-------------------"
cd /opt/business-app/app 2>/dev/null && docker-compose -f docker-compose.prod.yml ps web-app 2>/dev/null || echo "Could not check docker-compose status"
echo ""

echo "🔟 Suggested Fixes:"
echo "-------------------"
echo "1. Check full logs: docker logs business-web-app"
echo "2. Restart container: docker restart business-web-app"
echo "3. Rebuild web-app: cd /opt/business-app/app && docker-compose -f docker-compose.prod.yml build --no-cache web-app"
echo "4. Check disk space: df -h"
echo "5. Check memory: free -h"
echo ""

