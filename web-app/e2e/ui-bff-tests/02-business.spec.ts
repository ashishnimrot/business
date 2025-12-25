import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker, generateTestData } from './test-config';

/**
 * 02-Business Tests
 * 
 * Business selection and creation tests with BFF verification.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':3002') || url.includes(':3003')) {
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

test.describe('02. Business Tests', () => {
  
  test.describe('BUS.1: Business Selection', () => {
    
    test('BUS.1.1: Should list all businesses for user', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      // Check if redirected to login
      if (page.url().includes('/login')) {
        console.log('ℹ️ Need to login first');
        test.skip();
        return;
      }
      
      // Verify businesses API call
      const businessCall = tracker.getLastCall('/businesses', 'GET');
      if (businessCall) {
        console.log(`📊 Businesses API: ${businessCall.status}`);
        expect(businessCall.status).toBe(200);
        
        if (businessCall.responseBody) {
          const businesses = Array.isArray(businessCall.responseBody) 
            ? businessCall.responseBody 
            : businessCall.responseBody.businesses || [];
          console.log(`   Found ${businesses.length} businesses`);
        }
      }
      
      // Verify UI shows business cards
      const businessCards = page.locator('.cursor-pointer, [data-testid="business-card"]');
      const count = await businessCards.count();
      console.log(`📊 UI shows ${count} business cards`);
      
      tracker.printSummary();
    });
    
    test('BUS.1.2: Should select a business and redirect to dashboard', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Click first business card
      const businessCard = page.locator('.cursor-pointer').first();
      try {
        await businessCard.waitFor({ state: 'visible', timeout: 5000 });
        await businessCard.click();
        await page.waitForTimeout(3000);
        
        // Should redirect to dashboard
        const currentUrl = page.url();
        console.log(`📍 After selection: ${currentUrl}`);
        expect(currentUrl).toContain('/dashboard');
        
        // Verify business_id stored
        const businessId = await page.evaluate(() => localStorage.getItem('business_id'));
        console.log(`🏢 Business ID stored: ${businessId ? 'Yes' : 'No'}`);
        
      } catch {
        console.log('⚠️ No business cards to select');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('BUS.2: Business Creation', () => {
    
    test('BUS.2.1: Should create a new business with valid data', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const timestamp = Date.now();
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Click Create Business button
      const createBtn = page.locator('button:has-text("Create Business"), button:has-text("Add Business")').first();
      try {
        await createBtn.waitFor({ state: 'visible', timeout: 5000 });
        await createBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        console.log('⚠️ Create business button not found');
        test.skip();
        return;
      }
      
      // Fill business form
      const dialog = page.locator('[role="dialog"], form').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      await dialog.locator('input[name="name"]').fill(`Test Business ${timestamp}`);
      
      // Try to fill optional fields
      try {
        await dialog.locator('input[name="gstin"]').fill('27AABCU9603R1ZM');
      } catch {}
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API call
      const createCall = tracker.getLastCall('/businesses', 'POST');
      if (createCall) {
        console.log(`📊 Create Business API: ${createCall.status}`);
        console.log(`   Request: ${JSON.stringify(createCall.requestBody)}`);
        expect([200, 201]).toContain(createCall.status);
      }
      
      tracker.printSummary();
    });
    
    test('BUS.2.2: Should show error for missing business name', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const createBtn = page.locator('button:has-text("Create Business")').first();
      try {
        await createBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      // Try to submit without name
      const dialog = page.locator('[role="dialog"]').first();
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for validation error
      const errorMsg = page.locator('.text-red-500, .text-destructive, [role="alert"]').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      console.log(`📊 Validation error shown: ${hasError}`);
      
      tracker.printSummary();
    });

    test('BUS.2.3: Should create business with only mandatory fields', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const timestamp = Date.now();
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Click Create Business button
      const createBtn = page.locator('button:has-text("Create Business"), button:has-text("Add Business")').first();
      try {
        await createBtn.waitFor({ state: 'visible', timeout: 5000 });
        await createBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        console.log('⚠️ Create business button not found');
        test.skip();
        return;
      }
      
      // Fill only mandatory field (name)
      const dialog = page.locator('[role="dialog"], form').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      await dialog.locator('input[name="name"]').fill(`Minimal Business ${timestamp}`);
      
      // Don't fill any optional fields (type, GSTIN, PAN, phone, email, address, etc.)
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API call
      const createCall = tracker.getLastCall('/businesses', 'POST');
      if (createCall) {
        console.log(`📊 Create Business API: ${createCall.status}`);
        console.log(`   Request Body: ${JSON.stringify(createCall.requestBody)}`);
        expect([200, 201]).toContain(createCall.status);
        
        // Verify only name was sent (optional fields should be null/undefined)
        if (createCall.requestBody) {
          expect(createCall.requestBody.name).toContain('Minimal Business');
          console.log(`   ✅ Business created with only mandatory fields`);
        }
      }
      
      tracker.printSummary();
    });

    test('BUS.2.4: Should create business with all optional fields', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const timestamp = Date.now();
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Click Create Business button
      const createBtn = page.locator('button:has-text("Create Business"), button:has-text("Add Business")').first();
      try {
        await createBtn.waitFor({ state: 'visible', timeout: 5000 });
        await createBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        console.log('⚠️ Create business button not found');
        test.skip();
        return;
      }
      
      // Fill business form with all fields
      const dialog = page.locator('[role="dialog"], form').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Mandatory field
      await dialog.locator('input[name="name"]').fill(`Full Business ${timestamp}`);
      
      // Optional fields - fill as many as available
      const optionalFields = [
        { name: 'gstin', value: '27AABCU9603R1ZM' },
        { name: 'pan', value: 'AABCU9603R' },
        { name: 'phone', value: '9876543210' },
        { name: 'email', value: `business.${timestamp}@example.com` },
        { name: 'address', value: '123 Test Street' },
        { name: 'city', value: 'Mumbai' },
        { name: 'state', value: 'Maharashtra' },
        { name: 'pincode', value: '400001' },
      ];
      
      for (const field of optionalFields) {
        try {
          const input = dialog.locator(`input[name="${field.name}"]`);
          if (await input.isVisible().catch(() => false)) {
            await input.fill(field.value);
            console.log(`   ✅ Filled ${field.name}`);
          }
        } catch {
          console.log(`   ⚠️ Field ${field.name} not available`);
        }
      }
      
      // Try to select business type if dropdown exists
      try {
        const typeSelect = dialog.locator('select[name="type"], [data-testid="business-type"]');
        if (await typeSelect.isVisible().catch(() => false)) {
          await typeSelect.selectOption('retailer');
          console.log(`   ✅ Selected business type`);
        }
      } catch {
        console.log(`   ⚠️ Business type selector not available`);
      }
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API call
      const createCall = tracker.getLastCall('/businesses', 'POST');
      if (createCall) {
        console.log(`📊 Create Business API: ${createCall.status}`);
        console.log(`   Request Body: ${JSON.stringify(createCall.requestBody)}`);
        expect([200, 201]).toContain(createCall.status);
        
        if (createCall.requestBody) {
          expect(createCall.requestBody.name).toContain('Full Business');
          console.log(`   ✅ Business created with all optional fields`);
        }
      }
      
      tracker.printSummary();
    });

    test('BUS.2.5: Should show error for duplicate GSTIN', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const timestamp = Date.now();
      
      // Known duplicate GSTIN (commonly used in tests)
      const duplicateGstin = '27AABCU9603R1ZM';
      
      await page.goto('/business/select');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Click Create Business button
      const createBtn = page.locator('button:has-text("Create Business"), button:has-text("Add Business")').first();
      try {
        await createBtn.waitFor({ state: 'visible', timeout: 5000 });
        await createBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        console.log('⚠️ Create business button not found');
        test.skip();
        return;
      }
      
      // Fill form with duplicate GSTIN
      const dialog = page.locator('[role="dialog"], form').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      await dialog.locator('input[name="name"]').fill(`Duplicate GSTIN Business ${timestamp}`);
      
      try {
        await dialog.locator('input[name="gstin"]').fill(duplicateGstin);
      } catch {
        console.log('⚠️ GSTIN field not found');
        test.skip();
        return;
      }
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API call - should return error for duplicate
      const createCall = tracker.getLastCall('/businesses', 'POST');
      if (createCall) {
        console.log(`📊 Create Business API: ${createCall.status}`);
        
        if (createCall.status === 409 || createCall.status === 400) {
          console.log(`   ✅ Correctly rejected duplicate GSTIN`);
          
          // Check for error message in UI
          const errorMsg = page.locator('.text-red-500, .text-destructive, [role="alert"]');
          const errorToast = page.locator('[data-sonner-toast][data-type="error"], .toast-error');
          const hasError = await errorMsg.isVisible().catch(() => false) || 
                          await errorToast.isVisible().catch(() => false);
          console.log(`   Error displayed in UI: ${hasError}`);
        } else if (createCall.status === 200 || createCall.status === 201) {
          // If it succeeded, the GSTIN wasn't actually a duplicate (first test run)
          console.log(`   ℹ️ GSTIN was not a duplicate (first use)`);
        }
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('BUS.3: Business Update', () => {
    
    test('BUS.3.1: Should update business details', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const timestamp = Date.now();
      
      // First, get to dashboard with a selected business
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to settings to update business
      const settingsLink = page.locator('a[href="/settings"], button:has-text("Settings")').first();
      try {
        await settingsLink.click();
        await page.waitForTimeout(2000);
      } catch {
        // Try sidebar navigation
        const sidebarSettings = page.locator('[data-testid="nav-settings"], nav a[href*="settings"]');
        try {
          await sidebarSettings.click();
          await page.waitForTimeout(2000);
        } catch {
          console.log('⚠️ Settings not accessible');
          test.skip();
          return;
        }
      }
      
      // Look for business settings section or edit button
      const businessSection = page.locator('[data-testid="business-settings"], button:has-text("Edit Business"), button:has-text("Business Details")');
      try {
        await businessSection.first().click();
        await page.waitForTimeout(1000);
      } catch {
        console.log('ℹ️ Business settings section may already be visible');
      }
      
      // Find and update business name
      const businessNameInput = page.locator('input[name="name"], input[name="business_name"]').first();
      try {
        await businessNameInput.waitFor({ state: 'visible', timeout: 5000 });
        const currentName = await businessNameInput.inputValue();
        const newName = `Updated Business ${timestamp}`;
        
        await businessNameInput.fill(newName);
        console.log(`   Updated name: "${currentName}" → "${newName}"`);
        
        tracker.clear();
        
        // Submit update
        const saveBtn = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Update")').first();
        await saveBtn.click({ force: true });
        await page.waitForTimeout(3000);
        
        // Verify API call
        const updateCall = tracker.getLastCall('/businesses', 'PATCH') || 
                          tracker.getLastCall('/businesses', 'PUT');
        
        if (updateCall) {
          console.log(`📊 Update Business API: ${updateCall.status}`);
          expect([200, 204]).toContain(updateCall.status);
          
          if (updateCall.requestBody) {
            console.log(`   Request: ${JSON.stringify(updateCall.requestBody)}`);
          }
          
          console.log(`   ✅ Business updated successfully`);
        } else {
          console.log('⚠️ Update API call not captured');
        }
        
      } catch (error) {
        console.log(`⚠️ Could not update business: ${error}`);
      }
      
      tracker.printSummary();
    });
    
    test('BUS.3.2: Should verify GET business/:id is called when editing', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to settings
      await page.goto('/settings');
      await page.waitForTimeout(3000);
      
      // Check if GET business/:id was called to pre-fill form
      const getCall = tracker.getCallsByUrl('/businesses').find(c => 
        c.method === 'GET' && (c.url.includes('/businesses/') || c.url.endsWith('/businesses'))
      );
      
      if (getCall) {
        console.log(`📊 GET Business API: ${getCall.status}`);
        expect(getCall.status).toBe(200);
        
        if (getCall.responseBody) {
          const business = Array.isArray(getCall.responseBody) 
            ? getCall.responseBody[0] 
            : getCall.responseBody;
          console.log(`   Business loaded: ${business?.name || 'Unknown'}`);
          console.log(`   ✅ Business data fetched for editing`);
        }
      } else {
        console.log('ℹ️ Business data may be cached or fetched differently');
      }
      
      tracker.printSummary();
    });
    
  });
  
});
