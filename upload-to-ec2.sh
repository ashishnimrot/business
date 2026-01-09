#!/bin/bash
# =============================================================================
# UPLOAD SCRIPTS AND BACKUPS TO EC2
# =============================================================================
# Usage: ./upload-to-ec2.sh YOUR_EC2_IP
# =============================================================================

if [ -z "$1" ]; then
    echo "Usage: $0 YOUR_EC2_IP"
    echo "Example: $0 13.232.123.45"
    exit 1
fi

EC2_IP=$1
KEY_FILE="$HOME/.ssh/business-app-key.pem"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     UPLOADING TO EC2: $EC2_IP"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH key not found at: $KEY_FILE"
    echo "   Please update KEY_FILE in this script"
    exit 1
fi

echo "📦 Step 1/3: Uploading database backups..."
scp -i "$KEY_FILE" -r db_backup "ec2-user@$EC2_IP:/opt/business-app/app/" && echo "✅ Backups uploaded" || echo "❌ Failed to upload backups"

echo ""
echo "📦 Step 2/3: Uploading scripts..."
scp -i "$KEY_FILE" \
    app/scripts/restore-db-with-backup.sh \
    app/scripts/backup-databases.sh \
    app/scripts/deploy-with-password-check.sh \
    "ec2-user@$EC2_IP:/opt/business-app/app/scripts/" && echo "✅ Scripts uploaded" || echo "❌ Failed to upload scripts"

echo ""
echo "📦 Step 3/3: Making scripts executable on EC2..."
ssh -i "$KEY_FILE" "ec2-user@$EC2_IP" "chmod +x /opt/business-app/app/scripts/*.sh" && echo "✅ Scripts are executable" || echo "❌ Failed to set permissions"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ UPLOAD COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. SSH into EC2:"
echo "   ssh -i $KEY_FILE ec2-user@$EC2_IP"
echo ""
echo "2. Run the restore script:"
echo "   cd /opt/business-app/app"
echo "   ./scripts/restore-db-with-backup.sh /opt/business-app/app/db_backup"
echo ""

