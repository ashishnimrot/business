#!/bin/bash
# Script to diagnose network issues on EC2 instance

echo "🔍 Network Diagnostics for EC2 Instance"
echo "========================================"
echo ""

echo "1. Checking internet connectivity..."
if ping -c 3 8.8.8.8 &>/dev/null; then
    echo "✅ Internet connectivity: OK"
else
    echo "❌ Internet connectivity: FAILED"
fi
echo ""

echo "2. Checking DNS resolution..."
if nslookup registry.npmjs.org &>/dev/null; then
    echo "✅ DNS resolution: OK"
else
    echo "❌ DNS resolution: FAILED"
fi
echo ""

echo "3. Testing npm registry connectivity..."
if curl -I https://registry.npmjs.org/ 2>&1 | grep -q "200 OK\|301\|302"; then
    echo "✅ npm registry accessible: OK"
else
    echo "❌ npm registry accessible: FAILED"
    echo "   Response:"
    curl -I https://registry.npmjs.org/ 2>&1 | head -5
fi
echo ""

echo "4. Testing HTTPS connectivity..."
if curl -I https://www.google.com 2>&1 | grep -q "200 OK\|301\|302"; then
    echo "✅ HTTPS connectivity: OK"
else
    echo "❌ HTTPS connectivity: FAILED"
fi
echo ""

echo "5. Checking EC2 instance metadata (to verify we're on AWS)..."
if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/instance-id &>/dev/null; then
    INSTANCE_ID=$(curl -s --max-time 2 http://169.254.169.254/latest/meta-data/instance-id)
    echo "✅ EC2 instance ID: $INSTANCE_ID"
else
    echo "⚠️  Could not access instance metadata"
fi
echo ""

echo "6. Checking network interface..."
ip addr show | grep -E "inet |inet6 " | head -5
echo ""

echo "7. Checking routing table..."
ip route | head -5
echo ""

echo "8. Testing npm install with verbose output..."
echo "   Running: npm config get registry"
npm config get registry
echo ""

echo "9. Checking npm configuration..."
npm config list | grep -E "registry|timeout|retry" || echo "   (using defaults)"
echo ""

echo "10. Testing a simple npm package fetch..."
if timeout 30 npm view express --json &>/dev/null; then
    echo "✅ npm package fetch: OK"
else
    echo "❌ npm package fetch: FAILED (timeout or network error)"
fi
echo ""

echo "========================================"
echo "💡 If network tests fail, possible causes:"
echo "   1. Security group blocking outbound HTTPS (port 443)"
echo "   2. DNS resolution issues"
echo "   3. npm registry rate limiting"
echo "   4. Transient network issues"
echo ""
echo "   Solutions:"
echo "   - Check security group allows outbound HTTPS"
echo "   - Wait a few minutes and retry (rate limiting)"
echo "   - Use npm registry mirror"
echo "   - Build images locally and push to registry"

