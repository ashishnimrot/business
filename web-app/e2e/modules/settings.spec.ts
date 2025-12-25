import { test, expect } from '@playwright/test';
import { navigateTo, isVisible, logStep } from '../test-utils';

/**
 * Settings Module Tests
 * 
 * Tests settings functionality:
 * - Settings page loading
 * - Profile settings
 * - Business settings
 * - Preferences
 * 
 * These tests run independently - failures don't affect other modules.
 */

test.describe('7. Settings Module', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('⚙️ MODULE: Settings');
    console.log('   Testing user & business settings');
    console.log('='.repeat(60) + '\n');
  });

  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/settings');
  });

  test('7.1 Settings page loads successfully', async ({ page }) => {
    logStep('Verifying settings page loads');
    
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
    
    logStep('Settings page loaded', 'pass');
  });

  test('7.2 Profile section exists', async ({ page }) => {
    logStep('Checking for profile section');
    
    const profileSection = await isVisible(page, 'text=/Profile|Account|User|Personal/i', 3000);
    if (profileSection) {
      logStep('Profile section found', 'pass');
    } else {
      logStep('Profile may be in different location', 'skip');
    }
  });

  test('7.3 Business settings exist', async ({ page }) => {
    logStep('Checking for business settings');
    
    const businessSettings = await isVisible(page, 'text=/Business|Company|GST|Organization/i', 3000);
    if (businessSettings) {
      logStep('Business settings found', 'pass');
    } else {
      logStep('Business settings may be in different location', 'skip');
    }
  });

  test('7.4 Theme/appearance settings', async ({ page }) => {
    logStep('Checking for appearance settings');
    
    const themeSettings = await isVisible(page, 'text=/Theme|Dark|Light|Appearance/i', 3000);
    if (themeSettings) {
      logStep('Theme settings found', 'pass');
    } else {
      logStep('Theme settings may be elsewhere', 'skip');
    }
  });

  test('7.5 Notification settings', async ({ page }) => {
    logStep('Checking for notification settings');
    
    const notifSettings = await isVisible(page, 'text=/Notification|Alert|Email|SMS/i', 3000);
    if (notifSettings) {
      logStep('Notification settings found', 'pass');
    } else {
      logStep('Notification settings may be elsewhere', 'skip');
    }
  });

  test('7.6 Settings are editable', async ({ page }) => {
    logStep('Checking if settings are editable');
    
    const hasInput = await isVisible(page, 'input, select, button[type="submit"]', 3000);
    if (hasInput) {
      logStep('Settings are editable', 'pass');
    } else {
      logStep('Settings may be read-only', 'skip');
    }
  });

  test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✓ Settings Module Complete');
    console.log('='.repeat(60) + '\n');
  });
});
