/**
 * Test Data Seeding Utilities
 * 
 * Provides factory functions and helpers for creating consistent test data.
 * Use these to generate deterministic test fixtures for projects, reports, etc.
 */

/**
 * Creates a test project with default or custom properties.
 */
export function createTestProject(overrides?: Partial<any>) {
  return {
    id: 'test-project-1',
    name: 'Test Project',
    description: 'A test project for automated testing',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Creates a test report with default or custom properties.
 */
export function createTestReport(overrides?: Partial<any>) {
  return {
    id: 'test-report-1',
    projectId: 'test-project-1',
    title: 'Test Report',
    content: 'Test report content',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Creates a test user with default or custom properties.
 */
export function createTestUser(overrides?: Partial<any>) {
  return {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Seeds multiple test projects at once.
 */
export function createTestProjects(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createTestProject({
      id: `test-project-${i + 1}`,
      name: `Test Project ${i + 1}`,
    })
  );
}
