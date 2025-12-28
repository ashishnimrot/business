#!/bin/bash
# Cleanup and redeploy script
# Terminates the current instance and redeploys with fixed script

set -e

AWS_PROFILE=${AWS_PROFILE:-business-app}
REGION=${REGION:-ap-south-1}

echo "🧹 Cleaning up and redeploying..."
echo "==================================="
echo ""

# Find and terminate current instance
echo "1. Finding current instance..."
INSTANCE_ID=$(aws --profile $AWS_PROFILE ec2 describe-instances \
  --region $REGION \
  --filters "Name=tag:Name,Values=business-app-beta" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text 2>/dev/null || echo "None")

if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
    STATE=$(aws --profile $AWS_PROFILE ec2 describe-instances \
      --region $REGION \
      --instance-ids $INSTANCE_ID \
      --query 'Reservations[0].Instances[0].State.Name' \
      --output text)
    
    echo "   Found instance: $INSTANCE_ID (State: $STATE)"
    
    if [ "$STATE" != "terminated" ] && [ "$STATE" != "shutting-down" ]; then
        echo "2. Terminating instance..."
        aws --profile $AWS_PROFILE ec2 terminate-instances \
          --region $REGION \
          --instance-ids $INSTANCE_ID > /dev/null
        
        echo "   Waiting for termination..."
        aws --profile $AWS_PROFILE ec2 wait instance-terminated \
          --region $REGION \
          --instance-ids $INSTANCE_ID
        
        echo "   ✅ Instance terminated"
    else
        echo "   Instance already terminated or terminating"
    fi
else
    echo "   No instance found to terminate"
fi

echo ""
echo "3. Ready to redeploy!"
echo "   Run: cd app && AWS_PROFILE=$AWS_PROFILE make deploy-aws-quick"
echo ""

