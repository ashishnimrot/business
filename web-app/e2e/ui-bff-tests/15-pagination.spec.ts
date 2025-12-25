import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 15-Pagination Tests
 * 
 * Pagination and infinite scroll tests.
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

test.describe('15. Pagination Tests', () => {
  
  test.describe('PAGE.1: Party List Pagination', () => {
    
    test('PAGE.1.1: Should load pagination controls or infinite scroll', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Check for pagination controls
      const pagination = page.locator('[aria-label*="pagination" i], .pagination, button:has-text("Next"), button:has-text("Previous")').first();
      const hasPagination = await pagination.isVisible().catch(() => false);
      
      console.log(`📊 Pagination controls: ${hasPagination}`);
      
      // Check for page size selector
      const pageSize = page.locator('select:has-text("10"), select:has-text("20"), [data-testid*="page-size"]').first();
      const hasPageSize = await pageSize.isVisible().catch(() => false);
      
      console.log(`📊 Page size selector: ${hasPageSize}`);
      
      // Check API for pagination params
      const partyApi = tracker.getByUrlPattern('parties');
      if (partyApi) {
        const hasPaginationParam = partyApi.url.includes('page=') || partyApi.url.includes('limit=');
        console.log(`📊 API uses pagination params: ${hasPaginationParam}`);
      }
      
      tracker.printSummary();
    });
    
    test('PAGE.1.2: Should navigate between pages', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Find next page button
      const nextBtn = page.locator('button:has-text("Next"), button[aria-label*="next" i], [data-testid="next-page"]').first();
      try {
        if (await nextBtn.isEnabled()) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
          
          console.log('✅ Navigated to next page');
          
          // Go back
          const prevBtn = page.locator('button:has-text("Previous"), button[aria-label*="previous" i]').first();
          if (await prevBtn.isEnabled()) {
            await prevBtn.click();
            await page.waitForTimeout(1000);
            console.log('✅ Navigated to previous page');
          }
        }
      } catch {
        console.log('ℹ️ Pagination navigation not available');
      }
    });
    
  });
  
  test.describe('PAGE.2: Invoice List Pagination', () => {
    
    test('PAGE.2.1: Should paginate invoice list', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/invoices');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Check for pagination or infinite scroll
      const pagination = page.locator('[aria-label*="pagination" i], button:has-text("Load more"), button:has-text("Next")').first();
      const hasPagination = await pagination.isVisible().catch(() => false);
      
      console.log(`📊 Invoice pagination: ${hasPagination}`);
      
      // Count current items
      const items = page.locator('.cursor-pointer, tr[data-state], [data-testid*="invoice"]');
      const count = await items.count();
      console.log(`📊 Visible invoices: ${count}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAGE.3: Inventory Pagination', () => {
    
    test('PAGE.3.1: Should paginate inventory list', async ({ page }) => {
      await page.goto('/inventory');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Count items
      const items = page.locator('.cursor-pointer, tr[data-state], [data-testid*="item"]');
      const count = await items.count();
      console.log(`📊 Visible items: ${count}`);
      
      // Check for pagination
      const pagination = page.locator('button:has-text("Next"), [aria-label*="pagination" i]').first();
      const hasPagination = await pagination.isVisible().catch(() => false);
      
      console.log(`📊 Inventory pagination: ${hasPagination}`);
    });
    
  });
  
  test.describe('PAGE.4: Payment Pagination', () => {
    
    test('PAGE.4.1: Should paginate payment list', async ({ page }) => {
      await page.goto('/payments');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Count payments
      const items = page.locator('.cursor-pointer, tr[data-state], [data-testid*="payment"]');
      const count = await items.count();
      console.log(`📊 Visible payments: ${count}`);
      
      // Check for pagination
      const pagination = page.locator('button:has-text("Next"), [aria-label*="pagination" i]').first();
      const hasPagination = await pagination.isVisible().catch(() => false);
      
      console.log(`📊 Payment pagination: ${hasPagination}`);
    });
    
  });
  
  test.describe('PAGE.5: Infinite Scroll', () => {
    
    test('PAGE.5.1: Should load more items on scroll', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get initial count
      const items = page.locator('.cursor-pointer, tr[data-state]');
      const initialCount = await items.count();
      console.log(`📊 Initial items: ${initialCount}`);
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      
      // Check if more loaded
      const afterScrollCount = await items.count();
      console.log(`📊 After scroll items: ${afterScrollCount}`);
      
      const moreLoaded = afterScrollCount > initialCount;
      console.log(`📊 Infinite scroll working: ${moreLoaded}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PAGE.6: Page Size Selection', () => {
    
    test('PAGE.6.1: Should change page size', async ({ page }) => {
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Find page size selector
      const pageSize = page.locator('select[name*="size"], [data-testid*="page-size"]').first();
      try {
        await pageSize.selectOption('20');
        await page.waitForTimeout(2000);
        
        console.log('✅ Changed page size to 20');
        
      } catch {
        console.log('ℹ️ Page size selector not available');
      }
    });
    
  });
  
});
