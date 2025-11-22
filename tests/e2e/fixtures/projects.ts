/**
 * Project Fixtures for E2E Tests
 * 
 * Provides pre-configured projects for testing project-related features.
 * Use these to ensure consistent test data across E2E tests.
 */

import { test as base } from './auth';

export interface ProjectFixtures {
  testProject: {
    id: string;
    name: string;
    description: string;
  };
}

/**
 * Extended test with project fixtures.
 * Includes authentication fixtures from auth.ts.
 * 
 * Usage:
 *   test('project feature', async ({ authenticatedPage, testProject }) => {
 *     await authenticatedPage.goto(`/projects/${testProject.id}`);
 *     // Test with pre-created project
 *   });
 */
export const test = base.extend<ProjectFixtures>({
  testProject: async ({ authenticatedPage }, use) => {
    // TODO: Create test project via API or UI
    const project = {
      id: 'test-project-fixture',
      name: 'E2E Test Project',
      description: 'A project created for E2E testing',
    };

    // TODO: Actually create the project in the database
    // const projectId = await createProject(project);

    await use(project);

    // TODO: Cleanup - delete test project after test
    // await deleteProject(projectId);
  },
});

export { expect } from '@playwright/test';
