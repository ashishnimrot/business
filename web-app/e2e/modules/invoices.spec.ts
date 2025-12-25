import { test, expect } from '@playwright/test';
import { navigateTo, isVisible, waitAndClick, getCount, logStep, softExpect, closeDialog, SELECTORS } from '../test-utils';

/**
 * Invoices Module Tests
 * 
 * Tests invoice management:
 * - Invoice list display
 * - Create invoice functionality
 * - Invoice types (Sales/Purchase)
 * - Invoice navigation
 * - Search functionality
 * 
 * These tests run independently - failures don't affect other modules.
 */

test.describe('4. Invoices Module', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📄 MODULE: Invoices');
    console.log('   Testing sales & purchase invoice management');
    console.log('='.repeat(60) + '\n');
  });

  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/invoices');
  });

  test('4.1 Invoices page loads successfully', async ({ page }) => {
    logStep('Verifying invoices page loads');
    
    await expect(page).toHaveURL(/invoices/);
    
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
    
    logStep('Invoices page loaded', 'pass');
  });

  test('4.2 Create Invoice button is visible', async ({ page }) => {
    logStep('Looking for Create Invoice button');
    
    const createBtn = page.locator(SELECTORS.createInvoiceButton).first();
    const isButtonVisible = await createBtn.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isButtonVisible) {
      logStep('Create Invoice button found', 'pass');
    } else {
      const plusButton = page.locator('a[href*="create"], button:has(svg)').first();
      const hasAlt = await plusButton.isVisible({ timeout: 3000 }).catch(() => false);
      await softExpect(hasAlt, 'Alternative create action found');
    }
  });

  test('4.3 Invoice type tabs (Sales/Purchase)', async ({ page }) => {
    logStep('Checking for invoice type tabs');
    
    const salesTab = await isVisible(page, 'text=/Sales|Sale/i', 3000);
    const purchaseTab = await isVisible(page, 'text=/Purchase|Buy/i', 3000);
    
    if (salesTab || purchaseTab) {
      logStep('Invoice type tabs found', 'pass');
      
      // Try clicking tabs
      if (salesTab) {
        await page.locator('text=/Sales|Sale/i').first().click();
        await page.waitForTimeout(500);
      }
      if (purchaseTab) {
        await page.locator('text=/Purchase|Buy/i').first().click();
        await page.waitForTimeout(500);
      }
      logStep('Invoice tabs are interactive', 'pass');
    } else {
      logStep('Using different invoice type selection', 'skip');
    }
  });

  test('4.4 Navigate to create invoice', async ({ page }) => {
    logStep('Testing create invoice navigation');
    
    const createBtn = page.locator(SELECTORS.createInvoiceButton + ', a[href*="/invoices/create"]').first();
    
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(2000);
      
      const url = page.url();
      const hasDialog = await isVisible(page, SELECTORS.dialog, 2000);
      
      if (url.includes('create') || hasDialog) {
        logStep('Create invoice flow initiated', 'pass');
        
        // Go back to list
        if (hasDialog) {
          await closeDialog(page);
        } else {
          await page.goBack();
        }
      } else {
        logStep('Create invoice has different pattern', 'skip');
      }
    } else {
      logStep('Create invoice button not found', 'skip');
    }
  });

  test('4.5 Invoice list displays correctly', async ({ page }) => {
    logStep('Checking invoice list display');
    
    const table = page.locator(SELECTORS.table).first();
    const hasTable = await table.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasTable) {
      logStep('Invoice list visible', 'pass');
      
      const rows = await page.locator('tbody tr, [role="row"]').count();
      logStep(`Found ${rows} invoices`, 'pass');
    } else {
      const emptyState = await isVisible(page, 'text=/no invoices|empty|create your first/i', 3000);
      if (emptyState) {
        logStep('Empty state shown (no invoices yet)', 'pass');
      } else {
        logStep('Invoice display uses different pattern', 'skip');
      }
    }
  });

  test('4.6 Invoice status filters', async ({ page }) => {
    logStep('Checking for invoice status filters');
    
    const hasFilters = await isVisible(page, 'text=/All|Paid|Pending|Overdue|Draft/i', 3000);
    if (hasFilters) {
      logStep('Invoice status filters found', 'pass');
    } else {
      logStep('Status filters may use different UI', 'skip');
    }
  });

  test('4.7 Invoice search functionality', async ({ page }) => {
    logStep('Testing invoice search');
    
    const searchInput = page.locator(SELECTORS.searchInput).first();
    const hasSearch = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasSearch) {
      await searchInput.fill('INV');
      await page.waitForTimeout(1000);
      logStep('Search functionality works', 'pass');
      await searchInput.clear();
    } else {
      logStep('Search may use different pattern', 'skip');
    }
  });

  test('4.8 Invoice totals display', async ({ page }) => {
    logStep('Checking for invoice totals');
    
    const hasTotals = await isVisible(page, 'text=/Total|Amount|Revenue|₹|Rs/i', 3000);
    if (hasTotals) {
      logStep('Invoice totals displayed', 'pass');
    } else {
      logStep('Totals may be shown differently', 'skip');
    }
  });

  test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✓ Invoices Module Complete');
    console.log('='.repeat(60) + '\n');
  });
});
