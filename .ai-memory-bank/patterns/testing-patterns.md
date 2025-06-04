# Testing Patterns and Strategies

## Overview

The UI Kit uses a comprehensive testing strategy with different tools for different purposes. Each package has its own testing approach optimized for its technology stack and use cases.

## Testing Strategy by Package

### Testing Tool Selection

- **Vitest**: Unit and integration testing (primary tool)
- **Playwright**: E2E testing for web applications
- **Cypress**: Legacy E2E tests (being migrated to Playwright)

### Headless Package

#### Unit Testing (Vitest)

**Focus**: Controller logic, Redux state management, API integration

```typescript
// Controller testing pattern
describe('SearchController', () => {
  let engine: MockedSearchEngine;
  let controller: SearchController;

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    controller = buildSearch(engine);
  });

  it('should execute search when query is updated', () => {
    controller.updateText('new query');
    controller.submit();

    expect(executeSearch).toHaveBeenCalledWith('new query');
  });
});
```

#### Integration Testing

- Full workflow testing
- API integration validation
- Cross-controller interaction testing

### Atomic Package

#### Unit Testing (Vitest)

**Focus**: Component rendering, state management, user interactions

```typescript
// Component testing pattern with mocked Headless
vi.mock('@coveo/headless', {spy: true});

describe('AtomicSearchBox', () => {
  beforeEach(() => {
    vi.mocked(buildSearchBox).mockReturnValue(buildFakeSearchBox());
  });

  const renderComponent = async (bindings = {}) => {
    const {element} = await renderInAtomicInterface({
      template: html`<atomic-search-box></atomic-search-box>`,
      bindings,
    });
    return element;
  };

  it('should render search input', async () => {
    const element = await renderComponent();
    const input = element.shadowRoot?.querySelector('input');
    expect(input).toBeTruthy();
  });
});
```

#### E2E Testing (Cypress)

**Focus**: Full user workflows, visual regression, cross-browser compatibility

```typescript
// E2E testing pattern
describe('Search Experience', () => {
  beforeEach(() => {
    cy.visit('/search');
  });

  it('should execute search and display results', () => {
    cy.get('atomic-search-box input').type('query').type('{enter}');

    cy.get('atomic-result-list')
      .find('atomic-result')
      .should('have.length.greaterThan', 0);
  });
});
```

#### Visual Testing (Cypress)

```bash
# Run visual regression tests
npm run e2e:snapshots

# Update visual baselines
npm run e2e:snapshots:watch
```

### Quantic Package

#### Jest Unit Tests

**Focus**: Isolated component behavior, Lightning Web Component specifics

```javascript
// LWC testing pattern
import QuanticComponent from 'c/quanticComponent';
import {createElement} from 'lwc';

describe('c-quantic-component', () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should render component correctly', () => {
    const element = createElement('c-quantic-component', {
      is: QuanticComponent,
    });

    element.someProperty = 'test value';
    document.body.appendChild(element);

    const renderedElement = element.shadowRoot.querySelector('.expected-class');
    expect(renderedElement).toBeTruthy();
  });
});
```

#### Playwright E2E Tests

**Focus**: Real Salesforce environment, complete workflows, API integration

```typescript
// Playwright E2E pattern
import {test, expect} from '@playwright/test';

test('complete search workflow', async ({page}) => {
  await page.goto('/lightning/n/QuanticSearch');

  await page.fill('input[type="search"]', 'test query');
  await page.press('input[type="search"]', 'Enter');

  await expect(page.locator('c-quantic-result-list')).toBeVisible();

  // Verify API calls
  const searchRequest = await page.waitForRequest(/.*\/search/);
  expect(searchRequest.postData()).toContain('test query');
});
```

#### Cypress Tests (Legacy)

Still used for some components but being migrated to Playwright.

## Common Testing Patterns

### Mock Setup Patterns

#### Headless Controller Mocking

```typescript
// Standard mocking pattern for Headless controllers
const buildFakeController = (config = {}) => ({
  state: {
    query: '',
    results: [],
    isLoading: false,
    ...config.state,
  },
  subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
  methods: {
    updateText: vi.fn(),
    submit: vi.fn(),
    ...config.methods,
  },
});

// Usage in tests
vi.mocked(buildSearchBox).mockReturnValue(buildFakeController());
```

#### API Response Mocking

```typescript
// Mock API responses
const mockSearchResponse = {
  results: [
    {title: 'Result 1', uri: 'http://example.com/1'},
    {title: 'Result 2', uri: 'http://example.com/2'},
  ],
  totalCount: 2,
};

vi.mocked(executeSearch.fulfilled).mockResolvedValue(mockSearchResponse);
```

### Component Testing Patterns

#### Stencil Component Testing

```typescript
// Test component lifecycle and rendering
describe('AtomicComponent', () => {
  it('should initialize correctly', async () => {
    const element = await fixture<AtomicComponent>(
      html`<atomic-component></atomic-component>`
    );

    await element.initialize(mockEngine);
    expect(element.isInitialized).toBe(true);
  });

  it('should handle property changes', async () => {
    const element = await fixture<AtomicComponent>(
      html`<atomic-component></atomic-component>`
    );

    element.someProperty = 'new value';
    await element.updateComplete;

    const renderedText = element.shadowRoot?.textContent;
    expect(renderedText).toContain('new value');
  });
});
```

#### Lightning Web Component Testing

```javascript
// Test LWC rendering and interaction
describe('c-quantic-component', () => {
  it('should handle user interaction', () => {
    const element = createElement('c-quantic-component', {
      is: QuanticComponent,
    });
    document.body.appendChild(element);

    const button = element.shadowRoot.querySelector('button');
    button.click();

    // Verify the interaction result
    expect(element.mockController.someMethod).toHaveBeenCalled();
  });
});
```

### E2E Testing Patterns

#### Cypress Selector Patterns

```typescript
// Component selector patterns
export interface ComponentSelector {
  get: () => CypressSelector;
  searchBox: () => CypressSelector;
  results: () => CypressSelector;
  facets: () => CypressSelector;
}

export const SearchSelectors: ComponentSelector = {
  get: () => cy.get('atomic-search-interface'),
  searchBox: () => SearchSelectors.get().find('atomic-search-box input'),
  results: () => SearchSelectors.get().find('atomic-result-list atomic-result'),
  facets: () => SearchSelectors.get().find('atomic-facet'),
};
```

#### Playwright Page Object Pattern

```typescript
// Page object for reusable test actions
export class SearchPage {
  constructor(private page: Page) {}

  async search(query: string) {
    await this.page.fill('input[type="search"]', query);
    await this.page.press('input[type="search"]', 'Enter');
  }

  async selectFacet(facetValue: string) {
    await this.page.click(`[data-facet-value="${facetValue}"]`);
  }

  async getResults() {
    return this.page.locator('c-quantic-result').all();
  }
}
```

## Testing Best Practices

### Unit Testing Best Practices

#### Mock Strategy

- **Mock External Dependencies**: Always mock Headless controllers, API calls
- **Preserve Interface**: Mock return values should match real interface
- **State Management**: Mock state changes and subscriptions properly

#### Test Organization

```typescript
describe('ComponentName', () => {
  describe('when initialized', () => {
    // Initialization tests
  });

  describe('when property changes', () => {
    // Property update tests
  });

  describe('when user interacts', () => {
    // User interaction tests
  });

  describe('error conditions', () => {
    // Error handling tests
  });
});
```

#### Assertion Patterns

```typescript
// Prefer specific assertions
expect(element.shadowRoot?.querySelector('.result')).toBeTruthy();

// Test user-visible behavior
expect(element.textContent).toContain('Expected text');

// Verify method calls
expect(mockController.submit).toHaveBeenCalledWith({query: 'test'});
```

### E2E Testing Best Practices

#### Wait Strategies

```typescript
// Wait for elements to be present
await page.waitForSelector('c-quantic-result-list');

// Wait for API responses
await page.waitForResponse(/.*\/search/);

// Wait for state changes
await page.waitForFunction(() =>
  document
    .querySelector('atomic-query-summary')
    ?.textContent?.includes('results')
);
```

#### Test Isolation

```typescript
// Clean state between tests
beforeEach(async () => {
  await page.goto('/search');
  await page.evaluate(() => localStorage.clear());
});

// Reset mocks
afterEach(() => {
  vi.clearAllMocks();
});
```

#### Error Handling

```typescript
// Test error conditions
test('should handle search error gracefully', async ({page}) => {
  // Mock API to return error
  await page.route('/search', (route) =>
    route.fulfill({status: 500, body: 'Server error'})
  );

  await page.fill('input[type="search"]', 'query');
  await page.press('input[type="search"]', 'Enter');

  await expect(page.locator('.error-message')).toBeVisible();
});
```

## Testing Configuration

### Package Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "e2e": "cypress run",
    "e2e:watch": "cypress open",
    "e2e:playwright": "playwright test",
    "e2e:snapshots": "cypress run --config-file cypress-screenshots.config.mjs"
  }
}
```

### Environment Configuration

#### Cypress Configuration

```typescript
// cypress.config.ts
export default defineConfig({
  includeShadowDom: true,
  viewportHeight: 1080,
  viewportWidth: 1920,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 3,
    openMode: 1,
  },
  e2e: {
    baseUrl: 'http://localhost:3333',
    specPattern: 'cypress/e2e/**/*.cypress.ts',
  },
});
```

#### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 3 : 0,
  use: {
    baseURL: 'https://org.my.site.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
  ],
});
```

## CI/CD Integration

### GitHub Actions Patterns

```yaml
# Test workflow
- name: Run unit tests
  run: npm test

- name: Run E2E tests
  run: npm run e2e
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: test-results
    path: test-results/
```

### Test Parallelization

```yaml
# Matrix strategy for E2E tests
strategy:
  matrix:
    spec:
      [
        'cypress/e2e/search/**/*',
        'cypress/e2e/facets/**/*',
        'cypress/e2e/results/**/*',
      ]
```

## Debugging and Troubleshooting

### Common Issues

#### Mock Not Working

```typescript
// Ensure mock is set up before component creation
vi.mock('@coveo/headless', {spy: true});

describe('Component', () => {
  beforeEach(() => {
    vi.mocked(buildController).mockReturnValue(mockController);
  });

  // Tests...
});
```

#### Timing Issues in E2E

```typescript
// Use proper wait strategies
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="results"]');

// Increase timeout for slow operations
await page.waitForResponse(/search/, {timeout: 30000});
```

#### Shadow DOM Access

```typescript
// Cypress shadow DOM support
cy.get('atomic-search-box').shadow().find('input').type('query');

// Playwright shadow DOM
await page.locator('atomic-search-box input').fill('query');
```

### Debug Tools

#### Test Debugging

```typescript
// Add debug statements
test('debug test', async ({page}) => {
  await page.pause(); // Playwright debugger
  console.log(await page.content()); // Page content inspection
});

// Cypress debugging
cy.debug(); // Pause execution
cy.screenshot(); // Take screenshot
```

#### Mock Verification

```typescript
// Verify mock calls
expect(mockController.submit).toHaveBeenCalledTimes(1);
expect(mockController.submit).toHaveBeenCalledWith({
  query: 'expected query',
});

// Log mock calls
console.log(vi.mocked(mockController.submit).mock.calls);
```

## Performance Testing

### Bundle Size Testing

```typescript
// Test bundle impact
test('component should not exceed size limit', () => {
  const bundleSize = getBundleSize('atomic-search-box');
  expect(bundleSize).toBeLessThan(50 * 1024); // 50KB limit
});
```

### Performance Monitoring

```typescript
// Performance testing in E2E
test('search should complete within time limit', async ({page}) => {
  const start = Date.now();

  await page.fill('input[type="search"]', 'query');
  await page.press('input[type="search"]', 'Enter');
  await page.waitForSelector('.results');

  const duration = Date.now() - start;
  expect(duration).toBeLessThan(2000); // 2 second limit
});
```

## Future Testing Enhancements

### Visual Regression Testing

- Automated screenshot comparison
- Cross-browser visual consistency
- Component library visual documentation

### Accessibility Testing

- Automated a11y testing in E2E
- Screen reader simulation
- Keyboard navigation testing

### Performance Testing

- Core Web Vitals monitoring
- Bundle size regression testing
- Runtime performance profiling
