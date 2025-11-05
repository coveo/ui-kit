---
mode: 'agent'
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

2. **Search for similar components across use cases:**
   ```bash
   find packages/atomic/src/components -name "*${base-name}*.mdx"
   ```

3. **Check these use case folders:**
   - `/search` - Search interface components
   - `/commerce` - Commerce/product listing components
   - `/insight` - Insight panel components
   - `/recommendations` - Recommendation components
   - `/common` - Shared components

4. **Verify MDX exists and is complete:**
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
import { AtomicDocTemplate } from '../../../../storybook-utils/documentation/atomic-doc-template';

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

Start with: "The `atomic-component-name` component [description]."

**Examples:**
- "The `atomic-pager` component provides buttons that allow the end user to navigate through the different result pages."
- "The `atomic-product-link` component renders a product **ec_name** as a clickable link."

### Usage Context

Always show the component within its proper interface hierarchy:

**Search components:**
```html
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="[section-name]">
      <atomic-component-name></atomic-component-name>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

**Commerce components:**
```html
<atomic-commerce-interface>
  <atomic-commerce-layout>
    <atomic-layout-section section="[section-name]">
      <atomic-component-name></atomic-component-name>
    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

**Template components:**
```html
<atomic-commerce-interface>
  <atomic-commerce-product-list>
    <atomic-product-template>
      <atomic-component-name></atomic-component-name>
    </atomic-product-template>
  </atomic-commerce-product-list>
</atomic-commerce-interface>
```

### Important Notes

Use bold **Note:** for important information:
```markdown
**Note:** Use either `atomic-pager` OR `atomic-load-more-results` for pagination, but not both.
```

### Customization Examples

If the component has important configuration options, show them. If the component has no `@property` decorators or all properties are internal (`@state`), omit the customization section.

```markdown
## Customization

You can customize the [feature]:

```html
<atomic-component-name 
  prop1="value1" 
  prop2="value2">
</atomic-component-name>
```
```

## Component Analysis

**Optimization:** After identifying similar component, read these files in parallel:
- Similar component's MDX file
- Component TypeScript source
- Storybook stories file

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
- [ ] Important configuration options are documented
- [ ] Related components are referenced with proper links
- [ ] Code examples use proper indentation and syntax
- [ ] No TODOs or placeholder text remain

## Examples

**Template component** (used within product/result templates):
```mdx
The `atomic-product-link` component renders a product **ec_name** as a clickable link. This component is used within `atomic-product-template` components inside the product list:

<atomic-commerce-interface>
  <atomic-commerce-product-list>
    <atomic-product-template>
      <atomic-product-link></atomic-product-link>
    </atomic-product-template>
  </atomic-commerce-product-list>
</atomic-commerce-interface>
```

**Non-template component** (standalone UI):
```mdx
This component is typically placed within the "pagination" section of the layout.

**Note:** Use either `atomic-commerce-pager` OR `atomic-commerce-load-more-products` for pagination, but not both.

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
```

## Workflow

**Before starting, create todo list with these steps** (use `manage_todo_list`):

1. **Identify the component** to document (get file path from user)
2. **Search for similar components** in other use cases with MDX files
3. **Read the component source** to understand functionality
4. **Check Storybook stories** for usage patterns
5. **Read similar component MDX** (if found) for pattern reference
6. **Write documentation** following established patterns
7. **Verify quality** using the checklist above
8. **Generate execution summary** (mandatory final step)

Track progress by marking items in-progress → completed. Complete all workflow steps including summary generation before marking final todo as done.

## Post-Execution: Generate Summary

After completing documentation, generate execution summary:

**1. Create summary file:**
- **Location:** `.github/prompts/.executions/write-atomic-component-mdx-documentation-[YYYY-MM-DD-HHmmss].prompt-execution.md`
- **Structure:** Follow `.github/prompts/.executions/TEMPLATE.prompt-execution.md`
- **Purpose:** Structured feedback for prompt optimization

**2. Include in summary:**
- Which similar component was used as reference (if any)
- Issues with finding patterns or understanding conventions
- Ambiguities in prompt instructions that required interpretation
- Time-consuming operations (excessive file reads, searches)
- Missing instructions or unclear requirements
- Concrete suggestions for prompt improvements

**3. Inform user** about summary location and next steps (switch to "Prompt Engineer" chatmode for optimization)
