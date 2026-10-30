# Upgrade guide entry

The v3 to v4 guides follow the v2 to v3 guide (`packages/headless/source_docs/upgrade-from-v2-to-v3.md`): sections by kind of change, headings by theme, a version block before and after, one sentence on what to do instead.

## Where an entry goes

| Package                                                         | File                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `@coveo/headless`                                               | `packages/headless/source_docs/upgrade-from-v3-to-v4.md`       |
| `@coveo/headless-react`                                         | `packages/headless-react/source_docs/upgrade-from-v3-to-v4.md` |
| `@coveo/atomic`, `@coveo/atomic-react`, `@coveo/atomic-angular` | `packages/atomic/docs/upgrade-from-v3-to-v4.md`                |

Each file has three sections: `## Requirements`, `## Modified behaviors` and `## Removals`. Inside a section, changes sit under a theme heading such as `### Server-side rendering`; add the theme when it is missing. A changed behaviour or a replaced API gets an entry under `## Modified behaviors`. A removed member gets a row in the removals table of its theme, plus an entry when the replacement needs code to explain.

## Entry template

````markdown
#### <Member or behaviour> <!-- KIT-#### -->

<One sentence: what changed and why it changed.>

**Headless Version 3**

```ts
<the v3 code a customer wrote>
```

**Headless Version 4**

```ts
<the v4 code that replaces it>
```

<One or two sentences on what to do instead, with a link to the reference page when one exists.>
````

Rules:

- The heading names the member or behaviour as a customer searches for it in v3, one level below its theme.
- The labels name the package line: **Headless Version 3** and **Headless Version 4** in the Headless and Headless React guides, **Atomic Version 3** and **Atomic Version 4** in the Atomic notes.
- Take both code blocks from a sample that compiles and runs, trimmed to the lines that change, and name the sample files in the pull request description. When the v4 sample does not exist yet, write the block against the decided shape and put `<!-- decided YYYY-MM-DD, not yet built -->` on the line under the heading; remove the marker when the sample lands.
- Prose stays under 15 lines per entry. Details go to the reference docs.
- Write the v4 path customers will use. Experimental entry points stay out of the guide.
- Link the Jira issue in an HTML comment on the heading, so the guide stays readable and the history stays traceable.

## Removals table

Each theme under `## Removals` ends with one table. The technical writers read it, and so will the planned API-surface check (a diff of the published v3 exports against the v4 line, not built yet).

```markdown
### Server-side rendering

| Removed                                                                                                              | Replacement                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `recommendationEngineDefinition`, `SolutionType.recommendation` and the `enabled` prop of recommendation controllers | `recommendations` and `productId` options of the listing, search and standalone definitions |
| `listing` and `search` options of the commerce definers                                                              | None: controllers are built for both search and listing pages                               |
```

Group members that leave together in one row. When nothing replaces a member, write "None:" and the reason. A row that is decided but not built carries the same marker as an entry, at the end of its "Replacement" cell.

## Filled example

Based on the recommendations entry of `packages/headless/source_docs/upgrade-from-v3-to-v4.md`, taken from the listing pages of the `samples/headless-ssr/commerce-nextjs` and `samples/headless-ssr/commerce-nextjs-v4` samples:

````markdown
#### Recommendations <!-- KIT-6384 -->

Recommendation slots are requested through the `recommendations` option of any definition and seeded with `productId`, and `recommendationEngineDefinition` is removed.

**Headless Version 3**

```ts
const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
  navigatorContext: navigatorContext.marshal,
  controllers: {
    popularBought: {enabled: true},
    popularViewed: {enabled: true},
    cart: {initialState: {items}},
    context: {/* ...language, country, currency, view */},
  },
});
```

**Headless Version 4**

```ts
const staticState = await listingEngineDefinition.fetchStaticState({
  navigatorContext,
  context,
  cart: {items},
  recommendations: ['popularBought', 'popularViewed'],
});
```

List the slots to request in `recommendations`, pass `productId` on a product page to seed them, and render the recommendation components inside the page's own provider.
````
