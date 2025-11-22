# Integration Tests

Integration tests verify that different parts of the system work together correctly. These tests run against a test instance of Convex with a fake LLM backend.

## Structure

```
tests/integration/
├── README.md           # This file
├── convex/            # Tests for Convex backend functions
├── api/               # Tests for API endpoints
└── services/          # Tests for service layer integration
```

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integ

# Run integration tests in watch mode
npm run test:watch tests/integration

# Run specific integration test file
npx vitest run tests/integration/convex/projects.test.ts
```

## Writing Integration Tests

Integration tests should:

1. **Use the test Convex client** from `tests/utils/convexTestClient.ts`
2. **Use deterministic fake LLM** from `tests/utils/testHelpers.ts`
3. **Clean up after themselves** (delete test data in afterEach)
4. **Be isolated** (don't depend on other tests)
5. **Be deterministic** (always produce same results)

### Example Integration Test

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestClient, setupTestDatabase, teardownTestDatabase } from '../utils/convexTestClient';
import { createTestProject } from '../utils/seedData';
import { createFakeLLM } from '../utils/testHelpers';

describe('Project Integration Tests', () => {
  let client: ConvexTestClient;

  beforeEach(async () => {
    await setupTestDatabase();
    client = createTestClient();
  });

  afterEach(async () => {
    await teardownTestDatabase();
  });

  it('should create and retrieve a project', async () => {
    const project = createTestProject();
    const created = await client.mutation('projects:create', project);
    const retrieved = await client.query('projects:get', { id: created.id });
    
    expect(retrieved.name).toBe(project.name);
  });
});
```

## Test Data

Use the seeding utilities from `tests/utils/seedData.ts` to create consistent test data:

- `createTestProject()` - Create test projects
- `createTestReport()` - Create test reports
- `createTestUser()` - Create test users

## Fake LLM

All integration tests use `createFakeLLM()` which returns deterministic responses. This ensures:

- Tests are fast (no real API calls)
- Tests are deterministic (same input = same output)
- Tests work offline
- No API costs during testing

## CI/CD

Integration tests run in CI via `npm run test:ci`. They must:

- Exit with code 0 on success, non-zero on failure
- Complete within 5 minutes
- Not require external services (except test Convex instance)
- Clean up all test data

## Troubleshooting

**Tests timing out?**
- Check that test database setup is complete before running tests
- Ensure cleanup happens in afterEach, not after all tests

**Tests failing intermittently?**
- Check for shared state between tests
- Verify all async operations use await
- Ensure test data is unique per test

**Can't connect to test Convex?**
- Verify Convex test configuration
- Check environment variables
- Ensure test deployment is running
