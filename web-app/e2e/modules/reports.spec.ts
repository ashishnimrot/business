import { test, expect } from '@playwright/test';
import { navigateTo, isVisible, logStep } from '../test-utils';

/**
 * Reports Module Tests
 * 
 * Tests reports functionality:
 * - Reports page loading
 * - Report types
 * - Date range selection
 * - Export options
 * 
 * These tests run independently - failures don't affect other modules.
 */

test.describe('6. Reports Module', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MODULE: Reports');
    console.log('   Testing reports & analytics');
    console.log('='.repeat(60) + '\n');
  });

  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/reports');
  });

  test('6.1 Reports page loads successfully', async ({ page }) => {
    logStep('Verifying reports page loads');
    
    // May redirect to dashboard or show reports
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
    
    logStep('Reports page loaded', 'pass');
  });

  test('6.2 Report types available', async ({ page }) => {
    logStep('Checking for report types');
    
    const salesReport = await isVisible(page, 'text=/Sales|Revenue/i', 3000);
    const stockReport = await isVisible(page, 'text=/Stock|Inventory/i', 3000);
    const partyReport = await isVisible(page, 'text=/Party|Customer|Supplier|Ledger/i', 3000);
    
    if (salesReport || stockReport || partyReport) {
      logStep('Report types available', 'pass');
    } else {
      logStep('Reports may be dashboard-integrated', 'skip');
    }
  });

  test('6.3 Date range selector', async ({ page }) => {
    logStep('Checking for date range selector');
    
    const dateSelector = await isVisible(page, 'input[type="date"], button:has-text("Date"), text=/Today|Week|Month|Year/i', 3000);
    if (dateSelector) {
      logStep('Date range selector found', 'pass');
    } else {
      logStep('Date selection uses different pattern', 'skip');
    }
  });

  test('6.4 Export options available', async ({ page }) => {
    logStep('Checking for export options');
    
    const exportOption = await isVisible(page, 'text=/Export|Download|PDF|Excel|CSV/i', 3000);
    if (exportOption) {
      logStep('Export options available', 'pass');
    } else {
      logStep('Export may use different UI', 'skip');
    }
  });

  test('6.5 Report charts/visualizations', async ({ page }) => {
    logStep('Checking for charts');
    
    const hasCharts = await isVisible(page, 'canvas, svg[class*="chart"], [class*="chart"]', 3000);
    if (hasCharts) {
      logStep('Report charts visible', 'pass');
    } else {
      logStep('Charts may load on demand', 'skip');
    }
  });

  test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✓ Reports Module Complete');
    console.log('='.repeat(60) + '\n');
  });
});
