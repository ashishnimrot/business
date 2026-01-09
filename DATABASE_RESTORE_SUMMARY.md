# 🎯 Database Restore & Password Fix - Quick Start

## ✅ What I've Created for You

I've created 4 new files to solve your database password issue and prevent it from happening again:

### 1. **restore-db-with-backup.sh** 
   - Fixes the password mismatch issue
   - Imports all your database backups (no data loss!)
   - Sets up consistent password in `.env.production`
   - Location: `app/scripts/restore-db-with-backup.sh`

### 2. **backup-databases.sh**
   - Creates backups of all databases
   - Run before any major changes
   - Location: `app/scripts/backup-databases.sh`

### 3. **deploy-with-password-check.sh**
   - Safe deployment script
   - Preserves DB_PASSWORD automatically
   - Creates backups before deployment
   - Location: `app/scripts/deploy-with-password-check.sh`

### 4. **upload-to-ec2.sh**
   - Helper script to upload everything to EC2
   - Location: `upload-to-ec2.sh` (root directory)

---

## 🚀 Quick Fix (3 Commands)

### Step 1: Upload to EC2

```bash
cd /Users/ashishnimrot/Project/business
./upload-to-ec2.sh YOUR_EC2_IP
```

Replace `YOUR_EC2_IP` with your actual EC2 IP address.

### Step 2: SSH to EC2

```bash
ssh -i ~/.ssh/business-app-key.pem ec2-user@YOUR_EC2_IP
```

### Step 3: Run Restore

```bash
cd /opt/business-app/app
./scripts/restore-db-with-backup.sh /opt/business-app/app/db_backup
```

**That's it!** Your services will be fixed and all customer data restored.

---

## 📊 What the Restore Script Does

1. ✅ **Checks `.env.production`** - Uses existing password or creates a new one
2. ✅ **Finds your backups** - Locates all 6 database backup files
3. ✅ **Stops services** - Gracefully stops all containers
4. ✅ **Recreates PostgreSQL** - With the correct password
5. ✅ **Imports backups** - Restores all customer data
6. ✅ **Starts services** - Brings everything back online

---

## 🔒 How This Prevents Future Issues

### The Problem
Every time services were rebuilt, they generated a **new** random password, but the old PostgreSQL container kept using the **old** password. This caused authentication failures.

### The Solution
The new scripts ensure:
- ✅ `DB_PASSWORD` is stored in `.env.production`
- ✅ Password is **never** regenerated after initial setup
- ✅ All services use the **same** password from `.env.production`
- ✅ Automatic backups before any deployment

---

## 📋 For Future Deployments

### Safe Deployment (Recommended)

```bash
cd /opt/business-app/app
./scripts/deploy-with-password-check.sh
```

This will:
1. Create automatic backup
2. Pull latest code
3. Rebuild services (preserving password)
4. Restart everything safely

### Manual Backup

```bash
cd /opt/business-app/app
./scripts/backup-databases.sh
```

---

## 🔍 Verify Everything Works

After running the restore:

```bash
# Check all containers are running
docker ps

# Check service logs
docker logs business-auth --tail=50
docker logs business-party --tail=50

# Check service status
docker-compose -f docker-compose.prod.yml ps

# Test the web app
curl http://localhost:3000
```

---

## 📞 Troubleshooting

### If upload fails:

Check your SSH key path:
```bash
ls -la ~/.ssh/business-app-key.pem
```

If it's in a different location, edit `upload-to-ec2.sh` and update the `KEY_FILE` variable.

### If restore fails:

Check the logs:
```bash
docker logs business-postgres --tail=100
```

### If services don't start:

```bash
# Restart everything
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Wait 30 seconds, then check
docker-compose -f docker-compose.prod.yml ps
```

---

## 📁 Files Created

```
/Users/ashishnimrot/Project/business/
├── upload-to-ec2.sh                          # Upload helper
├── DEPLOYMENT_INSTRUCTIONS.md                # Detailed instructions
├── DATABASE_RESTORE_SUMMARY.md              # This file
└── app/
    └── scripts/
        ├── restore-db-with-backup.sh        # Main restore script
        ├── backup-databases.sh              # Backup script
        └── deploy-with-password-check.sh    # Safe deployment
```

---

## ✨ Key Points

1. **No Data Loss**: All customer data is preserved in the backup files
2. **One-Time Fix**: Run restore script once to fix the issue
3. **Future-Proof**: New deployment script prevents this from happening again
4. **Automatic Backups**: Built into the deployment process
5. **Password Consistency**: `.env.production` is the single source of truth

---

## 🎯 Next Steps

1. Run `./upload-to-ec2.sh YOUR_EC2_IP` from your local machine
2. SSH to EC2 and run the restore script
3. Verify services are working
4. Use `deploy-with-password-check.sh` for all future deployments

---

**Need help?** Check `DEPLOYMENT_INSTRUCTIONS.md` for detailed troubleshooting steps.

