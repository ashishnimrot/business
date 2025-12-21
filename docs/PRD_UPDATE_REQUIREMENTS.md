# PRD Update Requirements - Based on New Documentation

**Version:** 1.0  
**Created:** 2025-12-21  
**Status:** Analysis Complete

---

## Executive Summary

We've created comprehensive new documentation:
- ✅ **Database Schema** (110+ tables, fully detailed)
- ✅ **UI/UX Design Brief** (200% clarity, pixel-perfect specs)
- ✅ **MVP Implementation Gaps** (what's blocking us)

**Question:** Does the PRD need updates to reference these new docs?

**Answer:** **YES, but selectively.** The PRD is comprehensive, but needs to be **synchronized** with the new technical specifications.

---

## What Needs Updating in PRD

### 1. Database Schema References ✅ HIGH PRIORITY

**Current State:**
- PRD mentions tables but doesn't specify exact field names
- Tasks reference "store in database" but not specific tables/columns
- No reference to the detailed DATABASE_SCHEMA.md

**What to Update:**

#### Example: Module 1 - User Onboarding

**Current PRD says:**
```
Task 1.1.1: Implement OTP Request API
- Store OTP in database with expiry
```

**Should be:**
```
Task 1.1.1: Implement OTP Request API
- Store OTP in `otp_requests` table (see DATABASE_SCHEMA.md)
- Fields: `phone`, `otp_hash`, `purpose`, `expires_at`, `attempts`
- Hash OTP using bcrypt before storing in `otp_hash` column
- Set `expires_at` to NOW() + 5 minutes
- Set `purpose` to 'registration' or 'login'
```

**Action Items:**
- [ ] Add table name references in all database-related tasks
- [ ] Add column names where specific fields are mentioned
- [ ] Add reference to DATABASE_SCHEMA.md in relevant modules
- [ ] Update foreign key relationships in tasks
- [ ] Add index references for performance-critical queries

**Modules Affected:**
- All 35 modules (every module uses database)

---

### 2. UI/UX Component Specifications ✅ HIGH PRIORITY

**Current State:**
- PRD has user stories and tasks
- UI tasks say "create screen" but don't reference design specs
- No pixel-perfect specifications

**What to Update:**

#### Example: Module 1 - OTP Verification Screen

**Current PRD says:**
```
Task 1.1.3: Build Mobile Registration UI
- Create OTP Input screen with 6 input fields
```

**Should be:**
```
Task 1.1.3: Build Mobile Registration UI
- Create OTP Input screen (see UI_UX_DESIGN_BRIEF.md Section 1.4)
- 6 individual input boxes: 45px × 56px each, 8px spacing
- Auto-advance to next box on input
- Auto-submit when 6th digit entered (300ms delay)
- Resend button: 60-second countdown timer
- Error state: Red border (#EF4444) + shake animation
- Exact specifications: See UI_UX_DESIGN_BRIEF.md for measurements
```

**Action Items:**
- [ ] Add UI_UX_DESIGN_BRIEF.md references to all UI tasks
- [ ] Add specific screen section references (e.g., "Section 1.4: OTP Verification")
- [ ] Update acceptance criteria with exact measurements
- [ ] Add component specifications (button sizes, colors, spacing)
- [ ] Reference design tokens (colors, typography, spacing)

**Modules Affected:**
- Module 1: Authentication screens
- Module 2: Business setup screens
- Module 3: Party management screens
- Module 4: Inventory screens
- Module 5: Invoice creation screens
- Module 6-35: All UI-related modules

---

### 3. API Endpoint Specifications ⚠️ MEDIUM PRIORITY

**Current State:**
- PRD mentions endpoints like `/api/auth/send-otp`
- But no detailed request/response formats
- No reference to API specification document

**What to Update:**

#### Example: Module 1 - OTP Request

**Current PRD says:**
```
Task 1.1.1: Implement OTP Request API
- Create `/api/auth/send-otp` endpoint
```

**Should be:**
```
Task 1.1.1: Implement OTP Request API
- Create `/api/v1/auth/send-otp` endpoint (POST)
- Request Body:
  {
    "country_code": "+91",
    "phone": "9876543210",
    "purpose": "registration" | "login"
  }
- Response (200):
  {
    "otp_id": "uuid",
    "expires_in": 300,
    "message": "OTP sent successfully"
  }
- Error Response (400):
  {
    "error": "INVALID_PHONE",
    "message": "Please enter a valid 10-digit phone number"
  }
- See API_SPECIFICATIONS.md for full details
```

**Action Items:**
- [ ] Add full request/response formats to API tasks
- [ ] Add error response formats
- [ ] Add HTTP method and path details
- [ ] Add authentication requirements
- [ ] Reference API_SPECIFICATIONS.md (when created)

**Modules Affected:**
- All modules with API endpoints (all 35 modules)

---

### 4. Database Relationships & Constraints ⚠️ MEDIUM PRIORITY

**Current State:**
- PRD doesn't specify foreign key relationships
- No mention of constraints or validations at DB level

**What to Update:**

#### Example: Module 3 - Party Management

**Current PRD says:**
```
Task 3.1.1: Create Party API
- Store party in database
```

**Should be:**
```
Task 3.1.1: Create Party API
- Store party in `parties` table (see DATABASE_SCHEMA.md)
- Foreign Key: `business_id` → `businesses.id` (ON DELETE CASCADE)
- Required fields: `name`, `type`, `business_id`
- Unique constraint: None (multiple parties can have same name)
- Indexes: `idx_parties_business`, `idx_parties_name`, `idx_parties_phone`
- Validate GSTIN format (15 characters) if provided
```

**Action Items:**
- [ ] Add foreign key relationships in database tasks
- [ ] Add constraint specifications
- [ ] Add index references for performance
- [ ] Add validation rules at DB level

**Modules Affected:**
- All modules with database operations

---

### 5. MVP Scope Alignment ✅ HIGH PRIORITY

**Current State:**
- PRD has all 35 modules
- MVP.md defines what's in MVP vs post-MVP
- PRD doesn't clearly mark MVP vs post-MVP features

**What to Update:**

#### Add MVP Tags to PRD

**Should add to each module:**
```markdown
## Module 5: Billing & Invoicing

**MVP Status:** ✅ Included in MVP (Sprint 5-8)
**Post-MVP:** Payment gateway integration, Natural language invoice creation

### User Story 5.1: Create Sales Invoice
[MVP] ✅ Included
```

**Action Items:**
- [ ] Add MVP status to each module header
- [ ] Mark user stories as [MVP] or [Post-MVP]
- [ ] Add reference to MVP.md
- [ ] Add sprint numbers for MVP features

**Modules Affected:**
- All 35 modules (need MVP classification)

---

### 6. Technical Implementation Details ⚠️ LOW PRIORITY

**Current State:**
- PRD has tasks and subtasks
- But doesn't reference specific technical decisions

**What to Update:**

#### Add Technical References

**Example:**
```
Task 10.1.1: Setup Local Database
- Use WatermelonDB (see ARCHITECTURE_DIAGRAMS.md)
- Schema must match PostgreSQL schema (see DATABASE_SCHEMA.md)
- Use sync adapter pattern (see OFFLINE_SYNC_STRATEGY.md)
```

**Action Items:**
- [ ] Add references to architecture docs
- [ ] Add references to technical decisions
- [ ] Add links to relevant documentation

---

## Recommended Update Strategy

### Phase 1: Critical Updates (Do First) 🔴

1. **Add Database Schema References**
   - Update all database-related tasks with table/column names
   - Add DATABASE_SCHEMA.md references
   - Time: 2-3 days

2. **Add UI/UX Design References**
   - Link all UI tasks to UI_UX_DESIGN_BRIEF.md
   - Add specific section references
   - Time: 1-2 days

3. **Add MVP Status Tags**
   - Mark MVP vs post-MVP features
   - Add sprint numbers
   - Time: 1 day

### Phase 2: Important Updates (Do Soon) 🟡

4. **Add API Specifications**
   - Full request/response formats
   - Error handling
   - Time: 2-3 days (when API spec doc is ready)

5. **Add Database Relationships**
   - Foreign keys, constraints, indexes
   - Time: 1-2 days

### Phase 3: Nice to Have (Do Later) 🟢

6. **Add Technical References**
   - Architecture links
   - Technical decision docs
   - Time: 1 day

---

## Specific PRD Sections to Update

### Module 1: User Onboarding & Authentication
- [ ] Add `otp_requests` table reference
- [ ] Add `users` table reference
- [ ] Add `refresh_tokens` table reference
- [ ] Link to UI_UX_DESIGN_BRIEF.md Section 1.3, 1.4
- [ ] Add MVP tag: ✅ MVP (Sprint 1-2)

### Module 2: Business Setup
- [ ] Add `businesses` table reference
- [ ] Add `business_users` table reference
- [ ] Link to UI_UX_DESIGN_BRIEF.md Section 1.5
- [ ] Add MVP tag: ✅ MVP (Sprint 1-2)

### Module 3: Party Management
- [ ] Add `parties` table reference
- [ ] Add `party_contacts` table reference
- [ ] Add `ledger_entries` table reference
- [ ] Link to UI_UX_DESIGN_BRIEF.md Section 2.1, 2.2, 2.3
- [ ] Add MVP tag: ✅ MVP (Sprint 3-4)

### Module 4: Inventory Management
- [ ] Add `items` table reference
- [ ] Add `categories` table reference
- [ ] Add `stock_adjustments` table reference
- [ ] Add `item_serials`, `item_batches` tables (advanced)
- [ ] Link to UI_UX_DESIGN_BRIEF.md Section 2.4, 2.5
- [ ] Add MVP tag: ✅ MVP (Sprint 3-4)

### Module 5: Billing & Invoicing
- [ ] Add `invoices` table reference
- [ ] Add `invoice_items` table reference
- [ ] Add `invoice_settings` table reference
- [ ] Link to UI_UX_DESIGN_BRIEF.md Section 3.1, 3.2, 3.3, 3.4
- [ ] Add MVP tag: ✅ MVP (Sprint 5-6)

### Module 6: Accounting & Ledgers
- [ ] Add `chart_of_accounts` table reference
- [ ] Add `transactions` table reference
- [ ] Add `ledger_entries` table reference
- [ ] Add MVP tag: ✅ MVP (Sprint 5-6)

### Module 7: GST Compliance
- [ ] Add `gstr1_returns` table reference
- [ ] Add `gstr3b_returns` table reference
- [ ] Add `e_invoices` table reference
- [ ] Add `e_way_bills` table reference
- [ ] Add `gst_itc_ledger` table reference
- [ ] Add MVP tag: ✅ MVP (Sprint 7-8)

### Module 8: Payments & Receivables
- [ ] Add `receipt_vouchers` table reference
- [ ] Add `payment_vouchers` table reference
- [ ] Add MVP tag: ✅ MVP (Sprint 5-6)

### Module 10: Offline Sync
- [ ] Add `sync_queue` table reference
- [ ] Add `sync_versions` table reference
- [ ] Add MVP tag: ✅ MVP (Sprint 9-12)

### Module 16: TDS & TCS
- [ ] Add `tds_transactions` table reference
- [ ] Add `tds_certificates` table reference
- [ ] Add `tcs_transactions` table reference
- [ ] Add MVP tag: ❌ Post-MVP

### Module 21: Manufacturing
- [ ] Add `bills_of_materials` table reference
- [ ] Add `production_orders` table reference
- [ ] Add `work_orders` table reference
- [ ] Add MVP tag: ❌ Post-MVP

### Module 22: Warehouse Management
- [ ] Add `warehouses` table reference
- [ ] Add `warehouse_stock` table reference
- [ ] Add `warehouse_transfers` table reference
- [ ] Add MVP tag: ❌ Post-MVP

### Module 23: Import/Export
- [ ] Add `import_export_codes` table reference
- [ ] Add `import_orders` table reference
- [ ] Add `export_orders` table reference
- [ ] Add MVP tag: ❌ Post-MVP

### Module 32: Partner Ecosystem
- [ ] Add `partners` table reference
- [ ] Add `business_partner_connections` table reference
- [ ] Add MVP tag: ❌ Post-MVP

### Module 34: Subscriptions
- [ ] Add `subscription_plans` table reference
- [ ] Add `subscriptions` table reference
- [ ] Add MVP tag: ❌ Post-MVP (but needed for beta)

### Module 35: AI/ML
- [ ] Add `ml_models` table reference
- [ ] Add `ml_predictions` table reference
- [ ] Add `ml_recommendations` table reference
- [ ] Add MVP tag: ❌ Post-MVP

---

## Update Template

For each task that needs updating, use this template:

```markdown
#### Task X.X.X: [Task Name]

**Database:**
- Table: `table_name` (see DATABASE_SCHEMA.md)
- Key Fields: `field1`, `field2`, `field3`
- Foreign Keys: `field_id` → `other_table.id`
- Indexes: `idx_table_field`

**UI/UX:**
- Screen: [Screen Name] (see UI_UX_DESIGN_BRIEF.md Section X.X)
- Components: Button (48px height, #4F46E5), Input (48px height)
- Layout: [Description]

**API:**
- Endpoint: `POST /api/v1/resource`
- Request: { ... }
- Response: { ... }
- Errors: { ... }

**MVP Status:** ✅ MVP (Sprint X) | ❌ Post-MVP

**Subtasks:**
1. [Existing subtask with DB reference]
2. [Existing subtask with UI reference]
...
```

---

## Priority Matrix

| Update Type | Priority | Impact | Effort | Do First? |
|------------|----------|--------|--------|-----------|
| Database Schema References | HIGH | HIGH | Medium | ✅ YES |
| UI/UX Design References | HIGH | HIGH | Low | ✅ YES |
| MVP Status Tags | HIGH | MEDIUM | Low | ✅ YES |
| API Specifications | MEDIUM | HIGH | Medium | ⚠️ When API doc ready |
| DB Relationships | MEDIUM | MEDIUM | Low | ⚠️ Soon |
| Technical References | LOW | LOW | Low | 🟢 Later |

---

## Recommendation

**YES, update the PRD, but do it strategically:**

1. **Start with Phase 1** (Critical Updates):
   - Add database schema references
   - Add UI/UX design references
   - Add MVP status tags
   
2. **This will make the PRD:**
   - More actionable for developers
   - Better linked to technical specs
   - Clearer about MVP scope
   - Easier to implement

3. **Don't rewrite everything:**
   - The PRD structure is good
   - Just add references and details
   - Keep existing content

4. **Timeline:**
   - Phase 1: 4-6 days of focused work
   - Phase 2: 3-5 days (when API spec ready)
   - Phase 3: 1 day (nice to have)

---

## Conclusion

**The PRD is comprehensive and well-structured.** It doesn't need a rewrite, but it needs to be **synchronized** with our new detailed technical documentation.

**Key Updates Needed:**
1. ✅ Database table/column references
2. ✅ UI/UX design brief links
3. ✅ MVP status classification
4. ⚠️ API specifications (when ready)
5. ⚠️ Database relationships

**This will make the PRD:**
- More developer-friendly
- Better connected to implementation details
- Clearer about what's MVP vs post-MVP
- Easier to track progress

Let's update it! 🚀

