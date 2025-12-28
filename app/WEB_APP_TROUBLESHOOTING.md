# Web-App Container Troubleshooting Guide

## Issue: Container Restarting Continuously

If `business-web-app` container shows status "Restarting", follow these steps:

## Quick Diagnosis

Run the diagnostic script on EC2:
```bash
cd /opt/business-app/app
bash scripts/diagnose-web-app.sh
```

Or manually check logs:
```bash
docker logs business-web-app --tail 100
```

## Common Causes & Fixes

### 1. Build Error (Most Common)

**Symptoms:** Container exits immediately after start, logs show build/compilation errors

**Fix:**
```bash
cd /opt/business-app/app

# Rebuild web-app with no cache
docker-compose -f docker-compose.prod.yml build --no-cache web-app

# Start it
docker-compose -f docker-compose.prod.yml up -d web-app

# Check logs
docker logs -f business-web-app
```

### 2. Missing Environment Variables

**Symptoms:** Container starts but crashes, logs show "undefined" or missing env vars

**Fix:**
```bash
cd /opt/business-app/app

# Check environment file
cat .env.production

# Ensure these are set:
# - NODE_ENV=production
# - NEXT_PUBLIC_AUTH_API_URL=http://localhost/api/v1/auth
# - NEXT_PUBLIC_BUSINESS_API_URL=http://localhost/api/v1/business
# - NEXT_PUBLIC_PARTY_API_URL=http://localhost/api/v1/party
# - NEXT_PUBLIC_INVENTORY_API_URL=http://localhost/api/v1/inventory
# - NEXT_PUBLIC_INVOICE_API_URL=http://localhost/api/v1/invoice
# - NEXT_PUBLIC_PAYMENT_API_URL=http://localhost/api/v1/payment

# Restart with env file
docker-compose -f docker-compose.prod.yml up -d web-app
```

### 3. Port Conflict

**Symptoms:** "Port already in use" or "bind: address already in use"

**Fix:**
```bash
# Check what's using port 3000
sudo netstat -tuln | grep 3000
sudo lsof -i :3000

# Stop conflicting service or change port in docker-compose.prod.yml
```

### 4. Healthcheck Failing

**Symptoms:** Container restarts due to failed healthcheck

**Fix:**
```bash
# Temporarily disable healthcheck to see real error
cd /opt/business-app/app

# Edit docker-compose.prod.yml and comment out healthcheck section
# Or check if /api/health endpoint exists

# Check if Next.js is actually running
docker exec business-web-app curl http://localhost:3000 || echo "Not responding"
```

### 5. Out of Memory/Disk Space

**Symptoms:** Container killed, "OOM" in logs

**Fix:**
```bash
# Check disk space
df -h

# Check memory
free -h

# Clean up Docker
docker system prune -a --volumes

# Restart with more resources (if on EC2, consider larger instance)
```

### 6. Missing Dependencies

**Symptoms:** "Cannot find module" errors in logs

**Fix:**
```bash
cd /opt/business-app/app

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml build --no-cache web-app

# Ensure package.json is correct
cd ../web-app
cat package.json | grep -A 5 "scripts"
```

## Step-by-Step Recovery

1. **Stop the container:**
   ```bash
   docker stop business-web-app
   docker rm business-web-app
   ```

2. **Check the build:**
   ```bash
   cd /opt/business-app/app
   docker-compose -f docker-compose.prod.yml build web-app
   ```

3. **Start with logs visible:**
   ```bash
   docker-compose -f docker-compose.prod.yml up web-app
   # Watch for errors, then Ctrl+C
   ```

4. **Start in background:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d web-app
   ```

5. **Monitor logs:**
   ```bash
   docker logs -f business-web-app
   ```

## Verify Fix

After applying fixes, verify:

```bash
# Check container status
docker ps | grep business-web-app

# Should show "Up" status, not "Restarting"

# Check if accessible
curl -I http://localhost:3000

# Should return HTTP 200 or 404 (not connection refused)
```

## Get Help

If issue persists, collect:

```bash
# Full logs
docker logs business-web-app > web-app-logs.txt

# Container inspect
docker inspect business-web-app > web-app-inspect.json

# System info
df -h > disk-space.txt
free -h > memory.txt
docker system df > docker-df.txt
```

