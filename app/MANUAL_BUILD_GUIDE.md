# Manual Service Build Guide

When automated builds fail due to network issues, building services one by one gives you more control and helps identify problematic services.

## Quick Start

```bash
cd /opt/business-app/app
sudo -u ec2-user bash scripts/manual-build-services.sh
```

## Manual Step-by-Step Build

### 1. Load Environment Variables

```bash
cd /opt/business-app/app

# Load environment variables
while IFS= read -r line || [ -n "$line" ]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^[A-Z_][A-Z0-9_]*= ]]; then
        key="${line%%=*}"
        value="${line#*=}"
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        value=$(echo "$value" | sed "s/^['\"]//; s/['\"]\$//")
        export "$key=$value"
    fi
done < .env.production
```

### 2. Build Services One by One

Build each service individually. If one fails, you can retry just that service:

```bash
# Build auth-service
docker-compose -f docker-compose.prod.yml build auth-service

# Build business-service
docker-compose -f docker-compose.prod.yml build business-service

# Build party-service
docker-compose -f docker-compose.prod.yml build party-service

# Build inventory-service
docker-compose -f docker-compose.prod.yml build inventory-service

# Build invoice-service
docker-compose -f docker-compose.prod.yml build invoice-service

# Build payment-service
docker-compose -f docker-compose.prod.yml build payment-service

# Build web-app
docker-compose -f docker-compose.prod.yml build web-app
```

### 3. Retry Failed Services

If a service fails, wait a few minutes (for rate limiting to reset) and retry:

```bash
# Wait 2-3 minutes for npm rate limit to reset
sleep 180

# Retry the failed service
docker-compose -f docker-compose.prod.yml build <service-name>
```

### 4. Check Build Status

```bash
# See which images were built
docker images | grep app-

# See build logs for a specific service
docker-compose -f docker-compose.prod.yml build <service-name> --progress=plain
```

### 5. Start Services

Once all services are built:

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Or start specific services
docker-compose -f docker-compose.prod.yml up -d auth-service business-service

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Troubleshooting Individual Services

### If a service keeps failing:

1. **Check network connectivity:**
   ```bash
   curl -I https://registry.npmjs.org
   ```

2. **Try building with verbose output:**
   ```bash
   docker-compose -f docker-compose.prod.yml build <service-name> --progress=plain --no-cache
   ```

3. **Check Docker logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs <service-name>
   ```

4. **Clean and rebuild:**
   ```bash
   docker-compose -f docker-compose.prod.yml build <service-name> --no-cache
   ```

## Build Order Recommendations

If you're having network issues, build in this order (smallest to largest):

1. `auth-service` (usually smallest)
2. `party-service`
3. `business-service`
4. `inventory-service`
5. `invoice-service`
6. `payment-service`
7. `web-app` (usually largest, depends on all backend services)

## Tips

- **Wait between builds**: If you hit rate limits, wait 2-3 minutes between builds
- **Build during off-peak hours**: npm registry is less busy
- **Use `--no-cache` sparingly**: Only if you suspect cache issues
- **Check disk space**: `df -h` - ensure you have enough space
- **Monitor memory**: `free -h` - t3.micro has limited RAM

## Quick Commands Reference

```bash
# Build all services (one command)
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build <service-name>

# Build without cache
docker-compose -f docker-compose.prod.yml build --no-cache <service-name>

# See what will be built
docker-compose -f docker-compose.prod.yml config

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f <service-name>

# Stop services
docker-compose -f docker-compose.prod.yml down

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

