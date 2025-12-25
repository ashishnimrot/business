/**
 * Test Configuration for UI + BFF Tests
 * 
 * Centralized configuration for all test files.
 * Uses real authentication with phone: 9876543210, OTP: 129012
 */

export const TEST_CONFIG = {
  // Authentication - Real credentials
  auth: {
    phone: '9876543210',
    otp: '129012',
  },
  
  // Base URLs
  urls: {
    base: 'http://localhost:3000',
    auth: 'http://localhost:3002/api/v1',
    business: 'http://localhost:3003/api/v1',
    party: 'http://localhost:3004/api/v1',
    inventory: 'http://localhost:3005/api/v1',
    invoice: 'http://localhost:3006/api/v1',
    payment: 'http://localhost:3007/api/v1',
  },
  
  // Timeouts
  timeouts: {
    navigation: 10000,
    api: 30000,
    element: 10000,
    toast: 5000,
  },
  
  // Test Data
  testBusiness: {
    name: 'Test Business Pvt Ltd',
    gstin: '27AABCU9603R1ZM',
  },
};

/**
 * Generate unique test data with timestamp
 */
export function generateTestData() {
  const timestamp = Date.now();
  
  return {
    party: {
      name: `Test Customer ${timestamp}`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `test.${timestamp}@example.com`,
      gstin: '27AABCU9603R1ZM',
      type: 'customer' as const,
    },
    supplier: {
      name: `Test Supplier ${timestamp}`,
      phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `supplier.${timestamp}@example.com`,
      gstin: '07AABCU9603R1ZP',
      type: 'supplier' as const,
    },
    item: {
      name: `Test Product ${timestamp}`,
      sku: `SKU-${timestamp}`,
      selling_price: '1000',
      purchase_price: '750',
      opening_stock: '50',
      min_stock_level: '10',
      hsn_code: '8471',
    },
    payment: {
      amount: '1500',
      reference_number: `PAY-${timestamp}`,
      notes: 'Test payment via E2E',
    },
    invoice: {
      items: [
        { quantity: 2, price: 500 },
      ],
    },
  };
}

/**
 * API Call Interface
 */
export interface ApiCall {
  method: string;
  url: string;
  status: number;
  requestBody?: any;
  responseBody?: any;
  timestamp: Date;
  duration: number;
}

/**
 * API Tracker Class - Captures and verifies all API calls
 */
export class ApiTracker {
  calls: ApiCall[] = [];
  
  add(call: ApiCall) {
    this.calls.push(call);
    const emoji = call.status >= 400 ? '❌' : '✅';
    console.log(`${emoji} API: ${call.method} ${call.url} → ${call.status} (${call.duration}ms)`);
  }
  
  /**
   * Get the last API call matching a URL pattern
   */
  getLastCall(urlPattern: string, method?: string): ApiCall | undefined {
    return [...this.calls].reverse().find(c => 
      c.url.includes(urlPattern) && (method ? c.method === method : true)
    );
  }
  
  /**
   * Get all calls matching a URL pattern
   */
  getCallsByUrl(urlPattern: string): ApiCall[] {
    return this.calls.filter(c => c.url.includes(urlPattern));
  }
  
  /**
   * Get all calls by HTTP method
   */
  getCallsByMethod(method: string): ApiCall[] {
    return this.calls.filter(c => c.method === method);
  }
  
  /**
   * Verify an API call was made with expected values
   */
  verifyCall(
    urlPattern: string,
    method: string,
    expectedStatus: number,
    expectedBodyFields?: Record<string, any>
  ): { success: boolean; call?: ApiCall; error?: string } {
    const call = this.getLastCall(urlPattern, method);
    
    if (!call) {
      return { success: false, error: `No ${method} call to ${urlPattern} found` };
    }
    
    if (call.status !== expectedStatus) {
      return { 
        success: false, 
        call,
        error: `Expected status ${expectedStatus}, got ${call.status}` 
      };
    }
    
    if (expectedBodyFields && call.requestBody) {
      for (const [key, value] of Object.entries(expectedBodyFields)) {
        if (call.requestBody[key] !== value) {
          return {
            success: false,
            call,
            error: `Expected ${key}=${value}, got ${key}=${call.requestBody[key]}`
          };
        }
      }
    }
    
    return { success: true, call };
  }
  
  /**
   * Clear all tracked calls
   */
  clear() {
    this.calls = [];
  }
  
  /**
   * Print summary of all API calls
   */
  printSummary() {
    console.log('\n📊 API CALL SUMMARY:');
    console.log('='.repeat(70));
    this.calls.forEach((call, i) => {
      const emoji = call.status >= 400 ? '❌' : '✅';
      console.log(`${i + 1}. ${emoji} [${call.method}] ${call.url}`);
      console.log(`   Status: ${call.status} | Duration: ${call.duration}ms`);
      if (call.requestBody) {
        console.log(`   Request: ${JSON.stringify(call.requestBody).substring(0, 100)}...`);
      }
    });
    console.log('='.repeat(70));
  }
}
