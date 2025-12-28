# Commands to Run on EC2 Instance

You're now SSH'd into the instance. Run these commands to check and fix the deployment.

## Quick Status Check

### 1. Check Docker Services
```bash
docker ps
```

### 2. Check All Services (including stopped)
```bash
docker ps -a
```

### 3. Check if app directory exists
```bash
ls -la /opt/business-app/app
```

### 4. Check deployment logs
```bash
sudo tail -100 /var/log/user-data.log
```

### 5. Check Nginx
```bash
sudo systemctl status nginx
```

### 6. Check if web app is accessible locally
```bash
curl -I http://localhost:3000
```

## Fix Common Issues

### If Services Are Not Running

```bash
cd /opt/business-app/app

# Check if docker-compose file exists
ls -la docker-compose.prod.yml

# Check environment file
cat .env.production

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait a bit
sleep 30

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### If App Directory Doesn't Exist

```bash
# Clone repository
sudo mkdir -p /opt/business-app
sudo chown ec2-user:ec2-user /opt/business-app
cd /opt/business-app
git clone https://github.com/ashishnimrot/business.git .
cd app

# Create environment file
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

cat > .env.production <<EOF
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
ENABLE_SYNC=true
EOF

# Build and start
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### If Nginx Is Not Running

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check config
sudo nginx -t

# Restart if needed
sudo systemctl restart nginx
```

### Check Service Logs

```bash
cd /opt/business-app/app

# All services
docker-compose -f docker-compose.prod.yml logs --tail=50

# Specific service
docker logs business-web-app --tail=50
docker logs business-auth --tail=50
docker logs business-postgres --tail=50
```

### Restart Everything

```bash
cd /opt/business-app/app

# Stop all
docker-compose -f docker-compose.prod.yml down

# Start all
docker-compose -f docker-compose.prod.yml up -d

# Wait
sleep 60

# Check
docker-compose -f docker-compose.prod.yml ps

# Restart Nginx
sudo systemctl restart nginx
```

## Run Verification Script

```bash
/home/ec2-user/verify-deployment.sh
```

Or if it doesn't exist:

```bash
cd /opt/business-app/app
bash scripts/verify-deployment.sh
```

## Test Local Access

```bash
# Test web app
curl -I http://localhost:3000

# Test API
curl http://localhost/api/v1/auth/health

# Test via Nginx
curl -I http://localhost
```

