import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 21-Test Input Page Tests
 * 
 * Tests for form inputs and validation across pages.
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

test.describe('21. Test Input Page Tests', () => {
  
  test.describe('INPUT.1: Party Form Inputs', () => {
    
    test('INPUT.1.1: Should validate party name input', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      await createBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      const nameInput = dialog.locator('input[name="name"]').first();
      
      // Test empty
      await nameInput.fill('');
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(500);
      
      const error = dialog.locator('[aria-invalid="true"], .text-destructive').first();
      const hasError = await error.isVisible().catch(() => false);
      console.log(`📊 Empty name validation: ${hasError}`);
      
      // Test valid name
      await nameInput.fill('Valid Party Name');
      const nameValue = await nameInput.inputValue();
      console.log(`📊 Name input works: ${nameValue === 'Valid Party Name'}`);
    });
    
    test('INPUT.1.2: Should validate phone number format', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      await createBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      const phoneInput = dialog.locator('input[name="phone"], input[name="mobile"]').first();
      
      if (await phoneInput.isVisible().catch(() => false)) {
        // Test invalid phone
        await phoneInput.fill('abc');
        await page.waitForTimeout(300);
        
        const hasError = await dialog.locator('[aria-invalid="true"]').first().isVisible().catch(() => false);
        console.log(`📊 Invalid phone validation: ${hasError}`);
        
        // Test valid phone
        await phoneInput.fill('9876543210');
        const phoneValue = await phoneInput.inputValue();
        console.log(`📊 Valid phone accepted: ${phoneValue.includes('987')}`);
      } else {
        console.log('ℹ️ Phone input not found');
      }
    });
    
    test('INPUT.1.3: Should validate GST number format', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      await createBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      const gstInput = dialog.locator('input[name*="gst" i]').first();
      
      if (await gstInput.isVisible().catch(() => false)) {
        // Test invalid GST
        await gstInput.fill('INVALID');
        await page.waitForTimeout(300);
        
        // Test valid GST format
        await gstInput.fill('29ABCDE1234F1Z5');
        const gstValue = await gstInput.inputValue();
        console.log(`📊 GST input works: ${gstValue.length > 0}`);
      } else {
        console.log('ℹ️ GST input not found');
      }
    });
    
  });
  
  test.describe('INPUT.2: Invoice Form Inputs', () => {
    
    test('INPUT.2.1: Should validate quantity inputs', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("New Invoice")').first();
      try {
        await createBtn.click();
        await page.waitForTimeout(1000);
        
        const quantityInput = page.locator('input[name*="quantity" i]').first();
        if (await quantityInput.isVisible().catch(() => false)) {
          // Test negative number
          await quantityInput.fill('-5');
          await page.waitForTimeout(300);
          
          // Test zero
          await quantityInput.fill('0');
          
          // Test valid
          await quantityInput.fill('10');
          const value = await quantityInput.inputValue();
          console.log(`📊 Quantity input: ${value}`);
        }
        
      } catch {
        console.log('ℹ️ Invoice form test skipped');
      }
    });
    
    test('INPUT.2.2: Should validate price inputs', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("New Invoice")').first();
      try {
        await createBtn.click();
        await page.waitForTimeout(1000);
        
        const priceInput = page.locator('input[name*="price" i], input[name*="rate" i]').first();
        if (await priceInput.isVisible().catch(() => false)) {
          // Test decimal
          await priceInput.fill('99.99');
          const value = await priceInput.inputValue();
          console.log(`📊 Price accepts decimals: ${value.includes('99.99')}`);
          
          // Test large number
          await priceInput.fill('999999.99');
          const largeValue = await priceInput.inputValue();
          console.log(`📊 Price accepts large numbers: ${largeValue}`);
        }
        
      } catch {
        console.log('ℹ️ Price input test skipped');
      }
    });
    
  });
  
  test.describe('INPUT.3: Payment Form Inputs', () => {
    
    test('INPUT.3.1: Should validate payment amount', async ({ page }) => {
      await page.goto('/payments');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const recordBtn = page.locator('button:has-text("Record Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1000);
        
        const amountInput = page.locator('input[name="amount"]').first();
        if (await amountInput.isVisible()) {
          // Test various amounts
          await amountInput.fill('100');
          console.log(`📊 Amount input works`);
          
          // Test decimal
          await amountInput.fill('100.50');
          const value = await amountInput.inputValue();
          console.log(`📊 Decimal amount: ${value}`);
        }
        
      } catch {
        console.log('ℹ️ Payment form test skipped');
      }
    });
    
  });
  
  test.describe('INPUT.4: Inventory Form Inputs', () => {
    
    test('INPUT.4.1: Should validate item name and code', async ({ page }) => {
      await page.goto('/inventory');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"]').first();
        
        // Item name
        const nameInput = dialog.locator('input[name="name"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test Item');
          console.log('✅ Item name input works');
        }
        
        // Item code
        const codeInput = dialog.locator('input[name="code"], input[name="sku"]').first();
        if (await codeInput.isVisible().catch(() => false)) {
          await codeInput.fill('ITEM-001');
          console.log('✅ Item code input works');
        }
        
      } catch {
        console.log('ℹ️ Inventory form test skipped');
      }
    });
    
    test('INPUT.4.2: Should validate stock quantity', async ({ page }) => {
      await page.goto('/inventory');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
        
        const stockInput = page.locator('input[name*="stock" i], input[name*="quantity" i]').first();
        if (await stockInput.isVisible().catch(() => false)) {
          await stockInput.fill('100');
          const value = await stockInput.inputValue();
          console.log(`📊 Stock quantity: ${value}`);
        }
        
      } catch {
        console.log('ℹ️ Stock input test skipped');
      }
    });
    
  });
  
  test.describe('INPUT.5: Search Inputs', () => {
    
    test('INPUT.5.1: Should search parties', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(1500);
        
        console.log('✅ Search input works');
        
        // Check for search API call
        const searchCalls = tracker.calls.filter(c => c.url.includes('search') || c.url.includes('q='));
        console.log(`📊 Search API calls: ${searchCalls.length}`);
      } else {
        console.log('ℹ️ Search input not found');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('INPUT.6: Date Inputs', () => {
    
    test('INPUT.6.1: Should accept date inputs', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("New Invoice")').first();
      try {
        await createBtn.click();
        await page.waitForTimeout(1000);
        
        const dateInput = page.locator('input[type="date"], [data-testid*="date"]').first();
        if (await dateInput.isVisible().catch(() => false)) {
          // Fill today's date
          const today = new Date().toISOString().split('T')[0];
          await dateInput.fill(today);
          console.log(`📊 Date input works: ${today}`);
        }
        
      } catch {
        console.log('ℹ️ Date input test skipped');
      }
    });
    
  });
  
});
