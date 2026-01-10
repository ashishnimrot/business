# How to Rebuild Application on EC2 Instance

## Quick Rebuild Commands

### Option 1: Rebuild All Services (Recommended)
```bash
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Rebuild Specific Service
```bash
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml build <service-name>
docker-compose -f docker-compose.prod.yml up -d <service-name>
```

**Available services:**
- `auth-service`
- `business-service`
- `party-service`
- `inventory-service`
- `invoice-service`
- `payment-service`
- `web-app`

### Option 3: Rebuild Without Cache (Clean Build)
```bash
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Option 4: Using Deployment Script (Safest)
```bash
cd /opt/business-app/app
bash scripts/deploy-with-password-check.sh
```

---

## Step-by-Step Rebuild Process

### 1. SSH into EC2 Instance
```bash
ssh ec2-user@<your-ec2-ip>
```

### 2. Navigate to Application Directory
```bash
cd /opt/business-app/app
```

### 3. Check Current Status
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs --tail=50
```

### 4. Stop Services (Optional - rebuild will restart)
```bash
docker-compose -f docker-compose.prod.yml down
```

### 5. Rebuild Services

**Rebuild all services:**
```bash
docker-compose -f docker-compose.prod.yml build
```

**Rebuild specific service:**
```bash
docker-compose -f docker-compose.prod.yml build auth-service
docker-compose -f docker-compose.prod.yml build inventory-service
docker-compose -f docker-compose.prod.yml build web-app
```

**Rebuild with no cache (clean build):**
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 6. Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 7. Verify Services
```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service logs
docker logs business-auth
docker logs business-inventory
docker logs business-web-app
```

---

## Rebuild After Code Changes

### If you've pulled new code:
```bash
cd /opt/business-app/app

# Pull latest code (if using git)
git pull origin main

# Rebuild affected services
docker-compose -f docker-compose.prod.yml build

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

### If only web-app changed:
```bash
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml build web-app
docker-compose -f docker-compose.prod.yml up -d web-app
```

### If only backend services changed:
```bash
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml build auth-service business-service party-service inventory-service invoice-service payment-service
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Issue: Build fails with network errors
```bash
# Retry build
docker-compose -f docker-compose.prod.yml build --no-cache

# Or rebuild specific service
docker-compose -f docker-compose.prod.yml build <service-name>
```

### Issue: Services won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '3002|3003|3004|3005|3006|3007|3000'

# Restart Docker daemon (if needed)
sudo systemctl restart docker
```

### Issue: Database connection errors
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check database password in .env.production
cat .env.production | grep DB_PASSWORD

# Restart PostgreSQL if needed
docker-compose -f docker-compose.prod.yml restart postgres
```

### Issue: Out of disk space
```bash
# Clean up unused Docker resources
docker system prune -a --volumes

# Check disk space
df -h
```

---

## Environment Variables

**Important:** Make sure `.env.production` exists and has correct values:
```bash
cd /opt/business-app/app
cat .env.production
```

**Key variables to check:**
- `DB_PASSWORD` - Must match PostgreSQL password
- `JWT_SECRET` - Should be set
- `NODE_ENV=production`

---

## Complete Rebuild Script

Save this as `rebuild.sh` on EC2:

```bash
#!/bin/bash
set -e

cd /opt/business-app/app

echo "🛑 Stopping services..."
docker-compose -f docker-compose.prod.yml down

echo "🔨 Building services..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "📊 Service status:"
docker-compose -f docker-compose.prod.yml ps

echo "✅ Rebuild complete!"
```

Make it executable:
```bash
chmod +x rebuild.sh
./rebuild.sh
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **Rebuild all** | `docker-compose -f docker-compose.prod.yml build && docker-compose -f docker-compose.prod.yml up -d` |
| **Rebuild one service** | `docker-compose -f docker-compose.prod.yml build <service> && docker-compose -f docker-compose.prod.yml up -d <service>` |
| **View logs** | `docker-compose -f docker-compose.prod.yml logs -f` |
| **Check status** | `docker-compose -f docker-compose.prod.yml ps` |
| **Stop all** | `docker-compose -f docker-compose.prod.yml down` |
| **Restart all** | `docker-compose -f docker-compose.prod.yml restart` |
| **Clean rebuild** | `docker-compose -f docker-compose.prod.yml build --no-cache` |

---

## Notes

1. **Data Preservation:** Using `docker-compose down` (without `-v`) preserves database volumes
2. **Build Time:** First build takes longer, subsequent builds use cache
3. **Service Dependencies:** Services depend on each other, so rebuilding one may require restarting dependent services
4. **Web App:** If only frontend changed, you may only need to rebuild `web-app` service

