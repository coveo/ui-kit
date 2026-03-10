---
name: applying-wcag-guidelines
description: Applies WCAG 2.2 Level AA accessibility standards to UI components. Use when creating or modifying UI components, reviewing accessibility, or when users mention accessibility-related terms or concepts (e.g., WCAG, ARIA, a11y, screen readers, keyboard navigation, or contrast).
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Applying WCAG Guidelines

## Process

### Step 1: Plan for Accessibility

Before generating code:
- Reflect on WCAG 2.2 Level AA requirements
- Identify which persona-based guidelines apply (keyboard, screen reader, low vision, cognitive, voice)
- Plan semantic HTML structure and ARIA attributes

### Step 2: Implement Accessible Patterns

Apply appropriate patterns from this skill and [detailed patterns reference](references/wcag-patterns.md):

**Core requirements:**
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Ensure all interactive elements are keyboard navigable
- Provide text alternatives for non-text content
- Maintain sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- Never use color alone to convey information

**Common patterns:**
- Forms: labels, required indicators, error messages with `aria-invalid` and `aria-describedby`
- Images: `alt` text for informative images, `alt=""` for decorative
- Navigation: roving tabindex, `aria-expanded` for expandable menus
- Focus management: visible focus indicators, logical tab order, `tabindex="-1"` for programmatic focus

### Step 3: Review and Test

After generating code:
- Review against WCAG 2.2 checklist below
- Test keyboard navigation (Tab, Arrow, Enter, Escape)
- Verify focus indicators are visible
- Check color contrast ratios

### Step 4: Communicate Limitations

Inform users that code was built with accessibility in mind but should be reviewed and tested with tools like [Accessibility Insights](https://accessibilityinsights.io/).

## Guidelines by Persona

### Cognitive

- Use plain language
- Consistent page structure (landmarks)
- Navigation in same order across pages
- Clean, simple interface

### Keyboard

**Core requirements:**
- All interactive elements keyboard navigable in predictable order
- Visible focus indicators
- Static elements should NOT have `tabindex` (exception: `tabindex="-1"` for programmatic focus)
- Hidden elements not focusable
- Skip links for repeated content
- No keyboard traps

**Bypass blocks pattern:**

```html
<header>
  <a href="#maincontent" class="sr-only">Skip to main</a>
</header>
<nav><!-- nav --></nav>
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

**Keyboard commands:**
- `Tab` - Next interactive element
- `Arrow` - Navigate within components
- `Enter` - Activate control
- `Escape` - Close surfaces

**Composite component focus (grids, comboboxes, listboxes, menus, tabs):**

Use **roving tabindex** or **aria-activedescendant** to manage focus.

Roving tabindex algorithm:
1. Initial: Set `tabindex="0"` on initial element, `tabindex="-1"` on others
2. On arrow key: Update tabindex values and call `element.focus()`

Aria-activedescendant pattern:
- Container has `tabindex="0"` and `aria-activedescendant="IDREF"`
- CSS draws focus on referenced element
- Update `aria-activedescendant` on navigation

### Low Vision

- Dark text on light or light text on dark backgrounds
- Text contrast: 4.5:1 minimum (3:1 for large text ≥18.5px bold or ≥24px)
- Graphics and controls: 3:1 contrast for required parts
- Never use color alone - add text/shapes

### Screen Reader

- Elements convey semantics (name, role, value, states, properties)
- Use native HTML or appropriate ARIA
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- Headings: Logical hierarchy, one `<h1>` per page, avoid skipping levels

### Voice Access

- Accessible names contain visual labels (enables "Click \<label>" commands)
- Interactive elements have appropriate roles and keyboard behaviors

## Pattern-Specific Guidelines

For detailed implementation patterns, see [wcag-patterns.md](references/wcag-patterns.md):
- Forms (labels, validation, error messages)
- Graphics and images (alt text, decorative vs informative)
- Input labels (visual labels, aria-label for context)
- Navigation and menus (structure, roving tabindex)
- Page titles
- Tables and grids (headers, simple vs complex)

## Inclusive Language

- Use people-first language ("person using a screen reader" not "blind user")
- Avoid stereotypes or assumptions
- Include reasoning and references to standards
- Neutral, helpful, respectful tone

## Automated Validation

**Storybook automatically runs Axe-core accessibility checks** on all stories in the Atomic package:
- Configured in `packages/atomic/.storybook/preview.ts` with `a11y: {test: 'error'}`
- CI fails if any WCAG violations detected
- Axe-core checks 50+ rules including color contrast, ARIA attributes, keyboard accessibility, form labels, semantic HTML, and focus management
- Creates comprehensive coverage when components have stories for all states

**Best practice:** When creating or modifying components, ensure Storybook stories cover:
- All interactive states (enabled, disabled, focused, error)
- All visual variants (themes, sizes, layouts)
- Keyboard navigation scenarios
- This maximizes automated accessibility validation coverage

## Validation Checklist

Before completing:
- [ ] Keyboard navigation works (no mouse required)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets minimums
- [ ] Screen reader announces relevant information
- [ ] ARIA used correctly (or native HTML preferred)
- [ ] Forms have labels, validation, error handling
- [ ] Images have alt text or marked decorative
- [ ] Semantic HTML and landmarks used
