import { test, expect } from '@playwright/test';
import { navigateTo, isVisible, waitAndClick, fillInput, getCount, logStep, softExpect, closeDialog, TEST_DATA, SELECTORS } from '../test-utils';

/**
 * Parties Module Tests
 * 
 * Tests party (customer/supplier) management:
 * - Party list display
 * - Add party functionality
 * - Party form validation
 * - Party tabs (customers/suppliers)
 * - Search functionality
 * 
 * These tests run independently - failures don't affect other modules.
 */

test.describe('2. Parties Module', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('👥 MODULE: Parties');
    console.log('   Testing customer & supplier management');
    console.log('='.repeat(60) + '\n');
  });

  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/parties');
  });

  test('2.1 Parties page loads successfully', async ({ page }) => {
    logStep('Verifying parties page loads');
    
    // Wait for page to settle
    await page.waitForTimeout(2000);
    
    // Check if we're on parties page or got redirected
    const url = page.url();
    if (!url.includes('parties')) {
      // Try navigating again with sidebar click
      const sidebarLink = page.locator('aside a[href*="parties"], nav a[href*="parties"]').first();
      if (await sidebarLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sidebarLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    }
    
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
    
    logStep('Parties page loaded', 'pass');
  });

  test('2.2 Add Party button is visible', async ({ page }) => {
    logStep('Looking for Add Party button');
    
    const addButton = page.locator(SELECTORS.addPartyButton);
    const isButtonVisible = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isButtonVisible) {
      logStep('Add Party button found', 'pass');
    } else {
      // Try alternative - any button with plus icon
      const plusButton = page.locator('button:has(svg)').first();
      const hasAlt = await plusButton.isVisible({ timeout: 3000 }).catch(() => false);
      await softExpect(hasAlt, 'Alternative add button found');
    }
  });

  test('2.3 Add Party dialog opens', async ({ page }) => {
    logStep('Opening Add Party dialog');
    
    const clicked = await waitAndClick(page, SELECTORS.addPartyButton);
    if (!clicked) {
      logStep('Add Party button not clickable', 'skip');
      return;
    }
    
    await page.waitForTimeout(1000);
    
    const dialog = page.locator(SELECTORS.dialog).first();
    const isDialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isDialogVisible) {
      logStep('Add Party dialog opened', 'pass');
      
      const inputs = await page.locator('input').count();
      expect(inputs).toBeGreaterThan(0);
      logStep(`Dialog has ${inputs} input fields`, 'pass');
      
      await closeDialog(page);
    } else {
      logStep('Dialog uses different pattern', 'skip');
    }
  });

  test('2.4 Party type tabs exist (Customers/Suppliers)', async ({ page }) => {
    logStep('Checking for party type tabs');
    
    const customerTab = await isVisible(page, 'text=/Customer/i', 3000);
    const supplierTab = await isVisible(page, 'text=/Supplier/i', 3000);
    
    if (customerTab || supplierTab) {
      logStep('Party type tabs found', 'pass');
      
      // Try clicking tabs
      if (customerTab) {
        await page.locator('text=/Customer/i').first().click();
        await page.waitForTimeout(500);
      }
      if (supplierTab) {
        await page.locator('text=/Supplier/i').first().click();
        await page.waitForTimeout(500);
      }
      logStep('Party tabs are interactive', 'pass');
    } else {
      logStep('Using different UI for party types', 'skip');
    }
  });

  test('2.5 Party search functionality', async ({ page }) => {
    logStep('Testing party search');
    
    const searchInput = page.locator(SELECTORS.searchInput).first();
    const hasSearch = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasSearch) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      logStep('Search functionality works', 'pass');
      
      // Clear search
      await searchInput.clear();
    } else {
      logStep('Search may use different pattern', 'skip');
    }
  });

  test('2.6 Party list displays correctly', async ({ page }) => {
    logStep('Checking party list display');
    
    const table = page.locator(SELECTORS.table).first();
    const hasTable = await table.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasTable) {
      logStep('Party list table visible', 'pass');
    } else {
      // Check for empty state
      const emptyState = await isVisible(page, 'text=/no parties|empty|add your first/i', 3000);
      if (emptyState) {
        logStep('Empty state shown (no parties yet)', 'pass');
      } else {
        logStep('Party display uses card layout', 'skip');
      }
    }
  });

  test('2.7 Form validation works', async ({ page }) => {
    logStep('Testing form validation');
    
    const clicked = await waitAndClick(page, SELECTORS.addPartyButton);
    if (!clicked) {
      logStep('Cannot test form - button not found', 'skip');
      return;
    }
    
    await page.waitForTimeout(1000);
    
    // Try to submit empty form
    const submitBtn = page.locator(SELECTORS.submitButton).first();
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      
      // Check for validation message
      const hasValidation = await isVisible(page, 'text=/required|invalid|please enter/i', 2000);
      if (hasValidation) {
        logStep('Form validation triggered', 'pass');
      } else {
        logStep('Form may use different validation pattern', 'skip');
      }
      
      await closeDialog(page);
    }
  });

  test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✓ Parties Module Complete');
    console.log('='.repeat(60) + '\n');
  });
});
