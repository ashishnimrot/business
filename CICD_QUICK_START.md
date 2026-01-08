# CI/CD Pipeline - Quick Start Guide

## 🚀 What Was Created

A **service-based CI/CD pipeline** that automatically deploys only changed services to your EC2 instance when code is pushed to the `main` branch.

## 📁 Files Created

1. **`.github/workflows/deploy-services.yml`** - GitHub Actions workflow
2. **`app/scripts/deploy-service-to-ec2.sh`** - Standalone deployment script
3. **`docs/CICD_PIPELINE.md`** - Complete documentation

## ⚙️ Setup Required

### 1. GitHub Secrets

Add these secrets in GitHub: **Settings → Secrets and variables → Actions**

- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key  
- `EC2_SSH_PRIVATE_KEY` - Contents of your SSH private key file (`~/.ssh/business-app-key.pem`)

### 2. Verify EC2 Instance Tag

The workflow looks for an EC2 instance with tag `Name=business-app-beta`. If your instance has a different tag, update the `INSTANCE_TAG` environment variable in the workflow file.

## 🎯 How It Works

### Automatic Deployment

1. **Push to main branch** in any of these paths:
   - `app/apps/auth-service/**`
   - `app/apps/business-service/**`
   - `app/apps/inventory-service/**`
   - `app/apps/invoice-service/**`
   - `app/apps/party-service/**`
   - `app/apps/payment-service/**`
   - `web-app/**`
   - `app/docker-compose.prod.yml`
   - `app/Dockerfile`

2. **Workflow automatically**:
   - Detects which services changed
   - Finds your EC2 instance
   - Fetches latest code from `main` branch
   - Rebuilds only changed services
   - Restarts affected services

### Manual Deployment

```bash
# Deploy all services
bash app/scripts/deploy-service-to-ec2.sh ap-south-1 business-app-key all

# Deploy specific services
bash app/scripts/deploy-service-to-ec2.sh ap-south-1 business-app-key "auth-service,business-service"

# Deploy web app only
bash app/scripts/deploy-service-to-ec2.sh ap-south-1 business-app-key web-app
```

## 📊 Monitoring

### View Deployment Status

1. **GitHub Actions**: Go to **Actions** tab → Click on workflow run
2. **EC2 Instance**: 
   ```bash
   ssh -i ~/.ssh/business-app-key.pem ec2-user@<PUBLIC_IP>
   cd /opt/business-app/app
   docker-compose -f docker-compose.prod.yml ps
   ```

### View Logs

```bash
# All services
ssh -i ~/.ssh/business-app-key.pem ec2-user@<PUBLIC_IP> \
  'cd /opt/business-app/app && docker-compose -f docker-compose.prod.yml logs --tail=50'

# Specific service
ssh -i ~/.ssh/business-app-key.pem ec2-user@<PUBLIC_IP> \
  'cd /opt/business-app/app && docker-compose -f docker-compose.prod.yml logs --tail=50 auth-service'
```

## 🔍 Service Detection Logic

- **Individual service change** → Only that service is rebuilt
- **Shared library change** (`app/libs/shared/`) → All services rebuilt
- **Docker Compose change** → All services rebuilt
- **Dockerfile change** → All services rebuilt
- **Package.json change** → All services rebuilt

## ✅ Testing

1. Make a small change to any service (e.g., `app/apps/auth-service/src/main.ts`)
2. Commit and push to `main` branch
3. Check GitHub Actions tab for deployment status
4. Verify service is updated on EC2 instance

## 📚 Full Documentation

See `docs/CICD_PIPELINE.md` for complete documentation including troubleshooting, best practices, and advanced configuration.


