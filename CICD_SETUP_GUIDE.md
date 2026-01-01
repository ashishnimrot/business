# CI/CD Pipeline Setup Guide

This guide will help you set up the CI/CD pipeline step by step.

## Step 1: Add GitHub Secrets

### 1.1 Get Your AWS Credentials

If you don't have AWS credentials yet:

1. **Log in to AWS Console**: https://console.aws.amazon.com
2. **Go to IAM** → **Users** → Select your user (or create one)
3. **Security Credentials** tab → **Create Access Key**
4. **Choose "Command Line Interface (CLI)"**
5. **Download or copy**:
   - Access Key ID
   - Secret Access Key

⚠️ **Important**: Save these securely. You won't be able to see the secret key again.

### 1.2 Get Your SSH Private Key

Your SSH private key should be at: `~/.ssh/business-app-key.pem`

If you don't have it:

1. **Check if it exists**:
   ```bash
   ls -la ~/.ssh/business-app-key.pem
   ```

2. **If it doesn't exist**, you can download it from AWS:
   ```bash
   # List your key pairs
   aws ec2 describe-key-pairs --region ap-south-1
   
   # If you need to create a new one (or download from AWS Console)
   # Go to EC2 → Key Pairs → Create/Download
   ```

3. **View the key contents** (to copy for GitHub secret):
   ```bash
   cat ~/.ssh/business-app-key.pem
   ```

### 1.3 Add Secrets to GitHub

1. **Go to your GitHub repository**
2. **Navigate to**: **Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"** for each:

   **Secret 1: AWS_ACCESS_KEY_ID**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: Your AWS Access Key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)

   **Secret 2: AWS_SECRET_ACCESS_KEY**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: Your AWS Secret Access Key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

   **Secret 3: EC2_SSH_PRIVATE_KEY**
   - Name: `EC2_SSH_PRIVATE_KEY`
   - Value: **Entire contents** of your `.pem` file (copy everything including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

4. **Click "Add secret"** for each one

✅ **Verification**: You should see all 3 secrets listed in the Actions secrets page.

## Step 2: Verify EC2 Instance Tag

The workflow looks for an EC2 instance with the tag `Name=business-app-beta`.

### 2.1 Check Your Instance Tag

Run this command to check your EC2 instances:

```bash
aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0],State.Name,PublicIpAddress]' \
  --output table
```

**Expected output**:
```
------------------------------------------------------------------
|                      DescribeInstances                        |
+------------------+------------------+-----------+-------------+
|  i-1234567890abc | business-app-beta|  running  | 1.2.3.4     |
+------------------+------------------+-----------+-------------+
```

### 2.2 If Your Instance Has a Different Tag

If your instance has a different name tag (e.g., `business-app-prod`), you have two options:

**Option A: Update the Workflow** (Recommended if you want to keep your tag name)

Edit `.github/workflows/deploy-services.yml` and change:
```yaml
env:
  INSTANCE_TAG: business-app-beta  # Change this to your tag name
```

**Option B: Update Your Instance Tag**

```bash
# Get your instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

# Update the tag
aws ec2 create-tags \
  --region ap-south-1 \
  --resources $INSTANCE_ID \
  --tags Key=Name,Value=business-app-beta
```

## Step 3: Test the Pipeline

### 3.1 Make a Test Change

Create a small, harmless change to test the pipeline:

```bash
# Navigate to a service directory
cd app/apps/auth-service

# Make a small change (add a comment)
echo "// CI/CD Test - $(date)" >> src/main.ts

# Or create a test file
echo "// Test file for CI/CD" > test-cicd.txt
```

### 3.2 Commit and Push

```bash
# Stage the change
git add .

# Commit
git commit -m "test: CI/CD pipeline test"

# Push to main branch
git push origin main
```

### 3.3 Monitor the Deployment

1. **Go to GitHub** → **Actions** tab
2. **You should see** "Service-Based CI/CD Pipeline" workflow running
3. **Click on it** to see the progress:
   - ✅ Detect Changed Services
   - ✅ Deploy Services to EC2
   - ✅ Verify deployment

### 3.4 Verify on EC2

After deployment completes, verify on your EC2 instance:

```bash
# SSH into your instance
ssh -i ~/.ssh/business-app-key.pem ec2-user@<YOUR_EC2_IP>

# Check service status
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml ps

# Check if your change is there
cd /opt/business-app
git log --oneline -1
```

## Troubleshooting

### Issue: "No running EC2 instance found"

**Solution**: 
1. Check if your instance is running:
   ```bash
   aws ec2 describe-instances --region ap-south-1 --filters "Name=instance-state-name,Values=running"
   ```

2. Verify the instance tag matches `business-app-beta`

3. If using a different tag, update the workflow file

### Issue: "SSH connection failed"

**Solution**:
1. Check security group allows SSH (port 22) from GitHub Actions IPs
2. Verify the SSH key in GitHub secrets matches your `.pem` file
3. Test SSH manually:
   ```bash
   ssh -i ~/.ssh/business-app-key.pem ec2-user@<YOUR_EC2_IP>
   ```

### Issue: "Git fetch failed"

**Solution**:
1. Ensure the EC2 instance has internet access
2. Check if git is installed on the instance
3. Verify the repository URL is correct

### Issue: "Service build failed"

**Solution**:
1. Check the GitHub Actions logs for specific error
2. SSH into instance and check logs:
   ```bash
   ssh -i ~/.ssh/business-app-key.pem ec2-user@<YOUR_EC2_IP>
   cd /opt/business-app/app
   docker-compose -f docker-compose.prod.yml logs <service-name>
   ```

## Quick Verification Checklist

- [ ] GitHub secrets added (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, EC2_SSH_PRIVATE_KEY)
- [ ] EC2 instance tag verified (should be `business-app-beta`)
- [ ] Test change made and pushed to `main` branch
- [ ] GitHub Actions workflow ran successfully
- [ ] Services deployed and running on EC2

## Next Steps

Once everything is working:

1. **Monitor deployments** in GitHub Actions
2. **Set up notifications** (optional) for deployment status
3. **Review deployment logs** regularly
4. **Keep secrets secure** and rotate them periodically

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review EC2 instance logs
3. Consult `docs/CICD_PIPELINE.md` for detailed documentation

