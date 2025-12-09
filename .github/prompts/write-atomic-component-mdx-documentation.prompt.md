---
agent: 'agent'
description: 'Write MDX documentation for an Atomic component'
---

# Write Atomic Component MDX Documentation

Write comprehensive MDX documentation for an Atomic component following established patterns and conventions.

**Working directory:** `packages/atomic`

## Documentation Requirements

MDX files provide user-facing documentation in Storybook. They should:
- Explain what the component does and when to use it
- Show typical usage within the appropriate interface
- Highlight important configuration options or constraints
- Reference related components when relevant

## Find Similar Components for Pattern Reference

**First, identify if a corresponding component exists in other use cases that already has MDX documentation.**

### Pattern Discovery Process

1. **Extract component base name:**
   - From `atomic-[use-case-]component-name` → get `component-name`
   - Examples:
     - `atomic-commerce-pager` → `pager`
     - `atomic-query-error` → `query-error`
     - `atomic-product-link` → `product-link`

2. **Fast-path checks (skip broad search if true):**
   - Component path contains `result-template-components` or `product-template-components` → Use `atomic-product-link.mdx` as reference
   - Component is in `/common` folder → Skip use-case search, go to template pattern lookup

3. **Search for similar components (only if no fast-path match):**
   ```bash
   find packages/atomic/src/components -name "*${base-name}*.mdx"
   ```

4. **Limit search scope:**
   - If component has use-case prefix (e.g., `atomic-commerce-*`), only search that use case folder
   - For non-prefixed components in `/search`, `/commerce`, `/insight`, or `/recommendations`, skip other use-case folders

5. **Verify MDX exists and is complete:**
   - Has more than just TODO comments
   - Contains actual usage examples
   - Shows the component within its interface context

### If Similar Component Found

**Read the similar component's MDX file and use it as a template:**

- Adapt the component description to the current use case
- **Prioritize the component's TypeScript JSDoc** (class-level documentation) for the description content, then adapt the similar component's structure and code examples
- Update the interface name (e.g., `atomic-search-interface` vs `atomic-commerce-interface`)
- Adjust the layout/template context (e.g., `atomic-search-layout` vs `atomic-commerce-layout`)
- Modify field/property names to match the use case (e.g., `ec_name` for commerce, result fields for search)
- Keep similar structure, warnings, and notes if they apply

**Example:** When documenting `atomic-query-error` (search), reference `atomic-commerce-query-error` (commerce) if it exists.

### If No Similar Component Found

Use standard patterns based on component type:

- **Template components** (used within result/product templates): Reference `atomic-product-link.mdx`
- **Non-template components** (standalone UI components): Reference `atomic-commerce-pager.mdx`

## MDX File Structure

Every MDX file should follow this structure:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import * as AtomicComponentNameStories from './atomic-component-name.new.stories';
import { AtomicDocTemplate } from '@/storybook-utils/documentation/atomic-doc-template';

<Meta of={AtomicComponentNameStories} />

<AtomicDocTemplate
  stories={AtomicComponentNameStories}
  githubPath="[use-case]/atomic-component-name/atomic-component-name.ts"
  tagName="atomic-component-name"
  className="AtomicComponentName"
>

[Component description and usage documentation goes here]

</AtomicDocTemplate>
```

### Key Components

1. **Import statements:**
   - Stories import: Must match the component's `.new.stories.tsx` file
   - Path depth depends on component location (adjust `../` count)

2. **AtomicDocTemplate props:**
   - `githubPath`: Relative path from `packages/atomic/src/components/`
   - `tagName`: Component HTML tag name
   - `className`: Component TypeScript class name

3. **Documentation content:**
   - Clear opening sentence explaining what the component does
   - Usage example showing component in proper interface context
   - Important notes about configuration, constraints, or related components

## Documentation Patterns

### Component Description

**The `AtomicDocTemplate` automatically renders the component's JSDoc.** Only add description if it provides usage context beyond JSDoc (e.g., typical placement, relationships).

Start with: "The `atomic-component-name` component [description]."

**Examples:**
- "The `atomic-pager` component provides buttons that allow the end user to navigate through the different result pages."
- "The `atomic-product-link` component renders a product **ec_name** as a clickable link."

### Usage Context

Always show the component within its proper interface hierarchy:

**Template components** (used within product/result templates):

**CRITICAL:** Template components MUST be nested inside a `<template>` element within the template container:

```html
<atomic-commerce-interface>
  <atomic-commerce-product-list>
    <atomic-product-template>
      <template>
        <atomic-component-name></atomic-component-name>
      </template>
    </atomic-product-template>
  </atomic-commerce-product-list>
</atomic-commerce-interface>
```

For search/result templates:
```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="main">
      <atomic-result-list>
        <atomic-result-template>
          <template>
            <atomic-result-component-name></atomic-result-component-name>
          </template>
        </atomic-result-template>
      </atomic-result-list>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

**Search components (non-template):**
```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="[section-name]">
      <atomic-component-name></atomic-component-name>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

**Commerce components (non-template):**
```html
<atomic-commerce-interface>
  <atomic-commerce-layout>
    <atomic-layout-section section="[section-name]">
      <atomic-component-name></atomic-component-name>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

### Important Notes

Use bold **Note:** for important information:
```markdown
**Note:** Use either `atomic-pager` OR `atomic-load-more-results` for pagination, but not both.
```

### Customization Examples

**Create a "Customization" section when:**
- Component has **optional** `@property` decorators
- Multiple configuration patterns exist

**Don't create separate section when:**
- Only required properties exist (mention inline with usage example)
- No public `@property` decorators (all `@state`)

```markdown
## Customization

You can customize the [feature]:

```html
<atomic-component-name 
  prop1="value1" 
  prop2="value2">
</atomic-component-name>
```

## Component Analysis

**Optimization:** After identifying similar component, read these files in parallel:
- Similar component's MDX file
- Component TypeScript source
- Storybook stories file

### Handling Existing MDX Files

If the MDX file already exists:
1. Check for TODO comments or placeholder content
2. **Verify `githubPath` correctness** - must match actual file location from `packages/atomic/src/components/`
3. Preserve correct import structure
4. Replace placeholder content with complete documentation

Before writing documentation:

1. **Read the component TypeScript file** to understand:
   - `@property` decorators (public configuration)
   - JSDoc comments on the class and properties
   - Component purpose from class documentation
   - Any `@event` or `@slot` documentation

2. **Check the Storybook stories** (`.new.stories.tsx`) for:
   - Common usage patterns
   - Property values used in examples
   - Component placement in interface hierarchy

3. **Look for related components** mentioned in:
   - Component source code imports
   - Similar components in other use cases
   - Components that commonly appear together

## Quality Checklist

Before completing the documentation:

- [ ] Found and analyzed similar component in other use case (if exists)
- [ ] Component description starts with "The `atomic-...` component"
- [ ] Usage example shows component in proper interface context
- [ ] All interface/layout names match the component's use case
- [ ] `githubPath` matches actual file location from `packages/atomic/src/components/`
- [ ] Important configuration options are documented
- [ ] Related components are referenced with proper links
- [ ] Code examples use proper indentation and syntax
- [ ] No TODOs or placeholder text remain

## Examples

**Template component** (used within product/result templates):
```mdx
This component is used within `atomic-product-template` components inside the product list:

```html
<atomic-commerce-interface>
  <atomic-commerce-product-list>
    <atomic-product-template>
      <template>
        <atomic-product-link></atomic-product-link>
      </template>
    </atomic-product-template>
  </atomic-commerce-product-list>
</atomic-commerce-interface>
```

**Non-template component** (standalone UI):
```mdx
This component is typically placed within the "pagination" section of the layout.

**Note:** Use either `atomic-commerce-pager` OR `atomic-commerce-load-more-products` for pagination, but not both.

```html
<atomic-commerce-interface>
  <atomic-commerce-layout>
    <atomic-layout-section section="main">
      <atomic-layout-section section="pagination">
        <atomic-commerce-pager></atomic-commerce-pager>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

## Workflow

Follow these steps systematically:

1. **Identify the component** to document (get file path from user)
2. **Search for similar components** in other use cases with MDX files
3. **Read the component source** to understand functionality
4. **Check Storybook stories** for usage patterns
5. **Read similar component MDX** (if found) for pattern reference
6. **Write documentation** following established patterns
7. **Verify quality** using the checklist above

Complete all workflow steps before finishing.
