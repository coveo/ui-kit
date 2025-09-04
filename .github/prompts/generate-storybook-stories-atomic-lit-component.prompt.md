---
mode: 'agent'
description: 'Generate Storybook stories for Atomic components following established patterns and interface conventions'
---

# Generate Storybook Stories for Atomic Components

You are a senior web developer with expertise in Storybook, Lit web components, and the Atomic component library. You understand the structure and conventions of the UI Kit project, particularly how to write comprehensive Storybook stories for Atomic components that integrate with various headless interfaces. Your goal is to create or update Storybook stories for an existing Atomic component following the established patterns and conventions in the UI Kit project.

**Note: All commands in this guide should be run from the `packages/atomic` directory.**

## Task Overview

You will be asked to create or update a Storybook story for a specific Atomic component. These stories demonstrate component functionality, provide interactive controls for testing different configurations, and serve as living documentation for component usage. Follow the guidelines from the [atomic component instructions](../instructions/atomic.instructions.md) and create a complete story that covers the component's main use cases.

## Understanding Atomic Component Story Structure

Stories in the Atomic package follow these conventions:

- **File naming**: `atomic-{component-name}.new.stories.tsx`
- **Location**: Same directory as the component file
- **Interface integration**: Stories wrap components in appropriate interface contexts
- **Consistent imports**: Standard Storybook and utility imports
- **Meta configuration**: Component metadata with proper titles and controls

## Component Type and Interface Detection

### Interface Types

Atomic components belong to different interface ecosystems:

- **Search components** (`src/components/search/`): Use `wrapInSearchInterface`
- **Commerce components** (`src/components/commerce/`): Use `wrapInCommerceInterface`  
- **Insight components** (`src/components/insight/`): Use `wrapInInsightInterface`
- **IPX components** (`src/components/ipx/`): Use `wrapInIpxInterface`
- **Recommendations components** (`src/components/recommendations/`): Use `wrapInRecommendationsInterface`

Additional interface wrappers may be created as needed for specific use cases.

If you are asked to write stories for a component that doesn't fit neatly into one of these categories, follow the patterns established in the existing wrappers to create a new interface wrapper that provides the necessary context for the component, and adjust this workspace prompt for future use.

### Interface Wrapper Imports

```typescript
// For Search components
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

// For Commerce components  
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';

// For Insight components
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

// For IPX components
import {wrapInIpxInterface} from '@/storybook-utils/ipx/ipx-interface-wrapper';

// For Recommendations components
import {wrapInRecommendationsInterface} from '@/storybook-utils/recommendations/recommendations-interface-wrapper';
```

## Steps to Create or Update Stories

### 1. Analyze the Component

First, examine the component file to understand:

- **Component directory**: Determines which interface wrapper to use
- **Properties**: What `@property()` decorators does the component have?
- **Attributes**: What HTML attributes does the component accept?
- **Events**: What custom events does the component emit?
- **Dependencies**: Does it require specific headless controllers?
- **Functionality**: What are the main features to demonstrate?

### 2. Determine the Correct Interface Wrapper

Based on the component's directory path:

- `src/components/search/` → Use `wrapInSearchInterface`
- `src/components/commerce/` → Use `wrapInCommerceInterface`
- `src/components/insight/` → Use `wrapInInsightInterface`
- `src/components/ipx/` → Use `wrapInIpxInterface`
- `src/components/recommendations/` → Use `wrapInRecommendationsInterface`

### 3. Create Standard Story Structure

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapIn[Interface]Interface} from '@/storybook-utils/[interface]/[interface]-interface-wrapper';

const {decorator, play} = wrapIn[Interface]Interface();

const meta: Meta = {
  component: 'atomic-component-name',
  title: '[Category]/ComponentName',
  id: 'atomic-component-name',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  argTypes: {
    // Add component properties and attributes here
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-component-name',
};
```

### 4. Configure Story Metadata

#### Title Conventions

Use these title patterns based on component type:

- **Search components**: `'Search/ComponentName'`
- **Commerce components**: `'Commerce/ComponentName'`  
- **Insight components**: `'Insight/ComponentName'`
- **IPX components**: `'IPX/ComponentName'`
- **Recommendations components**: `'Recommendations/ComponentName'`

**Important**: Do NOT include "Atomic/" in the title. Use only the component category (Search, Commerce, Insight, IPX, Recommendations, etc.) followed by the component name.

#### Component ID

Always use the full component tag name: `'atomic-component-name'`

### 5. Add ArgTypes for Interactive Controls

For components with properties or attributes, add argTypes to enable Storybook controls:

```typescript
argTypes: {
  // For string properties
  'attributes-property-name': {
    control: {
      type: 'text',
    },
    description: 'Description of what this property controls.',
    table: {
      category: 'attributes',
      type: {
        summary: 'string',
      },
      defaultValue: {summary: 'default-value'},
    },
  },
  
  // For boolean properties
  'attributes-enabled': {
    control: {
      type: 'boolean',
    },
    description: 'Whether the component is enabled.',
    table: {
      category: 'attributes', 
      type: {
        summary: 'boolean',
      },
      defaultValue: {summary: 'true'},
    },
  },
  
  // For number properties
  'attributes-max-count': {
    control: {
      type: 'number',
    },
    description: 'Maximum number of items to display.',
    table: {
      category: 'attributes',
      type: {
        summary: 'number',
      },
      defaultValue: {summary: '10'},
    },
  },
},
```

### 6. Create Additional Story Variants (Optional)

For components with multiple configurations, create additional stories:

```typescript
export const WithCustomSettings: Story = {
  name: 'With Custom Settings',
  args: {
    'attributes-property': 'custom-value',
    'attributes-enabled': true,
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    'attributes-enabled': false,
  },
};
```

### 7. Handle Special Cases

#### Background Processes

For components that need specific timing or don't require automatic search execution:

```typescript
const {decorator, play} = wrapIn[Interface]Interface(
  {}, // config
  true  // skipFirstSearch
);
```

#### Custom Configuration

For components requiring specific headless engine configuration:

```typescript
const {decorator, play} = wrapIn[Interface]Interface({
  // Custom engine configuration
  organizationId: 'specific-org',
  // ... other config options
});
```

## File Location and Naming

### Story File Placement

Stories must be placed in the same directory as the component:

```
src/components/category/atomic-component-name/
├── atomic-component-name.ts
├── atomic-component-name.new.stories.tsx  ← Story file here
├── atomic-component-name.spec.ts
```

### Consistent Naming

- **File name**: `atomic-{component-name}.new.stories.tsx`
- **Component reference**: Use the full tag name in all references
- **Story names**: Use descriptive, clear names for each story variant

## Best Practices

### 1. Interface Integration

- Always use the appropriate interface wrapper for the component type
- Let the interface wrapper handle initialization and search execution
- Don't manually initialize engines or controllers in stories

### 2. Property Documentation

- Add clear descriptions for all component properties
- Use appropriate control types (text, boolean, number, select)
- Group related properties using table categories

### 3. Story Variants

- Create a Default story that shows the component in its most common state
- Add additional stories for important configurations or edge cases
- Use descriptive names that explain what each story demonstrates

### 4. Accessibility

- Stories should demonstrate accessible usage patterns
- Include proper labels and descriptions where relevant
- Test keyboard navigation and screen reader compatibility

## Example: Complete Search Component Story

```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-search-facet',
  title: 'Search/Facet',
  id: 'atomic-search-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  argTypes: {
    'attributes-field': {
      control: {
        type: 'text',
      },
      description: 'The field to use for faceting.',
      table: {
        category: 'attributes',
        type: {
          summary: 'string',
        },
        defaultValue: {summary: '@source'},
      },
    },
    'attributes-label': {
      control: {
        type: 'text',
      },
      description: 'The label to display for this facet.',
      table: {
        category: 'attributes',
        type: {
          summary: 'string',
        },
      },
    },
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-search-facet',
};

export const WithCustomField: Story = {
  name: 'With Custom Field',
  args: {
    'attributes-field': '@author',
    'attributes-label': 'Author',
  },
};
```

## Quality Checklist

Before completing the story creation:

- [ ] Uses the correct interface wrapper for the component type
- [ ] Has proper title following naming conventions  
- [ ] Includes Default story with descriptive name
- [ ] Documents all important component properties in argTypes
- [ ] Uses appropriate control types for each property
- [ ] Includes helpful descriptions for each property
- [ ] Follows consistent formatting and structure
- [ ] Tests that the story renders correctly in Storybook
- [ ] Verifies that controls work as expected

## Troubleshooting

### Common Issues

1. **Wrong Interface**: Ensure you're using the correct interface wrapper
2. **Title Path**: Use the right category based on component directory
3. **ArgTypes**: Property names should match the actual component attributes
4. **Controls**: Verify control types match the property types

### Testing the Story

Run Storybook to verify your story works:

```bash
npm run storybook
```

Navigate to your component story and test:
- Component renders correctly
- Controls work as expected
- Interface integration functions properly
- No console errors appear

This prompt ensures maximum consistency and efficiency when creating Atomic component stories by following established patterns and conventions while providing comprehensive guidance for different component types and use cases.
