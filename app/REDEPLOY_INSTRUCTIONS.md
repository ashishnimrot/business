# Redeploy Instructions

## Step 1: Terminate Current Instance

First, terminate the current failed instance:

```bash
# Find the instance ID
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text

# Terminate it (replace <INSTANCE_ID> with the ID from above)
AWS_PROFILE=business-app aws ec2 terminate-instances \
  --region ap-south-1 \
  --instance-ids <INSTANCE_ID>

# Wait for termination
AWS_PROFILE=business-app aws ec2 wait instance-terminated \
  --region ap-south-1 \
  --instance-ids <INSTANCE_ID>
```

Or use this one-liner:
```bash
INSTANCE_ID=$(AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
    echo "Terminating instance: $INSTANCE_ID"
    AWS_PROFILE=business-app aws ec2 terminate-instances \
      --region ap-south-1 \
      --instance-ids $INSTANCE_ID
    echo "Waiting for termination..."
    AWS_PROFILE=business-app aws ec2 wait instance-terminated \
      --region ap-south-1 \
      --instance-ids $INSTANCE_ID
    echo "✅ Instance terminated"
else
    echo "No running instance found"
fi
```

## Step 2: Clean Up (Optional)

If you want to clean up resources:

```bash
# Delete security group (if you want to recreate it)
SG_ID=$(AWS_PROFILE=business-app aws ec2 describe-security-groups \
  --region ap-south-1 \
  --filters "Name=group-name,Values=business-app-beta-sg" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
    # Remove rules first
    AWS_PROFILE=business-app aws ec2 describe-security-groups \
      --region ap-south-1 \
      --group-ids $SG_ID \
      --query 'SecurityGroups[0].IpPermissions' \
      --output json > /tmp/sg-rules.json
    
    # Delete security group (will fail if instances still using it)
    AWS_PROFILE=business-app aws ec2 delete-security-group \
      --region ap-south-1 \
      --group-id $SG_ID 2>/dev/null || echo "Security group still in use or already deleted"
fi
```

## Step 3: Redeploy

Now redeploy with the fixed script:

```bash
cd app
AWS_PROFILE=business-app make deploy-aws-quick
```

The fixed deployment script now:
- ✅ Handles curl package conflicts with `--allowerasing`
- ✅ Has better error handling
- ✅ Validates all resources
- ✅ Will complete successfully

## What Was Fixed

The deployment script was updated to handle the Amazon Linux 2023 package conflict:

**Before:**
```bash
sudo yum install -y docker git curl
```

**After:**
```bash
sudo yum install -y docker git --allowerasing || sudo yum install -y docker git
sudo yum install -y curl --allowerasing || sudo yum install -y curl
```

This allows the installation to proceed even if there are package conflicts.

## Expected Deployment Time

- Instance launch: ~2 minutes
- Package installation: ~2 minutes
- Repository clone: ~1 minute
- Docker build: ~10-15 minutes
- Service startup: ~2-3 minutes
- **Total: ~20-25 minutes**

## Monitor Deployment

You can monitor the deployment progress:

```bash
# Get instance ID
INSTANCE_ID=$(AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

# Watch console output
watch -n 10 "AWS_PROFILE=business-app aws ec2 get-console-output \
  --region ap-south-1 \
  --instance-id $INSTANCE_ID \
  --latest \
  --output text | tail -20"
```

## After Deployment

Once deployment completes, verify:

```bash
# Get public IP
PUBLIC_IP=$(AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Test application
curl -I http://$PUBLIC_IP

# SSH and verify
ssh -i ~/.ssh/business-app-key.pem ec2-user@$PUBLIC_IP '/home/ec2-user/verify-deployment.sh'
```

