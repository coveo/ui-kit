---
name: managing-quantic-components
description: Provides conventions, patterns, and workflow guidance for Quantic Salesforce Lightning Web Components and associated files within packages/quantic. Use when creating, modifying, analyzing, debugging, or reviewing Quantic components, or when the user mentions LWC, Lightning, Salesforce, Quantic components, SLDS, or headless integration in the Quantic package.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

# Managing Quantic Components

Quantic components are LWC (Lightning Web Components) that integrate with a headless search engine via `c/quanticHeadlessLoader`. Every component lives under `packages/quantic/` and follows strict structural and naming conventions.

## Package Locations

Production components live in:
```
packages/quantic/force-app/main/default/lwc/<component-name>/
```

Example-community components live in:
```
packages/quantic/force-app/examples/main/lwc/<example-component-name>/
```

Use example components when a component needs an interactive example page or E2E harness in the Quantic Examples community.

## Quick Reference

### Directory layout

```
quantic{ComponentName}/
├── quantic{ComponentName}.js          # Main component class
├── quantic{ComponentName}.html        # Template (single-template components)
├── quantic{ComponentName}.css         # Styles (optional; prefer SLDS classes)
├── quantic{ComponentName}.js-meta.xml # Salesforce metadata
├── __tests__/
│   └── quantic{ComponentName}.test.js
├── e2e/ (optional)
│   └── quantic{ComponentName}.e2e.ts
└── templates/ (multi-template only)
    ├── {templateName}.html
    └── {templateName}.css
```

### Non-negotiable conventions

| Concern | Rule |
|---|---|
| Class base | Always extends `LightningElement` |
| Headless registration | `registerComponentForInit` in `connectedCallback`; `initializeWithHeadless` in `renderedCallback` |
| `initialize` method | Always an **arrow function** field — preserves `this` for the headless callback |
| Unsubscribe | Always call `this.unsubscribe?.()` in `disconnectedCallback` |
| Custom events | Prefix with `quantic__` (e.g. `quantic__like`) |
| Labels | Every user-visible string must be a localized label — never hardcode text. Import from `@salesforce/label/c.quantic_LabelName`; group into a `labels = {}` instance field |
| Label interpolation | Use `I18nUtils.format(label, ...args)` for `{{0}}`/`{{1}}` placeholders — never `.replace()` or string concatenation |
| Label pluralization | For count-sensitive labels, define `_plural` and `_zero` variants and use `I18nUtils.getLabelNameWithCount(baseName, count)` to select the right one |
| Label translations | Every new label **must** have a translation entry added to both `force-app/main/translations/fr.translation-meta.xml` and `es.translation-meta.xml` |
| Error handling | `hasInitializationError` flag + `<c-quantic-component-error>` in template |
| CSS naming | BEM-like with component prefix: `.generated-answer__card-header--collapsed` |
| SLDS tokens | Use `var(--lwc-*)` design tokens; always use SLDS utility classes first — write custom CSS only when no SLDS class achieves the needed result |
| Meta XML | `isExposed: false`; no `targets` or `targetConfigs`; **always generated via `sf lightning generate component`** — never created manually (manual creation risks using a stale `apiVersion`) |
| `render()` | Only for multi-template components; always the **last method** in the class |
| Comments | Avoid code comments — write simple, self-explanatory code instead. Comments are acceptable only when the logic is genuinely non-obvious and cannot be clarified through naming or structure |
| Constants | Extract magic strings and numbers into named constants at the top of the file |

### Field declaration order

1. `@api` public properties (required → optional → getter/setter with validation)
2. `labels` object
3. `@track state` (only needed for objects/arrays; primitives are reactive by default in modern LWC)
4. Regular instance fields (controllers → state snapshots → unsubscribe functions → `headless` reference → flags)

### Method declaration order

1. Lifecycle hooks: `connectedCallback` → `renderedCallback` → `disconnectedCallback`
2. `initialize` arrow function
3. State updaters: `updateState`, `updateSearchStatusState`, …
4. Event handlers (arrow functions for `addEventListener`; regular methods for template handlers)
5. Computed getters: `get shouldDisplayX()`, `get isX()`
6. `render()` (multi-template only — always last)

### Documentation Requirements

Quantic reference docs are generated from component JSDoc. Every component class and `@api` property must be documented. See the full rules, valid categories, and code templates in **Section 10** of `references/quantic-component-workflow.md`.

### Testing Strategy

Follow the package split:

- Jest unit tests verify isolated component behavior, rendering, lifecycle, and Headless interactions with mocks
- Playwright E2E tests verify real user workflows, analytics, API interactions, accessibility flows, and Salesforce integration behavior

Do not duplicate upstream Headless coverage unless the Quantic component adds behavior on top.

### Working Workflow

1. Inspect the target component folder and a similar existing Quantic component before editing.
2. Keep changes inside `packages/quantic/force-app/main/default/lwc` unless the request also needs examples, community pages, or tests.
3. If the change needs E2E coverage, update or add the matching example-community component and route assets as needed.
4. Update JSDoc and metadata consistently with the component’s public surface.
5. Run `pnpm run lint:fix` from `packages/quantic` before considering the work done.
6. Run targeted Quantic tests first, then broader checks only if needed.
7. **Run the Definition of Done checklist below before marking the task complete.**

---

## Definition of Done

Before marking any task as complete, verify every applicable item and output this table:

```
| Check | Status | Notes |
|---|---|---|
| No hardcoded strings | ✅/❌ | |
| Labels defined + translated (FR + ES) | ✅/❌ | |
| Placeholder labels use I18nUtils.format | ✅/❌/N/A | |
| Count-sensitive label variants (_plural/_zero) | ✅/❌/N/A | |
| sf command used; apiVersion correct | ✅/❌ | |
| isExposed false, no targets | ✅/❌ | |
| Component class JSDoc complete | ✅/❌ | |
| All @api props documented | ✅/❌ | |
| @example reflects actual API | ✅/❌ | |
| Field/method order correct | ✅/❌ | |
| Headless lifecycle correct | ✅/❌/N/A | |
| Error handling present | ✅/❌/N/A | |

**Result: PASS / FAIL** — Failing items: <list ❌ items with required fix>
```



## Progressive Disclosure

**For reading, debugging, or light edits** the Quick Reference above is sufficient.

**For creating, implementing, or substantially modifying a component**, load the full workflow guide before writing any code:

- [quantic-component-workflow.md](references/quantic-component-workflow.md) 

It covers: complete headless lifecycle patterns, label management, template directives, slot detection, CSS patterns, event dispatch/listening, multi-template rendering, unit test setup, shared utilities, and documentation requirements.
