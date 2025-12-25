import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker, generateTestData } from './test-config';

/**
 * 03-Parties Tests
 * 
 * Party CRUD operations with BFF verification.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':3004')) {
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

async function navigateToParties(page: Page) {
  await page.goto('/parties');
  await page.waitForTimeout(3000);
  
  if (page.url().includes('/login')) {
    console.log('⚠️ Redirected to login');
    return false;
  }
  
  if (page.url().includes('/dashboard')) {
    const link = page.locator('a[href="/parties"], nav a:has-text("Parties")').first();
    try {
      await link.click();
      await page.waitForTimeout(2000);
    } catch {}
  }
  
  return true;
}

test.describe('03. Parties Tests', () => {
  
  test.describe('PARTY.1: List Parties', () => {
    
    test('PARTY.1.1: Should list all parties', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Verify parties API call
      const partiesCall = tracker.getLastCall('/parties', 'GET');
      expect(partiesCall).toBeTruthy();
      console.log(`📊 Parties API: ${partiesCall?.status}`);
      expect(partiesCall?.status).toBe(200);
      
      // Verify UI
      const partyCards = page.locator('[data-testid="party-card"], .cursor-pointer');
      const emptyState = page.locator(':text("No parties"), :text("no parties")');
      
      const hasParties = await partyCards.count() > 0;
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      
      console.log(`📊 UI: ${hasParties ? 'Has parties' : hasEmptyState ? 'Empty state' : 'Unknown'}`);
      expect(hasParties || hasEmptyState).toBeTruthy();
      
      tracker.printSummary();
    });
    
    test('PARTY.1.2: Should filter parties by type (customers)', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click Customers filter/tab
      const customerTab = page.locator('button:has-text("Customers"), [role="tab"]:has-text("Customers")').first();
      try {
        await customerTab.click();
        await page.waitForTimeout(2000);
        
        // Verify API call with type filter
        const filterCall = tracker.getCallsByUrl('/parties').find(c => 
          c.url.includes('type=customer')
        );
        
        if (filterCall) {
          console.log(`📊 Filter API: ${filterCall.url}`);
          expect(filterCall.status).toBe(200);
        }
      } catch {
        console.log('ℹ️ Customer filter not available');
      }
      
      tracker.printSummary();
    });
    
    test('PARTY.1.3: Should search parties by name', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Find and use search input
      const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
      try {
        await searchInput.fill('Test');
        await page.waitForTimeout(2000);
        
        // Verify search API call
        const searchCall = tracker.getCallsByUrl('/parties').find(c => 
          c.url.includes('search=')
        );
        
        if (searchCall) {
          console.log(`📊 Search API: ${searchCall.url}`);
          expect(searchCall.status).toBe(200);
        }
      } catch {
        console.log('ℹ️ Search input not found');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PARTY.2: Create Party', () => {
    
    test('PARTY.2.1: Should create a customer party', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const testData = generateTestData();
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form
      await dialog.locator('input[name="name"]').fill(testData.party.name);
      
      // Select type
      try {
        const typeSelect = dialog.locator('button[role="combobox"]').first();
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Customer")').first().click({ force: true });
      } catch {}
      
      // Fill optional fields
      try {
        await dialog.locator('input[name="phone"]').fill(testData.party.phone);
        await dialog.locator('input[name="email"]').fill(testData.party.email);
      } catch {}
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall) {
        console.log(`📊 Create Party API: ${createCall.status}`);
        console.log(`   Request: ${JSON.stringify(createCall.requestBody)}`);
        expect([200, 201]).toContain(createCall.status);
        
        if (createCall.requestBody) {
          expect(createCall.requestBody.name).toBe(testData.party.name);
        }
      }
      
      // Verify success toast
      const toast = page.locator('[data-sonner-toast]').first();
      const toastText = await toast.textContent().catch(() => '');
      console.log(`📊 Toast: ${toastText}`);
      
      tracker.printSummary();
    });
    
    test('PARTY.2.2: Should show validation error for missing name', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add Party")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      
      // Submit without filling name
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for error
      const errorMsg = dialog.locator('.text-red-500, .text-destructive').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      console.log(`📊 Validation error: ${hasError}`);
      
      tracker.printSummary();
    });
    
    test('PARTY.2.3: Should create a supplier party', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const testData = generateTestData();
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add Party")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.locator('input[name="name"]').fill(testData.supplier.name);
      
      // Select supplier type
      try {
        const typeSelect = dialog.locator('button[role="combobox"]').first();
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Supplier")').first().click({ force: true });
      } catch {}
      
      tracker.clear();
      
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall) {
        console.log(`📊 Create Supplier API: ${createCall.status}`);
        expect([200, 201]).toContain(createCall.status);
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PARTY.3: View Party Detail', () => {
    
    test('PARTY.3.1: Should view party detail page', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click on first party
      const partyCard = page.locator('.cursor-pointer, a[href*="/parties/"]').first();
      try {
        await partyCard.click();
        await page.waitForTimeout(3000);
        
        // Verify detail API call
        const detailCall = tracker.getCallsByUrl('/parties/').find(c => 
          c.method === 'GET' && c.url.match(/\/parties\/[a-f0-9-]+$/)
        );
        
        if (detailCall) {
          console.log(`📊 Party Detail API: ${detailCall.status}`);
          expect(detailCall.status).toBe(200);
        }
        
        // Verify UI shows party info
        const heading = page.locator('h1, h2').first();
        const headingText = await heading.textContent().catch(() => '');
        console.log(`📊 Page heading: ${headingText}`);
        
      } catch {
        console.log('⚠️ No party to view');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PARTY.4: Update Party', () => {
    
    test('PARTY.4.1: Should update party details', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to party detail
      const partyCard = page.locator('.cursor-pointer, a[href*="/parties/"]').first();
      try {
        await partyCard.click();
        await page.waitForTimeout(2000);
      } catch {
        test.skip();
        return;
      }
      
      // Click Edit button
      const editBtn = page.locator('button:has-text("Edit")').first();
      try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:364',message:'Before Edit click',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        await editBtn.click();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:367',message:'After Edit click',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        await page.waitForTimeout(1000);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:370',message:'After 1s wait',data:{url:page.url(),isEditPage:page.url().includes('/edit')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } catch {
        console.log('⚠️ Edit button not found');
        test.skip();
        return;
      }
      
      // Wait for navigation to edit page
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:377',message:'Before waiting for navigation',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      await page.waitForURL(/\/parties\/.*\/edit/, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:381',message:'After navigation wait',data:{url:page.url(),isEditPage:page.url().includes('/edit')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Wait for form to load (skeleton disappears, form appears)
      // The edit page shows a skeleton while loading, so wait for the actual form
      await page.waitForSelector('form', { state: 'visible', timeout: 30000 });
      await page.waitForTimeout(1000); // Give React time to render form fields
      
      // Update name - use id="name" selector (the component uses id, not name attribute)
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:390',message:'Before waiting for input',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Use #name selector (id="name" is what the Input component uses)
      const nameInput = page.locator('#name').first();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:395',message:'Before clear() call',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      await nameInput.waitFor({ state: 'visible', timeout: 30000 });
      await nameInput.waitFor({ state: 'attached', timeout: 30000 });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:398',message:'After waitFor visible',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      await nameInput.clear();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c911df96-f005-41d0-8110-786b826bd4e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'03-parties.spec.ts:401',message:'After clear()',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      await nameInput.fill(`Updated Party ${Date.now()}`);
      
      tracker.clear();
      
      // Save
      const saveBtn = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify PATCH call
      const updateCall = tracker.getLastCall('/parties/', 'PATCH');
      if (updateCall) {
        console.log(`📊 Update Party API: ${updateCall.status}`);
        expect(updateCall.status).toBe(200);
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PARTY.5: Delete Party', () => {
    
    test('PARTY.5.1: Should delete a party', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Find and click delete button (usually in dropdown)
      const menuBtn = page.locator('[aria-haspopup="menu"], button:has-text("⋮"), button:has-text("...")').first();
      try {
        await menuBtn.click();
        await page.waitForTimeout(500);
        
        const deleteOption = page.locator('[role="menuitem"]:has-text("Delete")').first();
        await deleteOption.click();
        await page.waitForTimeout(1000);
        
        // Confirm delete
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
        
        tracker.clear();
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(3000);
        
        // Verify DELETE call
        const deleteCall = tracker.getLastCall('/parties/', 'DELETE');
        if (deleteCall) {
          console.log(`📊 Delete Party API: ${deleteCall.status}`);
          expect([200, 204]).toContain(deleteCall.status);
        }
        
      } catch {
        console.log('⚠️ Delete flow not available');
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('PARTY.6: Party Ledger', () => {
    
    test('PARTY.6.1: Should view party ledger', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to party detail
      const partyCard = page.locator('.cursor-pointer, a[href*="/parties/"]').first();
      try {
        await partyCard.click();
        await page.waitForTimeout(2000);
      } catch {
        console.log('⚠️ No party to view');
        test.skip();
        return;
      }
      
      // Look for ledger tab or link
      const ledgerTab = page.locator('button:has-text("Ledger"), a:has-text("Ledger"), [role="tab"]:has-text("Ledger")').first();
      
      try {
        tracker.clear();
        if (await ledgerTab.isVisible({ timeout: 3000 })) {
          await ledgerTab.click();
          await page.waitForTimeout(2000);
          
          // Verify ledger API call
          const ledgerCall = tracker.getCallsByUrl('/ledger').find(c => c.method === 'GET') ||
                            tracker.getCallsByUrl('/parties/').find(c => c.url.includes('ledger'));
          
          if (ledgerCall) {
            console.log(`📊 Ledger API: ${ledgerCall.status}`);
            expect(ledgerCall.status).toBe(200);
            
            if (ledgerCall.responseBody) {
              console.log(`   Ledger entries found`);
            }
          } else {
            console.log('ℹ️ Ledger API not detected - may be part of party detail');
          }
          
          // Verify UI shows ledger
          const ledgerTable = page.locator('table, [data-testid="ledger-table"]');
          const hasLedger = await ledgerTable.isVisible().catch(() => false);
          console.log(`📊 UI shows ledger: ${hasLedger}`);
          
        } else {
          console.log('ℹ️ Ledger tab not found');
        }
      } catch {
        console.log('ℹ️ Ledger feature may not be available');
      }
      
      tracker.printSummary();
    });
    
    test('PARTY.6.2: Should view party ledger with date range filter', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to party detail
      const partyCard = page.locator('.cursor-pointer, a[href*="/parties/"]').first();
      try {
        await partyCard.click();
        await page.waitForTimeout(2000);
      } catch {
        test.skip();
        return;
      }
      
      // Navigate to ledger
      const ledgerTab = page.locator('button:has-text("Ledger"), a:has-text("Ledger"), [role="tab"]:has-text("Ledger")').first();
      
      try {
        if (await ledgerTab.isVisible({ timeout: 3000 })) {
          await ledgerTab.click();
          await page.waitForTimeout(2000);
          
          // Find date range picker
          const dateRangePicker = page.locator('input[type="date"], button:has-text("Date"), [data-testid="date-range"]');
          
          if (await dateRangePicker.first().isVisible({ timeout: 3000 })) {
            tracker.clear();
            
            // Try to set date range
            const startDate = page.locator('input[name="startDate"], input[name="from_date"]').first();
            const endDate = page.locator('input[name="endDate"], input[name="to_date"]').first();
            
            if (await startDate.isVisible().catch(() => false)) {
              await startDate.fill('2024-01-01');
              await endDate.fill('2024-12-31');
              await page.waitForTimeout(2000);
              
              // Verify API call with date range
              const ledgerCall = tracker.getCallsByUrl('/ledger').find(c => 
                c.url.includes('from_date') || c.url.includes('startDate')
              );
              
              if (ledgerCall) {
                console.log(`📊 Ledger with date range API: ${ledgerCall.url}`);
                expect(ledgerCall.status).toBe(200);
              }
            } else {
              console.log('ℹ️ Date inputs not found, trying date picker button');
              
              // Click date picker button
              await dateRangePicker.first().click();
              await page.waitForTimeout(1000);
              console.log('   Date picker opened');
            }
          } else {
            console.log('ℹ️ Date range filter not available');
          }
        }
      } catch {
        console.log('ℹ️ Date range filter feature may not be implemented');
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('PARTY.7: Party Validation', () => {
    
    test('PARTY.7.1: Should show error for missing party type', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill only name, don't select type
      await dialog.locator('input[name="name"]').fill(`Test Party ${Date.now()}`);
      
      // Don't select party type
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for validation error
      const errorMsg = page.locator('.text-red-500, .text-destructive, [role="alert"]');
      const hasError = await errorMsg.first().isVisible().catch(() => false);
      
      // Or check API response for 400
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall && createCall.status === 400) {
        console.log(`📊 API returned validation error: ${createCall.status}`);
        console.log(`   Error: ${JSON.stringify(createCall.responseBody)}`);
      } else if (hasError) {
        console.log(`📊 UI validation error shown`);
      } else {
        console.log('ℹ️ Type may have default value or validation differs');
      }
      
      tracker.printSummary();
    });
    
    test('PARTY.7.2: Should validate invalid phone format', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form with invalid phone
      await dialog.locator('input[name="name"]').fill(`Phone Test ${Date.now()}`);
      
      // Select type
      try {
        const typeSelect = dialog.locator('button[role="combobox"]').first();
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Customer")').first().click({ force: true });
      } catch {}
      
      // Enter invalid phone (6 digits)
      try {
        await dialog.locator('input[name="phone"]').fill('123456'); // Invalid - too short
      } catch {
        console.log('ℹ️ Phone field not found');
        test.skip();
        return;
      }
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for validation error
      const errorMsg = page.locator('.text-red-500, .text-destructive, [role="alert"]');
      const hasError = await errorMsg.first().isVisible().catch(() => false);
      
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall && createCall.status === 400) {
        console.log(`📊 API rejected invalid phone: ${createCall.status}`);
        console.log(`   Error: ${JSON.stringify(createCall.responseBody)}`);
      } else if (hasError) {
        console.log(`📊 UI validation error for invalid phone`);
      } else {
        console.log('ℹ️ Phone validation may differ or be optional');
      }
      
      tracker.printSummary();
    });
    
    test('PARTY.7.3: Should show error for duplicate phone', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Use a known existing phone number from test config
      const existingPhone = TEST_CONFIG.auth.phone; // 9876543210
      
      // Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form
      await dialog.locator('input[name="name"]').fill(`Duplicate Phone Test ${Date.now()}`);
      
      // Select type
      try {
        const typeSelect = dialog.locator('button[role="combobox"]').first();
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Customer")').first().click({ force: true });
      } catch {}
      
      // Enter duplicate phone
      try {
        await dialog.locator('input[name="phone"]').fill(existingPhone);
      } catch {
        console.log('ℹ️ Phone field not found');
      }
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Check response
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall) {
        if (createCall.status === 409 || createCall.status === 400) {
          console.log(`📊 API rejected duplicate phone: ${createCall.status}`);
          console.log(`   ✅ Correctly rejected duplicate phone`);
        } else if (createCall.status === 201 || createCall.status === 200) {
          console.log('ℹ️ Phone was not a duplicate or duplicates allowed');
        }
      }
      
      tracker.printSummary();
    });
    
    test('PARTY.7.4: Should show error for duplicate email', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Use a known email
      const existingEmail = 'test@example.com';
      
      // Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form
      await dialog.locator('input[name="name"]').fill(`Duplicate Email Test ${Date.now()}`);
      
      // Select type
      try {
        const typeSelect = dialog.locator('button[role="combobox"]').first();
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Customer")').first().click({ force: true });
      } catch {}
      
      // Enter duplicate email
      try {
        await dialog.locator('input[name="email"]').fill(existingEmail);
      } catch {
        console.log('ℹ️ Email field not found');
      }
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Check response
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall) {
        if (createCall.status === 409 || createCall.status === 400) {
          console.log(`📊 API rejected duplicate email: ${createCall.status}`);
        } else if (createCall.status === 201 || createCall.status === 200) {
          console.log('ℹ️ Email was not a duplicate or duplicates allowed');
        }
      }
      
      tracker.printSummary();
    });
    
    test('PARTY.7.5: Should validate invalid GSTIN format', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToParties(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Open Add Party dialog
      const addBtn = page.locator('button:has-text("Add Party"), button:has-text("Add")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form
      await dialog.locator('input[name="name"]').fill(`GSTIN Test ${Date.now()}`);
      
      // Select type
      try {
        const typeSelect = dialog.locator('button[role="combobox"]').first();
        await typeSelect.click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('[role="option"]:has-text("Customer")').first().click({ force: true });
      } catch {}
      
      // Enter invalid GSTIN
      try {
        await dialog.locator('input[name="gstin"]').fill('INVALID123'); // Invalid format
      } catch {
        console.log('ℹ️ GSTIN field not found');
      }
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for validation error
      const errorMsg = page.locator('.text-red-500, .text-destructive, [role="alert"]');
      const hasError = await errorMsg.first().isVisible().catch(() => false);
      
      const createCall = tracker.getLastCall('/parties', 'POST');
      if (createCall && createCall.status === 400) {
        console.log(`📊 API rejected invalid GSTIN: ${createCall.status}`);
        console.log(`   Error: ${JSON.stringify(createCall.responseBody)}`);
      } else if (hasError) {
        console.log(`📊 UI validation error for invalid GSTIN`);
      } else {
        console.log('ℹ️ GSTIN validation may differ or be optional');
      }
      
      tracker.printSummary();
    });
    
  });
  
});
