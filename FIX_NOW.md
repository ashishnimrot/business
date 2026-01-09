# 🚨 FIX YOUR DATABASE PASSWORD ISSUE NOW

## ⚡ 3-Step Quick Fix

### 1️⃣ Find Your EC2 IP Address

```bash
AWS_PROFILE=business-app aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

**Save this IP address!**

---

### 2️⃣ Upload Files to EC2

```bash
cd /Users/ashishnimrot/Project/business
./upload-to-ec2.sh YOUR_EC2_IP_HERE
```

Replace `YOUR_EC2_IP_HERE` with the IP from step 1.

**Example:**
```bash
./upload-to-ec2.sh 13.232.123.45
```

---

### 3️⃣ SSH and Run Restore

```bash
# SSH into EC2
ssh -i ~/.ssh/business-app-key.pem ec2-user@YOUR_EC2_IP_HERE

# Once connected, run:
cd /opt/business-app/app
./scripts/restore-db-with-backup.sh /opt/business-app/app/db_backup
```

---

## ✅ What This Does

- ✅ Fixes password mismatch between services and PostgreSQL
- ✅ Restores ALL your customer data from backups
- ✅ Sets up consistent password in `.env.production`
- ✅ Restarts all services correctly
- ✅ Takes about 5-10 minutes total

---

## 🎯 Expected Output

You should see:

```
╔════════════════════════════════════════════════════════════════╗
║     DATABASE RESTORE WITH BACKUP IMPORT                        ║
╚════════════════════════════════════════════════════════════════╝

📋 Step 1/6: Checking .env.production for DB_PASSWORD...
✅ Using existing DB_PASSWORD from .env.production
   Password length: 32 characters

📋 Step 2/6: Checking backup files...
   Found backups:
   ✓ auth_db: auth_db_20260108_180446.sql
   ✓ business_db: business_db_20260108_180446.sql
   ✓ party_db: party_db_20260108_180446.sql
   ✓ inventory_db: inventory_db_20260108_180446.sql
   ✓ invoice_db: invoice_db_20260108_180446.sql
   ✓ payment_db: payment_db_20260108_180446.sql

📋 Step 3/6: Stopping all services...
✅ All services stopped

📋 Step 4/6: Recreating PostgreSQL with correct password...
   Waiting for PostgreSQL to be ready...
✅ PostgreSQL is ready

📋 Step 5/6: Importing database backups...
   Importing auth_db from auth_db_20260108_180446.sql...
   ✓ auth_db imported successfully
   [... more imports ...]

📋 Step 6/6: Starting all services...
   Waiting for services to be healthy...

════════════════════════════════════════════════════════════════
✅ DATABASE RESTORE COMPLETE!
════════════════════════════════════════════════════════════════
```

---

## 🔍 Verify It Worked

After the script completes:

```bash
# Check all containers are running
docker ps

# Should see all services "Up" and "healthy"
```

Check auth service logs:

```bash
docker logs business-auth --tail=20
```

You should see:
```
[Nest] 1  - 01/08/2026, XX:XX:XX PM     LOG [NestApplication] Nest application successfully started
```

**No more password authentication errors!**

---

## 🆘 If Something Goes Wrong

### Services still failing?

```bash
# Check what password PostgreSQL is using
docker exec business-postgres env | grep POSTGRES_PASSWORD

# Check what's in .env.production
cat /opt/business-app/app/.env.production | grep DB_PASSWORD

# They should match!
```

### Need to restart?

```bash
cd /opt/business-app/app
docker-compose -f docker-compose.prod.yml restart
```

### Still stuck?

Check the detailed guide:
```bash
cat /opt/business-app/DEPLOYMENT_INSTRUCTIONS.md
```

---

## 📞 Quick Commands

```bash
# Get EC2 IP
AWS_PROFILE=business-app aws ec2 describe-instances --region ap-south-1 --filters "Name=tag:Name,Values=business-app-beta" "Name=instance-state-name,Values=running" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text

# Upload to EC2
./upload-to-ec2.sh YOUR_EC2_IP

# SSH to EC2
ssh -i ~/.ssh/business-app-key.pem ec2-user@YOUR_EC2_IP

# Run restore
cd /opt/business-app/app && ./scripts/restore-db-with-backup.sh /opt/business-app/app/db_backup
```

---

**Ready? Start with Step 1! 🚀**

