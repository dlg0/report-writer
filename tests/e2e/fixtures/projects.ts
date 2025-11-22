/**
 * Project Fixtures for E2E Tests
 * 
 * Provides reusable project data states for Playwright tests.
 */

import { test as base } from '@playwright/test';

export interface ProjectFixtures {
  emptyState: void;
  withProjects: void;
  withSampleProject: { projectId: string; projectName: string };
}

/**
 * Extend Playwright test with project fixtures
 */
export const test = base.extend<ProjectFixtures>({
  /**
   * Empty state fixture
   * Ensures user has no projects
   */
  emptyState: async ({ page }, use) => {
    // TODO: Clear all projects for test user
    // This might involve:
    // 1. API call to delete all projects
    // 2. Database cleanup
    // 3. Using test database snapshot
    
    await use();
  },

  /**
   * With projects fixture
   * Creates sample projects before test
   */
  withProjects: async ({ page }, use) => {
    // TODO: Seed test projects
    const projects = [
      { name: 'Project Alpha', description: 'First test project' },
      { name: 'Project Beta', description: 'Second test project' },
      { name: 'Project Gamma', description: 'Third test project' },
    ];
    
    // Create projects via API
    // for (const project of projects) {
    //   await createTestProject(project);
    // }
    
    await use();
    
    // Cleanup
    // await deleteAllTestProjects();
  },

  /**
   * With sample project fixture
   * Creates a single project and returns its details
   */
  withSampleProject: async ({ page }, use) => {
    const projectName = `Test Project ${Date.now()}`;
    
    // TODO: Create project via API
    const projectId = await createTestProject({
      name: projectName,
      description: 'A sample project for E2E testing',
    });
    
    await use({ projectId, projectName });
    
    // Cleanup
    await deleteTestProject(projectId);
  },
});

/**
 * Helper to create a test project programmatically
 */
export async function createTestProject(data: {
  name: string;
  description?: string;
  status?: 'active' | 'archived';
}): Promise<string> {
  // TODO: Create project via API or database
  // This should bypass the UI and directly create the project
  // Example:
  // const response = await fetch('/api/test/projects', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // const { id } = await response.json();
  // return id;
  
  return `test-project-${Date.now()}`;
}

/**
 * Helper to delete a test project
 */
export async function deleteTestProject(projectId: string): Promise<void> {
  // TODO: Delete project via API
  // Example:
  // await fetch(`/api/test/projects/${projectId}`, { method: 'DELETE' });
}

/**
 * Helper to delete all test projects
 */
export async function deleteAllTestProjects(): Promise<void> {
  // TODO: Delete all test projects
  // Example:
  // await fetch('/api/test/projects', { method: 'DELETE' });
}

/**
 * Helper to create a project with sample reports
 */
export async function createProjectWithReports(data: {
  projectName: string;
  reportCount?: number;
}): Promise<{ projectId: string; reportIds: string[] }> {
  const projectId = await createTestProject({ name: data.projectName });
  const reportCount = data.reportCount || 3;
  const reportIds: string[] = [];

  // TODO: Create reports for the project
  // for (let i = 0; i < reportCount; i++) {
  //   const reportId = await createTestReport({
  //     projectId,
  //     title: `Report ${i + 1}`,
  //     content: `Sample content for report ${i + 1}`,
  //   });
  //   reportIds.push(reportId);
  // }

  return { projectId, reportIds };
}

/**
 * Helper to create a test report
 */
export async function createTestReport(data: {
  projectId: string;
  title: string;
  content?: string;
  status?: 'draft' | 'published';
}): Promise<string> {
  // TODO: Create report via API
  // Example:
  // const response = await fetch('/api/test/reports', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // const { id } = await response.json();
  // return id;
  
  return `test-report-${Date.now()}`;
}
