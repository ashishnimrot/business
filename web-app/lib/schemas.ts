/**
 * Zod Validation Schemas
 * 
 * These schemas match the backend DTOs exactly for type-safe validation.
 * All schemas align with the types defined in ./types/api.ts
 * 
 * **Important Notes:**
 * - These schemas validate form input, which may use strings
 * - The payload builders convert these to the correct types for the API
 * - Field mappings are documented in the payload utility functions
 * 
 * **Common Field Mappings:**
 * - Inventory: `gst_rate` (form) → `tax_rate` (backend)
 * - Party: `address` → `billing_address_line1`, `balance_type` → `opening_balance_type`
 * - Invoice: `gst_rate` (form items) → `tax_rate` (backend items)
 * - Payment: `payment_date` → `transaction_date`, `payment_type` → `transaction_type`
 * 
 * @see ./payload-utils.ts for field mapping implementations
 * @see ./types/api.ts for TypeScript type definitions
 */

import * as z from 'zod';

// ============================================================================
// INVENTORY SCHEMAS
// ============================================================================

/**
 * Item Schema - matches CreateItemDto
 * 
 * **Required Fields:** name, selling_price
 * **All Other Fields:** Optional
 * 
 * **Field Mappings (Form → Backend):**
 * - `tax_rate` (form) → `tax_rate` (backend) - Direct mapping
 * - Note: Forms may use `gst_rate` for display, but it maps to `tax_rate` in payload
 * - `category` and `unit` are NOT in schema - backend expects UUIDs (category_id, unit_id)
 * 
 * @see buildInventoryItemPayload for field mapping implementation
 */
export const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name too long'),
  selling_price: z.string().min(1, 'Selling price is required').refine(
    (val) => parseFloat(val) >= 0,
    'Selling price must be >= 0'
  ),
  
  // Optional fields - only validate format if value provided
  sku: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 1 && val.trim().length <= 50),
    'SKU must be 1-50 characters'
  ),
  barcode: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 1 && val.trim().length <= 50),
    'Barcode must be 1-50 characters'
  ),
  hsn_code: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 4 && val.trim().length <= 8),
    'HSN code must be 4-8 characters'
  ),
  sac_code: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 4 && val.trim().length <= 6),
    'SAC code must be 4-6 characters'
  ),
  description: z.string().optional(),
  inventory_type: z.enum(['raw_material', 'wip', 'finished_goods', 'trading_goods', 'consumables', 'services']).optional(),
  purchase_price: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Purchase price must be >= 0'
  ),
  mrp: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'MRP must be >= 0'
  ),
  discount_percent: z.string().optional().refine(
    (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
    'Discount must be 0-100'
  ),
  tax_rate: z.string().optional().refine(
    (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
    'Tax rate must be 0-100'
  ),
  cess_rate: z.string().optional().refine(
    (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
    'Cess rate must be 0-100'
  ),
  tax_inclusive: z.boolean().optional(),
  current_stock: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Current stock must be >= 0'
  ),
  low_stock_threshold: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Low stock threshold must be >= 0'
  ),
  track_stock: z.boolean().optional(),
  track_serial: z.boolean().optional(),
  track_batch: z.boolean().optional(),
  
  // Form-only fields (not sent to backend, used for UX)
  // These are kept in schema for form validation but excluded from payload
  category: z.string().optional(), // Display only - backend expects category_id (UUID)
  unit: z.string().optional(), // Display only - backend expects unit_id (UUID)
  opening_stock: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Opening stock must be >= 0'
  ), // Form field name - maps to current_stock in payload
  min_stock_level: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Min stock level must be >= 0'
  ), // Form field name - maps to low_stock_threshold in payload
});

export type ItemFormValues = z.infer<typeof itemSchema>;

/**
 * Stock Adjustment Schema - matches StockAdjustmentDto
 */
export const stockAdjustmentSchema = z.object({
  item_id: z.string().min(1, 'Please select an item'),
  adjustment_type: z.enum(['increase', 'decrease', 'set']),
  quantity: z.string().min(1, 'Quantity is required').refine(
    (val) => parseFloat(val) >= 0,
    'Quantity must be >= 0'
  ),
  rate: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Rate must be >= 0'
  ),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;

// ============================================================================
// PARTY SCHEMAS
// ============================================================================

/**
 * Party Schema - matches CreatePartyDto
 * 
 * **Required Fields:** name, type
 * **All Other Fields:** Optional
 * 
 * **Field Mappings (Form → Backend):**
 * - `address` → `billing_address_line1`
 * - `city` → `billing_city`
 * - `state` → `billing_state`
 * - `pincode` → `billing_pincode`
 * - `balance_type: 'receivable'` → `opening_balance_type: 'debit'`
 * - `balance_type: 'payable'` → `opening_balance_type: 'credit'`
 * 
 * **Note:** This schema uses backend field names. Frontend forms may use different names
 * (e.g., `address` instead of `billing_address_line1`) and map them in mutation functions.
 */
export const partySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name too long'),
  type: z.enum(['customer', 'supplier', 'both']),
  
  // Contact Information - optional, validate format if provided
  phone: z.string().optional().refine(
    (val) => !val || /^[6-9]\d{9}$/.test(val),
    'Invalid phone (10 digits starting with 6-9)'
  ),
  email: z.string().optional().refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid email format'
  ),
  gstin: z.string().optional().refine(
    (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    'Invalid GSTIN format (15 characters required)'
  ),
  pan: z.string().optional().refine(
    (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
    'Invalid PAN format (10 characters required)'
  ),
  
  // Billing Address - all optional
  billing_address_line1: z.string().optional(),
  billing_address_line2: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_pincode: z.string().optional().refine(
    (val) => !val || /^\d{6}$/.test(val),
    'Invalid pincode (6 digits required)'
  ),
  
  // Shipping Address - all optional
  shipping_same_as_billing: z.boolean().optional(),
  shipping_address_line1: z.string().optional(),
  shipping_address_line2: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_pincode: z.string().optional().refine(
    (val) => !val || /^\d{6}$/.test(val),
    'Invalid pincode (6 digits required)'
  ),
  
  // Financial - optional
  opening_balance: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Opening balance must be >= 0'
  ),
  opening_balance_type: z.enum(['credit', 'debit']).optional(),
  credit_limit: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Credit limit must be >= 0'
  ),
  credit_period_days: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Credit period days must be >= 0'
  ),
  
  // Metadata - optional
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type PartyFormValues = z.infer<typeof partySchema>;

// ============================================================================
// INVOICE SCHEMAS
// ============================================================================

/**
 * Invoice Item Schema - matches InvoiceItemDto
 * 
 * **Required Fields:** item_name, quantity, unit_price
 * **All Other Fields:** Optional
 * 
 * **Field Mappings (Form → Backend):**
 * - `tax_rate` (form) → `tax_rate` (backend) - Direct mapping
 * - Note: Forms may use `gst_rate` for display, but it maps to `tax_rate` in payload
 */
export const invoiceItemSchema = z.object({
  item_id: z.string().optional(), // UUID
  item_name: z.string().min(2, 'Item name must be at least 2 characters').max(200, 'Item name too long'),
  item_description: z.string().optional(),
  hsn_code: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 4 && val.trim().length <= 8),
    'HSN code must be 4-8 characters'
  ),
  unit: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required').refine(
    (val) => parseFloat(val) >= 0,
    'Quantity must be >= 0'
  ),
  unit_price: z.string().min(1, 'Price is required').refine(
    (val) => parseFloat(val) >= 0,
    'Unit price must be >= 0'
  ),
  discount_percent: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Discount percent must be >= 0'
  ),
  tax_rate: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Tax rate must be >= 0'
  ),
  cess_rate: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Cess rate must be >= 0'
  ),
});

/**
 * Invoice Schema - matches CreateInvoiceDto
 * REQUIRED: party_id, invoice_type, invoice_date, items (at least 1)
 */
export const invoiceSchema = z.object({
  invoice_type: z.enum(['sale', 'purchase', 'quotation', 'proforma']),
  party_id: z.string().min(1, 'Please select a party'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().optional(),
  place_of_supply: z.string().optional(),
  is_interstate: z.boolean().optional(),
  is_export: z.boolean().optional(),
  is_rcm: z.boolean().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

/**
 * Payment Schema - matches CreatePaymentDto
 * 
 * **Required Fields:** party_id, transaction_type, transaction_date, amount, payment_mode
 * **All Other Fields:** Optional
 * 
 * **Field Mappings (Form → Backend):**
 * - `payment_date` → `transaction_date`
 * - `payment_type: 'in'` → `transaction_type: 'payment_in'`
 * - `payment_type: 'out'` → `transaction_type: 'payment_out'`
 * 
 * **Note:** This schema uses backend field names. Frontend forms may use `payment_date`
 * and `payment_type` and map them in mutation functions.
 */
export const paymentSchema = z.object({
  party_id: z.string().min(1, 'Please select a party'),
  invoice_id: z.string().optional(), // UUID, optional
  transaction_type: z.enum(['payment_in', 'payment_out']),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => parseFloat(val) > 0,
    'Amount must be greater than 0'
  ),
  payment_mode: z.enum(['cash', 'bank', 'upi', 'cheque', 'credit', 'card']),
  reference_number: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 1 && val.trim().length <= 100),
    'Reference number must be 1-100 characters'
  ),
  bank_name: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 1 && val.trim().length <= 100),
    'Bank name must be 1-100 characters'
  ),
  cheque_number: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 1 && val.trim().length <= 20),
    'Cheque number must be 1-20 characters'
  ),
  cheque_date: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

// ============================================================================
// BUSINESS SCHEMAS
// ============================================================================

/**
 * Business Schema - matches CreateBusinessDto
 * REQUIRED: name
 * ALL OTHER FIELDS ARE OPTIONAL
 */
export const businessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(200, 'Name too long'),
  type: z.enum(['retailer', 'wholesaler', 'manufacturer', 'service', 'other']).optional(),
  gstin: z.string().optional().refine(
    (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    'Invalid GSTIN format (15 characters required)'
  ),
  pan: z.string().optional().refine(
    (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
    'Invalid PAN format (10 characters required)'
  ),
  phone: z.string().optional().refine(
    (val) => !val || /^[6-9]\d{9}$/.test(val),
    'Invalid phone (10 digits starting with 6-9)'
  ),
  email: z.string().optional().refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid email format'
  ),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional().refine(
    (val) => !val || /^\d{6}$/.test(val),
    'Invalid pincode (6 digits required)'
  ),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

/**
 * Category Schema - matches CreateCategoryDto
 */
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100, 'Name too long'),
  parent_id: z.string().optional(), // UUID
  description: z.string().optional(),
  sort_order: z.string().optional().refine(
    (val) => !val || parseFloat(val) >= 0,
    'Sort order must be >= 0'
  ),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ============================================================================
// UNIT SCHEMAS
// ============================================================================

/**
 * Unit Schema - matches CreateUnitDto
 */
export const unitSchema = z.object({
  name: z.string().min(2, 'Unit name must be at least 2 characters').max(50, 'Name too long'),
  short_name: z.string().min(1, 'Short name is required').max(10, 'Short name too long'),
  is_default: z.boolean().optional(),
  decimal_places: z.string().optional().refine(
    (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 5),
    'Decimal places must be 0-5'
  ),
});

export type UnitFormValues = z.infer<typeof unitSchema>;

