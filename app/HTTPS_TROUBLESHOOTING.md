# HTTPS Troubleshooting Guide

If `https://samriddhi.buzz` is not working after SSL setup, follow these steps:

## Step 1: Run Diagnostic Script on EC2

SSH into your EC2 instance and run:

```bash
cd /opt/business-app/app
sudo bash scripts/diagnose-https.sh samriddhi.buzz
```

This will check:
- ✅ Nginx status
- ✅ Port 443 listening
- ✅ SSL certificate configuration
- ✅ Nginx SSL config
- ✅ Local HTTPS connectivity

## Step 2: Check Security Group (Port 443)

**From your local machine**, run:

```bash
cd app
AWS_PROFILE=business-app bash scripts/add-https-port.sh ap-south-1
```

This will:
- Find your EC2 instance
- Check if port 443 is open
- Add it if missing

## Step 3: Verify Nginx SSL Configuration

On EC2, check if Nginx has SSL configured:

```bash
sudo grep -A 5 "listen 443" /etc/nginx/conf.d/business-app.conf
sudo grep "ssl_certificate" /etc/nginx/conf.d/business-app.conf
```

If SSL config is missing, re-run SSL setup:

```bash
sudo bash scripts/setup-ssl-ec2.sh samriddhi.buzz admin@samriddhi.buzz
```

## Step 4: Check Nginx Status and Reload

```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Test HTTPS Locally on EC2

```bash
curl -I https://localhost
curl -I https://samriddhi.buzz
```

## Step 6: Check Logs

```bash
# Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Certbot logs
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# Nginx access logs
sudo tail -50 /var/log/nginx/access.log
```

## Common Issues and Fixes

### Issue 1: Port 443 Not Open in Security Group
**Symptom**: Connection timeout when accessing HTTPS

**Fix**: Run `add-https-port.sh` from local machine (Step 2 above)

### Issue 2: Nginx Not Listening on Port 443
**Symptom**: Diagnostic shows "Nginx is NOT listening on port 443"

**Fix**: Re-run SSL setup:
```bash
sudo bash scripts/setup-ssl-ec2.sh samriddhi.buzz admin@samriddhi.buzz
```

### Issue 3: SSL Certificate Not Found
**Symptom**: Diagnostic shows "SSL certificate file NOT found"

**Fix**: Re-run SSL setup:
```bash
sudo bash scripts/setup-ssl-ec2.sh samriddhi.buzz admin@samriddhi.buzz
```

### Issue 4: Nginx Configuration Error
**Symptom**: `nginx -t` fails

**Fix**: Check Nginx config:
```bash
sudo nginx -t
sudo nano /etc/nginx/conf.d/business-app.conf
# Fix any errors, then:
sudo systemctl reload nginx
```

### Issue 5: Certificate Expired or Invalid
**Symptom**: Browser shows "Certificate Error"

**Fix**: Check certificate status:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## Quick Fix Commands

If you want to quickly re-setup everything:

```bash
# On EC2
cd /opt/business-app/app
sudo bash scripts/setup-ssl-ec2.sh samriddhi.buzz admin@samriddhi.buzz

# From local machine (check/add port 443)
cd app
AWS_PROFILE=business-app bash scripts/add-https-port.sh ap-south-1
```

## Verify HTTPS is Working

After fixes, test:

1. **From browser**: `https://samriddhi.buzz`
2. **From EC2**: `curl -I https://samriddhi.buzz`
3. **Check SSL**: `https://www.ssllabs.com/ssltest/analyze.html?d=samriddhi.buzz`

