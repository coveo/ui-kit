---
applyTo: 'packages/headless/**,samples/headless/**,packages/documentation/**'
---

# Headless

**Every public export must have complete JSDoc documentation.** This includes `build*` functions, controller interfaces, state interfaces, and all their members. An undocumented or partially documented public API is a blocking issue.

## API Documentation Requirements

### Build Functions

Every `build*` factory function must include:

- A description starting with `Creates a \`ControllerName\` controller instance.`
- `@param engine - The headless engine.`
- `@param props - The configurable \`ControllerName\` properties.` (when applicable)
- `@returns A \`ControllerName\` controller instance.`
- `@group Controllers`
- `@category ControllerName`

```typescript
/**
 * Creates a `SearchBox` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 *
 * @group Controllers
 * @category SearchBox
 */
export function buildSearchBox(
  engine: SearchEngine,
  props?: SearchBoxProps
): SearchBox {
```

### Controller Interfaces

Every public controller interface must include:

- A description explaining what the controller offers and when to use it.
- An `Example:` link to a sample file (markdown format, not `@example` tag).
- `@group Controllers` and `@category ControllerName`.

```typescript
/**
 * The `SearchBox` headless controller offers a high-level interface for
 * designing a common search box UI controller with
 * [highlighting for query suggestions](https://docs.coveo.com/en/headless/latest/usage/highlighting/).
 *
 * Example: [search-box.fn.tsx](https://github.com/coveo/ui-kit/blob/master/packages/samples/headless-react/src/components/search-box/search-box.fn.tsx)
 *
 * @group Controllers
 * @category SearchBox
 */
export interface SearchBox extends Controller {
```

### Controller Interface Methods

Every method on a controller interface must have:

- A description of what the method does.
- `@param` tags with dash separator for each parameter.

```typescript
/**
 * Updates the search box text value and shows the suggestions for that value.
 *
 * @param value - The string value to update the search box with.
 */
updateText(value: string): void;
```

### State Interface Properties

Every property on a state interface must have a single-line JSDoc description:

```typescript
export interface SearchBoxState {
  /** The current query in the search box. */
  value: string;
  /** The query suggestions for the search box value. */
  suggestions: Suggestion[];
  /** Whether a search request is in progress. */
  isLoading: boolean;
}
```

### JSDoc Conventions

- Use `@param name - Description` (dash separator, not colon).
- Link examples as markdown (`Example: [file.tsx](url)`), not with `@example` blocks.
- Use `@group Controllers` and `@category {Name}` for TypeDoc grouping on every public interface and build function.
- Keep descriptions concise: one sentence for properties, one paragraph for interfaces/functions.
- Do not expose internal implementation details in public JSDoc.

## Documentation-Relevant Change Classification

When modifying files under `packages/headless/src/`, classify the change:

| Classification | Criteria | Documentation action |
|---|---|---|
| **No public API change** | Internal refactors, private utilities, test-only changes | No documentation update required |
| **Additive API change** | New exports, new controller methods, new state properties | JSDoc required on new symbols; update relevant `source_docs/` articles and samples |
| **API modification** | Changed signatures, renamed parameters, changed return types | Update all JSDoc, `source_docs/` articles, and samples referencing the changed API |
| **Breaking change** | Removed exports, incompatible signature changes | Update all docs; add migration notes in the relevant `upgrade-from-*` article |

## Usage Articles (`source_docs/`)

The `packages/headless/source_docs/` directory contains usage articles published to docs.coveo.com. When public API changes:

- **Verify** that code examples in articles reflect current API signatures.
- **Remove** references to renamed or deleted APIs.
- **Update** example snippets to match current exported API shapes.
- **Flag** articles that reference controllers or options that no longer exist.

Do not modify the prose style of existing articles unless fixing a factual error introduced by an API change.

### Reviewing PRs for documentation drift

When reviewing a PR that modifies public API, check whether `source_docs/` articles, `samples/headless/` code, or other related files reference the changed API — even if those files are not part of the diff. If a stale reference is found in a file that was **not modified in the PR**, post the finding as a **general PR comment** (not an inline file comment), since GitHub only allows inline comments on files included in the diff. The comment should identify the file, line, and the specific stale reference that needs updating.

## Samples (`samples/headless/`)

The `samples/headless/` directory contains runnable sample projects. When public API changes:

- **Verify** that samples use current API signatures.
- **Remove** references to renamed or deleted APIs.
- **Align** sample configurations with current controller options.
- **Provide** specific suggested updates when sample drift is detected.

## Documentation Style

When writing or reviewing documentation files:

- Use plain-language explanations accessible to developers unfamiliar with the codebase.
- Do not include implementation details (internal state shape, reducer logic) in public docs.
- Structure headings logically — group related concepts, avoid deeply nested headings.
- Keep paragraphs focused — split dense paragraphs that cover multiple concepts.
- Prefer concrete examples over abstract descriptions.

## References

- [general.instructions.md](general.instructions.md) — Core documentation principles (hierarchy: headless-specific rules here override general rules)
- [general.typescript.instructions.md](general.typescript.instructions.md) — TypeScript conventions
- [packages/headless/source_docs/](../../packages/headless/source_docs/) — Usage articles
- [samples/headless/](../../samples/headless/) — Sample projects
