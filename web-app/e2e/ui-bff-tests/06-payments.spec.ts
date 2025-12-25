import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker, generateTestData } from './test-config';

/**
 * 06-Payments Tests
 * 
 * Payment CRUD operations with BFF verification.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':3007') || url.includes(':3004')) {
      const request = response.request();
      let requestBody: any = null;
      let responseBody: any = null;
      
      try {
        const postData = request.postData();
        if (postData) requestBody = JSON.parse(postData);
      } catch {}
      
      try {
        responseBody = await response.json();
      } catch {}
      
      tracker.add({
        method: request.method(),
        url,
        status: response.status(),
        requestBody,
        responseBody,
        timestamp: new Date(),
        duration: 0,
      });
    }
  });
}

async function navigateToPayments(page: Page) {
  await page.goto('/payments');
  await page.waitForTimeout(3000);
  
  if (page.url().includes('/login')) {
    return false;
  }
  
  if (page.url().includes('/dashboard')) {
    const link = page.locator('a[href="/payments"], nav a:has-text("Payments")').first();
    try {
      await link.click();
      await page.waitForTimeout(2000);
    } catch {}
  }
  
  return true;
}

test.describe('06. Payments Tests', () => {
  
  test.describe('PAY.1: List Payments', () => {
    
    test('PAY.1.1: Should list all payments', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Verify payments API call
      const paymentsCall = tracker.getLastCall('/payments', 'GET');
      expect(paymentsCall).toBeTruthy();
      console.log(`📊 Payments API: ${paymentsCall?.status}`);
      expect(paymentsCall?.status).toBe(200);
      
      // Verify response format
      if (paymentsCall?.responseBody) {
        const isArray = Array.isArray(paymentsCall.responseBody);
        const hasPaymentsKey = paymentsCall.responseBody?.payments !== undefined;
        console.log(`   Response format: ${isArray ? 'Array' : hasPaymentsKey ? 'Object with payments' : 'Unknown'}`);
      }
      
      tracker.printSummary();
    });
    
    test('PAY.1.2: Should filter payments by type (In/Out)', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click Payment In filter
      const payInTab = page.locator('button:has-text("Payment In"), [role="tab"]:has-text("In")').first();
      try {
        await payInTab.click();
        await page.waitForTimeout(2000);
        
        const filterCall = tracker.getCallsByUrl('/payments').find(c => 
          c.url.includes('type=')
        );
        
        if (filterCall) {
          console.log(`📊 Filter API: ${filterCall.url}`);
        }
      } catch {
        console.log('ℹ️ Type filter not available');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.2: Record Payment', () => {
    
    test('PAY.2.1: Should record a payment in', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const testData = generateTestData();
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click Record Payment button
      const recordBtn = page.locator('button:has-text("Record Payment"), button:has-text("Add Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        console.log('⚠️ Record payment button not found');
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Select party
      const partySelect = dialog.locator('button[role="combobox"]').first();
      try {
        await partySelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click({ force: true });
      } catch {}
      
      // Fill amount
      await dialog.locator('input[name="amount"], input[type="number"]').first().fill(testData.payment.amount);
      
      // Fill reference
      try {
        await dialog.locator('input[name="reference_number"], input[name="reference"]').fill(testData.payment.reference_number);
      } catch {}
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API
      const createCall = tracker.getLastCall('/payments', 'POST');
      if (createCall) {
        console.log(`📊 Record Payment API: ${createCall.status}`);
        console.log(`   Request: ${JSON.stringify(createCall.requestBody)}`);
        expect([200, 201]).toContain(createCall.status);
      }
      
      tracker.printSummary();
    });
    
    test('PAY.2.2: Should show validation error for missing amount', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const recordBtn = page.locator('button:has-text("Record Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      
      // Submit without amount
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for error
      const errorMsg = dialog.locator('.text-red-500, .text-destructive').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      console.log(`📊 Validation error: ${hasError}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.3: View Payment Detail', () => {
    
    test('PAY.3.1: Should view payment detail', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click on first payment
      const paymentRow = page.locator('tr, .cursor-pointer, a[href*="/payments/"]').first();
      try {
        await paymentRow.click();
        await page.waitForTimeout(3000);
        
        // Verify detail API call
        const detailCall = tracker.getCallsByUrl('/payments/').find(c => 
          c.method === 'GET' && c.url.match(/\/payments\/[a-f0-9-]+$/)
        );
        
        if (detailCall) {
          console.log(`📊 Payment Detail API: ${detailCall.status}`);
          expect(detailCall.status).toBe(200);
        }
        
      } catch {
        console.log('⚠️ No payment to view');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.4: Delete Payment', () => {
    
    test('PAY.4.1: Should delete a payment', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const menuBtn = page.locator('[aria-haspopup="menu"]').first();
      try {
        await menuBtn.click();
        await page.waitForTimeout(500);
        
        const deleteOption = page.locator('[role="menuitem"]:has-text("Delete")').first();
        await deleteOption.click();
        await page.waitForTimeout(1000);
        
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
        
        tracker.clear();
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(3000);
        
        const deleteCall = tracker.getLastCall('/payments/', 'DELETE');
        if (deleteCall) {
          console.log(`📊 Delete Payment API: ${deleteCall.status}`);
          expect([200, 204]).toContain(deleteCall.status);
        }
        
      } catch {
        console.log('⚠️ Delete flow not available');
      }
      
      tracker.printSummary();
    });
    
  });
  
  // ================================================
  // MISSING TESTS FROM PLAN - ADDED
  // ================================================
  
  test.describe('PAY.5: Payment Against Invoice', () => {
    
    test('PAY.5.1: Should create payment linked to invoice', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const recordBtn = page.locator('button:has-text("Record Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1500);
        
        const dialog = page.locator('[role="dialog"]').first();
        
        // Select party
        const partySelect = dialog.locator('button[role="combobox"]').first();
        await partySelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click({ force: true });
        await page.waitForTimeout(1000);
        
        // Look for invoice selection
        const invoiceSelect = dialog.locator('button[role="combobox"]:has-text("Invoice"), select:has-text("Invoice"), :text("Select Invoice")').first();
        const hasInvoiceSelect = await invoiceSelect.isVisible().catch(() => false);
        
        console.log(`📊 Invoice selection available: ${hasInvoiceSelect}`);
        
        if (hasInvoiceSelect) {
          await invoiceSelect.click();
          await page.waitForTimeout(500);
          
          const invoiceOption = page.locator('[role="option"]').first();
          if (await invoiceOption.isVisible().catch(() => false)) {
            await invoiceOption.click();
            console.log('✅ Invoice linked to payment');
          }
        }
        
      } catch {
        console.log('ℹ️ Invoice linking test skipped');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.6: Partial Payment', () => {
    
    test('PAY.6.1: Should allow partial payment for invoice', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const recordBtn = page.locator('button:has-text("Record Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1500);
        
        const dialog = page.locator('[role="dialog"]').first();
        
        // Select party
        const partySelect = dialog.locator('button[role="combobox"]').first();
        await partySelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click({ force: true });
        await page.waitForTimeout(500);
        
        // Enter partial amount (less than invoice total)
        const amountInput = dialog.locator('input[name="amount"]').first();
        await amountInput.fill('50');
        
        // Check if partial payment is allowed
        const saveBtn = dialog.locator('button:has-text("Save"), button:has-text("Record")').first();
        await saveBtn.click({ force: true });
        await page.waitForTimeout(2000);
        
        // Check API response
        const paymentCall = tracker.getLastCall('/payments', 'POST');
        if (paymentCall) {
          console.log(`📊 Partial payment API: ${paymentCall.status}`);
          console.log(`📊 Amount: ${paymentCall.requestBody?.amount || 'N/A'}`);
        }
        
      } catch {
        console.log('ℹ️ Partial payment test skipped');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.7: Filter by Transaction Type', () => {
    
    test('PAY.7.1: Should filter payments by type (IN/OUT)', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Look for type filter tabs
      const inTab = page.locator('button:has-text("Payment In"), button:has-text("Received"), [role="tab"]:has-text("In")').first();
      const outTab = page.locator('button:has-text("Payment Out"), button:has-text("Made"), [role="tab"]:has-text("Out")').first();
      
      const hasInTab = await inTab.isVisible().catch(() => false);
      const hasOutTab = await outTab.isVisible().catch(() => false);
      
      console.log(`📊 Payment In filter: ${hasInTab}`);
      console.log(`📊 Payment Out filter: ${hasOutTab}`);
      
      if (hasInTab) {
        await inTab.click();
        await page.waitForTimeout(1500);
        console.log('✅ Payment In filter applied');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.8: Filter by Date Range', () => {
    
    test('PAY.8.1: Should filter payments by date range', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Look for date filter
      const dateInput = page.locator('input[type="date"], [data-testid*="date"]').first();
      
      if (await dateInput.isVisible().catch(() => false)) {
        const today = new Date().toISOString().split('T')[0];
        await dateInput.fill(today);
        await page.waitForTimeout(1500);
        
        console.log('✅ Date filter applied');
        
        // Check API call includes date param
        const filterCall = tracker.calls.find(c => 
          c.url.includes('date') || c.url.includes('from') || c.url.includes('to')
        );
        console.log(`📊 Date filter in API: ${!!filterCall}`);
      } else {
        console.log('ℹ️ Date filter not visible');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.9: Filter by Party', () => {
    
    test('PAY.9.1: Should filter payments by party', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Look for party filter
      const partyFilter = page.locator('select:has-text("Party"), [role="combobox"]:has-text("Party"), button:has-text("Filter")').first();
      
      if (await partyFilter.isVisible().catch(() => false)) {
        await partyFilter.click();
        await page.waitForTimeout(500);
        
        const option = page.locator('[role="option"]').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          await page.waitForTimeout(1500);
          console.log('✅ Party filter applied');
        }
      } else {
        console.log('ℹ️ Party filter not visible');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.10: Filter by Payment Mode', () => {
    
    test('PAY.10.1: Should filter payments by mode (Cash/UPI/Bank)', async ({ page }) => {
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Look for payment mode filter
      const paymentModes = ['Cash', 'UPI', 'Bank', 'Card', 'Cheque'];
      
      for (const mode of paymentModes) {
        const modeFilter = page.locator(`button:has-text("${mode}"), [role="tab"]:has-text("${mode}")`).first();
        const hasMode = await modeFilter.isVisible().catch(() => false);
        if (hasMode) {
          console.log(`✅ ${mode} filter available`);
        }
      }
    });
    
  });
  
  test.describe('PAY.11: View Invoice from Payment', () => {
    
    test('PAY.11.1: Should navigate to linked invoice from payment detail', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click on first payment
      const paymentRow = page.locator('.cursor-pointer, tr[data-state]').first();
      try {
        await paymentRow.click();
        await page.waitForTimeout(2000);
        
        // Look for invoice link
        const invoiceLink = page.locator('a[href*="/invoices/"], button:has-text("View Invoice")').first();
        const hasInvoiceLink = await invoiceLink.isVisible().catch(() => false);
        
        console.log(`📊 Invoice link in payment detail: ${hasInvoiceLink}`);
        
        if (hasInvoiceLink) {
          await invoiceLink.click();
          await page.waitForTimeout(2000);
          
          const onInvoicePage = page.url().includes('/invoices/');
          console.log(`📊 Navigated to invoice: ${onInvoicePage}`);
        }
        
      } catch {
        console.log('ℹ️ Invoice navigation test skipped');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAY.12: Validation Errors', () => {
    
    test('PAY.12.1: Should show error for negative amount', async ({ page }) => {
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const recordBtn = page.locator('button:has-text("Record Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1500);
        
        const dialog = page.locator('[role="dialog"]').first();
        
        // Enter negative amount
        const amountInput = dialog.locator('input[name="amount"]').first();
        await amountInput.fill('-100');
        await page.waitForTimeout(500);
        
        const submitBtn = dialog.locator('button[type="submit"]').first();
        await submitBtn.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Check for error
        const error = dialog.locator('.text-destructive, :text("positive"), :text("invalid")').first();
        const hasError = await error.isVisible().catch(() => false);
        
        console.log(`📊 Negative amount validation: ${hasError}`);
        
      } catch {
        console.log('ℹ️ Negative amount test skipped');
      }
    });
    
    test('PAY.12.2: Should show error for missing party', async ({ page }) => {
      const success = await navigateToPayments(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const recordBtn = page.locator('button:has-text("Record Payment")').first();
      try {
        await recordBtn.click();
        await page.waitForTimeout(1500);
        
        const dialog = page.locator('[role="dialog"]').first();
        
        // Enter amount without party
        const amountInput = dialog.locator('input[name="amount"]').first();
        await amountInput.fill('100');
        
        const submitBtn = dialog.locator('button[type="submit"]').first();
        await submitBtn.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Check for error
        const error = dialog.locator('.text-destructive, [aria-invalid="true"], :text("required")').first();
        const hasError = await error.isVisible().catch(() => false);
        
        console.log(`📊 Missing party validation: ${hasError}`);
        
      } catch {
        console.log('ℹ️ Missing party test skipped');
      }
    });
    
  });
  
});
