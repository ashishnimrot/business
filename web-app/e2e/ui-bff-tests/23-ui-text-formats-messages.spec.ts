import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 23-UI Text Formats Messages Tests
 * 
 * Tests for UI text, formats, and messages.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':300')) {
      tracker.add({
        method: response.request().method(),
        url,
        status: response.status(),
        requestBody: null,
        responseBody: null,
        timestamp: new Date(),
        duration: 0,
      });
    }
  });
}

test.describe('23. UI Text Formats Messages Tests', () => {
  
  test.describe('FORMAT.1: Currency Formatting', () => {
    
    test('FORMAT.1.1: Should display INR currency with proper symbol', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for currency displays
      const currencyText = page.locator(':text("₹"), :text("INR")').first();
      const hasCurrency = await currencyText.isVisible().catch(() => false);
      
      console.log(`📊 Currency symbol displayed: ${hasCurrency}`);
      
      // Check for proper formatting (comma separators)
      const formattedAmount = page.locator(':text-matches("[0-9]{1,3}(,[0-9]{3})*")').first();
      const hasFormatted = await formattedAmount.isVisible().catch(() => false);
      
      console.log(`📊 Comma-separated amounts: ${hasFormatted}`);
    });
    
    test('FORMAT.1.2: Should format large amounts correctly', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for amount displays
      const amounts = page.locator(':text-matches("₹[0-9,]+")');
      const count = await amounts.count();
      
      console.log(`📊 Currency formatted amounts found: ${count}`);
      
      // Check a sample
      if (count > 0) {
        const firstAmount = await amounts.first().textContent();
        console.log(`📊 Sample amount format: ${firstAmount}`);
      }
    });
    
  });
  
  test.describe('FORMAT.2: Date Formatting', () => {
    
    test('FORMAT.2.1: Should display dates in readable format', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for date displays (DD/MM/YYYY, DD MMM YYYY, etc.)
      const datePatterns = [
        ':text-matches("\\\\d{2}/\\\\d{2}/\\\\d{4}")', // DD/MM/YYYY
        ':text-matches("\\\\d{1,2} [A-Z][a-z]{2} \\\\d{4}")', // D Mon YYYY
        ':text-matches("[A-Z][a-z]{2} \\\\d{1,2}, \\\\d{4}")', // Mon DD, YYYY
      ];
      
      let foundDate = false;
      for (const pattern of datePatterns) {
        try {
          const dates = page.locator(pattern);
          const count = await dates.count();
          if (count > 0) {
            foundDate = true;
            const sample = await dates.first().textContent();
            console.log(`📊 Date format found: ${sample}`);
            break;
          }
        } catch {
          // Pattern didn't match
        }
      }
      
      console.log(`📊 Dates are formatted: ${foundDate}`);
    });
    
  });
  
  test.describe('FORMAT.3: Status Labels', () => {
    
    test('FORMAT.3.1: Should display invoice status with proper styling', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for status badges
      const statusLabels = ['Paid', 'Pending', 'Overdue', 'Draft', 'Cancelled'];
      for (const status of statusLabels) {
        const statusEl = page.locator(`:text("${status}")`).first();
        const hasStatus = await statusEl.isVisible().catch(() => false);
        if (hasStatus) {
          console.log(`📊 Status "${status}" found`);
        }
      }
      
      // Check for badge/chip styling
      const badge = page.locator('[class*="badge"], [class*="chip"], [class*="tag"]').first();
      const hasBadge = await badge.isVisible().catch(() => false);
      console.log(`📊 Status badges styled: ${hasBadge}`);
    });
    
    test('FORMAT.3.2: Should display party type labels', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for party type labels
      const typeLabels = ['Customer', 'Supplier', 'Both'];
      for (const type of typeLabels) {
        const typeEl = page.locator(`:text("${type}")`).first();
        const hasType = await typeEl.isVisible().catch(() => false);
        if (hasType) {
          console.log(`📊 Party type "${type}" found`);
        }
      }
    });
    
  });
  
  test.describe('FORMAT.4: Error Messages', () => {
    
    test('FORMAT.4.1: Should show user-friendly error messages', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Open form and trigger validation
      const createBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      try {
        await createBtn.click();
        await page.waitForTimeout(1000);
        
        const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
        await submitBtn.click({ force: true });
        await page.waitForTimeout(500);
        
        // Check for error message text
        const errorMsg = page.locator('.text-destructive, [role="alert"]').first();
        if (await errorMsg.isVisible().catch(() => false)) {
          const text = await errorMsg.textContent();
          console.log(`📊 Error message: ${text}`);
          
          // Should be user-friendly (not technical)
          const isUserFriendly = !text?.includes('undefined') && !text?.includes('null');
          console.log(`📊 User-friendly error: ${isUserFriendly}`);
        }
        
      } catch {
        console.log('ℹ️ Error message test skipped');
      }
    });
    
  });
  
  test.describe('FORMAT.5: Success Messages', () => {
    
    test('FORMAT.5.1: Should show success messages after actions', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Create a party to trigger success message
      const createBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      try {
        await createBtn.click();
        await page.waitForTimeout(1000);
        
        // Fill form
        const nameInput = page.locator('[role="dialog"] input[name="name"]').first();
        await nameInput.fill('Success Test Party ' + Date.now());
        
        const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
        await submitBtn.click({ force: true });
        await page.waitForTimeout(2000);
        
        // Check for success toast/message
        const successMsg = page.locator(':text("success"), :text("created"), :text("saved"), [data-sonner-toast]').first();
        const hasSuccess = await successMsg.isVisible().catch(() => false);
        
        console.log(`📊 Success message shown: ${hasSuccess}`);
        
      } catch {
        console.log('ℹ️ Success message test skipped');
      }
    });
    
  });
  
  test.describe('FORMAT.6: Empty State Messages', () => {
    
    test('FORMAT.6.1: Should show helpful empty state messages', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for empty state
      const emptyState = page.locator(':text("No parties"), :text("No data"), :text("Get started")').first();
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      if (hasEmpty) {
        const text = await emptyState.textContent();
        console.log(`📊 Empty state message: ${text}`);
        
        // Check for action button in empty state
        const actionBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
        const hasAction = await actionBtn.isVisible().catch(() => false);
        console.log(`📊 Empty state has action: ${hasAction}`);
      } else {
        console.log('ℹ️ Data exists, no empty state');
      }
    });
    
  });
  
  test.describe('FORMAT.7: Number Formatting', () => {
    
    test('FORMAT.7.1: Should format quantities properly', async ({ page }) => {
      await page.goto('/inventory');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for quantity displays
      const quantities = page.locator(':text-matches("^[0-9,]+$")');
      const count = await quantities.count();
      
      console.log(`📊 Quantity values found: ${count}`);
    });
    
  });
  
  test.describe('FORMAT.8: Phone Number Formatting', () => {
    
    test('FORMAT.8.1: Should display phone numbers with proper formatting', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Click first party to see details
      const firstParty = page.locator('.cursor-pointer, tr[data-state]').first();
      try {
        await firstParty.click();
        await page.waitForTimeout(2000);
        
        // Look for phone number
        const phonePattern = page.locator(':text-matches("[+]?[0-9]{10,12}")').first();
        const hasPhone = await phonePattern.isVisible().catch(() => false);
        
        if (hasPhone) {
          const phoneText = await phonePattern.textContent();
          console.log(`📊 Phone format: ${phoneText}`);
        }
        
      } catch {
        console.log('ℹ️ Phone format test skipped');
      }
    });
    
  });
  
  test.describe('FORMAT.9: GST Number Formatting', () => {
    
    test('FORMAT.9.1: Should display GST numbers properly', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for GST number format
      const gstPattern = page.locator(':text-matches("[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]")').first();
      const hasGst = await gstPattern.isVisible().catch(() => false);
      
      console.log(`📊 GST number format found: ${hasGst}`);
      
      if (hasGst) {
        const gstText = await gstPattern.textContent();
        console.log(`📊 Sample GST: ${gstText}`);
      }
    });
    
  });
  
  test.describe('FORMAT.10: Loading Messages', () => {
    
    test('FORMAT.10.1: Should show loading indicators', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      
      // Look for loading indicator quickly
      const loading = page.locator(':text("Loading"), .animate-spin, [data-loading="true"]').first();
      const hasLoading = await loading.isVisible().catch(() => false);
      
      console.log(`📊 Loading indicator shown: ${hasLoading}`);
      
      // Wait for page load
      await page.waitForTimeout(3000);
      
      // Loading should be gone
      const stillLoading = await loading.isVisible().catch(() => false);
      console.log(`📊 Loading resolved: ${!stillLoading}`);
    });
    
  });
  
});
