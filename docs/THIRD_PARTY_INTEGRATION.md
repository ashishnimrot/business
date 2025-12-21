# Third-Party Services Integration Guide

**Version:** 1.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [SMS Gateway (OTP & Notifications)](#1-sms-gateway-otp--notifications)
3. [Email Service](#2-email-service)
4. [Payment Gateway](#3-payment-gateway)
5. [GSTN/IRP Integration (E-Invoice)](#4-gstnirp-integration-e-invoice)
6. [Cloud Storage (S3)](#5-cloud-storage-s3)
7. [Push Notifications](#6-push-notifications)
8. [Error Tracking & Monitoring](#7-error-tracking--monitoring)
9. [WhatsApp Business API](#8-whatsapp-business-api)
10. [Cost Estimation](#cost-estimation)
11. [Service Comparison Matrix](#service-comparison-matrix)

---

## Overview

This document provides comprehensive setup instructions for all third-party services required for the Business App. Each service includes:
- Provider options and recommendations
- Setup instructions
- API integration guide
- Cost estimation
- Security considerations

### Services Priority

| Service | Priority | Required For | MVP Required |
|---------|----------|--------------|--------------|
| SMS Gateway | P0 | User Authentication (OTP) | ✅ Yes |
| Email Service | P0 | Notifications, Invoice sharing | ✅ Yes |
| GSTN/IRP | P0 | E-Invoice generation | ✅ Yes |
| Cloud Storage | P0 | File uploads, PDF storage | ✅ Yes |
| Push Notifications | P1 | Mobile notifications | ✅ Yes |
| Error Tracking | P1 | Bug monitoring | ✅ Yes |
| Payment Gateway | P2 | Subscription payments | ❌ Post-MVP |
| WhatsApp API | P2 | Enhanced notifications | ❌ Post-MVP |

---

## 1. SMS Gateway (OTP & Notifications)

### Recommended Providers

| Provider | Best For | Pricing (per SMS) | DLT Compliant |
|----------|----------|-------------------|---------------|
| **MSG91** ⭐ | India market | ₹0.12-0.15 | ✅ Yes |
| Twilio | Global + India | ₹0.35-0.50 | ✅ Yes |
| Kaleyra | India market | ₹0.10-0.14 | ✅ Yes |
| TextLocal | Budget option | ₹0.09-0.12 | ✅ Yes |

### Primary Recommendation: MSG91

**Why MSG91:**
- Best for India market
- DLT compliant out of the box
- Excellent delivery rates (99%+)
- Good documentation
- Competitive pricing
- OTP auto-read support

### MSG91 Setup Guide

#### Step 1: Create Account

1. Visit [msg91.com](https://msg91.com)
2. Click "Start Free Trial"
3. Register with business email
4. Verify email and phone
5. Complete KYC (business PAN, GST)

#### Step 2: DLT Registration (Mandatory for India)

**What is DLT?**
DLT (Distributed Ledger Technology) registration is mandatory in India for sending SMS. TRAI requires all businesses to register their sender IDs and templates.

**Process:**
1. Choose DLT provider (Jio, Airtel, Vodafone, etc.)
2. Register as "Enterprise"
3. Submit documents:
   - Business PAN
   - GST Certificate
   - Authorization Letter
4. Register Sender ID (e.g., "BIZAPP")
5. Register message templates
6. Get approval (2-5 business days)

**Template Examples:**

```
OTP Template:
"Your OTP for Business App login is {#var#}. Valid for 5 minutes. Do not share with anyone. -BIZAPP"

Invoice Template:
"Invoice {#var#} of Rs.{#var#} has been generated. View at {#var#} -BIZAPP"

Payment Reminder:
"Reminder: Payment of Rs.{#var#} from {#var#} is due on {#var#}. -BIZAPP"
```

#### Step 3: Get API Credentials

1. Login to MSG91 dashboard
2. Go to API → API Keys
3. Create new API key with label "Business App Production"
4. Copy Auth Key (keep secure)
5. Note your Sender ID

#### Step 4: API Integration

**Environment Variables:**
```bash
MSG91_AUTH_KEY=your-auth-key
MSG91_SENDER_ID=BIZAPP
MSG91_ROUTE=4  # Transactional route
MSG91_OTP_TEMPLATE_ID=your-otp-template-id
```

**Send OTP API:**
```typescript
// services/sms.service.ts
import axios from 'axios';

interface SendOTPParams {
  phone: string;
  otp: string;
}

export class SMSService {
  private readonly baseUrl = 'https://api.msg91.com/api/v5';
  
  async sendOTP(params: SendOTPParams): Promise<boolean> {
    const { phone, otp } = params;
    
    try {
      const response = await axios.post(`${this.baseUrl}/otp`, {
        template_id: process.env.MSG91_OTP_TEMPLATE_ID,
        mobile: `91${phone}`,
        otp: otp,
        authkey: process.env.MSG91_AUTH_KEY,
      });
      
      return response.data.type === 'success';
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send OTP');
    }
  }
  
  async sendSMS(phone: string, message: string, templateId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/flow`, {
        flow_id: templateId,
        sender: process.env.MSG91_SENDER_ID,
        mobiles: `91${phone}`,
        VAR1: message,
        authkey: process.env.MSG91_AUTH_KEY,
      });
      
      return response.data.type === 'success';
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send SMS');
    }
  }
}
```

#### Step 5: Webhook Setup (Delivery Reports)

```typescript
// Configure webhook URL in MSG91 dashboard
// POST /api/webhooks/sms/delivery

app.post('/api/webhooks/sms/delivery', (req, res) => {
  const { request_id, status, mobile } = req.body;
  
  // Update delivery status in database
  // Possible statuses: DELIVRD, FAILED, EXPIRED
  
  res.status(200).send('OK');
});
```

### Cost Estimation (SMS)

| Usage | Monthly Volume | Cost (MSG91) |
|-------|---------------|--------------|
| OTP | 10,000 | ₹1,500 |
| Notifications | 5,000 | ₹750 |
| Reminders | 3,000 | ₹450 |
| **Total** | **18,000** | **₹2,700/month** |

---

## 2. Email Service

### Recommended Providers

| Provider | Best For | Free Tier | Pricing |
|----------|----------|-----------|---------|
| **SendGrid** ⭐ | Transactional + Marketing | 100/day | $19.95/50K |
| AWS SES | High volume, cost-effective | 62K free (with EC2) | $0.10/1K |
| Postmark | Transactional only | 100/month | $15/10K |
| Mailgun | Developers | 5K/month | $35/50K |

### Primary Recommendation: SendGrid

**Why SendGrid:**
- Excellent deliverability
- Easy template management
- Good analytics
- Generous free tier
- Easy integration

### SendGrid Setup Guide

#### Step 1: Create Account

1. Visit [sendgrid.com](https://sendgrid.com)
2. Sign up with business email
3. Complete verification
4. Choose plan (Free to start)

#### Step 2: Domain Verification

1. Go to Settings → Sender Authentication
2. Add your domain (e.g., business-app.com)
3. Add DNS records (CNAME, TXT)
4. Wait for verification (up to 48 hours)

**Required DNS Records:**
```
Type    Name                        Value
CNAME   em1234.business-app.com    u1234567.wl.sendgrid.net
CNAME   s1._domainkey              s1.domainkey.u1234567.wl.sendgrid.net
CNAME   s2._domainkey              s2.domainkey.u1234567.wl.sendgrid.net
TXT     @                          v=spf1 include:sendgrid.net ~all
```

#### Step 3: Create API Key

1. Go to Settings → API Keys
2. Create API Key with "Full Access" or "Restricted Access"
3. Copy and store securely
4. Never expose in frontend code

#### Step 4: Create Email Templates

1. Go to Email API → Dynamic Templates
2. Create templates for:
   - Welcome Email
   - OTP Email (backup)
   - Invoice Sent
   - Payment Reminder
   - Payment Received

**Template Example (Invoice):**
```html
<!-- Template ID: d-abc123 -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice {{invoice_number}}</h1>
    </div>
    <div class="content">
      <p>Dear {{customer_name}},</p>
      <p>An invoice of <strong>₹{{amount}}</strong> has been generated for you.</p>
      <p>Invoice Date: {{invoice_date}}</p>
      <p>Due Date: {{due_date}}</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{invoice_link}}" class="button">View Invoice</a>
      </p>
      <p>Thank you for your business!</p>
      <p>Regards,<br>{{business_name}}</p>
    </div>
  </div>
</body>
</html>
```

#### Step 5: API Integration

**Environment Variables:**
```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@business-app.com
SENDGRID_FROM_NAME=Business App
```

**Email Service:**
```typescript
// services/email.service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface SendEmailParams {
  to: string;
  templateId: string;
  dynamicData: Record<string, any>;
}

export class EmailService {
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    const { to, templateId, dynamicData } = params;
    
    try {
      await sgMail.send({
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: process.env.SENDGRID_FROM_NAME,
        },
        templateId,
        dynamicTemplateData: dynamicData,
      });
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }
  
  async sendInvoiceEmail(params: {
    to: string;
    customerName: string;
    invoiceNumber: string;
    amount: number;
    invoiceDate: string;
    dueDate: string;
    invoiceLink: string;
    businessName: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: params.to,
      templateId: process.env.SENDGRID_INVOICE_TEMPLATE_ID,
      dynamicData: {
        customer_name: params.customerName,
        invoice_number: params.invoiceNumber,
        amount: params.amount.toLocaleString('en-IN'),
        invoice_date: params.invoiceDate,
        due_date: params.dueDate,
        invoice_link: params.invoiceLink,
        business_name: params.businessName,
      },
    });
  }
}
```

### Cost Estimation (Email)

| Usage | Monthly Volume | Cost (SendGrid) |
|-------|---------------|-----------------|
| Transactional | 5,000 | Free (under 100/day) |
| Scaled (50K+) | 50,000 | $19.95/month |

---

## 3. Payment Gateway

### Recommended Providers

| Provider | Best For | Transaction Fee | Setup Fee |
|----------|----------|-----------------|-----------|
| **Razorpay** ⭐ | India market | 2% | Free |
| Stripe | Global | 2.9% + ₹2 | Free |
| PayU | India market | 2% | Free |
| Cashfree | India market | 1.90% | Free |

### Primary Recommendation: Razorpay

**Why Razorpay:**
- Best for Indian businesses
- Excellent documentation
- UPI, Cards, Wallets, Net Banking
- Easy integration
- Good dashboard

### Razorpay Setup Guide

#### Step 1: Create Account

1. Visit [razorpay.com](https://razorpay.com)
2. Sign up with business email
3. Complete KYC:
   - Business PAN
   - GST Certificate
   - Bank Account Details
   - Authorized Signatory ID
4. Wait for activation (1-3 business days)

#### Step 2: Get API Keys

1. Go to Settings → API Keys
2. Generate Test Keys first
3. Generate Live Keys after testing

```bash
# Test Environment
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Live Environment
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

#### Step 3: Configure Webhooks

1. Go to Settings → Webhooks
2. Add webhook URL: `https://api.business-app.com/webhooks/razorpay`
3. Select events:
   - payment.captured
   - payment.failed
   - subscription.charged
   - subscription.cancelled
4. Copy webhook secret

#### Step 4: API Integration

```typescript
// services/payment.service.ts
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export class PaymentService {
  // Create subscription order
  async createSubscription(params: {
    planId: string;
    customerId: string;
    email: string;
    phone: string;
  }): Promise<any> {
    const subscription = await razorpay.subscriptions.create({
      plan_id: params.planId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles
      notes: {
        customer_id: params.customerId,
      },
    });
    
    return subscription;
  }
  
  // Create one-time payment order
  async createOrder(params: {
    amount: number; // in paise
    currency: string;
    receipt: string;
  }): Promise<any> {
    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
    });
    
    return order;
  }
  
  // Verify payment signature
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const body = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    
    return expectedSignature === params.signature;
  }
}
```

#### Step 5: Webhook Handler

```typescript
// routes/webhooks/razorpay.ts
app.post('/webhooks/razorpay', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }
  
  const event = req.body.event;
  const payload = req.body.payload;
  
  switch (event) {
    case 'payment.captured':
      await handlePaymentCaptured(payload);
      break;
    case 'subscription.charged':
      await handleSubscriptionCharged(payload);
      break;
    // ... other events
  }
  
  res.status(200).send('OK');
});
```

### Cost Estimation (Payments)

| Volume | Monthly Transactions | Razorpay Fee (2%) |
|--------|---------------------|-------------------|
| Low | 100 × ₹999 | ₹1,998 |
| Medium | 500 × ₹999 | ₹9,990 |
| High | 1,000 × ₹999 | ₹19,980 |

---

## 4. GSTN/IRP Integration (E-Invoice)

### Overview

E-Invoice generation in India requires integration with the Invoice Registration Portal (IRP). This is mandatory for businesses with turnover above ₹5 Cr.

### Integration Options

| Option | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **GSP (Recommended)** | Simplicity | Low | ₹2-5/invoice |
| Direct IRP | Control | High | Free (infra cost) |
| ERP Integration | Enterprise | Medium | Varies |

### Recommended GSPs (GST Suvidha Providers)

| GSP | Features | Pricing |
|-----|----------|---------|
| **ClearTax** ⭐ | Best API, E-Invoicing | ₹2-3/invoice |
| Masters India | Good support | ₹2-4/invoice |
| IRIS | Enterprise focus | Custom |
| Tally GSP | Tally integration | Custom |

### ClearTax Integration Guide

#### Step 1: Create Account

1. Visit [cleartax.in/business](https://cleartax.in/business)
2. Sign up as API Partner
3. Submit business documents
4. Get API access (sandbox first)

#### Step 2: Sandbox Testing

1. Get sandbox credentials
2. Test all E-Invoice scenarios
3. Validate responses
4. Document edge cases

#### Step 3: Production Setup

```bash
# Sandbox
CLEARTAX_API_URL=https://sandbox.cleartax.in/api
CLEARTAX_API_KEY=sandbox-key
CLEARTAX_GSTIN=test-gstin

# Production
CLEARTAX_API_URL=https://api.cleartax.in
CLEARTAX_API_KEY=production-key
CLEARTAX_GSTIN=actual-gstin
```

#### Step 4: API Integration

```typescript
// services/einvoice.service.ts
import axios from 'axios';

interface InvoiceData {
  sellerGstin: string;
  buyerGstin: string;
  documentType: 'INV' | 'CRN' | 'DBN';
  documentNumber: string;
  documentDate: string;
  items: Array<{
    name: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
  // ... other fields
}

export class EInvoiceService {
  private readonly baseUrl = process.env.CLEARTAX_API_URL;
  private readonly apiKey = process.env.CLEARTAX_API_KEY;
  
  async generateEInvoice(data: InvoiceData): Promise<{
    irn: string;
    ackNumber: string;
    ackDate: string;
    signedQRCode: string;
    signedInvoice: string;
  }> {
    const payload = this.transformToIRPFormat(data);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/eInvoice/generate`,
        payload,
        {
          headers: {
            'X-Cleartax-Auth-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = response.data;
      
      return {
        irn: result.Irn,
        ackNumber: result.AckNo,
        ackDate: result.AckDt,
        signedQRCode: result.SignedQRCode,
        signedInvoice: result.SignedInvoice,
      };
    } catch (error) {
      if (error.response?.data?.errorCode === 'DUPLICATE_IRN') {
        // IRN already exists, fetch existing
        return this.getEInvoiceByDocNumber(data.documentNumber);
      }
      throw error;
    }
  }
  
  async cancelEInvoice(irn: string, reason: string): Promise<boolean> {
    const response = await axios.post(
      `${this.baseUrl}/v2/eInvoice/cancel`,
      {
        Irn: irn,
        CnlRsn: '1', // 1=Duplicate, 2=Data Entry Mistake
        CnlRem: reason,
      },
      {
        headers: {
          'X-Cleartax-Auth-Token': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.success;
  }
  
  private transformToIRPFormat(data: InvoiceData): any {
    // Transform to IRP JSON schema
    return {
      Version: '1.1',
      TranDtls: {
        TaxSch: 'GST',
        SupTyp: 'B2B',
        RegRev: 'N',
        IgstOnIntra: 'N',
      },
      DocDtls: {
        Typ: data.documentType,
        No: data.documentNumber,
        Dt: data.documentDate,
      },
      SellerDtls: {
        Gstin: data.sellerGstin,
        // ... other seller details
      },
      BuyerDtls: {
        Gstin: data.buyerGstin,
        // ... other buyer details
      },
      ItemList: data.items.map((item, index) => ({
        SlNo: String(index + 1),
        PrdDesc: item.name,
        HsnCd: item.hsnCode,
        Qty: item.quantity,
        UnitPrice: item.unitPrice,
        GstRt: item.taxRate,
        // ... calculated amounts
      })),
      // ... other required fields
    };
  }
}
```

### E-Way Bill Integration

For goods movement above ₹50,000, E-Way Bill is required.

```typescript
async generateEWayBill(data: {
  irn: string;
  transporterId: string;
  transportMode: '1' | '2' | '3' | '4'; // 1=Road, 2=Rail, 3=Air, 4=Ship
  vehicleNumber?: string;
  distance: number;
}): Promise<{
  ewbNumber: string;
  validUpto: string;
}> {
  const response = await axios.post(
    `${this.baseUrl}/v2/ewaybill/generate-by-irn`,
    {
      Irn: data.irn,
      Distance: data.distance,
      TransMode: data.transportMode,
      TransId: data.transporterId,
      VehNo: data.vehicleNumber,
    },
    {
      headers: {
        'X-Cleartax-Auth-Token': this.apiKey,
      },
    }
  );
  
  return {
    ewbNumber: response.data.EwbNo,
    validUpto: response.data.EwbValidTill,
  };
}
```

### Cost Estimation (E-Invoice)

| Volume | Monthly Invoices | GSP Cost (₹3/invoice) |
|--------|-----------------|----------------------|
| Low | 100 | ₹300 |
| Medium | 500 | ₹1,500 |
| High | 2,000 | ₹6,000 |

---

## 5. Cloud Storage (S3)

### AWS S3 Setup Guide

#### Step 1: Create AWS Account

1. Visit [aws.amazon.com](https://aws.amazon.com)
2. Create account
3. Enable MFA
4. Setup billing alerts

#### Step 2: Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://business-app-files-production --region ap-south-1

# Configure bucket settings
aws s3api put-bucket-versioning \
  --bucket business-app-files-production \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket business-app-files-production \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### Step 3: Create IAM User

```json
// IAM Policy for S3 Access
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::business-app-files-production",
        "arn:aws:s3:::business-app-files-production/*"
      ]
    }
  ]
}
```

#### Step 4: API Integration

```typescript
// services/storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export class StorageService {
  private readonly bucket = process.env.AWS_S3_BUCKET;
  
  async uploadFile(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<string> {
    await s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    }));
    
    return `https://${this.bucket}.s3.amazonaws.com/${params.key}`;
  }
  
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    
    return getSignedUrl(s3Client, command, { expiresIn });
  }
  
  async deleteFile(key: string): Promise<void> {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
```

### Cost Estimation (S3)

| Usage | Storage | Data Transfer | Monthly Cost |
|-------|---------|---------------|--------------|
| Low | 10 GB | 5 GB | ~$0.30 |
| Medium | 50 GB | 20 GB | ~$1.50 |
| High | 200 GB | 100 GB | ~$6.00 |

---

## 6. Push Notifications

### Firebase Cloud Messaging (FCM) Setup

#### Step 1: Create Firebase Project

1. Visit [console.firebase.google.com](https://console.firebase.google.com)
2. Create new project
3. Enable Cloud Messaging

#### Step 2: Get Credentials

1. Go to Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file

```bash
# Save as firebase-admin-sdk.json
FIREBASE_PROJECT_ID=business-app-xxxxx
GOOGLE_APPLICATION_CREDENTIALS=./firebase-admin-sdk.json
```

#### Step 3: API Integration

```typescript
// services/notification.service.ts
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-admin-sdk.json')),
});

export class NotificationService {
  async sendPushNotification(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<boolean> {
    try {
      await admin.messaging().send({
        token: params.token,
        notification: {
          title: params.title,
          body: params.body,
        },
        data: params.data,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
      
      return true;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }
  
  async sendToMultipleDevices(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    await admin.messaging().sendEachForMulticast({
      tokens: params.tokens,
      notification: {
        title: params.title,
        body: params.body,
      },
      data: params.data,
    });
  }
}
```

### Cost: Free (FCM is free)

---

## 7. Error Tracking & Monitoring

### Sentry Setup Guide

#### Step 1: Create Account

1. Visit [sentry.io](https://sentry.io)
2. Create organization
3. Create project (React Native)
4. Get DSN

```bash
SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/123456
```

#### Step 2: Integration

```typescript
// Mobile App (React Native)
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});

// Backend (NestJS)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Cost Estimation (Sentry)

| Plan | Errors/Month | Cost |
|------|--------------|------|
| Developer | 5,000 | Free |
| Team | 50,000 | $26/month |
| Business | 100,000+ | Custom |

---

## 8. WhatsApp Business API

### Overview (Post-MVP)

WhatsApp Business API integration for:
- Invoice sharing
- Payment reminders
- Order confirmations

### Provider Options

| Provider | Features | Cost |
|----------|----------|------|
| Interakt | Easy setup | ₹999/month + per message |
| Wati | Good templates | ₹2,499/month |
| Twilio | Enterprise | Pay per message |

### Cost: ₹1,000-3,000/month + per message

---

## Cost Estimation

### Monthly Cost Summary (MVP)

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| SMS Gateway | MSG91 | ₹2,700 |
| Email | SendGrid | Free - $20 |
| GSTN/E-Invoice | ClearTax | ₹1,500 |
| Cloud Storage | AWS S3 | ₹150 |
| Push Notifications | Firebase | Free |
| Error Tracking | Sentry | Free - $26 |
| **Total (Low)** | | **~₹4,350/month** |
| **Total (Medium)** | | **~₹7,500/month** |

### Setup Checklist

#### Week 1
- [ ] Create MSG91 account
- [ ] Complete DLT registration
- [ ] Create SendGrid account
- [ ] Verify email domain
- [ ] Create AWS account

#### Week 2
- [ ] Setup S3 buckets
- [ ] Get ClearTax sandbox access
- [ ] Create Firebase project
- [ ] Create Sentry project
- [ ] Document all credentials

#### Week 3
- [ ] Test SMS integration
- [ ] Test Email integration
- [ ] Test E-Invoice sandbox
- [ ] Test Push notifications
- [ ] Setup monitoring

---

## Service Comparison Matrix

| Feature | Priority | Provider | Complexity | Cost/Month |
|---------|----------|----------|------------|------------|
| OTP SMS | P0 | MSG91 | Low | ₹1,500 |
| Email | P0 | SendGrid | Low | Free |
| E-Invoice | P0 | ClearTax | Medium | ₹1,500 |
| Storage | P0 | AWS S3 | Low | ₹150 |
| Push | P1 | Firebase | Low | Free |
| Monitoring | P1 | Sentry | Low | Free |
| Payments | P2 | Razorpay | Medium | 2% fee |
| WhatsApp | P2 | Interakt | Medium | ₹1,500 |

---

## Security Best Practices

1. **Never commit API keys** to version control
2. Use **environment variables** for all credentials
3. Enable **2FA** on all provider accounts
4. Rotate API keys **quarterly**
5. Use **IP whitelisting** where available
6. Monitor **usage and billing** alerts
7. Keep **audit logs** of all API calls
8. Use **separate keys** for test/production

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025-12-21  
**Next Review:** Before Sprint 1
