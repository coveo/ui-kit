# Upgrade guide entry

The v3 to v4 guides follow the v2 to v3 guide (`packages/headless/source_docs/upgrade-from-v2-to-v3.md`): headings by theme, a version block before and after, one sentence on what to do instead.

## Where an entry goes

| Package                                    | File                                                              | Section                                                    |
| ------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `@coveo/headless`                          | `packages/headless/source_docs/upgrade-from-v3-to-v4.md`          | Requirements, Modified behaviors, Removals, Server-side rendering |
| `@coveo/headless-react`                    | `packages/headless-react/source_docs/upgrade-from-v3-to-v4.md`    | Same sections, React wrappers                              |
| `@coveo/atomic`, `@coveo/atomic-react`, `@coveo/atomic-angular` | `packages/atomic/docs/upgrade-from-v3-to-v4.md` | Same sections, plus CDN and Angular                        |

## Entry template

````markdown
### `<member>` <!-- KIT-#### -->

<One sentence: what changed and why it changed.>

**Version 3**

```ts
// from samples/<v3 sample>/<file>
<the v3 code a customer wrote>
```

**Version 4**

```ts
// from samples/<v4 sample>/<file>
<the v4 code that replaces it>
```

<One or two sentences on what to do instead, with a link to the reference page when one exists.>
````

Rules:

- The heading is the member or behaviour a customer searches for, as they wrote it in v3.
- Both code blocks come from a sample that compiles and runs; name the sample file in the first comment line. When the v4 sample does not exist yet, write the block against the decided shape and add `<!-- decided YYYY-MM-DD, not yet built -->` after the heading; remove the marker when the sample lands.
- Prose stays under 15 lines per entry. Details go to the reference docs, not to the guide.
- Never name an experimental entry point. Write the v4 path customers will use.
- Link the Jira issue in an HTML comment on the heading, so the guide stays readable and the history stays traceable.

## Removals table

Every file ends with one table that the technical writers and the API-surface check read:

```markdown
| Removed in v4                     | Use instead                                  | Deprecated since |
| --------------------------------- | -------------------------------------------- | ---------------- |
| `recommendationEngineDefinition`  | `recommendations` option of `fetchStaticState()` | not deprecated, experimental sub-package |
| `setNavigatorContextProvider()`   | `navigatorContext` passed to `fetchStaticState()` | 3.47.0           |
```

One row per removed export, in the order the exports appear in the package entry point. "Deprecated since" is the v3 minor that shipped the notice; experimental members that never had one say so.

## Filled example

### `recommendationEngineDefinition` <!-- KIT-6384 -->

Recommendation slots are requested from any engine definition, so a page with slots needs one fetch and one provider instead of a second engine with its own copy of the cart and the context.

**Version 3**

```ts
// from samples/headless-ssr/commerce-nextjs/app/(listing)/[category]/page.tsx
const staticState = await listingEngineDefinition.fetchStaticState({...});
const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
  recommendations: ['popularBought', 'popularViewed'],
  ...
});
```

**Version 4**

```ts
// from samples/headless-ssr/commerce-nextjs-v4/app/(listing)/[category]/page.tsx
const staticState = await listingEngineDefinition.fetchStaticState({
  recommendations: ['popularBought', 'popularViewed'],
  ...
});
```

List the slots to request in `recommendations`, pass `productId` to seed them, and render the recommendation components inside the page's own provider.
