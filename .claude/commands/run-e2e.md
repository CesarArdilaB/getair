# Run E2E Tests

Run Playwright end-to-end tests for the web application.

## Arguments

- `$ARGUMENTS` - Optional: specific test file, test name pattern, or flags

## Instructions

1. **Navigate to the web app directory**:
   ```bash
   cd apps/web
   ```

2. **Ensure Playwright browsers are installed**:
   ```bash
   pnpm exec playwright install --with-deps
   ```

3. **Run E2E tests based on arguments**:

   If no arguments provided, run all tests:
   ```bash
   pnpm test:e2e
   ```

   If arguments provided:
   - For specific test file: `pnpm test:e2e $ARGUMENTS`
   - For test name pattern: `pnpm test:e2e --grep "$ARGUMENTS"`
   - For specific project: `pnpm test:e2e --project=$ARGUMENTS`

4. **Available test commands**:
   - `pnpm test:e2e` - Run all tests headless
   - `pnpm test:e2e:ui` - Open Playwright UI mode
   - `pnpm test:e2e:debug` - Run tests in debug mode
   - `pnpm test:e2e:headed` - Run tests with browser visible

5. **Common patterns**:
   - Run auth tests: `pnpm test:e2e auth.spec.ts`
   - Run navigation tests: `pnpm test:e2e navigation.spec.ts`
   - Run only chromium: `pnpm test:e2e --project=chromium`
   - Run with grep: `pnpm test:e2e --grep "login"`

6. **If tests fail**:
   - Check the HTML report: `pnpm exec playwright show-report`
   - Review screenshots in `test-results/` directory
   - Check video recordings for flaky tests
   - Ensure dev server is running or can start

7. **Test structure**:
   ```
   apps/web/e2e/
   ├── fixtures/          # Test utilities and data
   │   └── test-fixtures.ts
   ├── pages/             # Page Object Models
   │   ├── index.ts
   │   ├── login.page.ts
   │   ├── signup.page.ts
   │   └── home.page.ts
   ├── auth.setup.ts      # Authentication session setup
   ├── auth.spec.ts       # Authentication tests
   └── navigation.spec.ts # Navigation tests
   ```

8. **Writing new tests**:
   - Create test files in `apps/web/e2e/` with `.spec.ts` extension
   - Use Page Object Models for maintainability
   - Import fixtures from `./fixtures/test-fixtures`
   - Follow existing patterns in `auth.spec.ts`

9. **CI considerations**:
   - Tests run with retries in CI (`CI=true`)
   - Single worker in CI for stability
   - Screenshots and videos captured on failure
