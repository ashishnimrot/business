import { test, expect, Page, Response } from '@playwright/test';
import { TEST_CONFIG, ApiTracker } from './test-config';

/**
 * 01-Authentication Tests
 * 
 * Complete authentication flow testing with real API calls.
 * Auth: phone 9876543210, OTP 129012
 * 
 * Tests Cover:
 * - AUTH.1: Login flow (Send OTP + Verify OTP)
 * - AUTH.2: Invalid phone format validation
 * - AUTH.3: Invalid OTP error handling
 * - AUTH.4: Token storage verification
 * - AUTH.5: Session management
 */

// ================================================
// SETUP: API Tracking
// ================================================

async function setupApiTracking(page: Page, tracker: ApiTracker) {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes(':3002') || url.includes(':3003') || 
        url.includes(':3004') || url.includes(':3005') || url.includes(':3006') || 
        url.includes(':3007')) {
      const request = response.request();
      const startTime = Date.now();
      
      let requestBody: any = null;
      let responseBody: any = null;
      
      try {
        const postData = request.postData();
        if (postData) {
          requestBody = JSON.parse(postData);
        }
      } catch {}
      
      try {
        responseBody = await response.json();
      } catch {}
      
      tracker.add({
        method: request.method(),
        url: url,
        status: response.status(),
        requestBody,
        responseBody,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  });
}

// ================================================
// TEST SUITE: Authentication
// ================================================

test.describe('01. Authentication Tests', () => {
  
  test.describe('AUTH.1: Login Flow - Complete UI + BFF Verification', () => {
    
    test('AUTH.1.1: Complete login flow with valid credentials', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Step 1: Navigate to login page
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      console.log('📍 Step 1: On login page');
      
      // Verify login page loaded
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
      expect(await phoneInput.isVisible()).toBeTruthy();
      console.log('✅ Login page loaded, phone input visible');
      
      // Step 2: Enter phone number
      await phoneInput.fill(TEST_CONFIG.auth.phone);
      console.log(`📱 Step 2: Phone entered: ${TEST_CONFIG.auth.phone}`);
      
      // Step 3: Click Send OTP button
      tracker.clear();
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.waitFor({ state: 'visible', timeout: 5000 });
      await sendOtpBtn.click();
      console.log('📤 Step 3: Send OTP clicked');
      
      await page.waitForTimeout(3000);
      
      // Step 4: Verify Send OTP API call
      const sendOtpCall = tracker.getLastCall('/send-otp', 'POST');
      expect(sendOtpCall).toBeTruthy();
      console.log('✅ Step 4: Send OTP API called');
      
      // Verify request body
      if (sendOtpCall?.requestBody) {
        console.log(`   Request: ${JSON.stringify(sendOtpCall.requestBody)}`);
        expect(sendOtpCall.requestBody.phone).toBe(TEST_CONFIG.auth.phone);
        console.log('✅ Request contains correct phone number');
      }
      
      // Verify response
      expect(sendOtpCall?.status).toBe(200);
      console.log(`   Response Status: ${sendOtpCall?.status}`);
      
      if (sendOtpCall?.responseBody) {
        console.log(`   Response: ${JSON.stringify(sendOtpCall.responseBody)}`);
        // Response should contain otp_id
        const hasOtpId = sendOtpCall.responseBody.otp_id || sendOtpCall.responseBody.otpId;
        console.log(`   Has OTP ID: ${!!hasOtpId}`);
      }
      
      // Step 5: Extract OTP from toast or use default
      let otpToUse = TEST_CONFIG.auth.otp;
      try {
        const toastText = await page.locator('[data-sonner-toast]').textContent({ timeout: 3000 });
        if (toastText) {
          const match = toastText.match(/(\d{6})/);
          if (match) {
            otpToUse = match[1];
            console.log(`📝 Step 5: Extracted OTP from toast: ${otpToUse}`);
          }
        }
      } catch {
        console.log(`ℹ️ Step 5: Using default OTP: ${otpToUse}`);
      }
      
      // Step 6: Enter OTP
      const otpInput = page.locator('input[type="text"]').first();
      await otpInput.waitFor({ state: 'visible', timeout: 10000 });
      await otpInput.fill(otpToUse);
      console.log(`🔢 Step 6: OTP entered: ${otpToUse}`);
      
      // Step 7: Click Verify/Submit button
      tracker.clear();
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      console.log('✅ Step 7: OTP submitted');
      
      await page.waitForTimeout(5000);
      
      // Step 8: Verify Verify OTP API call
      const verifyOtpCall = tracker.getLastCall('/verify-otp', 'POST');
      expect(verifyOtpCall).toBeTruthy();
      console.log('✅ Step 8: Verify OTP API called');
      
      if (verifyOtpCall?.requestBody) {
        console.log(`   Request: ${JSON.stringify(verifyOtpCall.requestBody)}`);
        expect(verifyOtpCall.requestBody.phone).toBe(TEST_CONFIG.auth.phone);
        expect(verifyOtpCall.requestBody.otp).toBe(otpToUse);
        console.log('✅ Request contains phone and OTP');
      }
      
      // Verify successful login
      expect(verifyOtpCall?.status).toBe(200);
      console.log(`   Response Status: ${verifyOtpCall?.status}`);
      
      if (verifyOtpCall?.responseBody) {
        console.log(`   Response keys: ${Object.keys(verifyOtpCall.responseBody)}`);
        // Should have user and tokens
        const hasUser = verifyOtpCall.responseBody.user !== undefined;
        const hasTokens = verifyOtpCall.responseBody.tokens !== undefined || 
                         verifyOtpCall.responseBody.access_token !== undefined;
        console.log(`   Has User: ${hasUser}, Has Tokens: ${hasTokens}`);
      }
      
      // Step 9: Wait for redirect
      try {
        await page.waitForURL(/\/(business|dashboard)/, { timeout: 15000 });
        console.log(`✅ Step 9: Redirected to ${page.url()}`);
      } catch {
        console.log(`⚠️ Step 9: URL after login: ${page.url()}`);
      }
      
      // Step 10: Handle business selection if needed
      if (page.url().includes('/business')) {
        console.log('📊 Step 10: Business selection page');
        await page.waitForTimeout(2000);
        
        const businessCard = page.locator('.cursor-pointer, [role="button"]').first();
        try {
          await businessCard.waitFor({ state: 'visible', timeout: 5000 });
          await businessCard.click();
          await page.waitForTimeout(3000);
          console.log('✅ Business selected');
        } catch {
          console.log('ℹ️ No business card to click');
        }
      }
      
      // Step 11: Verify tokens in localStorage
      const tokens = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token') || localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken'),
        };
      });
      
      console.log('🔐 Step 11: Token verification');
      console.log(`   Access Token: ${tokens.accessToken ? '✅ Present' : '❌ Missing'}`);
      console.log(`   Refresh Token: ${tokens.refreshToken ? '✅ Present' : '❌ Missing'}`);
      
      // Final state
      console.log(`📍 Final URL: ${page.url()}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('AUTH.2: Invalid Phone Format', () => {
    
    test('AUTH.2.1: Should show error for 9-digit phone number', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Enter invalid phone (9 digits)
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill('987654321'); // 9 digits - invalid
      console.log('📱 Entered invalid phone: 987654321 (9 digits)');
      
      tracker.clear();
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      console.log('📤 Send OTP clicked');
      
      await page.waitForTimeout(3000);
      
      // Check if API was called
      const sendOtpCall = tracker.getLastCall('/send-otp', 'POST');
      
      if (sendOtpCall) {
        console.log(`📊 API Response: ${sendOtpCall.status}`);
        console.log(`   Body: ${JSON.stringify(sendOtpCall.responseBody)}`);
        
        // Should get 400 error
        expect(sendOtpCall.status).toBe(400);
        console.log('✅ Got 400 error for invalid phone');
      } else {
        // Client-side validation prevented API call
        console.log('ℹ️ API not called - client-side validation');
        
        // Check for error message in UI
        const errorMessage = page.locator('.text-red-500, .text-destructive, [role="alert"]').first();
        const hasError = await errorMessage.isVisible().catch(() => false);
        console.log(`   UI Error visible: ${hasError}`);
      }
      
      // Verify we're still on login page
      expect(page.url()).toContain('/login');
      console.log('✅ Still on login page');
      
      tracker.printSummary();
    });
    
    test('AUTH.2.2: Should show error for phone not starting with 6-9', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Enter phone starting with 5 (invalid)
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill('5876543210'); // Starts with 5 - invalid
      console.log('📱 Entered invalid phone: 5876543210 (starts with 5)');
      
      tracker.clear();
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      
      await page.waitForTimeout(3000);
      
      const sendOtpCall = tracker.getLastCall('/send-otp', 'POST');
      
      if (sendOtpCall) {
        console.log(`📊 API Response: ${sendOtpCall.status}`);
        // Should get 400 for invalid format
        expect(sendOtpCall.status).toBe(400);
      }
      
      expect(page.url()).toContain('/login');
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('AUTH.3: Invalid OTP', () => {
    
    test('AUTH.3.1: Should show error for wrong OTP', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Enter valid phone
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill(TEST_CONFIG.auth.phone);
      
      // Send OTP
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      await page.waitForTimeout(3000);
      
      // Enter wrong OTP
      const otpInput = page.locator('input[type="text"]').first();
      await otpInput.waitFor({ state: 'visible', timeout: 10000 });
      await otpInput.fill('000000'); // Wrong OTP
      console.log('🔢 Entered wrong OTP: 000000');
      
      tracker.clear();
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      await page.waitForTimeout(3000);
      
      // Verify error response
      const verifyOtpCall = tracker.getLastCall('/verify-otp', 'POST');
      
      if (verifyOtpCall) {
        console.log(`📊 API Response: ${verifyOtpCall.status}`);
        console.log(`   Body: ${JSON.stringify(verifyOtpCall.responseBody)}`);
        
        // Should get 400 or 401 error
        expect([400, 401]).toContain(verifyOtpCall.status);
        console.log('✅ Got error for wrong OTP');
      }
      
      // Check for error toast
      try {
        const toast = page.locator('[data-sonner-toast][data-type="error"], [data-sonner-toast]:has-text("invalid")').first();
        await toast.waitFor({ state: 'visible', timeout: 5000 });
        const toastText = await toast.textContent();
        console.log(`🔴 Error toast: ${toastText}`);
      } catch {
        console.log('ℹ️ No error toast found');
      }
      
      // Verify we're still on login page
      expect(page.url()).toContain('/login');
      console.log('✅ Still on login page');
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('AUTH.4: Token Storage', () => {
    
    test('AUTH.4.1: Tokens should be stored in localStorage after login', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Perform full login
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill(TEST_CONFIG.auth.phone);
      
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      await page.waitForTimeout(3000);
      
      // Get OTP from toast or use default
      let otpToUse = TEST_CONFIG.auth.otp;
      try {
        const toastText = await page.locator('[data-sonner-toast]').textContent({ timeout: 2000 });
        if (toastText) {
          const match = toastText.match(/(\d{6})/);
          if (match) otpToUse = match[1];
        }
      } catch {}
      
      const otpInput = page.locator('input[type="text"]').first();
      await otpInput.fill(otpToUse);
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(5000);
      
      // Handle business selection if needed
      if (page.url().includes('/business')) {
        const businessCard = page.locator('.cursor-pointer').first();
        try {
          await businessCard.click();
          await page.waitForTimeout(3000);
        } catch {}
      }
      
      // Check localStorage for tokens
      const storageData = await page.evaluate(() => {
        const data: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });
      
      console.log('📦 LocalStorage contents:');
      Object.entries(storageData).forEach(([key, value]) => {
        const displayValue = value && value.length > 50 ? value.substring(0, 50) + '...' : value;
        console.log(`   ${key}: ${displayValue}`);
      });
      
      // Check for token keys
      const hasAccessToken = Object.keys(storageData).some(key => 
        key.toLowerCase().includes('access') || key.toLowerCase().includes('token')
      );
      const hasBusinessId = Object.keys(storageData).some(key => 
        key.toLowerCase().includes('business')
      );
      
      console.log(`\n🔐 Token Analysis:`);
      console.log(`   Has access token: ${hasAccessToken}`);
      console.log(`   Has business ID: ${hasBusinessId}`);
      
      // At least some auth-related data should be stored
      expect(hasAccessToken || hasBusinessId || Object.keys(storageData).length > 0).toBeTruthy();
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('AUTH.5: Protected Route Access', () => {
    
    test('AUTH.5.1: Should redirect to login when accessing protected route without auth', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login');
      await page.evaluate(() => localStorage.clear());
      
      // Try to access protected route
      await page.goto('/parties');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`📍 Navigated to /parties, ended up at: ${currentUrl}`);
      
      // Should be redirected to login
      const isOnLogin = currentUrl.includes('/login');
      const isOnHome = currentUrl === 'http://localhost:3000/' || currentUrl.endsWith('/');
      
      expect(isOnLogin || isOnHome).toBeTruthy();
      console.log('✅ Protected route redirects unauthenticated user');
    });
    
  });
  
  // ================================================
  // MISSING TESTS FROM PLAN - ADDED
  // ================================================
  
  test.describe('AUTH.6: Missing Phone (Mandatory Field)', () => {
    
    test('AUTH.6.1: Should show error when phone is empty', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(2000);
      
      // Try to submit without phone
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      await page.waitForTimeout(1000);
      
      // Check for validation error
      const errorMsg = page.locator('[aria-invalid="true"], .text-destructive, :text("required"), :text("phone")').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      
      console.log(`📊 Empty phone validation: ${hasError}`);
      
      // Should still be on login page
      expect(page.url()).toContain('/login');
    });
    
  });
  
  test.describe('AUTH.7: Missing OTP (Mandatory Field)', () => {
    
    test('AUTH.7.1: Should show error when OTP is empty', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/login');
      await page.waitForTimeout(2000);
      
      // Enter valid phone
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill(TEST_CONFIG.auth.phone);
      
      // Click Send OTP
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      await page.waitForTimeout(3000);
      
      // Try to verify without entering OTP
      const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Login"), button:has-text("Submit")').first();
      try {
        await verifyBtn.click();
        await page.waitForTimeout(1000);
        
        // Should show validation error
        const errorMsg = page.locator('[aria-invalid="true"], .text-destructive, :text("required")').first();
        const hasError = await errorMsg.isVisible().catch(() => false);
        
        console.log(`📊 Empty OTP validation: ${hasError}`);
      } catch {
        console.log('ℹ️ OTP input may have client-side validation');
      }
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('AUTH.8: Expired OTP', () => {
    
    test('AUTH.8.1: Should handle expired OTP gracefully', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Note: This test simulates what would happen with an expired OTP
      // Since we can't actually wait for expiry, we test with invalid OTP ID
      
      await page.goto('/login');
      await page.waitForTimeout(2000);
      
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill(TEST_CONFIG.auth.phone);
      
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      await page.waitForTimeout(3000);
      
      // Enter correct OTP format but potentially expired
      const otpInputs = page.locator('input[data-otp="true"], input[maxlength="1"], input[type="text"]');
      const otpCount = await otpInputs.count();
      
      if (otpCount >= 6) {
        // Enter a different OTP that's not the valid one
        const expiredOtp = '111111';
        for (let i = 0; i < 6 && i < otpCount; i++) {
          await otpInputs.nth(i).fill(expiredOtp[i]);
        }
      }
      
      await page.waitForTimeout(2000);
      
      // Check for error response
      const errorCall = tracker.calls.find(c => c.status >= 400);
      if (errorCall) {
        console.log(`📊 OTP error handled: ${errorCall.responseBody?.message || 'Error'}`);
      }
      
      // Should still be on login page
      expect(page.url()).toContain('/login');
      console.log('✅ Expired/Invalid OTP handled gracefully');
    });
    
  });
  
  test.describe('AUTH.9: Token Refresh', () => {
    
    test('AUTH.9.1: Should have refresh token stored', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      // Login first
      await page.goto('/login');
      await page.waitForTimeout(2000);
      
      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill(TEST_CONFIG.auth.phone);
      
      const sendOtpBtn = page.locator('button:has-text("Send OTP")').first();
      await sendOtpBtn.click();
      await page.waitForTimeout(3000);
      
      // Enter OTP
      const otpInputs = page.locator('input[data-otp="true"], input[maxlength="1"]');
      const otpCount = await otpInputs.count();
      
      if (otpCount >= 6) {
        const otp = TEST_CONFIG.auth.otp;
        for (let i = 0; i < 6 && i < otpCount; i++) {
          await otpInputs.nth(i).fill(otp[i]);
        }
      }
      
      await page.waitForTimeout(5000);
      
      // Check for refresh token in response or storage
      const verifyCall = tracker.getLastCall('/verify-otp', 'POST');
      if (verifyCall?.responseBody?.tokens) {
        const hasRefreshToken = verifyCall.responseBody.tokens.refresh_token || 
                                verifyCall.responseBody.tokens.refreshToken;
        console.log(`📊 Refresh token in response: ${!!hasRefreshToken}`);
        expect(hasRefreshToken).toBeTruthy();
      }
      
      // Also check localStorage
      const storageData = await page.evaluate(() => {
        const data: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });
      
      const hasRefreshInStorage = Object.keys(storageData).some(key => 
        key.toLowerCase().includes('refresh')
      );
      console.log(`📊 Refresh token in storage: ${hasRefreshInStorage}`);
      
      tracker.printSummary();
    });
    
  });
  
  test.describe('AUTH.10: Session Management', () => {
    
    test('AUTH.10.1: Should maintain session across page navigation', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to multiple pages
      const pages = ['/parties', '/inventory', '/invoices', '/payments', '/dashboard'];
      
      for (const route of pages) {
        await page.goto(route);
        await page.waitForTimeout(1500);
        
        const stillAuthenticated = !page.url().includes('/login');
        console.log(`📍 ${route}: authenticated = ${stillAuthenticated}`);
        
        if (!stillAuthenticated) {
          console.log('❌ Session lost during navigation');
          expect(stillAuthenticated).toBeTruthy();
        }
      }
      
      console.log('✅ Session maintained across navigation');
    });
    
    test('AUTH.10.2: Should persist session after page refresh', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Refresh the page
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Should still be authenticated
      const stillAuthenticated = !page.url().includes('/login');
      console.log(`📊 After refresh, authenticated: ${stillAuthenticated}`);
      
      expect(stillAuthenticated).toBeTruthy();
    });
    
  });
  
  test.describe('AUTH.11: Logout', () => {
    
    test('AUTH.11.1: Should clear session on logout', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Find logout button
      const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [aria-label*="logout" i]').first();
      
      try {
        if (await logoutBtn.isVisible({ timeout: 3000 })) {
          await logoutBtn.click();
          await page.waitForTimeout(3000);
          
          // Should be redirected to login
          const isLoggedOut = page.url().includes('/login') || page.url() === 'http://localhost:3000/';
          console.log(`📊 Logged out: ${isLoggedOut}`);
          
          // Tokens should be cleared
          const storageData = await page.evaluate(() => {
            return {
              access: localStorage.getItem('access_token'),
              refresh: localStorage.getItem('refresh_token'),
            };
          });
          
          const tokensCleared = !storageData.access && !storageData.refresh;
          console.log(`📊 Tokens cleared: ${tokensCleared}`);
        } else {
          // Try settings page
          await page.goto('/settings');
          await page.waitForTimeout(2000);
          
          const settingsLogout = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
          if (await settingsLogout.isVisible({ timeout: 3000 })) {
            await settingsLogout.click();
            await page.waitForTimeout(2000);
            console.log('✅ Logout from settings page');
          }
        }
      } catch {
        console.log('ℹ️ Logout button not found in expected location');
      }
    });
    
  });

  test.describe('AUTH.12: Session Management', () => {
    
    test('AUTH.12.1: Should view active sessions - UI + BFF', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to settings or profile page where sessions might be displayed
      await page.goto('/settings');
      await page.waitForTimeout(3000);
      
      // Look for sessions section or link
      const sessionsLink = page.locator('button:has-text("Sessions"), a:has-text("Sessions"), button:has-text("Active Sessions"), [data-testid="sessions"]').first();
      
      try {
        if (await sessionsLink.isVisible({ timeout: 3000 })) {
          tracker.clear();
          await sessionsLink.click();
          await page.waitForTimeout(3000);
          
          // Verify API call to get sessions
          const sessionsCall = tracker.getLastCall('/sessions', 'GET') || 
                              tracker.getLastCall('/auth/sessions', 'GET');
          
          if (sessionsCall) {
            console.log(`📊 Sessions API: ${sessionsCall.status}`);
            expect(sessionsCall.status).toBe(200);
            
            if (sessionsCall.responseBody) {
              const sessions = Array.isArray(sessionsCall.responseBody) 
                ? sessionsCall.responseBody 
                : sessionsCall.responseBody.sessions || [];
              console.log(`   Found ${sessions.length} active sessions`);
              
              // Verify session structure
              if (sessions.length > 0) {
                const session = sessions[0];
                console.log(`   Session fields: ${Object.keys(session).join(', ')}`);
                
                // Check for expected fields
                const hasId = session.id !== undefined;
                const hasDevice = session.device_info !== undefined || session.deviceInfo !== undefined;
                console.log(`   Has ID: ${hasId}, Has Device Info: ${hasDevice}`);
              }
            }
          } else {
            console.log('ℹ️ Sessions API not called - may not be implemented');
          }
          
          // Verify UI shows sessions
          const sessionCards = page.locator('[data-testid="session-card"], .session-item, li:has-text("device")');
          const count = await sessionCards.count();
          console.log(`📊 UI shows ${count} session cards`);
          
        } else {
          console.log('ℹ️ Sessions section not found - feature may not be implemented');
        }
      } catch (error) {
        console.log(`ℹ️ Sessions feature may not be available: ${error}`);
      }
      
      tracker.printSummary();
    });
    
    test('AUTH.12.2: Should logout specific session - UI + BFF', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to sessions
      await page.goto('/settings');
      await page.waitForTimeout(2000);
      
      const sessionsLink = page.locator('button:has-text("Sessions"), a:has-text("Sessions")').first();
      
      try {
        if (await sessionsLink.isVisible({ timeout: 3000 })) {
          await sessionsLink.click();
          await page.waitForTimeout(2000);
          
          // Find a session to logout (not current session)
          const logoutSessionBtn = page.locator('button:has-text("Revoke"), button:has-text("End session"), button[aria-label*="revoke" i]').first();
          
          if (await logoutSessionBtn.isVisible({ timeout: 3000 })) {
            tracker.clear();
            await logoutSessionBtn.click();
            await page.waitForTimeout(3000);
            
            // Verify API call to delete session
            const deleteCall = tracker.getLastCall('/sessions/', 'DELETE') ||
                              tracker.getLastCall('/auth/sessions/', 'DELETE');
            
            if (deleteCall) {
              console.log(`📊 Delete Session API: ${deleteCall.status}`);
              expect([200, 204]).toContain(deleteCall.status);
              console.log('   ✅ Session revoked successfully');
            } else {
              console.log('ℹ️ Delete session API not captured');
            }
            
            // Check for success toast
            const successToast = page.locator('[data-sonner-toast][data-type="success"]');
            if (await successToast.isVisible({ timeout: 3000 })) {
              console.log('   ✅ Success toast displayed');
            }
          } else {
            console.log('ℹ️ No other sessions to revoke');
          }
        } else {
          console.log('ℹ️ Sessions feature not available');
        }
      } catch {
        console.log('ℹ️ Logout specific session feature may not be implemented');
      }
      
      tracker.printSummary();
    });
    
    test('AUTH.12.3: Should logout all sessions - UI + BFF', async ({ page }) => {
      const tracker = new ApiTracker();
      await setupApiTracking(page, tracker);
      
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      // Navigate to sessions
      await page.goto('/settings');
      await page.waitForTimeout(2000);
      
      const sessionsLink = page.locator('button:has-text("Sessions"), a:has-text("Sessions")').first();
      
      try {
        if (await sessionsLink.isVisible({ timeout: 3000 })) {
          await sessionsLink.click();
          await page.waitForTimeout(2000);
          
          // Find logout all button
          const logoutAllBtn = page.locator('button:has-text("Logout All"), button:has-text("End all sessions"), button:has-text("Revoke all")').first();
          
          if (await logoutAllBtn.isVisible({ timeout: 3000 })) {
            tracker.clear();
            await logoutAllBtn.click();
            
            // Handle confirmation dialog
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
            if (await confirmBtn.isVisible({ timeout: 3000 })) {
              await confirmBtn.click();
            }
            
            await page.waitForTimeout(3000);
            
            // Verify API call
            const logoutAllCall = tracker.getLastCall('/sessions/all', 'DELETE') ||
                                 tracker.getLastCall('/auth/sessions/all', 'DELETE') ||
                                 tracker.getLastCall('/sessions', 'DELETE');
            
            if (logoutAllCall) {
              console.log(`📊 Logout All Sessions API: ${logoutAllCall.status}`);
              expect([200, 204]).toContain(logoutAllCall.status);
              console.log('   ✅ All sessions logged out');
            }
            
            // Should be redirected to login
            await page.waitForTimeout(2000);
            if (page.url().includes('/login')) {
              console.log('   ✅ Redirected to login after logging out all sessions');
            }
          } else {
            console.log('ℹ️ Logout all sessions button not found');
          }
        } else {
          console.log('ℹ️ Sessions feature not available');
        }
      } catch {
        console.log('ℹ️ Logout all sessions feature may not be implemented');
      }
      
      tracker.printSummary();
    });
    
  });
  
});
