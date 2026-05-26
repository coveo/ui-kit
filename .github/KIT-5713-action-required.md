# KIT-5713: Remove workflow_dispatch trigger from update-cdn-pointers.yml

**Jira**: [KIT-5713](https://coveord.atlassian.net/browse/KIT-5713)  
**Repository**: `coveo-platform/ui-kit-cd`  
**File**: `.github/workflows/update-cdn-pointers.yml`

## Problem

The `update-cdn-pointers.yml` workflow in `coveo-platform/ui-kit-cd` still has a `workflow_dispatch` trigger that was useful during development/testing but is no longer needed now that the hotfix workflow (KIT-5700) is in place.

The pointer update workflow should only be triggered via `repository_dispatch` from `coveo/ui-kit` (either from `cd.yml` or `hotfix.yml`). The manual `workflow_dispatch` trigger should be removed to avoid accidental manual runs that could update CDN pointers outside the proper flow.

## Action Required

In `coveo-platform/ui-kit-cd`:

1. Open `.github/workflows/update-cdn-pointers.yml`
2. Remove the `workflow_dispatch` section (~9 lines)
3. The workflow should only have the `repository_dispatch` trigger

## Expected Result

The workflow trigger section should look like:

```yaml
on:
  repository_dispatch:
    types: [update-cdn-pointers]
```

Without any `workflow_dispatch` section.
