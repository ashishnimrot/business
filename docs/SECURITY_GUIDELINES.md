# Security Guidelines & Best Practices

**Version:** 1.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Authorization & Access Control](#authorization--access-control)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [Mobile App Security](#mobile-app-security)
7. [Infrastructure Security](#infrastructure-security)
8. [Secure Development Practices](#secure-development-practices)
9. [Security Monitoring](#security-monitoring)
10. [Incident Response](#incident-response)
11. [Compliance Requirements](#compliance-requirements)
12. [Security Checklist](#security-checklist)

---

## Security Overview

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum necessary access
3. **Secure by Default** - Security built-in, not bolted-on
4. **Zero Trust** - Never trust, always verify
5. **Data Minimization** - Collect only what's needed

### Security Requirements Summary

| Requirement | Standard | Priority |
|-------------|----------|----------|
| Data Encryption (Transit) | TLS 1.3 | P0 |
| Data Encryption (Rest) | AES-256 | P0 |
| Authentication | OTP + JWT | P0 |
| Session Management | Secure tokens | P0 |
| Input Validation | All endpoints | P0 |
| Rate Limiting | All APIs | P0 |
| Audit Logging | All data changes | P1 |
| DPDP Compliance | India Data Protection | P0 |

---

## Authentication Security

### OTP Security

**Generation:**
```typescript
// Secure OTP generation
import crypto from 'crypto';

export function generateSecureOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  // Use crypto.randomInt for secure random numbers
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
}
```

**Storage:**
```typescript
// Store OTP securely with bcrypt
import bcrypt from 'bcrypt';

export async function hashOTP(otp: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}
```

**Rate Limiting:**
```typescript
// OTP rate limiting configuration
export const OTP_RATE_LIMITS = {
  maxRequestsPerHour: 3,
  maxVerifyAttempts: 5,
  otpExpiryMinutes: 5,
  cooldownMinutes: 60,
};
```

### JWT Security

**Token Configuration:**
```typescript
// JWT configuration
export const JWT_CONFIG = {
  accessToken: {
    algorithm: 'RS256',       // Use asymmetric encryption
    expiresIn: '15m',         // Short-lived
    issuer: 'business-app',
    audience: 'business-app-api',
  },
  refreshToken: {
    algorithm: 'RS256',
    expiresIn: '30d',
    issuer: 'business-app',
  },
};
```

**Token Generation:**
```typescript
// Secure token generation
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

export class TokenService {
  generateAccessToken(userId: string, businessId?: string): string {
    const payload = {
      sub: userId,
      bid: businessId,
      jti: uuidv4(),        // Unique token ID
      type: 'access',
    };
    
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      expiresIn: '15m',
      privateKey: process.env.JWT_PRIVATE_KEY,
    });
  }
  
  generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      jti: uuidv4(),
      type: 'refresh',
    };
    
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      expiresIn: '30d',
      privateKey: process.env.JWT_REFRESH_PRIVATE_KEY,
    });
  }
}
```

**Token Storage (Mobile):**
```typescript
// Secure token storage using react-native-keychain
import * as Keychain from 'react-native-keychain';

export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Keychain.setGenericPassword(
    'auth_tokens',
    JSON.stringify({ accessToken, refreshToken }),
    {
      service: 'com.businessapp.auth',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }
  );
}

export async function getTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const credentials = await Keychain.getGenericPassword({ service: 'com.businessapp.auth' });
  if (credentials) {
    return JSON.parse(credentials.password);
  }
  return null;
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: 'com.businessapp.auth' });
}
```

### Session Management

```typescript
// Session security configuration
export const SESSION_CONFIG = {
  maxConcurrentSessions: 5,           // Max devices per user
  sessionTimeout: 30 * 24 * 60 * 60,  // 30 days
  inactivityTimeout: 15 * 60,         // 15 minutes
  refreshTokenRotation: true,          // New refresh token on each use
  bindToDevice: true,                  // Token bound to device
};
```

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

**Roles:**
```typescript
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  SALESMAN = 'salesman',
  VIEWER = 'viewer',
}

export const PERMISSIONS = {
  // Invoice permissions
  'invoice:create': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT, Role.SALESMAN],
  'invoice:read': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT, Role.SALESMAN, Role.VIEWER],
  'invoice:update': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT],
  'invoice:delete': [Role.OWNER, Role.ADMIN],
  'invoice:cancel': [Role.OWNER, Role.ADMIN],
  
  // Party permissions
  'party:create': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT, Role.SALESMAN],
  'party:read': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT, Role.SALESMAN, Role.VIEWER],
  'party:update': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT],
  'party:delete': [Role.OWNER, Role.ADMIN],
  
  // Inventory permissions
  'item:create': [Role.OWNER, Role.ADMIN],
  'item:read': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT, Role.SALESMAN, Role.VIEWER],
  'item:update': [Role.OWNER, Role.ADMIN],
  'item:delete': [Role.OWNER, Role.ADMIN],
  'stock:adjust': [Role.OWNER, Role.ADMIN],
  
  // Report permissions
  'report:read': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT],
  'report:gst': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT],
  'report:export': [Role.OWNER, Role.ADMIN, Role.ACCOUNTANT],
  
  // Settings permissions
  'settings:read': [Role.OWNER, Role.ADMIN],
  'settings:update': [Role.OWNER, Role.ADMIN],
  'user:manage': [Role.OWNER, Role.ADMIN],
};
```

**Authorization Guard:**
```typescript
// auth/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS } from '../constants/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Check if user's role has the required permission
    const allowedRoles = PERMISSIONS[requiredPermission];
    return allowedRoles.includes(user.role);
  }
}
```

### Data Isolation (Multi-tenancy)

```typescript
// Ensure business data isolation
@Injectable()
export class BusinessIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const businessId = request.params.businessId || request.body.businessId;
    
    // Verify user belongs to the business
    return user.businesses.includes(businessId);
  }
}

// Apply to all business-scoped routes
@UseGuards(AuthGuard, BusinessIsolationGuard)
@Controller('businesses/:businessId/invoices')
export class InvoicesController {
  // All methods automatically scoped to business
}
```

---

## Data Protection

### Encryption at Rest

**Database Encryption:**
```sql
-- PostgreSQL Transparent Data Encryption (TDE)
-- Enable in RDS settings

-- Encrypt sensitive columns
ALTER TABLE users 
ALTER COLUMN phone SET DATA TYPE bytea USING pgp_sym_encrypt(phone::text, 'encryption_key');
```

**Application-Level Encryption:**
```typescript
// Encrypt sensitive data before storage
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

export function encryptData(plaintext: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
}

export function decryptData(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Encryption in Transit

**TLS Configuration:**
```typescript
// NestJS HTTPS configuration
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/private-key.pem'),
    cert: fs.readFileSync('./secrets/certificate.pem'),
  };
  
  const app = await NestFactory.create(AppModule, { httpsOptions });
  
  // Force HTTPS
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
  
  await app.listen(3000);
}
```

### Local Database Encryption (Mobile)

```typescript
// WatermelonDB with SQLCipher encryption
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'business_app',
  // Enable encryption
  jsi: true,
  onSetUpError: error => {
    console.error('Database setup error:', error);
  },
});

// SQLCipher key derivation
const dbKey = await deriveKeyFromBiometrics();
```

### PII Data Handling

**Data Masking in Logs:**
```typescript
// Mask PII in logs
export function maskPII(data: any): any {
  const piiFields = ['phone', 'email', 'pan', 'gstin', 'bankAccount'];
  
  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };
    for (const field of piiFields) {
      if (masked[field]) {
        masked[field] = maskString(masked[field]);
      }
    }
    return masked;
  }
  return data;
}

function maskString(str: string): string {
  if (str.length <= 4) return '****';
  return str.substring(0, 2) + '****' + str.substring(str.length - 2);
}

// Usage in logging
logger.info('User logged in', { user: maskPII(user) });
```

---

## API Security

### Input Validation

**Using class-validator:**
```typescript
// dto/create-invoice.dto.ts
import { IsString, IsNumber, IsArray, ValidateNested, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsString()
  @Matches(/^[a-f0-9-]{36}$/, { message: 'Invalid party ID format' })
  partyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;
}

export class InvoiceItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @Max(28)
  taxRate: number;
}
```

**GSTIN Validation:**
```typescript
// validators/gstin.validator.ts
export function validateGSTIN(gstin: string): boolean {
  // GSTIN format: 2 digits state code + 10 char PAN + 1 entity code + 1 Z + 1 checksum
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(gstin)) {
    return false;
  }
  
  // Validate checksum
  return validateGSTINChecksum(gstin);
}

function validateGSTINChecksum(gstin: string): boolean {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;
  
  for (let i = 0; i < 14; i++) {
    const charIndex = chars.indexOf(gstin[i]);
    const factor = (i % 2 === 0) ? 1 : 2;
    const product = charIndex * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  
  const checkDigit = (36 - (sum % 36)) % 36;
  return chars[checkDigit] === gstin[14];
}
```

### SQL Injection Prevention

**Using Parameterized Queries:**
```typescript
// Always use parameterized queries with Prisma
// CORRECT
const invoices = await prisma.invoice.findMany({
  where: {
    businessId: businessId,
    invoiceNumber: { contains: searchTerm },
  },
});

// NEVER do this
// const invoices = await prisma.$queryRaw`SELECT * FROM invoices WHERE business_id = '${businessId}'`;
```

### Rate Limiting

```typescript
// rate-limiting.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 3,    // 3 requests
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requests
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000,  // 1000 requests
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitingModule {}

// Custom rate limits for specific endpoints
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Post('auth/send-otp')
async sendOtp(@Body() dto: SendOtpDto) {
  // Limited to 3 requests per minute
}
```

### CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://business-app.com',
    'https://admin.business-app.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
```

---

## Mobile App Security

### Certificate Pinning

```typescript
// network/ssl-pinning.ts
import axios from 'axios';
import { SSLPinning } from 'react-native-ssl-pinning';

export const api = axios.create({
  baseURL: 'https://api.business-app.com',
});

// Pin SSL certificates
export async function secureFetch(url: string, options: any) {
  return SSLPinning.fetch(url, {
    ...options,
    sslPinning: {
      certs: ['sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='], // Certificate hash
    },
  });
}
```

### Root/Jailbreak Detection

```typescript
// security/device-check.ts
import JailMonkey from 'jail-monkey';

export function isDeviceSecure(): boolean {
  const checks = {
    isJailBroken: JailMonkey.isJailBroken(),
    isOnExternalStorage: JailMonkey.isOnExternalStorage(),
    isDebuggedMode: JailMonkey.isDebuggedMode(),
    canMockLocation: JailMonkey.canMockLocation(),
  };
  
  // Allow app to run but disable sensitive features
  if (checks.isJailBroken || checks.isDebuggedMode) {
    console.warn('Device security compromised', checks);
    return false;
  }
  
  return true;
}
```

### Secure Data Storage

```typescript
// storage/secure-storage.ts
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

// For authentication tokens
export async function storeAuthToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('auth', token, {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  });
}

// For other sensitive data
export async function storeSecureData(key: string, value: string): Promise<void> {
  await EncryptedStorage.setItem(key, value);
}

// Never use AsyncStorage for sensitive data
// ❌ AsyncStorage.setItem('token', accessToken);
```

### Prevent Screenshot/Screen Recording

```typescript
// iOS: In AppDelegate.m
- (void)applicationWillResignActive:(UIApplication *)application {
  // Add blur view when app goes to background
  UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
  UIVisualEffectView *blurView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
  blurView.frame = self.window.bounds;
  blurView.tag = 999;
  [self.window addSubview:blurView];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  // Remove blur view
  UIView *blurView = [self.window viewWithTag:999];
  [blurView removeFromSuperview];
}
```

---

## Infrastructure Security

### Secrets Management

**AWS Secrets Manager:**
```typescript
// secrets/secrets.service.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'ap-south-1' });

export async function getSecret(secretId: string): Promise<Record<string, string>> {
  const command = new GetSecretValueCommand({ SecretId: secretId });
  const response = await client.send(command);
  return JSON.parse(response.SecretString);
}

// Load secrets on startup
export async function loadSecrets(): Promise<void> {
  const dbSecrets = await getSecret('business-app/database');
  const jwtSecrets = await getSecret('business-app/jwt');
  
  process.env.DB_PASSWORD = dbSecrets.password;
  process.env.JWT_SECRET = jwtSecrets.secret;
}
```

### Network Security

```yaml
# Kubernetes Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: business-app
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              tier: backend
      ports:
        - protocol: TCP
          port: 3001
        - protocol: TCP
          port: 3002
    - to:
        - namespaceSelector:
            matchLabels:
              name: database
      ports:
        - protocol: TCP
          port: 5432
```

---

## Secure Development Practices

### Code Review Security Checklist

**Authentication & Authorization:**
- [ ] Authentication required for all non-public endpoints
- [ ] Authorization checks on all data access
- [ ] No hardcoded credentials
- [ ] Secrets loaded from environment/secrets manager

**Input Validation:**
- [ ] All user inputs validated
- [ ] Parameterized queries used
- [ ] File uploads validated and sandboxed
- [ ] Output encoding for XSS prevention

**Data Protection:**
- [ ] PII masked in logs
- [ ] Sensitive data encrypted
- [ ] No sensitive data in error messages
- [ ] Secure random number generation

**Session Management:**
- [ ] Session tokens regenerated after login
- [ ] Proper session expiration
- [ ] Secure cookie attributes set

### Dependency Security

```bash
# Regular dependency audits
npm audit

# Auto-fix vulnerabilities
npm audit fix

# Snyk integration
snyk test
snyk monitor
```

**CI/CD Security Scanning:**
```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
      
      - name: Run SonarQube
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## Security Monitoring

### Audit Logging

```typescript
// audit/audit.service.ts
export interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  businessId: string;
}

@Injectable()
export class AuditService {
  async log(entry: AuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        ...entry,
        oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
        newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
      },
    });
  }
}

// Audit decorator
export function Audited(action: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      await this.auditService.log({
        timestamp: new Date(),
        userId: this.request.user.id,
        action,
        resource: target.constructor.name,
        resourceId: result.id,
        ipAddress: this.request.ip,
        userAgent: this.request.headers['user-agent'],
        businessId: this.request.user.businessId,
      });
      
      return result;
    };
    
    return descriptor;
  };
}
```

### Security Alerts

```yaml
# Prometheus alerting rules
groups:
  - name: security-alerts
    rules:
      - alert: HighFailedLoginRate
        expr: rate(auth_failed_attempts_total[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High failed login rate detected"
          
      - alert: SuspiciousActivity
        expr: rate(api_requests_total{status="403"}[5m]) > 50
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Suspicious activity - high 403 rate"
          
      - alert: PossibleBruteForce
        expr: rate(auth_otp_attempts_total[1m]) > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Possible brute force attack detected"
```

---

## Incident Response

### Incident Response Plan

**Severity Levels:**

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P1 - Critical | Data breach, system down | 15 minutes | Unauthorized access, data leak |
| P2 - High | Potential breach, degraded | 1 hour | Vulnerability discovered |
| P3 - Medium | Security concern | 4 hours | Suspicious activity |
| P4 - Low | Security improvement | 24 hours | Minor configuration issue |

**Response Steps:**

1. **Detection & Triage**
   - Identify the incident
   - Assess severity
   - Alert incident response team

2. **Containment**
   - Isolate affected systems
   - Block malicious IPs
   - Revoke compromised credentials

3. **Investigation**
   - Collect logs and evidence
   - Determine root cause
   - Identify affected data/users

4. **Recovery**
   - Restore from backups if needed
   - Patch vulnerabilities
   - Reset credentials

5. **Post-Incident**
   - Document incident
   - Conduct retrospective
   - Update security measures

---

## Compliance Requirements

### DPDP Act (India Data Protection)

**Requirements:**
- [ ] Obtain consent before processing personal data
- [ ] Provide privacy notice in clear language
- [ ] Allow data access and correction requests
- [ ] Implement data retention limits
- [ ] Report breaches within 72 hours
- [ ] Appoint Data Protection Officer (if required)

### GST Compliance

**Data Requirements:**
- [ ] Invoice data retained for 8 years
- [ ] Audit trail for all GST transactions
- [ ] E-invoice authenticity verification
- [ ] HSN/SAC code validation

---

## Security Checklist

### Pre-Development

- [ ] Security requirements documented
- [ ] Threat modeling completed
- [ ] Security architecture reviewed
- [ ] Security training completed

### During Development

- [ ] Input validation implemented
- [ ] Authentication/authorization implemented
- [ ] Encryption implemented
- [ ] Logging implemented
- [ ] Error handling secure
- [ ] Dependencies audited

### Pre-Release

- [ ] Security testing completed
- [ ] Penetration testing completed
- [ ] Vulnerability scan clean
- [ ] Code review completed
- [ ] Security documentation updated

### Post-Release

- [ ] Monitoring active
- [ ] Incident response ready
- [ ] Regular security audits scheduled
- [ ] Dependency updates monitored

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025-12-21  
**Next Review:** Quarterly
