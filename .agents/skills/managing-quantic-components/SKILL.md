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
│   ├── fixture.ts
│   ├── pageObject.ts
│   └── quantic{ComponentName}.e2e.ts
└── templates/ (multi-template only)
    ├── {templateName}.html
    └── {templateName}.css
```

### Non-negotiable conventions

| Concern               | Rule                                                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Class base            | Always extends `LightningElement`                                                                                                                                                                                                                                       |
| Headless registration | `registerComponentForInit` in `connectedCallback`; `initializeWithHeadless` in `renderedCallback`                                                                                                                                                                       |
| `initialize` method   | Always an **arrow function** field — preserves `this` for the headless callback                                                                                                                                                                                         |
| Unsubscribe           | Always call `this.unsubscribe?.()` in `disconnectedCallback`                                                                                                                                                                                                            |
| Custom events         | Prefix with `quantic__` (e.g. `quantic__like`)                                                                                                                                                                                                                          |
| Labels                | Every user-visible string must be a localized label — never hardcode text. Import from `@salesforce/label/c.quantic_LabelName`; group into a `labels = {}` instance field                                                                                               |
| Label interpolation   | Use `I18nUtils.format(label, ...args)` for `{{0}}`/`{{1}}` placeholders — never `.replace()` or string concatenation                                                                                                                                                    |
| Labels with variables | Treat a label as count-sensitive whenever a numeric value can change the surrounding sentence grammatically or orthographically in English, French, or Spanish, even if the variable is not itself a noun count                                                         |
| Label pluralization   | For count-sensitive labels, test `0`, `1`, and a value greater than `1`; if the sentence changes, define `_plural` and `_zero` variants and use `I18nUtils.getLabelNameWithCount(baseName, count)`                                                                      |
| Label translations    | Every new label **must** have a translation entry added to both `force-app/main/translations/fr.translation-meta.xml` and `es.translation-meta.xml`                                                                                                                     |
| Error handling        | `hasInitializationError` flag + `<c-quantic-component-error>` in template                                                                                                                                                                                               |
| CSS naming            | BEM-like with component prefix: `.generated-answer__card-header--collapsed`                                                                                                                                                                                             |
| SLDS tokens           | Use `var(--lwc-*)` design tokens; **always use SLDS utility classes first — for every style need, ask yourself whether an SLDS class covers it before writing a single line of custom CSS**. Custom CSS is only permitted when no SLDS class achieves the needed result |
| Meta XML              | `isExposed: false`; no `targets` or `targetConfigs`; **always generated via `sf lightning generate component`** — never created manually (manual creation risks using a stale `apiVersion`)                                                                             |
| `render()`            | Only for multi-template components; always the **last method** in the class                                                                                                                                                                                             |
| Property validation   | Use `getBueno(this)` from `c/quanticHeadlessLoader` to validate user-supplied `@api` props (strings, numbers). Log via `console.error` with `this.template.host.localName` and call `this.setInitializationError()` on failure                                          |
| `@api` getter/setter  | When an `@api` prop needs validation or side-effects, use a getter/setter pair with a `_`-prefixed backing field (e.g. `_isCollapsed`)                                                                                                                                  |
| `registerToStore`     | Facet components must register themselves in the global store via `registerToStore(this.engineId, Store.facetTypes.FACETS, { label, facetId, element: this.template.host })` inside `initialize`                                                                        |
| `static attributes`   | Facet components declare `static attributes = [...]` listing all `@api` property names for runtime discovery                                                                                                                                                            |
| AriaLiveRegion        | Components that announce status changes (results loaded, errors, etc.) must create an `AriaLiveRegion` from `c/quanticUtils` and dispatch messages on state updates                                                                                                     |
| Event `composed`      | Events that must cross shadow DOM boundaries (e.g. `quantic__renderfacet` consumed by a parent interface) need both `bubbles: true` and `composed: true`. Events staying within the immediate component tree need only `bubbles: true`                                  |
| Template conditionals | Always use `lwc:if` / `lwc:elseif` / `lwc:else` — never the legacy `if:true` / `if:false` directives                                                                                                                                                                    |
| Comments              | Avoid comments in all files (JS, HTML, CSS). Write self-explanatory code instead. Comments are only acceptable when logic is genuinely non-obvious and cannot be clarified through naming or structure                                                                  |
| Constants             | Extract magic strings and numbers into named constants at the top of the file                                                                                                                                                                                           |

### Ordering conventions

Follow this canonical ordering within a component file:

```
1. Imports: @salesforce/label → third-party modules → c/ modules
2. Constants (named, extracted magic values)
3. @typedef JSDoc comments
4. Class declaration (with class-level JSDoc)
5. static attributes = [...] (facets only)
6. @api properties (public surface)
7. Tracked/reactive private fields
8. labels = {} instance field
9. Non-reactive private fields (state, unsubscribe, controller refs)
10. Lifecycle hooks: connectedCallback → renderedCallback → disconnectedCallback
11. initialize = (engine) => { ... }
12. State updaters: updateState, updateSearchStatusState, etc.
13. Computed getters
14. Event handlers (arrow functions)
15. Private helper methods
16. render() (multi-template components only — always last)
```

When a peer component closely matches your use case, also inspect its structure for nuances not captured above.

### Documentation Requirements

Quantic reference docs are generated from component JSDoc. Every component class and `@api` property must be documented. See the full rules, valid categories, and code templates in **Section 8** of `references/docs-accessibility-testing.md`.

### Testing Strategy

Follow the package split:

- Jest unit tests verify isolated component behavior, rendering, lifecycle, and Headless interactions with mocks
- Playwright E2E tests verify real user workflows, analytics, API interactions, accessibility flows, and Salesforce integration behavior

Do not duplicate upstream Headless coverage unless the Quantic component adds behavior on top.

### Working Workflow

1. Inspect the target component folder and a similar existing Quantic component before editing.
2. Keep changes inside `packages/quantic/force-app/main/default/lwc` unless the request also needs examples, community pages, or tests.
3. If the change needs E2E coverage, update or add the matching example-community component and route assets as needed.
4. **Before writing any CSS:** go through every style need and verify whether an SLDS utility class satisfies it. Only write custom CSS for styles that SLDS cannot achieve. When replicating a component from another library (e.g. Atomic), do not port its custom CSS directly — re-implement the layout and styling using SLDS classes.
5. Update JSDoc and metadata consistently with the component's public surface.
6. Run `pnpm run lint:fix` from `packages/quantic` before considering the work done.
7. Run targeted Quantic tests first, then broader checks only if needed.
8. **Run the Definition of Done checklist below before marking the task complete.**

---

## Definition of Done

Before marking any task as complete, verify every applicable item and output this table:

| Check                                                                                                                      | Status    |
| -------------------------------------------------------------------------------------------------------------------------- | --------- |
| No hardcoded strings                                                                                                       | ✅/❌     |
| Labels defined + translated (FR + ES)                                                                                      | ✅/❌     |
| Placeholder labels use I18nUtils.format                                                                                    | ✅/❌/N/A |
| Labels with variables tested with `0`, `1`, and `>1` — add `_plural`/`_zero` variants if sentence changes in EN, FR, or ES | ✅/❌/N/A |
| sf command used; apiVersion correct                                                                                        | ✅/❌     |
| isExposed false, no targets                                                                                                | ✅/❌     |
| Component class JSDoc complete                                                                                             | ✅/❌     |
| All @api props documented                                                                                                  | ✅/❌     |
| @example reflects actual API                                                                                               | ✅/❌     |
| Headless lifecycle correct                                                                                                 | ✅/❌/N/A |
| Error handling present                                                                                                     | ✅/❌/N/A |
| No `if:true` / `if:false` directives used                                                                                  | ✅/❌/N/A |

**Result: PASS / FAIL** — Failing items: <list ❌ items with required fix>

## Progressive Disclosure

**For reading, debugging, or light edits** the Quick Reference above is sufficient.

**For creating, implementing, or substantially modifying a component**, load the relevant workflow guides before writing any code:

- [headless-and-lifecycle.md](references/headless-and-lifecycle.md) — Scaffolding, headless lifecycle, error handling, property validation (Bueno), store registration, shared utilities
- [ui-patterns.md](references/ui-patterns.md) — Label management, template directives, CSS patterns, event dispatch/listening, multi-template rendering
- [docs-accessibility-testing.md](references/docs-accessibility-testing.md) — JSDoc documentation requirements, AriaLiveRegion accessibility, testing strategy
