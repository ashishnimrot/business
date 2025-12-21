# DevOps & Infrastructure Guide

**Version:** 1.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Architecture](#infrastructure-architecture)
3. [Cloud Provider Setup (AWS)](#cloud-provider-setup-aws)
4. [Docker Configuration](#docker-configuration)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Configuration](#security-configuration)
9. [Disaster Recovery](#disaster-recovery)
10. [Cost Optimization](#cost-optimization)

---

## Overview

This document provides comprehensive DevOps and infrastructure setup for the Business App. The infrastructure is designed for:
- High availability (99.9% uptime)
- Auto-scaling based on demand
- Multi-region deployment capability
- Security-first approach
- Cost optimization

### Infrastructure Summary

| Component | Technology | Environment |
|-----------|------------|-------------|
| Cloud Provider | AWS | ap-south-1 (Mumbai) |
| Container Orchestration | Kubernetes (EKS) | Production |
| Container Runtime | Docker | All |
| CI/CD | GitHub Actions | Automated |
| Database | PostgreSQL (RDS) | Managed |
| Cache | Redis (ElastiCache) | Managed |
| CDN | CloudFront | Global |
| DNS | Route 53 | Managed |

---

## Infrastructure Architecture

### High-Level Architecture

```
                                    ┌─────────────────────────────────────────┐
                                    │              CloudFront                 │
                                    │           (CDN + WAF)                   │
                                    └─────────────┬───────────────────────────┘
                                                  │
                                    ┌─────────────▼───────────────────────────┐
                                    │         Application Load Balancer       │
                                    │              (ALB)                       │
                                    └─────────────┬───────────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
          ┌─────────▼─────────┐       ┌───────────▼───────────┐     ┌───────────▼───────────┐
          │   API Gateway     │       │    Auth Service       │     │  Other Services       │
          │   (3 replicas)    │       │    (2 replicas)       │     │  (2 replicas each)    │
          └─────────┬─────────┘       └───────────┬───────────┘     └───────────┬───────────┘
                    │                             │                             │
                    └─────────────────────────────┼─────────────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
          ┌─────────▼─────────┐       ┌───────────▼───────────┐     ┌───────────▼───────────┐
          │   PostgreSQL      │       │       Redis           │     │        S3             │
          │   (RDS Multi-AZ)  │       │   (ElastiCache)       │     │     (Storage)         │
          └───────────────────┘       └───────────────────────┘     └───────────────────────┘
```

### Environment Strategy

| Environment | Purpose | Infrastructure | Cost |
|-------------|---------|----------------|------|
| Development | Local development | Docker Compose | Free |
| Staging | Testing & QA | Single node K8s | ~$150/month |
| Production | Live users | Multi-node K8s | ~$500-1000/month |

---

## Cloud Provider Setup (AWS)

### Step 1: Create AWS Account

1. Visit [aws.amazon.com](https://aws.amazon.com)
2. Create account with business email
3. Enable MFA on root account
4. Create IAM admin user
5. Setup billing alerts

### Step 2: Configure AWS CLI

```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure
# AWS Access Key ID: your-access-key
# AWS Secret Access Key: your-secret-key
# Default region: ap-south-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 3: Create VPC and Networking

**Terraform Configuration:**

```hcl
# infrastructure/terraform/vpc.tf

provider "aws" {
  region = "ap-south-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "business-app-vpc"
    Environment = var.environment
  }
}

# Public Subnets (for ALB)
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "business-app-public-${count.index + 1}"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets (for EKS)
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "business-app-private-${count.index + 1}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "business-app-igw"
  }
}

# NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "business-app-nat"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "business-app-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "business-app-private-rt"
  }
}
```

### Step 4: Create RDS (PostgreSQL)

```hcl
# infrastructure/terraform/rds.tf

resource "aws_db_subnet_group" "main" {
  name       = "business-app-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "business-app-db-subnet"
  }
}

resource "aws_security_group" "rds" {
  name        = "business-app-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier     = "business-app-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.environment == "production" ? "db.r6g.large" : "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "business_app"
  username = "postgres"
  password = var.db_password

  multi_az               = var.environment == "production"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring.arn

  deletion_protection = var.environment == "production"
  skip_final_snapshot = var.environment != "production"

  tags = {
    Name        = "business-app-db"
    Environment = var.environment
  }
}
```

### Step 5: Create ElastiCache (Redis)

```hcl
# infrastructure/terraform/elasticache.tf

resource "aws_elasticache_subnet_group" "main" {
  name       = "business-app-redis-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name        = "business-app-redis-sg"
  description = "Security group for Redis"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "business-app-redis"
  description          = "Redis cluster for Business App"

  node_type            = var.environment == "production" ? "cache.r6g.large" : "cache.t3.medium"
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled           = var.environment == "production"

  snapshot_retention_limit = 7
  snapshot_window          = "03:00-04:00"

  tags = {
    Name        = "business-app-redis"
    Environment = var.environment
  }
}
```

---

## Docker Configuration

### Base Docker Setup

**Dockerfile for NestJS Service:**

```dockerfile
# apps/auth-service/Dockerfile

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY apps/auth-service ./apps/auth-service
COPY libs ./libs

# Build the application
RUN npx nx build auth-service --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built application
COPY --from=builder /app/dist/apps/auth-service ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
```

**Docker Compose for Development:**

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: business-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: business_app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - business-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: business-redis
    command: redis-server --requirepass redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis_password", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - business-network

  # API Gateway
  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    container_name: business-api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=redis_password
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - business-network

  # Auth Service
  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    container_name: business-auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=auth_service
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - business-network

  # Business Service
  business-service:
    build:
      context: .
      dockerfile: apps/business-service/Dockerfile
    container_name: business-business-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - PORT=3002
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=business_service
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - business-network

  # Inventory Service
  inventory-service:
    build:
      context: .
      dockerfile: apps/inventory-service/Dockerfile
    container_name: business-inventory-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - PORT=3003
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=inventory_service
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - business-network

  # Invoice Service
  invoice-service:
    build:
      context: .
      dockerfile: apps/invoice-service/Dockerfile
    container_name: business-invoice-service
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - PORT=3004
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=invoice_service
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - business-network

  # pgAdmin (optional)
  pgadmin:
    image: dpage/pgadmin4
    container_name: business-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@business-app.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - business-network

networks:
  business-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

**Main CI/CD Workflow:**

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Lint and Test
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # Security Scan
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk vulnerability scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'

  # Build Docker Images
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    strategy:
      matrix:
        service:
          - api-gateway
          - auth-service
          - business-service
          - inventory-service
          - invoice-service

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/${{ matrix.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name business-app-staging --region ap-south-1

      - name: Deploy to staging
        run: |
          kubectl set image deployment/api-gateway \
            api-gateway=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api-gateway:develop-${{ github.sha }} \
            -n staging
          kubectl rollout status deployment/api-gateway -n staging

  # Deploy to Production
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name business-app-production --region ap-south-1

      - name: Deploy to production (Blue-Green)
        run: |
          # Deploy to green environment
          kubectl apply -f k8s/production/deployment-green.yml
          kubectl rollout status deployment/api-gateway-green -n production
          
          # Run smoke tests
          ./scripts/smoke-tests.sh green
          
          # Switch traffic
          kubectl patch service api-gateway -p '{"spec":{"selector":{"deployment":"green"}}}' -n production
          
          # Scale down blue
          kubectl scale deployment api-gateway-blue --replicas=0 -n production
```

**Database Migration Workflow:**

```yaml
# .github/workflows/database-migration.yml

name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to run migrations'
        required: true
        type: choice
        options:
          - staging
          - production
      action:
        description: 'Migration action'
        required: true
        type: choice
        options:
          - migrate
          - rollback

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          if [ "${{ github.event.inputs.action }}" == "migrate" ]; then
            npx prisma migrate deploy
          else
            npx prisma migrate reset --force
          fi
```

---

## Kubernetes Deployment

### Namespace and ConfigMaps

```yaml
# k8s/base/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: business-app
  labels:
    app: business-app
---
# k8s/base/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: business-app-config
  namespace: business-app
data:
  NODE_ENV: "production"
  API_GATEWAY_PORT: "3000"
  AUTH_SERVICE_PORT: "3001"
  BUSINESS_SERVICE_PORT: "3002"
  INVENTORY_SERVICE_PORT: "3003"
  INVOICE_SERVICE_PORT: "3004"
```

### Service Deployment

```yaml
# k8s/production/api-gateway.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: business-app
  labels:
    app: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: ghcr.io/ashishnimrot/business/api-gateway:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: business-app-config
            - secretRef:
                name: business-app-secrets
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: business-app
spec:
  selector:
    app: api-gateway
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: business-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Ingress Configuration

```yaml
# k8s/production/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: business-app-ingress
  namespace: business-app
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-south-1:xxx:certificate/xxx
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
spec:
  rules:
    - host: api.business-app.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 80
```

---

## Monitoring & Logging

### Prometheus Configuration

```yaml
# k8s/monitoring/prometheus-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - /etc/prometheus/rules/*.yml
    
    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
```

### Grafana Dashboards

```yaml
# k8s/monitoring/grafana-dashboard.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  business-app-dashboard.json: |
    {
      "dashboard": {
        "title": "Business App Overview",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_request_total[5m])) by (service)"
              }
            ]
          },
          {
            "title": "Error Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_request_total{status=~\"5..\"}[5m])) by (service) / sum(rate(http_request_total[5m])) by (service)"
              }
            ]
          },
          {
            "title": "Response Time (p95)",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))"
              }
            ]
          }
        ]
      }
    }
```

### Alerting Rules

```yaml
# k8s/monitoring/alert-rules.yml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: business-app-alerts
  namespace: monitoring
spec:
  groups:
    - name: business-app
      rules:
        - alert: HighErrorRate
          expr: sum(rate(http_request_total{status=~"5.."}[5m])) / sum(rate(http_request_total[5m])) > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate detected"
            description: "Error rate is above 5% for 5 minutes"

        - alert: HighLatency
          expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High latency detected"
            description: "95th percentile latency is above 1 second"

        - alert: PodNotReady
          expr: kube_pod_status_ready{condition="false"} == 1
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Pod not ready"
            description: "Pod {{ $labels.pod }} is not ready"

        - alert: DatabaseConnectionFailed
          expr: pg_up == 0
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "Database connection failed"
            description: "Cannot connect to PostgreSQL database"
```

---

## Security Configuration

### Network Policies

```yaml
# k8s/security/network-policies.yml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: business-app
spec:
  podSelector: {}
  policyTypes:
    - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway
  namespace: business-app
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-internal-services
  namespace: business-app
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 3001
        - protocol: TCP
          port: 3002
        - protocol: TCP
          port: 3003
        - protocol: TCP
          port: 3004
```

### Secrets Management

```yaml
# k8s/security/external-secrets.yml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: business-app-secrets
  namespace: business-app
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: aws-secrets-manager
  target:
    name: business-app-secrets
    creationPolicy: Owner
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: business-app/database
        property: password
    - secretKey: JWT_SECRET
      remoteRef:
        key: business-app/jwt
        property: secret
    - secretKey: REDIS_PASSWORD
      remoteRef:
        key: business-app/redis
        property: password
```

---

## Disaster Recovery

### Backup Strategy

```yaml
# Velero Backup Schedule
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: business-app-daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  template:
    includedNamespaces:
      - business-app
    includedResources:
      - deployments
      - services
      - configmaps
      - secrets
      - persistentvolumeclaims
    storageLocation: aws-s3
    ttl: 720h  # 30 days retention
```

### Database Backup

```bash
#!/bin/bash
# scripts/db-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BUCKET="business-app-backups"
DB_HOST=$RDS_ENDPOINT
DB_NAME="business_app"

# Create backup
pg_dump -h $DB_HOST -U postgres -d $DB_NAME | gzip > backup_$DATE.sql.gz

# Upload to S3
aws s3 cp backup_$DATE.sql.gz s3://$BUCKET/database/backup_$DATE.sql.gz

# Cleanup local file
rm backup_$DATE.sql.gz

# Delete backups older than 30 days
aws s3 ls s3://$BUCKET/database/ | while read -r line;
do
  createDate=`echo $line|awk {'print $1" "$2'}`
  createDate=`date -d"$createDate" +%s`
  olderThan=`date -d"-30 days" +%s`
  if [[ $createDate -lt $olderThan ]]
  then
    fileName=`echo $line|awk {'print $4'}`
    aws s3 rm s3://$BUCKET/database/$fileName
  fi
done
```

---

## Cost Optimization

### Infrastructure Cost Estimation

| Resource | Configuration | Monthly Cost (USD) |
|----------|--------------|-------------------|
| EKS Cluster | 1 cluster | $72 |
| EC2 (Worker Nodes) | 3x t3.medium | $90 |
| RDS (PostgreSQL) | db.t3.medium, Multi-AZ | $120 |
| ElastiCache (Redis) | cache.t3.medium | $50 |
| ALB | 1 load balancer | $25 |
| NAT Gateway | 1 NAT | $45 |
| S3 | 50 GB | $1 |
| CloudWatch | Basic monitoring | $10 |
| **Total (Staging)** | | **~$150** |
| **Total (Production)** | | **~$500-800** |

### Cost Optimization Tips

1. **Use Spot Instances** for non-critical workloads
2. **Right-size** instances based on actual usage
3. **Use Reserved Instances** for predictable workloads
4. **Enable S3 Lifecycle policies** for old data
5. **Use CloudFront** to reduce data transfer costs
6. **Monitor with Cost Explorer** and set budget alerts

---

## Runbooks

### Deployment Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

SERVICE=$1
REVISION=$2

if [ -z "$SERVICE" ] || [ -z "$REVISION" ]; then
  echo "Usage: ./rollback.sh <service> <revision>"
  exit 1
fi

kubectl rollout undo deployment/$SERVICE --to-revision=$REVISION -n business-app
kubectl rollout status deployment/$SERVICE -n business-app
```

### Database Connection Issues

```bash
#!/bin/bash
# scripts/debug-db.sh

# Check RDS status
aws rds describe-db-instances --db-instance-identifier business-app-db

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxx

# Test connection from pod
kubectl exec -it deploy/api-gateway -n business-app -- nc -zv $DB_HOST 5432
```

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025-12-21  
**Next Review:** Before Sprint 1
