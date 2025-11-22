/**
 * Common Test Utilities and Helpers
 */

import { afterEach, beforeEach } from 'vitest';

/**
 * Common test setup
 * Can be used in beforeEach hooks
 */
export async function setupTest(): Promise<void> {
  // Common setup logic
}

/**
 * Common test teardown
 * Can be used in afterEach hooks
 */
export async function teardownTest(): Promise<void> {
  // Common cleanup logic
}

/**
 * Wait for a condition to be true or timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100, message = 'Condition not met' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }

  throw new Error(message);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock timestamp for consistent testing
 */
export function mockTimestamp(offset: number = 0): number {
  return new Date('2024-01-01T00:00:00.000Z').getTime() + offset;
}

/**
 * Assert that a promise rejects with a specific error
 */
export async function expectError(
  promise: Promise<unknown>,
  expectedMessage?: string | RegExp
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected promise to reject but it resolved');
  } catch (error) {
    if (expectedMessage) {
      const message = error instanceof Error ? error.message : String(error);
      if (typeof expectedMessage === 'string') {
        if (!message.includes(expectedMessage)) {
          throw new Error(
            `Expected error message to include "${expectedMessage}" but got "${message}"`
          );
        }
      } else if (!expectedMessage.test(message)) {
        throw new Error(
          `Expected error message to match ${expectedMessage} but got "${message}"`
        );
      }
    }
  }
}

/**
 * Create a spy/mock function that tracks calls
 */
export function createSpy<T extends (...args: any[]) => any>(
  implementation?: T
): T & { calls: any[][] } {
  const calls: any[][] = [];
  const spy = ((...args: any[]) => {
    calls.push(args);
    return implementation?.(...args);
  }) as T & { calls: any[][] };
  spy.calls = calls;
  return spy;
}

/**
 * Utility to use test setup/teardown in tests
 */
export function useTestSetup(): void {
  beforeEach(setupTest);
  afterEach(teardownTest);
}
