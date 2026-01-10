/**
 * API Payload Types
 * 
 * TypeScript types matching backend DTOs exactly.
 * These types ensure type safety and prevent field mapping errors.
 * 
 * IMPORTANT: These types match the backend DTOs in app/libs/shared/dto/src/
 * DO NOT include business_id - it's added by the backend from request context
 */

// ============================================================================
// INVENTORY TYPES
// ============================================================================

/**
 * Create Item Payload
 * Matches CreateItemDto from backend
 * 
 * **Field Mappings (Frontend → Backend):**
 * - `gst_rate` → `tax_rate` (handled by buildInventoryItemPayload)
 * - `name` → `name` (trimmed)
 * - `selling_price` → `selling_price` (string → number)
 * - `purchase_price` → `purchase_price` (string → number)
 * - `current_stock` → `current_stock` (string → integer)
 * - `low_stock_threshold` → `low_stock_threshold` (string → integer)
 * 
 * **Excluded Fields (DO NOT SEND):**
 * - `business_id` - Added by backend from request context (JWT token)
 * - `category` (string name) - Backend expects `category_id` (UUID). Not implemented yet.
 * - `unit` (string name) - Backend expects `unit_id` (UUID). Not implemented yet.
 * - `gst_rate` - Use `tax_rate` instead
 * 
 * @see buildInventoryItemPayload for field mapping implementation
 */
export interface CreateItemPayload {
  /** Required: Item name (2-200 chars) */
  name: string;
  /** Required: Selling price (>= 0) */
  selling_price: number;
  
  /** Optional: Category UUID (not string name) */
  category_id?: string;
  /** Optional: Unit UUID (not string name) */
  unit_id?: string;
  /** Optional: SKU code (1-50 chars, only if non-empty) */
  sku?: string;
  /** Optional: Barcode (1-50 chars) */
  barcode?: string;
  /** Optional: HSN code (4-8 chars, only if non-empty) */
  hsn_code?: string;
  /** Optional: SAC code (4-6 chars) */
  sac_code?: string;
  /** Optional: Item description */
  description?: string;
  /** Optional: Inventory type */
  inventory_type?: 'raw_material' | 'wip' | 'finished_goods' | 'trading_goods' | 'consumables' | 'services';
  /** Optional: Purchase price (>= 0) */
  purchase_price?: number;
  /** Optional: MRP (>= 0) */
  mrp?: number;
  /** Optional: Discount percent (0-100) */
  discount_percent?: number;
  /** Optional: Tax rate (0-100) - NOT gst_rate */
  tax_rate?: number;
  /** Optional: Cess rate (0-100) */
  cess_rate?: number;
  /** Optional: Tax inclusive pricing */
  tax_inclusive?: boolean;
  /** Optional: Current stock quantity (>= 0) */
  current_stock?: number;
  /** Optional: Low stock alert threshold (>= 0) */
  low_stock_threshold?: number;
  /** Optional: Track stock */
  track_stock?: boolean;
  /** Optional: Track serial numbers */
  track_serial?: boolean;
  /** Optional: Track batch numbers */
  track_batch?: boolean;
}

/**
 * Update Item Payload
 * All fields from CreateItemPayload but optional
 */
export type UpdateItemPayload = Partial<CreateItemPayload>;

/**
 * Stock Adjustment Payload
 */
export interface StockAdjustmentPayload {
  item_id: string; // UUID, required
  adjustment_type: 'increase' | 'decrease' | 'set';
  quantity: number; // >= 0, required
  rate?: number; // >= 0
  reason?: string;
  notes?: string;
}

// ============================================================================
// PARTY TYPES
// ============================================================================

/**
 * Create Party Payload
 * Matches CreatePartyDto from backend
 * 
 * **Field Mappings (Frontend → Backend):**
 * - `address` → `billing_address_line1`
 * - `city` → `billing_city`
 * - `state` → `billing_state`
 * - `pincode` → `billing_pincode`
 * - `balance_type: 'receivable'` → `opening_balance_type: 'debit'`
 * - `balance_type: 'payable'` → `opening_balance_type: 'credit'`
 * 
 * **Excluded Fields (DO NOT SEND):**
 * - `business_id` - Added by backend from request context
 * - `address`, `city`, `state`, `pincode` - Use `billing_*` fields instead
 * - `balance_type` - Use `opening_balance_type` with 'credit'/'debit' values
 * 
 * @see convertBalanceType for balance_type conversion
 */
export interface CreatePartyPayload {
  /** Required: Party name (2-200 chars) */
  name: string;
  /** Required: Party type */
  type: 'customer' | 'supplier' | 'both';
  
  /** Optional: Phone number (10 digits, format: ^[6-9][0-9]{9}$) */
  phone?: string;
  /** Optional: Email address (valid email format) */
  email?: string;
  /** Optional: GSTIN (15 chars, GSTIN format) */
  gstin?: string;
  /** Optional: PAN (10 chars, PAN format) */
  pan?: string;
  
  /** Optional: Billing address line 1 */
  billing_address_line1?: string;
  /** Optional: Billing address line 2 */
  billing_address_line2?: string;
  /** Optional: Billing city */
  billing_city?: string;
  /** Optional: Billing state */
  billing_state?: string;
  /** Optional: Billing pincode (6 digits) */
  billing_pincode?: string;
  
  /** Optional: Shipping same as billing */
  shipping_same_as_billing?: boolean;
  /** Optional: Shipping address line 1 */
  shipping_address_line1?: string;
  /** Optional: Shipping address line 2 */
  shipping_address_line2?: string;
  /** Optional: Shipping city */
  shipping_city?: string;
  /** Optional: Shipping state */
  shipping_state?: string;
  /** Optional: Shipping pincode (6 digits) */
  shipping_pincode?: string;
  
  /** Optional: Opening balance (>= 0) */
  opening_balance?: number;
  /** Optional: Opening balance type - NOT 'receivable'/'payable', use 'credit'/'debit' */
  opening_balance_type?: 'credit' | 'debit';
  /** Optional: Credit limit (>= 0) */
  credit_limit?: number;
  /** Optional: Credit period in days (>= 0) */
  credit_period_days?: number;
  
  /** Optional: Notes */
  notes?: string;
  /** Optional: Tags array */
  tags?: string[];
}

/**
 * Update Party Payload
 * All fields from CreatePartyPayload but optional
 */
export type UpdatePartyPayload = Partial<CreatePartyPayload>;

// ============================================================================
// INVOICE TYPES
// ============================================================================

/**
 * Invoice Item Payload
 * Matches InvoiceItemDto from backend
 * 
 * **Field Mappings (Frontend → Backend):**
 * - `gst_rate` → `tax_rate` (in invoice edit forms)
 * - All other fields map directly
 * 
 * **Note:** Frontend forms may use `gst_rate` for display, but backend expects `tax_rate`.
 * The mutation functions handle this mapping.
 */
export interface InvoiceItemPayload {
  /** Optional: Item UUID */
  item_id?: string;
  /** Required: Item name (2-200 chars) */
  item_name: string;
  /** Optional: Item description */
  item_description?: string;
  /** Optional: HSN code (4-8 chars) */
  hsn_code?: string;
  /** Optional: Unit of measurement */
  unit?: string;
  /** Required: Quantity (>= 0) */
  quantity: number;
  /** Required: Unit price (>= 0) */
  unit_price: number;
  /** Optional: Discount percent (>= 0) */
  discount_percent?: number;
  /** Optional: Tax rate (>= 0) - NOT gst_rate */
  tax_rate?: number;
  /** Optional: Cess rate (>= 0) */
  cess_rate?: number;
}

/**
 * Create Invoice Payload
 * Matches CreateInvoiceDto from backend
 */
export interface CreateInvoicePayload {
  party_id: string; // UUID, required
  invoice_type: 'sale' | 'purchase' | 'quotation' | 'proforma'; // Required
  invoice_date: string; // ISO date string, required
  items: InvoiceItemPayload[]; // Required, at least 1 item
  
  // Optional fields
  due_date?: string; // ISO date string
  place_of_supply?: string;
  is_interstate?: boolean;
  is_export?: boolean;
  is_rcm?: boolean;
  terms?: string;
  notes?: string;
  
  // DO NOT include: business_id (added by backend)
  // DO NOT include: subtotal_amount, tax_amount, total_amount (calculated by backend)
}

/**
 * Update Invoice Payload
 * Similar to CreateInvoicePayload but all fields optional except items
 */
export interface UpdateInvoicePayload {
  invoice_type?: 'sale' | 'purchase' | 'quotation' | 'proforma';
  party_id?: string; // UUID
  invoice_date?: string; // ISO date string
  due_date?: string; // ISO date string
  items?: InvoiceItemPayload[]; // At least 1 if provided
  place_of_supply?: string;
  is_interstate?: boolean;
  is_export?: boolean;
  is_rcm?: boolean;
  terms?: string;
  notes?: string;
  status?: string;
  subtotal_amount?: number;
  tax_amount?: number;
  total_amount?: number;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/**
 * Create Payment Payload
 * Matches CreatePaymentDto from backend
 * 
 * **Field Mappings (Frontend → Backend):**
 * - `payment_date` → `transaction_date`
 * - `payment_type: 'in'` → `transaction_type: 'payment_in'`
 * - `payment_type: 'out'` → `transaction_type: 'payment_out'`
 * 
 * **Excluded Fields (DO NOT SEND):**
 * - `business_id` - Added by backend from request context
 * - `payment_date` - Use `transaction_date` instead
 * - `payment_type` - Use `transaction_type` with 'payment_in'/'payment_out' values
 */
export interface CreatePaymentPayload {
  /** Required: Party UUID */
  party_id: string;
  /** Optional: Invoice UUID */
  invoice_id?: string;
  /** Required: Transaction type */
  transaction_type: 'payment_in' | 'payment_out';
  /** Required: Transaction date (ISO date string) */
  transaction_date: string;
  /** Required: Amount (>= 0) */
  amount: number;
  /** Required: Payment mode */
  payment_mode: 'cash' | 'bank' | 'upi' | 'cheque' | 'credit' | 'card';
  
  /** Optional: Reference number (1-100 chars, only if non-empty) */
  reference_number?: string;
  /** Optional: Bank name (1-100 chars, only if non-empty) */
  bank_name?: string;
  /** Optional: Cheque number (1-20 chars, only if non-empty) */
  cheque_number?: string;
  /** Optional: Cheque date (ISO date string) */
  cheque_date?: string;
  /** Optional: Notes */
  notes?: string;
}

/**
 * Update Payment Payload
 * All fields from CreatePaymentPayload but optional
 */
export type UpdatePaymentPayload = Partial<CreatePaymentPayload>;

// ============================================================================
// BUSINESS TYPES
// ============================================================================

/**
 * Create Business Payload
 * Matches CreateBusinessDto from backend
 */
export interface CreateBusinessPayload {
  name: string; // Required, 2-200 chars
  
  // Optional fields
  type?: 'retailer' | 'wholesaler' | 'manufacturer' | 'service' | 'other';
  gstin?: string; // 15 chars, GSTIN format
  pan?: string; // 10 chars, PAN format
  phone?: string;
  email?: string; // Valid email
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string; // 6 digits
}

/**
 * Update Business Payload
 * Matches UpdateBusinessDto from backend
 */
export interface UpdateBusinessPayload {
  name?: string; // 2-200 chars
  type?: 'retailer' | 'wholesaler' | 'manufacturer' | 'service' | 'other';
  gstin?: string; // 15 chars, GSTIN format
  pan?: string; // 10 chars, PAN format
  phone?: string;
  email?: string; // Valid email
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string; // 6 digits
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

/**
 * Create Category Payload
 */
export interface CreateCategoryPayload {
  name: string; // Required, 2-100 chars
  parent_id?: string; // UUID
  description?: string;
  sort_order?: number; // >= 0
}

/**
 * Update Category Payload
 */
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// ============================================================================
// UNIT TYPES
// ============================================================================

/**
 * Create Unit Payload
 */
export interface CreateUnitPayload {
  name: string; // Required, 2-50 chars
  short_name: string; // Required, 1-10 chars
  is_default?: boolean;
  decimal_places?: number; // 0-5
}

/**
 * Update Unit Payload
 */
export type UpdateUnitPayload = Partial<CreateUnitPayload>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error Response
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  method: string;
}

