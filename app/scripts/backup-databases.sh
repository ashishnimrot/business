#!/bin/bash
# =============================================================================
# DATABASE BACKUP SCRIPT
# =============================================================================
# Run this before any deployment to backup all databases
# Usage: ./backup-databases.sh [backup_directory]
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${1:-$APP_DIR/db_backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     DATABASE BACKUP                                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Backup directory: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check if postgres is running
if ! docker ps | grep -q business-postgres; then
    echo "❌ PostgreSQL container not running"
    exit 1
fi

# Backup each database
for db in auth_db business_db party_db inventory_db invoice_db payment_db; do
    echo "Backing up $db..."
    docker exec business-postgres pg_dump -U postgres -d "$db" --clean --if-exists > "$BACKUP_DIR/${db}_${TIMESTAMP}.sql"
    if [ $? -eq 0 ]; then
        echo "  ✓ $db backed up successfully"
    else
        echo "  ✗ Failed to backup $db"
    fi
done

echo ""
echo "✅ Backup complete!"
echo "   Files saved to: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"/*_${TIMESTAMP}.sql 2>/dev/null || echo "   (Run ls -lh $BACKUP_DIR to see files)"

