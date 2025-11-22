# End-to-End Tests

E2E tests verify complete user workflows in a real browser environment using Playwright.

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in debug mode
npx playwright test --debug

# Show test report
npx playwright show-report test-results/html
```

## Test Approach

E2E tests simulate real user interactions:
- **Full browser automation**: Real Chrome, Firefox, Safari
- **Page Object Model**: Encapsulate page interactions in reusable objects
- **Fixtures**: Reusable setup for auth, data, etc.
- **Visual testing**: Screenshot comparison for UI regression
- **Network mocking**: Intercept and mock API calls when needed

## Structure

- `tests/e2e/` - E2E test spec files (`*.spec.ts`)
- `tests/e2e/fixtures/` - Reusable test fixtures
- `tests/e2e/pages/` - Page Object Models (to be added)
- `playwright.config.ts` - Playwright configuration

## Requirements for AI Agents

All E2E tests are:
- **Non-interactive**: Fully automated, no manual steps
- **Deterministic**: Use fixtures and mocks for consistent state
- **Clear exit codes**: 0 for success, non-zero for failure
- **JSON output**: Results available in `test-results/e2e-results.json`
- **CI-ready**: Headless by default, screenshots/videos on failure

## Example Test

```typescript
import { test, expect } from '@playwright/test';
import { authenticatedUser } from './fixtures/auth';

test.describe('Project Management', () => {
  test.use(authenticatedUser);

  test('should create a new project', async ({ page }) => {
    await page.goto('/projects');
    await page.click('button:has-text("New Project")');
    
    await page.fill('input[name="name"]', 'Test Project');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.click('button:has-text("Create")');
    
    await expect(page.locator('h1')).toContainText('Test Project');
  });
});
```

## Fixtures

Fixtures provide reusable setup and state:

- **auth.ts**: Authentication fixtures (logged in/out users, different roles)
- **projects.ts**: Project data fixtures (empty state, with projects, etc.)
- Custom fixtures can be added for common test scenarios

## Best Practices

1. **Use data-testid**: Add `data-testid` attributes to important elements
2. **Wait for navigation**: Use `waitForURL` after navigation actions
3. **Avoid brittle selectors**: Prefer semantic selectors over CSS classes
4. **Test user flows, not implementation**: Focus on what users do
5. **Keep tests independent**: Each test should set up its own state
6. **Use fixtures for common setup**: Don't repeat auth/data setup
7. **Clean up after tests**: Use fixtures to ensure clean state

## Debugging

```bash
# Run with browser visible
npx playwright test --headed

# Run with step-by-step debugger
npx playwright test --debug

# Generate test code from browser actions
npx playwright codegen http://localhost:3000
```

## CI Configuration

E2E tests are configured to run in CI:
- Headless mode (no GUI)
- Retry failed tests (2 retries)
- Single worker (sequential execution)
- Save screenshots and videos on failure
- JSON report for programmatic parsing
