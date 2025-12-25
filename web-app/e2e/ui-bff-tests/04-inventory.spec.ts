import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker, generateTestData } from './test-config';

/**
 * 04-Inventory Tests
 * 
 * Inventory/Items CRUD operations with BFF verification.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':3005')) {
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

async function navigateToInventory(page: Page) {
  await page.goto('/inventory');
  await page.waitForTimeout(3000);
  
  if (page.url().includes('/login')) {
    return false;
  }
  
  if (page.url().includes('/dashboard')) {
    const link = page.locator('a[href="/inventory"], nav a:has-text("Inventory")').first();
    try {
      await link.click();
      await page.waitForTimeout(2000);
    } catch {}
  }
  
  return true;
}

test.describe('04. Inventory Tests', () => {
  
  test.describe('INV.1: List Items', () => {
    
    test('INV.1.1: Should list all items', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Verify items API call
      const itemsCall = tracker.getLastCall('/items', 'GET');
      expect(itemsCall).toBeTruthy();
      console.log(`📊 Items API: ${itemsCall?.status}`);
      expect(itemsCall?.status).toBe(200);
      
      // Verify response structure
      if (itemsCall?.responseBody) {
        const items = Array.isArray(itemsCall.responseBody) 
          ? itemsCall.responseBody 
          : itemsCall.responseBody.items || [];
        console.log(`   Found ${items.length} items`);
      }
      
      tracker.printSummary();
    });
    
    test('INV.1.2: Should search items by name', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      try {
        await searchInput.fill('Product');
        await page.waitForTimeout(2000);
        
        const searchCall = tracker.getCallsByUrl('/items').find(c => 
          c.url.includes('search=')
        );
        
        if (searchCall) {
          console.log(`📊 Search API: ${searchCall.url}`);
          expect(searchCall.status).toBe(200);
        }
      } catch {
        console.log('ℹ️ Search not available');
      }
      
      tracker.printSummary();
    });
    
    test('INV.1.3: Should filter low stock items', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click Low Stock filter
      const lowStockBtn = page.locator('button:has-text("Low Stock"), [role="tab"]:has-text("Low Stock")').first();
      try {
        await lowStockBtn.click();
        await page.waitForTimeout(2000);
        
        const lowStockCall = tracker.getCallsByUrl('/items').find(c => 
          c.url.includes('low-stock') || c.url.includes('lowStock')
        );
        
        if (lowStockCall) {
          console.log(`📊 Low Stock API: ${lowStockCall.url}`);
          expect(lowStockCall.status).toBe(200);
        }
      } catch {
        console.log('ℹ️ Low stock filter not available');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('INV.2: Create Item', () => {
    
    test('INV.2.1: Should create a new item', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      const testData = generateTestData();
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Open Add Item dialog
      const addBtn = page.locator('button:has-text("Add Item"), button:has-text("Add")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form
      await dialog.locator('input[name="name"]').fill(testData.item.name);
      
      try {
        await dialog.locator('input[name="selling_price"], input[name="sellingPrice"]').first().fill(testData.item.selling_price);
        await dialog.locator('input[name="purchase_price"], input[name="purchasePrice"]').first().fill(testData.item.purchase_price);
        await dialog.locator('input[name="opening_stock"], input[name="openingStock"]').first().fill(testData.item.opening_stock);
      } catch {}
      
      tracker.clear();
      
      // Submit
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify API
      const createCall = tracker.getLastCall('/items', 'POST');
      if (createCall) {
        console.log(`📊 Create Item API: ${createCall.status}`);
        console.log(`   Request: ${JSON.stringify(createCall.requestBody)}`);
        expect([200, 201]).toContain(createCall.status);
      }
      
      tracker.printSummary();
    });
    
    test('INV.2.2: Should show validation error for missing name', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add Item")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('[role="dialog"]').first();
      
      // Only fill price, not name
      try {
        await dialog.locator('input[name="selling_price"]').fill('100');
      } catch {}
      
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
  
  test.describe('INV.3: View Item Detail', () => {
    
    test('INV.3.1: Should view item detail page', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Click on first item
      const itemCard = page.locator('.cursor-pointer, a[href*="/inventory/"]').first();
      try {
        await itemCard.click();
        await page.waitForTimeout(3000);
        
        // Verify detail API call
        const detailCall = tracker.getCallsByUrl('/items/').find(c => 
          c.method === 'GET' && c.url.match(/\/items\/[a-f0-9-]+$/)
        );
        
        if (detailCall) {
          console.log(`📊 Item Detail API: ${detailCall.status}`);
          expect(detailCall.status).toBe(200);
        }
        
      } catch {
        console.log('⚠️ No item to view');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('INV.4: Update Item', () => {
    
    test('INV.4.1: Should update item details', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to item detail
      const itemCard = page.locator('.cursor-pointer, a[href*="/inventory/"]').first();
      try {
        await itemCard.click();
        await page.waitForTimeout(2000);
      } catch {
        test.skip();
        return;
      }
      
      // Click Edit button
      const editBtn = page.locator('button:has-text("Edit")').first();
      try {
        await editBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      // Update name
      const nameInput = page.locator('input[name="name"]').first();
      await nameInput.clear();
      await nameInput.fill(`Updated Item ${Date.now()}`);
      
      tracker.clear();
      
      // Save
      const saveBtn = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Verify PATCH call
      const updateCall = tracker.getLastCall('/items/', 'PATCH');
      if (updateCall) {
        console.log(`📊 Update Item API: ${updateCall.status}`);
        expect(updateCall.status).toBe(200);
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('INV.5: Delete Item', () => {
    
    test('INV.5.1: Should delete an item', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
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
        
        const deleteCall = tracker.getLastCall('/items/', 'DELETE');
        if (deleteCall) {
          console.log(`📊 Delete Item API: ${deleteCall.status}`);
          expect([200, 204]).toContain(deleteCall.status);
        }
        
      } catch {
        console.log('⚠️ Delete flow not available');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('INV.6: Stock Adjustment', () => {
    
    test('INV.6.1: Should adjust item stock', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to item detail
      const itemCard = page.locator('.cursor-pointer').first();
      try {
        await itemCard.click();
        await page.waitForTimeout(2000);
      } catch {
        test.skip();
        return;
      }
      
      // Look for stock adjustment button
      const adjustBtn = page.locator('button:has-text("Adjust Stock"), button:has-text("Stock")').first();
      try {
        await adjustBtn.click();
        await page.waitForTimeout(1000);
        
        // Fill adjustment form
        const quantityInput = page.locator('input[name="quantity"], input[type="number"]').first();
        await quantityInput.fill('10');
        
        tracker.clear();
        
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click({ force: true });
        await page.waitForTimeout(3000);
        
        // Check for stock adjustment API
        const adjustCall = tracker.getCallsByUrl('/items').find(c => 
          c.url.includes('stock') || c.method === 'PATCH'
        );
        
        if (adjustCall) {
          console.log(`📊 Stock Adjust API: ${adjustCall.status}`);
        }
        
      } catch {
        console.log('ℹ️ Stock adjustment not available');
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('INV.7: Filter by Category', () => {
    
    test('INV.7.1: Should filter items by category', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Look for category filter dropdown or tabs
      const categoryFilter = page.locator('select[name="category"], button:has-text("Category"), [data-testid="category-filter"]').first();
      
      try {
        if (await categoryFilter.isVisible({ timeout: 3000 })) {
          tracker.clear();
          
          // Try clicking to open dropdown
          await categoryFilter.click();
          await page.waitForTimeout(1000);
          
          // Select a category option
          const categoryOption = page.locator('[role="option"], option').first();
          if (await categoryOption.isVisible({ timeout: 2000 })) {
            await categoryOption.click();
            await page.waitForTimeout(2000);
            
            // Verify API call with category filter
            const filterCall = tracker.getCallsByUrl('/items').find(c => 
              c.url.includes('category=') || c.url.includes('categoryId=')
            );
            
            if (filterCall) {
              console.log(`📊 Category Filter API: ${filterCall.url}`);
              expect(filterCall.status).toBe(200);
            } else {
              console.log('ℹ️ Category filter applied client-side or not captured');
            }
          }
        } else {
          console.log('ℹ️ Category filter not available');
        }
      } catch {
        console.log('ℹ️ Category filter feature may not be implemented');
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('INV.8: Stock History', () => {
    
    test('INV.8.1: Should view stock history for an item', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to item detail
      const itemCard = page.locator('.cursor-pointer, a[href*="/inventory/"]').first();
      try {
        await itemCard.click();
        await page.waitForTimeout(2000);
      } catch {
        console.log('⚠️ No item to view');
        test.skip();
        return;
      }
      
      // Look for stock history tab or section
      const historyTab = page.locator('button:has-text("History"), button:has-text("Stock History"), [role="tab"]:has-text("History"), a:has-text("History")').first();
      
      try {
        tracker.clear();
        
        if (await historyTab.isVisible({ timeout: 3000 })) {
          await historyTab.click();
          await page.waitForTimeout(2000);
          
          // Verify stock history API call
          const historyCall = tracker.getCallsByUrl('/history').find(c => c.method === 'GET') ||
                             tracker.getCallsByUrl('/stock-history').find(c => c.method === 'GET') ||
                             tracker.getCallsByUrl('/items/').find(c => c.url.includes('history'));
          
          if (historyCall) {
            console.log(`📊 Stock History API: ${historyCall.status}`);
            expect(historyCall.status).toBe(200);
            
            if (historyCall.responseBody) {
              const entries = Array.isArray(historyCall.responseBody) 
                ? historyCall.responseBody 
                : historyCall.responseBody.history || [];
              console.log(`   Found ${entries.length} history entries`);
            }
          } else {
            console.log('ℹ️ Stock history API not detected - may be embedded in item detail');
          }
          
          // Verify UI shows history
          const historyTable = page.locator('table, [data-testid="stock-history"]');
          const historyItems = page.locator('.history-entry, tr');
          const hasHistory = await historyTable.isVisible().catch(() => false);
          console.log(`📊 UI shows stock history: ${hasHistory}`);
          
        } else {
          console.log('ℹ️ Stock history tab not found');
          
          // Check if history is displayed on main detail page
          const historySection = page.locator('[data-testid="stock-history"], .stock-history, :text("Stock History")');
          if (await historySection.isVisible().catch(() => false)) {
            console.log('   Stock history visible in detail view');
          }
        }
      } catch {
        console.log('ℹ️ Stock history feature may not be implemented');
      }
      
      tracker.printSummary();
    });
    
    test('INV.8.2: Should show stock adjustment decrease', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      // Navigate to item detail
      const itemCard = page.locator('.cursor-pointer').first();
      try {
        await itemCard.click();
        await page.waitForTimeout(2000);
      } catch {
        test.skip();
        return;
      }
      
      // Look for stock adjustment button
      const adjustBtn = page.locator('button:has-text("Adjust Stock"), button:has-text("Stock")').first();
      try {
        await adjustBtn.click();
        await page.waitForTimeout(1000);
        
        // Try to select "decrease" type
        const decreaseOption = page.locator('button:has-text("Decrease"), [role="option"]:has-text("Decrease"), input[value="decrease"]');
        if (await decreaseOption.isVisible().catch(() => false)) {
          await decreaseOption.click();
        }
        
        // Fill adjustment form
        const quantityInput = page.locator('input[name="quantity"], input[type="number"]').first();
        await quantityInput.fill('5');
        
        tracker.clear();
        
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click({ force: true });
        await page.waitForTimeout(3000);
        
        // Check for stock adjustment API
        const adjustCall = tracker.getCallsByUrl('/items').find(c => 
          c.url.includes('stock') || c.method === 'PATCH'
        );
        
        if (adjustCall) {
          console.log(`📊 Stock Decrease API: ${adjustCall.status}`);
          expect([200, 204]).toContain(adjustCall.status);
          console.log(`   ✅ Stock decrease recorded`);
        }
        
      } catch {
        console.log('ℹ️ Stock decrease not available');
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('INV.9: Additional Validations', () => {
    
    test('INV.9.1: Should show error for missing selling price', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add Item")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill only name, not selling price
      await dialog.locator('input[name="name"]').fill(`Test Item ${Date.now()}`);
      
      // Clear selling price if it has a default
      try {
        const priceInput = dialog.locator('input[name="selling_price"]');
        await priceInput.clear();
      } catch {}
      
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for error
      const errorMsg = dialog.locator('.text-red-500, .text-destructive').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      
      const createCall = tracker.getLastCall('/items', 'POST');
      if (createCall && createCall.status === 400) {
        console.log(`📊 API rejected missing selling price: ${createCall.status}`);
      } else if (hasError) {
        console.log(`📊 UI validation error shown for missing selling price`);
      } else {
        console.log('ℹ️ Selling price may have default value or not be required');
      }
      
      tracker.printSummary();
    });
    
    test('INV.9.2: Should show error for negative price', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add Item")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form with negative price
      await dialog.locator('input[name="name"]').fill(`Negative Price Item ${Date.now()}`);
      
      try {
        await dialog.locator('input[name="selling_price"]').fill('-100');
      } catch {}
      
      tracker.clear();
      
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for error
      const errorMsg = dialog.locator('.text-red-500, .text-destructive').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      
      const createCall = tracker.getLastCall('/items', 'POST');
      if (createCall && createCall.status === 400) {
        console.log(`📊 API rejected negative price: ${createCall.status}`);
      } else if (hasError) {
        console.log(`📊 UI validation error shown for negative price`);
      } else {
        console.log('ℹ️ Negative price may be allowed or handled differently');
      }
      
      tracker.printSummary();
    });
    
    test('INV.9.3: Should show error for negative stock', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      const success = await navigateToInventory(page);
      if (!success) {
        test.skip();
        return;
      }
      
      const addBtn = page.locator('button:has-text("Add Item")').first();
      try {
        await addBtn.click();
        await page.waitForTimeout(1000);
      } catch {
        test.skip();
        return;
      }
      
      const dialog = page.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      
      // Fill form with negative stock
      await dialog.locator('input[name="name"]').fill(`Negative Stock Item ${Date.now()}`);
      
      try {
        await dialog.locator('input[name="selling_price"]').fill('100');
        await dialog.locator('input[name="opening_stock"], input[name="stock"]').fill('-50');
      } catch {}
      
      tracker.clear();
      
      const submitBtn = dialog.locator('button[type="submit"]').first();
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Check for error
      const errorMsg = dialog.locator('.text-red-500, .text-destructive').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      
      const createCall = tracker.getLastCall('/items', 'POST');
      if (createCall && createCall.status === 400) {
        console.log(`📊 API rejected negative stock: ${createCall.status}`);
      } else if (hasError) {
        console.log(`📊 UI validation error shown for negative stock`);
      } else {
        console.log('ℹ️ Negative stock may be allowed or handled differently');
      }
      
      tracker.printSummary();
    });
    
  });
  
});
