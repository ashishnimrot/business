# Code Verification Guide

Quick guide to verify your code before building/deploying.

## Available Tools

### Web-App (Next.js)

#### 1. TypeScript Type Check
```bash
cd web-app
npm run type-check
# OR
bash scripts/verify-types.sh
```

#### 2. ESLint
```bash
cd web-app
npm run lint
# Fix auto-fixable issues:
npm run lint:fix
```

#### 3. Comprehensive Verification
```bash
cd web-app
npm run verify
# OR
bash scripts/verify-all.sh
```

### Backend Services (NestJS)

#### 1. Lint All Services
```bash
cd app
npm run lint:all
```

#### 2. Type Check All Services
```bash
cd app
bash scripts/verify-types.sh
```

#### 3. Comprehensive Verification
```bash
cd app
bash scripts/verify-all.sh
# OR
make verify-all
```

## Quick Commands

### From Project Root

**Verify web-app:**
```bash
cd web-app && npm run verify
```

**Verify backend:**
```bash
cd app && make verify-all
```

**Verify everything:**
```bash
cd web-app && npm run verify && cd ../app && make verify-all
```

## What Gets Checked

### Web-App Verification (`verify-all.sh`)
1. ✅ TypeScript type checking (`tsc --noEmit`)
2. ✅ ESLint (`npm run lint`)
3. ✅ JSX namespace issues
4. ✅ Missing exports (ButtonProps, use-toast)
5. ✅ Import/export consistency

### Backend Verification (`verify-all.sh`)
1. ✅ ESLint for all services (`npm run lint:all`)
2. ✅ TypeScript type checking for each service
3. ✅ Code format check (`npm run format:check`)

## Before Building

**Always run verification before building:**

```bash
# Web-app
cd web-app
npm run verify
npm run build

# Backend
cd app
make verify-all
make build
```

## Common Issues Fixed

The verification scripts check for:
- ✅ TypeScript type errors
- ✅ Missing exports
- ✅ JSX namespace issues
- ✅ ESLint errors
- ✅ Import/export mismatches
- ✅ Code formatting issues

## Integration with CI/CD

These scripts can be used in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Verify web-app
  run: cd web-app && npm run verify

- name: Verify backend
  run: cd app && make verify-all
```

