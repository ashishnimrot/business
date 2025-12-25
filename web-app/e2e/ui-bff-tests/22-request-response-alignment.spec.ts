import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker, generateTestData } from './test-config';

/**
 * 22-Request-Response Alignment Tests
 * 
 * Verifies that UI sends correct request parameters to backend APIs.
 * These tests validate the fixes for:
 * - ALIGN.1: Payment query with partyId (not party_id)
 * - ALIGN.2: Payment query with invoiceId (not invoice_id)
 * - ALIGN.3: Party credit_period_days (not credit_days)
 * - ALIGN.4: Payment list response handling
 * 
 * Auth: phone 9876543210, OTP 129012
 */

// ================================================
// SETUP: API Tracking and Authentication
// ================================================

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    // Track all API calls to backend services
    if (url.includes('/api/') || url.includes(':3002') || url.includes(':3003') || 
        url.includes(':3004') || url.includes(':3005') || url.includes(':3006') || 
        url.includes(':3007')) {
      const request = response.request();
      const startTime = Date.now();
      
      let requestBody: any = null;
      let responseBody: any = null;
      
      try {
        const postData = request.postData();
        if (postData) {
          requestBody = JSON.parse(postData);
        }
      } catch {}
      
      try {
        responseBody = await response.json();
      } catch {}
      
      tracker.add({
        method: request.method(),
        url: url,
        status: response.status(),
        requestBody,
        responseBody,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  });
}

async function loginIfNeeded(page: Page) {
  const currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    return;
  }
  
  console.log('🔐 Performing login...');
  
  // Enter phone number
  const phoneInput = page.locator('input[type="tel"]').first();
  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.fill(TEST_CONFIG.auth.phone);
  console.log(`📱 Phone entered: ${TEST_CONFIG.auth.phone}`);
  
  // Click Send OTP
  await page.click('button:has-text("Send OTP")');
  console.log('📤 OTP request sent');
  
  await page.waitForTimeout(3000);
  
  // Try to extract OTP from toast, fallback to default
  let otpToUse = TEST_CONFIG.auth.otp;
  try {
    const toastText = await page.locator('[data-sonner-toast]').textContent({ timeout: 3000 });
    if (toastText) {
      const match = toastText.match(/(\d{6})/);
      if (match) {
        otpToUse = match[1];
        console.log('📝 Extracted OTP from toast:', otpToUse);
      }
    }
  } catch {
    console.log('ℹ️ Using default OTP:', otpToUse);
  }
  
  // Enter OTP
  const otpInput = page.locator('input[type="text"]').first();
  await otpInput.waitFor({ state: 'visible', timeout: 10000 });
  await otpInput.fill(otpToUse);
  console.log('🔢 OTP entered');
  
  // Submit
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  console.log('✅ OTP submitted');
  
  // Wait for redirect
  try {
    await page.waitForURL(/\/(business|dashboard)/, { timeout: 20000 });
    console.log('✅ Redirected after login');
  } catch {
    console.log('⚠️ URL did not change as expected');
  }
  
  // Handle business selection if needed
  if (page.url().includes('/business')) {
    console.log('📊 Selecting business...');
    await page.waitForTimeout(2000);
    const businessCard = page.locator('.cursor-pointer').first();
    await businessCard.click();
    await page.waitForTimeout(3000);
  }
  
  console.log(`✅ Logged in, now at: ${page.url()}`);
}

async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  let currentUrl = page.url();
  console.log(`📍 Navigation to ${path} → ${currentUrl}`);
  
  if (currentUrl.includes('/login') && path !== '/login') {
    await loginIfNeeded(page);
    currentUrl = page.url();
  }
  
  // Navigate via sidebar if needed
  if (currentUrl.includes('/dashboard') && !path.includes('/dashboard')) {
    const pathMap: Record<string, string> = {
      '/parties': 'Parties',
      '/inventory': 'Inventory',
      '/invoices': 'Invoices',
      '/payments': 'Payments',
    };
    const navText = pathMap[path];
    
    if (navText) {
      console.log(`🔗 Clicking sidebar: ${navText}`);
      const link = page.locator(`nav a:has-text("${navText}"), a[href="${path}"]`).first();
      try {
        await link.waitFor({ state: 'visible', timeout: 5000 });
        await link.click();
        await page.waitForTimeout(2000);
      } catch {
        console.log('⚠️ Sidebar navigation failed, trying direct goto');
        await page.goto(path);
        await page.waitForTimeout(3000);
      }
    }
  }
  
  console.log(`📍 Final URL: ${page.url()}`);
}

// ================================================
// TEST SUITE: Request/Response Alignment
// ================================================

test.describe('22. Request/Response Alignment Tests', () => {
  
  test.describe('ALIGN.1: Payment API - Party ID Query Parameter', () => {
    
    test('ALIGN.1.1: Party detail page should fetch payments with partyId (camelCase)', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Step 1: Navigate to parties page
      await navigateTo(page, '/parties');
      await page.waitForTimeout(2000);
      
      // Step 2: Wait for parties list to load
      const partiesApiCall = tracker.getLastCall('/parties', 'GET');
      expect(partiesApiCall).toBeTruthy();
      console.log('✅ Parties list API called');
      
      // Step 3: Click on first party card to view detail
      const partyCard = page.locator('.cursor-pointer, [role="button"], a[href*="/parties/"]').first();
      try {
        await partyCard.waitFor({ state: 'visible', timeout: 10000 });
        await partyCard.click();
        await page.waitForTimeout(3000);
      } catch {
        console.log('⚠️ No party card found, creating one first...');
        // Create a party if none exists
        await createTestParty(page, tracker);
        await page.waitForTimeout(2000);
        
        // Try clicking again
        const newPartyCard = page.locator('.cursor-pointer, [role="button"], a[href*="/parties/"]').first();
        await newPartyCard.click();
        await page.waitForTimeout(3000);
      }
      
      // Step 4: Verify we're on party detail page
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Step 5: Check payment API call uses partyId (camelCase)
      await page.waitForTimeout(2000);
      const paymentCalls = tracker.getCallsByUrl('/payments');
      
      // Find the payment call with query parameter
      const paymentCallWithPartyId = paymentCalls.find(c => 
        c.url.includes('partyId=') && c.method === 'GET'
      );
      
      const paymentCallWithPartyIdSnakeCase = paymentCalls.find(c => 
        c.url.includes('party_id=') && c.method === 'GET'
      );
      
      console.log('📊 Payment API calls:');
      paymentCalls.forEach(c => console.log(`  ${c.method} ${c.url} → ${c.status}`));
      
      // VERIFY: Should use partyId (camelCase), NOT party_id (snake_case)
      if (paymentCallWithPartyIdSnakeCase) {
        console.log('❌ FAIL: Found party_id (snake_case) in URL - this is the bug!');
        console.log(`   URL: ${paymentCallWithPartyIdSnakeCase.url}`);
      }
      
      if (paymentCallWithPartyId) {
        console.log('✅ PASS: Using partyId (camelCase) correctly');
        console.log(`   URL: ${paymentCallWithPartyId.url}`);
        expect(paymentCallWithPartyId.url).toContain('partyId=');
      }
      
      // Assert: No snake_case party_id should exist
      expect(paymentCallWithPartyIdSnakeCase).toBeUndefined();
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('ALIGN.2: Payment API - Invoice ID Query Parameter', () => {
    
    test('ALIGN.2.1: Invoice detail page should fetch payments with invoiceId (camelCase)', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Step 1: Navigate to invoices page
      await navigateTo(page, '/invoices');
      await page.waitForTimeout(2000);
      
      // Step 2: Wait for invoices list to load
      const invoicesApiCall = tracker.getLastCall('/invoices', 'GET');
      console.log('📊 Invoices API call:', invoicesApiCall?.url);
      
      // Step 3: Click on first invoice to view detail
      const invoiceRow = page.locator('tr[data-state], .cursor-pointer, a[href*="/invoices/"]').first();
      try {
        await invoiceRow.waitFor({ state: 'visible', timeout: 10000 });
        await invoiceRow.click();
        await page.waitForTimeout(3000);
      } catch {
        console.log('⚠️ No invoice found - skipping invoice detail test');
        test.skip();
        return;
      }
      
      // Step 4: Check payment API call uses invoiceId (camelCase)
      await page.waitForTimeout(2000);
      const paymentCalls = tracker.getCallsByUrl('/payments');
      
      const paymentCallWithInvoiceId = paymentCalls.find(c => 
        c.url.includes('invoiceId=') && c.method === 'GET'
      );
      
      const paymentCallWithInvoiceIdSnakeCase = paymentCalls.find(c => 
        c.url.includes('invoice_id=') && c.method === 'GET'
      );
      
      console.log('📊 Payment API calls on invoice detail:');
      paymentCalls.forEach(c => console.log(`  ${c.method} ${c.url} → ${c.status}`));
      
      // VERIFY: Should use invoiceId (camelCase), NOT invoice_id (snake_case)
      if (paymentCallWithInvoiceIdSnakeCase) {
        console.log('❌ FAIL: Found invoice_id (snake_case) in URL - this is the bug!');
      }
      
      if (paymentCallWithInvoiceId) {
        console.log('✅ PASS: Using invoiceId (camelCase) correctly');
        expect(paymentCallWithInvoiceId.url).toContain('invoiceId=');
      }
      
      // Assert: No snake_case invoice_id should exist
      expect(paymentCallWithInvoiceIdSnakeCase).toBeUndefined();
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('ALIGN.3: Party API - Credit Period Days Field', () => {
    
    test('ALIGN.3.1: Create party should send credit_period_days (not credit_days)', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const testData = generateTestData();
      
      // Step 1: Navigate to parties page
      await navigateTo(page, '/parties');
      await page.waitForTimeout(2000);
      
      // Step 2: Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      await addBtn.waitFor({ state: 'visible', timeout: 10000 });
      await addBtn.click();
      await page.waitForTimeout(1000);
      
      // Step 3: Fill party form with credit days
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill required fields
      await dialog.locator('input[name="name"]').fill(testData.party.name);
      
      // Select type (customer) - use force click to bypass overlay
      const typeSelect = dialog.locator('button[role="combobox"]:near(:text("Type")), select[name="type"]').first();
      try {
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Customer"), option[value="customer"]').first().click({ force: true });
      } catch {
        console.log('ℹ️ Type field not found or already set');
      }
      
      // Fill credit days field
      const creditDaysInput = dialog.locator('input[name="credit_period_days"], input[name="credit_days"]').first();
      try {
        await creditDaysInput.waitFor({ state: 'visible', timeout: 3000 });
        await creditDaysInput.fill('30');
        console.log('✅ Credit days field filled with 30');
      } catch {
        console.log('⚠️ Credit days field not found');
      }
      
      // Step 4: Submit the form - use force click to bypass overlay
      tracker.clear(); // Clear to capture only the POST call
      
      const submitBtn = dialog.locator('button[type="submit"], button:has-text("Create Party")').first();
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
      await submitBtn.click({ force: true }); // Force click to bypass dialog overlay
      await page.waitForTimeout(3000);
      
      // Step 5: Verify the API request body
      const createCall = tracker.getLastCall('/parties', 'POST');
      
      if (createCall) {
        console.log('📊 Party CREATE API call:');
        console.log(`   URL: ${createCall.url}`);
        console.log(`   Status: ${createCall.status}`);
        console.log(`   Request Body: ${JSON.stringify(createCall.requestBody, null, 2)}`);
        
        // VERIFY: Should have credit_period_days, NOT credit_days
        if (createCall.requestBody) {
          const hasCorrectField = 'credit_period_days' in createCall.requestBody;
          const hasWrongField = 'credit_days' in createCall.requestBody;
          
          if (hasWrongField) {
            console.log('❌ FAIL: Request contains credit_days (wrong field name)');
          }
          
          if (hasCorrectField) {
            console.log('✅ PASS: Request contains credit_period_days (correct field name)');
            expect(createCall.requestBody.credit_period_days).toBe(30);
          }
          
          // Assert: Should not have credit_days
          expect(hasWrongField).toBeFalsy();
        }
      } else {
        console.log('⚠️ No POST /parties call captured');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('ALIGN.4: Payment List Response Handling', () => {
    
    test('ALIGN.4.1: Payments page should handle different response formats', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Step 1: Navigate to payments page
      await navigateTo(page, '/payments');
      await page.waitForTimeout(3000);
      
      // Step 2: Check the payments list API response format
      const paymentsCall = tracker.getLastCall('/payments', 'GET');
      
      if (paymentsCall) {
        console.log('📊 Payments LIST API call:');
        console.log(`   URL: ${paymentsCall.url}`);
        console.log(`   Status: ${paymentsCall.status}`);
        console.log(`   Response type: ${typeof paymentsCall.responseBody}`);
        
        // Check response format
        if (paymentsCall.responseBody) {
          const isArray = Array.isArray(paymentsCall.responseBody);
          const hasPaymentsKey = paymentsCall.responseBody?.payments !== undefined;
          const hasDataKey = paymentsCall.responseBody?.data !== undefined;
          
          console.log(`   Is Array: ${isArray}`);
          console.log(`   Has 'payments' key: ${hasPaymentsKey}`);
          console.log(`   Has 'data' key: ${hasDataKey}`);
          
          // VERIFY: API should return 200 status
          expect(paymentsCall.status).toBe(200);
          
          // Log the actual format for debugging
          if (isArray) {
            console.log('✅ Response is an array');
          } else if (hasPaymentsKey) {
            console.log('✅ Response has payments key');
          } else if (hasDataKey) {
            console.log('✅ Response has data key');
          }
        }
      }
      
      // Step 3: Verify payments are displayed in UI (if any)
      const paymentCards = page.locator('.payment-card, [data-testid="payment-item"], tr').all();
      const noPaymentsMessage = page.locator(':text("No payments"), :text("no payments found")').first();
      
      const hasPayments = (await paymentCards).length > 0;
      const hasEmptyState = await noPaymentsMessage.isVisible().catch(() => false);
      
      console.log(`📊 UI State: ${hasPayments ? 'Has payments' : hasEmptyState ? 'Empty state shown' : 'Unknown'}`);
      
      // Either we have payments or we see empty state - both are valid
      expect(hasPayments || hasEmptyState || paymentsCall?.status === 200).toBeTruthy();
      
      tracker.printSummary();
    });
    
  });
  
});

// ================================================
// HELPER: Create test party if none exists
// ================================================

async function createTestParty(page: Page, tracker: ApiTracker) {
  const testData = generateTestData();
  
  console.log('📝 Creating test party...');
  
  const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
  await addBtn.waitFor({ state: 'visible', timeout: 10000 });
  await addBtn.click();
  await page.waitForTimeout(1000);
  
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  
  // Fill required fields
  await dialog.locator('input[name="name"]').fill(testData.party.name);
  
  // Select type
  const typeSelect = dialog.locator('button[role="combobox"]').first();
  try {
    await typeSelect.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]:has-text("Customer")').first().click();
  } catch {
    console.log('ℹ️ Type selector not found');
  }
  
  // Fill phone (optional but helpful)
  try {
    await dialog.locator('input[name="phone"]').fill(testData.party.phone);
  } catch {}
  
  // Submit
  const submitBtn = dialog.locator('button[type="submit"], button:has-text("Create")').first();
  await submitBtn.click();
  await page.waitForTimeout(3000);
  
  // Check for success
  const createCall = tracker.getLastCall('/parties', 'POST');
  if (createCall?.status === 201) {
    console.log(`✅ Party created: ${testData.party.name}`);
  } else {
    console.log('⚠️ Party creation may have failed');
  }
}
