# AWS CLI - Check Deployment Status

## Quick Status Check

### 1. List All Instances
```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,LaunchTime]' \
  --output table
```

### 2. Get Instance Status
```bash
AWS_PROFILE=business-app aws ec2 describe-instance-status \
  --region ap-south-1 \
  --instance-ids <INSTANCE_ID> \
  --output table
```

### 3. Get Instance Details
```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --instance-ids <INSTANCE_ID> \
  --query 'Reservations[0].Instances[0].[InstanceId,State.Name,PublicIpAddress,PrivateIpAddress,LaunchTime]' \
  --output table
```

### 4. Check Security Group Rules
```bash
AWS_PROFILE=business-app aws ec2 describe-security-groups \
  --region ap-south-1 \
  --filters "Name=group-name,Values=business-app-beta-sg" \
  --query 'SecurityGroups[0].[GroupId,IpPermissions]' \
  --output json
```

### 5. Check Instance Logs (System Log)
```bash
AWS_PROFILE=business-app aws ec2 get-console-output \
  --region ap-south-1 \
  --instance-id <INSTANCE_ID> \
  --latest \
  --output text | tail -100
```

## Complete Check Script

Create this script to check everything:

```bash
#!/bin/bash
# Check deployment status via AWS CLI

AWS_PROFILE=${AWS_PROFILE:-business-app}
REGION=${REGION:-ap-south-1}

echo "🔍 Checking Business App Deployment Status"
echo "==========================================="
echo ""

# Find instance
echo "1. Finding EC2 instance..."
INSTANCE_ID=$(aws --profile $AWS_PROFILE ec2 describe-instances \
  --region $REGION \
  --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
    echo "❌ No running instance found"
    echo ""
    echo "Checking all instances..."
    aws --profile $AWS_PROFILE ec2 describe-instances \
      --region $REGION \
      --filters "Name=tag:Name,Values=business-app-beta" \
      --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' \
      --output table
    exit 1
fi

echo "✅ Instance ID: $INSTANCE_ID"

# Get instance details
echo ""
echo "2. Instance Details:"
INSTANCE_INFO=$(aws --profile $AWS_PROFILE ec2 describe-instances \
  --region $REGION \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,PrivateIpAddress,LaunchTime,InstanceType]' \
  --output text)

STATE=$(echo $INSTANCE_INFO | awk '{print $1}')
PUBLIC_IP=$(echo $INSTANCE_INFO | awk '{print $2}')
PRIVATE_IP=$(echo $INSTANCE_INFO | awk '{print $3}')
LAUNCH_TIME=$(echo $INSTANCE_INFO | awk '{print $4}')
INSTANCE_TYPE=$(echo $INSTANCE_INFO | awk '{print $5}')

echo "   State: $STATE"
echo "   Public IP: ${PUBLIC_IP:-Not assigned}"
echo "   Private IP: $PRIVATE_IP"
echo "   Type: $INSTANCE_TYPE"
echo "   Launched: $LAUNCH_TIME"

# Check instance status
echo ""
echo "3. Instance Status Checks:"
STATUS=$(aws --profile $AWS_PROFILE ec2 describe-instance-status \
  --region $REGION \
  --instance-ids $INSTANCE_ID \
  --query 'InstanceStatuses[0].[InstanceStatus.Status,SystemStatus.Status]' \
  --output text 2>/dev/null || echo "None None")

if [ "$STATUS" != "None None" ]; then
    INSTANCE_STATUS=$(echo $STATUS | awk '{print $1}')
    SYSTEM_STATUS=$(echo $STATUS | awk '{print $2}')
    echo "   Instance Status: $INSTANCE_STATUS"
    echo "   System Status: $SYSTEM_STATUS"
else
    echo "   ⚠️  Status checks not available yet (instance may still be initializing)"
fi

# Check security group
echo ""
echo "4. Security Group:"
SG_ID=$(aws --profile $AWS_PROFILE ec2 describe-instances \
  --region $REGION \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

echo "   Security Group ID: $SG_ID"

SG_RULES=$(aws --profile $AWS_PROFILE ec2 describe-security-groups \
  --region $REGION \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort]' \
  --output table)

echo "   Open Ports:"
echo "$SG_RULES"

# Check if we can access the instance
echo ""
echo "5. Testing Access:"
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
    echo "   Testing HTTP connection..."
    if curl -s -f -m 5 "http://$PUBLIC_IP" > /dev/null 2>&1; then
        echo "   ✅ HTTP accessible: http://$PUBLIC_IP"
    else
        echo "   ⚠️  HTTP not responding (may still be deploying)"
    fi
    
    echo "   Testing SSH connection..."
    if ssh -i ~/.ssh/business-app-key.pem -o ConnectTimeout=5 -o StrictHostKeyChecking=no ec2-user@$PUBLIC_IP 'echo "SSH OK"' 2>/dev/null; then
        echo "   ✅ SSH accessible"
    else
        echo "   ⚠️  SSH not accessible (check security group and key)"
    fi
else
    echo "   ⚠️  No public IP assigned"
fi

# Get recent console output
echo ""
echo "6. Recent Console Output (last 20 lines):"
aws --profile $AWS_PROFILE ec2 get-console-output \
  --region $REGION \
  --instance-id $INSTANCE_ID \
  --latest \
  --output text 2>/dev/null | tail -20 || echo "   Console output not available yet"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Summary:"
echo "  Instance ID: $INSTANCE_ID"
echo "  State: $STATE"
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
    echo "  Public IP: $PUBLIC_IP"
    echo "  Application URL: http://$PUBLIC_IP"
fi
echo "═══════════════════════════════════════════════════════════════"
```

## Quick Commands

### Find Instance ID
```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text
```

### Get Public IP
```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

### Check Instance State
```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text
```

### View Console Output (Boot Logs)
```bash
# Get full console output
AWS_PROFILE=business-app aws ec2 get-console-output \
  --region ap-south-1 \
  --instance-id <INSTANCE_ID> \
  --latest \
  --output text

# Get last 50 lines
AWS_PROFILE=business-app aws ec2 get-console-output \
  --region ap-south-1 \
  --instance-id <INSTANCE_ID> \
  --latest \
  --output text | tail -50
```

### Check All Instances
```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,LaunchTime]' \
  --output table
```

### Check Security Groups
```bash
AWS_PROFILE=business-app aws ec2 describe-security-groups \
  --region ap-south-1 \
  --filters "Name=group-name,Values=business-app-beta-sg" \
  --output table
```

## One-Liner Status Check

```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[0].Instances[0].[InstanceId,State.Name,PublicIpAddress,LaunchTime]' \
  --output table
```

## Check Instance Logs (User Data Execution)

The user-data script logs are in the console output. To see them:

```bash
# Get console output and filter for user-data logs
AWS_PROFILE=business-app aws ec2 get-console-output \
  --region ap-south-1 \
  --instance-id <INSTANCE_ID> \
  --latest \
  --output text | grep -A 100 "Starting automated Business App deployment"
```

## Monitor Instance Status

```bash
# Watch instance status
watch -n 5 "AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters 'Name=tag:Name,Values=business-app-beta' \
  --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' \
  --output table"
```

