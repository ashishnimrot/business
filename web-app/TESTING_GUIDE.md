# Manual Testing Checklist - Automated with Playwright

## How to Run Automated Tests

### Quick Start
```bash
cd web-app

# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in interactive UI mode (RECOMMENDED for manual testing)
npm run test:ui

# Run tests in debug mode (step through each action)
npm run test:debug

# View test report after running
npm run test:report
```

### Prerequisites
1. Web app running on `http://localhost:3000`
2. Backend services running (auth, business, party, inventory, invoice, payment)
3. Database with test data

---

## Test Suites Available

### 1. Authentication Flow (`auth`)
- [ ] Login page displays correctly
- [ ] Phone validation works
- [ ] OTP flow completes successfully
- [ ] Redirects to dashboard after login

### 2. Dashboard (`dashboard`)
- [ ] Stats cards display
- [ ] Navigation to all modules works
- [ ] Export report generates PDF

### 3. Parties Module (`parties`)
- [ ] List displays correctly
- [ ] Search functionality works
- [ ] Add party dialog opens
- [ ] Create customer works
- [ ] Create supplier works
- [ ] Edit party works
- [ ] Delete confirmation shows
- [ ] Export to Excel works

### 4. Inventory Module (`inventory`)
- [ ] List displays correctly
- [ ] Add item dialog opens
- [ ] Create item with prices works
- [ ] Category filter works
- [ ] Low stock indicator shows
- [ ] Export to Excel works

### 5. Invoices Module (`invoices`)
- [ ] List displays correctly
- [ ] Create invoice page loads
- [ ] Filter by type works
- [ ] Filter by status works
- [ ] Download PDF works
- [ ] Export to Excel works

### 6. Payments Module (`payments`)
- [ ] List displays correctly
- [ ] Record payment dialog opens
- [ ] Filter by type works
- [ ] Export to Excel works

### 7. Settings (`settings`)
- [ ] Page loads correctly
- [ ] All tabs accessible
- [ ] Save changes works

### 8. Help Page (`help`)
- [ ] Page loads correctly
- [ ] FAQs display

### 9. Mobile Navigation (`mobile`)
- [ ] Bottom nav visible on mobile
- [ ] Navigation works on mobile

### 10. Delete Confirmations (`delete`)
- [ ] Dialog shows before delete
- [ ] Cancel works
- [ ] Confirm deletes item

---

## Running Specific Test Suites

```bash
# Run only authentication tests
npx playwright test -g "Authentication"

# Run only dashboard tests
npx playwright test -g "Dashboard"

# Run only parties tests
npx playwright test -g "Parties"

# Run only mobile tests
npx playwright test -g "Mobile"

# Run tests matching a pattern
npx playwright test -g "create"
```

---

## Interactive Testing Mode

The best way to perform manual testing with automation support:

```bash
npm run test:ui
```

This opens Playwright's Test UI where you can:
- **Watch tests run** in real-time with browser visible
- **Step through tests** one action at a time
- **Pause and inspect** the page state
- **Re-run failed tests** instantly
- **See traces** of what happened during failures
- **Pick locators** visually from the page

---

## Debug Mode

For investigating specific issues:

```bash
npm run test:debug
```

This allows you to:
- Set breakpoints in test code
- Step through each test action
- Inspect page state at any point
- Modify and re-run tests

---

## Recording New Tests

To record a new test by performing actions manually:

```bash
npx playwright codegen http://localhost:3000
```

This opens:
1. A browser where you perform actions
2. A code window showing the generated test code

Copy the generated code into your test file.

---

## Generating Screenshots

For visual documentation:

```bash
npx playwright test --update-snapshots
```

Screenshots are saved in `e2e/__screenshots__/`

---

## Test Reports

After running tests, view detailed report:

```bash
npm run test:report
```

Report includes:
- Pass/fail status for each test
- Screenshots on failure
- Video recordings (on retry)
- Trace viewer for debugging

---

## CI/CD Integration

Tests run automatically in CI:

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: |
    cd web-app
    npm ci
    npx playwright install --with-deps
    npm test
```

---

## Tips for Manual Testing

1. **Use `test:ui` mode** - Best for interactive manual testing
2. **Run tests frequently** - Catch regressions early
3. **Record new flows** - Use codegen to create tests for new features
4. **Check mobile** - Run mobile test suite for responsive issues
5. **Review traces** - When tests fail, traces show exactly what happened

---

## Common Issues

### Tests fail to find elements
- Check if selectors have changed
- Use Playwright's "Pick locator" tool in test:ui mode

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if backend services are running

### Login fails
- Verify auth service is running on port 3002
- Check test phone/OTP in `test-utils.ts`

### Download tests fail
- Some browsers block downloads in headless mode
- Run with `--headed` flag
