import { Page, expect, test } from '@playwright/test';

/**
 * E2E Test Utilities
 * 
 * Shared constants, selectors, and helper functions for all test modules.
 * Expert-level utilities for robust testing with proper error handling.
 */

// Test configuration
export const TEST_CONFIG = {
  phone: '9876543210',
  otp: '129012', // Fixed test OTP
  baseUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:3002',
};

// Test data factories
export const TEST_DATA = {
  createParty: (type: 'customer' | 'supplier' = 'customer') => ({
    name: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now()}`,
    phone: `91${Math.floor(10000000 + Math.random() * 89999999)}`,
    email: `test_${Date.now()}@example.com`,
    address: '123 Test Street, Test City',
    gstin: '27AABCU9603R1ZM',
    type,
  }),
  createItem: () => ({
    name: `Test Product ${Date.now()}`,
    sku: `SKU-${Date.now()}`,
    price: String(Math.floor(100 + Math.random() * 9900)),
    quantity: String(Math.floor(10 + Math.random() * 90)),
    unit: 'Pieces',
    hsn: '1234',
  }),
  createPayment: () => ({
    amount: String(Math.floor(1000 + Math.random() * 9000)),
    mode: 'Cash',
    reference: `REF-${Date.now()}`,
  }),
};

// Selectors (centralized for easy maintenance)
export const SELECTORS = {
  // Common
  pageTitle: 'h1, h2',
  submitButton: 'button[type="submit"]',
  searchInput: 'input[placeholder*="search" i], input[type="search"]',
  menuButton: 'button[aria-haspopup="menu"]',
  dialog: '[role="dialog"], form, .modal',
  table: 'table, [role="grid"], .list',
  
  // Login
  phoneInput: 'input[type="tel"], input[placeholder*="phone" i]',
  otpInput: 'input[type="text"], input[placeholder*="otp" i]',
  sendOtpButton: 'button:has-text("Send OTP")',
  
  // Navigation
  sidebar: 'aside',
  mainContent: 'main',
  
  // Buttons
  addPartyButton: 'button:has-text("Add Party")',
  addItemButton: 'button:has-text("Add Item")',
  recordPaymentButton: 'button:has-text("Record Payment")',
  createInvoiceButton: 'button:has-text("Create Invoice"), a:has-text("Create Invoice"), button:has-text("New Invoice")',
  
  // Form fields
  nameInput: 'input[name="name"], input[placeholder*="name" i]',
  phoneFormInput: 'input[name="phone"], input[placeholder*="phone" i]',
  emailInput: 'input[name="email"], input[placeholder*="email" i]',
  priceInput: 'input[name="price"], input[placeholder*="price" i]',
  quantityInput: 'input[name="quantity"], input[placeholder*="quantity" i]',
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Navigate to a page and wait for it to load
 * Handles potential redirects and ensures page is stable
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  // If redirected to login, something is wrong with auth
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.warn('⚠️ Redirected to login - session may be expired');
  }
}

/**
 * Wait for element and click
 */
export async function waitAndClick(page: Page, selector: string, timeout = 10000): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout });
    await element.click();
    return true;
  } catch {
    return false;
  }
}

/**
 * Fill form input safely
 */
export async function fillInput(page: Page, selector: string, value: string): Promise<boolean> {
  try {
    const input = page.locator(selector).first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if element is visible
 */
export async function isVisible(page: Page, selector: string, timeout = 5000): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for element text
 */
export async function hasText(page: Page, selector: string, text: string | RegExp, timeout = 5000): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout });
    const content = await element.textContent();
    if (typeof text === 'string') {
      return content?.includes(text) ?? false;
    }
    return text.test(content ?? '');
  } catch {
    return false;
  }
}

/**
 * Get element count
 */
export async function getCount(page: Page, selector: string): Promise<number> {
  return page.locator(selector).count();
}

/**
 * Take screenshot on failure (for debugging)
 */
export async function screenshotOnFailure(page: Page, testName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `test-results/screenshots/${testName}-${timestamp}.png` });
}

/**
 * Log test step with visual indicator
 */
export function logStep(step: string, status: 'start' | 'pass' | 'fail' | 'skip' = 'start'): void {
  const icons = {
    start: '🔄',
    pass: '✅',
    fail: '❌',
    skip: '⏭️',
  };
  console.log(`${icons[status]} ${step}`);
}

/**
 * Soft assertion - logs failure but continues test
 */
export async function softExpect(
  condition: boolean | Promise<boolean>, 
  message: string
): Promise<boolean> {
  const result = await condition;
  if (result) {
    logStep(message, 'pass');
  } else {
    logStep(`${message} - SOFT FAIL`, 'fail');
  }
  return result;
}

/**
 * Check for API errors on page
 */
export async function checkNoApiErrors(page: Page): Promise<boolean> {
  const hasError = await isVisible(page, 'text=/error|failed|500|503|network/i', 1000);
  return !hasError;
}

/**
 * Close any open dialogs
 */
export async function closeDialog(page: Page): Promise<void> {
  try {
    // Try clicking close button
    const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Cancel"), button:has-text("×")').first();
    if (await closeBtn.isVisible({ timeout: 1000 })) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  } catch {
    // Try pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
}

/**
 * Configure test with module isolation
 * Each module runs independently - failures don't stop other modules
 */
export function configureModuleTest(
  moduleName: string,
  description: string
) {
  return test.describe(moduleName, () => {
    // Configure test mode to continue on failure
    test.describe.configure({ mode: 'default' });
    
    test.beforeAll(() => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 MODULE: ${moduleName}`);
      console.log(`   ${description}`);
      console.log(`${'='.repeat(60)}\n`);
    });

    test.afterAll(() => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✓ MODULE COMPLETE: ${moduleName}`);
      console.log(`${'='.repeat(60)}\n`);
    });
  });
}

// Export for compatibility with old tests
export async function login(page: Page, phone = TEST_CONFIG.phone, otp = TEST_CONFIG.otp) {
  await page.goto('/login');
  await page.fill(SELECTORS.phoneInput, phone);
  await page.click(SELECTORS.sendOtpButton);
  await page.waitForTimeout(1000);
  await page.fill(SELECTORS.otpInput, otp);
  await page.click(SELECTORS.submitButton);
  await page.waitForURL(/\/(business|dashboard)/);
}

export async function selectBusiness(page: Page) {
  if (page.url().includes('/business/select')) {
    const businessCard = page.locator('[data-testid="business-card"], .cursor-pointer').first();
    if (await businessCard.isVisible({ timeout: 3000 })) {
      await businessCard.click();
    }
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  }
}
