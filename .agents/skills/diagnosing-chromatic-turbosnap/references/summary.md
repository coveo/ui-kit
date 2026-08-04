# TurboSnap Bailout Compendium

## Scope

This compendium covers the 25 `changedStorybookFiles` rows in the August 2026 usage export: builds 1498 through 1572. See [the first report](builds-1498-1525.md) and [the second report](builds-1547-1572.md) for every build chain.

## Findings

- 25 reported rows map to 24 distinct commits and 23 Actions runs.
- Three rows are merge-queue `chromatic --skip` invocations: 1503, 1508, and 1510. Their CLI logs show `Skipping build`, so they did not build Storybook or execute a TurboSnap trace.
- Builds 1547 and 1548 share commit `11c496e` and one Actions job. The job initialized build 1548; GitHub retains one published Storybook status for that pair.
- The remaining 21 real Chromatic executions all bailed because a global Storybook input was in the changed range:
  - `packages/atomic/.storybook/main.ts`: 9 builds
  - `packages/atomic/.storybook/preview.ts`: 9 builds
  - `packages/atomic/.storybook/Introduction.mdx`: 3 builds
- 17 of those 21 real executions report `Missing commit detected`. TurboSnap then falls back to an older build and expands its Git range across the global Storybook input.

## Recurring ancestry chains

`renovate/dev` forms a self-propagating preview-file sequence:

```text
#1500 preview.ts
#1511 missing #1500 → preview.ts
#1525 missing #1511 → preview.ts
#1560 missing #1525 → preview.ts
#1568 missing #1560 → preview.ts
#1572 missing #1568 → preview.ts
```

`KIT-5975-promote-exact-same-to-catalog` has a similar sequence:

```text
#1548 preview.ts
#1551 missing #1548 → preview.ts
#1556 missing #1551 → preview.ts
```

## Operational conclusions

1. A direct change to a Storybook config or global Storybook document legitimately requires a full rebuild. Do not mark those paths `untraced` only to reduce cost.
2. Missing ancestry is the dominant multiplier. It turns old global Storybook changes into repeated full rebuilds on unrelated branches.
3. `chromatic --skip` must remain on merge-group events because it publishes the required `UI Tests` and `UI Review` statuses. Treat its rows separately from actual visual captures.
4. A status-preserving remedy must prevent skipped or rewritten builds from being selected as TurboSnap ancestors. Validate that behavior with Chromatic before changing the merge-group invocation.

## Access caveat

Every `/.chromatic/` URL in the reports came from the commit's `Storybook Publish` status. It can require Chromatic collaborator access, so a missing page in an unauthenticated environment does not invalidate the URL.
