/**
 * Test Data Seeding Utilities
 * 
 * Utilities for creating consistent, realistic test data.
 */

export interface TestProject {
  _id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface TestReport {
  _id: string;
  projectId: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: number;
}

export interface TestUser {
  _id: string;
  email: string;
  name: string;
  createdAt: number;
}

/**
 * Create a test project with default or custom data
 */
export async function seedProject(
  data: Partial<Omit<TestProject, '_id' | 'createdAt'>> = {}
): Promise<TestProject> {
  const defaults: Omit<TestProject, '_id' | 'createdAt'> = {
    name: 'Test Project',
    description: 'A test project for integration testing',
    ...data
  };

  // TODO: Use convexTest.run to create project
  return {
    _id: generateId(),
    ...defaults,
    createdAt: Date.now()
  };
}

/**
 * Create a test report with default or custom data
 */
export async function seedReport(
  data: Partial<Omit<TestReport, '_id' | 'createdAt'>>
): Promise<TestReport> {
  const defaults: Omit<TestReport, '_id' | 'createdAt'> = {
    projectId: generateId(),
    title: 'Test Report',
    content: 'Test report content',
    status: 'draft',
    ...data
  };

  // TODO: Use convexTest.run to create report
  return {
    _id: generateId(),
    ...defaults,
    createdAt: Date.now()
  };
}

/**
 * Create a test user with default or custom data
 */
export async function seedUser(
  data: Partial<Omit<TestUser, '_id' | 'createdAt'>> = {}
): Promise<TestUser> {
  const defaults: Omit<TestUser, '_id' | 'createdAt'> = {
    email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
    name: 'Test User',
    ...data
  };

  // TODO: Use convexTest.run to create user
  return {
    _id: generateId(),
    ...defaults,
    createdAt: Date.now()
  };
}

/**
 * Create multiple test entities at once
 */
export async function seedDatabase(data: {
  projects?: Partial<Omit<TestProject, '_id' | 'createdAt'>>[];
  reports?: Partial<Omit<TestReport, '_id' | 'createdAt'>>[];
  users?: Partial<Omit<TestUser, '_id' | 'createdAt'>>[];
}): Promise<{
  projects: TestProject[];
  reports: TestReport[];
  users: TestUser[];
}> {
  const projects = await Promise.all(
    (data.projects || []).map(p => seedProject(p))
  );
  const reports = await Promise.all(
    (data.reports || []).map(r => seedReport(r))
  );
  const users = await Promise.all(
    (data.users || []).map(u => seedUser(u))
  );

  return { projects, reports, users };
}

/**
 * Generate a unique ID for test entities
 */
function generateId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
