/**
 * Payload Utilities
 * Standardized functions for cleaning and mapping form data to API payloads
 * 
 * These utilities ensure consistent payload formatting across all modules
 * to prevent validation errors and field mapping issues.
 */

import type { CreateItemPayload } from './types/api';

// Re-export types for convenience
export type {
  CreateItemPayload,
  UpdateItemPayload,
  StockAdjustmentPayload,
  CreatePartyPayload,
  UpdatePartyPayload,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceItemPayload,
  CreatePaymentPayload,
  UpdatePaymentPayload,
  CreateBusinessPayload,
  UpdateBusinessPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateUnitPayload,
  UpdateUnitPayload,
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
} from './types/api';

/**
 * Removes empty strings, null, and undefined values from payload
 * This prevents backend validation errors from empty optional fields
 */
export function cleanPayload<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(data)) {
    // Only include non-empty values
    if (value !== undefined && value !== null && value !== '') {
      // For strings, also check if trimmed value is not empty
      if (typeof value === 'string' && value.trim() === '') {
        continue;
      }
      cleaned[key as keyof T] = value;
    }
  }
  return cleaned;
}

/**
 * Converts string to number safely
 * @param value - String or number value to convert
 * @param defaultValue - Default value if conversion fails or value is empty
 * @returns Parsed number or default value
 */
export function toNumber(value: string | number | undefined, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  if (!value) return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Converts string to integer safely
 * @param value - String or number value to convert
 * @param defaultValue - Default value if conversion fails or value is empty
 * @returns Parsed integer or default value
 */
export function toInt(value: string | number | undefined, defaultValue = 0): number {
  if (typeof value === 'number') return Math.floor(value);
  if (!value) return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Ensures string is not empty before including in payload
 * Trims whitespace and returns undefined if empty
 * @param value - String value to validate
 * @returns Trimmed string or undefined if empty
 */
export function optionalString(value: string | undefined): string | undefined {
  if (!value || value.trim() === '') return undefined;
  return value.trim();
}

/**
 * Validates and converts a number within a range
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Default value if validation fails
 * @returns Validated number or undefined
 */
export function optionalNumberInRange(
  value: string | number | undefined,
  min: number,
  max: number,
  defaultValue?: number
): number | undefined {
  const num = toNumber(value);
  if (isNaN(num)) return defaultValue;
  if (num < min || num > max) return defaultValue;
  return num;
}

/**
 * Field mapping configuration for different modules
 * Maps frontend field names to backend field names
 */
export const FIELD_MAPPINGS = {
  inventory: {
    // Frontend field -> Backend field
    'gst_rate': 'tax_rate',
    // Note: category and unit need UUID lookup, not direct mapping
  },
  party: {
    'address': 'billing_address_line1',
    'city': 'billing_city',
    'state': 'billing_state',
    'pincode': 'billing_pincode',
    'balance_type': 'opening_balance_type', // with value conversion
  },
} as const;

/**
 * Maps field names according to configuration
 * @param data - Source data object
 * @param mappings - Field mapping configuration
 * @returns New object with mapped field names
 */
export function mapFields<T extends Record<string, any>>(
  data: T,
  mappings: Record<string, string>
): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [frontendKey, backendKey] of Object.entries(mappings)) {
    if (frontendKey in data && data[frontendKey] !== undefined && data[frontendKey] !== '') {
      mapped[backendKey] = data[frontendKey];
    }
  }
  
  return mapped;
}

/**
 * Converts party balance_type to opening_balance_type
 * 
 * **Field Mapping:**
 * - `balance_type: 'receivable'` (frontend) → `opening_balance_type: 'debit'` (backend)
 * - `balance_type: 'payable'` (frontend) → `opening_balance_type: 'credit'` (backend)
 * 
 * **Business Logic:**
 * - Receivable = They owe you = Debit balance (asset)
 * - Payable = You owe them = Credit balance (liability)
 * 
 * @param balanceType - Frontend balance type ('receivable' | 'payable')
 * @returns Backend balance type ('debit' | 'credit')
 * 
 * @example
 * ```typescript
 * convertBalanceType('receivable') // Returns 'debit'
 * convertBalanceType('payable')    // Returns 'credit'
 * ```
 */
export function convertBalanceType(balanceType: 'receivable' | 'payable'): 'debit' | 'credit' {
  return balanceType === 'receivable' ? 'debit' : 'credit';
}

/**
 * Formats error messages from backend
 * Handles both single string and array of error messages
 * @param error - Error object from API call
 * @returns Formatted error message string
 */
export function formatApiError(error: any): string {
  if (Array.isArray(error?.response?.data?.message)) {
    return error.response.data.message.join(', ');
  }
  return error?.response?.data?.message || error?.message || 'An error occurred';
}

/**
 * Builds inventory item payload from form data
 * Handles all field mappings, validations, and type conversions
 * 
 * **Field Mappings:**
 * - `gst_rate` (frontend) → `tax_rate` (backend)
 * - `name` → `name` (trimmed)
 * - `selling_price` → `selling_price` (string → number)
 * - `purchase_price` → `purchase_price` (string → number, optional)
 * - `current_stock` → `current_stock` (string → integer, optional)
 * - `low_stock_threshold` → `low_stock_threshold` (string → integer, optional)
 * - `sku`, `hsn_code`, `description` → included only if non-empty (trimmed)
 * 
 * **Excluded Fields:**
 * - `business_id` - Added by backend from request context (JWT token)
 * - `category` (string name) - Backend expects `category_id` (UUID). Not implemented yet.
 * - `unit` (string name) - Backend expects `unit_id` (UUID). Not implemented yet.
 *   Backend will use default unit if `unit_id` is not provided.
 * 
 * **Type Conversions:**
 * - String numbers are converted to numbers/integers
 * - Empty strings are excluded from payload
 * - Tax rate is validated to be 0-100
 * 
 * @param data - Form data from inventory item form
 * @param data.name - Item name (required, trimmed)
 * @param data.sku - SKU code (optional, only if non-empty)
 * @param data.hsn_code - HSN code (optional, only if non-empty, 4-8 chars)
 * @param data.description - Item description (optional, only if non-empty)
 * @param data.purchase_price - Purchase price (optional, string or number)
 * @param data.selling_price - Selling price (required, string or number)
 * @param data.gst_rate - GST rate (optional, mapped to tax_rate, 0-100)
 * @param data.current_stock - Current stock quantity (optional, string or number)
 * @param data.low_stock_threshold - Low stock alert threshold (optional, string or number)
 * @returns Clean payload ready for API (typed as CreateItemPayload)
 * 
 * @example
 * ```typescript
 * const payload = buildInventoryItemPayload({
 *   name: 'Test Item',
 *   selling_price: '100',
 *   gst_rate: '18', // Will be mapped to tax_rate: 18
 *   sku: 'SKU-001',
 * });
 * // Result: { name: 'Test Item', selling_price: 100, tax_rate: 18, sku: 'SKU-001' }
 * ```
 */
export function buildInventoryItemPayload(data: {
  name: string;
  sku?: string;
  hsn_code?: string;
  description?: string;
  purchase_price?: string | number;
  selling_price: string | number;
  gst_rate?: string | number;
  current_stock?: string | number;
  low_stock_threshold?: string | number;
}): CreateItemPayload {
  const payload: CreateItemPayload = {
    name: data.name.trim(),
    selling_price: toNumber(data.selling_price, 0),
  };

  // Only include optional fields if they have values
  const sku = optionalString(data.sku);
  if (sku) payload.sku = sku;
  
  const hsnCode = optionalString(data.hsn_code);
  if (hsnCode) payload.hsn_code = hsnCode;
  
  const description = optionalString(data.description);
  if (description) payload.description = description;
  
  // Map purchase_price
  if (data.purchase_price) {
    const purchasePrice = toNumber(data.purchase_price);
    if (purchasePrice >= 0) {
      payload.purchase_price = purchasePrice;
    }
  }
  
  // Map gst_rate to tax_rate
  if (data.gst_rate !== undefined && data.gst_rate !== '') {
    const taxRate = optionalNumberInRange(data.gst_rate, 0, 100);
    if (taxRate !== undefined) {
      payload.tax_rate = taxRate;
    }
  }
  
  // Map stock fields
  if (data.current_stock !== undefined && data.current_stock !== '') {
    const stock = toInt(data.current_stock);
    if (stock >= 0) {
      payload.current_stock = stock;
    }
  }
  
  if (data.low_stock_threshold !== undefined && data.low_stock_threshold !== '') {
    const threshold = toInt(data.low_stock_threshold);
    if (threshold >= 0) {
      payload.low_stock_threshold = threshold;
    }
  }
  
  // Note: category and unit are NOT sent because:
  // - Backend expects category_id (UUID) and unit_id (UUID)
  // - Frontend has category/unit as strings (names)
  // - Backend will use default unit if unit_id is not provided
  // TODO: Implement category/unit lookup to convert names to UUIDs
  
  // DON'T send business_id - backend gets it from request context

  return payload;
}

