#!/bin/bash
# =============================================================================
# QUICK REBUILD SCRIPT FOR EC2 INSTANCE
# =============================================================================
# Usage: ./rebuild-on-ec2.sh [service-name]
#   - No arguments: Rebuild all services
#   - With service-name: Rebuild specific service only
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$APP_DIR"

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.prod.yml not found${NC}"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Service name (optional argument)
SERVICE_NAME="${1:-}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     REBUILD SERVICES ON EC2                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -n "$SERVICE_NAME" ]; then
    echo -e "${YELLOW}🔄 Rebuilding service: ${SERVICE_NAME}${NC}"
else
    echo -e "${YELLOW}🔄 Rebuilding all services${NC}"
fi

# Stop services (only if rebuilding all)
if [ -z "$SERVICE_NAME" ]; then
    echo -e "${YELLOW}📋 Step 1/4: Stopping services...${NC}"
    docker-compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✅ Services stopped${NC}"
    echo ""
fi

# Rebuild
echo -e "${YELLOW}📋 Step 2/4: Building Docker images...${NC}"
if [ -n "$SERVICE_NAME" ]; then
    docker-compose -f docker-compose.prod.yml build "$SERVICE_NAME"
else
    docker-compose -f docker-compose.prod.yml build
fi
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Start services
echo -e "${YELLOW}📋 Step 3/4: Starting services...${NC}"
if [ -n "$SERVICE_NAME" ]; then
    docker-compose -f docker-compose.prod.yml up -d "$SERVICE_NAME"
else
    docker-compose -f docker-compose.prod.yml up -d
fi
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Wait for services
echo -e "${YELLOW}📋 Step 4/4: Waiting for services to be healthy...${NC}"
sleep 30

# Show status
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Rebuild complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Check status: docker-compose -f docker-compose.prod.yml ps"
echo "   View logs:    docker logs business-<service-name>"

