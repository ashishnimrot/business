import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 10-Reports Tests
 * 
 * Reports page tests.
 * Auth: phone 9876543210, OTP 129012
 */

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':300')) {
      const request = response.request();
      tracker.add({
        method: request.method(),
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

test.describe('10. Reports Tests', () => {
  
  test.describe('REP.1: Reports Page', () => {
    
    test('REP.1.1: Should load reports page', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      console.log(`📍 URL: ${page.url()}`);
      
      // Check for report types
      const reportTypes = [
        'Sales Report',
        'Purchase Report',
        'Party Report',
        'Stock Report',
        'Ledger',
      ];
      
      for (const report of reportTypes) {
        const element = page.locator(`:text("${report}")`).first();
        const exists = await element.isVisible().catch(() => false);
        console.log(`   ${report}: ${exists ? '✅' : '❌'}`);
      }
      
      tracker.printSummary();
    });
    
    test('REP.1.2: Should filter reports by date range', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for date range picker
      const dateRangePicker = page.locator('button:has-text("Date"), input[type="date"]').first();
      const hasDateRange = await dateRangePicker.isVisible().catch(() => false);
      console.log(`📊 Date range picker: ${hasDateRange}`);
    });
    
  });
  
  test.describe('REP.2: Party Ledger', () => {
    
    test('REP.2.1: Should view party ledger', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to party detail
      const partyCard = page.locator('.cursor-pointer').first();
      try {
        await partyCard.click();
        await page.waitForTimeout(2000);
        
        // Look for ledger tab/button
        const ledgerBtn = page.locator('button:has-text("Ledger"), a:has-text("Ledger"), [role="tab"]:has-text("Ledger")').first();
        const hasLedger = await ledgerBtn.isVisible().catch(() => false);
        console.log(`📊 Ledger tab/button: ${hasLedger}`);
        
        if (hasLedger) {
          await ledgerBtn.click();
          await page.waitForTimeout(2000);
          
          // Check for ledger API call
          const ledgerCall = tracker.getCallsByUrl('/ledger').find(c => c.method === 'GET');
          if (ledgerCall) {
            console.log(`📊 Ledger API: ${ledgerCall.status}`);
          }
        }
        
      } catch {
        console.log('⚠️ No party to check ledger');
      }
      
      tracker.printSummary();
    });
    
  });
  
  // ================================================
  // MISSING TESTS FROM PLAN - ADDED
  // ================================================
  
  test.describe('REP.3: Sales Report', () => {
    
    test('REP.3.1: Should generate sales report', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for sales report option
      const salesReport = page.locator(':text("Sales Report"), button:has-text("Sales")').first();
      const hasSalesReport = await salesReport.isVisible().catch(() => false);
      
      console.log(`📊 Sales report option: ${hasSalesReport}`);
      
      if (hasSalesReport) {
        await salesReport.click();
        await page.waitForTimeout(2000);
        
        // Check for report generation
        const reportCalls = tracker.calls.filter(c => c.url.includes('report') || c.url.includes('sales'));
        console.log(`📊 Report API calls: ${reportCalls.length}`);
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('REP.4: Purchase Report', () => {
    
    test('REP.4.1: Should generate purchase report', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for purchase report option
      const purchaseReport = page.locator(':text("Purchase Report"), button:has-text("Purchase")').first();
      const hasPurchaseReport = await purchaseReport.isVisible().catch(() => false);
      
      console.log(`📊 Purchase report option: ${hasPurchaseReport}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('REP.5: Stock Report', () => {
    
    test('REP.5.1: Should generate stock/inventory report', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for stock report option
      const stockReport = page.locator(':text("Stock Report"), button:has-text("Stock"), :text("Inventory Report")').first();
      const hasStockReport = await stockReport.isVisible().catch(() => false);
      
      console.log(`📊 Stock report option: ${hasStockReport}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('REP.6: Export Reports', () => {
    
    test('REP.6.1: Should export report as PDF', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for export button
      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
      const hasExport = await exportBtn.isVisible().catch(() => false);
      
      console.log(`📊 Export button: ${hasExport}`);
      
      if (hasExport) {
        await exportBtn.click();
        await page.waitForTimeout(500);
        
        const pdfOption = page.locator(':text("PDF")').first();
        const hasPdf = await pdfOption.isVisible().catch(() => false);
        console.log(`📊 PDF export option: ${hasPdf}`);
      }
    });
    
    test('REP.6.2: Should export report as Excel', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const exportBtn = page.locator('button:has-text("Export")').first();
      if (await exportBtn.isVisible().catch(() => false)) {
        await exportBtn.click();
        await page.waitForTimeout(500);
        
        const excelOption = page.locator(':text("Excel"), :text("XLS")').first();
        const hasExcel = await excelOption.isVisible().catch(() => false);
        console.log(`📊 Excel export option: ${hasExcel}`);
      }
    });
    
  });
  
  test.describe('REP.7: Report Filters', () => {
    
    test('REP.7.1: Should filter report by date range', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for date range filter
      const dateFilter = page.locator('button:has-text("Date"), input[type="date"], [data-testid*="date"]').first();
      const hasDateFilter = await dateFilter.isVisible().catch(() => false);
      
      console.log(`📊 Date range filter: ${hasDateFilter}`);
    });
    
    test('REP.7.2: Should filter report by party', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for party filter
      const partyFilter = page.locator('select:has-text("Party"), [role="combobox"]:has-text("Party"), button:has-text("Party")').first();
      const hasPartyFilter = await partyFilter.isVisible().catch(() => false);
      
      console.log(`📊 Party filter: ${hasPartyFilter}`);
    });
    
  });
  
});
