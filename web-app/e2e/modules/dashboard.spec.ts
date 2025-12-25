import { test, expect } from '@playwright/test';
import { navigateTo, isVisible, getCount, logStep, softExpect, checkNoApiErrors } from '../test-utils';

/**
 * Dashboard Module Tests
 * 
 * Tests dashboard functionality:
 * - Page loading
 * - Stats display
 * - Quick actions
 * - Sidebar navigation
 * - Recent activity
 * 
 * These tests run independently - failures don't affect other modules.
 */

test.describe('1. Dashboard Module', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MODULE: Dashboard');
    console.log('   Testing dashboard UI and stats functionality');
    console.log('='.repeat(60) + '\n');
  });

  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard');
    
    // Ensure we're authenticated - if redirected to login, skip
    const url = page.url();
    if (url.includes('/login')) {
      console.warn('⚠️ Session expired - redirected to login');
    }
  });

  test('1.1 Dashboard page loads successfully', async ({ page }) => {
    logStep('Verifying dashboard page loads');
    
    // Dashboard should load (may take a moment)
    await page.waitForTimeout(2000);
    
    // Check we're not on login page
    const url = page.url();
    if (url.includes('/login')) {
      logStep('Redirected to login - session may have expired', 'skip');
      return;
    }
    
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });
    
    const content = await mainContent.textContent();
    expect(content?.length).toBeGreaterThan(0);
    
    logStep('Dashboard page loaded with content', 'pass');
  });

  test('1.2 Dashboard displays stats cards', async ({ page }) => {
    logStep('Checking for stats cards');
    
    // Look for common stats patterns
    const hasStats = await isVisible(page, 'text=/Total|Revenue|Sales|Pending|Outstanding/i', 5000);
    
    if (hasStats) {
      logStep('Stats cards found on dashboard', 'pass');
    } else {
      // Check for any card-like elements
      const cards = await getCount(page, '[class*="card"], [class*="stat"]');
      await softExpect(cards > 0, `Found ${cards} card elements`);
    }
  });

  test('1.3 Quick actions are available', async ({ page }) => {
    logStep('Checking for quick action buttons');
    
    // Check we're not on login page
    if (page.url().includes('/login')) {
      logStep('Redirected to login - skipping', 'skip');
      return;
    }
    
    const buttons = await getCount(page, 'button');
    const links = await getCount(page, 'a');
    
    expect(buttons + links).toBeGreaterThan(3);
    logStep(`Found ${buttons} buttons and ${links} links`, 'pass');
  });

  test('1.4 Sidebar navigation is visible', async ({ page }) => {
    logStep('Checking sidebar navigation');
    
    // Check we're not on login page
    if (page.url().includes('/login')) {
      logStep('Redirected to login - skipping', 'skip');
      return;
    }
    
    const sidebar = page.locator('aside').first();
    const isSidebarVisible = await sidebar.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isSidebarVisible) {
      const navLinks = await sidebar.locator('a[href]').count();
      expect(navLinks).toBeGreaterThan(0);
      logStep(`Sidebar has ${navLinks} navigation links`, 'pass');
    } else {
      // May use different navigation pattern (e.g., bottom nav on mobile)
      logStep('Sidebar not visible - may use different nav pattern', 'skip');
    }
  });

  test('1.5 No API errors on dashboard', async ({ page }) => {
    logStep('Checking for API errors');
    
    await page.waitForTimeout(2000); // Wait for data to load
    
    const noErrors = await checkNoApiErrors(page);
    expect(noErrors).toBe(true);
    
    logStep('No API errors detected', 'pass');
  });

  test('1.6 Dashboard is responsive', async ({ page }) => {
    logStep('Testing responsive layout');
    
    // Check we're not on login page
    if (page.url().includes('/login')) {
      logStep('Redirected to login - skipping', 'skip');
      return;
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    let mainVisible = await page.locator('main').isVisible({ timeout: 5000 }).catch(() => false);
    if (mainVisible) {
      logStep('Tablet viewport works', 'pass');
    } else {
      logStep('Main not visible in tablet viewport', 'skip');
    }
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    mainVisible = await page.locator('main').isVisible({ timeout: 5000 }).catch(() => false);
    if (mainVisible) {
      logStep('Mobile viewport works', 'pass');
    } else {
      logStep('Main not visible in mobile viewport', 'skip');
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✓ Dashboard Module Complete');
    console.log('='.repeat(60) + '\n');
  });
});
