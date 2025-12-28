# Troubleshooting Deployment Issues

## Quick Diagnosis Commands

### 1. Check if Instance is Running
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'uptime'
```

### 2. Check Docker Services
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'docker ps'
```

### 3. Check Nginx Status
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'sudo systemctl status nginx'
```

### 4. Check User Data Log (Deployment Progress)
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'sudo tail -100 /var/log/user-data.log'
```

### 5. Check Docker Compose Logs
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'cd /opt/business-app/app && docker-compose -f docker-compose.prod.yml logs --tail=50'
```

### 6. Check Specific Service Logs
```bash
# Check web app
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'docker logs business-web-app --tail=50'

# Check auth service
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'docker logs business-auth --tail=50'

# Check postgres
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'docker logs business-postgres --tail=50'
```

### 7. Check if Services are Listening
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'sudo netstat -tlnp | grep -E "3000|3002|80"'
```

### 8. Check Nginx Configuration
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'sudo nginx -t'
```

### 9. Check Environment Variables
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 'cd /opt/business-app/app && cat .env.production'
```

### 10. Run Full Verification
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 '/home/ec2-user/verify-deployment.sh'
```

## Common Issues and Fixes

### Issue 1: Services Not Started
**Symptoms:** `docker ps` shows no containers or containers are stopped

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps
```

### Issue 2: Nginx Not Running
**Symptoms:** `systemctl status nginx` shows inactive

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
sudo systemctl start nginx
sudo systemctl enable nginx
sudo nginx -t
```

### Issue 3: Nginx Configuration Error
**Symptoms:** `nginx -t` fails

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
sudo nginx -t
# If error, check config:
sudo cat /etc/nginx/conf.d/business-app.conf
# Restart nginx:
sudo systemctl restart nginx
```

### Issue 4: Web App Container Not Running
**Symptoms:** `docker ps` doesn't show `business-web-app`

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml logs web-app
docker-compose -f docker-compose.prod.yml up -d web-app
```

### Issue 5: Database Connection Issues
**Symptoms:** Services can't connect to PostgreSQL

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
# Check if postgres is running
docker ps | grep postgres
# Check postgres logs
docker logs business-postgres --tail=50
# Restart postgres if needed
docker restart business-postgres
```

### Issue 6: Build Failed
**Symptoms:** Containers don't exist or are in error state

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Issue 7: Port Already in Use
**Symptoms:** Services can't bind to ports

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
# Check what's using the ports
sudo netstat -tlnp | grep -E "3000|3002|80"
# Kill conflicting processes or restart services
docker-compose -f /opt/business-app/app/docker-compose.prod.yml restart
```

### Issue 8: Repository Not Cloned
**Symptoms:** `/opt/business-app/app` doesn't exist or is empty

**Fix:**
```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13
sudo rm -rf /opt/business-app
sudo mkdir -p /opt/business-app
sudo chown ec2-user:ec2-user /opt/business-app
cd /opt/business-app
git clone https://github.com/ashishnimrot/business.git .
cd app
# Then rebuild and deploy
```

## Quick Fix Script

Run this to diagnose and fix common issues:

```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 << 'EOF'
echo "🔍 Diagnosing deployment issues..."

# Check Docker
echo "📦 Checking Docker..."
if ! docker ps &>/dev/null; then
    echo "⚠️  Docker not accessible, trying to start..."
    sudo systemctl start docker
fi

# Check if app directory exists
echo "📁 Checking app directory..."
if [ ! -d "/opt/business-app/app" ]; then
    echo "⚠️  App directory missing, cloning repository..."
    sudo mkdir -p /opt/business-app
    sudo chown ec2-user:ec2-user /opt/business-app
    cd /opt/business-app
    git clone https://github.com/ashishnimrot/business.git .
fi

# Check services
echo "🐳 Checking Docker services..."
cd /opt/business-app/app
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ docker-compose.prod.yml not found"
    exit 1
fi

# Check if services are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "⚠️  Services not running, starting..."
    docker-compose -f docker-compose.prod.yml up -d
    sleep 30
fi

# Check Nginx
echo "🌐 Checking Nginx..."
if ! systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx not running, starting..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Check Nginx config
if ! sudo nginx -t; then
    echo "⚠️  Nginx config error, restarting..."
    sudo systemctl restart nginx
fi

echo "✅ Diagnosis complete. Checking status..."
docker-compose -f docker-compose.prod.yml ps
sudo systemctl status nginx --no-pager | head -5
EOF
```

## Manual Restart Everything

If nothing works, restart everything:

```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@43.204.215.13 << 'EOF'
cd /opt/business-app/app

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Restart Docker
sudo systemctl restart docker
sleep 5

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
sleep 60

# Restart Nginx
sudo systemctl restart nginx

# Check status
docker-compose -f docker-compose.prod.yml ps
curl -I http://localhost:3000 || echo "Web app not responding"
curl -I http://localhost/api/v1/auth/health || echo "API not responding"
EOF
```

