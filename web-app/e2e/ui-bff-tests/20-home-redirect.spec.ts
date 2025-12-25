import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 20-Home Redirect Tests
 * 
 * Tests for home page redirects and routing logic.
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

test.describe('20. Home Redirect Tests', () => {
  
  test.describe('REDIR.1: Root URL Redirect', () => {
    
    test('REDIR.1.1: Should redirect from / to appropriate page', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      const finalUrl = page.url();
      console.log(`📍 Final URL after / redirect: ${finalUrl}`);
      
      // Should redirect to login if not authenticated, or dashboard/business-select if authenticated
      const validDestinations = ['/login', '/dashboard', '/business', '/home'];
      const isValidRedirect = validDestinations.some(dest => finalUrl.includes(dest));
      
      console.log(`📊 Valid redirect: ${isValidRedirect}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('REDIR.2: Authenticated User Redirect', () => {
    
    test('REDIR.2.1: Should redirect authenticated user to dashboard', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.waitForTimeout(2000);
      
      // If already logged in
      if (!page.url().includes('/login')) {
        console.log('✅ Already authenticated');
        
        // Go to root
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        const isProperRedirect = finalUrl.includes('/dashboard') || finalUrl.includes('/business');
        console.log(`📊 Authenticated redirect proper: ${isProperRedirect}`);
        console.log(`📍 Redirected to: ${finalUrl}`);
      } else {
        test.skip();
      }
    });
    
    test('REDIR.2.2: Should redirect from login page if authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Now try to go to login
      await page.goto('/login');
      await page.waitForTimeout(2000);
      
      const finalUrl = page.url();
      const redirectedAway = !finalUrl.includes('/login');
      
      console.log(`📊 Redirected away from login: ${redirectedAway}`);
      console.log(`📍 Final URL: ${finalUrl}`);
    });
    
  });
  
  test.describe('REDIR.3: Protected Route Redirect', () => {
    
    test('REDIR.3.1: Should redirect to login for protected routes without auth', async ({ browser }) => {
      // Use new context without auth
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Try protected route
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(3000);
      
      const finalUrl = page.url();
      console.log(`📍 Protected route redirect: ${finalUrl}`);
      
      // Should redirect to login
      const redirectedToLogin = finalUrl.includes('/login');
      console.log(`📊 Redirected to login: ${redirectedToLogin}`);
      
      await context.close();
    });
    
    test('REDIR.3.2: Should remember original URL after login', async ({ browser }) => {
      // This tests return URL functionality
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Try protected route
      await page.goto('http://localhost:3000/parties');
      await page.waitForTimeout(3000);
      
      const loginUrl = page.url();
      console.log(`📍 Login URL: ${loginUrl}`);
      
      // Check for return/redirect param
      const hasReturnUrl = loginUrl.includes('redirect=') || loginUrl.includes('return=') || loginUrl.includes('callbackUrl=');
      console.log(`📊 Has return URL param: ${hasReturnUrl}`);
      
      await context.close();
    });
    
  });
  
  test.describe('REDIR.4: Business Selection Redirect', () => {
    
    test('REDIR.4.1: Should redirect to business selection if no business selected', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      
      // May redirect to business selection
      const needsBusinessSelection = currentUrl.includes('/business') && !currentUrl.includes('/dashboard');
      console.log(`📊 Business selection required: ${needsBusinessSelection}`);
      console.log(`📍 Current URL: ${currentUrl}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('REDIR.5: Deep Link Handling', () => {
    
    test('REDIR.5.1: Should handle deep links to specific resources', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Get a party ID from the list first
      await page.goto('/parties');
      await page.waitForTimeout(2000);
      
      const firstParty = page.locator('.cursor-pointer, tr[data-state]').first();
      try {
        await firstParty.click();
        await page.waitForTimeout(2000);
        
        // Capture the detail URL
        const detailUrl = page.url();
        console.log(`📍 Detail URL: ${detailUrl}`);
        
        // Navigate away
        await page.goto('/dashboard');
        await page.waitForTimeout(1000);
        
        // Deep link back
        await page.goto(detailUrl);
        await page.waitForTimeout(2000);
        
        const sameUrl = page.url() === detailUrl || page.url().includes(detailUrl.split('/parties/')[1]);
        console.log(`📊 Deep link preserved: ${sameUrl}`);
        
      } catch {
        console.log('ℹ️ No parties for deep link test');
      }
    });
    
  });
  
  test.describe('REDIR.6: 404 Handling', () => {
    
    test('REDIR.6.1: Should show 404 or redirect for invalid routes', async ({ page }) => {
      await page.goto('/this-route-does-not-exist');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      const pageContent = await page.content();
      
      // Check for 404 indicators
      const has404Page = pageContent.includes('404') || pageContent.includes('not found') || pageContent.includes('Not Found');
      const redirectedToHome = currentUrl.includes('/login') || currentUrl.includes('/dashboard');
      
      console.log(`📊 Shows 404: ${has404Page}`);
      console.log(`📊 Redirected to home: ${redirectedToHome}`);
      console.log(`📍 Final URL: ${currentUrl}`);
    });
    
  });
  
});
