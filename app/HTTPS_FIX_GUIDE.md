# HTTPS Fix Guide for samriddhi.buzz

## Quick Fix (Easiest - Run from Local Machine)

**Option 1: Remote Fix (Recommended)**

Run this from your local machine - it will SSH into EC2 and fix everything automatically:

```bash
cd app
bash scripts/fix-https-remote.sh ap-south-1 business-app-key samriddhi.buzz admin@samriddhi.buzz
```

This script will:
- ✅ Find your EC2 instance automatically
- ✅ Ensure port 443 is open in security group
- ✅ SSH into EC2 and run the complete fix
- ✅ Test HTTPS connectivity

## Manual Fix (Run on EC2 Instance)

If `https://samriddhi.buzz` is not working, run this comprehensive fix script on your EC2 instance:

```bash
# SSH into EC2
ssh -i ~/.ssh/business-app-key.pem ec2-user@<YOUR_EC2_IP>

# Navigate to app directory
cd /opt/business-app/app

# Pull latest code (if needed)
git pull origin main

# Run the complete HTTPS fix
sudo bash scripts/fix-https-complete.sh samriddhi.buzz admin@samriddhi.buzz
```

## What the Script Does

The `fix-https-complete.sh` script will:

1. ✅ **Diagnose current state** - Check SSL certificate, Nginx config, port 443, etc.
2. ✅ **Fix domain configuration** - Ensure domain is in Nginx config
3. ✅ **Setup Let's Encrypt validation path** - Required for SSL certificate
4. ✅ **Test and reload Nginx** - Ensure Nginx is running correctly
5. ✅ **Check security group** - Verify port 443 is open (and add if needed)
6. ✅ **Install Certbot** - If not already installed
7. ✅ **Obtain SSL certificate** - From Let's Encrypt
8. ✅ **Verify HTTPS** - Test that everything is working

## Manual Steps (If Script Fails)

### Step 1: Check Current Status

```bash
# On EC2 instance
sudo bash scripts/check-ssl-status.sh
```

### Step 2: Ensure Port 443 is Open

**From your local machine:**

```bash
cd app
bash scripts/add-https-port.sh ap-south-1
```

**Or manually in AWS Console:**
- EC2 → Security Groups → Your SG → Inbound Rules
- Add Rule: Port 443, Protocol TCP, Source 0.0.0.0/0

### Step 3: Setup Domain in Nginx

```bash
# On EC2 instance
cd /opt/business-app/app
sudo bash scripts/setup-domain-ec2.sh samriddhi.buzz
```

### Step 4: Setup SSL Certificate

```bash
# On EC2 instance
cd /opt/business-app/app
sudo bash scripts/setup-ssl-ec2.sh samriddhi.buzz admin@samriddhi.buzz
```

## Common Issues & Solutions

### Issue 1: "Domain not pointing to this server"

**Solution:**
1. Check DNS: `dig samriddhi.buzz +short`
2. Should show your EC2 public IP
3. If not, update DNS A record in GoDaddy to point to EC2 IP

### Issue 2: "Port 80 not accessible"

**Solution:**
1. Check security group allows port 80
2. Run: `bash scripts/add-https-port.sh ap-south-1` (adds both 80 and 443)

### Issue 3: "Let's Encrypt rate limit"

**Solution:**
- Wait 1 hour if you've made too many requests
- Or use `--dry-run` flag to test without using quota

### Issue 4: "SSL certificate exists but HTTPS not working"

**Solution:**
```bash
# Check Nginx config
sudo nginx -t

# Check if port 443 is listening
sudo netstat -tuln | grep 443

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Issue 5: "502 Bad Gateway on HTTPS"

**Solution:**
1. Check if services are running: `docker ps`
2. Check Nginx upstream config
3. Restart services: `docker-compose -f docker-compose.prod.yml restart`

## Verification

After running the fix script, verify HTTPS is working:

```bash
# Test HTTPS
curl -I https://samriddhi.buzz

# Should return HTTP 200 or 301/302 redirect
```

## Expected Results

After successful setup:

- ✅ `https://samriddhi.buzz` - Works
- ✅ `https://www.samriddhi.buzz` - Works
- ✅ `http://samriddhi.buzz` - Redirects to HTTPS
- ✅ SSL certificate auto-renews every 90 days

## Troubleshooting Commands

```bash
# Check SSL certificate
sudo certbot certificates

# Check Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View SSL setup logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# View Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test certificate renewal
sudo certbot renew --dry-run

# Check if port 443 is listening
sudo netstat -tuln | grep 443
```

## Still Not Working?

1. **Check DNS propagation:**
   ```bash
   dig samriddhi.buzz +short
   nslookup samriddhi.buzz
   ```

2. **Check security group:**
   - Ensure port 80 (HTTP) is open
   - Ensure port 443 (HTTPS) is open

3. **Check Nginx configuration:**
   ```bash
   sudo nginx -t
   sudo cat /etc/nginx/conf.d/business-app.conf
   ```

4. **Check services are running:**
   ```bash
   docker ps
   docker-compose -f docker-compose.prod.yml ps
   ```

5. **Check firewall:**
   ```bash
   sudo iptables -L -n
   ```

## Support

If issues persist:
1. Check all logs: `sudo journalctl -u nginx -n 50`
2. Check Let's Encrypt logs: `sudo tail -50 /var/log/letsencrypt/letsencrypt.log`
3. Verify DNS: `dig samriddhi.buzz +short`
4. Test from different network/location

