/**
 * Authentication Fixtures for E2E Tests
 * 
 * Provides reusable authentication states for Playwright tests.
 */

import { test as base } from '@playwright/test';

export interface AuthFixtures {
  authenticatedUser: void;
  adminUser: void;
  guestUser: void;
}

/**
 * Extend Playwright test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Authenticated user fixture
   * Sets up a logged-in user before each test
   */
  authenticatedUser: async ({ page, context }, use) => {
    // TODO: Implement actual authentication
    // This is a stub - implement based on your auth system
    
    // Option 1: Use real login flow
    // await page.goto('/login');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard');
    
    // Option 2: Set auth cookies/tokens directly
    // await context.addCookies([
    //   {
    //     name: 'auth_token',
    //     value: 'test-token',
    //     domain: 'localhost',
    //     path: '/',
    //   }
    // ]);
    
    // Option 3: Use Clerk/Auth0/etc. test tokens
    // await context.route('**/api/auth/**', route => {
    //   route.fulfill({
    //     status: 200,
    //     body: JSON.stringify({ user: { id: 'test-user', email: 'test@example.com' } })
    //   });
    // });
    
    await use();
    
    // Cleanup after test
    // await context.clearCookies();
  },

  /**
   * Admin user fixture
   * Sets up a logged-in admin user
   */
  adminUser: async ({ page, context }, use) => {
    // TODO: Implement admin authentication
    // Similar to authenticatedUser but with admin privileges
    
    await use();
  },

  /**
   * Guest user fixture
   * Sets up an unauthenticated user (logged out state)
   */
  guestUser: async ({ page, context }, use) => {
    // Ensure user is logged out
    await context.clearCookies();
    
    await use();
  },
});

/**
 * Helper to create a test user account programmatically
 */
export async function createTestUser(data: {
  email?: string;
  password?: string;
  name?: string;
  role?: 'user' | 'admin';
} = {}): Promise<{
  email: string;
  password: string;
  name: string;
}> {
  const user = {
    email: data.email || `test-${Date.now()}@example.com`,
    password: data.password || 'test-password-123',
    name: data.name || 'Test User',
  };

  // TODO: Create user via API or database
  // This should bypass the UI and directly create the user
  // Example:
  // await fetch('/api/test/users', {
  //   method: 'POST',
  //   body: JSON.stringify({ ...user, role: data.role }),
  // });

  return user;
}

/**
 * Helper to delete test user after test
 */
export async function deleteTestUser(email: string): Promise<void> {
  // TODO: Delete user via API or database
  // Example:
  // await fetch(`/api/test/users/${email}`, { method: 'DELETE' });
}
