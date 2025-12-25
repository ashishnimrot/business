import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration for Business App E2E Tests
 * 
 * MODULAR TESTING ARCHITECTURE:
 * - Tests are organized into independent modules
 * - Each module runs independently (failures don't stop other modules)
 * - Authentication is handled once via setup project
 * - Session is reused across all modules
 * 
 * Run all tests: npm run test:headed
 * Run specific module: npx playwright test modules/dashboard.spec.ts
 * 
 * Test OTP: 129012 (fixed for dev/test mode)
 */

const authFile = path.join(__dirname, '.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially for better observation
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once on failure in local
  workers: 1, // Single worker for sequential execution
  
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  // Extended timeout for slow mode testing
  timeout: 240000, // 4 minutes per test

  projects: [
    // ==========================================
    // SETUP PROJECT - Runs first to authenticate
    // ==========================================
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    
    // ==========================================
    // MODULAR TESTS - Each module is independent
    // ==========================================
    {
      name: 'dashboard',
      testMatch: /modules\/dashboard\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'parties',
      testMatch: /modules\/parties\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'inventory',
      testMatch: /modules\/inventory\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'invoices',
      testMatch: /modules\/invoices\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'payments',
      testMatch: /modules\/payments\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'reports',
      testMatch: /modules\/reports\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'settings',
      testMatch: /modules\/settings\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'navigation',
      testMatch: /modules\/navigation\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    {
      name: 'edge-cases',
      testMatch: /modules\/edge-cases\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    
    // ==========================================
    // CRUD E2E TESTS - Real-time CRUD with API tracking
    // ==========================================
    {
      name: 'crud',
      testMatch: /crud-e2e\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 1500, // Slower for visibility
        },
      },
    },
    
    // ==========================================
    // 360-DEGREE CRUD TESTS - Complete coverage
    // ==========================================
    {
      name: 'crud-360',
      testMatch: /crud-360\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 1500,
        },
      },
    },
    
    // ==========================================
    // LEGACY - Old comprehensive test (kept for reference)
    // ==========================================
    {
      name: 'comprehensive',
      testMatch: /comprehensive\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 2000,
        },
      },
    },
    
    // ==========================================
    // UI + BFF TESTS - Request/Response alignment
    // ==========================================
    {
      name: 'ui-bff',
      testMatch: /ui-bff-tests\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 1500,
        },
      },
    },
    
    // ==========================================
    // UI + BFF ALIGNMENT - Critical fixes verification
    // ==========================================
    {
      name: 'alignment',
      testMatch: /ui-bff-tests\/22-request-response-alignment\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        launchOptions: {
          slowMo: 1500,
        },
      },
    },
    
    // ==========================================
    // AUTHENTICATION TESTS - Login flow verification
    // ==========================================
    {
      name: 'auth-tests',
      testMatch: /ui-bff-tests\/01-authentication\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 1500,
        },
      },
    },
  ],

  // Don't run web server - assume it's already running
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  // },
});
