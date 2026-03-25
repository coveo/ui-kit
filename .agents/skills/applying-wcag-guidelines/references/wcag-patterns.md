# WCAG 2.2 Level AA Patterns and Guidelines

This reference provides detailed implementation patterns for common UI components following WCAG 2.2 Level AA standards.

## Forms

### Labels and Required Fields

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

## Graphics and Images

### All Graphics Must Be Accounted For

Includes: `<img>` elements, `<svg>` elements, font icons, emojis

### All Graphics Must Have Correct Role

- `<img>` - inherent role, no attribute needed
- `<svg>` - add `role="img"` for better support
- Icon fonts/emojis - add `role="img"` on container (e.g., `<span>`)

### Alternative Text

**Determine if graphic is informative or decorative:**

- **Informative**: Conveys important information not found elsewhere
  - `<img>`: provide meaningful `alt` attribute
  - `role="img"`: provide `aria-label` or `aria-labelledby`
  - Keep concise but meaningful
  - Avoid `title` attribute for alt text
  
- **Decorative**: No important information, or information found elsewhere
  - `<img>`: use empty `alt=""` attribute
  - `role="img"`: use `aria-hidden="true"`

## Input and Control Labels

- All interactive elements must have visual labels
  - Links/buttons: inner text
  - Inputs: `<label>` element
- Labels must accurately describe control purpose
- `<label>` elements must have `for` attribute referencing control ID
- For repeated label text (e.g., multiple "remove" buttons): use `aria-label` for context (e.g., "Remove item X")
- Help text: associate with control via `aria-describedby`

## Navigation and Menus

### Example Structure

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

### Navigation Requirements

- Do NOT use `menu` or `menubar` roles for navigation menus (use for application-like action menus)
- Navigation should be `<nav>` containing `<ul>` with links
- Toggle `aria-expanded` when expanding/collapsing
- Use roving tabindex pattern for focus management
- Users tab to navigation, then arrow across main items
- Arrow down through submenus without tabbing
- Escape key closes expanded menus

## Page Title

- MUST be defined in `<title>` element in `<head>`
- MUST describe page purpose
- SHOULD be unique per page
- SHOULD front-load unique information
- SHOULD follow format: "[Unique page] - [Section] - [Site title]"

## Tables and Grids

### Column and Row Headers

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

### Grid Semantics

When using `role="grid"`, ensure proper structure:

- Grid cells must be nested within `role="row"` elements
- Rows must be nested within the grid container
- Use `role="columnheader"` for column headers
- Without proper nesting, header associations are not programmatically determinable

### Simple vs Complex Tables

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

### When to Use

- **Tables**: Static information in tabular format (financial reports, schedules, structured data)
- **Grids**: Dynamic information in grid format (date pickers, interactive calendars, spreadsheets)
