# KIT-5718: Enable commit artifacts + private + preview pointer automation (prd)

**Jira**: [KIT-5718](https://coveord.atlassian.net/browse/KIT-5718)  
**Repository**: `coveo-platform/ui-kit-cd`  
**Deployment Pipeline**: Coveo deployment configs

## Problem

Phase 1 of the CDN production migration requires deploying three deployment configs from `dev` to `prd` environment:

1. **commit.json** - Enable automatic upload of commit artifacts to S3 (staticprd)
2. **private.json** - Enable automatic update of `private/vX/` pointers on every merge to main
3. **preview.json** - Enable manual promotion to `preview/vX/` pointers via deployment hook

These configs have been tested in dev and need to be promoted to production together.

## Action Required

In the Coveo deployment pipeline (via `coveo-platform/ui-kit-cd`):

1. **Promote** the following deployment configs from `dev` → `prd`:
   - `commit.json`
   - `private.json`
   - `preview.json`

2. **Validate** that all three configs are active in the prd environment

3. **Verify** the pipeline flow:
   - Commit artifacts upload to `staticprd` S3 on every merge
   - Private pointers update automatically after commit upload
   - Preview pointer promotion is available via deployment hook

## Impact

- ✅ No public traffic affected (only internal `private/` and `preview/` channels)
- ✅ Enables full validation pipeline in production before switching public consumers
- ✅ Unblocks Phase 2: Internal sites migration to preview pointers (KIT-5716)

## Supersedes

This ticket consolidates and replaces:
- KIT-5607 (commit artifacts prd)
- KIT-5645 (private pointers prd)
- KIT-5714 (preview pointers prd)

All three are deployed together as Phase 1 of the production migration.

## Related PRs

- Private pointers (dev): (KIT-5645 PR)
- Hotfix workflow: (KIT-5700)
