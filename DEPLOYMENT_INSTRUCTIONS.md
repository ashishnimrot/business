# Database Restore and Safe Deployment Instructions

## 🚨 Current Issue: Database Password Mismatch

Your services are failing because the database password in the services doesn't match the PostgreSQL password.

## 📋 Quick Fix: Restore Database with Backups

### Step 1: Upload Files to EC2

From your local machine:

```bash
# Upload backup files
scp -i ~/.ssh/business-app-key.pem -r db_backup ec2-user@YOUR_EC2_IP:/opt/business-app/app/

# Upload the new scripts
scp -i ~/.ssh/business-app-key.pem app/scripts/restore-db-with-backup.sh ec2-user@YOUR_EC2_IP:/opt/business-app/app/scripts/
scp -i ~/.ssh/business-app-key.pem app/scripts/backup-databases.sh ec2-user@YOUR_EC2_IP:/opt/business-app/app/scripts/
scp -i ~/.ssh/business-app-key.pem app/scripts/deploy-with-password-check.sh ec2-user@YOUR_EC2_IP:/opt/business-app/app/scripts/
```

### Step 2: Run Restore Script on EC2

SSH into your EC2 instance:

```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@YOUR_EC2_IP
```

Then run:

```bash
# Navigate to app directory
cd /opt/business-app/app

# Make scripts executable
chmod +x scripts/restore-db-with-backup.sh
chmod +x scripts/backup-databases.sh
chmod +x scripts/deploy-with-password-check.sh

# Run the restore (this will fix everything)
./scripts/restore-db-with-backup.sh /opt/business-app/app/db_backup
```

### What This Does:

1. ✅ Checks/creates `.env.production` with a consistent `DB_PASSWORD`
2. ✅ Stops all services
3. ✅ Recreates PostgreSQL with the correct password
4. ✅ Imports all your database backups (no data loss!)
5. ✅ Restarts all services with correct configuration
6. ✅ Verifies everything is working

---

## 🔒 Preventing Future Issues

### Rule #1: Never Change DB_PASSWORD After Initial Setup

The `.env.production` file contains your database password. **This should NEVER change** after the first deployment.

### For Future Deployments

Use the safe deployment script:

```bash
cd /opt/business-app/app
./scripts/deploy-with-password-check.sh
```

This script will:
- ✅ Preserve existing `DB_PASSWORD`
- ✅ Create automatic backups before deployment
- ✅ Pull latest code
- ✅ Rebuild services
- ✅ Keep your data safe

---

## 📦 Regular Backups

### Create Manual Backup

```bash
cd /opt/business-app/app
./scripts/backup-databases.sh
```

Backups are saved to: `/opt/business-app/app/db_backup/`

### Automated Backups (Recommended)

Add to crontab for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line (backup at 2 AM daily)
0 2 * * * cd /opt/business-app/app && ./scripts/backup-databases.sh
```

---

## 🔍 Troubleshooting

### Check if services are running:

```bash
docker ps
```

### Check service logs:

```bash
docker logs business-auth --tail=50
docker logs business-party --tail=50
```

### Check database password:

```bash
# What password is PostgreSQL using?
docker exec business-postgres env | grep POSTGRES_PASSWORD

# What password is in .env.production?
cat /opt/business-app/app/.env.production | grep DB_PASSWORD
```

### If services still fail after restore:

```bash
# Check detailed logs
docker logs business-auth --tail=100

# Restart specific service
docker-compose -f docker-compose.prod.yml restart auth-service

# Full restart
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Verify Everything Works

After running the restore script:

```bash
# Check all services are healthy
docker-compose -f docker-compose.prod.yml ps

# Test the API
curl http://localhost:3002/health  # Auth service
curl http://localhost:3004/health  # Party service

# Check web app
curl http://localhost:3000
```

---

## 🎯 Summary

1. **Right Now**: Run `restore-db-with-backup.sh` to fix the password issue and restore data
2. **Future Deployments**: Use `deploy-with-password-check.sh` to safely deploy
3. **Regular Backups**: Run `backup-databases.sh` before major changes
4. **Never**: Manually change `DB_PASSWORD` in `.env.production`

---

## 📞 Quick Commands Reference

```bash
# Fix current issue
./scripts/restore-db-with-backup.sh /opt/business-app/app/db_backup

# Safe deployment
./scripts/deploy-with-password-check.sh

# Create backup
./scripts/backup-databases.sh

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker logs business-auth --tail=50
```

