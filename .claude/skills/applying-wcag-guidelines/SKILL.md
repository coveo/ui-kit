---
name: applying-wcag-guidelines
description: Applies Web Content Accessibility Guidelines (WCAG 2.2 Level AA) when creating or modifying UI components. Use when working on Atomic, Quantic, or other UI component packages to ensure accessibility compliance.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
  package: atomic | quantic | atomic-react | atomic-angular
---

# Applying WCAG Guidelines

This skill provides comprehensive guidance for implementing WCAG 2.2 Level AA accessibility standards in UI components.

## When to Use This Skill

Use this skill when:
- Creating new UI components (Atomic, Quantic, atomic-react, atomic-angular)
- Modifying existing UI components
- Reviewing UI component implementations for accessibility
- Writing component tests that validate accessibility features
- Creating Storybook stories that demonstrate accessible behavior

**Do NOT use for:**
- Headless controllers (no UI)
- Build scripts or tooling
- Documentation files
- Backend services
- Unit tests for non-UI utilities

## Core Principles

All generated code must adhere to WCAG 2.2 Level AA conformance. Code should be built with accessibility in mind, but may still have accessibility issues that require manual review and testing.

### Process

1. **Before generating code**: Reflect on these guidelines and plan implementation for WCAG 2.2 compliance
2. **During generation**: Apply appropriate accessibility patterns from this skill
3. **After generation**: Review code against WCAG 2.2 and iterate until accessible
4. **Communicate**: Inform users that code was built with accessibility in mind but should be reviewed and tested with tools like [Accessibility Insights](https://accessibilityinsights.io/)

### Inclusive Language

- Use people-first language (e.g., "person using a screen reader," not "blind user")
- Avoid stereotypes or assumptions about ability, cognition, or experience
- Be verification-oriented: include reasoning or references to standards
- Maintain neutral, helpful, respectful tone
- Avoid patronizing language or euphemisms

## Guidelines by Persona

### Cognitive Accessibility

- Use plain language whenever possible
- Maintain consistent page structure (landmarks) across the application
- Display navigation items in the same order across the application
- Keep interfaces clean and simple - reduce unnecessary distractions

### Keyboard Accessibility

#### Core Requirements

- All interactive elements must be keyboard navigable in predictable order (usually reading order)
- Keyboard focus must be clearly visible at all times
- All interactive elements must be keyboard operable (buttons, links, controls)
- Static (non-interactive) elements should NOT be in tab order (no `tabindex` attribute)
  - Exception: Elements that receive focus programmatically (e.g., via `element.focus()`) should have `tabindex="-1"`
- Hidden elements must not be keyboard focusable
- Provide mechanism to skip repeated blocks of content (skip links)
- Keyboard focus must not become trapped without escape mechanism (e.g., Escape key for dialogs)

#### Common Keyboard Commands

- `Tab` - Move to next interactive element
- `Arrow` - Navigate within composite components (date picker, grid, combobox, listbox)
- `Enter` - Activate focused control (button, link)
- `Escape` - Close open surfaces (dialogs, menus, listboxes)

#### Bypass Blocks

Skip links MUST be provided for repeated content blocks:

```html
<header>
  <a href="#maincontent" class="sr-only">Skip to main</a>
  <!-- logo and other header elements -->
</header>
<nav>
  <!-- main nav -->
</nav>
<main id="maincontent"></main>
```

```css
.sr-only:not(:focus):not(:active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

#### Managing Focus in Composite Components

**Roving Tabindex Pattern:**

Element in tab order has `tabindex="0"`, all others have `tabindex="-1"`.

Algorithm:
1. On initial load: Set `tabindex="0"` on initial element, `tabindex="-1"` on others
2. On arrow key press within component:
   - Set `tabindex="-1"` on current element with `tabindex="0"`
   - Set `tabindex="0"` on element that will receive focus
   - Call `element.focus()` on new target element

**aria-activedescendant Pattern:**

- Container has `tabindex="0"` and `aria-activedescendant="IDREF"`
- IDREF matches ID of active child element
- Use CSS to show focus outline on element referenced by `aria-activedescendant`
- Update `aria-activedescendant` on arrow key navigation

#### Composite Component Focus Behavior

For components with interactive children (grids, comboboxes, listboxes, menus, radio groups, tabs, toolbars, tree grids):

- Container has tab stop with appropriate interactive role
- Container manages child focus via arrow key navigation (roving tabindex or aria-activedescendant)
- When container receives focus:
  - If selection expected: focus currently selected child, or first selectable child if none selected
  - If previously navigated: focus previously focused child
  - Otherwise: focus first interactive child

### Low Vision Accessibility

#### Color Contrast

- Prefer dark text on light backgrounds, or light text on dark backgrounds
- Never use light-on-light or dark-on-dark
- Text contrast ratios:
  - Normal text: minimum 4.5:1
  - Large text (18.5px bold or 24px): minimum 3:1
  - Calculate against parent background if background-color is not set or transparent
- Graphics: required parts must have 3:1 contrast with adjacent colors
- Controls: parts needed to identify type and state must have 3:1 contrast with adjacent colors
- Never use color alone to convey information - always add text and/or shapes

### Screen Reader Accessibility

- Elements must correctly convey semantics (name, role, value, states, properties)
- Use native HTML elements whenever possible, otherwise use appropriate ARIA
- Use appropriate landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- Use headings (`<h1>` through `<h6>`) to introduce sections
  - Heading levels should accurately reflect hierarchy
  - SHOULD have only one `<h1>` describing overall page topic
  - Avoid skipping heading levels

### Voice Access Accessibility

- Accessible name of interactive elements must contain visual label
- Enables voice commands like "Click \<label>"
- If using `aria-label`, it must contain the visual label text
- Interactive elements must have appropriate roles and keyboard behaviors

## Pattern-Specific Guidelines

### Forms

- Labels must accurately describe control purpose
- Required fields:
  - Indicate visually (usually asterisk in label)
  - Add `aria-required="true"`
- Error messages:
  - Must describe how to fix the issue
  - Add `aria-invalid="true"` on invalid fields (remove when fixed)
  - Inline errors: associate with control via `aria-describedby`
  - Form-level errors: identify specific fields in error
- Do not disable submit buttons - trigger errors to help users identify invalid fields
- On submit with invalid input: send focus to first invalid field via `element.focus()`

### Graphics and Images

#### All Graphics Must Be Accounted For

Includes: `<img>` elements, `<svg>` elements, font icons, emojis

#### All Graphics Must Have Correct Role

- `<img>` - inherent role, no attribute needed
- `<svg>` - add `role="img"` for better support
- Icon fonts/emojis - add `role="img"` on container (e.g., `<span>`)

#### Alternative Text

**Determine if graphic is informative or decorative:**

- **Informative**: Conveys important information not found elsewhere
  - `<img>`: provide meaningful `alt` attribute
  - `role="img"`: provide `aria-label` or `aria-labelledby`
  - Keep concise but meaningful
  - Avoid `title` attribute for alt text
  
- **Decorative**: No important information, or information found elsewhere
  - `<img>`: use empty `alt=""` attribute
  - `role="img"`: use `aria-hidden="true"`

### Input and Control Labels

- All interactive elements must have visual labels
  - Links/buttons: inner text
  - Inputs: `<label>` element
- Labels must accurately describe control purpose
- `<label>` elements must have `for` attribute referencing control ID
- For repeated label text (e.g., multiple "remove" buttons): use `aria-label` for context (e.g., "Remove item X")
- Help text: associate with control via `aria-describedby`

### Navigation and Menus

#### Example Structure

```html
<nav>
  <ul>
    <li>
      <button aria-expanded="false" tabindex="0">Section 1</button>
      <ul hidden>
        <li><a href="..." tabindex="-1">Link 1</a></li>
        <li><a href="..." tabindex="-1">Link 2</a></li>
        <li><a href="..." tabindex="-1">Link 3</a></li>
      </ul>
    </li>
    <li>
      <button aria-expanded="false" tabindex="-1">Section 2</button>
      <ul hidden>
        <li><a href="..." tabindex="-1">Link 1</a></li>
        <li><a href="..." tabindex="-1">Link 2</a></li>
        <li><a href="..." tabindex="-1">Link 3</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

#### Navigation Requirements

- Do NOT use `menu` or `menubar` roles for navigation menus (use for application-like action menus)
- Navigation should be `<nav>` containing `<ul>` with links
- Toggle `aria-expanded` when expanding/collapsing
- Use roving tabindex pattern for focus management
- Users tab to navigation, then arrow across main items
- Arrow down through submenus without tabbing
- Escape key closes expanded menus

### Page Title

- MUST be defined in `<title>` element in `<head>`
- MUST describe page purpose
- SHOULD be unique per page
- SHOULD front-load unique information
- SHOULD follow format: "[Unique page] - [Section] - [Site title]"

### Tables and Grids

#### Column and Row Headers

Column and row headers MUST be programmatically associated with cells using `<th>` elements.

**Table with column and row headers:**

```html
<table>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
    <th>Header 3</th>
  </tr>
  <tr>
    <th>Row Header 1</th>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </tr>
  <tr>
    <th>Row Header 2</th>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </tr>
</table>
```

**Table with column headers only:**

```html
<table>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
    <th>Header 3</th>
  </tr>
  <tr>
    <td>Cell 1</td>
    <td>Cell 2</td>
    <td>Cell 3</td>
  </tr>
  <tr>
    <td>Cell 1</td>
    <td>Cell 2</td>
    <td>Cell 3</td>
  </tr>
</table>
```

#### Grid Semantics

When using `role="grid"`, ensure proper structure:

- Grid cells must be nested within `role="row"` elements
- Rows must be nested within the grid container
- Use `role="columnheader"` for column headers
- Without proper nesting, header associations are not programmatically determinable

#### Simple vs Complex Tables

**Prefer simple tables:**
- One set of column/row headers
- No nested rows or spanning cells
- Better assistive technology support
- Easier for users with cognitive disabilities

**Complex tables:**
- Multiple levels of headers or spanning cells
- More difficult to understand and use
- Should be avoided when possible
- Consider breaking into multiple simple tables or using alternative layouts (lists, cards)

#### When to Use

- **Tables**: Static information in tabular format (financial reports, schedules, structured data)
- **Grids**: Dynamic information in grid format (date pickers, interactive calendars, spreadsheets)

## Testing and Validation

After implementing accessibility features:

1. Test with keyboard-only navigation
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Verify color contrast ratios
4. Run automated tools like [Accessibility Insights](https://accessibilityinsights.io/)
5. Create Storybook stories demonstrating accessible behavior
6. Include accessibility scenarios in E2E tests

## ui-kit Specific Notes

- **Primary packages**: `packages/atomic`, `packages/quantic`, `packages/atomic-react`, `packages/atomic-angular`
- **Related instructions**: 
  - `.github/instructions/atomic.instructions.md` - Atomic component patterns
  - `.github/instructions/tests-atomic.instructions.md` - Testing patterns
  - `.github/instructions/playwright-typescript.instructions.md` - E2E testing
- **Existing agent**: `accessibility-v1.agent.md` includes Storybook integration for visual testing
- **Validation**: Use accessibility-v1 agent for comprehensive reviews with Storybook MCP tools

## Validation Checklist

Before completing, verify:
- [ ] Keyboard navigation works completely (no mouse required)
- [ ] Focus is visible on all interactive elements
- [ ] Color contrast meets WCAG 2.2 AA minimums
- [ ] Screen reader announces all relevant information
- [ ] ARIA attributes used correctly (or native HTML preferred)
- [ ] Forms have proper labels, validation, and error handling
- [ ] Images have appropriate alternative text or are marked decorative
- [ ] Page structure uses semantic HTML and landmarks
