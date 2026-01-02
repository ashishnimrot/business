#!/bin/bash

# Upload Database Backups to S3
# Uploads all backup files from the backup directory to AWS S3
# Usage: ./upload-backup-to-s3.sh [S3_BUCKET] [BACKUP_DIR] [KEEP_LOCAL]
#   S3_BUCKET: S3 bucket name (default: from AWS_S3_BACKUP_BUCKET env var or prompt)
#   BACKUP_DIR: Directory containing backups (default: ./backups)
#   KEEP_LOCAL: Keep local files after upload (default: true, set to "false" to delete)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
S3_BUCKET="${1:-${AWS_S3_BACKUP_BUCKET}}"
BACKUP_DIR="${2:-${BACKUP_DIR:-./backups}}"
KEEP_LOCAL="${3:-true}"
S3_PREFIX="${S3_PREFIX:-database-backups}"
AWS_REGION="${AWS_REGION:-ap-south-1}"

# Validate AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI is not installed${NC}"
    echo -e "${YELLOW}  For EC2 (Amazon Linux/CentOS/RHEL):${NC}"
    echo -e "${BLUE}    sudo ./install-aws-cli-ec2.sh v2${NC}"
    echo -e "${BLUE}    OR: sudo yum install -y aws-cli${NC}"
    echo -e "${YELLOW}  For macOS:${NC}"
    echo -e "${BLUE}    brew install awscli${NC}"
    echo -e "${YELLOW}  For other systems:${NC}"
    echo -e "${BLUE}    See: scripts/AWS_CLI_INSTALLATION.md${NC}"
    exit 1
fi

# Validate AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo -e "${YELLOW}  Run: aws configure${NC}"
    echo -e "${YELLOW}  Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables${NC}"
    exit 1
fi

# Get S3 bucket if not provided
if [ -z "$S3_BUCKET" ]; then
    echo -e "${BLUE}Enter S3 bucket name for backups:${NC}"
    read -r S3_BUCKET
    if [ -z "$S3_BUCKET" ]; then
        echo -e "${RED}✗ S3 bucket name is required${NC}"
        exit 1
    fi
fi

# Validate backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}✗ Backup directory does not exist: $BACKUP_DIR${NC}"
    exit 1
fi

# Check if bucket exists and is accessible
echo -e "${BLUE}Checking S3 bucket access...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bucket '$S3_BUCKET' does not exist or is not accessible${NC}"
    echo -e "${YELLOW}  Creating bucket...${NC}"
    
    # Try to create bucket
    if aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION" 2>/dev/null; then
        echo -e "${GREEN}  ✓ Bucket created${NC}"
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$S3_BUCKET" \
            --versioning-configuration Status=Enabled 2>/dev/null || true
        
        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket "$S3_BUCKET" \
            --server-side-encryption-configuration '{
                "Rules": [{
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }]
            }' 2>/dev/null || true
        
        echo -e "${GREEN}  ✓ Bucket configured with versioning and encryption${NC}"
    else
        echo -e "${RED}✗ Failed to create bucket. Please create it manually or check permissions${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}  ✓ Bucket accessible${NC}"
fi

# Find all backup files
BACKUP_FILES=("$BACKUP_DIR"/*.sql "$BACKUP_DIR"/*.sql.gz 2>/dev/null || true)
if [ ${#BACKUP_FILES[@]} -eq 0 ] || [ ! -f "${BACKUP_FILES[0]}" ]; then
    echo -e "${YELLOW}⚠️  No backup files found in $BACKUP_DIR${NC}"
    exit 0
fi

# Filter out non-existent files (from glob expansion)
VALID_FILES=()
for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        VALID_FILES+=("$file")
    fi
done

if [ ${#VALID_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No valid backup files found in $BACKUP_DIR${NC}"
    exit 0
fi

echo -e "${BLUE}Uploading ${#VALID_FILES[@]} backup file(s) to S3...${NC}"
echo -e "${BLUE}  Bucket: s3://$S3_BUCKET/$S3_PREFIX${NC}"
echo ""

UPLOAD_SUCCESS=0
UPLOAD_FAILED=0

# Upload each backup file
for backup_file in "${VALID_FILES[@]}"; do
    filename=$(basename "$backup_file")
    s3_path="s3://$S3_BUCKET/$S3_PREFIX/$filename"
    
    echo -e "${YELLOW}  → Uploading $filename...${NC}"
    
    # Get file size for progress indication
    file_size=$(du -h "$backup_file" | cut -f1)
    echo -e "${BLUE}    Size: $file_size${NC}"
    
    # Upload to S3
    if aws s3 cp "$backup_file" "$s3_path" --region "$AWS_REGION" 2>&1; then
        echo -e "${GREEN}    ✓ Uploaded to $s3_path${NC}"
        ((UPLOAD_SUCCESS++))
        
        # Optionally delete local file
        if [ "$KEEP_LOCAL" = "false" ]; then
            if rm "$backup_file" 2>/dev/null; then
                echo -e "${BLUE}    ✓ Local file deleted${NC}"
            else
                echo -e "${YELLOW}    ⚠️  Failed to delete local file${NC}"
            fi
        fi
    else
        echo -e "${RED}    ✗ Upload failed${NC}"
        ((UPLOAD_FAILED++))
    fi
    echo ""
done

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $UPLOAD_SUCCESS -gt 0 ]; then
    echo -e "${GREEN}✓ Upload complete: $UPLOAD_SUCCESS file(s) uploaded${NC}"
    echo -e "${BLUE}  S3 Location: s3://$S3_BUCKET/$S3_PREFIX/${NC}"
fi

if [ $UPLOAD_FAILED -gt 0 ]; then
    echo -e "${RED}✗ Failed: $UPLOAD_FAILED file(s) failed to upload${NC}"
    exit 1
fi

if [ $UPLOAD_SUCCESS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No files were uploaded${NC}"
    exit 0
fi

# List uploaded files
echo ""
echo -e "${BLUE}Uploaded files:${NC}"
aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" --region "$AWS_REGION" --human-readable --summarize | tail -n +2 | head -n -1 || true

exit 0

