# CI/CD Pipeline Documentation

## Overview

This project uses a **service-based CI/CD pipeline** that automatically detects changes in individual services or the web app and deploys only the affected components to the EC2 instance. This approach reduces deployment time and minimizes downtime.

## Architecture

### Components

1. **GitHub Actions Workflow** (`.github/workflows/deploy-services.yml`)
   - Automatically triggers on pushes to `main` branch
   - Detects which services have changed
   - Deploys only changed services to EC2

2. **Deployment Script** (`app/scripts/deploy-service-to-ec2.sh`)
   - Standalone script for manual deployments
   - Can deploy specific services or all services
   - Handles SSH connection, code updates, and service restarts

## How It Works

### Automatic Deployment (GitHub Actions)

1. **Change Detection**: When code is pushed to `main` branch, the workflow:
   - Compares changes with the previous commit
   - Identifies which services were modified:
     - `app/apps/auth-service/**` → `auth-service`
     - `app/apps/business-service/**` → `business-service`
     - `app/apps/inventory-service/**` → `inventory-service`
     - `app/apps/invoice-service/**` → `invoice-service`
     - `app/apps/party-service/**` → `party-service`
     - `app/apps/payment-service/**` → `payment-service`
     - `web-app/**` → `web-app`
     - `app/libs/shared/**` or `app/docker-compose.prod.yml` → All services

2. **Deployment Process**:
   - Finds the running EC2 instance
   - Connects via SSH
   - Fetches latest code from `main` branch
   - Rebuilds only the changed services
   - Restarts affected services
   - Verifies deployment

### Manual Deployment

You can also deploy manually using the deployment script:

```bash
# Deploy all services
bash app/scripts/deploy-service-to-ec2.sh ap-south-1 business-app-key all

# Deploy specific services
bash app/scripts/deploy-service-to-ec2.sh ap-south-1 business-app-key "auth-service,business-service"

# Deploy web app only
bash app/scripts/deploy-service-to-ec2.sh ap-south-1 business-app-key web-app
```

## Setup

### GitHub Secrets

The workflow requires the following secrets to be configured in GitHub:

1. **AWS_ACCESS_KEY_ID**: AWS access key for EC2 access
2. **AWS_SECRET_ACCESS_KEY**: AWS secret key
3. **EC2_SSH_PRIVATE_KEY**: Private SSH key for EC2 instance (contents of `.pem` file)

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `EC2_SSH_PRIVATE_KEY`: Contents of your SSH private key file (e.g., `~/.ssh/business-app-key.pem`)

### Local Setup

For manual deployments, ensure you have:

1. AWS CLI configured with appropriate profile:
   ```bash
   aws configure --profile business-app
   ```

2. SSH key in the correct location:
   ```bash
   ~/.ssh/business-app-key.pem
   ```

3. Proper permissions on SSH key:
   ```bash
   chmod 600 ~/.ssh/business-app-key.pem
   ```

## Workflow Triggers

### Automatic Triggers

The workflow automatically runs when:
- Code is pushed to `main` branch in:
  - `app/apps/*/` (any service directory)
  - `web-app/` (web application)
  - `app/docker-compose.prod.yml`
  - `app/Dockerfile`
  - `app/package.json` or `app/package-lock.json`

### Manual Triggers

You can manually trigger the workflow:

1. Go to **Actions** tab in GitHub
2. Select **Service-Based CI/CD Pipeline**
3. Click **Run workflow**
4. Choose:
   - Services to deploy (comma-separated or "all")
   - Force deployment (optional)

## Service Detection Logic

### Individual Service Changes

If changes are detected in:
- `app/apps/auth-service/` → Only `auth-service` is rebuilt
- `app/apps/business-service/` → Only `business-service` is rebuilt
- `app/apps/inventory-service/` → Only `inventory-service` is rebuilt
- `app/apps/invoice-service/` → Only `invoice-service` is rebuilt
- `app/apps/party-service/` → Only `party-service` is rebuilt
- `app/apps/payment-service/` → Only `payment-service` is rebuilt
- `web-app/` → Only `web-app` is rebuilt

### Shared Changes

If changes are detected in:
- `app/libs/shared/` → **All services** are rebuilt (shared libraries affect all services)
- `app/docker-compose.prod.yml` → **All services** are rebuilt (infrastructure change)
- `app/Dockerfile` → **All services** are rebuilt (build configuration change)
- `app/package.json` or `app/package-lock.json` → **All services** are rebuilt (dependency change)

## Deployment Process

### On EC2 Instance

The deployment process on the EC2 instance:

1. **Fetch Latest Code**:
   ```bash
   cd /opt/business-app
   git fetch origin main
   git reset --hard origin/main
   git clean -fd
   ```

2. **Rebuild Services**:
   ```bash
   cd /opt/business-app/app
   docker-compose -f docker-compose.prod.yml build <service-name>
   docker-compose -f docker-compose.prod.yml up -d <service-name>
   ```

3. **Health Check**:
   - Waits 30 seconds for services to start
   - Checks service status
   - Verifies web app accessibility

## Monitoring

### View Deployment Status

1. **GitHub Actions**:
   - Go to **Actions** tab
   - Click on the latest workflow run
   - View logs and deployment summary

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

## Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs**:
   - Look for error messages in the workflow run
   - Common issues:
     - SSH connection failed → Check security group allows port 22
     - Service build failed → Check Docker logs
     - Git fetch failed → Check repository access

2. **Check EC2 instance**:
   ```bash
   ssh -i ~/.ssh/business-app-key.pem ec2-user@<PUBLIC_IP>
   cd /opt/business-app/app
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs
   ```

### Service Not Starting

1. **Check service logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs <service-name>
   ```

2. **Check environment variables**:
   ```bash
   cat .env.production
   ```

3. **Restart service manually**:
   ```bash
   docker-compose -f docker-compose.prod.yml restart <service-name>
   ```

### Instance Not Found

If the workflow can't find the EC2 instance:

1. **Check instance tag**:
   - Default tag: `business-app-beta`
   - Verify in AWS Console or update workflow environment variable

2. **Check instance state**:
   ```bash
   aws ec2 describe-instances \
     --region ap-south-1 \
     --filters "Name=tag:Name,Values=business-app-beta" \
     --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' \
     --output table
   ```

## Best Practices

1. **Always test locally** before pushing to `main`
2. **Use feature branches** for development
3. **Review changes** before merging to `main`
4. **Monitor deployments** after pushing to `main`
5. **Keep SSH keys secure** and never commit them
6. **Use manual trigger** for emergency deployments

## Configuration

### Environment Variables

The workflow uses these environment variables (can be customized):

- `AWS_REGION`: `ap-south-1` (default)
- `AWS_PROFILE`: `business-app` (default)
- `KEY_NAME`: `business-app-key` (default)
- `INSTANCE_TAG`: `business-app-beta` (default)

### Customization

To customize the workflow:

1. Edit `.github/workflows/deploy-services.yml`
2. Update environment variables in the `env` section
3. Modify service detection logic if needed
4. Adjust deployment commands as required

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review EC2 instance logs
3. Consult deployment documentation
4. Contact the DevOps team

