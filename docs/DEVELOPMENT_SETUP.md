# Development Environment Setup Guide

**Version:** 1.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Use

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [System Requirements](#system-requirements)
4. [Installation Steps](#installation-steps)
5. [Repository Setup](#repository-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Running the Application](#running-the-application)
9. [Running Tests](#running-tests)
10. [Troubleshooting](#troubleshooting)
11. [IDE Setup](#ide-setup)
12. [Git Workflow](#git-workflow)

---

## Overview

This guide provides step-by-step instructions for setting up the Business App development environment on your local machine. The application uses an NX Monorepo structure with React Native for mobile development and NestJS for backend microservices.

### Architecture Quick Reference
- **Frontend:** React Native (iOS & Android)
- **Backend:** NestJS Microservices
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Local DB:** WatermelonDB (SQLite)
- **Build System:** NX Monorepo

---

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|---------------------|---------|
| Node.js | 18.x | 20.x LTS | JavaScript runtime |
| npm | 9.x | 10.x | Package manager |
| Git | 2.30+ | Latest | Version control |
| Docker | 24.x | Latest | Containerization |
| Docker Compose | 2.20+ | Latest | Multi-container orchestration |
| PostgreSQL | 15.x | 15.x | Primary database |
| Redis | 7.x | 7.x | Cache & message queue |

### For Mobile Development (iOS)
- macOS 13.0+ (Ventura or later)
- Xcode 15.0+
- CocoaPods 1.14+
- iOS Simulator (included with Xcode)

### For Mobile Development (Android)
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 (included with Android Studio)
- Android SDK 34+
- Android Emulator with API 26+ image

---

## System Requirements

### Minimum Requirements
- **OS:** macOS 12+, Windows 10+, Ubuntu 20.04+
- **RAM:** 8 GB
- **Disk Space:** 20 GB free
- **CPU:** Quad-core processor

### Recommended Requirements
- **OS:** macOS 14+ (Sonoma) / Ubuntu 22.04
- **RAM:** 16 GB+
- **Disk Space:** 50 GB+ SSD
- **CPU:** 8-core processor

---

## Installation Steps

### Step 1: Install Node.js

**macOS (using Homebrew):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Using NVM (Recommended):**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or source profile
source ~/.zshrc  # or ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version
npm --version
```

### Step 2: Install Git

**macOS:**
```bash
# Install via Xcode Command Line Tools
xcode-select --install

# Or via Homebrew
brew install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git --version
```

### Step 3: Install Docker

**macOS:**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and launch Docker Desktop
3. Grant necessary permissions
4. Wait for Docker to start (whale icon in menu bar)

**Verify Installation:**
```bash
docker --version
docker-compose --version
docker run hello-world
```

### Step 4: Install PostgreSQL (Optional - Docker recommended)

**Using Docker (Recommended):**
PostgreSQL will run in Docker (see Database Setup section).

**Native Installation (Alternative):**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
psql --version
```

### Step 5: Install Redis (Optional - Docker recommended)

**Using Docker (Recommended):**
Redis will run in Docker (see Database Setup section).

**Native Installation (Alternative):**
```bash
# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping  # Should return "PONG"
```

### Step 6: Mobile Development Setup (iOS - macOS only)

```bash
# Install Xcode from App Store (or command line)
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept

# Install CocoaPods
sudo gem install cocoapods

# Install iOS simulators (open Xcode → Settings → Platforms)

# Verify
pod --version
xcrun simctl list devices
```

### Step 7: Mobile Development Setup (Android)

1. Download Android Studio from [developer.android.com](https://developer.android.com/studio)
2. Install Android Studio
3. Open Android Studio → More Actions → SDK Manager
4. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM) - for Intel Macs
5. Create an AVD (Android Virtual Device) with API 26+

**Set Environment Variables:**
```bash
# Add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Source profile
source ~/.zshrc

# Verify
adb --version
emulator -list-avds
```

---

## Repository Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone git@github.com:ashishnimrot/business.git
cd business

# Or using HTTPS
git clone https://github.com/ashishnimrot/business.git
cd business
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# If you encounter peer dependency issues
npm install --legacy-peer-deps
```

### Step 3: Install NX CLI (Global)

```bash
# Install NX globally
npm install -g nx@latest

# Verify
nx --version
```

### Step 4: Setup Pre-commit Hooks (Optional but Recommended)

```bash
# Install Husky for pre-commit hooks
npx husky install

# Hooks will run automatically on commit
```

---

## Environment Configuration

### Step 1: Create Environment Files

```bash
# Copy example environment files
cp .env.example .env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/business-service/.env.example apps/business-service/.env
cp apps/inventory-service/.env.example apps/inventory-service/.env
cp apps/invoice-service/.env.example apps/invoice-service/.env
cp apps/mobile/.env.example apps/mobile/.env
```

### Step 2: Configure Root .env File

```bash
# .env (root)

# Environment
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=business_app

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# SMS Gateway (MSG91)
SMS_GATEWAY_API_KEY=your-msg91-api-key
SMS_GATEWAY_SENDER_ID=BIZAPP
SMS_GATEWAY_TEMPLATE_ID=your-template-id

# Email Service (SendGrid)
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@business-app.com

# AWS (for S3, etc.)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=business-app-dev

# Sentry (Error Tracking)
SENTRY_DSN=your-sentry-dsn

# API Gateway
API_GATEWAY_PORT=3000
```

### Step 3: Configure Service-Specific .env Files

**apps/auth-service/.env:**
```bash
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=auth_service
```

**apps/business-service/.env:**
```bash
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=business_service
```

**apps/mobile/.env:**
```bash
API_URL=http://localhost:3000/api/v1
ENVIRONMENT=development
```

---

## Database Setup

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis)
docker-compose up -d

# Verify containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

**docker-compose.yml (Development):**
```yaml
version: '3.8'

services:
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

  redis:
    image: redis:7-alpine
    container_name: business-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: pgAdmin for database management
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

volumes:
  postgres_data:
  redis_data:
```

### Option 2: Native PostgreSQL

```bash
# Create databases
createdb auth_service
createdb business_service
createdb inventory_service
createdb invoice_service
createdb accounting_service
createdb gst_service

# Or using psql
psql -U postgres -c "CREATE DATABASE auth_service;"
psql -U postgres -c "CREATE DATABASE business_service;"
# ... repeat for other services
```

### Step 2: Run Database Migrations

```bash
# Run all migrations
npm run db:migrate

# Or run migrations per service
nx run auth-service:migrate
nx run business-service:migrate
nx run inventory-service:migrate
nx run invoice-service:migrate
```

### Step 3: Seed Database (Development Data)

```bash
# Seed all databases
npm run db:seed

# This creates:
# - Test users
# - Sample businesses
# - Demo inventory items
# - Sample invoices
```

---

## Running the Application

### Start Backend Services

**Option 1: All Services Together**
```bash
# Start all backend services
npm run start:backend

# Or using NX
nx run-many --target=serve --projects=api-gateway,auth-service,business-service,inventory-service,invoice-service
```

**Option 2: Individual Services**
```bash
# Start specific service
nx serve api-gateway
nx serve auth-service
nx serve business-service
nx serve inventory-service
nx serve invoice-service
```

**Service URLs:**
| Service | URL |
|---------|-----|
| API Gateway | http://localhost:3000 |
| Auth Service | http://localhost:3001 |
| Business Service | http://localhost:3002 |
| Inventory Service | http://localhost:3003 |
| Invoice Service | http://localhost:3004 |
| Swagger Docs | http://localhost:3000/api/docs |

### Start Mobile App

**iOS:**
```bash
# Install iOS dependencies
cd apps/mobile/ios && pod install && cd ../../..

# Start Metro bundler
nx serve mobile

# In another terminal, run iOS simulator
nx run mobile:run-ios

# Or specify device
nx run mobile:run-ios --simulator="iPhone 15 Pro"
```

**Android:**
```bash
# Start Android emulator first
emulator -avd Pixel_7_API_34 &

# Start Metro bundler
nx serve mobile

# In another terminal, run Android
nx run mobile:run-android
```

### Development Workflow

```bash
# Start all required services for development
npm run dev

# This starts:
# 1. Docker containers (Postgres, Redis)
# 2. All backend services
# 3. Mobile app Metro bundler
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests for specific project
nx test auth-service
nx test mobile

# Run with coverage
nx test auth-service --coverage

# Watch mode
nx test auth-service --watch
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Requires test database running
# Uses separate test database (auth_service_test, etc.)
```

### E2E Tests

```bash
# Mobile E2E tests (Detox)
nx run mobile:test-e2e

# API E2E tests
nx run api-gateway:test-e2e
```

### Test Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/index.html
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process using the port
lsof -i :3000
kill -9 <PID>

# Or kill all Node processes
killall node
```

#### Issue 2: Docker Containers Not Starting

**Error:**
```
Cannot connect to the Docker daemon
```

**Solution:**
```bash
# Ensure Docker Desktop is running
open -a Docker

# Wait for Docker to start
docker ps

# If still issues, restart Docker Desktop
```

#### Issue 3: Database Connection Failed

**Error:**
```
ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# If not running
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Verify connection
psql -h localhost -U postgres -d business_app
```

#### Issue 4: iOS Build Failed

**Error:**
```
error: Unable to load contents of file list: '.../Pods-mobile.xcfilelist'
```

**Solution:**
```bash
# Clean and reinstall pods
cd apps/mobile/ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install
cd ../../..

# Clean Xcode build
cd apps/mobile/ios
xcodebuild clean
cd ../../..
```

#### Issue 5: Android Build Failed

**Error:**
```
SDK location not found
```

**Solution:**
```bash
# Create local.properties
echo "sdk.dir=$HOME/Library/Android/sdk" > apps/mobile/android/local.properties

# Verify ANDROID_HOME
echo $ANDROID_HOME

# Should output: /Users/yourname/Library/Android/sdk
```

#### Issue 6: Metro Bundler Issues

**Error:**
```
Unable to resolve module
```

**Solution:**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or clean all
rm -rf node_modules
rm -rf apps/mobile/ios/Pods
npm install
cd apps/mobile/ios && pod install && cd ../../..
```

#### Issue 7: NX Cache Issues

**Error:**
```
Unexpected token in JSON
```

**Solution:**
```bash
# Clear NX cache
nx reset

# Or remove cache folder
rm -rf node_modules/.cache/nx
```

---

## IDE Setup

### VS Code (Recommended)

**Required Extensions:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "nrwl.angular-console",
    "msjsdiag.vscode-react-native",
    "ms-azuretools.vscode-docker",
    "mtxr.sqltools",
    "cweijan.vscode-postgresql-client2"
  ]
}
```

**Recommended Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### WebStorm / IntelliJ IDEA

1. Open the project folder
2. Enable ESLint: Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint → Automatic ESLint configuration
3. Enable Prettier: Preferences → Languages & Frameworks → JavaScript → Prettier → On save
4. Install plugins: NX Console, React Native Console

---

## Git Workflow

### Branch Naming Convention

```
feature/BUSINESS-XXX-short-description
bugfix/BUSINESS-XXX-short-description
hotfix/BUSINESS-XXX-critical-fix
refactor/BUSINESS-XXX-improvement
```

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(auth): implement OTP verification API"
git commit -m "fix(invoice): correct GST calculation for interstate"
git commit -m "docs(setup): add troubleshooting section"
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create PR
4. Fill PR template
5. Request review from at least 1 team member
6. Address review comments
7. Merge after approval

---

## Quick Reference Commands

```bash
# Start development
npm run dev                    # Start all services
docker-compose up -d           # Start Docker services
nx serve api-gateway           # Start specific service
nx serve mobile               # Start mobile Metro bundler

# Testing
npm test                       # Run all tests
nx test auth-service          # Test specific service
npm run test:coverage         # Coverage report

# Database
npm run db:migrate            # Run migrations
npm run db:seed               # Seed data
npm run db:reset              # Reset database

# Build
nx build api-gateway          # Build specific service
npm run build:all             # Build all services

# Linting
npm run lint                  # Lint all projects
nx lint auth-service          # Lint specific service
npm run lint:fix              # Auto-fix lint issues

# Cleanup
nx reset                      # Clear NX cache
docker-compose down -v        # Stop and remove containers
rm -rf node_modules           # Clean node_modules
```

---

## Support

### Getting Help

- **Slack Channel:** #business-app-dev
- **Documentation:** /docs folder
- **Wiki:** [Internal Wiki Link]
- **Tech Lead:** [Contact Info]

### Reporting Issues

1. Check troubleshooting section
2. Search existing issues
3. Create new issue with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior
   - Error logs

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025-12-21  
**Reviewed By:** [To be reviewed by Tech Lead]
