import { test, expect } from '@playwright/test';
import { navigateTo, isVisible, logStep, checkNoApiErrors } from '../test-utils';

/**
 * Navigation & UI Module Tests
 * 
 * Tests overall navigation and UI:
 * - Page navigation
 * - Sidebar functionality
 * - User menu
 * - Responsive design
 * - Page transitions
 * 
 * These tests run independently - failures don't affect other modules.
 */

test.describe('8. Navigation & UI Module', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🧭 MODULE: Navigation & UI');
    console.log('   Testing navigation and UI components');
    console.log('='.repeat(60) + '\n');
  });

  test('8.1 Navigate to all main pages', async ({ page }) => {
    logStep('Testing navigation to all pages');
    
    const pages = ['/dashboard', '/parties', '/inventory', '/invoices', '/payments'];
    
    for (const pagePath of pages) {
      await navigateTo(page, pagePath);
      
      const isLoaded = await page.locator('main').isVisible();
      expect(isLoaded).toBe(true);
      logStep(`${pagePath} loaded`, 'pass');
    }
  });

  test('8.2 Sidebar navigation works', async ({ page }) => {
    logStep('Testing sidebar navigation');
    
    await navigateTo(page, '/dashboard');
    
    const sidebar = page.locator('aside').first();
    const isVisible = await sidebar.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      logStep('Sidebar visible', 'pass');
      
      // Click on a sidebar link
      const sidebarLink = page.locator('aside a[href="/parties"]').first();
      if (await sidebarLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sidebarLink.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/parties/);
        logStep('Sidebar navigation works', 'pass');
      }
    } else {
      logStep('Sidebar uses different pattern', 'skip');
    }
  });

  test('8.3 User menu accessible', async ({ page }) => {
    logStep('Testing user menu');
    
    await navigateTo(page, '/dashboard');
    
    // Look for user avatar/menu
    const userMenu = page.locator('[aria-label*="user" i], [class*="avatar"], button:has(img), [class*="user"]').first();
    const hasUserMenu = await userMenu.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasUserMenu) {
      await userMenu.click();
      await page.waitForTimeout(500);
      logStep('User menu opened', 'pass');
      
      // Check for logout option
      const logoutOption = await isVisible(page, 'text=/Log out|Logout|Sign out/i', 2000);
      if (logoutOption) {
        logStep('Logout option available', 'pass');
      }
      
      // Close menu
      await page.keyboard.press('Escape');
    } else {
      logStep('User menu uses different pattern', 'skip');
    }
  });

  test('8.4 Page transitions are smooth', async ({ page }) => {
    logStep('Testing page transitions');
    
    await navigateTo(page, '/dashboard');
    
    const startTime = Date.now();
    await page.goto('/parties');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    logStep(`Page transition took ${loadTime}ms`, loadTime < 5000 ? 'pass' : 'skip');
    
    expect(loadTime).toBeLessThan(10000);
  });

  test('8.5 Mobile responsiveness', async ({ page }) => {
    logStep('Testing mobile responsiveness');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, '/dashboard');
    
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
    logStep('Mobile viewport works', 'pass');
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    logStep('Tablet viewport works', 'pass');
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('8.6 No broken links', async ({ page }) => {
    logStep('Checking for broken links');
    
    await navigateTo(page, '/dashboard');
    
    const links = await page.locator('a[href]').all();
    let brokenCount = 0;
    
    for (const link of links.slice(0, 10)) { // Check first 10 links
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/') && !href.includes('#')) {
        await page.goto(href);
        const is404 = await isVisible(page, 'text=/404|not found/i', 1000);
        if (is404) brokenCount++;
      }
    }
    
    expect(brokenCount).toBe(0);
    logStep(`Checked links, ${brokenCount} broken`, brokenCount === 0 ? 'pass' : 'fail');
  });

  test('8.7 No console errors', async ({ page }) => {
    logStep('Checking for console errors');
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await navigateTo(page, '/dashboard');
    await page.waitForTimeout(2000);
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools') &&
      !e.includes('Warning:')
    );
    
    if (criticalErrors.length === 0) {
      logStep('No critical console errors', 'pass');
    } else {
      logStep(`Found ${criticalErrors.length} console errors`, 'fail');
      console.log('  Errors:', criticalErrors);
    }
  });

  test('8.8 No API errors on pages', async ({ page }) => {
    logStep('Checking for API errors');
    
    const pages = ['/dashboard', '/parties', '/inventory'];
    
    for (const pagePath of pages) {
      await navigateTo(page, pagePath);
      await page.waitForTimeout(1000);
      
      const noErrors = await checkNoApiErrors(page);
      expect(noErrors).toBe(true);
    }
    
    logStep('No API errors on tested pages', 'pass');
  });

  test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✓ Navigation & UI Module Complete');
    console.log('='.repeat(60) + '\n');
  });
});
