# Integration Tests

Integration tests verify the interaction between multiple components, particularly:
- Convex backend functions
- Database operations
- LLM integration (with fake LLM for determinism)
- Multi-component workflows

## Running Integration Tests

```bash
npm run test:integ
```

## Test Approach

Integration tests use:
- **Convex Test Client**: Isolated Convex backend instance for testing
- **Fake LLM**: Deterministic responses instead of real LLM calls
- **Seed Data**: Utilities to create consistent test data
- **Test Helpers**: Common setup/teardown and assertion utilities

## Structure

- `tests/integration/` - Integration test files
- `tests/utils/convexTestClient.ts` - Convex test client setup
- `tests/utils/seedData.ts` - Test data generation utilities
- `tests/utils/testHelpers.ts` - Common test helpers

## Requirements for AI Agents

All integration tests are:
- **Non-interactive**: No manual input required
- **Deterministic**: Same inputs always produce same outputs (via FakeLLM)
- **Clear exit codes**: 0 for success, non-zero for failure
- **JSON output**: Configured for programmatic parsing

## Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { convexTest } from '../utils/convexTestClient';
import { seedProject } from '../utils/seedData';

describe('Report Generation', () => {
  beforeEach(async () => {
    await convexTest.clearDatabase();
  });

  it('should generate report from project data', async () => {
    const project = await seedProject({ name: 'Test Project' });
    const report = await convexTest.run('reports:generate', { projectId: project._id });
    
    expect(report).toBeDefined();
    expect(report.content).toContain('Test Project');
  });
});
```

## Fake LLM

Integration tests use a fake LLM that returns deterministic responses based on input patterns.
This ensures tests are:
- Fast (no API calls)
- Reliable (no rate limits or network issues)
- Deterministic (same input = same output)
- Cost-free (no API charges)

Configure fake LLM responses in test setup or use default patterns.
