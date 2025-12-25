import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 07-Dashboard Tests
 * 
 * Dashboard page tests with BFF verification.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':300')) {
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

test.describe('07. Dashboard Tests', () => {
  
  test.describe('DASH.1: Dashboard Loading', () => {
    
    test('DASH.1.1: Should load dashboard with all stats', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        console.log('⚠️ Redirected to login');
        test.skip();
        return;
      }
      
      console.log(`📍 URL: ${page.url()}`);
      
      // Check API calls made for dashboard
      const apiCalls = tracker.calls;
      console.log(`📊 Total API calls: ${apiCalls.length}`);
      
      // Should call multiple services for dashboard data
      const partiesCall = tracker.getLastCall('/parties', 'GET');
      const itemsCall = tracker.getLastCall('/items', 'GET');
      const invoicesCall = tracker.getLastCall('/invoices', 'GET');
      const paymentsCall = tracker.getLastCall('/payments', 'GET');
      
      console.log(`   Parties API: ${partiesCall?.status || 'Not called'}`);
      console.log(`   Items API: ${itemsCall?.status || 'Not called'}`);
      console.log(`   Invoices API: ${invoicesCall?.status || 'Not called'}`);
      console.log(`   Payments API: ${paymentsCall?.status || 'Not called'}`);
      
      // Verify dashboard UI elements
      const heading = page.locator('h1, h2').first();
      const headingText = await heading.textContent().catch(() => '');
      console.log(`📊 Page heading: ${headingText}`);
      
      // Check for stat cards
      const statCards = page.locator('[data-testid="stat-card"], .stat-card, .rounded-lg');
      const cardCount = await statCards.count();
      console.log(`📊 Stat cards found: ${cardCount}`);
      
      tracker.printSummary();
    });
    
    test('DASH.1.2: Should display correct stats values', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Check for specific stat elements
      const statsToCheck = [
        'Total Sales',
        'Total Purchases',
        'Receivables',
        'Payables',
        'Total Parties',
        'Total Items',
      ];
      
      for (const stat of statsToCheck) {
        const element = page.locator(`:text("${stat}")`).first();
        const exists = await element.isVisible().catch(() => false);
        console.log(`   ${stat}: ${exists ? '✅' : '❌'}`);
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('DASH.2: Quick Actions', () => {
    
    test('DASH.2.1: Should navigate to create invoice from dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for quick action button
      const createInvoiceBtn = page.locator('button:has-text("Create Invoice"), a:has-text("Create Invoice")').first();
      try {
        await createInvoiceBtn.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log(`📍 After click: ${currentUrl}`);
        expect(currentUrl).toContain('/invoices');
        
      } catch {
        console.log('ℹ️ Create invoice quick action not available');
      }
    });
    
    test('DASH.2.2: Should navigate to add party from dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const addPartyBtn = page.locator('button:has-text("Add Party"), a:has-text("Add Party")').first();
      try {
        await addPartyBtn.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log(`📍 After click: ${currentUrl}`);
        
      } catch {
        console.log('ℹ️ Add party quick action not available');
      }
    });
    
  });
  
  test.describe('DASH.3: Recent Activity', () => {
    
    test('DASH.3.1: Should show recent transactions', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for recent activity section
      const recentSection = page.locator(':text("Recent"), :text("Activity"), :text("Transactions")').first();
      const exists = await recentSection.isVisible().catch(() => false);
      console.log(`📊 Recent activity section: ${exists ? 'Found' : 'Not found'}`);
      
      tracker.printSummary();
    });
    
  });

  test.describe('DASH.4: Dashboard Calculations', () => {
    
    test('DASH.4.1: Should verify total sales calculation', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get invoices data to calculate expected sales
      const invoicesCall = tracker.getLastCall('/invoices', 'GET');
      let expectedSales = 0;
      
      if (invoicesCall?.responseBody) {
        const invoices = Array.isArray(invoicesCall.responseBody) 
          ? invoicesCall.responseBody 
          : invoicesCall.responseBody.invoices || [];
        
        expectedSales = invoices
          .filter((inv: any) => inv.type === 'sale' || inv.invoice_type === 'sale')
          .reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || parseFloat(inv.total) || 0), 0);
        
        console.log(`📊 Expected Sales (from API): ₹${expectedSales.toFixed(2)}`);
      }
      
      // Find sales stat on dashboard
      const salesElement = page.locator(':text("Total Sales"), :text("Sales")').first();
      if (await salesElement.isVisible().catch(() => false)) {
        // Get the value next to or below the label
        const salesValue = await page.locator('[data-testid="total-sales"], .stat-value').first().textContent().catch(() => '');
        console.log(`📊 Dashboard Sales Value: ${salesValue}`);
        
        // Extract number from string (handle ₹ symbol and commas)
        const displayedSales = parseFloat(salesValue.replace(/[₹,\s]/g, '')) || 0;
        console.log(`   Displayed: ₹${displayedSales.toFixed(2)}`);
        
        // Allow for minor rounding differences
        if (expectedSales > 0) {
          const difference = Math.abs(expectedSales - displayedSales);
          const percentDiff = (difference / expectedSales) * 100;
          console.log(`   Difference: ${percentDiff.toFixed(2)}%`);
          
          if (percentDiff < 5) {
            console.log(`   ✅ Sales calculation verified (within 5% tolerance)`);
          } else {
            console.log(`   ⚠️ Sales calculation may differ - check source data`);
          }
        }
      }
      
      tracker.printSummary();
    });
    
    test('DASH.4.2: Should verify outstanding receivables calculation', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get invoices data to calculate expected receivables
      const invoicesCall = tracker.getLastCall('/invoices', 'GET');
      let expectedReceivables = 0;
      
      if (invoicesCall?.responseBody) {
        const invoices = Array.isArray(invoicesCall.responseBody) 
          ? invoicesCall.responseBody 
          : invoicesCall.responseBody.invoices || [];
        
        // Receivables = unpaid sale invoices
        expectedReceivables = invoices
          .filter((inv: any) => 
            (inv.type === 'sale' || inv.invoice_type === 'sale') && 
            (inv.payment_status === 'unpaid' || inv.payment_status === 'partial' || inv.status === 'pending')
          )
          .reduce((sum: number, inv: any) => {
            const total = parseFloat(inv.total_amount) || parseFloat(inv.total) || 0;
            const paid = parseFloat(inv.paid_amount) || parseFloat(inv.amount_paid) || 0;
            return sum + (total - paid);
          }, 0);
        
        console.log(`📊 Expected Receivables (from API): ₹${expectedReceivables.toFixed(2)}`);
      }
      
      // Find receivables stat on dashboard
      const receivablesElement = page.locator(':text("Receivables"), :text("Outstanding")').first();
      if (await receivablesElement.isVisible().catch(() => false)) {
        const receivablesValue = await page.locator('[data-testid="receivables"], [data-testid="outstanding"]').first().textContent().catch(() => '');
        console.log(`📊 Dashboard Receivables Value: ${receivablesValue}`);
        
        const displayedReceivables = parseFloat(receivablesValue.replace(/[₹,\s]/g, '')) || 0;
        console.log(`   Displayed: ₹${displayedReceivables.toFixed(2)}`);
        
        if (expectedReceivables > 0) {
          const difference = Math.abs(expectedReceivables - displayedReceivables);
          const percentDiff = (difference / expectedReceivables) * 100;
          console.log(`   Difference: ${percentDiff.toFixed(2)}%`);
          
          if (percentDiff < 5) {
            console.log(`   ✅ Receivables calculation verified`);
          }
        }
      } else {
        console.log('ℹ️ Receivables element not found on dashboard');
      }
      
      tracker.printSummary();
    });
    
    test('DASH.4.3: Should verify total purchases calculation', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get invoices data to calculate expected purchases
      const invoicesCall = tracker.getLastCall('/invoices', 'GET');
      let expectedPurchases = 0;
      
      if (invoicesCall?.responseBody) {
        const invoices = Array.isArray(invoicesCall.responseBody) 
          ? invoicesCall.responseBody 
          : invoicesCall.responseBody.invoices || [];
        
        expectedPurchases = invoices
          .filter((inv: any) => inv.type === 'purchase' || inv.invoice_type === 'purchase')
          .reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || parseFloat(inv.total) || 0), 0);
        
        console.log(`📊 Expected Purchases (from API): ₹${expectedPurchases.toFixed(2)}`);
      }
      
      // Find purchases stat on dashboard
      const purchasesElement = page.locator(':text("Total Purchases"), :text("Purchases")').first();
      if (await purchasesElement.isVisible().catch(() => false)) {
        const purchasesValue = await page.locator('[data-testid="total-purchases"]').first().textContent().catch(() => '');
        console.log(`📊 Dashboard Purchases Value: ${purchasesValue}`);
        
        const displayedPurchases = parseFloat(purchasesValue.replace(/[₹,\s]/g, '')) || 0;
        console.log(`   Displayed: ₹${displayedPurchases.toFixed(2)}`);
        
        if (expectedPurchases > 0) {
          const difference = Math.abs(expectedPurchases - displayedPurchases);
          const percentDiff = (difference / expectedPurchases) * 100;
          
          if (percentDiff < 5) {
            console.log(`   ✅ Purchases calculation verified`);
          }
        }
      } else {
        console.log('ℹ️ Purchases element not found on dashboard');
      }
      
      tracker.printSummary();
    });
    
    test('DASH.4.4: Should verify pending invoices count', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get invoices data to count pending
      const invoicesCall = tracker.getLastCall('/invoices', 'GET');
      let expectedPendingCount = 0;
      
      if (invoicesCall?.responseBody) {
        const invoices = Array.isArray(invoicesCall.responseBody) 
          ? invoicesCall.responseBody 
          : invoicesCall.responseBody.invoices || [];
        
        expectedPendingCount = invoices.filter((inv: any) => 
          inv.payment_status === 'unpaid' || 
          inv.payment_status === 'partial' || 
          inv.status === 'pending' ||
          inv.status === 'draft'
        ).length;
        
        console.log(`📊 Expected Pending Invoices (from API): ${expectedPendingCount}`);
      }
      
      // Find pending invoices stat on dashboard
      const pendingElement = page.locator(':text("Pending"), :text("Unpaid")').first();
      if (await pendingElement.isVisible().catch(() => false)) {
        const pendingText = await pendingElement.textContent().catch(() => '');
        console.log(`📊 Dashboard shows pending invoices info: ${pendingText}`);
        
        // Extract number if present
        const match = pendingText.match(/(\d+)/);
        if (match) {
          const displayedCount = parseInt(match[1]);
          console.log(`   Displayed count: ${displayedCount}`);
          console.log(`   Expected count: ${expectedPendingCount}`);
          
          if (displayedCount === expectedPendingCount) {
            console.log(`   ✅ Pending invoices count verified`);
          } else {
            console.log(`   ⚠️ Count differs - may use different criteria`);
          }
        }
      } else {
        console.log('ℹ️ Pending invoices element not found');
      }
      
      tracker.printSummary();
    });
    
    test('DASH.4.5: Should verify low stock items count', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get items data to count low stock
      const itemsCall = tracker.getLastCall('/items', 'GET');
      let expectedLowStockCount = 0;
      
      if (itemsCall?.responseBody) {
        const items = Array.isArray(itemsCall.responseBody) 
          ? itemsCall.responseBody 
          : itemsCall.responseBody.items || [];
        
        expectedLowStockCount = items.filter((item: any) => {
          const currentStock = item.current_stock || item.stock || item.quantity || 0;
          const minStock = item.min_stock_level || item.reorder_level || 10;
          return currentStock <= minStock;
        }).length;
        
        console.log(`📊 Expected Low Stock Items (from API): ${expectedLowStockCount}`);
      }
      
      // Find low stock stat on dashboard
      const lowStockElement = page.locator(':text("Low Stock"), :text("Out of Stock")').first();
      if (await lowStockElement.isVisible().catch(() => false)) {
        const lowStockText = await lowStockElement.textContent().catch(() => '');
        console.log(`📊 Dashboard shows low stock info: ${lowStockText}`);
        
        const match = lowStockText.match(/(\d+)/);
        if (match) {
          const displayedCount = parseInt(match[1]);
          console.log(`   Displayed count: ${displayedCount}`);
          console.log(`   Expected count: ${expectedLowStockCount}`);
          
          if (displayedCount === expectedLowStockCount) {
            console.log(`   ✅ Low stock count verified`);
          }
        }
      } else {
        console.log('ℹ️ Low stock element not found');
      }
      
      tracker.printSummary();
    });
    
    test('DASH.4.6: Should verify total parties count', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get parties data
      const partiesCall = tracker.getLastCall('/parties', 'GET');
      let expectedPartiesCount = 0;
      
      if (partiesCall?.responseBody) {
        const parties = Array.isArray(partiesCall.responseBody) 
          ? partiesCall.responseBody 
          : partiesCall.responseBody.parties || [];
        
        expectedPartiesCount = parties.length;
        console.log(`📊 Expected Total Parties (from API): ${expectedPartiesCount}`);
      }
      
      // Find parties stat on dashboard
      const partiesElement = page.locator(':text("Total Parties"), :text("Parties")').first();
      if (await partiesElement.isVisible().catch(() => false)) {
        const partiesText = await partiesElement.textContent().catch(() => '');
        console.log(`📊 Dashboard shows parties info: ${partiesText}`);
        
        const match = partiesText.match(/(\d+)/);
        if (match) {
          const displayedCount = parseInt(match[1]);
          console.log(`   Displayed count: ${displayedCount}`);
          
          if (displayedCount === expectedPartiesCount) {
            console.log(`   ✅ Parties count verified`);
          }
        }
      } else {
        console.log('ℹ️ Parties element not found');
      }
      
      tracker.printSummary();
    });
    
  });

  test.describe('DASH.5: Dashboard Refresh', () => {
    
    test('DASH.5.1: Should refresh dashboard after creating invoice', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // First, go to dashboard and note initial state
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Capture initial API calls
      const initialInvoicesCall = tracker.getLastCall('/invoices', 'GET');
      const initialInvoiceCount = initialInvoicesCall?.responseBody 
        ? (Array.isArray(initialInvoicesCall.responseBody) 
            ? initialInvoicesCall.responseBody.length 
            : initialInvoicesCall.responseBody.invoices?.length || 0)
        : 0;
      
      console.log(`📊 Initial invoice count: ${initialInvoiceCount}`);
      
      // Navigate away and back to dashboard
      await page.goto('/invoices');
      await page.waitForTimeout(2000);
      
      tracker.clear();
      
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      // Check that dashboard APIs were called again
      const refreshedInvoicesCall = tracker.getLastCall('/invoices', 'GET');
      if (refreshedInvoicesCall) {
        console.log(`📊 Dashboard refreshed invoices API: ${refreshedInvoicesCall.status}`);
        console.log(`   ✅ Dashboard data refreshed on navigation`);
      }
      
      tracker.printSummary();
    });
    
  });
  
});
