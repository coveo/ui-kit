---
name: creating-stories
description: Creates and modifies Storybook stories for Atomic components and sample pages. Uses MSW for API mocking, follows ui-kit conventions. Use when creating stories, adding component examples, building sample pages, or when user mentions Storybook, stories, or visual testing.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
  package: atomic
---

# Creating Stories

## Process

### Step 1: Determine Story Type

Answer these questions:

1. Is this a single component or a full page?
2. Which interface type? (Search, Commerce, Insight, IPX, Recommendations)
3. Is this a result template component?
4. What API mocking is needed?

**Locations:**
- Components: `packages/atomic/src/components/<category>/<name>/<name>.new.stories.tsx`
- Pages: `packages/atomic/storybook-pages/<use-case>/<name>.new.stories.tsx`

### Step 2: Generate Template

This skill includes a small generator that renders Handlebars templates from `.claude/skills/creating-stories/assets/`.

```bash
# Component story
node .claude/skills/creating-stories/scripts/generate-story-template.mjs \
  atomic-component-name --category search

# Result template component
node .claude/skills/creating-stories/scripts/generate-story-template.mjs \
  atomic-result-field --category search --result

# Sample page
node .claude/skills/creating-stories/scripts/generate-story-template.mjs \
  page-name --type page --category commerce
```

Allowed values:
- `--type`: `component` (default), `page`
- `--category`: `search` (default), `commerce`, `insight`, `ipx`, `recommendations`

Notes:
- `--result` is only valid for `--type component` (using it with `--type page` is an error).

### Step 3: Complete the Story

1. **Add API mocking** - Configure MSW harness for expected responses
2. **Create story variants** - Add stories for different states (empty, error, selected)
3. **Add custom props** - Set component-specific arguments
4. **Test interactions** - Verify story renders and behaves correctly

For MSW required reading, see [msw-required-reading.md](references/msw-required-reading.md).
For API mocking patterns, see [msw-patterns.md](references/msw-patterns.md).
For `EndpointHarness` methods, see [endpoint-harness-quick-reference.md](references/endpoint-harness-quick-reference.md).
For creating a new API mock domain, see [creating-new-api-mock.md](references/creating-new-api-mock.md).
For component examples, see [component-examples.md](references/component-examples.md).
For page examples, see [sample-page-examples.md](references/sample-page-examples.md).

### Step 4: Validate

```bash
# From packages/atomic directory
npx vitest ./src/**/*.spec.ts --run
```

## Story Structure

### Component Story Anatomy

```typescript
// 1. Create API harness at top level
const searchApiHarness = new MockSearchApi();

// 2. Get interface wrapper
const {decorator, play} = wrapInSearchInterface();

// 3. Get component helpers
const {events, args, argTypes, template} = getStorybookHelpers('atomic-name');

// 4. Configure meta
const meta: Meta = {
  component: 'atomic-name',
  decorators: [decorator],
  parameters: {
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

// 5. Export stories
export const Default: Story = {};
```

### API Mocking Patterns

**Default response:**
```typescript
// Uses base response automatically
```

**Modify for all stories:**
```typescript
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 10),
}));
```

**Story-specific response:**
```typescript
export const NoResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
    }));
  },
};
```

## Available API Mocks

| Mock | Import | Use Case |
|------|--------|----------|
| `MockSearchApi` | `@/storybook-utils/api/search/mock` | Search interface |
| `MockCommerceApi` | `@/storybook-utils/api/commerce/mock` | Commerce interface |
| `MockInsightApi` | `@/storybook-utils/api/insight/mock` | Insight interface |
| `MockAnswerApi` | `@/storybook-utils/api/answer/mock` | Answer/RGA |
| `MockRecommendationApi` | `@/storybook-utils/api/recommendation/mock` | Recommendations |
| `MockMachineLearningApi` | `@/storybook-utils/api/machinelearning/mock` | ML/User Actions |

## Interface Wrappers

| Wrapper | Import | Options |
|---------|--------|---------|
| `wrapInSearchInterface` | `@/storybook-utils/search/search-interface-wrapper` | `skipFirstSearch`, `includeCodeRoot` |
| `wrapInCommerceInterface` | `@/storybook-utils/commerce/commerce-interface-wrapper` | `skipFirstSearch`, `includeCodeRoot` |
| `wrapInInsightInterface` | `@/storybook-utils/insight/insight-interface-wrapper` | `skipFirstSearch` |
| `wrapInResultTemplate` | `@/storybook-utils/search/result-template-wrapper` | `autoLoad` |

## Reference Documentation

| Reference | When to Load |
|-----------|--------------|
| [msw-required-reading.md](references/msw-required-reading.md) | Starting point: API harness docs |
| [msw-patterns.md](references/msw-patterns.md) | Advanced MSW techniques, pagination, errors |
| [endpoint-harness-quick-reference.md](references/endpoint-harness-quick-reference.md) | `EndpointHarness` API quick reference |
| [creating-new-api-mock.md](references/creating-new-api-mock.md) | Add a new mock domain when needed |
| [component-examples.md](references/component-examples.md) | Facets, search box, pager, result components |
| [sample-page-examples.md](references/sample-page-examples.md) | Full page patterns for all interfaces |

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-story-template.mjs` | Generate story boilerplate from templates |
| `validate_skill.mjs` | Validate skill structure |

## Templates

Templates in `assets/` directory:
- `component.new.stories.tsx.hbs` - Standard component story
- `result-component.new.stories.tsx.hbs` - Result template component
- `page.new.stories.tsx.hbs` - Sample page story

## Validation Checklist

Before completing:
- [ ] Story file named `<component-name>.new.stories.tsx`
- [ ] MSW handlers included in parameters
- [ ] `beforeEach` clears mocked responses
- [ ] At least `Default` story exported
- [ ] Component imports use path aliases (`@/storybook-utils/...`)
- [ ] For pages: initialization function and `play` handler included
- [ ] Story follows patterns from similar components

## Common Pitfalls

1. **Forgetting to clear** - Always `harness.endpoint.clear()` in `beforeEach`
2. **Not spreading base response** - Always `{...response, field: value}`
3. **Wrong import paths** - Use `@/storybook-utils/...` not relative paths
4. **Missing handlers** - Include all harness handlers in `msw.handlers`
5. **Wrong decorator order** - Result templates need specific order
