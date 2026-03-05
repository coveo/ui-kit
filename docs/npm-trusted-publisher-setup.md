# NPM Trusted Publisher Setup

## Overview

This document describes the implementation of npm trusted publishing for ui-kit, replacing long-lived `NPM_TOKEN` secrets with OIDC-based authentication.

## Benefits

- **Enhanced security**: Short-lived, workflow-specific credentials that cannot be extracted or reused
- **No token rotation**: Eliminates manual token management
- **Automatic provenance**: Cryptographic proof of package origin and build process
- **Reduced risk**: No long-lived tokens that can be accidentally exposed in logs

## Requirements

- npm CLI 11.5.1+ / Node.js 22.14.0+
- Public repository (for provenance attestations)
- Admin access to packages on npmjs.com

## Packages Requiring Configuration

The following 15 @coveo packages need individual trusted publisher setup on npmjs.com:

1. @coveo/atomic
2. @coveo/atomic-angular
3. @coveo/atomic-hosted-page
4. @coveo/atomic-legacy
5. @coveo/atomic-react
6. @coveo/auth
7. @coveo/bueno
8. @coveo/create-atomic
9. @coveo/create-atomic-component
10. @coveo/create-atomic-component-project
11. @coveo/create-atomic-result-component
12. @coveo/create-atomic-rollup-plugin
13. @coveo/headless
14. @coveo/headless-react
15. @coveo/quantic
16. @coveo/shopify

## Implementation Status

### ✅ Completed
- Workflow updated with OIDC permissions
- `NODE_AUTH_TOKEN` removed from publish jobs
- Documentation created

### ⏳ Pending (Requires Admin Access)
- Configure trusted publisher for all 15 packages on npmjs.com
- Test with manual workflow dispatch
- Keep `NPM_TOKEN` secret (required for `npm dist-tag` in npm-prod job)
- Optionally restrict token access after verification (but keep write access for dist-tag)
- Consider using a granular access token with minimal permissions (publish + tag management)

## Setup Process

### 1. Configure Each Package on npmjs.com

For each package listed above:

1. Navigate to https://www.npmjs.com/package/PACKAGE_NAME
2. Go to Settings → Trusted Publisher
3. Click "GitHub Actions"
4. Configure:
   - **Organization or user**: `coveo`
   - **Repository**: `ui-kit`
   - **Workflow filename**: `cd.yml`
   - **Environment name**: Leave blank (or specify `Release` if you want to restrict to that environment)

### 2. Workflow Changes

The workflow has been updated to:
- Add `id-token: write` permission comments for clarity
- Remove `NODE_AUTH_TOKEN` environment variables from publish jobs

The npm CLI automatically detects OIDC environments and uses them for authentication.

## Important Notes

## Important Limitations

### OIDC Only Works for `npm publish`

**Critical**: npm trusted publishing (OIDC) only supports `npm publish` commands. It does **NOT** support:
- `npm dist-tag add/rm` 
- `npm deprecate`
- `npm unpublish`
- `npm access`
- Other registry management commands

This means:
- ✅ `release` job: Uses OIDC for publishing packages
- ❌ `npm-prod` job: Still requires `NPM_TOKEN` for `npm dist-tag add` to promote packages to `latest`

### Read-Only Token (Currently Not Needed)

The ui-kit repository currently does **not** require `NPM_TOKEN` for `pnpm install` because:
- All @coveo dependencies are workspace packages
- No private npm packages are used as dependencies

If private npm dependencies are added in the future:
- Add `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` to the setup step
- Use a granular access token with read-only permissions

### Provenance Generation

When publishing via trusted publishing:
- Provenance attestations are automatically generated
- No need to add `--provenance` flag
- Only works for public packages from public repositories

### Migration Steps

1. ✅ Update workflow to add OIDC permissions
2. ⏳ Configure trusted publisher for all 15 packages on npmjs.com (requires admin access)
3. ⏳ Test with a manual workflow dispatch
4. ⏳ After verification, optionally restrict token access:
   - Navigate to each package Settings → Publishing access
   - Select "Require two-factor authentication and disallow tokens"
5. ⏳ Revoke old automation tokens that are no longer needed

## Troubleshooting

### Authentication Errors

If you see "Unable to authenticate" errors:
- Verify workflow filename matches exactly (`cd.yml`)
- Ensure `id-token: write` permission is set
- Confirm trusted publisher is configured for the specific package
- Check that you're using GitHub-hosted runners (not self-hosted)

### Private Dependencies

If `pnpm install` fails with authentication errors:
- Ensure `NPM_TOKEN` secret contains a valid read-only token
- The token is only needed for installing dependencies, not publishing

## References

- [npm Trusted Publishers documentation](https://docs.npmjs.com/trusted-publishers)
- [GitHub Actions OIDC documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Phase 0 Plan](https://github.com/coveo/ui-kit-release-lab/blob/main/docs/08-Phase0-Preparation.md)
