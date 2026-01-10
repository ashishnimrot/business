# Field Mappings Documentation

This document provides a comprehensive reference for all field mappings between frontend forms and backend DTOs.

## Overview

Frontend forms may use different field names than the backend DTOs for better UX. This document lists all mappings to ensure consistency across the application.

**Key Principles:**
- Frontend forms use user-friendly field names
- Backend DTOs use standardized field names
- Mutation functions handle the mapping
- Empty strings are excluded from payloads
- `business_id` is never sent (added by backend from JWT token)

---

## Inventory Module

### Create/Update Item

**Frontend Form Fields → Backend DTO Fields:**

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `name` | `name` | Direct mapping, trimmed |
| `selling_price` | `selling_price` | String → Number conversion |
| `purchase_price` | `purchase_price` | String → Number, optional |
| `gst_rate` | `tax_rate` | **MAPPED** - Frontend uses `gst_rate` for display, backend expects `tax_rate` |
| `current_stock` | `current_stock` | String → Integer, optional |
| `low_stock_threshold` | `low_stock_threshold` | String → Integer, optional |
| `sku` | `sku` | Only included if non-empty (trimmed) |
| `hsn_code` | `hsn_code` | Only included if non-empty (trimmed) |
| `description` | `description` | Only included if non-empty (trimmed) |

**Excluded Fields (DO NOT SEND):**
- `business_id` - Added by backend from request context
- `category` (string name) - Backend expects `category_id` (UUID). Not implemented yet.
- `unit` (string name) - Backend expects `unit_id` (UUID). Not implemented yet. Backend uses default unit if not provided.

**Implementation:**
- Function: `buildInventoryItemPayload()` in `/web-app/lib/payload-utils.ts`
- Used in: `/web-app/app/inventory/new/page.tsx`, `/web-app/app/inventory/[id]/edit/page.tsx`

---

## Party Module

### Create/Update Party

**Frontend Form Fields → Backend DTO Fields:**

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `name` | `name` | Direct mapping |
| `type` | `type` | Direct mapping |
| `address` | `billing_address_line1` | **MAPPED** |
| `city` | `billing_city` | **MAPPED** |
| `state` | `billing_state` | **MAPPED** |
| `pincode` | `billing_pincode` | **MAPPED** |
| `balance_type: 'receivable'` | `opening_balance_type: 'debit'` | **MAPPED & CONVERTED** |
| `balance_type: 'payable'` | `opening_balance_type: 'credit'` | **MAPPED & CONVERTED** |
| `opening_balance` | `opening_balance` | String → Number, only if non-zero |
| `gstin` | `gstin` | Only if non-empty |
| `phone` | `phone` | Only if non-empty |
| `email` | `email` | Only if non-empty |

**Business Logic:**
- Receivable (they owe you) = Debit balance (asset)
- Payable (you owe them) = Credit balance (liability)

**Excluded Fields (DO NOT SEND):**
- `business_id` - Added by backend from request context

**Implementation:**
- Used in: `/web-app/app/parties/new/page.tsx`, `/web-app/app/parties/[id]/edit/page.tsx`
- Helper: `convertBalanceType()` in `/web-app/lib/payload-utils.ts`

---

## Invoice Module

### Create/Update Invoice

**Frontend Form Fields → Backend DTO Fields:**

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `party_id` | `party_id` | Direct mapping (UUID) |
| `invoice_type` | `invoice_type` | Direct mapping |
| `invoice_date` | `invoice_date` | Direct mapping (ISO date string) |
| `due_date` | `due_date` | Direct mapping, optional |
| `items[].item_name` | `items[].item_name` | Direct mapping |
| `items[].quantity` | `items[].quantity` | String → Number |
| `items[].unit_price` | `items[].unit_price` | String → Number |
| `items[].gst_rate` | `items[].tax_rate` | **MAPPED** - Frontend uses `gst_rate` for display, backend expects `tax_rate` |
| `items[].item_id` | `items[].item_id` | Direct mapping (UUID), optional |
| `items[].hsn_code` | `items[].hsn_code` | Direct mapping, optional |
| `items[].discount_percent` | `items[].discount_percent` | String → Number, optional |
| `notes` | `notes` | Direct mapping, optional |
| `terms` | `terms` | Direct mapping, optional |

**Excluded Fields (DO NOT SEND):**
- `business_id` - Added by backend from request context
- `subtotal_amount`, `tax_amount`, `total_amount` - Calculated by backend

**Implementation:**
- Used in: `/web-app/app/invoices/create/page.tsx`, `/web-app/app/invoices/[id]/edit/page.tsx`

---

## Payment Module

### Create Payment

**Frontend Form Fields → Backend DTO Fields:**

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `party_id` | `party_id` | Direct mapping (UUID) |
| `invoice_id` | `invoice_id` | Direct mapping (UUID), optional |
| `payment_date` | `transaction_date` | **MAPPED** - Frontend uses `payment_date`, backend expects `transaction_date` |
| `payment_type: 'in'` | `transaction_type: 'payment_in'` | **MAPPED & CONVERTED** |
| `payment_type: 'out'` | `transaction_type: 'payment_out'` | **MAPPED & CONVERTED** |
| `amount` | `amount` | String → Number |
| `payment_mode` | `payment_mode` | Direct mapping |
| `reference_number` | `reference_number` | Only if non-empty |
| `bank_name` | `bank_name` | Only if non-empty |
| `cheque_number` | `cheque_number` | Only if non-empty |
| `cheque_date` | `cheque_date` | Direct mapping, optional |
| `notes` | `notes` | Direct mapping, optional |

**Excluded Fields (DO NOT SEND):**
- `business_id` - Added by backend from request context

**Implementation:**
- Used in: `/web-app/app/payments/new/page.tsx`, `/web-app/app/payments/page.tsx`

---

## Business Module

### Create/Update Business

**Frontend Form Fields → Backend DTO Fields:**

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `name` | `name` | Direct mapping |
| `type` | `type` | Direct mapping, optional |
| `gst_number` | `gstin` | **MAPPED** |
| `pan_number` | `pan` | **MAPPED** |
| `address` | `address_line1` | **MAPPED** |
| `city` | `city` | Direct mapping |
| `state` | `state` | Direct mapping |
| `pincode` | `pincode` | Direct mapping |
| `phone` | `phone` | Direct mapping, optional |
| `email` | `email` | Direct mapping, optional |

**Excluded Fields (DO NOT SEND):**
- `business_id` - Added by backend from request context

**Implementation:**
- Used in: `/web-app/app/business/select/page.tsx`, `/web-app/app/settings/page.tsx`

---

## Common Patterns

### 1. Empty String Handling
All optional string fields are excluded from payloads if they are empty strings. This prevents backend validation errors.

**Example:**
```typescript
// Frontend sends empty string
sku: ""

// Backend receives (field excluded)
// sku is not in payload
```

### 2. Type Conversions
- String numbers → Numbers: `"100"` → `100`
- String integers → Integers: `"10"` → `10`
- String booleans → Booleans: `"true"` → `true`

### 3. Field Name Mappings
Common mappings:
- `gst_rate` → `tax_rate` (Inventory, Invoice items)
- `address` → `billing_address_line1` (Party)
- `payment_date` → `transaction_date` (Payment)
- `payment_type` → `transaction_type` (Payment)

### 4. Value Conversions
- `balance_type: 'receivable'` → `opening_balance_type: 'debit'`
- `balance_type: 'payable'` → `opening_balance_type: 'credit'`
- `payment_type: 'in'` → `transaction_type: 'payment_in'`
- `payment_type: 'out'` → `transaction_type: 'payment_out'`

---

## Files Reference

### Utility Functions
- `/web-app/lib/payload-utils.ts` - Payload building utilities
- `/web-app/lib/types/api.ts` - TypeScript type definitions
- `/web-app/lib/schemas.ts` - Zod validation schemas

### Form Pages
- `/web-app/app/inventory/new/page.tsx` - Create item
- `/web-app/app/inventory/[id]/edit/page.tsx` - Update item
- `/web-app/app/parties/new/page.tsx` - Create party
- `/web-app/app/parties/[id]/edit/page.tsx` - Update party
- `/web-app/app/invoices/create/page.tsx` - Create invoice
- `/web-app/app/invoices/[id]/edit/page.tsx` - Update invoice
- `/web-app/app/payments/new/page.tsx` - Create payment
- `/web-app/app/payments/page.tsx` - Create payment (dialog)

---

## Notes

1. **UUID Fields:** Fields like `category_id`, `unit_id`, `party_id`, `invoice_id` must be UUIDs, not string names. Frontend forms that use string names need to implement UUID lookup.

2. **Business ID:** Never send `business_id` in any payload. The backend extracts it from the JWT token in the request context.

3. **Empty Values:** Empty strings, `null`, and `undefined` are excluded from payloads to prevent validation errors.

4. **Future Work:**
   - Implement category/unit UUID lookup for inventory items
   - Standardize all form field names to match backend DTOs where possible

