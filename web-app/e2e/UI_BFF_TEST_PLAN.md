# UI + BFF Unified Test Plan - Complete Coverage

## Overview

This document provides a comprehensive test plan for testing the entire application through UI interactions while verifying all Backend-for-Frontend (BFF) API calls. All tests use **real authentication** (no mocks) - actual login flow with phone number and OTP verification.

## ⚠️ Critical Request/Response Alignment Issues Found

**Before running tests, please fix these critical mismatches:**

1. **Payment Query Parameters** (2 files):
   - `web-app/app/parties/[id]/page.tsx`: Change `party_id` → `partyId`
   - `web-app/app/invoices/[id]/page.tsx`: Change `invoice_id` → `invoiceId`

2. **Party Credit Days Field** (1 file):
   - `web-app/app/parties/page.tsx`: Change `credit_days` → `credit_period_days` (4 locations)

See **"Code Fixes Required"** section below for detailed fix instructions.

## 🎯 Production Deployment Gate

**⚠️ CRITICAL: This test plan serves as a PRODUCTION GATE. All tests MUST pass before deployment.**

### Quick Production Readiness Check
1. ✅ Fix critical code issues (2 files)
2. ✅ Run all 22 test files (~330 test cases)
3. ✅ Verify 100% API endpoint coverage (34 endpoints)
4. ✅ Verify 100% UI page coverage (27 pages)
5. ✅ Verify 100% component coverage (33 components)
6. ✅ Complete 15-phase production readiness checklist
7. ✅ Review test execution summary report
8. ✅ Approve for production deployment

**See "🚀 Production Readiness Gate" section for complete checklist.**

## Test Execution

### Single Command to Run All Tests
```bash
npm run test:headed -- ui-bff-tests/
```

### Pre-Production Test Execution (MANDATORY)
```bash
# 1. Fix critical issues first (see "Code Fixes Required" section)
# 2. Start all backend services
cd app && docker-compose up -d

# 3. Run all tests with HTML report
cd ../web-app
npm run test:headed -- ui-bff-tests/ --reporter=html

# 4. Review test report
open playwright-report/index.html

# 5. Verify all tests pass before production deployment
```

### Test Execution Checklist
- [ ] All backend services running and healthy
- [ ] Database seeded with test data
- [ ] All 22 test files executed
- [ ] All ~330 test cases passed
- [ ] HTML report generated and reviewed
- [ ] No critical issues found
- [ ] Performance benchmarks met
- [ ] Security checks passed

### Run Specific Module
```bash
npm run test:headed -- ui-bff-tests/05-invoices.spec.ts
```

### Run with Filter
```bash
npm run test:headed -- ui-bff-tests/ -g "CREATE"
npm run test:headed -- ui-bff-tests/ -g "BFF"
```

## Test Structure

```
web-app/e2e/ui-bff-tests/
├── 01-authentication.spec.ts      # Auth UI + BFF APIs
├── 02-business.spec.ts            # Business UI + BFF APIs
├── 03-parties.spec.ts             # Party UI + BFF APIs
├── 04-inventory.spec.ts           # Inventory UI + BFF APIs
├── 05-invoices.spec.ts            # Invoice UI + BFF APIs
├── 06-payments.spec.ts            # Payment UI + BFF APIs
├── 07-dashboard.spec.ts           # Dashboard UI + BFF APIs
├── 08-cross-module.spec.ts        # Cross-module integration
├── 09-business-logic.spec.ts      # Business logic verification
├── 10-reports.spec.ts             # Reports UI + BFF APIs
├── 11-settings.spec.ts            # Settings UI + BFF APIs
├── 12-navigation.spec.ts          # Navigation & UI tests
├── 13-edge-cases.spec.ts          # Edge cases & error handling
├── 14-export-pdf.spec.ts          # Export & PDF functionality
├── 15-pagination.spec.ts         # Pagination tests
├── 16-profile.spec.ts             # Profile page tests
├── 17-ui-components.spec.ts       # UI component tests (Sidebar, BottomNav, CommandMenu, etc.)
├── 18-dedicated-pages.spec.ts     # Dedicated page tests (Stock, New/Edit pages, Detail pages)
├── 19-page-features.spec.ts       # Page-specific features (Module cards, Phone calls, Print, etc.)
├── 20-home-redirect.spec.ts       # Home page redirect logic
├── 21-test-input-page.spec.ts     # Test input page (optional)
├── 22-request-response-alignment.spec.ts  # Request/Response alignment verification
└── 23-ui-text-formats-messages.spec.ts    # UI Text, Formats, Toast Messages, Labels (100% coverage)
```

## Authentication Approach

**Real Authentication (No Mocks):**
- Use actual phone number: `9876543210`
- Send real OTP via `POST /api/v1/auth/send-otp`
- Extract OTP from toast message or use known OTP: `129012`
- Verify OTP via `POST /api/v1/auth/verify-otp`
- Store tokens in localStorage
- Use tokens for all subsequent API calls

**Authentication Flow:**
1. Navigate to `/login`
2. Fill phone number input
3. Click "Send OTP" button
4. Wait for OTP toast message
5. Extract OTP from toast or use default
6. Fill OTP input
7. Click "Verify" button
8. Wait for redirect to dashboard
9. If redirected to `/business/select`, select/create business
10. Verify authentication tokens stored
11. Use tokens for all API calls

---

## Test Plan by Module

### 01-authentication.spec.ts

#### Test 1.1: Login Flow - Complete UI + BFF Verification
**Steps:**
1. Navigate to `/login` page
2. Verify login page loads correctly
3. Fill phone number field with `9876543210`
4. Click "Send OTP" button
5. **Verify BFF API Call:** `POST /api/v1/auth/send-otp` is called
6. **Verify Request Body:** Contains `phone: "9876543210"`
7. **Verify Response:** Status 200, contains `otp_id`, `expires_in`, `is_new_user`
8. **Verify UI:** Toast message displayed with OTP or success message
9. Extract OTP from toast message (if displayed) or use `129012`
10. Fill OTP input field with extracted OTP
11. Click "Verify" or "Submit" button
12. **Verify BFF API Call:** `POST /api/v1/auth/verify-otp` is called
13. **Verify Request Body:** Contains `phone`, `otp`, `otp_id`
14. **Verify Response:** Status 200, contains `user` object, `tokens` object with `access_token` and `refresh_token`
15. **Verify UI:** Redirected to `/dashboard` or `/business/select`
16. If redirected to `/business/select`, select existing business or create new
17. **Verify UI:** Finally lands on `/dashboard`
18. **Verify Storage:** `access_token` and `refresh_token` stored in localStorage

#### Test 1.2: Login - Invalid Phone Format (Validation Error)
**Steps:**
1. Navigate to `/login`
2. Fill phone number with `987654321` (9 digits - invalid, must be 10 digits)
3. Click "Send OTP" button
4. **Verify BFF API Call:** `POST /api/v1/auth/send-otp` is called
5. **Verify Request Body:** Contains invalid phone format
6. **Verify Response:** Status 400, contains error message about phone format
7. **Verify Response Structure:** Error indicates phone must be 10 digits and match pattern `^[6-9][0-9]{9}$`
8. **Verify UI:** Error toast displayed with validation error
9. **Verify UI:** Phone input shows error state

#### Test 1.2a: Login - Missing Phone (Mandatory Field)
**Steps:**
1. Navigate to `/login`
2. Leave phone number field empty
3. Click "Send OTP" button
4. **Verify BFF API Call:** `POST /api/v1/auth/send-otp` is called
5. **Verify Request Body:** Missing `phone` field (mandatory)
6. **Verify Response:** Status 400, validation error for `phone`
7. **Verify UI:** Error message displayed

#### Test 1.2b: Login - Missing Purpose (Mandatory Field)
**Steps:**
1. Navigate to `/login`
2. Fill phone number: `9876543210`
3. If purpose field exists, leave it empty
4. Click "Send OTP" button
5. **Verify BFF API Call:** `POST /api/v1/auth/send-otp` is called
6. **Verify Request Body:** Missing `purpose` field (mandatory)
7. **Verify Response:** Status 400, validation error for `purpose`
8. **Verify UI:** Error message displayed

#### Test 1.2c: Login - With Optional Device Info
**Steps:**
1. Navigate to `/login`
2. Fill phone number: `9876543210`
3. Send OTP successfully
4. Fill OTP: `129012`
5. If device_info can be provided, include it in verify request
6. Click "Verify" button
7. **Verify BFF API Call:** `POST /api/v1/auth/verify-otp` is called
8. **Verify Request Body:** Contains `phone`, `otp`, `otp_id`, and optionally `device_info`
9. **Verify Response:** Status 200, authentication successful
10. **Verify UI:** Redirected to dashboard

#### Test 1.3: Login - Invalid OTP
**Steps:**
1. Navigate to `/login`
2. Send OTP successfully (follow Test 1.1 steps 1-8)
3. Fill OTP input with wrong OTP: `000000`
4. Click "Verify" button
5. **Verify BFF API Call:** `POST /api/v1/auth/verify-otp` is called
6. **Verify Request Body:** Contains `phone`, `otp: "000000"`, `otp_id`
7. **Verify Response:** Status 400, contains error message about invalid OTP
8. **Verify UI:** Error toast displayed
9. **Verify UI:** User remains on login page

#### Test 1.3a: Login - Missing OTP (Mandatory Field)
**Steps:**
1. Navigate to `/login`
2. Send OTP successfully
3. Leave OTP field empty
4. Click "Verify" button
5. **Verify BFF API Call:** `POST /api/v1/auth/verify-otp` is called
6. **Verify Request Body:** Missing `otp` field (mandatory)
7. **Verify Response:** Status 400, validation error for `otp`
8. **Verify UI:** Error message displayed

#### Test 1.3b: Login - Missing OTP ID (Mandatory Field)
**Steps:**
1. Navigate to `/login`
2. Send OTP successfully
3. Fill OTP but if OTP ID is required, ensure it's included
4. Click "Verify" button
5. **Verify BFF API Call:** `POST /api/v1/auth/verify-otp` is called
6. **Verify Request Body:** Contains `otp_id` from send-otp response (mandatory)
7. **Verify Response:** Status 200 or 400 depending on OTP validity
8. **Verify UI:** Appropriate response displayed

#### Test 1.4: Login - Expired OTP
**Steps:**
1. Navigate to `/login`
2. Send OTP successfully
3. Wait for OTP expiry (6 minutes) or simulate expired OTP
4. Fill OTP input with expired OTP
5. Click "Verify" button
6. **Verify BFF API Call:** `POST /api/v1/auth/verify-otp` is called
7. **Verify Response:** Status 400, error message indicates OTP expired
8. **Verify UI:** Error toast displayed
9. **Verify UI:** Option to resend OTP available

#### Test 1.5: Token Refresh - Automatic Refresh
**Steps:**
1. Login successfully
2. Perform any authenticated operation (e.g., navigate to `/parties`)
3. Simulate token expiry or wait for actual expiry
4. Perform another operation (e.g., create party)
5. **Verify BFF API Call:** `POST /api/v1/auth/refresh-token` is called automatically
6. **Verify Request Body:** Contains `refresh_token` from storage
7. **Verify Response:** Status 200, contains new `access_token` and `refresh_token`
8. **Verify Storage:** New tokens stored in localStorage
9. **Verify UI:** Operation completes successfully without re-login

#### Test 1.6: View Active Sessions - UI + BFF
**Steps:**
1. Login successfully
2. Navigate to settings or profile page
3. Click "Active Sessions" or "Sessions" section
4. **Verify BFF API Call:** `GET /api/v1/auth/sessions` is called
5. **Verify Request Headers:** Contains authentication token
6. **Verify Response:** Status 200, returns array of session objects
7. **Verify Response Structure:** Each session has:
   - `id`
   - `device_id`, `device_name`, `device_os`
   - `ip_address`
   - `is_active`
   - `last_active_at`
   - `created_at`
8. **Verify UI:** All active sessions displayed
9. **Verify UI:** Current session highlighted or marked

#### Test 1.7: Logout Specific Session - UI + BFF
**Steps:**
1. View active sessions (follow Test 1.6)
2. Identify a session (not current session)
3. Click "Logout" or "Revoke" button for that session
4. **Verify BFF API Call:** `DELETE /api/v1/auth/sessions/:id` is called
5. **Verify Request:** URL contains session ID
6. **Verify Response:** Status 204 (No Content)
7. **Verify UI:** Success toast displayed
8. **Verify BFF API Call:** `GET /api/v1/auth/sessions` called again (refresh)
9. **Verify UI:** Logged out session removed from list

#### Test 1.8: Logout All Sessions - UI + BFF
**Steps:**
1. View active sessions (follow Test 1.6)
2. Click "Logout All Sessions" or "Logout All Other Sessions" button
3. **Verify UI:** Confirmation dialog appears
4. Click "Confirm" in dialog
5. **Verify BFF API Call:** `DELETE /api/v1/auth/sessions/all` is called
6. **Verify Response:** Status 204 (No Content)
7. **Verify UI:** Success toast displayed
8. **Verify BFF API Call:** `GET /api/v1/auth/sessions` called again (refresh)
9. **Verify UI:** Only current session remains (or all sessions logged out)
10. **Verify UI:** If all sessions logged out, redirected to login page

---

### 02-business.spec.ts

#### Test 2.1: Business Selection - UI + BFF
**Steps:**
1. Login successfully
2. Navigate to `/business/select` (if redirected after login)
3. **Verify BFF API Call:** `GET /api/v1/businesses` is called
4. **Verify Response:** Status 200, returns array of business objects
5. **Verify Response Structure:** Each business has `id`, `name`, `type`, `gstin`, etc.
6. **Verify UI:** Business cards displayed with business names
7. **Verify UI:** Each card shows business name, type, GSTIN
8. Click on a business card
9. **Verify UI:** Redirected to `/dashboard`
10. **Verify Storage:** `business_id` stored in localStorage

#### Test 2.2: Business Creation - UI + BFF
**Steps:**
1. Login successfully
2. Navigate to `/business/select`
3. Click "Create Business" or "Add Business" button
4. Fill business form:
   - Name: `Test Business Pvt Ltd`
   - Type: Select from dropdown (e.g., "retailer")
   - GSTIN: `27AABCU9603R1ZM`
   - PAN: `AABCU9603R`
   - Phone: `9876543210`
   - Email: `test@business.com`
   - Address Line 1: `123 Business Street`
   - City: `Mumbai`
   - State: `Maharashtra`
   - Pincode: `400001`
5. Click "Submit" or "Create" button
6. **Verify BFF API Call:** `POST /api/v1/businesses` is called
7. **Verify Request Body:** Contains all filled fields
8. **Verify Response:** Status 201, returns business object with `id`
9. **Verify Response Structure:** Business has `id`, `name`, `type`, `gstin`, `created_at`
10. **Verify UI:** Success toast displayed
11. **Verify UI:** Redirected to `/dashboard`
12. **Verify BFF API Call:** `GET /api/v1/businesses` called again (refresh list)
13. **Verify Storage:** `business_id` stored in localStorage

#### Test 2.3: Business Creation - Validation Error (Missing Name - Mandatory Field)
**Steps:**
1. Navigate to `/business/select`
2. Click "Create Business"
3. Fill form without name field (leave name empty)
4. Fill other optional fields (GSTIN, PAN, address, etc.)
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/businesses` is called
7. **Verify Request Body:** Missing `name` field (mandatory)
8. **Verify Response:** Status 400, contains validation error
9. **Verify Response Structure:** Error object contains field name and error message
10. **Verify UI:** Error message displayed near name field
11. **Verify UI:** Form not submitted, user remains on form

#### Test 2.3a: Business Creation - With Only Mandatory Fields (All Optional Omitted)
**Steps:**
1. Navigate to `/business/select`
2. Click "Create Business"
3. Fill only mandatory field:
   - Name: `Minimal Business ${timestamp}`
4. Don't fill any optional fields (type, GSTIN, PAN, phone, email, address, etc.)
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/businesses` is called
7. **Verify Request Body:** Contains only `name` field
8. **Verify Response:** Status 201, business created successfully
9. **Verify Response Structure:** Business has `id`, `name`, but optional fields may be null/undefined
10. **Verify UI:** Success toast displayed
11. **Verify UI:** Business appears in list

#### Test 2.3b: Business Creation - With All Optional Fields
**Steps:**
1. Navigate to `/business/select`
2. Click "Create Business"
3. Fill mandatory field: Name
4. Fill all optional fields:
   - Type: `retailer`
   - GSTIN: `27AABCU9603R1ZM`
   - PAN: `AABCU9603R`
   - Phone: `9876543210`
   - Email: `business@example.com`
   - Address Line 1: `123 Business Street`
   - Address Line 2: `Near Market`
   - City: `Mumbai`
   - State: `Maharashtra`
   - Pincode: `400001`
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/businesses` is called
7. **Verify Request Body:** Contains all fields (mandatory + optional)
8. **Verify Response:** Status 201, business created with all fields
9. **Verify Response Structure:** All provided fields present in response
10. **Verify UI:** Success toast displayed

#### Test 2.4: Business Creation - Duplicate GSTIN
**Steps:**
1. Create business with GSTIN `27AABCU9603R1ZM` (follow Test 2.2)
2. Navigate to `/business/select` again
3. Click "Create Business"
4. Fill form with same GSTIN `27AABCU9603R1ZM`
5. Fill other fields with different values
6. Click "Submit"
7. **Verify BFF API Call:** `POST /api/v1/businesses` is called
8. **Verify Response:** Status 409, error message indicates duplicate GSTIN
9. **Verify UI:** Error toast displayed with duplicate GSTIN message

#### Test 2.5: Business Update - UI + BFF
**Steps:**
1. Navigate to business settings page (if exists) or `/business/:id/edit`
2. **Verify BFF API Call:** `GET /api/v1/businesses/:id` is called (to pre-fill form)
3. **Verify Response:** Status 200, returns business object
4. **Verify UI:** Form pre-filled with existing business data
5. Update business name field
6. Click "Save" or "Update" button
7. **Verify BFF API Call:** `PATCH /api/v1/businesses/:id` is called
8. **Verify Request Body:** Contains updated name field
9. **Verify Response:** Status 200, returns updated business object
10. **Verify Response:** `name` field matches updated value
11. **Verify Response:** `updated_at` timestamp changed
12. **Verify UI:** Success toast displayed
13. **Verify UI:** Updated name displayed on page

---

### 03-parties.spec.ts

#### Test 3.1: Create Party - Complete UI + BFF Flow
**Steps:**
1. Login successfully
2. Navigate to `/parties` page
3. **Verify BFF API Call:** `GET /api/v1/parties` is called
4. **Verify Response:** Status 200, returns array of parties
5. **Verify UI:** Parties list page loads
6. **Verify UI:** "Add Party" button visible
7. Click "Add Party" button
8. **Verify UI:** Dialog or form page opens
9. Fill party form:
   - Name: `Test Customer ${timestamp}`
   - Type: Select "Customer" from dropdown
   - Phone: `98${random 8 digits}`
   - Email: `test${timestamp}@example.com`
   - Billing Address Line 1: `123 Test Street`
   - Billing City: `Mumbai`
   - Billing State: `Maharashtra`
   - Billing Pincode: `400001`
   - GSTIN: `27AABCU9603R1ZM` (optional)
10. Click "Submit" or "Create" button
11. **Verify BFF API Call:** `POST /api/v1/parties` is called
12. **Verify Request Body:** Contains all filled fields, `type: "customer"`
13. **Verify Request Headers:** Contains `Authorization: Bearer <token>`, `x-business-id`
14. **Verify Response:** Status 201, returns party object
15. **Verify Response Structure:** Party has `id`, `name`, `type`, `phone`, `email`, `created_at`
16. **Verify UI:** Success toast displayed (e.g., "Party created successfully")
17. **Verify UI:** Dialog closes (if dialog) or redirected to list
18. **Verify BFF API Call:** `GET /api/v1/parties` called again (refresh list)
19. **Verify UI:** New party appears in parties list
20. **Verify UI:** Party card shows name, phone, type

#### Test 3.2: List Parties - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. **Verify BFF API Call:** `GET /api/v1/parties` is called
3. **Verify Request Headers:** Contains authentication token
4. **Verify Response:** Status 200, returns array
5. **Verify Response Structure:** Array contains party objects with all fields
6. **Verify UI:** Parties displayed in cards or table
7. **Verify UI:** Each party card shows: name, phone, email, type
8. **Verify UI:** Empty state shown if no parties exist

#### Test 3.3: Search Parties - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Locate search input field
3. Type search term: `"Test"`
4. Wait for debounce (if implemented) or press Enter
5. **Verify BFF API Call:** `GET /api/v1/parties?search=Test` is called
6. **Verify Request Query:** Contains `search=Test` parameter
7. **Verify Response:** Status 200, returns filtered array
8. **Verify Response:** All returned parties have "Test" in name, phone, or email
9. **Verify UI:** Only matching parties displayed
10. Clear search input
11. **Verify BFF API Call:** `GET /api/v1/parties` called again (without search param)
12. **Verify UI:** All parties displayed again

#### Test 3.4: Filter by Type - Customers Only
**Steps:**
1. Navigate to `/parties`
2. Click "Customers" tab or filter button
3. **Verify BFF API Call:** `GET /api/v1/parties?type=customer` is called
4. **Verify Request Query:** Contains `type=customer` parameter
5. **Verify Response:** Status 200, returns array
6. **Verify Response:** All parties have `type: "customer"`
7. **Verify UI:** Only customer cards displayed
8. Click "Suppliers" tab
9. **Verify BFF API Call:** `GET /api/v1/parties?type=supplier` is called
10. **Verify UI:** Only supplier cards displayed
11. Click "All" tab
12. **Verify BFF API Call:** `GET /api/v1/parties` called (without type filter)
13. **Verify UI:** All parties displayed

#### Test 3.5: View Party Detail - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click on a party card
3. **Verify UI:** Navigate to `/parties/:id` page
4. **Verify BFF API Call:** `GET /api/v1/parties/:id` is called
5. **Verify Request:** URL contains party ID
6. **Verify Response:** Status 200, returns single party object
7. **Verify Response Structure:** Party object contains all fields
8. **Verify UI:** Party name displayed as heading
9. **Verify UI:** All party details displayed: phone, email, address, GSTIN
10. **Verify UI:** Edit button visible
11. **Verify UI:** Delete button visible

#### Test 3.6: View Party Ledger - UI + BFF
**Steps:**
1. Navigate to `/parties/:id` (party detail page)
2. Click "View Ledger" button or navigate to ledger tab
3. **Verify UI:** Navigate to `/parties/:id/ledger` or ledger section visible
4. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` is called
5. **Verify Request:** URL contains party ID
6. **Verify Response:** Status 200, returns ledger object
7. **Verify Response Structure:** Contains `party_id`, `party_name`, `opening_balance`, `opening_balance_type`, `current_balance`, `entries` array
8. **Verify UI:** Opening balance displayed
9. **Verify UI:** Current balance displayed
10. **Verify UI:** Ledger entries listed (if any)
11. **Verify UI:** Each entry shows: date, type, description, debit, credit, balance

#### Test 3.7: View Party Ledger with Date Range
**Steps:**
1. Navigate to party ledger page
2. Select start date: `2024-01-01`
3. Select end date: `2024-12-31`
4. Click "Apply" or filter button
5. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger?startDate=2024-01-01&endDate=2024-12-31` is called
6. **Verify Request Query:** Contains date range parameters
7. **Verify Response:** Status 200, returns filtered ledger
8. **Verify Response:** Entries filtered by date range
9. **Verify UI:** Only entries within date range displayed

#### Test 3.8: Update Party - UI + BFF
**Steps:**
1. Navigate to `/parties/:id` (party detail page)
2. Click "Edit" button
3. **Verify UI:** Navigate to `/parties/:id/edit` or edit form opens
4. **Verify BFF API Call:** `GET /api/v1/parties/:id` is called (to pre-fill form)
5. **Verify Response:** Status 200, returns party object
6. **Verify UI:** Form pre-filled with existing party data
7. Update name field: Change to `Updated Party Name`
8. Update phone field: Change to new phone number
9. Click "Save" or "Update" button
10. **Verify BFF API Call:** `PATCH /api/v1/parties/:id` is called
11. **Verify Request Body:** Contains updated `name` and `phone` fields
12. **Verify Request Method:** PATCH (not PUT)
13. **Verify Response:** Status 200, returns updated party object
14. **Verify Response:** `name` matches updated value
15. **Verify Response:** `phone` matches updated value
16. **Verify Response:** `updated_at` timestamp changed
17. **Verify UI:** Success toast displayed
18. **Verify UI:** Redirected to party detail page or list
19. **Verify UI:** Updated name displayed
20. **Verify BFF API Call:** `GET /api/v1/parties/:id` called again (refresh)

#### Test 3.9: Delete Party - UI + BFF
**Steps:**
1. Navigate to `/parties` page
2. Locate party card
3. Click dropdown menu (three dots) on party card
4. Click "Delete" option
5. **Verify UI:** Confirmation dialog appears
6. **Verify UI:** Dialog shows party name and warning message
7. Click "Confirm" or "Delete" button in dialog
8. **Verify BFF API Call:** `DELETE /api/v1/parties/:id` is called
9. **Verify Request Method:** DELETE
10. **Verify Response:** Status 204 (No Content) or 200
11. **Verify UI:** Success toast displayed
12. **Verify UI:** Dialog closes
13. **Verify BFF API Call:** `GET /api/v1/parties` called again (refresh list)
14. **Verify UI:** Party removed from list
15. Navigate to `/parties/:id` (deleted party)
16. **Verify BFF API Call:** `GET /api/v1/parties/:id` is called
17. **Verify Response:** Status 404 (Not Found)

#### Test 3.10: Create Party - Validation Error (Missing Name - Mandatory Field)
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill form without name field (leave name empty)
4. Fill other fields: phone, email, address
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/parties` is called
7. **Verify Request Body:** Missing `name` field (mandatory)
8. **Verify Response:** Status 400, contains validation error
9. **Verify Response Structure:** Error object indicates `name` is required
10. **Verify UI:** Error message displayed near name field
11. **Verify UI:** Form not submitted, user remains on form

#### Test 3.10a: Create Party - Validation Error (Missing Type - Mandatory Field)
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill name field: `Test Customer`
4. Don't select type (leave type empty)
5. Fill other optional fields: phone, email
6. Click "Submit"
7. **Verify BFF API Call:** `POST /api/v1/parties` is called
8. **Verify Request Body:** Missing `type` field (mandatory)
9. **Verify Response:** Status 400, validation error for `type`
10. **Verify UI:** Error message displayed near type field

#### Test 3.10b: Create Party - With Only Mandatory Fields (All Optional Omitted)
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill only mandatory fields:
   - Name: `Minimal Party ${timestamp}`
   - Type: Select "Customer"
4. Don't fill any optional fields (phone, email, address, etc.)
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/parties` is called
7. **Verify Request Body:** Contains only `name` and `type` fields
8. **Verify Response:** Status 201, party created successfully
9. **Verify Response Structure:** Party has `id`, `name`, `type`, but optional fields may be null/undefined
10. **Verify UI:** Success toast displayed
11. **Verify UI:** Party appears in list

#### Test 3.10c: Create Party - With All Optional Fields
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill mandatory fields: Name, Type
4. Fill all optional fields:
   - Phone: `9876543210`
   - Email: `test@example.com`
   - GSTIN: `27AABCU9603R1ZM`
   - PAN: `AABCU9603R`
   - Billing Address: Line1, City, State, Pincode
   - Shipping Address: Line1, City, State, Pincode
   - Opening Balance: `1000`
   - Opening Balance Type: `credit`
   - Credit Limit: `50000`
   - Credit Period: `30`
   - Notes: `Test notes`
   - Tags: `["tag1", "tag2"]`
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/parties` is called
7. **Verify Request Body:** Contains all fields (mandatory + optional)
8. **Verify Response:** Status 201, party created with all fields
9. **Verify Response Structure:** All provided fields present in response
10. **Verify UI:** Success toast displayed

#### Test 3.11: Create Party - Validation Error (Invalid Phone)
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill phone field with `987654321` (9 digits - invalid)
4. Fill other required fields
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/parties` is called
7. **Verify Response:** Status 400, validation error for phone
8. **Verify UI:** Error message displayed near phone field

#### Test 3.12: Create Party - Duplicate Phone
**Steps:**
1. Create party with phone `9876543210` (follow Test 3.1)
2. Navigate to `/parties` again
3. Click "Add Party"
4. Fill form with same phone `9876543210`
5. Fill other fields with different values
6. Click "Submit"
7. **Verify BFF API Call:** `POST /api/v1/parties` is called
8. **Verify Response:** Status 409 or 400, error indicates duplicate phone
9. **Verify UI:** Error toast displayed with duplicate phone message

#### Test 3.13: Create Party - Duplicate Email
**Steps:**
1. Create party with email `test@example.com`
2. Try to create another party with same email
3. **Verify BFF API Call:** `POST /api/v1/parties` is called
4. **Verify Response:** Status 409 or 400, duplicate email error
5. **Verify UI:** Error toast displayed

#### Test 3.14: Create Party - Invalid GSTIN Format
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill GSTIN field with `INVALID-GSTIN`
4. Fill other required fields
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/parties` is called
7. **Verify Response:** Status 409 or 400, invalid GSTIN format error
8. **Verify UI:** Error message displayed

---

### 04-inventory.spec.ts

#### Test 4.1: Create Item - Complete UI + BFF Flow
**Steps:**
1. Navigate to `/inventory` page
2. **Verify BFF API Call:** `GET /api/v1/items` is called
3. **Verify Response:** Status 200, returns array of items
4. **Verify UI:** Inventory page loads
5. **Verify UI:** "Add Item" button visible
6. Click "Add Item" button
7. **Verify UI:** Dialog or form page opens
8. Fill item form:
   - Name: `Test Product ${timestamp}`
   - SKU: `SKU-${timestamp}`
   - HSN Code: `8471`
   - Description: `Test product description`
   - Selling Price: `1000`
   - Purchase Price: `750`
   - Tax Rate: `18`
   - Current Stock: `100`
   - Low Stock Threshold: `10`
   - Unit: Select "Pieces" or "pcs"
9. Click "Submit" or "Create" button
10. **Verify BFF API Call:** `POST /api/v1/items` is called
11. **Verify Request Body:** Contains all filled fields
12. **Verify Request Headers:** Contains authentication token
13. **Verify Response:** Status 201, returns item object
14. **Verify Response Structure:** Item has `id`, `name`, `sku`, `selling_price`, `current_stock`, `created_at`
15. **Verify UI:** Success toast displayed
16. **Verify UI:** Dialog closes or redirected to list
17. **Verify BFF API Call:** `GET /api/v1/items` called again (refresh)
18. **Verify UI:** New item appears in items list
19. **Verify UI:** Item card shows name, price, stock

#### Test 4.2: List Items - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. **Verify BFF API Call:** `GET /api/v1/items` is called
3. **Verify Response:** Status 200, returns array
4. **Verify UI:** Items displayed in cards or table
5. **Verify UI:** Each item shows: name, SKU, selling price, stock

#### Test 4.3: Search Items - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. Type in search box: `"Product"`
3. **Verify BFF API Call:** `GET /api/v1/items?search=Product` is called
4. **Verify Response:** Status 200, filtered results
5. **Verify UI:** Only matching items displayed
6. Search by SKU: `"SKU-"`
7. **Verify BFF API Call:** `GET /api/v1/items?search=SKU-` is called
8. **Verify UI:** Items with matching SKU displayed

#### Test 4.3a: Filter Items by Category - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. Select category from category filter dropdown
3. **Verify BFF API Call:** `GET /api/v1/items?categoryId=<categoryId>` is called
4. **Verify Request Query:** Contains `categoryId` parameter
5. **Verify Response:** Status 200, returns filtered items
6. **Verify Response:** All items have matching `category_id`
7. **Verify UI:** Only items from selected category displayed
8. Clear category filter
9. **Verify BFF API Call:** `GET /api/v1/items` called (without categoryId)
10. **Verify UI:** All items displayed

#### Test 4.4: Low Stock Filter - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. Create item with stock = 5, threshold = 10 (follow Test 4.1)
3. Click "Low Stock" filter or tab
4. **Verify BFF API Call:** `GET /api/v1/items/low-stock` is called
5. **Verify Response:** Status 200, returns array of low stock items
6. **Verify Response:** All items have `current_stock <= low_stock_threshold`
7. **Verify UI:** Only low stock items displayed
8. **Verify UI:** Low stock indicator shown (red badge, warning icon)

#### Test 4.5: View Item Detail - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. Click on an item card
3. **Verify UI:** Navigate to `/inventory/:id` page
4. **Verify BFF API Call:** `GET /api/v1/items/:id` is called
5. **Verify Response:** Status 200, returns single item object
6. **Verify UI:** Item name displayed as heading
7. **Verify UI:** All item details displayed: SKU, HSN, prices, stock
8. **Verify UI:** Edit button visible
9. **Verify UI:** Delete button visible
10. **Verify UI:** Stock adjustment button visible

#### Test 4.6: Stock Adjustment - Increase Stock - UI + BFF
**Steps:**
1. Navigate to `/inventory/:id` (item detail page)
2. Note current stock value (e.g., 100)
3. Click "Adjust Stock" button
4. **Verify UI:** Stock adjustment dialog/form opens
5. Fill adjustment form:
   - Adjustment: `+50` (positive for increase)
   - Reason: `Purchase from supplier`
6. Click "Submit" or "Apply" button
7. **Verify BFF API Call:** `POST /api/v1/stock/adjust` is called
8. **Verify Request Body:** Contains `item_id`, `adjustment: 50`, `reason`
9. **Verify Response:** Status 200, returns updated item and adjustment record
10. **Verify Response:** Item `current_stock` = 150 (100 + 50)
11. **Verify UI:** Success toast displayed
12. **Verify UI:** Stock updated on detail page (shows 150)
13. **Verify BFF API Call:** `GET /api/v1/items/:id` called again (refresh)

#### Test 4.7: Stock Adjustment - Decrease Stock - UI + BFF
**Steps:**
1. Navigate to item detail page
2. Note current stock (e.g., 150)
3. Click "Adjust Stock"
4. Fill adjustment: `-30` (negative for decrease)
5. Reason: `Damaged items`
6. Submit
7. **Verify BFF API Call:** `POST /api/v1/stock/adjust` is called
8. **Verify Request Body:** `adjustment: -30`
9. **Verify Response:** Item `current_stock` = 120 (150 - 30)
10. **Verify UI:** Stock updated to 120

#### Test 4.8: View Stock History - UI + BFF
**Steps:**
1. Navigate to item detail page
2. Make several stock adjustments (follow Tests 4.6 and 4.7)
3. Click "Stock History" tab or button
4. **Verify UI:** Stock history section visible
5. **Verify BFF API Call:** `GET /api/v1/stock/items/:itemId/history` is called
6. **Verify Response:** Status 200, returns array of adjustments
7. **Verify Response Structure:** Each adjustment has `id`, `item_id`, `adjustment`, `reason`, `created_at`
8. **Verify UI:** All adjustments listed
9. **Verify UI:** Each entry shows: date, adjustment amount, reason
10. **Verify UI:** Entries ordered by date (newest first)

#### Test 4.9: Update Item - UI + BFF
**Steps:**
1. Navigate to `/inventory/:id` (item detail page)
2. Click "Edit" button
3. **Verify UI:** Navigate to `/inventory/:id/edit` or edit form opens
4. **Verify BFF API Call:** `GET /api/v1/items/:id` is called (pre-fill)
5. **Verify UI:** Form pre-filled with existing item data
6. Update selling price: Change to `1200`
7. Update stock: Change to `150`
8. Click "Save" button
9. **Verify BFF API Call:** `PATCH /api/v1/items/:id` is called
10. **Verify Request Body:** Contains updated `selling_price` and `current_stock`
11. **Verify Response:** Status 200, returns updated item
12. **Verify Response:** `selling_price` = 1200
13. **Verify Response:** `current_stock` = 150
14. **Verify UI:** Success toast displayed
15. **Verify UI:** Updated values displayed on detail page

#### Test 4.10: Delete Item - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. Click dropdown menu on item card
3. Click "Delete" option
4. **Verify UI:** Confirmation dialog appears
5. Click "Confirm"
6. **Verify BFF API Call:** `DELETE /api/v1/items/:id` is called
7. **Verify Response:** Status 204
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Item removed from list
10. Navigate to `/inventory/:id` (deleted item)
11. **Verify BFF API Call:** `GET /api/v1/items/:id` is called
12. **Verify Response:** Status 404

#### Test 4.11: Create Item - Validation Error (Missing Name - Mandatory Field)
**Steps:**
1. Navigate to `/inventory`
2. Click "Add Item"
3. Fill form without name (leave name empty)
4. Fill other fields: selling_price, stock
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/items` is called
7. **Verify Request Body:** Missing `name` field (mandatory)
8. **Verify Response:** Status 400, validation error
9. **Verify UI:** Error message displayed near name field

#### Test 4.11a: Create Item - Validation Error (Missing Selling Price - Mandatory Field)
**Steps:**
1. Navigate to `/inventory`
2. Click "Add Item"
3. Fill name: `Test Product`
4. Leave selling_price empty
5. Fill other optional fields: stock, description
6. Click "Submit"
7. **Verify BFF API Call:** `POST /api/v1/items` is called
8. **Verify Request Body:** Missing `selling_price` field (mandatory)
9. **Verify Response:** Status 400, validation error for `selling_price`
10. **Verify UI:** Error message displayed near selling_price field

#### Test 4.11b: Create Item - With Only Mandatory Fields (All Optional Omitted)
**Steps:**
1. Navigate to `/inventory`
2. Click "Add Item"
3. Fill only mandatory fields:
   - Name: `Minimal Item ${timestamp}`
   - Selling Price: `100`
4. Don't fill any optional fields (category, SKU, HSN, description, stock, etc.)
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/items` is called
7. **Verify Request Body:** Contains only `name` and `selling_price`
8. **Verify Response:** Status 201, item created successfully
9. **Verify Response Structure:** Item has `id`, `name`, `selling_price`, but optional fields may be null/undefined
10. **Verify UI:** Success toast displayed
11. **Verify UI:** Item appears in list

#### Test 4.11c: Create Item - With All Optional Fields
**Steps:**
1. Navigate to `/inventory`
2. Click "Add Item"
3. Fill mandatory fields: Name, Selling Price
4. Fill all optional fields:
   - Category: Select category
   - Unit: Select unit
   - SKU: `SKU-001`
   - Barcode: `1234567890`
   - HSN Code: `8471`
   - SAC Code: `998314`
   - Description: `Test description`
   - Inventory Type: `finished_goods`
   - Purchase Price: `75`
   - MRP: `120`
   - Discount Percent: `10`
   - Tax Rate: `18`
   - CESS Rate: `0`
   - Tax Inclusive: `false`
   - Current Stock: `100`
   - Low Stock Threshold: `10`
   - Track Stock: `true`
   - Track Serial: `false`
   - Track Batch: `false`
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/items` is called
7. **Verify Request Body:** Contains all fields (mandatory + optional)
8. **Verify Response:** Status 201, item created with all fields
9. **Verify Response Structure:** All provided fields present in response
10. **Verify UI:** Success toast displayed

#### Test 4.12: Create Item - Validation Error (Negative Price)
**Steps:**
1. Fill selling_price with `-100`
2. Submit form
3. **Verify BFF API Call:** `POST /api/v1/items` is called
4. **Verify Response:** Status 400, validation error
5. **Verify UI:** Error message displayed

#### Test 4.13: Create Item - Validation Error (Negative Stock)
**Steps:**
1. Fill current_stock with `-10`
2. Submit form
3. **Verify BFF API Call:** `POST /api/v1/items` is called
4. **Verify Response:** Status 400, validation error
5. **Verify UI:** Error message displayed

---

### 05-invoices.spec.ts

#### Test 5.1: Create Sale Invoice - Complete UI + BFF Flow
**Steps:**
1. Ensure party and item exist (create if needed via UI)
2. Navigate to `/invoices/create` page
3. **Verify BFF API Call:** `GET /api/v1/parties` is called (for customer dropdown)
4. **Verify BFF API Call:** `GET /api/v1/items` is called (for item dropdown)
5. **Verify Response:** Both APIs return 200, arrays of parties and items
6. **Verify UI:** Invoice creation form loads
7. **Verify UI:** Party dropdown populated with parties
8. **Verify UI:** Item dropdown or item selection available
9. Select "Sale Invoice" type (if toggle exists)
10. Select customer from party dropdown
11. Fill invoice date: Today's date or select from date picker
12. Fill due date: 30 days from invoice date
13. Add item to invoice:
    - Select item from dropdown or enter item name
    - Fill quantity: `10`
    - Fill unit price: `1000`
    - Fill tax rate: `18` (or select from dropdown)
14. **Verify UI:** Item subtotal calculated: 10 × 1000 = ₹10,000
15. **Verify UI:** Tax calculated: 18% of ₹10,000 = ₹1,800
16. **Verify UI:** Item total displayed: ₹11,800
17. **Verify UI:** Invoice totals section shows:
    - Subtotal: ₹10,000
    - Tax: ₹1,800
    - Total: ₹11,800
18. Add notes (optional): `Thank you for your business`
19. Click "Create Invoice" or "Submit" button
20. **Verify BFF API Call:** `POST /api/v1/invoices` is called
21. **Verify Request Body:** Contains:
    - `party_id`: Selected party ID
    - `invoice_type`: `"sale"`
    - `invoice_date`: Date string
    - `due_date`: Date string
    - `items`: Array with item object containing `item_name`, `quantity`, `unit_price`, `tax_rate`
    - `is_interstate`: Boolean (based on party state)
22. **Verify Request Headers:** Contains authentication token, `x-business-id`
23. **Verify Response:** Status 201, returns invoice object
24. **Verify Response Structure:** Invoice has:
    - `id`
    - `invoice_number`: Format like "INV-2024-00001"
    - `invoice_type`: `"sale"`
    - `party_id`: Matches selected party
    - `subtotal`: ₹10,000
    - `taxable_amount`: ₹10,000
    - `cgst_amount`: Calculated (if intra-state)
    - `sgst_amount`: Calculated (if intra-state)
    - `igst_amount`: Calculated (if inter-state)
    - `total_amount`: ₹11,800
    - `status`: `"pending"`
    - `items`: Array with item details
25. **Verify UI:** Success toast displayed
26. **Verify UI:** Redirected to `/invoices` list or invoice detail page
27. **Verify BFF API Call:** `GET /api/v1/invoices` called again (refresh list)
28. **Verify UI:** New invoice appears in invoices list
29. **Verify UI:** Invoice card shows invoice number, party name, total amount

#### Test 5.2: Create Purchase Invoice - UI + BFF
**Steps:**
1. Navigate to `/invoices/create`
2. Select "Purchase Invoice" type
3. **Verify UI:** Form shows supplier-related labels
4. Select supplier from party dropdown
5. **Verify BFF API Call:** `GET /api/v1/parties?type=supplier` may be called
6. Add items and fill form (similar to Test 5.1)
7. Submit form
8. **Verify BFF API Call:** `POST /api/v1/invoices` is called
9. **Verify Request Body:** `invoice_type: "purchase"`
10. **Verify Response:** Status 201, `invoice_type: "purchase"`
11. **Verify UI:** Invoice created successfully

#### Test 5.3: Invoice with Multiple Items - UI + BFF
**Steps:**
1. Navigate to `/invoices/create`
2. Select customer and fill basic details
3. Add first item:
   - Item: `Product A`
   - Quantity: `5`
   - Price: `1000`
   - Tax: `18%`
   - **Verify UI:** Item subtotal = ₹5,000, Tax = ₹900, Total = ₹5,900
4. Click "Add Item" button
5. Add second item:
   - Item: `Product B`
   - Quantity: `10`
   - Price: `500`
   - Tax: `5%`
   - **Verify UI:** Item subtotal = ₹5,000, Tax = ₹250, Total = ₹5,250
6. Add third item:
   - Item: `Product C`
   - Quantity: `2`
   - Price: `200`
   - Tax: `0%`
   - **Verify UI:** Item subtotal = ₹400, Tax = ₹0, Total = ₹400
7. **Verify UI:** Invoice totals show:
   - Subtotal: ₹10,400 (5,000 + 5,000 + 400)
   - Total Tax: ₹1,150 (900 + 250 + 0)
   - Total: ₹11,550
8. Submit form
9. **Verify BFF API Call:** `POST /api/v1/invoices` is called
10. **Verify Request Body:** `items` array contains 3 items
11. **Verify Response:** Status 201
12. **Verify Response:** `subtotal` = ₹10,400
13. **Verify Response:** `total_amount` = ₹11,550
14. **Verify Response:** `items` array has 3 items
15. **Verify UI:** All items displayed in invoice

#### Test 5.4: Invoice with Discount - UI + BFF
**Steps:**
1. Navigate to `/invoices/create`
2. Select customer and fill details
3. Add item:
   - Quantity: `10`
   - Price: `100`
   - Discount: `10%`
   - Tax: `18%`
4. **Verify UI:** Calculations:
   - Subtotal: 10 × 100 = ₹1,000
   - Discount: 10% of ₹1,000 = ₹100
   - Taxable Amount: ₹1,000 - ₹100 = ₹900
   - Tax: 18% of ₹900 = ₹162
   - Total: ₹900 + ₹162 = ₹1,062
5. Submit form
6. **Verify BFF API Call:** `POST /api/v1/invoices` is called
7. **Verify Request Body:** Item contains `discount_percent: 10`
8. **Verify Response:** Status 201
9. **Verify Response:** `discount_amount` = ₹100
10. **Verify Response:** `taxable_amount` = ₹900
11. **Verify Response:** Tax calculated on ₹900, not ₹1,000
12. **Verify Response:** `total_amount` = ₹1,062

#### Test 5.5: Inter-state Invoice (IGST) - UI + BFF
**Steps:**
1. Create or select party from different state (e.g., business in Maharashtra, party in Delhi)
2. Navigate to `/invoices/create`
3. Select inter-state party
4. **Verify UI:** Form shows "Inter-state" indicator or IGST label
5. Add item with tax rate 18%
6. **Verify UI:** Tax breakdown shows:
   - IGST: 18% (not CGST+SGST)
   - CGST: Not shown or 0
   - SGST: Not shown or 0
7. Submit form
8. **Verify BFF API Call:** `POST /api/v1/invoices` is called
9. **Verify Request Body:** `is_interstate: true`
10. **Verify Response:** Status 201
11. **Verify Response:** `igst_amount` > 0 (e.g., ₹1,800 for ₹10,000 @ 18%)
12. **Verify Response:** `cgst_amount` = 0
13. **Verify Response:** `sgst_amount` = 0
14. **Verify UI:** Invoice shows IGST amount

#### Test 5.6: Intra-state Invoice (CGST+SGST) - UI + BFF
**Steps:**
1. Select party from same state as business
2. Navigate to `/invoices/create`
3. Select intra-state party
4. **Verify UI:** Form shows "Intra-state" or CGST+SGST labels
5. Add item with tax rate 18%
6. **Verify UI:** Tax breakdown shows:
   - CGST: 9%
   - SGST: 9%
   - IGST: Not shown or 0
7. Submit form
8. **Verify BFF API Call:** `POST /api/v1/invoices` is called
9. **Verify Request Body:** `is_interstate: false`
10. **Verify Response:** Status 201
11. **Verify Response:** `cgst_amount` > 0 (e.g., ₹900 for ₹10,000 @ 9%)
12. **Verify Response:** `sgst_amount` > 0 (e.g., ₹900)
13. **Verify Response:** `igst_amount` = 0
14. **Verify UI:** Invoice shows CGST and SGST amounts

#### Test 5.7: List Invoices - UI + BFF
**Steps:**
1. Navigate to `/invoices` page
2. **Verify BFF API Call:** `GET /api/v1/invoices` is called
3. **Verify Response:** Status 200, returns object with `invoices` array, `total`, `page`, `limit`
4. **Verify Response Structure:** `invoices` is array of invoice objects
5. **Verify UI:** Invoices displayed in cards or table
6. **Verify UI:** Each invoice shows: invoice number, party name, date, total amount, status

#### Test 5.8: Filter Invoices by Type - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Click "Sales" tab or filter
3. **Verify BFF API Call:** `GET /api/v1/invoices?invoiceType=sale` is called
4. **Verify Request Query:** Contains `invoiceType=sale`
5. **Verify Response:** Status 200, only sale invoices
6. **Verify Response:** All invoices have `invoice_type: "sale"`
7. **Verify UI:** Only sale invoices displayed
8. Click "Purchase" tab
9. **Verify BFF API Call:** `GET /api/v1/invoices?invoiceType=purchase` is called
10. **Verify UI:** Only purchase invoices displayed

#### Test 5.8a: Filter Invoices by Party - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Select party from party filter dropdown
3. **Verify BFF API Call:** `GET /api/v1/invoices?partyId=<partyId>` is called
4. **Verify Request Query:** Contains `partyId` parameter
5. **Verify Response:** Status 200, only invoices for that party
6. **Verify Response:** All invoices have `party_id` matching filter
7. **Verify UI:** Only filtered invoices displayed
8. Clear party filter
9. **Verify BFF API Call:** `GET /api/v1/invoices` called (without partyId)
10. **Verify UI:** All invoices displayed

#### Test 5.8b: Filter Invoices by Payment Status - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Select payment status filter: "Unpaid"
3. **Verify BFF API Call:** `GET /api/v1/invoices?paymentStatus=unpaid` is called
4. **Verify Request Query:** Contains `paymentStatus=unpaid`
5. **Verify Response:** Status 200, only unpaid invoices
6. **Verify Response:** All invoices have `payment_status: "unpaid"`
7. **Verify UI:** Only unpaid invoices displayed
8. Select "Paid" filter
9. **Verify BFF API Call:** `GET /api/v1/invoices?paymentStatus=paid` is called
10. **Verify UI:** Only paid invoices displayed
11. Select "Partial" filter
12. **Verify BFF API Call:** `GET /api/v1/invoices?paymentStatus=partial` is called
13. **Verify UI:** Only partially paid invoices displayed

#### Test 5.8c: Filter Invoices by Date Range - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Select start date: `2024-01-01`
3. Select end date: `2024-12-31`
4. Click "Apply" or filter button
5. **Verify BFF API Call:** `GET /api/v1/invoices?startDate=2024-01-01&endDate=2024-12-31` is called
6. **Verify Request Query:** Contains `startDate` and `endDate` parameters
7. **Verify Response:** Status 200, filtered invoices
8. **Verify Response:** All invoices have `invoice_date` within date range
9. **Verify UI:** Only invoices within date range displayed
10. Clear date filters
11. **Verify BFF API Call:** `GET /api/v1/invoices` called (without date params)
12. **Verify UI:** All invoices displayed

#### Test 5.9: Filter Invoices by Status - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Click "Pending" filter
3. **Verify BFF API Call:** `GET /api/v1/invoices?status=pending` is called
4. **Verify Response:** Only pending invoices
5. **Verify UI:** Only pending invoices displayed
6. Click "Paid" filter
7. **Verify BFF API Call:** `GET /api/v1/invoices?status=paid` is called
8. **Verify UI:** Only paid invoices displayed

#### Test 5.10: Search Invoices - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Type invoice number in search: `"INV-001"`
3. **Verify BFF API Call:** `GET /api/v1/invoices?search=INV-001` is called
4. **Verify Response:** Filtered results
5. **Verify UI:** Only matching invoices displayed
6. Search by party name: `"Customer"`
7. **Verify BFF API Call:** `GET /api/v1/invoices?search=Customer` is called
8. **Verify UI:** Invoices for parties with "Customer" in name displayed

#### Test 5.11: View Invoice Detail - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Click on an invoice card
3. **Verify UI:** Navigate to `/invoices/:id` page
4. **Verify BFF API Call:** `GET /api/v1/invoices/:id` is called
5. **Verify Response:** Status 200, returns single invoice object
6. **Verify Response Structure:** Invoice contains all fields including `items` array
7. **Verify UI:** Invoice number displayed as heading
8. **Verify UI:** Party details displayed: name, address
9. **Verify UI:** Invoice date and due date displayed
10. **Verify UI:** All items listed with quantities, prices, taxes
11. **Verify UI:** Totals section shows: subtotal, tax breakdown, total
12. **Verify UI:** Status badge displayed (pending/paid/overdue)
13. **Verify UI:** Edit button visible
14. **Verify UI:** Delete button visible
15. **Verify UI:** Record Payment button visible

#### Test 5.12: View Payments for Invoice - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id` (invoice detail page)
2. Scroll to payments section or click "Payments" tab
3. **Verify BFF API Call:** `GET /api/v1/payments/invoices/:invoiceId` is called
4. **Verify Response:** Status 200, returns array of payments
5. **Verify Response:** All payments have `invoice_id` matching invoice ID
6. **Verify UI:** Payments listed
7. **Verify UI:** Each payment shows: date, amount, mode, reference
8. **Verify UI:** Total paid amount displayed
9. **Verify UI:** Remaining balance calculated and displayed

#### Test 5.13: Record Payment from Invoice - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id`
2. Note invoice total amount (e.g., ₹11,800)
3. Click "Record Payment" button
4. **Verify UI:** Payment dialog/form opens
5. **Verify UI:** Invoice info pre-filled or displayed
6. **Verify UI:** Invoice balance displayed (₹11,800)
7. Fill payment form:
   - Amount: `5000` (partial payment)
   - Payment Mode: Select "Cash" or "UPI"
   - Reference Number: `PAY-001`
   - Payment Date: Today's date
8. Click "Submit" or "Record Payment" button
9. **Verify BFF API Call:** `POST /api/v1/payments` is called
10. **Verify Request Body:** Contains:
    - `invoice_id`: Invoice ID
    - `party_id`: Party ID from invoice
    - `amount`: 5000
    - `payment_mode`: Selected mode
    - `reference_number`: PAY-001
    - `transaction_type`: "payment_in" (for sale invoice)
11. **Verify Response:** Status 201, returns payment object
12. **Verify Response Structure:** Payment has `id`, `amount`, `payment_mode`, `created_at`
13. **Verify UI:** Success toast displayed
14. **Verify UI:** Dialog closes
15. **Verify BFF API Call:** `GET /api/v1/payments/invoices/:invoiceId` called again (refresh)
16. **Verify UI:** Payment appears in payments list
17. **Verify UI:** Invoice balance updated: Shows ₹6,800 remaining (11,800 - 5,000)
18. **Verify UI:** Status may change to "partial" if applicable

#### Test 5.14: Update Invoice - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id` (invoice detail page)
2. Click "Edit" button
3. **Verify UI:** Navigate to `/invoices/:id/edit` or edit form opens
4. **Verify BFF API Call:** `GET /api/v1/invoices/:id` is called (pre-fill)
5. **Verify UI:** Form pre-filled with invoice data
6. Update invoice date: Change to different date
7. Update due date: Change to different date
8. Add new item to invoice (if supported)
9. Click "Save" or "Update" button
10. **Verify BFF API Call:** `PATCH /api/v1/invoices/:id` is called
11. **Verify Request Body:** Contains updated fields
12. **Verify Response:** Status 200, returns updated invoice
13. **Verify Response:** Updated fields match request
14. **Verify Response:** Totals recalculated if items changed
15. **Verify UI:** Success toast displayed
16. **Verify UI:** Updated invoice displayed

#### Test 5.15: Delete Invoice - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Click dropdown menu on invoice card
3. Click "Delete" option
4. **Verify UI:** Confirmation dialog appears
5. Click "Confirm"
6. **Verify BFF API Call:** `DELETE /api/v1/invoices/:id` is called
7. **Verify Response:** Status 204 or 200
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Invoice removed from list
10. Navigate to `/invoices/:id` (deleted invoice)
11. **Verify BFF API Call:** `GET /api/v1/invoices/:id` is called
12. **Verify Response:** Status 404

#### Test 5.15a: Invoice Status Transitions - UI + BFF
**Steps:**
1. Create invoice (follow Test 5.1)
2. **Verify Response:** Invoice has `status: "draft"` or `status: "pending"`
3. Navigate to invoice detail page
4. Click "Mark as Pending" or "Submit" button (if exists)
5. **Verify BFF API Call:** `PATCH /api/v1/invoices/:id` called with `status: "pending"`
6. **Verify Response:** Status 200, `status: "pending"`
7. **Verify UI:** Status badge updated to "Pending"
8. Click "Mark as Paid" button (if exists)
9. **Verify BFF API Call:** `PATCH /api/v1/invoices/:id` called with `status: "paid"`
10. **Verify Response:** Status 200, `status: "paid"`
11. **Verify UI:** Status badge updated to "Paid"
12. Click "Cancel" button (if exists)
13. **Verify BFF API Call:** `PATCH /api/v1/invoices/:id` called with `status: "cancelled"`
14. **Verify Response:** Status 200, `status: "cancelled"`
15. **Verify UI:** Status badge updated to "Cancelled"

#### Test 5.15b: Invoice Payment Status Updates - UI + BFF
**Steps:**
1. Create invoice with total ₹10,000 (follow Test 5.1)
2. **Verify Response:** Invoice has `payment_status: "unpaid"`
3. Record payment ₹5,000 against invoice (follow Test 6.1)
4. Navigate to invoice detail page
5. **Verify BFF API Call:** `GET /api/v1/invoices/:id` called
6. **Verify Response:** `payment_status: "partial"` (if amount < total)
7. **Verify UI:** Payment status badge shows "Partial"
8. Record remaining payment ₹5,000
9. Navigate to invoice detail page
10. **Verify BFF API Call:** `GET /api/v1/invoices/:id` called
11. **Verify Response:** `payment_status: "paid"` (if amount >= total)
12. **Verify UI:** Payment status badge shows "Paid"

#### Test 5.16: Create Invoice - Validation Error (Missing Party - Mandatory Field)
**Steps:**
1. Navigate to `/invoices/create`
2. Don't select party (leave party dropdown empty)
3. Fill other fields and add items
4. Click "Submit"
5. **Verify BFF API Call:** `POST /api/v1/invoices` may be called or form validation prevents call
6. **Verify Request Body:** Missing `party_id` field (mandatory)
7. **Verify Response:** If called, Status 400, validation error
8. **Verify UI:** Error message displayed near party field

#### Test 5.16a: Create Invoice - Validation Error (Missing Invoice Type - Mandatory Field)
**Steps:**
1. Navigate to `/invoices/create`
2. Select party
3. Don't select invoice type (if dropdown exists)
4. Fill invoice date and add items
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/invoices` is called
7. **Verify Request Body:** Missing `invoice_type` field (mandatory)
8. **Verify Response:** Status 400, validation error for `invoice_type`
9. **Verify UI:** Error message displayed

#### Test 5.16b: Create Invoice - Validation Error (Missing Invoice Date - Mandatory Field)
**Steps:**
1. Navigate to `/invoices/create`
2. Select party and invoice type
3. Don't fill invoice date (leave empty)
4. Add items
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/invoices` is called
7. **Verify Request Body:** Missing `invoice_date` field (mandatory)
8. **Verify Response:** Status 400, validation error for `invoice_date`
9. **Verify UI:** Error message displayed

#### Test 5.16c: Create Invoice - With Only Mandatory Fields (All Optional Omitted)
**Steps:**
1. Navigate to `/invoices/create`
2. Fill only mandatory fields:
   - Party: Select party
   - Invoice Type: Select "sale"
   - Invoice Date: Today's date
   - Items: Add one item with mandatory fields (item_name, quantity, unit_price)
3. Don't fill optional fields: due_date, place_of_supply, is_interstate, terms, notes
4. Click "Submit"
5. **Verify BFF API Call:** `POST /api/v1/invoices` is called
6. **Verify Request Body:** Contains only mandatory fields:
   - `party_id`, `invoice_type`, `invoice_date`, `items` array
   - Items array contains only mandatory: `item_name`, `quantity`, `unit_price`
7. **Verify Response:** Status 201, invoice created successfully
8. **Verify Response Structure:** Invoice has all mandatory fields, optional fields may be null/undefined
9. **Verify Response:** `due_date` calculated automatically (30 days from invoice_date)
10. **Verify UI:** Success toast displayed

#### Test 5.16d: Create Invoice - With All Optional Fields
**Steps:**
1. Navigate to `/invoices/create`
2. Fill mandatory fields: Party, Invoice Type, Invoice Date
3. Fill all optional fields:
   - Due Date: 45 days from invoice date
   - Place of Supply: `Maharashtra`
   - Is Interstate: `false`
   - Is Export: `false`
   - Is RCM: `false`
   - Terms: `Payment within 30 days`
   - Notes: `Thank you for your business`
4. Add item with all optional fields:
   - Item Name: `Product A`
   - Item ID: Select from dropdown (if exists)
   - Item Description: `Test description`
   - HSN Code: `8471`
   - Unit: `pcs`
   - Quantity: `10`
   - Unit Price: `1000`
   - Discount Percent: `10`
   - Tax Rate: `18`
   - CESS Rate: `0`
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/invoices` is called
7. **Verify Request Body:** Contains all fields (mandatory + optional)
8. **Verify Response:** Status 201, invoice created with all fields
9. **Verify Response Structure:** All provided fields present in response
10. **Verify UI:** Success toast displayed

#### Test 5.16e: Create Invoice Item - Validation Error (Missing Item Name - Mandatory Field)
**Steps:**
1. Navigate to `/invoices/create`
2. Select party, invoice type, invoice date
3. Add item but leave item_name empty
4. Fill quantity and unit_price
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/invoices` is called
7. **Verify Request Body:** Items array contains item with missing `item_name` (mandatory)
8. **Verify Response:** Status 400, validation error for `item_name`
9. **Verify UI:** Error message displayed near item_name field

#### Test 5.16f: Create Invoice Item - Validation Error (Missing Quantity - Mandatory Field)
**Steps:**
1. Add item with item_name and unit_price
2. Leave quantity empty or 0
3. Click "Submit"
4. **Verify BFF API Call:** `POST /api/v1/invoices` is called
5. **Verify Request Body:** Item missing `quantity` (mandatory)
6. **Verify Response:** Status 400, validation error for `quantity`
7. **Verify UI:** Error message displayed

#### Test 5.16g: Create Invoice Item - Validation Error (Missing Unit Price - Mandatory Field)
**Steps:**
1. Add item with item_name and quantity
2. Leave unit_price empty
3. Click "Submit"
4. **Verify BFF API Call:** `POST /api/v1/invoices` is called
5. **Verify Request Body:** Item missing `unit_price` (mandatory)
6. **Verify Response:** Status 400, validation error for `unit_price`
7. **Verify UI:** Error message displayed

#### Test 5.17: Create Invoice - Validation Error (No Items)
**Steps:**
1. Select party
2. Don't add any items
3. Try to submit
4. **Verify UI:** Error message displayed: "At least one item required"
5. **Verify BFF API Call:** `POST /api/v1/invoices` not called (form validation)

#### Test 5.18: Create Invoice - Validation Error (Zero Quantity)
**Steps:**
1. Add item with quantity = 0
2. Try to submit
3. **Verify UI:** Error message displayed
4. **Verify BFF API Call:** If called, Status 400

---

### 06-payments.spec.ts

#### Test 6.1: Create Payment Against Invoice - UI + BFF
**Steps:**
1. Ensure invoice exists (create via UI if needed)
2. Navigate to `/payments/new` or click "Record Payment" from invoice detail page
3. **Verify UI:** Payment form loads
4. Select party from dropdown
5. **Verify BFF API Call:** `GET /api/v1/invoices?partyId=...` may be called (to show invoices for party)
6. **Verify Response:** Status 200, returns invoices for that party
7. **Verify UI:** Invoice dropdown populated or invoice pre-selected
8. Select invoice from dropdown (if not pre-selected)
9. **Verify UI:** Invoice total amount displayed
10. **Verify UI:** Invoice balance displayed (if partial payments exist)
11. Fill payment form:
    - Amount: `10000` (full payment)
    - Payment Mode: Select "Cash", "UPI", "Bank Transfer", etc.
    - Reference Number: `PAY-REF-001`
    - Payment Date: Today's date
    - Notes: `Payment received`
12. Click "Submit" or "Record Payment" button
13. **Verify BFF API Call:** `POST /api/v1/payments` is called
14. **Verify Request Body:** Contains:
    - `invoice_id`: Selected invoice ID
    - `party_id`: Party ID
    - `amount`: 10000
    - `payment_mode`: Selected mode
    - `reference_number`: PAY-REF-001
    - `transaction_date`: Date string
    - `transaction_type`: "payment_in" (for sale invoice) or "payment_out" (for purchase)
15. **Verify Request Headers:** Contains authentication token
16. **Verify Response:** Status 201, returns payment object
17. **Verify Response Structure:** Payment has `id`, `amount`, `payment_mode`, `invoice_id`, `party_id`, `created_at`
18. **Verify UI:** Success toast displayed
19. **Verify UI:** Redirected to `/payments` list or payment detail page
20. **Verify BFF API Call:** `GET /api/v1/payments` called again (refresh)
21. **Verify UI:** Payment appears in payments list
22. Navigate to invoice detail page
23. **Verify UI:** Payment appears in invoice payments list
24. **Verify UI:** Invoice balance updated (shows ₹0 if full payment)

#### Test 6.2: Create Advance Payment (No Invoice) - UI + BFF
**Steps:**
1. Navigate to `/payments/new`
2. Select party from dropdown
3. Don't select invoice (leave invoice field empty for advance payment)
4. Fill payment form:
   - Amount: `5000`
   - Payment Mode: "Cash"
   - Reference: `ADV-001`
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/payments` is called
7. **Verify Request Body:** Contains `party_id`, `amount`, `payment_mode`, but no `invoice_id` or `invoice_id: null`
8. **Verify Response:** Status 201, payment created
9. **Verify UI:** Success toast displayed
10. **Verify UI:** Payment appears in list

#### Test 6.3: Partial Payment - UI + BFF
**Steps:**
1. Create invoice with total ₹10,000 (follow Test 5.1)
2. Navigate to invoice detail page
3. Click "Record Payment"
4. Fill amount: `5000` (partial payment)
5. Submit
6. **Verify BFF API Call:** `POST /api/v1/payments` is called with `amount: 5000`
7. **Verify Response:** Status 201
8. **Verify UI:** Invoice balance shows ₹5,000 remaining
9. **Verify UI:** Invoice status remains "pending" (not "paid")
10. Record another payment ₹5,000
11. **Verify UI:** Invoice balance shows ₹0
12. **Verify UI:** Invoice status changes to "paid" (if implemented)

#### Test 6.4: List Payments - UI + BFF
**Steps:**
1. Navigate to `/payments` page
2. **Verify BFF API Call:** `GET /api/v1/payments` is called
3. **Verify Response:** Status 200, returns object with `payments` array, `total`, `page`, `limit`
4. **Verify UI:** Payments displayed in cards or table
5. **Verify UI:** Each payment shows: date, amount, party name, invoice number (if linked), payment mode

#### Test 6.5: Filter Payments by Invoice - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Select invoice filter or search by invoice number
3. **Verify BFF API Call:** `GET /api/v1/payments?invoiceId=...` is called
4. **Verify Request Query:** Contains `invoiceId` parameter
5. **Verify Response:** Status 200, only payments for that invoice
6. **Verify Response:** All payments have `invoice_id` matching filter
7. **Verify UI:** Only filtered payments displayed

#### Test 6.5a: Filter Payments by Transaction Type - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Select transaction type filter: "Payment In" (for received payments)
3. **Verify BFF API Call:** `GET /api/v1/payments?transactionType=payment_in` is called
4. **Verify Request Query:** Contains `transactionType=payment_in`
5. **Verify Response:** Status 200, only payment_in transactions
6. **Verify Response:** All payments have `transaction_type: "payment_in"`
7. **Verify UI:** Only payment_in transactions displayed
8. Select "Payment Out" filter
9. **Verify BFF API Call:** `GET /api/v1/payments?transactionType=payment_out` is called
10. **Verify UI:** Only payment_out transactions displayed

#### Test 6.5b: Filter Payments by Date Range - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Select start date: `2024-01-01`
3. Select end date: `2024-12-31`
4. Click "Apply" or filter button
5. **Verify BFF API Call:** `GET /api/v1/payments?startDate=2024-01-01&endDate=2024-12-31` is called
6. **Verify Request Query:** Contains `startDate` and `endDate` parameters
7. **Verify Response:** Status 200, filtered payments
8. **Verify Response:** All payments have `transaction_date` within date range
9. **Verify UI:** Only payments within date range displayed
10. Clear date filters
11. **Verify BFF API Call:** `GET /api/v1/payments` called (without date params)
12. **Verify UI:** All payments displayed

#### Test 6.6: Filter Payments by Party - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Select party filter
3. **Verify BFF API Call:** `GET /api/v1/payments?partyId=...` is called
4. **Verify Response:** Only payments for that party
5. **Verify UI:** Filtered payments displayed

#### Test 6.7: Filter Payments by Payment Mode - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Select payment mode filter (e.g., "Cash")
3. **Verify BFF API Call:** `GET /api/v1/payments?transactionType=...` or similar may be called
4. **Verify UI:** Only payments with selected mode displayed

#### Test 6.8: View Payment Detail - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Click on a payment card
3. **Verify UI:** Navigate to `/payments/:id` page
4. **Verify BFF API Call:** `GET /api/v1/payments/:id` is called
5. **Verify Response:** Status 200, returns single payment object
6. **Verify UI:** Payment amount displayed prominently
7. **Verify UI:** Payment details displayed: date, mode, reference, party name
8. **Verify UI:** Linked invoice displayed (if payment against invoice)
9. **Verify UI:** Edit button visible (if supported)
10. **Verify UI:** Delete button visible

#### Test 6.9: View Invoice from Payment - UI + BFF
**Steps:**
1. Navigate to `/payments/:id` (payment detail page)
2. Click on linked invoice (if displayed)
3. **Verify UI:** Navigate to `/invoices/:id`
4. **Verify BFF API Call:** `GET /api/v1/invoices/:id` is called
5. **Verify Response:** Status 200, invoice object
6. **Verify UI:** Invoice details displayed

#### Test 6.10: Delete Payment - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Click dropdown menu on payment card
3. Click "Delete" option
4. **Verify UI:** Confirmation dialog appears
5. Click "Confirm"
6. **Verify BFF API Call:** `DELETE /api/v1/payments/:id` is called
7. **Verify Response:** Status 204
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Payment removed from list
10. Navigate to invoice detail page (if payment was against invoice)
11. **Verify UI:** Invoice balance updated (increased by deleted payment amount)

#### Test 6.11: Create Payment - Validation Error (Missing Party - Mandatory Field)
**Steps:**
1. Navigate to `/payments/new` or payment form
2. Don't select party (leave party dropdown empty)
3. Fill other fields: amount, payment_mode, transaction_date
4. Click "Submit"
5. **Verify BFF API Call:** `POST /api/v1/payments` may be called or form validation prevents call
6. **Verify Request Body:** Missing `party_id` field (mandatory)
7. **Verify Response:** If called, Status 400, validation error
8. **Verify UI:** Error message displayed near party field

#### Test 6.11a: Create Payment - Validation Error (Missing Transaction Type - Mandatory Field)
**Steps:**
1. Navigate to payment form
2. Select party
3. Don't select transaction type (leave empty)
4. Fill amount, payment_mode, transaction_date
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/payments` is called
7. **Verify Request Body:** Missing `transaction_type` field (mandatory)
8. **Verify Response:** Status 400, validation error for `transaction_type`
9. **Verify UI:** Error message displayed

#### Test 6.11b: Create Payment - Validation Error (Missing Transaction Date - Mandatory Field)
**Steps:**
1. Navigate to payment form
2. Select party and transaction type
3. Don't fill transaction date (leave empty)
4. Fill amount and payment_mode
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/payments` is called
7. **Verify Request Body:** Missing `transaction_date` field (mandatory)
8. **Verify Response:** Status 400, validation error for `transaction_date`
9. **Verify UI:** Error message displayed

#### Test 6.11c: Create Payment - Validation Error (Missing Amount - Mandatory Field)
**Steps:**
1. Navigate to payment form
2. Select party, transaction type, transaction date
3. Don't fill amount (leave empty or 0)
4. Select payment_mode
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/payments` is called
7. **Verify Request Body:** Missing `amount` field or amount = 0 (mandatory, must be > 0)
8. **Verify Response:** Status 400, validation error for `amount`
9. **Verify UI:** Error message displayed

#### Test 6.11d: Create Payment - Validation Error (Missing Payment Mode - Mandatory Field)
**Steps:**
1. Navigate to payment form
2. Select party, transaction type, transaction date
3. Fill amount
4. Don't select payment_mode (leave empty)
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/payments` is called
7. **Verify Request Body:** Missing `payment_mode` field (mandatory)
8. **Verify Response:** Status 400, validation error for `payment_mode`
9. **Verify UI:** Error message displayed

#### Test 6.11e: Create Payment - With Only Mandatory Fields (All Optional Omitted)
**Steps:**
1. Navigate to `/payments/new`
2. Fill only mandatory fields:
   - Party: Select party
   - Transaction Type: Select "payment_in"
   - Transaction Date: Today's date
   - Amount: `5000`
   - Payment Mode: Select "cash"
3. Don't fill optional fields: invoice_id, reference_number, bank_name, cheque_number, cheque_date, notes
4. Click "Submit"
5. **Verify BFF API Call:** `POST /api/v1/payments` is called
6. **Verify Request Body:** Contains only mandatory fields:
   - `party_id`, `transaction_type`, `transaction_date`, `amount`, `payment_mode`
7. **Verify Response:** Status 201, payment created successfully
8. **Verify Response Structure:** Payment has all mandatory fields, optional fields may be null/undefined
9. **Verify UI:** Success toast displayed

#### Test 6.11f: Create Payment - With All Optional Fields
**Steps:**
1. Navigate to `/payments/new`
2. Fill mandatory fields: Party, Transaction Type, Transaction Date, Amount, Payment Mode
3. Fill all optional fields:
   - Invoice: Select invoice (if payment against invoice)
   - Reference Number: `REF-001`
   - Bank Name: `State Bank of India` (if payment_mode is bank)
   - Cheque Number: `123456` (if payment_mode is cheque)
   - Cheque Date: Future date (if payment_mode is cheque)
   - Notes: `Payment received`
4. Click "Submit"
5. **Verify BFF API Call:** `POST /api/v1/payments` is called
6. **Verify Request Body:** Contains all fields (mandatory + optional)
7. **Verify Response:** Status 201, payment created with all fields
8. **Verify Response Structure:** All provided fields present in response
9. **Verify UI:** Success toast displayed

#### Test 6.12: Create Payment - Validation Error (Amount Exceeds Invoice Balance)
**Steps:**
1. Create invoice with total ₹10,000
2. Navigate to payment form
3. Select invoice
4. Fill amount: `15000` (exceeds invoice balance)
5. Click "Submit"
6. **Verify BFF API Call:** `POST /api/v1/payments` is called
7. **Verify Response:** Status 400, error indicates amount exceeds invoice balance
8. **Verify UI:** Error toast displayed

#### Test 6.13: Create Payment - Validation Error (Zero Amount)
**Steps:**
1. Fill payment form with amount: `0`
2. Submit
3. **Verify BFF API Call:** If called, Status 400
4. **Verify UI:** Error message displayed

#### Test 6.13: Create Payment - Validation Error (Negative Amount)
**Steps:**
1. Fill amount: `-1000`
2. Submit
3. **Verify UI:** Form validation prevents submission or error displayed

---

### 07-dashboard.spec.ts

#### Test 7.1: Dashboard Load - UI + BFF
**Steps:**
1. Login successfully
2. Navigate to `/dashboard` page
3. **Verify BFF API Call:** `GET /api/v1/invoices` is called
4. **Verify BFF API Call:** `GET /api/v1/payments` is called
5. **Verify BFF API Call:** `GET /api/v1/parties` is called
6. **Verify BFF API Call:** `GET /api/v1/items` is called
7. **Verify Response:** All APIs return Status 200
8. **Verify UI:** Dashboard page loads
9. **Verify UI:** Stats cards displayed:
   - Total Sales
   - Total Purchases
   - Outstanding Receivables
   - Outstanding Payables
   - Total Customers
   - Total Suppliers
   - Pending Invoices
   - Low Stock Items
10. **Verify UI:** Each card shows numeric value and label
11. **Verify UI:** Charts or graphs displayed (if implemented)
12. **Verify UI:** Recent invoices list displayed (if implemented)

#### Test 7.2: Total Sales Calculation - UI + BFF Verification
**Steps:**
1. Navigate to `/dashboard`
2. Note current "Total Sales" value from stats card (e.g., ₹50,000)
3. **Verify BFF API Call:** `GET /api/v1/invoices` is called
4. **Verify Response:** Contains invoices array
5. Calculate expected total sales:
   - Filter invoices where `invoice_type === "sale"`
   - Sum `total_amount` of all sale invoices
6. **Verify UI:** Total Sales card displays calculated value
7. Create new sale invoice via UI: Amount ₹10,000 (follow Test 5.1)
8. Navigate back to `/dashboard`
9. **Verify BFF API Call:** `GET /api/v1/invoices` called again
10. **Verify Response:** Contains new invoice
11. **Verify UI:** Total Sales card updated: Shows ₹60,000 (50,000 + 10,000)
12. **Verify Calculation:** New total = previous total + new invoice amount

#### Test 7.3: Outstanding Receivables Calculation - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note current "Outstanding Receivables" value
3. **Verify BFF API Calls:** `GET /api/v1/invoices` and `GET /api/v1/payments` called
4. Calculate expected outstanding:
   - Total Sales = Sum of sale invoices `total_amount`
   - Total Payments Received = Sum of payments against sale invoices
   - Outstanding = Total Sales - Total Payments Received
5. **Verify UI:** Outstanding Receivables card displays calculated value
6. Create sale invoice ₹10,000
7. Navigate to `/dashboard`
8. **Verify UI:** Outstanding increased by ₹10,000
9. Record payment ₹3,000 against that invoice
10. Navigate to `/dashboard`
11. **Verify UI:** Outstanding decreased by ₹3,000
12. **Verify Calculation:** Outstanding = Total Sales - Payments Received

#### Test 7.4: Total Purchases Calculation - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note "Total Purchases" value
3. Create purchase invoice ₹8,000 (follow Test 5.2)
4. Navigate to `/dashboard`
5. **Verify BFF API Call:** `GET /api/v1/invoices` called
6. **Verify UI:** Total Purchases increased by ₹8,000

#### Test 7.5: Pending Invoices Count - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note "Pending Invoices" count
3. **Verify BFF API Call:** `GET /api/v1/invoices` called
4. Count pending invoices: Filter where `status === "pending"`
5. **Verify UI:** Pending count matches calculated count
6. Create new invoice (status will be "pending")
7. Navigate to `/dashboard`
8. **Verify UI:** Pending count increased by 1

#### Test 7.6: Low Stock Items Count - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note "Low Stock Items" count
3. **Verify BFF API Call:** `GET /api/v1/items` called
4. Count low stock items: Filter where `current_stock <= low_stock_threshold`
5. **Verify UI:** Low stock count matches calculated count
6. Create item with stock = 5, threshold = 10 (follow Test 4.1)
7. Navigate to `/dashboard`
8. **Verify UI:** Low stock count increased by 1
9. Adjust stock to 15 (above threshold)
10. Navigate to `/dashboard`
11. **Verify UI:** Low stock count decreased by 1

#### Test 7.7: Total Parties Count - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note "Total Customers" and "Total Suppliers" counts
3. **Verify BFF API Call:** `GET /api/v1/parties` called
4. Count customers: Filter where `type === "customer"`
5. Count suppliers: Filter where `type === "supplier"`
6. **Verify UI:** Counts match calculated values
7. Create new customer (follow Test 3.1)
8. Navigate to `/dashboard`
9. **Verify UI:** Total Customers count increased by 1

#### Test 7.8: Dashboard Refresh After Operations - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note all stat values
3. Perform multiple operations:
   - Create sale invoice ₹10,000
   - Create purchase invoice ₹5,000
   - Record payment ₹3,000
   - Create new customer
   - Create new item
4. Navigate to `/dashboard`
5. **Verify BFF API Calls:** All APIs called again:
   - `GET /api/v1/invoices`
   - `GET /api/v1/payments`
   - `GET /api/v1/parties`
   - `GET /api/v1/items`
6. **Verify UI:** All stats updated correctly:
   - Total Sales increased
   - Total Purchases increased
   - Outstanding updated
   - Party counts updated
   - Item count updated

---

### 08-cross-module.spec.ts

#### Test 8.1: Party → Invoice Flow - UI + BFF
**Steps:**
1. Create party via UI (follow Test 3.1)
2. **Verify BFF API Call:** `POST /api/v1/parties` called
3. **Verify Response:** Party created with `id`
4. Store party ID
5. Navigate to `/invoices/create`
6. **Verify BFF API Call:** `GET /api/v1/parties` called (for dropdown)
7. **Verify Response:** Contains created party
8. **Verify UI:** Created party appears in party dropdown
9. Select created party from dropdown
10. Fill invoice form and submit
11. **Verify BFF API Call:** `POST /api/v1/invoices` called with `party_id` matching created party
12. **Verify Response:** Invoice created and linked to party
13. Navigate to party detail page
14. **Verify UI:** Invoice appears in party's invoice list (if implemented)
15. Navigate to party ledger
16. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` called
17. **Verify Response:** Ledger shows invoice transaction
18. **Verify UI:** Invoice entry in ledger with correct balance impact

#### Test 8.2: Invoice → Payment Flow - UI + BFF
**Steps:**
1. Create invoice via UI (follow Test 5.1)
2. **Verify BFF API Call:** `POST /api/v1/invoices` called
3. Store invoice ID
4. Navigate to invoice detail page
5. Click "Record Payment" button
6. **Verify UI:** Payment form opens with invoice pre-selected
7. Fill payment amount (full or partial)
8. Submit payment
9. **Verify BFF API Call:** `POST /api/v1/payments` called with `invoice_id`
10. **Verify Response:** Payment created
11. **Verify UI:** Payment appears in invoice payments list
12. **Verify BFF API Call:** `GET /api/v1/payments/invoices/:invoiceId` called (refresh)
13. **Verify UI:** Invoice balance updated
14. **Verify UI:** Invoice status may change (pending → paid if full payment)

#### Test 8.3: Inventory → Invoice Flow - UI + BFF
**Steps:**
1. Create item via UI (follow Test 4.1)
2. **Verify BFF API Call:** `POST /api/v1/items` called
3. Store item ID
4. Navigate to `/invoices/create`
5. **Verify BFF API Call:** `GET /api/v1/items` called (for dropdown)
6. **Verify Response:** Contains created item
7. **Verify UI:** Created item appears in item dropdown
8. Select item from dropdown
9. **Verify UI:** Item details auto-filled: price, tax rate, HSN code
10. Fill quantity and submit invoice
11. **Verify BFF API Call:** `POST /api/v1/invoices` called
12. **Verify Request Body:** Items array contains item with `item_id` matching created item
13. **Verify Response:** Invoice created with item linked

#### Test 8.4: Dashboard Updates After Operations - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note baseline stats: Total Sales, Outstanding, Invoice Count
3. Create sale invoice ₹10,000
4. Navigate to `/dashboard`
5. **Verify BFF API Calls:** `GET /api/v1/invoices` and `GET /api/v1/payments` called
6. **Verify UI:** Total Sales increased by ₹10,000
7. **Verify UI:** Outstanding increased by ₹10,000
8. **Verify UI:** Invoice Count increased by 1
9. Record payment ₹5,000
10. Navigate to `/dashboard`
11. **Verify UI:** Outstanding decreased by ₹5,000
12. **Verify UI:** Total Payments Received increased by ₹5,000

#### Test 8.5: Delete Cascade Rules - Party with Invoices
**Steps:**
1. Create party via UI
2. Create invoice with that party
3. Navigate to `/parties`
4. Try to delete party (follow Test 3.9)
5. **Verify BFF API Call:** `DELETE /api/v1/parties/:id` called
6. **Verify Response:** Status 400 or 409, error indicates party has invoices and cannot be deleted
7. **Verify UI:** Error toast displayed
8. **Verify UI:** Party still exists in list
9. Delete invoice first (follow Test 5.15)
10. Then delete party
11. **Verify BFF API Call:** `DELETE /api/v1/parties/:id` called
12. **Verify Response:** Status 204 (success)
13. **Verify UI:** Party deleted successfully

#### Test 8.6: Delete Cascade Rules - Item Used in Invoices
**Steps:**
1. Create item via UI
2. Create invoice with that item
3. Navigate to `/inventory`
4. Try to delete item (follow Test 4.10)
5. **Verify BFF API Call:** `DELETE /api/v1/items/:id` called
6. **Verify Response:** Status 400 or 409, error indicates item used in invoices
7. **Verify UI:** Error toast displayed
8. Delete invoice first
9. Then delete item
10. **Verify BFF API Call:** `DELETE /api/v1/items/:id` called
11. **Verify Response:** Status 204
12. **Verify UI:** Item deleted successfully

---

### 09-business-logic.spec.ts

#### Test 9.1: GST Calculation - Intra-state (CGST+SGST) - UI + BFF
**Steps:**
1. Create party from same state as business (intra-state)
2. Navigate to `/invoices/create`
3. Select intra-state party
4. Add item: Quantity 1, Price ₹1,000, Tax Rate 18%
5. **Verify UI:** Tax breakdown shows:
   - CGST: 9% = ₹90
   - SGST: 9% = ₹90
   - IGST: Not shown or ₹0
   - Total Tax: ₹180
   - Total: ₹1,180
6. Submit invoice
7. **Verify BFF API Call:** `POST /api/v1/invoices` called with `is_interstate: false`
8. **Verify Response:** Status 201
9. **Verify Response:** `cgst_amount` = 90 (or close to 90 with rounding)
10. **Verify Response:** `sgst_amount` = 90
11. **Verify Response:** `igst_amount` = 0
12. **Verify Response:** `total_amount` = 1,180
13. Navigate to invoice detail page
14. **Verify UI:** CGST ₹90 and SGST ₹90 displayed
15. **Verify UI:** Total ₹1,180 displayed

#### Test 9.2: GST Calculation - Inter-state (IGST) - UI + BFF
**Steps:**
1. Create party from different state (inter-state)
2. Navigate to `/invoices/create`
3. Select inter-state party
4. Add item: Quantity 1, Price ₹1,000, Tax Rate 18%
5. **Verify UI:** Tax breakdown shows:
   - IGST: 18% = ₹180
   - CGST: Not shown or ₹0
   - SGST: Not shown or ₹0
   - Total: ₹1,180
6. Submit invoice
7. **Verify BFF API Call:** `POST /api/v1/invoices` called with `is_interstate: true`
8. **Verify Response:** Status 201
9. **Verify Response:** `igst_amount` = 180
10. **Verify Response:** `cgst_amount` = 0
11. **Verify Response:** `sgst_amount` = 0
12. **Verify Response:** `total_amount` = 1,180
13. Navigate to invoice detail page
14. **Verify UI:** IGST ₹180 displayed
15. **Verify UI:** Total ₹1,180 displayed

#### Test 9.3: Discount Calculation - UI + BFF
**Steps:**
1. Navigate to `/invoices/create`
2. Select customer and fill details
3. Add item:
   - Quantity: 10
   - Price: ₹100
   - Discount: 10%
   - Tax Rate: 18%
4. **Verify UI:** Calculations displayed:
   - Subtotal: 10 × 100 = ₹1,000
   - Discount Amount: 10% of ₹1,000 = ₹100
   - Taxable Amount: ₹1,000 - ₹100 = ₹900
   - Tax (18%): 18% of ₹900 = ₹162
   - Total: ₹900 + ₹162 = ₹1,062
5. Submit invoice
6. **Verify BFF API Call:** `POST /api/v1/invoices` called
7. **Verify Request Body:** Item contains `discount_percent: 10`
8. **Verify Response:** Status 201
9. **Verify Response:** `discount_amount` = 100 (or close with rounding)
10. **Verify Response:** `taxable_amount` = 900
11. **Verify Response:** Tax calculated on ₹900, not ₹1,000
12. **Verify Response:** `total_amount` = 1,062
13. Navigate to invoice detail page
14. **Verify UI:** Discount ₹100 displayed
15. **Verify UI:** Tax ₹162 displayed
16. **Verify UI:** Total ₹1,062 displayed

#### Test 9.4: Multiple Items Different Tax Rates - UI + BFF
**Steps:**
1. Navigate to `/invoices/create`
2. Select customer
3. Add Item 1:
   - Name: Product A
   - Quantity: 1
   - Price: ₹1,000
   - Tax: 18%
   - **Verify UI:** Item Tax = ₹180, Item Total = ₹1,180
4. Add Item 2:
   - Name: Product B
   - Quantity: 1
   - Price: ₹500
   - Tax: 5%
   - **Verify UI:** Item Tax = ₹25, Item Total = ₹525
5. Add Item 3:
   - Name: Product C
   - Quantity: 1
   - Price: ₹200
   - Tax: 0%
   - **Verify UI:** Item Tax = ₹0, Item Total = ₹200
6. **Verify UI:** Invoice totals:
   - Subtotal: ₹1,700 (1,000 + 500 + 200)
   - Total Tax: ₹205 (180 + 25 + 0)
   - Total: ₹1,905
7. Submit invoice
8. **Verify BFF API Call:** `POST /api/v1/invoices` called with 3 items
9. **Verify Response:** Status 201
10. **Verify Response:** `subtotal` = 1,700
11. **Verify Response:** `total_amount` = 1,905
12. **Verify Response:** Tax breakdown matches: CGST+SGST or IGST calculated per item
13. Navigate to invoice detail page
14. **Verify UI:** All 3 items displayed with correct taxes
15. **Verify UI:** Totals match: ₹1,905

#### Test 9.5: Party Balance Calculation - UI + BFF
**Steps:**
1. Create customer party with opening balance ₹1,000 (credit type)
2. Navigate to party ledger: `/parties/:id/ledger`
3. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` called
4. **Verify Response:** Status 200
5. **Verify Response:** `opening_balance` = 1,000
6. **Verify Response:** `opening_balance_type` = "credit"
7. **Verify Response:** `current_balance` = 1,000 (opening balance)
8. **Verify UI:** Opening balance ₹1,000 displayed
9. **Verify UI:** Current balance ₹1,000 displayed
10. Create sale invoice ₹10,000 with this party
11. Navigate to party ledger again
12. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` called
13. **Verify Response:** `current_balance` = 11,000 (1,000 + 10,000)
14. **Verify Response:** `entries` array contains invoice entry
15. **Verify UI:** Current balance updated to ₹11,000
16. **Verify UI:** Invoice entry in ledger shows credit ₹10,000
17. Record payment ₹5,000 against invoice
18. Navigate to party ledger again
19. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` called
20. **Verify Response:** `current_balance` = 6,000 (11,000 - 5,000)
21. **Verify Response:** `entries` array contains payment entry
22. **Verify UI:** Current balance updated to ₹6,000
23. **Verify UI:** Payment entry shows debit ₹5,000

#### Test 9.6: Invoice Totals Formula Verification - UI + BFF
**Steps:**
1. Create complex invoice:
   - Multiple items with different prices and tax rates
   - Some items with discounts
   - Mix of intra-state and inter-state (if applicable)
2. **Verify UI:** All calculations displayed correctly
3. Submit invoice
4. **Verify BFF API Call:** `POST /api/v1/invoices` called
5. **Verify Response:** Status 201
6. **Verify Response Formula:** `total_amount = taxable_amount + cgst_amount + sgst_amount + igst_amount + cess_amount`
7. Navigate to invoice detail page
8. **Verify UI:** Displayed total matches API `total_amount`
9. **Verify UI:** Breakdown matches API response:
   - Subtotal matches `subtotal`
   - Discount matches `discount_amount`
   - Tax breakdown matches `cgst_amount`, `sgst_amount`, `igst_amount`
   - Total matches `total_amount`

#### Test 9.7: Stock Adjustment Calculation - UI + BFF
**Steps:**
1. Create item with current stock = 100 (follow Test 4.1)
2. Navigate to item detail page
3. Note current stock: 100
4. Adjust stock: +50 (follow Test 4.6)
5. **Verify BFF API Call:** `POST /api/v1/stock/adjust` called with `adjustment: 50`
6. **Verify Response:** Status 200
7. **Verify Response:** Item `current_stock` = 150 (100 + 50)
8. **Verify UI:** Stock updated to 150
9. Adjust stock: -30
10. **Verify BFF API Call:** `POST /api/v1/stock/adjust` called with `adjustment: -30`
11. **Verify Response:** Item `current_stock` = 120 (150 - 30)
12. **Verify UI:** Stock updated to 120
13. View stock history
14. **Verify BFF API Call:** `GET /api/v1/stock/items/:itemId/history` called
15. **Verify Response:** Contains both adjustments
16. **Verify UI:** Both adjustments listed with correct amounts

#### Test 9.8: Rounding to 2 Decimals - UI + BFF
**Steps:**
1. Create invoice with amounts that result in more than 2 decimal places:
   - Quantity: 3
   - Price: ₹333.33
   - Tax: 18%
2. **Verify UI:** Calculations may show more decimals during entry
3. Submit invoice
4. **Verify BFF API Call:** `POST /api/v1/invoices` called
5. **Verify Response:** Status 201
6. **Verify Response:** All amount fields have maximum 2 decimal places:
   - `subtotal`: e.g., 999.99 (not 999.9900001)
   - `taxable_amount`: 2 decimals
   - `cgst_amount`: 2 decimals
   - `sgst_amount`: 2 decimals
   - `igst_amount`: 2 decimals
   - `total_amount`: 2 decimals
7. Navigate to invoice detail page
8. **Verify UI:** All displayed amounts have 2 decimal places

---

### 10-reports.spec.ts

#### Test 10.1: Reports Page Load - UI + BFF
**Steps:**
1. Navigate to `/reports` page
2. **Verify BFF API Calls:** `GET /api/v1/invoices`, `GET /api/v1/payments`, `GET /api/v1/parties`, `GET /api/v1/items` called
3. **Verify Response:** All APIs return Status 200
4. **Verify UI:** Reports page loads successfully
5. **Verify UI:** Report sections visible (Overview, Sales, Purchases, etc.)

#### Test 10.2: Report Types Available - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. **Verify UI:** Report type tabs or sections visible:
   - Sales Report
   - Purchase Report
   - Stock Report
   - Party Ledger Report
   - GST Report
3. Click on each report type tab
4. **Verify UI:** Report content changes based on selected type

#### Test 10.3: Date Range Selection - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. Locate date range selector
3. Select start date: `2024-01-01`
4. Select end date: `2024-12-31`
5. Click "Apply" or filter button
6. **Verify BFF API Calls:** APIs called with date range parameters (if supported)
7. **Verify UI:** Reports filtered by selected date range
8. **Verify UI:** Date range displayed on page

#### Test 10.4: Export Reports - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. Generate a report (select type and date range)
3. Click "Export" button
4. **Verify UI:** Export options available (PDF, Excel, CSV, JSON)
5. Select export format (e.g., PDF)
6. **Verify UI:** Export file downloads or opens
7. **Verify UI:** File contains report data
8. **Verify UI:** File format matches selected format

#### Test 10.5: Report Charts/Visualizations - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. **Verify UI:** Charts or graphs displayed (if implemented)
3. **Verify UI:** Chart shows data from API responses
4. **Verify UI:** Chart updates when date range changes
5. **Verify UI:** Chart is interactive (hover, click if implemented)

#### Test 10.6: GST Summary Report - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. Select "GST Report" or similar
3. **Verify BFF API Call:** `GET /api/v1/invoices` called
4. **Verify UI:** GST summary displayed:
   - Total Taxable Sales
   - Total Taxable Purchases
   - CGST Collected
   - SGST Collected
   - IGST Collected
   - Total GST Payable/Refundable
5. **Verify UI:** Calculations match API data

#### Test 10.7: Party Ledger Report - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. Select "Party Ledger Report"
3. Select party from dropdown
4. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` called
5. **Verify UI:** Ledger report displayed with:
   - Opening balance
   - All transactions
   - Closing balance
   - Date range filter applied

---

### 11-settings.spec.ts

#### Test 11.1: Settings Page Load - UI + BFF
**Steps:**
1. Navigate to `/settings` page
2. **Verify UI:** Settings page loads successfully
3. **Verify UI:** Settings sections visible:
   - Profile Settings
   - Business Settings
   - Theme/Appearance
   - Notifications
   - Preferences

#### Test 11.2: Profile Settings - UI + BFF
**Steps:**
1. Navigate to `/settings`
2. Click "Profile" section or tab
3. **Verify BFF API Call:** `GET /api/v1/users/profile` may be called
4. **Verify UI:** Profile form displayed with:
   - Name field
   - Email field
   - Phone field (read-only or editable)
   - Avatar upload option
5. Update name field
6. Click "Save" button
7. **Verify BFF API Call:** `PATCH /api/v1/users/profile` called
8. **Verify Request Body:** Contains updated name
9. **Verify Response:** Status 200, updated profile
10. **Verify UI:** Success toast displayed
11. **Verify UI:** Updated name displayed

#### Test 11.3: Business Settings - UI + BFF
**Steps:**
1. Navigate to `/settings`
2. Click "Business" section
3. **Verify BFF API Call:** `GET /api/v1/businesses/:id` called (to pre-fill)
4. **Verify UI:** Business form displayed with:
   - Business name
   - GSTIN
   - PAN
   - Address fields
   - Contact information
5. Update business name
6. Click "Save" button
7. **Verify BFF API Call:** `PATCH /api/v1/businesses/:id` called
8. **Verify Response:** Status 200, updated business
9. **Verify UI:** Success toast displayed

#### Test 11.4: Theme/Appearance Settings - UI + BFF
**Steps:**
1. Navigate to `/settings`
2. Click "Appearance" or "Theme" section
3. **Verify UI:** Theme options available (Light, Dark, System)
4. Select "Dark" theme
5. **Verify UI:** Theme changes immediately
6. **Verify Storage:** Theme preference stored in localStorage
7. Reload page
8. **Verify UI:** Dark theme persists

#### Test 11.5: Notification Settings - UI + BFF
**Steps:**
1. Navigate to `/settings`
2. Click "Notifications" section
3. **Verify UI:** Notification preferences displayed:
   - Email notifications toggle
   - SMS notifications toggle
   - Push notifications toggle
   - Notification types checkboxes
4. Toggle email notifications
5. **Verify Storage:** Preference saved (localStorage or API)
6. **Verify UI:** Toggle state persists

#### Test 11.6: Avatar Upload - UI + BFF
**Steps:**
1. Navigate to `/settings`
2. Click "Profile" section
3. Click "Upload Avatar" or avatar image
4. Select image file
5. **Verify BFF API Call:** `POST /api/v1/users/profile/avatar` called
6. **Verify Request:** Multipart form data with image file
7. **Verify Response:** Status 200, avatar URL returned
8. **Verify UI:** Avatar updated on page
9. **Verify UI:** Avatar updated in user menu

---

### 12-navigation.spec.ts

#### Test 12.1: Navigate to All Main Pages - UI + BFF
**Steps:**
1. Login successfully
2. Navigate to each main page:
   - `/dashboard`
   - `/parties`
   - `/inventory`
   - `/invoices`
   - `/payments`
   - `/reports`
   - `/settings`
3. **Verify UI:** Each page loads successfully
4. **Verify UI:** Page content displayed
5. **Verify BFF API Calls:** Appropriate APIs called for each page

#### Test 12.2: Sidebar Navigation - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. **Verify UI:** Sidebar visible
3. **Verify UI:** Navigation links visible:
   - Dashboard
   - Parties
   - Inventory
   - Invoices
   - Payments
   - Reports
   - Settings
4. Click "Parties" link in sidebar
5. **Verify UI:** Navigate to `/parties`
6. **Verify UI:** Active link highlighted in sidebar
7. Click "Invoices" link
8. **Verify UI:** Navigate to `/invoices`
9. **Verify UI:** Active link updates

#### Test 12.3: User Menu - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Locate user avatar or menu button
3. Click user menu
4. **Verify UI:** User menu dropdown opens
5. **Verify UI:** Menu options visible:
   - Profile
   - Settings
   - Logout
6. Click "Profile" option
7. **Verify UI:** Navigate to `/profile` or profile section
8. Click user menu again
9. Click "Settings" option
10. **Verify UI:** Navigate to `/settings`
11. Click user menu again
12. Click "Logout" option
13. **Verify UI:** Redirected to `/login`
14. **Verify Storage:** Tokens cleared from localStorage

#### Test 12.4: Page Transitions - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Note transition start time
3. Navigate to `/parties`
4. **Verify UI:** Page transition smooth (no flash, no blank screen)
5. **Verify UI:** Loading state shown (if transition takes time)
6. **Verify UI:** Page loads within acceptable time (< 3 seconds)
7. **Verify BFF API Calls:** APIs called during transition

#### Test 12.5: Mobile Responsiveness - UI + BFF
**Steps:**
1. Set viewport to mobile size (375x667)
2. Navigate to `/dashboard`
3. **Verify UI:** Page layout adapts to mobile
4. **Verify UI:** Sidebar collapses or becomes hamburger menu
5. **Verify UI:** Content readable and accessible
6. Click hamburger menu (if exists)
7. **Verify UI:** Navigation menu opens
8. Set viewport to tablet size (768x1024)
9. **Verify UI:** Layout adapts to tablet
10. Reset to desktop viewport

#### Test 12.6: Broken Links Check - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Find all links on page
3. Click each internal link (first 10)
4. **Verify UI:** Each link navigates successfully
5. **Verify UI:** No 404 errors
6. **Verify UI:** Page loads correctly

#### Test 12.7: No Console Errors - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Open browser console
3. **Verify UI:** No critical console errors
4. Navigate to other pages
5. **Verify UI:** No console errors on any page
6. **Verify UI:** Only acceptable warnings (if any)

#### Test 12.8: No API Errors on Pages - UI + BFF
**Steps:**
1. Navigate to each main page:
   - `/dashboard`
   - `/parties`
   - `/inventory`
   - `/invoices`
   - `/payments`
2. **Verify BFF API Calls:** All APIs return Status 200
3. **Verify UI:** No error toasts displayed
4. **Verify UI:** Data loads successfully

#### Test 12.9: Back Button Navigation - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Navigate to `/parties`
3. Navigate to `/parties/:id` (party detail)
4. Click browser back button
5. **Verify UI:** Navigate back to `/parties`
6. Click browser back button again
7. **Verify UI:** Navigate back to `/dashboard`
8. Click browser forward button
9. **Verify UI:** Navigate forward to `/parties`

#### Test 12.10: Deep Linking - UI + BFF
**Steps:**
1. Navigate directly to `/invoices/:id` (use known invoice ID)
2. **Verify UI:** Invoice detail page loads
3. **Verify BFF API Call:** `GET /api/v1/invoices/:id` called
4. **Verify UI:** Invoice details displayed
5. Navigate directly to `/parties/:id/ledger`
6. **Verify UI:** Party ledger page loads
7. **Verify BFF API Call:** `GET /api/v1/parties/:id/ledger` called

---

### 13-edge-cases.spec.ts

#### Test 13.1: Empty States - UI + BFF
**Steps:**
1. Navigate to `/parties` (with no parties)
2. **Verify UI:** Empty state message displayed
3. **Verify UI:** "Add Party" button visible
4. **Verify UI:** No error messages
5. Navigate to `/inventory` (with no items)
6. **Verify UI:** Empty state message displayed
7. **Verify UI:** "Add Item" button visible
8. Navigate to `/invoices` (with no invoices)
9. **Verify UI:** Empty state message displayed
10. **Verify UI:** "Create Invoice" button visible

#### Test 13.2: Invalid Routes - UI + BFF
**Steps:**
1. Navigate to `/nonexistent-page-xyz-12345`
2. **Verify UI:** 404 page displayed OR redirected to dashboard/login
3. **Verify UI:** Error message or redirect handled gracefully
4. Navigate to `/parties/invalid-id-12345`
5. **Verify BFF API Call:** `GET /api/v1/parties/invalid-id-12345` called
6. **Verify Response:** Status 404
7. **Verify UI:** Error message displayed: "Party not found"

#### Test 13.3: Session Persistence After Reload - UI + BFF
**Steps:**
1. Login successfully
2. Navigate to `/dashboard`
3. Reload page (F5 or browser reload)
4. **Verify UI:** Still authenticated (not redirected to login)
5. **Verify UI:** Dashboard loads successfully
6. **Verify BFF API Calls:** APIs called with authentication token
7. **Verify Storage:** Tokens still in localStorage

#### Test 13.4: Page Refresh Maintains State - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Fill search box with "Test"
3. Reload page
4. **Verify UI:** Still on `/parties` page
5. **Verify UI:** Search may reset (expected behavior) OR search preserved
6. Navigate to `/invoices/:id` (invoice detail)
7. Reload page
8. **Verify UI:** Still on invoice detail page
9. **Verify BFF API Call:** `GET /api/v1/invoices/:id` called again

#### Test 13.5: API Error Handling - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Simulate API error (network offline or invalid endpoint)
3. **Verify UI:** Error toast displayed
4. **Verify UI:** Error message user-friendly
5. **Verify UI:** Page doesn't crash
6. **Verify UI:** Retry option available (if implemented)
7. Restore network
8. **Verify UI:** Data loads successfully

#### Test 13.6: Data Loading States - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. **Verify UI:** Loading skeleton or spinner displayed while data loads
3. **Verify UI:** Loading state clears when data arrives
4. Navigate to `/parties`
5. **Verify UI:** Loading state shown during API call
6. **Verify UI:** List appears when data loaded

#### Test 13.7: Navigation History - UI + BFF
**Steps:**
1. Navigate: Dashboard → Parties → Inventory → Invoices
2. Click browser back button
3. **Verify UI:** Navigate to Inventory
4. Click browser back button
5. **Verify UI:** Navigate to Parties
6. Click browser forward button
7. **Verify UI:** Navigate to Inventory
8. **Verify UI:** Each page loads correctly

#### Test 13.8: Form Reset on Dialog Close - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party" button
3. Fill form fields: Name, Phone, Email
4. Close dialog (click X or press Escape)
5. Click "Add Party" button again
6. **Verify UI:** Form is empty (reset)
7. **Verify UI:** Previous values not preserved

#### Test 13.9: Loading States Displayed - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Throttle network (slow 3G simulation)
3. **Verify UI:** Loading spinner or skeleton displayed
4. **Verify UI:** Buttons disabled during loading
5. **Verify UI:** Loading state clears when data arrives
6. Remove throttling

#### Test 13.10: Special Characters in Search - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Type in search: `<script>alert(1)</script>`
3. **Verify UI:** No script execution
4. **Verify UI:** Page doesn't crash
5. **Verify BFF API Call:** `GET /api/v1/parties?search=<script>alert(1)</script>` called
6. **Verify Response:** Handled safely (no errors)
7. Type special characters: `@#$%^&*()`
8. **Verify UI:** Search works correctly
9. **Verify BFF API Call:** Special characters handled in query

#### Test 13.11: Very Long Text Fields - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Fill name field with 500+ characters
4. Submit form
5. **Verify BFF API Call:** `POST /api/v1/parties` called
6. **Verify Response:** Status 400 (validation error) OR Status 201 (if allowed)
7. **Verify UI:** Error message displayed if validation fails
8. **Verify UI:** Text truncated or scrollable if accepted

#### Test 13.12: Concurrent Operations - UI + BFF
**Steps:**
1. Navigate to `/parties` in browser tab 1
2. Create party in tab 1
3. Navigate to `/parties` in browser tab 2
4. Refresh tab 2
5. **Verify UI:** New party appears in tab 2
6. Update party in tab 1
7. Refresh tab 2
8. **Verify UI:** Updated party data shown in tab 2

---

### 14-export-pdf.spec.ts

#### Test 14.1: Dashboard Export Report PDF - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. **Verify UI:** "Export Report" button visible
3. Click "Export Report" button
4. **Verify UI:** PDF generation starts
5. **Verify UI:** PDF downloads or opens
6. **Verify UI:** PDF contains:
   - Dashboard stats (Total Sales, Outstanding, etc.)
   - Recent invoices list
   - Date/time of report
   - Business information
7. **Verify BFF API Calls:** `GET /api/v1/invoices`, `GET /api/v1/payments` called (for data)

#### Test 14.2: Invoice PDF Download - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id` (invoice detail page)
2. **Verify UI:** "Download PDF" or "PDF" button visible
3. Click "PDF" button
4. **Verify UI:** PDF generation starts
5. **Verify UI:** PDF downloads
6. **Verify UI:** PDF contains:
   - Invoice number
   - Party details
   - Invoice items with quantities and prices
   - Tax breakdown (CGST, SGST, IGST)
   - Totals
   - Invoice date and due date
7. **Verify BFF API Call:** `GET /api/v1/invoices/:id` called (for invoice data)

#### Test 14.3: Invoice Print - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id`
2. **Verify UI:** "Print" button visible
3. Click "Print" button
4. **Verify UI:** Print dialog opens OR print preview shown
5. **Verify UI:** Print layout formatted correctly
6. Cancel print dialog

#### Test 14.4: Export Parties to Excel - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. **Verify UI:** "Export Excel" button visible
3. Click "Export Excel" button
4. **Verify UI:** Excel file downloads
5. **Verify UI:** File name contains "parties" or "customers"
6. **Verify BFF API Call:** `GET /api/v1/parties` called (for data)
7. Open Excel file
8. **Verify UI:** Excel contains:
   - All party columns (Name, Phone, Email, Address, etc.)
   - All parties from list
   - Proper formatting

#### Test 14.5: Export Inventory to Excel - UI + BFF
**Steps:**
1. Navigate to `/inventory`
2. Click "Export Excel" button
3. **Verify UI:** Excel file downloads
4. **Verify BFF API Call:** `GET /api/v1/items` called
5. **Verify UI:** Excel contains:
   - Item name, SKU, HSN
   - Prices (selling, purchase)
   - Stock levels
   - All items from list

#### Test 14.6: Export Invoices to Excel - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Click "Export Excel" button
3. **Verify UI:** Excel file downloads
4. **Verify BFF API Call:** `GET /api/v1/invoices` called
5. **Verify UI:** Excel contains:
   - Invoice number, date, party name
   - Totals, status
   - All invoices from list

#### Test 14.7: Export Payments to Excel - UI + BFF
**Steps:**
1. Navigate to `/payments`
2. Click "Export Excel" button
3. **Verify UI:** Excel file downloads
4. **Verify BFF API Call:** `GET /api/v1/payments` called
5. **Verify UI:** Excel contains:
   - Payment date, amount, mode
   - Party name, invoice number
   - All payments from list

#### Test 14.8: Reports Export - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. Select report type and date range
3. Click "Export" button
4. **Verify UI:** Export options available (PDF, Excel, CSV, JSON)
5. Select "Excel" format
6. **Verify UI:** Excel file downloads
7. **Verify UI:** File contains report data
8. Select "PDF" format
9. **Verify UI:** PDF downloads
10. **Verify UI:** PDF contains formatted report

---

### 15-pagination.spec.ts

#### Test 15.1: Invoice List Pagination - UI + BFF
**Steps:**
1. Create 25+ invoices (via API or UI)
2. Navigate to `/invoices`
3. **Verify BFF API Call:** `GET /api/v1/invoices?page=1&limit=20` called
4. **Verify Response:** Contains `total`, `page`, `limit` fields
5. **Verify UI:** Pagination controls visible:
   - Page numbers or "Next" button
   - Current page indicator
   - Total pages indicator
6. Click "Next" page or page 2
7. **Verify BFF API Call:** `GET /api/v1/invoices?page=2&limit=20` called
8. **Verify UI:** Page 2 invoices displayed
9. Click "Previous" button
10. **Verify UI:** Page 1 invoices displayed

#### Test 15.2: Payment List Pagination - UI + BFF
**Steps:**
1. Create 25+ payments
2. Navigate to `/payments`
3. **Verify BFF API Call:** `GET /api/v1/payments?page=1&limit=20` called
4. **Verify UI:** Pagination controls visible
5. Navigate through pages
6. **Verify BFF API Calls:** Correct page numbers in query params
7. **Verify UI:** Correct data displayed for each page

#### Test 15.3: Change Page Size - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. Locate page size selector (if exists)
3. Change page size from 20 to 50
4. **Verify BFF API Call:** `GET /api/v1/invoices?page=1&limit=50` called
5. **Verify UI:** 50 items displayed per page
6. **Verify UI:** Total pages recalculated

---

### 16-profile.spec.ts

#### Test 16.1: Profile Page Load - UI + BFF
**Steps:**
1. Navigate to `/profile` page (if exists)
2. **Verify BFF API Call:** `GET /api/v1/users/profile` called
3. **Verify Response:** Status 200, user profile data
4. **Verify UI:** Profile page loads
5. **Verify UI:** User information displayed:
   - Name
   - Email
   - Phone
   - Avatar

#### Test 16.2: Update Profile - UI + BFF
**Steps:**
1. Navigate to `/profile`
2. Update name field
3. Click "Save" button
4. **Verify BFF API Call:** `PATCH /api/v1/users/profile` called
5. **Verify Response:** Status 200, updated profile
6. **Verify UI:** Success toast displayed
7. **Verify UI:** Updated name displayed

---

## Test Execution Summary

### Single Command
```bash
npm run test:headed -- ui-bff-tests/
```

### Coverage Summary
- **23 Test Files**
- **~380 Test Cases** covering all UI workflows and BFF API verification
- **34 API Endpoints** (100% coverage)
- **27 UI Pages** (100% coverage)
- **33 UI Components** (100% coverage)
- **15 Production Readiness Phases** (mandatory checks)
- **100% DTO Field Coverage** (All mandatory and optional fields tested)
- **100% BFF Endpoint Coverage** (all endpoints used by UI)
- **100% UI Workflow Coverage** (all user journeys)
- **100% Page Coverage** (All pages tested: Dashboard, Parties, Inventory, Invoices, Payments, Reports, Settings, Help, Profile, Stock, New/Edit pages, Detail pages)
- **100% Component Coverage** (Sidebar, BottomNav, CommandMenu, Dialogs, Forms, Badges, etc.)
- **Request/Response Alignment** (Headers, Query Params, Field Names, Response Structures verified)
- **UI Text & Messages** (All toast messages, labels, placeholders, error messages, empty states, loading messages - 100% coverage)
- **Format Verification** (Dates, Currency, Numbers, Phone, Email, GSTIN, PAN, Pincode - 100% consistency)
- **Real Authentication** (no mocks, actual login flow)
- **Session Management** (View sessions, logout specific session, logout all sessions)
- **Advanced Filters** (Party, Payment Status, Date Range, Transaction Type, Category)
- **Status Transitions** (Invoice status, Payment status)
- **Export & PDF Functionality** (Excel, PDF, CSV, JSON exports)
- **Reports Module** (All report types: Overview, Sales, Purchases, Parties, Stock, GST)
- **Settings Module** (Profile, Business, Theme, Notifications)
- **Navigation & Edge Cases** (All navigation flows, error handling)
- **Pagination** (List pagination for all modules)
- **UI Components** (Sidebar collapse/expand, BottomNav, CommandMenu, Empty states, Loading skeletons, Error boundaries, Toasts, Badges, Dropdowns, Dialogs)
- **Page Features** (Module cards, Phone calls, Print, Export buttons, Create buttons from detail pages)
- **Detail Pages** (Party detail with invoices/payments, Item detail with stock/margin, Payment detail with links)

### Key Features
1. **UI + BFF Verification:** Each test verifies both UI interaction and BFF API calls
2. **Real Authentication:** Uses actual phone number and OTP verification
3. **Business Logic Verification:** Tests calculations match expected formulas
4. **Cross-Module Integration:** Tests relationships between modules
5. **Error Handling:** Tests validation errors and error responses
6. **Single Command Execution:** All tests run with one command

---

## Notes

1. **Authentication:** All tests use real login flow with phone `9876543210` and OTP extraction from toast or default `129012`
2. **Test Data:** Use timestamp-based unique data (`Date.now()`) to avoid conflicts
3. **API Tracking:** Use `ApiTracker` class to capture and verify all BFF API calls
4. **Verification:** Each test verifies:
   - UI interaction (click, fill, submit)
   - BFF API call (method, URL, request body, headers)
   - BFF API response (status, response body structure)
   - UI update (toast, list refresh, data display)
5. **Business Logic:** Verify calculations match expected formulas through both UI display and BFF API responses

---

### 17-ui-components.spec.ts

#### Test 17.1: Sidebar Navigation - Collapse/Expand - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. **Verify UI:** Sidebar visible and expanded
3. Click collapse button (chevron left/right)
4. **Verify UI:** Sidebar collapses to icon-only mode
5. **Verify UI:** Tooltips appear on hover for collapsed icons
6. Click expand button
7. **Verify UI:** Sidebar expands to full width
8. **Verify UI:** Full labels visible

#### Test 17.2: Sidebar Logout Button - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Scroll to bottom of sidebar
3. **Verify UI:** Logout button visible
4. Click "Logout" button
5. **Verify UI:** User logged out
6. **Verify UI:** Redirected to `/login`
7. **Verify Storage:** Tokens cleared from localStorage

#### Test 17.3: Mobile Sidebar - UI + BFF
**Steps:**
1. Set viewport to mobile size (375x667)
2. Navigate to `/dashboard`
3. **Verify UI:** Mobile sidebar trigger (hamburger menu) visible
4. Click hamburger menu
5. **Verify UI:** Mobile sidebar sheet opens
6. **Verify UI:** Navigation links visible
7. Click a navigation link
8. **Verify UI:** Navigate to selected page
9. **Verify UI:** Sidebar closes automatically

#### Test 17.4: Bottom Navigation - Mobile - UI + BFF
**Steps:**
1. Set viewport to mobile size (375x667)
2. Navigate to `/dashboard`
3. **Verify UI:** Bottom navigation bar visible
4. **Verify UI:** Navigation icons visible (Home, Invoices, Parties, Items, Payments)
5. Click "Invoices" icon
6. **Verify UI:** Navigate to `/invoices`
7. **Verify UI:** Active icon highlighted
8. Click "Parties" icon
9. **Verify UI:** Navigate to `/parties`

#### Test 17.5: Bottom Navigation Quick Actions FAB - UI + BFF
**Steps:**
1. Set viewport to mobile size (375x667)
2. Navigate to `/dashboard`
3. **Verify UI:** Floating Action Button (FAB) visible in bottom nav
4. Click FAB (Plus icon)
5. **Verify UI:** Quick actions sheet opens from bottom
6. **Verify UI:** Quick actions visible:
   - New Invoice
   - Add Party
   - Add Item
   - Record Payment
7. Click "New Invoice"
8. **Verify UI:** Navigate to `/invoices/create`
9. **Verify UI:** Sheet closes automatically
10. Navigate back and test other quick actions

#### Test 17.6: Command Menu (Keyboard Shortcuts) - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) to open command menu
3. **Verify UI:** Command dialog opens
4. **Verify UI:** Search input focused
5. Type "invoice"
6. **Verify UI:** "Create Invoice" and "Invoices" options visible
7. Select "Create Invoice" (Enter or click)
8. **Verify UI:** Navigate to `/invoices/create`
9. Open command menu again
10. Type "party"
11. **Verify UI:** "Add Party" and "Parties" options visible
12. Select "Add Party"
13. **Verify UI:** Navigate to `/parties/new`
14. Test keyboard shortcuts:
    - `Cmd+D` → Navigate to Dashboard
    - `Cmd+I` → Navigate to Invoices
    - `Cmd+P` → Navigate to Parties
    - `Cmd+,` → Navigate to Settings

#### Test 17.7: Empty State Component - UI + BFF
**Steps:**
1. Navigate to `/parties` (with no parties)
2. **Verify UI:** Empty state component displayed
3. **Verify UI:** Empty state shows:
   - Icon or illustration
   - Message: "No parties found" or similar
   - "Add Party" button
4. Click "Add Party" button
5. **Verify UI:** Navigate to create party form
6. Test empty states for:
   - `/inventory` (no items)
   - `/invoices` (no invoices)
   - `/payments` (no payments)

#### Test 17.8: Loading Skeleton Components - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Throttle network (slow 3G)
3. **Verify UI:** Loading skeletons displayed:
   - Card skeletons for stats
   - List item skeletons for lists
4. **Verify UI:** Skeletons match content layout
5. Remove throttling
6. **Verify UI:** Skeletons replaced with actual content

#### Test 17.9: Error Boundary Component - UI + BFF
**Steps:**
1. Navigate to any page
2. Simulate error (if possible via dev tools)
3. **Verify UI:** Error boundary displays error message
4. **Verify UI:** "Retry" or "Go Home" button visible
5. Click "Go Home" button
6. **Verify UI:** Navigate to `/dashboard`

#### Test 17.10: Toast Notifications - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Create party successfully
3. **Verify UI:** Success toast appears
4. **Verify UI:** Toast shows success message
5. **Verify UI:** Toast auto-dismisses after timeout
6. Try to create duplicate party
7. **Verify UI:** Error toast appears
8. **Verify UI:** Toast shows error message

#### Test 17.11: Status Badge Component - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. **Verify UI:** Status badges displayed on invoice cards:
   - Pending (orange/yellow)
   - Paid (green)
   - Overdue (red)
3. Navigate to `/parties`
4. **Verify UI:** Type badges displayed:
   - Customer (blue/green)
   - Supplier (orange/yellow)
5. Navigate to `/inventory`
6. **Verify UI:** Low stock badge displayed (red) for low stock items

#### Test 17.12: Dropdown Menu Component - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click dropdown menu (three dots) on party card
3. **Verify UI:** Dropdown menu opens
4. **Verify UI:** Menu options visible:
   - View
   - Edit
   - Call (if phone exists)
   - Delete
5. Click outside dropdown
6. **Verify UI:** Dropdown closes
7. Click dropdown again
8. Click "View"
9. **Verify UI:** Navigate to party detail page

#### Test 17.13: Dialog Component - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party" button
3. **Verify UI:** Dialog opens
4. **Verify UI:** Dialog shows:
   - Title: "Add Party" or similar
   - Form fields
   - Cancel button
   - Submit button
5. Click "Cancel" button
6. **Verify UI:** Dialog closes
7. **Verify UI:** Form resets
8. Open dialog again
9. Press Escape key
10. **Verify UI:** Dialog closes

#### Test 17.14: Form Validation Display - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party"
3. Leave name field empty
4. Click "Submit"
5. **Verify UI:** Error message displayed near name field
6. **Verify UI:** Error message in red
7. Fill name field
8. **Verify UI:** Error message disappears
9. Fill invalid phone format (e.g., 9 digits)
10. Click "Submit"
11. **Verify UI:** Phone validation error displayed

#### Test 17.15: Table Component (if used) - UI + BFF
**Steps:**
1. Navigate to page with table (if exists)
2. **Verify UI:** Table displays data correctly
3. **Verify UI:** Column headers visible
4. **Verify UI:** Rows sortable (if implemented)
5. **Verify UI:** Pagination works (if implemented)

---

### 18-dedicated-pages.spec.ts

#### Test 18.1: Stock Adjustment Page - UI + BFF
**Steps:**
1. Navigate to `/inventory/stock` page
2. **Verify UI:** Stock adjustment page loads
3. **Verify UI:** Page header shows "Stock Adjustment"
4. **Verify UI:** "Back" button visible (links to `/inventory`)
5. **Verify UI:** "Adjust Stock" button visible
6. **Verify BFF API Call:** `GET /api/v1/items` is called
7. **Verify UI:** Items list displayed with current stock
8. Click "Adjust Stock" button
9. **Verify UI:** Stock adjustment dialog opens
10. Select item from dropdown
11. **Verify UI:** Current stock displayed for selected item
12. Select adjustment type: "Increase" or "Decrease"
13. Fill quantity: `50`
14. Fill reason: `Purchase from supplier`
15. Click "Adjust Stock" button
16. **Verify BFF API Call:** `POST /api/v1/stock/adjust` is called
17. **Verify Request Body:** Contains `item_id`, `adjustment_type`, `quantity`, `reason`
18. **Verify Response:** Status 200, stock adjusted
19. **Verify UI:** Success toast displayed
20. **Verify UI:** Dialog closes
21. **Verify BFF API Call:** `GET /api/v1/items` called again (refresh)
22. **Verify UI:** Updated stock displayed in items list

#### Test 18.2: Home Page Redirect Logic - UI + BFF
**Steps:**
1. Navigate to `/` (root)
2. **Verify UI:** Loading spinner displayed
3. If not authenticated:
   - **Verify UI:** Redirected to `/login`
4. If authenticated but no business selected:
   - **Verify UI:** Redirected to `/business/select`
5. If authenticated and business selected:
   - **Verify UI:** Redirected to `/dashboard`
6. **Verify UI:** No flash of content, smooth redirect

#### Test 18.3: Help Page - UI + BFF
**Steps:**
1. Navigate to `/help` page
2. **Verify UI:** Help page loads
3. **Verify UI:** Page title: "Help & Support"
4. **Verify UI:** Help resources section visible:
   - Documentation
   - Video Tutorials
   - FAQs
5. **Verify UI:** Contact options visible:
   - Email Support
   - Phone Support
   - Live Chat
6. Click on FAQ item
7. **Verify UI:** FAQ expands to show answer
8. Click on help resource card
9. **Verify UI:** Resource opens (if link exists) or shows message

#### Test 18.4: Party Detail Page - Complete Features - UI + BFF
**Steps:**
1. Navigate to `/parties/:id` (party detail page)
2. **Verify BFF API Call:** `GET /api/v1/parties/:id` is called
3. **Verify BFF API Call:** `GET /api/v1/invoices?partyId=:id` is called
4. **Verify BFF API Call:** `GET /api/v1/payments?partyId=:id` is called
5. **Verify UI:** Party name displayed as heading
6. **Verify UI:** Party type badge displayed
7. **Verify UI:** Stats cards displayed:
   - Total Invoiced
   - Total Paid
   - Balance (Receivable/Payable)
   - Invoice Count
8. **Verify UI:** Contact information card:
   - GSTIN (if exists)
   - Phone (if exists)
   - Email (if exists)
   - Address (if exists)
9. **Verify UI:** Account summary card:
   - Opening Balance
   - Total Invoiced
   - Total Paid
   - Current Balance
10. **Verify UI:** Recent Invoices section:
    - List of invoices for party
    - "Create Invoice" button
11. Click "Create Invoice" button
12. **Verify UI:** Navigate to `/invoices/create?party_id=:id`
13. **Verify UI:** Party pre-selected in invoice form
14. Navigate back to party detail
15. Click on invoice in list
16. **Verify UI:** Navigate to invoice detail page
17. Click "Edit" button
18. **Verify UI:** Navigate to `/parties/:id/edit`

#### Test 18.5: Item Detail Page - Complete Features - UI + BFF
**Steps:**
1. Navigate to `/inventory/:id` (item detail page)
2. **Verify BFF API Call:** `GET /api/v1/items/:id` is called
3. **Verify UI:** Item name displayed as heading
4. **Verify UI:** SKU badge displayed (if exists)
5. **Verify UI:** Category badge displayed (if exists)
6. **Verify UI:** Low stock badge displayed (if stock <= threshold)
7. **Verify UI:** Stats cards displayed:
   - Current Stock (with low stock warning if applicable)
   - Stock Value (stock × purchase price)
   - Selling Price
   - Margin (percentage)
8. **Verify UI:** Product Information card:
   - HSN Code
   - SKU
   - Category
   - Unit
   - Description (if exists)
9. **Verify UI:** Pricing & Stock card:
   - Purchase Price
   - Selling Price
   - Profit Margin (amount and percentage)
   - GST Rate
   - Low Stock Alert threshold
10. **Verify UI:** Recent Stock Movement section (if implemented)
11. Click "Edit" button
12. **Verify UI:** Navigate to `/inventory/:id/edit`
13. Click "Back" button
14. **Verify UI:** Navigate back to `/inventory`

#### Test 18.6: Payment Detail Page - Complete Features - UI + BFF
**Steps:**
1. Navigate to `/payments/:id` (payment detail page)
2. **Verify BFF API Call:** `GET /api/v1/payments/:id` is called
3. **Verify BFF API Call:** `GET /api/v1/parties/:partyId` called (if party_id exists)
4. **Verify BFF API Call:** `GET /api/v1/invoices/:invoiceId` called (if invoice_id exists)
5. **Verify UI:** Payment amount displayed prominently
6. **Verify UI:** Payment type badge (Payment In/Payment Out)
7. **Verify UI:** Payment Information card:
   - Payment Date
   - Payment Mode
   - Reference Number (if exists)
   - Notes (if exists)
8. **Verify UI:** Related Information card:
   - Party link (clickable, navigates to party detail)
   - Invoice link (clickable, navigates to invoice detail)
9. Click on party link
10. **Verify UI:** Navigate to `/parties/:partyId`
11. Navigate back to payment detail
12. Click on invoice link
13. **Verify UI:** Navigate to `/invoices/:invoiceId`
14. **Verify UI:** Transaction Summary section:
    - Payment Amount
    - Payment Type
    - Status
    - Created timestamp

#### Test 18.7: New Party Page (Dedicated) - UI + BFF
**Steps:**
1. Navigate to `/parties/new` page
2. **Verify UI:** New party page loads
3. **Verify UI:** Page header shows "Add Party" or "New Party"
4. **Verify UI:** Form fields visible (all party fields)
5. Fill form and submit
6. **Verify BFF API Call:** `POST /api/v1/parties` is called
7. **Verify Response:** Status 201
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Redirected to `/parties` or `/parties/:id`

#### Test 18.8: New Item Page (Dedicated) - UI + BFF
**Steps:**
1. Navigate to `/inventory/new` page
2. **Verify UI:** New item page loads
3. **Verify UI:** Page header shows "Add Item" or "New Item"
4. Fill form and submit
5. **Verify BFF API Call:** `POST /api/v1/items` is called
6. **Verify Response:** Status 201
7. **Verify UI:** Success toast displayed
8. **Verify UI:** Redirected to `/inventory` or `/inventory/:id`

#### Test 18.9: New Payment Page (Dedicated) - UI + BFF
**Steps:**
1. Navigate to `/payments/new` page
2. **Verify UI:** New payment page loads
3. **Verify UI:** Page header shows "Record Payment" or "New Payment"
4. **Verify BFF API Call:** `GET /api/v1/parties` called (for dropdown)
5. **Verify BFF API Call:** `GET /api/v1/invoices` called (for dropdown)
6. Select party from dropdown
7. **Verify UI:** Invoices for selected party filtered
8. Fill form and submit
9. **Verify BFF API Call:** `POST /api/v1/payments` is called
10. **Verify Response:** Status 201
11. **Verify UI:** Success toast displayed
12. **Verify UI:** Redirected to `/payments` or `/payments/:id`

#### Test 18.10: Edit Party Page - UI + BFF
**Steps:**
1. Navigate to `/parties/:id/edit` page
2. **Verify BFF API Call:** `GET /api/v1/parties/:id` called (to pre-fill)
3. **Verify UI:** Form pre-filled with party data
4. Update fields
5. Click "Save" button
6. **Verify BFF API Call:** `PATCH /api/v1/parties/:id` called
7. **Verify Response:** Status 200, updated party
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Redirected to `/parties/:id` or `/parties`

#### Test 18.11: Edit Item Page - UI + BFF
**Steps:**
1. Navigate to `/inventory/:id/edit` page
2. **Verify BFF API Call:** `GET /api/v1/items/:id` called (to pre-fill)
3. **Verify UI:** Form pre-filled with item data
4. Update fields
5. Click "Save" button
6. **Verify BFF API Call:** `PATCH /api/v1/items/:id` called
7. **Verify Response:** Status 200, updated item
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Redirected to `/inventory/:id` or `/inventory`

#### Test 18.12: Edit Invoice Page - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id/edit` page
2. **Verify BFF API Call:** `GET /api/v1/invoices/:id` called (to pre-fill)
3. **Verify UI:** Form pre-filled with invoice data
4. Update fields (date, items, etc.)
5. Click "Save" button
6. **Verify BFF API Call:** `PATCH /api/v1/invoices/:id` called
7. **Verify Response:** Status 200, updated invoice
8. **Verify UI:** Success toast displayed
9. **Verify UI:** Redirected to `/invoices/:id` or `/invoices`

---

### 19-page-features.spec.ts

#### Test 19.1: Dashboard Module Cards Navigation - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. **Verify UI:** Module cards displayed:
   - Parties
   - Inventory
   - Invoices
   - Payments
   - Reports
   - Business
3. Click "Parties" card
4. **Verify UI:** Navigate to `/parties`
5. Navigate back to dashboard
6. Click "Inventory" card
7. **Verify UI:** Navigate to `/inventory`
8. Test all module cards

#### Test 19.2: Dashboard Logout Button - UI + BFF
**Steps:**
1. Navigate to `/dashboard`
2. Locate logout button (if exists in header)
3. Click logout button
4. **Verify UI:** User logged out
5. **Verify UI:** Redirected to `/login`
6. **Verify Storage:** Tokens cleared

#### Test 19.3: Parties Page - Phone Call Functionality - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. Click dropdown menu on party card with phone number
3. Click "Call" option
4. **Verify UI:** Phone dialer opens (`tel:` link)
5. **Verify UI:** Phone number correctly formatted
6. **Verify UI:** On mobile, native dialer opens

#### Test 19.4: Parties Page - Export Excel Button - UI + BFF
**Steps:**
1. Navigate to `/parties`
2. **Verify UI:** "Export Excel" button visible
3. Click "Export Excel" button
4. **Verify UI:** Excel file downloads
5. **Verify UI:** File name contains "parties" or timestamp
6. Open Excel file
7. **Verify UI:** All parties exported with correct columns

#### Test 19.5: Invoices Page - Filter by Status - UI + BFF
**Steps:**
1. Navigate to `/invoices`
2. **Verify UI:** Status filter dropdown visible
3. Select "Pending" status
4. **Verify BFF API Call:** `GET /api/v1/invoices?status=pending` called
5. **Verify UI:** Only pending invoices displayed
6. Select "Paid" status
7. **Verify BFF API Call:** `GET /api/v1/invoices?status=paid` called
8. **Verify UI:** Only paid invoices displayed

#### Test 19.6: Invoice Detail Page - Print Button - UI + BFF
**Steps:**
1. Navigate to `/invoices/:id`
2. **Verify UI:** "Print" button visible
3. Click "Print" button
4. **Verify UI:** Print dialog opens OR print preview shown
5. **Verify UI:** Invoice formatted for printing
6. Cancel print dialog

#### Test 19.7: Reports Page - Report Tabs - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. **Verify UI:** Report tabs visible:
   - Overview
   - Sales
   - Purchases
   - Parties
   - Stock
   - GST
3. Click "Sales" tab
4. **Verify UI:** Sales report content displayed
5. **Verify BFF API Call:** `GET /api/v1/invoices` called (for sales data)
6. Click "GST" tab
7. **Verify UI:** GST report content displayed
8. **Verify UI:** GST summary calculations displayed

#### Test 19.8: Reports Page - Export JSON - UI + BFF
**Steps:**
1. Navigate to `/reports`
2. Select a report type
3. Click "Export JSON" button (if exists)
4. **Verify UI:** JSON file downloads
5. **Verify UI:** File contains report data in JSON format

#### Test 19.9: Party Detail - Create Invoice Button - UI + BFF
**Steps:**
1. Navigate to `/parties/:id`
2. Scroll to "Recent Invoices" section
3. **Verify UI:** "Create Invoice" button visible
4. Click "Create Invoice" button
5. **Verify UI:** Navigate to `/invoices/create?party_id=:id`
6. **Verify UI:** Party pre-selected in invoice form
7. **Verify BFF API Call:** `GET /api/v1/parties/:id` called (to verify party)

#### Test 19.10: Party Detail - View Invoices List - UI + BFF
**Steps:**
1. Navigate to `/parties/:id`
2. **Verify BFF API Call:** `GET /api/v1/invoices?partyId=:id` called
3. **Verify UI:** Invoices list displayed
4. **Verify UI:** Each invoice shows:
   - Invoice number
   - Date
   - Amount
   - Status
5. Click on an invoice
6. **Verify UI:** Navigate to `/invoices/:invoiceId`

#### Test 19.11: Party Detail - Balance Calculations - UI + BFF
**Steps:**
1. Navigate to `/parties/:id`
2. **Verify BFF API Calls:** 
   - `GET /api/v1/invoices?partyId=:id`
   - `GET /api/v1/payments?partyId=:id`
3. **Verify UI:** Balance calculations displayed:
   - Total Invoiced = Sum of invoice amounts
   - Total Paid = Sum of payment amounts
   - Balance = Total Invoiced - Total Paid
4. **Verify UI:** Balance shows "To Receive" if positive, "To Pay" if negative
5. Create new invoice for party
6. Navigate back to party detail
7. **Verify UI:** Balance updated correctly

#### Test 19.12: Item Detail - Stock Value Calculation - UI + BFF
**Steps:**
1. Navigate to `/inventory/:id`
2. **Verify UI:** Stock Value card displayed
3. **Verify Calculation:** Stock Value = Current Stock × Purchase Price
4. **Verify UI:** Value displayed correctly
5. Adjust stock (increase/decrease)
6. Navigate back to item detail
7. **Verify UI:** Stock Value updated

#### Test 19.13: Item Detail - Margin Calculation - UI + BFF
**Steps:**
1. Navigate to `/inventory/:id`
2. **Verify UI:** Margin card displayed
3. **Verify Calculation:** 
   - Margin = Selling Price - Purchase Price
   - Margin % = (Margin / Purchase Price) × 100
4. **Verify UI:** Margin displayed correctly (green if positive, red if negative)
5. Update item selling price
6. Navigate back to item detail
7. **Verify UI:** Margin recalculated

#### Test 19.14: Payment Detail - Navigate to Linked Party - UI + BFF
**Steps:**
1. Navigate to `/payments/:id` (payment with party)
2. **Verify UI:** Party link visible in "Related Information" card
3. Click on party link
4. **Verify UI:** Navigate to `/parties/:partyId`
5. **Verify BFF API Call:** `GET /api/v1/parties/:partyId` called
6. **Verify UI:** Party detail page loads

#### Test 19.15: Payment Detail - Navigate to Linked Invoice - UI + BFF
**Steps:**
1. Navigate to `/payments/:id` (payment with invoice)
2. **Verify UI:** Invoice link visible in "Related Information" card
3. Click on invoice link
4. **Verify UI:** Navigate to `/invoices/:invoiceId`
5. **Verify BFF API Call:** `GET /api/v1/invoices/:invoiceId` called
6. **Verify UI:** Invoice detail page loads

#### Test 19.16: Payment Detail - Payment Type Display - UI + BFF
**Steps:**
1. Navigate to `/payments/:id`
2. **Verify UI:** Payment type badge displayed:
   - "PAYMENT IN" (green) for payment_in
   - "PAYMENT OUT" (red) for payment_out
3. **Verify UI:** Amount color matches type:
   - Green for payment_in
   - Red for payment_out
4. **Verify UI:** Icon matches type (ArrowDownLeft for in, ArrowUpRight for out)

---

### 20-home-redirect.spec.ts

#### Test 20.1: Home Page - Not Authenticated Redirect - UI + BFF
**Steps:**
1. Clear authentication (logout or clear localStorage)
2. Navigate to `/` (root)
3. **Verify UI:** Loading spinner displayed briefly
4. **Verify UI:** Redirected to `/login`
5. **Verify BFF API Call:** No authenticated API calls made

#### Test 20.2: Home Page - Authenticated No Business Redirect - UI + BFF
**Steps:**
1. Login successfully
2. Clear businessId from localStorage (or use account with no business)
3. Navigate to `/`
4. **Verify UI:** Loading spinner displayed
5. **Verify UI:** Redirected to `/business/select`
6. **Verify BFF API Call:** `GET /api/v1/businesses` may be called

#### Test 20.3: Home Page - Authenticated With Business Redirect - UI + BFF
**Steps:**
1. Login successfully
2. Select/create business
3. Navigate to `/`
4. **Verify UI:** Loading spinner displayed briefly
5. **Verify UI:** Redirected to `/dashboard`
6. **Verify BFF API Call:** Dashboard APIs called

---

### 21-test-input-page.spec.ts

#### Test 21.1: Test Input Page - Basic Functionality (Optional)
**Steps:**
1. Navigate to `/test-input` page
2. **Verify UI:** Test input page loads
3. **Verify UI:** Input field visible
4. Type text in input
5. **Verify UI:** Value displayed below input
6. **Verify UI:** Character count displayed
7. **Note:** This is a test/dev page, may not need production testing

---

## Request/Response Alignment Verification

### Critical Alignment Points

#### 1. Request Headers Alignment
**UI Sends:**
- `Authorization: Bearer <access_token>`
- `x-business-id: <business_id>`
- `Content-Type: application/json`

**BFF Expects:**
- `Authorization: Bearer <token>` ✅
- `x-business-id` header ✅
- `Content-Type: application/json` ✅

**Test Cases Needed:**
- Verify all API calls include `Authorization` header
- Verify all API calls include `x-business-id` header
- Verify token refresh on 401 errors

#### 2. Query Parameters Alignment

| Endpoint | UI Uses | BFF Expects | Status |
|----------|---------|-------------|--------|
| `GET /invoices` | `partyId`, `invoiceType`, `paymentStatus`, `status`, `startDate`, `endDate`, `search`, `page`, `limit` | `partyId`, `invoiceType`, `paymentStatus`, `status`, `startDate`, `endDate`, `search`, `page`, `limit` | ✅ |
| `GET /payments` | `party_id`, `invoice_id`, `transaction_type`, `startDate`, `endDate`, `page`, `limit` | `partyId`, `invoiceId`, `transactionType`, `startDate`, `endDate`, `page`, `limit` | ❌ MISMATCH |
| `GET /parties` | `type`, `search` | `type`, `search` | ✅ |
| `GET /items` | `categoryId`, `search` | `categoryId`, `search` | ✅ |
| `GET /parties/:id/ledger` | `startDate`, `endDate` | `startDate`, `endDate` | ✅ |

**⚠️ MISMATCH FOUND:**
- Payment API: UI uses `party_id`, `invoice_id`, `transaction_type` (snake_case)
- Payment API: BFF expects `partyId`, `invoiceId`, `transactionType` (camelCase)

#### 3. Request Body Field Names Alignment

| DTO | UI Field Names | BFF DTO Field Names | Status |
|-----|---------------|---------------------|--------|
| `CreatePartyDto` | `name`, `type`, `phone`, `email`, `gstin`, `pan`, `billing_address_line1`, `billing_city`, `billing_state`, `billing_pincode`, `shipping_address_line1`, `shipping_city`, `shipping_state`, `shipping_pincode`, `credit_limit`, `credit_days` | `name`, `type`, `phone`, `email`, `gstin`, `pan`, `billing_address_line1`, `billing_city`, `billing_state`, `billing_pincode`, `shipping_address_line1`, `shipping_city`, `shipping_state`, `shipping_pincode`, `credit_limit`, `credit_period_days` | ⚠️ MISMATCH (`credit_days` vs `credit_period_days`) |
| `CreateInvoiceDto` | `party_id`, `invoice_type`, `invoice_date`, `due_date`, `items[]`, `notes`, `terms` | `party_id`, `invoice_type`, `invoice_date`, `due_date`, `items[]`, `notes`, `terms` | ✅ |
| `CreatePaymentDto` | `party_id`, `invoice_id`, `transaction_type`, `transaction_date`, `amount`, `payment_mode`, `reference_number`, `bank_name`, `cheque_number`, `cheque_date`, `notes` | `party_id`, `invoice_id`, `transaction_type`, `transaction_date`, `amount`, `payment_mode`, `reference_number`, `bank_name`, `cheque_number`, `cheque_date`, `notes` | ✅ |
| `CreateItemDto` | `name`, `selling_price`, `purchase_price`, `tax_rate`, `current_stock`, `low_stock_threshold` | `name`, `selling_price`, `purchase_price`, `tax_rate`, `current_stock`, `low_stock_threshold` | ✅ |
| `StockAdjustmentDto` | `item_id`, `adjustment_type`, `quantity`, `reason` | `item_id`, `adjustment_type`, `quantity`, `reason` | ✅ |

**⚠️ MISMATCHES FOUND:**

1. **Party Credit Days Field:**
   - **UI Sends:** `credit_days` (in form field and payload)
   - **BFF Expects:** `credit_period_days`
   - **Location:** `web-app/app/parties/page.tsx` (line 74, 133, 181, 456)
   - **Fix Required:** Change `credit_days` to `credit_period_days` in UI

2. **Payment Query Parameters:**
   - **UI Uses:** `party_id` and `invoice_id` (snake_case)
   - **BFF Expects:** `partyId` and `invoiceId` (camelCase)
   - **Locations:**
     - `web-app/app/parties/[id]/page.tsx` (line 56): `/payments?party_id=${partyId}`
     - `web-app/app/invoices/[id]/page.tsx` (line 58): `/payments?invoice_id=${invoiceId}`
   - **Fix Required:** Change query params to camelCase: `partyId` and `invoiceId`

#### 4. Response Structure Alignment

| Endpoint | BFF Returns | UI Handles | Status |
|----------|-------------|------------|--------|
| `GET /invoices` | `{ invoices: [...], total, page, limit }` | `response.data?.invoices \|\| response.data \|\| response.data?.data` | ✅ |
| `GET /payments` | `{ payments: [...], total, page, limit }` | `response.data \|\| response.data?.data` | ⚠️ May miss `payments` property |
| `GET /parties` | Array `[...]` or `{ data: [...] }` | `response.data \|\| response.data?.data` | ✅ |
| `GET /items` | Array `[...]` or `{ data: [...] }` | `response.data \|\| response.data?.data` | ✅ |
| `GET /invoices/:id` | `{ data: {...} }` or `{...}` | `response.data?.data \|\| response.data` | ✅ |
| `GET /parties/:id` | `{ data: {...} }` or `{...}` | `response.data?.data \|\| response.data` | ✅ |
| `POST /invoices` | `{ data: {...} }` or `{...}` | `response.data` | ✅ |
| `POST /parties` | `{ data: {...} }` or `{...}` | `response.data` | ✅ |

**⚠️ POTENTIAL ISSUE:**
- Payment list response: BFF returns `{ payments: [...] }` but UI may not check `response.data.payments`

#### 5. Empty/Undefined Value Handling

**UI Behavior:**
- Uses `cleanPayload()` to remove `undefined`, `null`, and empty strings (`''`)
- Only sends fields with actual values

**BFF Behavior:**
- Accepts optional fields as `undefined` or omitted
- Validates required fields

**Status:** ✅ Aligned (UI correctly removes empty values)

---

### Test Cases for Request/Response Alignment

#### Test ALIGN.1: Verify Request Headers - All API Calls
**Steps:**
1. Intercept all API requests
2. **Verify:** Every request includes `Authorization: Bearer <token>` header
3. **Verify:** Every request includes `x-business-id: <business_id>` header
4. **Verify:** Every request includes `Content-Type: application/json` header
5. **Verify:** Token is valid (not expired)

#### Test ALIGN.2: Verify Payment Query Parameters - Snake vs Camel Case
**Steps:**
1. Navigate to `/parties/:id` (party detail page)
2. **Verify BFF API Call:** `GET /api/v1/payments?partyId=...` (camelCase)
3. **Verify:** Query parameter is `partyId` not `party_id`
4. Navigate to `/invoices/:id` (invoice detail page)
5. **Verify BFF API Call:** `GET /api/v1/payments?invoiceId=...` (camelCase)
6. **Verify:** Query parameter is `invoiceId` not `invoice_id`
7. Navigate to `/payments` page
8. Filter by transaction type (if UI supports)
9. **Verify BFF API Call:** `GET /api/v1/payments?transactionType=...` (camelCase)
10. **Verify:** Query parameter is `transactionType` not `transaction_type`

#### Test ALIGN.3: Verify Party Credit Days Field Name
**Steps:**
1. Navigate to `/parties`
2. Click "Add Party" button
3. Fill form:
   - Name: `Test Party`
   - Type: `customer`
   - Credit Days: `30`
4. Click "Create" button
5. **Verify BFF API Call:** `POST /api/v1/parties` is called
6. **Verify Request Body:** Contains `credit_period_days: 30` (NOT `credit_days`)
7. **Verify:** If UI sends `credit_days`, test should FAIL and report mismatch
8. **Verify:** Party created successfully only if field name is correct

#### Test ALIGN.4: Verify Payment List Response Structure
**Steps:**
1. Navigate to `/payments`
2. **Verify BFF API Call:** `GET /api/v1/payments`
3. **Verify Response Structure:** `{ payments: [...], total, page, limit }`
4. **Verify UI:** Payments list displays correctly
5. **Verify:** UI handles `response.data.payments` property

#### Test ALIGN.5: Verify Invoice List Response Structure
**Steps:**
1. Navigate to `/invoices`
2. **Verify BFF API Call:** `GET /api/v1/invoices`
3. **Verify Response Structure:** `{ invoices: [...], total, page, limit }`
4. **Verify UI:** Invoices list displays correctly
5. **Verify:** UI handles `response.data.invoices` property

#### Test ALIGN.6: Verify Empty Value Removal
**Steps:**
1. Navigate to `/parties`
2. Create party with only mandatory fields (name, type)
3. Leave all optional fields empty
4. **Verify BFF API Call:** `POST /api/v1/parties`
5. **Verify Request Body:** Only contains `name` and `type` (no empty strings, no undefined)
6. **Verify:** Party created successfully

#### Test ALIGN.7: Verify Token Refresh on 401
**Steps:**
1. Make API call that returns 401 (expired token)
2. **Verify BFF API Call:** `POST /api/v1/auth/refresh-token` called automatically
3. **Verify Request Body:** Contains `refresh_token`
4. **Verify Response:** Contains new `access_token`
5. **Verify:** Original request retried with new token
6. **Verify:** Request succeeds

#### Test ALIGN.8: Verify Response Data Extraction - Single Item
**Steps:**
1. Navigate to `/parties/:id`
2. **Verify BFF API Call:** `GET /api/v1/parties/:id`
3. **Verify Response Structure:** `{ data: {...} }` or `{...}`
4. **Verify UI:** Party details displayed correctly
5. **Verify:** UI handles both `response.data.data` and `response.data`

#### Test ALIGN.9: Verify Response Data Extraction - List Items
**Steps:**
1. Navigate to `/inventory`
2. **Verify BFF API Call:** `GET /api/v1/items`
3. **Verify Response Structure:** Array `[...]` or `{ data: [...] }`
4. **Verify UI:** Items list displayed correctly
5. **Verify:** UI handles both array and nested data formats

#### Test ALIGN.10: Verify Error Response Handling
**Steps:**
1. Try to create party with invalid data (e.g., invalid phone)
2. **Verify BFF API Call:** `POST /api/v1/parties` returns 400
3. **Verify Response Structure:** `{ message: "...", errors: [...] }`
4. **Verify UI:** Error toast displayed with `error.response?.data?.message`
5. **Verify:** Validation errors displayed correctly

---

## Code Fixes Required

### 🔴 Critical Fixes (Must Fix Before Production)

#### Fix 1: Payment Query Parameters - Snake Case to Camel Case
**Files to Fix:**
1. `web-app/app/parties/[id]/page.tsx` (line 56)
   - **Current:** `paymentApi.get(\`/payments?party_id=${partyId}\`)`
   - **Fix:** `paymentApi.get(\`/payments?partyId=${partyId}\`)`

2. `web-app/app/invoices/[id]/page.tsx` (line 58)
   - **Current:** `paymentApi.get(\`/payments?invoice_id=${invoiceId}\`)`
   - **Fix:** `paymentApi.get(\`/payments?invoiceId=${invoiceId}\`)`

**Impact:** Payments list will fail to load on party detail and invoice detail pages.

#### Fix 2: Party Credit Days Field Name
**File to Fix:**
- `web-app/app/parties/page.tsx`

**Changes Required:**
1. Line 74: Change form schema field from `credit_days` to `credit_period_days`
2. Line 133: Change default value key from `credit_days` to `credit_period_days`
3. Line 181: Change payload field from `credit_days` to `credit_period_days`
4. Line 456: Change form field name from `credit_days` to `credit_period_days`

**Impact:** Credit days will not be saved when creating/updating parties.

### ⚠️ Verification Needed

#### Verify 1: Payment List Response Handling
**Files to Check:**
- `web-app/app/payments/page.tsx`
- `web-app/app/parties/[id]/page.tsx`
- `web-app/app/invoices/[id]/page.tsx`

**Check:** Ensure UI handles `response.data.payments` property (not just `response.data` or `response.data.data`)

**Current Code Pattern:**
```typescript
const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
```

**Should Also Check:**
```typescript
const data = response.data?.payments || Array.isArray(response.data) ? response.data : (response.data?.data || []);
```

---

## Complete Page & Component Coverage Matrix

### Pages Coverage (27 pages)

| Page Route | Test File | Test Cases | Status |
|------------|-----------|------------|--------|
| `/` (Home) | 20-home-redirect.spec.ts | 3 | ✅ |
| `/login` | 01-authentication.spec.ts | 8 | ✅ |
| `/dashboard` | 07-dashboard.spec.ts, 19-page-features.spec.ts | 10+ | ✅ |
| `/business/select` | 02-business.spec.ts | 5 | ✅ |
| `/parties` | 03-parties.spec.ts, 19-page-features.spec.ts | 15+ | ✅ |
| `/parties/new` | 18-dedicated-pages.spec.ts | 1 | ✅ |
| `/parties/:id` | 03-parties.spec.ts, 18-dedicated-pages.spec.ts, 19-page-features.spec.ts | 8+ | ✅ |
| `/parties/:id/edit` | 03-parties.spec.ts, 18-dedicated-pages.spec.ts | 2+ | ✅ |
| `/inventory` | 04-inventory.spec.ts | 13+ | ✅ |
| `/inventory/new` | 18-dedicated-pages.spec.ts | 1 | ✅ |
| `/inventory/:id` | 04-inventory.spec.ts, 18-dedicated-pages.spec.ts, 19-page-features.spec.ts | 5+ | ✅ |
| `/inventory/:id/edit` | 04-inventory.spec.ts, 18-dedicated-pages.spec.ts | 2+ | ✅ |
| `/inventory/stock` | 18-dedicated-pages.spec.ts | 1 | ✅ |
| `/invoices` | 05-invoices.spec.ts, 19-page-features.spec.ts | 20+ | ✅ |
| `/invoices/create` | 05-invoices.spec.ts | 10+ | ✅ |
| `/invoices/:id` | 05-invoices.spec.ts, 14-export-pdf.spec.ts, 19-page-features.spec.ts | 8+ | ✅ |
| `/invoices/:id/edit` | 05-invoices.spec.ts, 18-dedicated-pages.spec.ts | 2+ | ✅ |
| `/payments` | 06-payments.spec.ts | 15+ | ✅ |
| `/payments/new` | 06-payments.spec.ts, 18-dedicated-pages.spec.ts | 2+ | ✅ |
| `/payments/:id` | 06-payments.spec.ts, 18-dedicated-pages.spec.ts, 19-page-features.spec.ts | 5+ | ✅ |
| `/reports` | 10-reports.spec.ts, 19-page-features.spec.ts | 8+ | ✅ |
| `/settings` | 11-settings.spec.ts | 6 | ✅ |
| `/profile` | 16-profile.spec.ts | 2 | ✅ |
| `/help` | 18-dedicated-pages.spec.ts | 1 | ✅ |
| `/test-input` | 21-test-input-page.spec.ts | 1 | ✅ (Optional) |

### Components Coverage (33 components)

| Component | Location | Test File | Test Cases | Status |
|-----------|----------|-----------|------------|--------|
| Sidebar | `components/layout/sidebar.tsx` | 17-ui-components.spec.ts | 3 | ✅ |
| BottomNav | `components/layout/bottom-nav.tsx` | 17-ui-components.spec.ts | 2 | ✅ |
| CommandMenu | `components/layout/command-menu.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Header | `components/layout/header.tsx` | 12-navigation.spec.ts | 1 | ✅ |
| Breadcrumbs | `components/layout/breadcrumbs.tsx` | 12-navigation.spec.ts | 1 | ✅ |
| Dialog | `components/ui/dialog.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| AlertDialog | `components/ui/alert-dialog.tsx` | Multiple | Multiple | ✅ |
| DeleteConfirmDialog | `components/ui/delete-confirm-dialog.tsx` | Multiple | Multiple | ✅ |
| Form | `components/ui/form.tsx` | Multiple | Multiple | ✅ |
| FormFields | `components/ui/form-fields.tsx` | Multiple | Multiple | ✅ |
| Input | `components/ui/input.tsx` | Multiple | Multiple | ✅ |
| Select | `components/ui/select.tsx` | Multiple | Multiple | ✅ |
| Textarea | `components/ui/textarea.tsx` | Multiple | Multiple | ✅ |
| Button | `components/ui/button.tsx` | Multiple | Multiple | ✅ |
| Card | `components/ui/card.tsx` | Multiple | Multiple | ✅ |
| Badge | `components/ui/badge.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| StatusBadge | `components/ui/status-badge.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Table | `components/ui/table.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Tabs | `components/ui/tabs.tsx` | 10-reports.spec.ts | Multiple | ✅ |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Sheet | `components/ui/sheet.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Tooltip | `components/ui/tooltip.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| EmptyState | `components/ui/empty-state.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Skeleton | `components/ui/skeleton.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| ErrorBoundary | `components/ui/error-boundary.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Spinner | `components/ui/spinner.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Toast/Sonner | `components/ui/sonner.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| PageHeader | `components/ui/page-header.tsx` | Multiple | Multiple | ✅ |
| ScrollArea | `components/ui/scroll-area.tsx` | Multiple | Multiple | ✅ |
| Avatar | `components/ui/avatar.tsx` | Multiple | Multiple | ✅ |
| Command | `components/ui/command.tsx` | 17-ui-components.spec.ts | 1 | ✅ |
| Label | `components/ui/label.tsx` | Multiple | Multiple | ✅ |

### Feature Coverage Matrix

| Feature | Pages Using | Test Coverage | Status |
|---------|-------------|--------------|--------|
| Export Excel | Parties, Inventory, Invoices, Payments | 14-export-pdf.spec.ts | ✅ |
| Export PDF | Dashboard, Invoice Detail | 14-export-pdf.spec.ts | ✅ |
| Print | Invoice Detail | 19-page-features.spec.ts | ✅ |
| Phone Call | Parties List, Party Detail | 19-page-features.spec.ts | ✅ |
| Search | Parties, Inventory, Invoices, Payments | Multiple | ✅ |
| Filter by Type | Parties, Invoices | Multiple | ✅ |
| Filter by Status | Invoices, Payments | Multiple | ✅ |
| Filter by Date Range | Reports, Invoices, Payments | Multiple | ✅ |
| Pagination | Invoices, Payments | 15-pagination.spec.ts | ✅ |
| Create from Detail | Party Detail → Invoice | 19-page-features.spec.ts | ✅ |
| Navigate to Linked | Payment → Party/Invoice | 19-page-features.spec.ts | ✅ |
| Balance Calculations | Party Detail, Dashboard | 19-page-features.spec.ts | ✅ |
| Stock Value Calculation | Item Detail | 19-page-features.spec.ts | ✅ |
| Margin Calculation | Item Detail | 19-page-features.spec.ts | ✅ |
| Low Stock Badge | Item Detail, Inventory List | 04-inventory.spec.ts | ✅ |
| Status Badges | Invoices, Parties, Items | 17-ui-components.spec.ts | ✅ |
| Module Cards | Dashboard | 19-page-features.spec.ts | ✅ |
| Quick Actions FAB | BottomNav (Mobile) | 17-ui-components.spec.ts | ✅ |
| Keyboard Shortcuts | CommandMenu | 17-ui-components.spec.ts | ✅ |
| Sidebar Collapse | Sidebar | 17-ui-components.spec.ts | ✅ |
| Mobile Navigation | BottomNav, MobileSidebar | 17-ui-components.spec.ts | ✅ |

---

## 🚀 Production Readiness Gate

### Pre-Production Checklist

**⚠️ DO NOT DEPLOY TO PRODUCTION UNTIL ALL ITEMS BELOW ARE CHECKED ✅**

#### Phase 1: Code Fixes (MANDATORY)
- [ ] **Fix Payment Query Parameters** (2 files)
  - [ ] `web-app/app/parties/[id]/page.tsx`: Change `party_id` → `partyId`
  - [ ] `web-app/app/invoices/[id]/page.tsx`: Change `invoice_id` → `invoiceId`
- [ ] **Fix Party Credit Days Field** (1 file, 4 locations)
  - [ ] `web-app/app/parties/page.tsx`: Change `credit_days` → `credit_period_days` (all 4 locations)
- [ ] **Verify Payment Response Handling**
  - [ ] Check all files handle `response.data.payments` property
  - [ ] Update response extraction logic if needed

#### Phase 2: Test Execution (MANDATORY)
- [ ] **Run All Test Suites** (22 test files)
  ```bash
  npm run test:headed -- ui-bff-tests/
  ```
- [ ] **Test Results:** All tests must pass (0 failures)
- [ ] **Test Coverage:** 100% of test cases executed
- [ ] **Test Duration:** Document execution time
- [ ] **Test Report:** Generate and review HTML report

#### Phase 3: Request/Response Alignment (MANDATORY)
- [ ] **Run Alignment Tests**
  ```bash
  npm run test:headed -- ui-bff-tests/22-request-response-alignment.spec.ts
  ```
- [ ] **Verify:** All request headers correct
- [ ] **Verify:** All query parameters correct
- [ ] **Verify:** All field names match BFF DTOs
- [ ] **Verify:** All response structures handled correctly

#### Phase 4: API Endpoint Coverage (MANDATORY)
- [ ] **Auth Service** (8 endpoints)
  - [ ] `POST /api/v1/auth/send-otp` ✅
  - [ ] `POST /api/v1/auth/verify-otp` ✅
  - [ ] `POST /api/v1/auth/refresh-token` ✅
  - [ ] `GET /api/v1/users/profile` ✅
  - [ ] `PATCH /api/v1/users/profile` ✅
  - [ ] `POST /api/v1/users/profile/avatar` ✅
  - [ ] `GET /api/v1/auth/sessions` ✅
  - [ ] `DELETE /api/v1/auth/sessions/:id` ✅
  - [ ] `DELETE /api/v1/auth/sessions/all` ✅
- [ ] **Business Service** (5 endpoints)
  - [ ] `POST /api/v1/businesses` ✅
  - [ ] `GET /api/v1/businesses` ✅
  - [ ] `GET /api/v1/businesses/:id` ✅
  - [ ] `PATCH /api/v1/businesses/:id` ✅
  - [ ] `DELETE /api/v1/businesses/:id` ✅
- [ ] **Party Service** (6 endpoints)
  - [ ] `POST /api/v1/parties` ✅
  - [ ] `GET /api/v1/parties` ✅
  - [ ] `GET /api/v1/parties/:id` ✅
  - [ ] `PATCH /api/v1/parties/:id` ✅
  - [ ] `DELETE /api/v1/parties/:id` ✅
  - [ ] `GET /api/v1/parties/:id/ledger` ✅
- [ ] **Inventory Service** (8 endpoints)
  - [ ] `POST /api/v1/items` ✅
  - [ ] `GET /api/v1/items` ✅
  - [ ] `GET /api/v1/items/:id` ✅
  - [ ] `PATCH /api/v1/items/:id` ✅
  - [ ] `DELETE /api/v1/items/:id` ✅
  - [ ] `GET /api/v1/items/low-stock` ✅
  - [ ] `POST /api/v1/stock/adjust` ✅
  - [ ] `GET /api/v1/stock/items/:itemId/history` ✅
- [ ] **Invoice Service** (3 endpoints)
  - [ ] `POST /api/v1/invoices` ✅
  - [ ] `GET /api/v1/invoices` ✅
  - [ ] `GET /api/v1/invoices/:id` ✅
- [ ] **Payment Service** (4 endpoints)
  - [ ] `POST /api/v1/payments` ✅
  - [ ] `GET /api/v1/payments` ✅
  - [ ] `GET /api/v1/payments/:id` ✅
  - [ ] `GET /api/v1/payments/invoices/:invoiceId` ✅

#### Phase 5: UI Page Coverage (MANDATORY)
- [ ] **All 27 Pages Tested**
  - [ ] `/` (Home redirect) ✅
  - [ ] `/login` ✅
  - [ ] `/dashboard` ✅
  - [ ] `/business/select` ✅
  - [ ] `/parties` ✅
  - [ ] `/parties/new` ✅
  - [ ] `/parties/:id` ✅
  - [ ] `/parties/:id/edit` ✅
  - [ ] `/inventory` ✅
  - [ ] `/inventory/new` ✅
  - [ ] `/inventory/:id` ✅
  - [ ] `/inventory/:id/edit` ✅
  - [ ] `/inventory/stock` ✅
  - [ ] `/invoices` ✅
  - [ ] `/invoices/create` ✅
  - [ ] `/invoices/:id` ✅
  - [ ] `/invoices/:id/edit` ✅
  - [ ] `/payments` ✅
  - [ ] `/payments/new` ✅
  - [ ] `/payments/:id` ✅
  - [ ] `/reports` ✅
  - [ ] `/settings` ✅
  - [ ] `/profile` ✅
  - [ ] `/help` ✅
  - [ ] `/test-input` (Optional) ✅

#### Phase 6: Component Coverage (MANDATORY)
- [ ] **All 33 Components Tested**
  - [ ] Sidebar (collapse/expand, logout) ✅
  - [ ] BottomNav (mobile navigation) ✅
  - [ ] CommandMenu (keyboard shortcuts) ✅
  - [ ] Dialogs (all types) ✅
  - [ ] Forms (validation, errors) ✅
  - [ ] Empty States ✅
  - [ ] Loading Skeletons ✅
  - [ ] Error Boundaries ✅
  - [ ] Toast Notifications ✅
  - [ ] Status Badges ✅
  - [ ] Dropdown Menus ✅
  - [ ] Tables ✅
  - [ ] All other UI components ✅

#### Phase 7: Business Logic Verification (MANDATORY)
- [ ] **GST Calculations**
  - [ ] Intra-state (CGST + SGST) ✅
  - [ ] Inter-state (IGST) ✅
  - [ ] CESS calculations ✅
- [ ] **Invoice Calculations**
  - [ ] Subtotal, discount, tax, total ✅
  - [ ] Multiple items ✅
  - [ ] Payment status updates ✅
- [ ] **Party Balance**
  - [ ] Opening balance ✅
  - [ ] Invoice additions ✅
  - [ ] Payment deductions ✅
  - [ ] Current balance ✅
- [ ] **Stock Management**
  - [ ] Stock adjustments ✅
  - [ ] Low stock alerts ✅
  - [ ] Stock value calculations ✅

#### Phase 8: Cross-Module Integration (MANDATORY)
- [ ] **Invoice → Party Integration**
  - [ ] Create invoice for party ✅
  - [ ] Party balance updates ✅
  - [ ] Party ledger shows invoice ✅
- [ ] **Payment → Invoice Integration**
  - [ ] Link payment to invoice ✅
  - [ ] Invoice payment status updates ✅
  - [ ] Outstanding amount recalculates ✅
- [ ] **Invoice → Inventory Integration**
  - [ ] Stock decreases on sale invoice ✅
  - [ ] Stock increases on purchase invoice ✅
- [ ] **Dashboard → All Modules**
  - [ ] Stats reflect all modules ✅
  - [ ] Real-time updates ✅

#### Phase 9: Error Handling (MANDATORY)
- [ ] **API Error Handling**
  - [ ] 400 Bad Request ✅
  - [ ] 401 Unauthorized ✅
  - [ ] 404 Not Found ✅
  - [ ] 500 Server Error ✅
- [ ] **UI Error Handling**
  - [ ] Form validation errors ✅
  - [ ] Network errors ✅
  - [ ] Timeout errors ✅
  - [ ] Error boundaries ✅

#### Phase 10: Performance & Security (MANDATORY)
- [ ] **Performance Benchmarks**
  - [ ] Page load time < 3 seconds ✅
  - [ ] API response time < 1 second ✅
  - [ ] No memory leaks ✅
  - [ ] Smooth scrolling/animations ✅
- [ ] **Security Checks**
  - [ ] Authentication required for all pages ✅
  - [ ] Tokens stored securely ✅
  - [ ] XSS protection ✅
  - [ ] CSRF protection ✅
  - [ ] Input validation ✅
  - [ ] SQL injection prevention ✅

#### Phase 11: Export & PDF Functionality (MANDATORY)
- [ ] **Excel Exports**
  - [ ] Parties export ✅
  - [ ] Inventory export ✅
  - [ ] Invoices export ✅
  - [ ] Payments export ✅
- [ ] **PDF Generation**
  - [ ] Invoice PDF ✅
  - [ ] Dashboard report PDF ✅
  - [ ] Print functionality ✅

#### Phase 12: Mobile Responsiveness (MANDATORY)
- [ ] **Mobile Navigation**
  - [ ] BottomNav works ✅
  - [ ] Mobile sidebar works ✅
  - [ ] Quick actions FAB works ✅
- [ ] **Mobile Forms**
  - [ ] All forms usable on mobile ✅
  - [ ] Dialogs responsive ✅
  - [ ] Tables scrollable ✅

#### Phase 13: Browser Compatibility (MANDATORY)
- [ ] **Tested Browsers**
  - [ ] Chrome (latest) ✅
  - [ ] Firefox (latest) ✅
  - [ ] Safari (latest) ✅
  - [ ] Edge (latest) ✅
- [ ] **Mobile Browsers**
  - [ ] Chrome Mobile ✅
  - [ ] Safari Mobile ✅

#### Phase 14: Documentation (MANDATORY)
- [ ] **Test Documentation**
  - [ ] All test cases documented ✅
  - [ ] Test execution guide ✅
  - [ ] Known issues documented ✅
- [ ] **API Documentation**
  - [ ] Swagger docs up to date ✅
  - [ ] Request/response examples ✅
- [ ] **User Documentation**
  - [ ] Help page content ✅
  - [ ] FAQs updated ✅

#### Phase 15: Rollback Plan (MANDATORY)
- [ ] **Rollback Criteria Defined**
  - [ ] Critical bugs found ✅
  - [ ] Performance degradation ✅
  - [ ] Security vulnerabilities ✅
  - [ ] Data loss risk ✅
- [ ] **Rollback Procedure**
  - [ ] Database backup strategy ✅
  - [ ] Code rollback steps ✅
  - [ ] Communication plan ✅

---

## Test Execution Summary Template

### Test Run Report

**Date:** _______________
**Tester:** _______________
**Environment:** _______________
**Branch:** _______________

#### Test Results Summary
- **Total Test Files:** 22
- **Total Test Cases:** ~330
- **Passed:** _____
- **Failed:** _____
- **Skipped:** _____
- **Duration:** _____ minutes

#### Test File Results

| Test File | Status | Passed | Failed | Duration |
|-----------|--------|--------|--------|----------|
| 01-authentication.spec.ts | ⬜ | ___ | ___ | ___ |
| 02-business.spec.ts | ⬜ | ___ | ___ | ___ |
| 03-parties.spec.ts | ⬜ | ___ | ___ | ___ |
| 04-inventory.spec.ts | ⬜ | ___ | ___ | ___ |
| 05-invoices.spec.ts | ⬜ | ___ | ___ | ___ |
| 06-payments.spec.ts | ⬜ | ___ | ___ | ___ |
| 07-dashboard.spec.ts | ⬜ | ___ | ___ | ___ |
| 08-cross-module.spec.ts | ⬜ | ___ | ___ | ___ |
| 09-business-logic.spec.ts | ⬜ | ___ | ___ | ___ |
| 10-reports.spec.ts | ⬜ | ___ | ___ | ___ |
| 11-settings.spec.ts | ⬜ | ___ | ___ | ___ |
| 12-navigation.spec.ts | ⬜ | ___ | ___ | ___ |
| 13-edge-cases.spec.ts | ⬜ | ___ | ___ | ___ |
| 14-export-pdf.spec.ts | ⬜ | ___ | ___ | ___ |
| 15-pagination.spec.ts | ⬜ | ___ | ___ | ___ |
| 16-profile.spec.ts | ⬜ | ___ | ___ | ___ |
| 17-ui-components.spec.ts | ⬜ | ___ | ___ | ___ |
| 18-dedicated-pages.spec.ts | ⬜ | ___ | ___ | ___ |
| 19-page-features.spec.ts | ⬜ | ___ | ___ | ___ |
| 20-home-redirect.spec.ts | ⬜ | ___ | ___ | ___ |
| 21-test-input-page.spec.ts | ⬜ | ___ | ___ | ___ |
| 22-request-response-alignment.spec.ts | ⬜ | ___ | ___ | ___ |
| 23-ui-text-formats-messages.spec.ts | ⬜ | ___ | ___ | ___ |

**Status Legend:** ✅ Pass | ❌ Fail | ⚠️ Warning | ⏭️ Skipped

#### Critical Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

#### Non-Critical Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

#### Production Readiness Decision
- [ ] **APPROVED FOR PRODUCTION** - All checks passed
- [ ] **NOT APPROVED** - Issues found (see above)

**Approved By:** _______________
**Date:** _______________

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests - Production Gate

on:
  pull_request:
    branches: [main, production]
  push:
    branches: [main, production]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd web-app
          npm ci
      
      - name: Install Playwright
        run: |
          cd web-app
          npx playwright install --with-deps
      
      - name: Start Backend Services
        run: |
          cd app
          docker-compose up -d
          # Wait for services to be ready
          sleep 30
      
      - name: Run E2E Tests
        run: |
          cd web-app
          npm run test:headed -- ui-bff-tests/ --reporter=html
        continue-on-error: false
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: web-app/playwright-report/
      
      - name: Check Test Results
        if: failure()
        run: |
          echo "❌ Tests failed - Production deployment blocked"
          exit 1
```

### Pre-Deployment Script

```bash
#!/bin/bash
# pre-deployment-check.sh

echo "🚀 Starting Pre-Production Checks..."

# Check if all services are running
echo "📡 Checking backend services..."
curl -f http://localhost:3002/health || { echo "❌ Auth service not running"; exit 1; }
curl -f http://localhost:3003/health || { echo "❌ Business service not running"; exit 1; }
curl -f http://localhost:3004/health || { echo "❌ Party service not running"; exit 1; }
curl -f http://localhost:3005/health || { echo "❌ Inventory service not running"; exit 1; }
curl -f http://localhost:3006/health || { echo "❌ Invoice service not running"; exit 1; }
curl -f http://localhost:3007/health || { echo "❌ Payment service not running"; exit 1; }

echo "✅ All services running"

# Run tests
echo "🧪 Running E2E tests..."
cd web-app
npm run test:headed -- ui-bff-tests/ --reporter=html

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ All tests passed - Ready for production"
  exit 0
else
  echo "❌ Tests failed - Production deployment blocked"
  exit 1
fi
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Page Load Time | < 2s | > 5s |
| API Response Time | < 500ms | > 2s |
| Time to Interactive | < 3s | > 6s |
| First Contentful Paint | < 1.5s | > 3s |
| Largest Contentful Paint | < 2.5s | > 4s |
| Cumulative Layout Shift | < 0.1 | > 0.25 |
| First Input Delay | < 100ms | > 300ms |

### Performance Test Cases

#### Test PERF.1: Page Load Performance
**Steps:**
1. Navigate to each page
2. Measure page load time
3. **Verify:** All pages load < 3 seconds
4. **Verify:** No console errors
5. **Verify:** No memory leaks

#### Test PERF.2: API Response Performance
**Steps:**
1. Intercept all API calls
2. Measure response time for each
3. **Verify:** All APIs respond < 1 second
4. **Verify:** No timeout errors
5. **Verify:** Retry logic works

#### Test PERF.3: Large Dataset Performance
**Steps:**
1. Create 100+ parties
2. Create 100+ invoices
3. Navigate to list pages
4. **Verify:** Lists load < 3 seconds
5. **Verify:** Pagination works
6. **Verify:** Search works efficiently

---

## Security Checklist

### Authentication & Authorization
- [ ] All pages require authentication
- [ ] Tokens expire correctly
- [ ] Refresh token works
- [ ] Logout clears all tokens
- [ ] Session management works

### Input Validation
- [ ] All form inputs validated
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled
- [ ] File upload validation

### Data Protection
- [ ] Sensitive data encrypted
- [ ] Passwords never logged
- [ ] Tokens stored securely
- [ ] API keys not exposed
- [ ] Error messages don't leak info

### API Security
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Headers sanitized
- [ ] Request size limits
- [ ] Response size limits

---

## Rollback Criteria

### Automatic Rollback Triggers
1. **Critical Bugs:** Any bug affecting core functionality
2. **Data Loss:** Any risk of data corruption or loss
3. **Security Breach:** Any security vulnerability found
4. **Performance Degradation:** > 50% slower than baseline
5. **Service Outage:** Any service unavailable > 5 minutes

### Rollback Procedure
1. **Immediate Actions**
   - Stop deployment
   - Notify team
   - Assess impact
2. **Rollback Steps**
   - Revert code to previous version
   - Restore database backup (if needed)
   - Restart services
   - Verify functionality
3. **Post-Rollback**
   - Document issue
   - Create fix plan
   - Re-test before redeploy

---

### 23-ui-text-formats-messages.spec.ts

#### Test 23.1: Toast Messages - Success Messages - Exact Text Verification
**Steps:**
1. Navigate to `/parties`
2. Create party successfully
3. **Verify Toast Message:** Exact text: "Party created successfully"
4. **Verify Toast Type:** Success (green)
5. Navigate to `/inventory`
6. Create item successfully
7. **Verify Toast Message:** Exact text: "Item created successfully"
8. Navigate to `/invoices/create`
9. Create invoice successfully
10. **Verify Toast Message:** Exact text: "Invoice created successfully"
11. Navigate to `/payments`
12. Record payment successfully
13. **Verify Toast Message:** Exact text: "Payment recorded successfully"
14. Update party successfully
15. **Verify Toast Message:** Exact text: "Party updated successfully" (or similar)
16. Delete party successfully
17. **Verify Toast Message:** Exact text: "Party deleted successfully"
18. Login successfully
19. **Verify Toast Message:** Exact text: "Login successful"
20. **Verify Toast Description:** Exact text: "Welcome back!"
21. Send OTP successfully
22. **Verify Toast Message:** Exact text: "OTP sent successfully"
23. **Verify Toast Description:** Contains "OTP: " followed by 6 digits
24. Resend OTP successfully
25. **Verify Toast Message:** Exact text: "OTP resent successfully"
26. Create business successfully
27. **Verify Toast Message:** Exact text: "Business created successfully"
28. Stock adjustment successful
29. **Verify Toast Message:** Exact text: "Stock adjusted successfully"

#### Test 23.2: Toast Messages - Error Messages - Exact Text Verification
**Steps:**
1. Try to create party with invalid data
2. **Verify Toast Message:** Exact text: "Failed to create party"
3. **Verify Toast Description:** Contains error message from API or "Please try again"
4. Try to create item with invalid data
5. **Verify Toast Message:** Exact text: "Failed to create item"
6. Try to create invoice with invalid data
7. **Verify Toast Message:** Exact text: "Failed to create invoice"
8. Try to record payment with invalid data
9. **Verify Toast Message:** Exact text: "Failed to record payment"
10. Try to delete party that doesn't exist
11. **Verify Toast Message:** Exact text: "Failed to delete party"
12. Try to login with invalid phone
13. **Verify Toast Message:** Exact text: "Invalid phone number"
14. Try to verify with invalid OTP
15. **Verify Toast Message:** Exact text: "Invalid OTP"
16. Try to send OTP with invalid phone
17. **Verify Toast Message:** Exact text: "Failed to send OTP"
18. Try to resend OTP when failed
19. **Verify Toast Message:** Exact text: "Failed to resend OTP"
20. Try to load data when API fails
21. **Verify Toast Message:** Exact text: "Failed to load parties" (or items/invoices/payments)
22. **Verify Toast Description:** Contains error message or "Please try again"

#### Test 23.3: Page Titles - Exact Text Verification
**Steps:**
1. Navigate to `/dashboard`
2. **Verify Page Title:** "Welcome back!" or "Dashboard"
3. Navigate to `/parties`
4. **Verify Page Title:** "Parties" (in PageHeader)
5. **Verify Page Description:** "Manage customers and suppliers"
6. Navigate to `/inventory`
7. **Verify Page Title:** "Inventory"
8. **Verify Page Description:** "Manage products, services, and stock"
9. Navigate to `/invoices`
10. **Verify Page Title:** "Invoices"
11. **Verify Page Description:** "Create, manage and track all your invoices"
12. Navigate to `/payments`
13. **Verify Page Title:** "Payments"
14. **Verify Page Description:** "Record and track payments"
15. Navigate to `/reports`
16. **Verify Page Title:** "Reports"
17. **Verify Page Description:** "Business insights and performance metrics"
18. Navigate to `/settings`
19. **Verify Page Title:** "Settings"
20. Navigate to `/help`
21. **Verify Page Title:** "Help & Support"
22. Navigate to `/profile`
23. **Verify Page Title:** "Profile"

#### Test 23.4: Button Labels - Exact Text Verification
**Steps:**
1. Navigate to `/parties`
2. **Verify Button Label:** "Add Party" (exact text)
3. Navigate to `/inventory`
4. **Verify Button Label:** "Add Item" (exact text)
5. Navigate to `/invoices`
6. **Verify Button Label:** "Create Invoice" (exact text)
7. Navigate to `/payments`
8. **Verify Button Label:** "Record Payment" (exact text)
9. Open party creation dialog
10. **Verify Submit Button:** "Create" or "Create Party" (exact text)
11. **Verify Cancel Button:** "Cancel" (exact text)
12. Open edit dialog
13. **Verify Submit Button:** "Save" or "Update" (exact text)
14. Navigate to party detail page
15. **Verify Edit Button:** "Edit" (exact text)
16. **Verify Back Button:** "Back" (exact text)
17. Navigate to invoice detail
18. **Verify Print Button:** "Print" (exact text)
19. **Verify PDF Button:** "PDF" or "Download PDF" (exact text)
20. Navigate to dashboard
21. **Verify Export Button:** "Export Report" (exact text)

#### Test 23.5: Form Labels - Exact Text Verification
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. **Verify Form Labels:**
   - "Name *" (with asterisk for required)
   - "Type *"
   - "Phone" (without asterisk if optional)
   - "Email"
   - "GSTIN"
   - "PAN"
   - "Billing Address Line 1"
   - "Billing City"
   - "Billing State"
   - "Billing Pincode"
   - "Credit Limit"
   - "Credit Days" (should be "Credit Period Days" after fix)
3. Navigate to `/inventory` and click "Add Item"
4. **Verify Form Labels:**
   - "Item Name *"
   - "Selling Price *"
   - "Purchase Price"
   - "Current Stock"
   - "Low Stock Threshold"
   - "HSN Code"
   - "Category"
   - "Unit"
5. Navigate to `/invoices/create`
6. **Verify Form Labels:**
   - "Party *"
   - "Invoice Type *"
   - "Invoice Date *"
   - "Due Date"
   - "Item Name *"
   - "Quantity *"
   - "Unit Price *"
   - "Discount %"
   - "Tax Rate %"
7. Navigate to `/payments` and click "Record Payment"
8. **Verify Form Labels:**
   - "Party *"
   - "Transaction Type *"
   - "Transaction Date *"
   - "Amount *"
   - "Payment Mode *"
   - "Reference Number"
   - "Notes"

#### Test 23.6: Placeholder Text - Exact Text Verification
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. **Verify Placeholders:**
   - Name field: "Enter party name" or similar
   - Phone field: "Enter phone number" or "10-digit phone number"
   - Email field: "Enter email address" or "email@example.com"
   - GSTIN field: "Enter GSTIN" or "15-character GSTIN"
   - PAN field: "Enter PAN" or "10-character PAN"
3. Navigate to `/inventory` and click "Add Item"
4. **Verify Placeholders:**
   - Name field: "Enter item name"
   - Selling Price: "0.00" or "Enter selling price"
   - HSN Code: "Enter HSN code"
5. Navigate to `/invoices/create`
6. **Verify Placeholders:**
   - Party select: "Select party" or "Choose a party"
   - Item Name: "Enter item name"
   - Quantity: "0" or "Enter quantity"
   - Unit Price: "0.00" or "Enter price"
7. Navigate to `/payments` and click "Record Payment"
8. **Verify Placeholders:**
   - Party select: "Select party"
   - Amount: "0.00" or "Enter amount"
   - Reference Number: "Enter reference number" or "Optional"

#### Test 23.7: Validation Error Messages - Exact Text Verification
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. Leave name empty and submit
3. **Verify Error Message:** "Please enter party name" or "Name is required" (exact text)
4. Enter invalid phone (9 digits)
5. **Verify Error Message:** "Invalid phone number" or "Please enter a valid 10-digit phone number"
6. Enter invalid email
7. **Verify Error Message:** "Invalid email address" or "Please enter a valid email"
8. Enter invalid GSTIN
9. **Verify Error Message:** "Invalid GSTIN format" (exact text)
10. Enter invalid PAN
11. **Verify Error Message:** "Invalid PAN format" (exact text)
12. Navigate to `/inventory` and click "Add Item"
13. Leave name empty and submit
14. **Verify Error Message:** "Item name is required" or "Please enter item name"
15. Leave selling price empty and submit
16. **Verify Error Message:** "Selling price is required" or "Please enter selling price"
17. Enter negative quantity
18. **Verify Error Message:** "Quantity must be greater than 0" or similar
19. Navigate to `/invoices/create`
20. Leave party unselected and submit
21. **Verify Error Message:** "Please select a party" (exact text)
22. Leave invoice date empty
23. **Verify Error Message:** "Invoice date is required" (exact text)
24. Add item with empty name
25. **Verify Error Message:** "Item name is required" (exact text)
26. Add item with zero quantity
27. **Verify Error Message:** "Quantity must be greater than 0" (exact text)

#### Test 23.8: Empty State Messages - Exact Text Verification
**Steps:**
1. Navigate to `/parties` with no parties
2. **Verify Empty State Message:** "No parties found" or "No parties yet" (exact text)
3. **Verify Empty State Action:** "Add Party" button visible
4. Navigate to `/inventory` with no items
5. **Verify Empty State Message:** "No items found" or "No items yet" (exact text)
6. Navigate to `/invoices` with no invoices
7. **Verify Empty State Message:** "No invoices found" or "No invoices yet" (exact text)
8. Navigate to `/payments` with no payments
9. **Verify Empty State Message:** "No payments found" or "No payments yet" (exact text)
10. Navigate to party detail with no invoices
11. **Verify Empty State Message:** "No invoices yet" (exact text)
12. Navigate to party detail with no payments
13. **Verify Empty State Message:** "No payments yet" (exact text)
14. Navigate to stock adjustment with no items
15. **Verify Empty State Message:** "No items found. Add items first to adjust stock." (exact text)

#### Test 23.9: Loading Messages - Exact Text Verification
**Steps:**
1. Navigate to `/dashboard` (slow network)
2. **Verify Loading Message:** "Loading..." or "Loading dashboard..." (exact text)
3. Navigate to `/parties` (slow network)
4. **Verify Loading Message:** "Loading parties..." or "Loading..." (exact text)
5. Navigate to `/inventory` (slow network)
6. **Verify Loading Message:** "Loading items..." or "Loading..." (exact text)
7. Navigate to `/business/select` (slow network)
8. **Verify Loading Message:** "Loading businesses..." (exact text)
9. Submit form (create party)
10. **Verify Button Text:** "Creating..." or "Submitting..." (exact text)
11. Submit form (create invoice)
12. **Verify Button Text:** "Creating Invoice..." or "Submitting..." (exact text)
13. Delete item
14. **Verify Button Text:** "Deleting..." (exact text)

#### Test 23.10: Confirmation Dialog Messages - Exact Text Verification
**Steps:**
1. Navigate to `/parties`
2. Click delete on a party
3. **Verify Dialog Title:** "Delete Party" (exact text)
4. **Verify Dialog Message:** Contains party name: "Are you sure you want to delete {party name}?" (exact format)
5. **Verify Confirm Button:** "Delete" (exact text)
6. **Verify Cancel Button:** "Cancel" (exact text)
7. Navigate to `/invoices`
8. Click delete on an invoice
9. **Verify Dialog Title:** "Delete Invoice" (exact text)
10. **Verify Dialog Message:** Contains invoice number (exact format)
11. Navigate to `/inventory`
12. Click delete on an item
13. **Verify Dialog Title:** "Delete Item" (exact text)
14. **Verify Dialog Message:** Contains item name (exact format)
15. Navigate to `/payments`
16. Click delete on a payment
17. **Verify Dialog Title:** "Delete Payment" (exact text)
18. **Verify Dialog Message:** Contains payment amount or reference (exact format)

#### Test 23.11: Date Formats - Consistency Verification
**Steps:**
1. Navigate to `/invoices`
2. **Verify Date Format:** "dd MMM yyyy" (e.g., "22 Dec 2024")
3. **Verify Due Date Format:** "dd MMM" (e.g., "22 Jan")
4. Navigate to `/invoices/:id`
5. **Verify Invoice Date Format:** "dd MMMM yyyy" (e.g., "22 December 2024")
6. Navigate to `/payments`
7. **Verify Payment Date Format:** "dd MMM yyyy" (e.g., "22 Dec 2024")
8. Navigate to `/parties/:id`
9. **Verify Date Formats:** Consistent across all dates
10. Navigate to `/reports`
11. **Verify Date Range Format:** Consistent date picker format
12. **Verify:** All dates use Indian locale (en-IN)
13. **Verify:** All dates display correctly in different timezones

#### Test 23.12: Currency Formats - Consistency Verification
**Steps:**
1. Navigate to `/dashboard`
2. **Verify Currency Format:** "₹1,23,456" (Indian format with commas)
3. **Verify:** No decimal places for large amounts (or 2 decimal places)
4. Navigate to `/invoices`
5. **Verify Invoice Amount Format:** "₹1,23,456" (consistent format)
6. Navigate to `/invoices/:id`
7. **Verify All Amount Formats:**
   - Subtotal: "₹1,23,456.00" (with decimals)
   - Tax: "₹1,23,456.00" (with decimals)
   - Total: "₹1,23,456.00" (with decimals)
8. Navigate to `/payments`
9. **Verify Payment Amount Format:** "₹1,23,456" (consistent)
10. **Verify:** Payment In shows "+₹" (green)
11. **Verify:** Payment Out shows "-₹" (red)
12. Navigate to `/parties/:id`
13. **Verify Balance Format:** "₹1,23,456" (consistent)
14. Navigate to `/inventory/:id`
15. **Verify Stock Value Format:** "₹1,23,456" (consistent)
16. **Verify:** All currency uses ₹ symbol (not $ or other)
17. **Verify:** All currency uses Indian number format (lakhs, crores)

#### Test 23.13: Number Formats - Consistency Verification
**Steps:**
1. Navigate to `/inventory`
2. **Verify Stock Format:** "100 pcs" or "100.5 kg" (with unit)
3. Navigate to `/invoices/create`
4. **Verify Quantity Format:** Accepts decimals if unit allows
5. **Verify Unit Price Format:** "1,234.56" (with decimals)
6. Navigate to `/parties/:id`
7. **Verify Invoice Count:** "5" (no decimals, no commas for small numbers)
8. Navigate to `/dashboard`
9. **Verify Stats Format:**
   - Large numbers: "1,23,456" (with commas)
   - Small numbers: "5" (no commas)
10. Navigate to `/reports`
11. **Verify Percentage Format:** "18.5%" or "18%" (consistent)
12. **Verify:** All percentages show % symbol
13. **Verify:** All numbers use Indian locale formatting

#### Test 23.14: Phone Number Format - Validation & Display
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. Enter phone: "1234567890"
3. **Verify:** Accepts 10 digits
4. **Verify Format:** Displays as entered or formatted
5. Enter invalid phone: "12345"
6. **Verify Error:** "Invalid phone number" or "Please enter a valid 10-digit phone number"
7. Enter phone starting with 0-5: "5123456789"
8. **Verify Error:** "Invalid phone number" (must start with 6-9)
9. Navigate to `/parties/:id`
10. **Verify Phone Display:** "9876543210" or formatted as "(987) 654-3210"
11. Click phone call button
12. **Verify:** Opens `tel:` link with correct format

#### Test 23.15: Email Format - Validation & Display
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. Enter invalid email: "invalid"
3. **Verify Error:** "Invalid email address" (exact text)
4. Enter invalid email: "invalid@"
5. **Verify Error:** "Invalid email address"
6. Enter valid email: "test@example.com"
7. **Verify:** Accepts and saves
8. Navigate to `/parties/:id`
9. **Verify Email Display:** "test@example.com" (exact format)
10. Click email link (if exists)
11. **Verify:** Opens `mailto:` link with correct email

#### Test 23.16: GSTIN Format - Validation & Display
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. Enter invalid GSTIN: "12345"
3. **Verify Error:** "Invalid GSTIN format" (exact text)
4. Enter invalid GSTIN: "27AABCU9603R1ZX" (wrong length)
5. **Verify Error:** "Invalid GSTIN format"
6. Enter valid GSTIN: "27AABCU9603R1ZX"
7. **Verify:** Accepts and saves
8. Navigate to `/parties/:id`
9. **Verify GSTIN Display:** "27AABCU9603R1ZX" (exact format, uppercase)

#### Test 23.17: PAN Format - Validation & Display
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. Enter invalid PAN: "12345"
3. **Verify Error:** "Invalid PAN format" (exact text)
4. Enter invalid PAN: "ABCDE1234" (wrong format)
5. **Verify Error:** "Invalid PAN format"
6. Enter valid PAN: "AABCU9603R"
7. **Verify:** Accepts and saves
8. Navigate to `/parties/:id`
9. **Verify PAN Display:** "AABCU9603R" (exact format, uppercase)

#### Test 23.18: Pincode Format - Validation & Display
**Steps:**
1. Navigate to `/parties` and click "Add Party"
2. Enter invalid pincode: "12345"
3. **Verify Error:** "Invalid pincode" or "Pincode must be 6 digits"
4. Enter invalid pincode: "1234567"
5. **Verify Error:** "Invalid pincode"
6. Enter valid pincode: "400001"
7. **Verify:** Accepts and saves
8. Navigate to `/parties/:id`
9. **Verify Pincode Display:** "400001" (exact format)

#### Test 23.19: Card Titles & Descriptions - Exact Text Verification
**Steps:**
1. Navigate to `/dashboard`
2. **Verify Card Titles:**
   - "Total Sales" (exact text)
   - "Outstanding" (exact text)
   - "Total Parties" (exact text)
   - "Low Stock" (exact text)
3. **Verify Card Descriptions:**
   - "X invoices" (exact format)
   - "X pending" (exact format)
   - "X customers" (exact format)
   - "X items" (exact format)
4. Navigate to `/parties/:id`
5. **Verify Card Titles:**
   - "Total Invoiced" (exact text)
   - "Total Paid" (exact text)
   - "Balance" (exact text)
   - "Invoices" (exact text)
6. **Verify Card Descriptions:**
   - "Contact Information" (exact text)
   - "Account Summary" (exact text)
   - "Recent Invoices" (exact text)
   - "Recent Payments" (exact text)
7. Navigate to `/inventory/:id`
8. **Verify Card Titles:**
   - "Current Stock" (exact text)
   - "Stock Value" (exact text)
   - "Selling Price" (exact text)
   - "Margin" (exact text)
9. Navigate to `/invoices/:id`
10. **Verify Card Titles:**
    - "Subtotal" (exact text)
    - "Tax" (exact text)
    - "Total" (exact text)
    - "Payment Status" (exact text)

#### Test 23.20: Table Headers - Exact Text Verification
**Steps:**
1. Navigate to `/parties`
2. **Verify Table Headers (if table view):**
   - "Name" (exact text)
   - "Type" (exact text)
   - "Phone" (exact text)
   - "Email" (exact text)
   - "Balance" (exact text)
   - "Actions" (exact text)
3. Navigate to `/invoices`
4. **Verify Table Headers:**
   - "Invoice Number" (exact text)
   - "Party" (exact text)
   - "Date" (exact text)
   - "Amount" (exact text)
   - "Status" (exact text)
   - "Actions" (exact text)
5. Navigate to `/payments`
6. **Verify Table Headers:**
   - "Party" (exact text)
   - "Invoice" (exact text)
   - "Date" (exact text)
   - "Amount" (exact text)
   - "Mode" (exact text)
   - "Actions" (exact text)
7. Navigate to `/inventory`
8. **Verify Table Headers:**
   - "Item Name" (exact text)
   - "SKU" (exact text)
   - "Stock" (exact text)
   - "Price" (exact text)
   - "Actions" (exact text)

#### Test 23.21: Status Badge Text - Exact Text Verification
**Steps:**
1. Navigate to `/invoices`
2. **Verify Status Badges:**
   - "PENDING" (uppercase, exact text)
   - "PAID" (uppercase, exact text)
   - "OVERDUE" (uppercase, exact text)
   - "CANCELLED" (uppercase, exact text)
3. Navigate to `/parties`
4. **Verify Type Badges:**
   - "CUSTOMER" (uppercase, exact text)
   - "SUPPLIER" (uppercase, exact text)
   - "BOTH" (uppercase, exact text)
5. Navigate to `/inventory`
6. **Verify Low Stock Badge:**
   - "LOW STOCK" (uppercase, exact text)
7. Navigate to `/payments`
8. **Verify Payment Type Badges:**
   - "PAYMENT IN" (uppercase, exact text)
   - "PAYMENT OUT" (uppercase, exact text)

#### Test 23.22: Tooltip Text - Exact Text Verification
**Steps:**
1. Navigate to `/dashboard`
2. Hover over module cards
3. **Verify Tooltips:** Show module descriptions (if tooltips exist)
4. Navigate to `/parties`
5. Hover over action buttons (three dots menu)
6. **Verify Tooltips:**
   - "View" (exact text)
   - "Edit" (exact text)
   - "Delete" (exact text)
   - "Call" (exact text, if phone exists)
7. Navigate to sidebar (collapsed)
8. Hover over icons
9. **Verify Tooltips:** Show navigation item names (exact text)
10. Navigate to bottom nav (mobile)
11. Hover over FAB
12. **Verify Tooltip:** "Quick Actions" (exact text)

#### Test 23.23: Help Page Content - Exact Text Verification
**Steps:**
1. Navigate to `/help`
2. **Verify Page Title:** "Help & Support" (exact text)
3. **Verify Section Titles:**
   - "Help Resources" (exact text)
   - "Contact Support" (exact text)
   - "Frequently Asked Questions" (exact text)
4. **Verify Resource Titles:**
   - "Documentation" (exact text)
   - "Video Tutorials" (exact text)
   - "FAQs" (exact text)
5. **Verify Contact Options:**
   - "Email Support" (exact text)
   - "Phone Support" (exact text)
   - "Live Chat" (exact text)
6. **Verify FAQ Questions:** Exact text for each question
7. **Verify FAQ Answers:** Exact text for each answer

#### Test 23.24: Error Page Messages - Exact Text Verification
**Steps:**
1. Navigate to invalid route: `/invalid-page`
2. **Verify Error Message:** "404 - Page Not Found" or "Page not found" (exact text)
3. Navigate to `/parties/:id` with invalid ID
4. **Verify Error Message:** "Party not found" (exact text)
5. Navigate to `/invoices/:id` with invalid ID
6. **Verify Error Message:** "Invoice not found" (exact text)
7. Navigate to `/inventory/:id` with invalid ID
8. **Verify Error Message:** "Item not found" (exact text)
9. Navigate to `/payments/:id` with invalid ID
10. **Verify Error Message:** "Payment not found" (exact text)
11. Trigger network error
12. **Verify Error Message:** "Network error" or "Failed to load data" (exact text)

#### Test 23.25: All UI Text Consistency - Cross-Page Verification
**Steps:**
1. **Verify:** All "Create" buttons use consistent text
2. **Verify:** All "Edit" buttons use consistent text
3. **Verify:** All "Delete" buttons use consistent text
4. **Verify:** All "Cancel" buttons use consistent text
5. **Verify:** All "Save" buttons use consistent text
6. **Verify:** All "Back" buttons use consistent text
7. **Verify:** All "Submit" buttons use consistent text
8. **Verify:** All "Loading..." messages use consistent text
9. **Verify:** All "No data" messages use consistent text
10. **Verify:** All error messages use consistent format
11. **Verify:** All success messages use consistent format
12. **Verify:** All date formats consistent across pages
13. **Verify:** All currency formats consistent across pages
14. **Verify:** All number formats consistent across pages

---

## DTO Field Reference: Mandatory vs Optional

### CreatePartyDto
**Mandatory Fields:**
- `name` (string, 2-200 chars)
- `type` (enum: 'customer', 'supplier', 'both')

**Optional Fields:**
- `phone` (string, 10 digits, pattern: `^[6-9][0-9]{9}$`)
- `email` (valid email format)
- `gstin` (string, 15 chars, GSTIN format)
- `pan` (string, 10 chars, PAN format)
- `billing_address_line1`, `billing_address_line2`, `billing_city`, `billing_state`, `billing_pincode` (6 digits)
- `shipping_same_as_billing` (boolean)
- `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`
- `opening_balance` (number, >= 0)
- `opening_balance_type` (enum: 'credit', 'debit')
- `credit_limit` (number, >= 0)
- `credit_period_days` (number, >= 0)
- `notes` (string)
- `tags` (array of strings)

### CreateItemDto
**Mandatory Fields:**
- `name` (string, 2-200 chars)
- `selling_price` (number, >= 0)

**Optional Fields:**
- `category_id` (UUID)
- `unit_id` (UUID)
- `sku` (string, 1-50 chars)
- `barcode` (string, 1-50 chars)
- `hsn_code` (string, 4-8 chars)
- `sac_code` (string, 4-6 chars)
- `description` (string)
- `inventory_type` (enum: 'raw_material', 'wip', 'finished_goods', 'trading_goods', 'consumables', 'services')
- `purchase_price` (number, >= 0)
- `mrp` (number, >= 0)
- `discount_percent` (number, 0-100)
- `tax_rate` (number, 0-100)
- `cess_rate` (number, 0-100)
- `tax_inclusive` (boolean)
- `current_stock` (number, >= 0)
- `low_stock_threshold` (number, >= 0)
- `track_stock` (boolean)
- `track_serial` (boolean)
- `track_batch` (boolean)

### CreateInvoiceDto
**Mandatory Fields:**
- `party_id` (UUID)
- `invoice_type` (enum: 'sale', 'purchase', 'quotation', 'proforma')
- `invoice_date` (date string, ISO format)
- `items` (array of InvoiceItemDto, at least 1 item)

**Optional Fields:**
- `due_date` (date string, ISO format) - defaults to 30 days from invoice_date
- `place_of_supply` (string)
- `is_interstate` (boolean)
- `is_export` (boolean)
- `is_rcm` (boolean)
- `terms` (string)
- `notes` (string)

### InvoiceItemDto (within CreateInvoiceDto)
**Mandatory Fields:**
- `item_name` (string, 2-200 chars)
- `quantity` (number, >= 0)
- `unit_price` (number, >= 0)

**Optional Fields:**
- `item_id` (UUID)
- `item_description` (string)
- `hsn_code` (string, 4-8 chars)
- `unit` (string)
- `discount_percent` (number, >= 0)
- `tax_rate` (number, >= 0)
- `cess_rate` (number, >= 0)

### CreatePaymentDto
**Mandatory Fields:**
- `party_id` (UUID)
- `transaction_type` (enum: 'payment_in', 'payment_out')
- `transaction_date` (date string, ISO format)
- `amount` (number, > 0)
- `payment_mode` (enum: 'cash', 'bank', 'upi', 'cheque', 'credit', 'card')

**Optional Fields:**
- `invoice_id` (UUID)
- `reference_number` (string, 1-100 chars)
- `bank_name` (string, 1-100 chars)
- `cheque_number` (string, 1-20 chars)
- `cheque_date` (date string, ISO format)
- `notes` (string)

### CreateBusinessDto
**Mandatory Fields:**
- `name` (string, 2-200 chars)

**Optional Fields:**
- `type` (string: 'retailer', 'wholesaler', 'manufacturer', 'service', 'other')
- `gstin` (string, 15 chars, GSTIN format)
- `pan` (string, 10 chars, PAN format)
- `phone` (string)
- `email` (valid email format)
- `address_line1`, `address_line2` (string)
- `city`, `state` (string)
- `pincode` (string, 6 digits)

### SendOtpDto
**Mandatory Fields:**
- `phone` (string, 10 digits, pattern: `^[6-9][0-9]{9}$`)
- `purpose` (string, 4-20 chars: 'login', 'registration', 'verification')

**Optional Fields:**
- None

### VerifyOtpDto
**Mandatory Fields:**
- `phone` (string, 10 digits, pattern: `^[6-9][0-9]{9}$`)
- `otp` (string, 6 digits, pattern: `^\d{6}$`)
- `otp_id` (string, from send-otp response)

**Optional Fields:**
- `device_info` (object, Record<string, any>)

### RefreshTokenDto
**Mandatory Fields:**
- `refresh_token` (string)

**Optional Fields:**
- None

### UpdatePartyDto / UpdateItemDto / UpdateBusinessDto / UpdateUserProfileDto
**Mandatory Fields:**
- None (all fields optional for updates)

**Optional Fields:**
- All fields from corresponding Create DTO are optional

### StockAdjustmentDto
**Mandatory Fields:**
- `item_id` (UUID)
- `adjustment_type` (enum: 'increase', 'decrease', 'set')
- `quantity` (number, >= 0)

**Optional Fields:**
- `rate` (number, >= 0)
- `reason` (string)
- `notes` (string)

---

## Complete Test Coverage Checklist

### ✅ Core CRUD Operations
- [x] Authentication (Login, OTP, Token Refresh)
- [x] Business (Create, Read, Update, Delete)
- [x] Parties (Create, Read, Update, Delete, Search, Filter, Ledger)
- [x] Inventory (Create, Read, Update, Delete, Stock Adjustment, History)
- [x] Invoices (Create, Read, Update, Delete, Multiple Items, Discounts, GST)
- [x] Payments (Create, Read, Delete, Filters, Advance Payments)

### ✅ UI Features
- [x] Dashboard (Stats, Calculations, Refresh, Module Cards, Logout)
- [x] Reports (All Types: Overview/Sales/Purchases/Parties/Stock/GST, Date Range, Export)
- [x] Settings (Profile, Business, Theme, Notifications, Avatar)
- [x] Navigation (Sidebar, BottomNav, CommandMenu, User Menu, Deep Linking, Back/Forward)
- [x] Profile Page (View, Update)
- [x] Help Page (Resources, FAQs, Contact Info)
- [x] Home Page (Redirect Logic)
- [x] Stock Adjustment Page (Dedicated page, not just dialog)
- [x] New/Edit Pages (Dedicated pages for Parties, Items, Payments, Invoices)
- [x] Detail Pages (Party, Item, Payment, Invoice with all features)

### ✅ Export & PDF
- [x] Dashboard Export PDF
- [x] Invoice PDF Download
- [x] Invoice Print
- [x] Excel Export (Parties, Inventory, Invoices, Payments)
- [x] Reports Export (PDF, Excel, CSV, JSON)

### ✅ Business Logic
- [x] GST Calculations (Intra-state CGST+SGST, Inter-state IGST)
- [x] Discount Calculations
- [x] Multiple Items with Different Tax Rates
- [x] Party Balance Calculations
- [x] Invoice Totals Formula Verification
- [x] Stock Adjustment Calculations
- [x] Rounding to 2 Decimals

### ✅ Edge Cases & Error Handling
- [x] Empty States
- [x] Invalid Routes (404 handling)
- [x] Session Persistence
- [x] Page Refresh State
- [x] API Error Handling
- [x] Loading States
- [x] Navigation History
- [x] Form Reset on Dialog Close
- [x] Special Characters in Search
- [x] Very Long Text Fields
- [x] Concurrent Operations

### ✅ Cross-Module Integration
- [x] Party → Invoice Flow
- [x] Invoice → Payment Flow
- [x] Inventory → Invoice Flow
- [x] Dashboard Updates After Operations
- [x] Delete Cascade Rules (Party with Invoices, Item with Invoices)

### ✅ Pagination
- [x] Invoice List Pagination
- [x] Payment List Pagination
- [x] Change Page Size

### ✅ Validation Errors
- [x] Missing Required Fields (Name, Type, Party, Invoice Type, Date, Amount, etc.)
- [x] Invalid Formats (Phone, Email, GSTIN, PAN, OTP)
- [x] Duplicate Entries (Phone, Email, GSTIN)
- [x] Invalid Values (Negative, Zero)
- [x] Amount Exceeds Limits
- [x] Mandatory vs Optional Field Validation (All DTOs)
- [x] Field Length Validation (Min/Max)
- [x] Enum Value Validation (Type, Status, Mode)

### ✅ BFF API Endpoints Covered
- [x] Authentication: `/auth/send-otp`, `/auth/verify-otp`, `/auth/refresh-token`
- [x] Sessions: `/auth/sessions` (GET), `/auth/sessions/:id` (DELETE), `/auth/sessions/all` (DELETE)
- [x] Business: `/businesses` (GET, POST, PATCH, DELETE), `/businesses/:id`
- [x] Parties: `/parties` (GET with type/search query, POST, PATCH, DELETE), `/parties/:id`, `/parties/:id/ledger` (with startDate/endDate query)
- [x] Inventory: `/items` (GET with categoryId/search query, POST, PATCH, DELETE), `/items/:id`, `/items/low-stock`, `/stock/adjust`, `/stock/items/:id/history`
- [x] Invoices: `/invoices` (GET with partyId/invoiceType/paymentStatus/status/startDate/endDate/search/page/limit query, POST), `/invoices/:id`
- [x] Payments: `/payments` (GET with partyId/invoiceId/transactionType/startDate/endDate/page/limit query, POST), `/payments/:id`, `/payments/invoices/:invoiceId`
- [x] Users: `/users/profile` (GET, PATCH), `/users/profile/avatar` (POST)

### ✅ Pages Covered (100%)
- [x] `/` - Home (redirect logic)
- [x] `/login` - Login page
- [x] `/dashboard` - Dashboard with stats and module cards
- [x] `/business/select` - Business selection/creation
- [x] `/parties` - Parties list page
- [x] `/parties/new` - New party page
- [x] `/parties/:id` - Party detail page
- [x] `/parties/:id/edit` - Edit party page
- [x] `/inventory` - Inventory list page
- [x] `/inventory/new` - New item page
- [x] `/inventory/:id` - Item detail page
- [x] `/inventory/:id/edit` - Edit item page
- [x] `/inventory/stock` - Stock adjustment page
- [x] `/invoices` - Invoices list page
- [x] `/invoices/create` - Create invoice page
- [x] `/invoices/:id` - Invoice detail page
- [x] `/invoices/:id/edit` - Edit invoice page
- [x] `/payments` - Payments list page
- [x] `/payments/new` - New payment page
- [x] `/payments/:id` - Payment detail page
- [x] `/reports` - Reports page with tabs
- [x] `/settings` - Settings page
- [x] `/profile` - Profile page
- [x] `/help` - Help page
- [x] `/test-input` - Test input page (optional)

### ✅ Components Covered (100%)
- [x] Sidebar (Collapse/expand, navigation, logout)
- [x] BottomNav (Mobile navigation, quick actions FAB)
- [x] CommandMenu (Keyboard shortcuts, command palette)
- [x] Dialogs (Open/close, form dialogs, confirmation dialogs)
- [x] Forms (Validation, error messages, field types)
- [x] Empty States (No data messages, action buttons)
- [x] Loading Skeletons (Card skeletons, list skeletons)
- [x] Error Boundaries (Error handling, retry)
- [x] Toast Notifications (Success, error, auto-dismiss)
- [x] Status Badges (Invoice status, party type, low stock)
- [x] Dropdown Menus (Actions menu, context menus)
- [x] Tables (If used, sorting, pagination)
- [x] Cards (Stats cards, detail cards)
- [x] Buttons (All variants, states, icons)
- [x] Inputs (Text, number, date, select, textarea)
- [x] Page Headers (Title, description, actions)
- [x] Breadcrumbs (If implemented)
- [x] Tabs (Report tabs, filter tabs)

---

## Test Execution Priority

### Priority 1: Critical Path (Run First)
- `01-authentication.spec.ts` - Must pass for all other tests
- `05-invoices.spec.ts` - Core business functionality
- `09-business-logic.spec.ts` - Critical calculations

### Priority 2: Core CRUD (Run Second)
- `03-parties.spec.ts`
- `04-inventory.spec.ts`
- `06-payments.spec.ts`
- `07-dashboard.spec.ts`

### Priority 3: Integration (Run Third)
- `08-cross-module.spec.ts`
- `02-business.spec.ts`

### Priority 4: Additional Features (Run Fourth)
- `10-reports.spec.ts`
- `11-settings.spec.ts`
- `14-export-pdf.spec.ts`
- `15-pagination.spec.ts`
- `16-profile.spec.ts`
- `17-ui-components.spec.ts`
- `18-dedicated-pages.spec.ts`
- `19-page-features.spec.ts`

### Priority 5: Edge Cases & Redirects (Run Last)
- `12-navigation.spec.ts`
- `13-edge-cases.spec.ts`
- `20-home-redirect.spec.ts`
- `21-test-input-page.spec.ts` (Optional - dev page)

### Priority 6: Request/Response Alignment (Critical - Run Before Production)
- `22-request-response-alignment.spec.ts` - Verify all request/response alignments

### Priority 7: UI Text, Formats & Messages (Critical - Run Before Production)
- `23-ui-text-formats-messages.spec.ts` - Verify all UI text, formats, toast messages, labels
  - [ ] All toast messages verified (success, error, warning, info)
  - [ ] All page titles verified
  - [ ] All button labels verified
  - [ ] All form labels verified
  - [ ] All placeholder text verified
  - [ ] All validation error messages verified
  - [ ] All empty state messages verified
  - [ ] All loading messages verified
  - [ ] All confirmation dialog messages verified
  - [ ] All date formats consistent
  - [ ] All currency formats consistent
  - [ ] All number formats consistent
  - [ ] All phone number formats validated
  - [ ] All email formats validated
  - [ ] All GSTIN formats validated
  - [ ] All PAN formats validated
  - [ ] All pincode formats validated
  - [ ] All card titles verified
  - [ ] All table headers verified
  - [ ] All status badge text verified
  - [ ] All tooltip text verified
  - [ ] All help page content verified
  - [ ] All error page messages verified
  - [ ] All UI text consistency verified

---

## Missing Features Not Yet Implemented

The following features may not be implemented yet but should be tested when available:

1. **Invoice UPDATE** - Full UI flow for PATCH endpoint ✅ (Added in Test 18.12)
2. **Payment UPDATE** - Full UI flow (if implemented) - Currently DELETE only exists
3. **Invoice Status Change** - Mark as Paid/Cancelled via UI ✅ (Added in Test 5.15a)
4. **Bulk Operations** - Bulk delete, bulk update (not implemented)
5. **Advanced Filters** - Multi-field filters, saved filters (basic filters exist, advanced may not)
6. **Invoice PDF API Endpoint** - `GET /api/v1/invoices/:id/pdf` (if exists) - Currently client-side PDF generation
7. **Reports API Endpoints** - Dedicated report endpoints (if exists) - Currently uses existing endpoints
8. **User Sessions Management** - View/delete active sessions ✅ (Added in Test 1.6, 1.7, 1.8)
9. **Help/Support Page** - Help content and FAQs ✅ (Added in Test 18.3)
10. **Notifications** - In-app notifications (if implemented)
11. **Stock Adjustment Type "Set"** - Currently only "increase" and "decrease" tested, "set" may exist
12. **Payment DELETE** - Currently only DELETE endpoint exists, UI flow may not be implemented

