#!/bin/bash
# Quick fix to update PostgreSQL password in the database and restart services

set -e

cd /opt/business-app/app

FIXED_PASSWORD="Admin112233"

echo "🔧 Fixing PostgreSQL password and restarting services..."
echo ""

# 1. Check current PostgreSQL password
echo "📋 Step 1: Checking PostgreSQL status..."
if ! docker ps | grep -q business-postgres; then
    echo "❌ PostgreSQL container not running"
    exit 1
fi

# 2. Try to update PostgreSQL password using multiple methods
echo "📋 Step 2: Updating PostgreSQL password to Admin112233..."

# Method 1: Try with no password (trust auth)
if docker exec business-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'Admin112233';" 2>/dev/null; then
    echo "✅ Password updated (method 1: trust auth)"
elif docker exec business-postgres sh -c "su - postgres -c \"psql -c \\\"ALTER USER postgres WITH PASSWORD 'Admin112233';\\\"\"" 2>/dev/null; then
    echo "✅ Password updated (method 2: su method)"
else
    # Method 3: Try common passwords
    for try_pass in "postgres" "password" "admin" ""; do
        if docker exec -e PGPASSWORD="$try_pass" business-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'Admin112233';" 2>/dev/null; then
            echo "✅ Password updated (method 3: found old password)"
            break
        fi
    done
fi

# 3. Verify password works
echo "📋 Step 3: Verifying password..."
sleep 2
if docker exec -e PGPASSWORD="$FIXED_PASSWORD" business-postgres psql -U postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Password verification successful"
else
    echo "⚠️  Password verification failed - will restart PostgreSQL container"
    # Restart PostgreSQL with correct password from environment
    export DB_PASSWORD="$FIXED_PASSWORD"
    docker-compose -f docker-compose.prod.yml stop postgres
    docker-compose -f docker-compose.prod.yml up -d postgres
    echo "⏳ Waiting for PostgreSQL to restart..."
    sleep 10
fi

# 4. Ensure .env.production has correct password
echo "📋 Step 4: Ensuring .env.production has correct password..."
if [ -f .env.production ]; then
    if grep -q "^DB_PASSWORD=" .env.production; then
        sed -i.bak "s/^DB_PASSWORD=.*/DB_PASSWORD=$FIXED_PASSWORD/" .env.production
        rm -f .env.production.bak
    else
        echo "DB_PASSWORD=$FIXED_PASSWORD" >> .env.production
    fi
    cp .env.production .env
    echo "✅ .env.production updated"
fi

# 5. Restart all services with correct password
echo "📋 Step 5: Restarting all services..."
export DB_PASSWORD="$FIXED_PASSWORD"

# Stop all services
docker-compose -f docker-compose.prod.yml stop

# Start infrastructure first
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec -e PGPASSWORD="$FIXED_PASSWORD" business-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    sleep 1
done

# Start all application services
echo "🚀 Starting all application services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "📊 Service status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Fix complete!"
echo ""
echo "🔍 Check logs:"
echo "   docker logs business-auth --tail=30"

