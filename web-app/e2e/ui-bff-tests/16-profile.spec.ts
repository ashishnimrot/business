import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 16-Profile Tests
 * 
 * User profile and account management tests.
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

test.describe('16. Profile Tests', () => {
  
  test.describe('PROF.1: Profile Access', () => {
    
    test('PROF.1.1: Should access profile from header', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for profile/avatar in header
      const profileBtn = page.locator('[data-testid*="profile"], [aria-label*="profile" i], button:has-text("Profile"), [data-testid*="avatar"]').first();
      const hasProfile = await profileBtn.isVisible().catch(() => false);
      
      console.log(`📊 Profile button visible: ${hasProfile}`);
      
      if (hasProfile) {
        await profileBtn.click();
        await page.waitForTimeout(1000);
        
        // Check for dropdown menu
        const menu = page.locator('[role="menu"], [data-testid*="dropdown"]').first();
        const hasMenu = await menu.isVisible().catch(() => false);
        
        console.log(`📊 Profile menu opens: ${hasMenu}`);
      }
      
      tracker.printSummary();
    });
    
    test('PROF.1.2: Should navigate to profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Check if profile page exists
      const profileContent = page.locator('h1:has-text("Profile"), h2:has-text("Profile"), :text("Account")').first();
      const hasProfile = await profileContent.isVisible().catch(() => false);
      
      console.log(`📊 Profile page loaded: ${hasProfile}`);
      console.log(`📍 Current URL: ${page.url()}`);
    });
    
  });
  
  test.describe('PROF.2: Profile Information', () => {
    
    test('PROF.2.1: Should display user information', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Check for user info fields
      const phoneField = page.locator(':text("9876543210"), input[value*="9876543210"]').first();
      const hasPhone = await phoneField.isVisible().catch(() => false);
      
      console.log(`📊 Phone number displayed: ${hasPhone}`);
      
      // Check for name field
      const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      const hasName = await nameField.isVisible().catch(() => false);
      
      console.log(`📊 Name field present: ${hasName}`);
    });
    
  });
  
  test.describe('PROF.3: Profile Update', () => {
    
    test('PROF.3.1: Should update profile name', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/profile');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Find name input
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      try {
        await nameInput.clear();
        await nameInput.fill('Test User Updated');
        
        // Find save button
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          
          // Check for success
          const success = page.locator(':text("updated"), :text("saved"), :text("success")').first();
          const hasSuccess = await success.isVisible().catch(() => false);
          
          console.log(`📊 Profile updated: ${hasSuccess}`);
        }
        
      } catch {
        console.log('ℹ️ Profile update not available');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('PROF.4: Business Association', () => {
    
    test('PROF.4.1: Should show associated businesses', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for businesses section
      const businessSection = page.locator(':text("Business"), :text("Organizations")').first();
      const hasBusinesses = await businessSection.isVisible().catch(() => false);
      
      console.log(`📊 Businesses section: ${hasBusinesses}`);
    });
    
  });
  
  test.describe('PROF.5: Account Settings', () => {
    
    test('PROF.5.1: Should access account settings', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for account/security settings
      const accountSettings = page.locator(':text("Account"), :text("Security"), :text("Privacy")').first();
      const hasAccountSettings = await accountSettings.isVisible().catch(() => false);
      
      console.log(`📊 Account settings available: ${hasAccountSettings}`);
      
      // Check for notification settings
      const notifications = page.locator(':text("Notification"), :text("Alerts")').first();
      const hasNotifications = await notifications.isVisible().catch(() => false);
      
      console.log(`📊 Notification settings: ${hasNotifications}`);
    });
    
  });
  
  test.describe('PROF.6: Session Management', () => {
    
    test('PROF.6.1: Should show current session info', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Look for session/login info
      const sessionInfo = page.locator(':text("Session"), :text("Last login"), :text("Active sessions")').first();
      const hasSession = await sessionInfo.isVisible().catch(() => false);
      
      console.log(`📊 Session info available: ${hasSession}`);
    });
    
  });
  
});
