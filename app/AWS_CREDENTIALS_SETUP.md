# AWS Credentials Setup Guide

## Quick Setup

### Step 1: Get AWS Credentials

You need:
1. **AWS Access Key ID**
2. **AWS Secret Access Key**

**How to get them:**
1. Log in to AWS Console: https://console.aws.amazon.com
2. Go to IAM → Users → Your User → Security Credentials
3. Click "Create Access Key"
4. Choose "Command Line Interface (CLI)"
5. Download or copy the credentials

### Step 2: Configure AWS CLI

Run this command:

```bash
aws configure
```

**Enter when prompted:**
```
AWS Access Key ID: [paste your Access Key ID]
AWS Secret Access Key: [paste your Secret Access Key]
Default region name: ap-south-1
Default output format: json
```

### Step 3: Verify Configuration

```bash
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "...",
    "Account": "...",
    "Arn": "arn:aws:iam::ACCOUNT:user/YOUR_USER"
}
```

### Step 4: Deploy!

**If using default profile:**
```bash
cd app
make deploy-aws-quick
```

**If using a named profile (like `business-app`):**
```bash
cd app
export AWS_PROFILE=business-app
make deploy-aws-quick
```

Or pass it directly:
```bash
cd app
AWS_PROFILE=business-app make deploy-aws-quick
```

## Using AWS Profiles

If you have multiple AWS accounts or profiles:

```bash
# Set profile as environment variable
export AWS_PROFILE=business-app

# Then deploy
make deploy-aws-quick
```

Or use it inline:
```bash
AWS_PROFILE=business-app make deploy-aws-quick
```

## Alternative: Environment Variables

If you prefer environment variables instead of profiles:

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_DEFAULT_REGION="ap-south-1"
```

Then run:
```bash
make deploy-aws-quick
```

## Troubleshooting

### "AWS credentials not configured"
- Run `aws configure` and enter your credentials
- Or set environment variables (see above)

### "Access Denied" errors
- Check your IAM user has EC2 permissions
- The deployment script will create IAM user automatically if needed

### "Region not found"
- Make sure you're using `ap-south-1` (Mumbai)
- Or specify a different region when prompted

## Security Notes

- ⚠️ Never commit AWS credentials to git
- ✅ Use IAM users (not root account)
- ✅ Use least privilege permissions
- ✅ Rotate credentials regularly

## Next Steps

Once credentials are configured:
1. Run `make deploy-aws-quick`
2. Wait 5-10 minutes
3. Get your application URL
4. Start using your app!

