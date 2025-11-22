/**
 * Common Test Utilities
 * 
 * Shared helper functions for all test types (unit, integration, E2E).
 * Includes matchers, assertions, and convenience utilities.
 */

/**
 * Waits for a condition to be true, polling at intervals.
 * Useful for async operations in tests.
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Sleep utility for tests.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique test ID for isolation.
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Fake LLM response generator for deterministic testing.
 * Returns predictable responses based on input prompts.
 */
export function createFakeLLM() {
  return {
    generate: async (prompt: string): Promise<string> => {
      // Deterministic fake responses for testing
      if (prompt.includes('summary')) {
        return 'This is a fake summary response for testing.';
      }
      if (prompt.includes('report')) {
        return 'This is a fake report generation response for testing.';
      }
      return 'This is a fake LLM response for testing.';
    },
  };
}

/**
 * Mock clock for time-sensitive tests.
 */
export class MockClock {
  private currentTime: number;

  constructor(initialTime: Date = new Date()) {
    this.currentTime = initialTime.getTime();
  }

  now(): Date {
    return new Date(this.currentTime);
  }

  advance(ms: number): void {
    this.currentTime += ms;
  }

  tick(ms: number): void {
    this.advance(ms);
  }
}
