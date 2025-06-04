# Release Process Gotchas

## Critical Points in Release Process

### Branch Locking Mechanism

**What**: The main branch is automatically locked during releases to prevent concurrent changes.
**Why**: Release process creates commits on master, needs exclusive access.
**How**: `RELEASE_FREEZE_ID` ruleset (ID: 215874) temporarily restricts write access to release bot only.

**Gotcha**: If release fails mid-process, branch may remain locked.
**Recovery**:

```bash
# Manual unlock (requires admin access)
node utils/ci/lock-master.mjs
```

### Two-Phase Release System

**Pre-Release (Every Commit)**:

- Does NOT modify master branch
- Creates pre-release versions for testing
- Safe to run multiple times
- No version commits or tags

**Scheduled Release (Manual/Scheduled)**:

- DOES modify master branch
- Creates official version tags
- Updates changelogs
- Publishes to npm/CDN

**Gotcha**: Running scheduled release during active development can create conflicts.

### Package Interdependencies

**Critical Order**:

```
Bueno → Headless → Atomic/Quantic → Framework Bindings → Samples
```

**Gotcha**: Publishing packages out of order causes version mismatches.
**Solution**: Always use the complete release process, don't publish individual packages manually.

### Version Synchronization

**Issue**: All packages must maintain compatible versions.
**Problem**: Manual version bumps can break dependency chains.
**Solution**: Use automated version bumping in release process.

## Environment-Specific Issues

### CDN vs NPM Builds

**Different Behavior**: Build outputs vary based on `DEPLOYMENT_ENVIRONMENT` variable.
**Impact**: Bundle sizes, import paths, and asset handling differ.
**Testing**: Always test both CDN and NPM versions before release.

### Nightly Builds

**Special Handling**: `IS_NIGHTLY=true` changes version formatting and paths.
**Gotcha**: Nightly versions use different versioning scheme (v3-nightly vs v3.1.0).

## Git and CI Issues

### Commit Message Format

**Requirement**: Release commits must follow specific format for changelog generation.
**Format**:

```
[Version Bump][skip ci]: ui-kit publish

package1@version1
package2@version2

**/CHANGELOG.md
**/package.json
CHANGELOG.md
package.json
package-lock.json
```

**Gotcha**: Malformed commit messages break changelog generation.

### Tag Management

**Process**: Tags are created locally then pushed in batch.
**Risk**: If push fails, local tags may not match remote.
**Recovery**:

```bash
# Check tag consistency
git tag -l | grep "package-name"
git ls-remote --tags origin | grep "package-name"
```

### GitHub API Rate Limits

**Issue**: Release process makes many GitHub API calls.
**Symptom**: Random failures during tag creation or PR updates.
**Solution**: Use GitHub App token instead of personal access token.

## Build System Gotchas

### Nx Cache Issues

**Problem**: Cached builds may not reflect latest changes.
**Symptoms**:

- Components not updating despite code changes
- Build outputs seem stale
- Test failures on fresh environments

**Solutions**:

```bash
# Clear Nx cache
nx reset

# Force rebuild without cache
nx run-many --target=build --skip-nx-cache
```

### Metafile Generation

**Purpose**: ESBuild generates metafiles for bundle analysis.
**Location**: `dist/` folders in packages
**Gotcha**: Metafiles are large and can consume significant disk space.
**Cleanup**: Metafiles are not automatically cleaned up.

### TypeScript Configuration Conflicts

**Issue**: Multiple tsconfig files can conflict during builds.
**Symptoms**: Different behavior between `npm run build` and `tsc` directly.
**Solution**: Always use npm scripts, don't run tsc directly.

## Package Manager Issues

### Workspace Dependencies

**Problem**: Package-lock.json changes can break workspace linking.
**Symptom**: Packages not finding workspace dependencies.
**Prevention**: Use `npm run reset:install` instead of manual npm install.

### Patch Management

**System**: patch-package is used for npm dependency patches.
**Location**: `patches/` directory
**Gotcha**: Patches may fail to apply after dependency updates.
**Check**: Always verify patches apply cleanly after updates.

## Documentation and Samples

### API Documentation Generation

**Process**: JSDoc extraction happens during build.
**Requirement**: All public APIs must have JSDoc comments.
**Gotcha**: Missing JSDoc breaks documentation build.

### Sample Application Dependencies

**Issue**: Samples must use released versions of UI Kit packages.
**Problem**: Local development uses workspace links, production uses npm versions.
**Testing**: Always test samples with published packages before release.

## Security and Compliance

### Dependency Scanning

**Requirement**: All dependencies scanned for vulnerabilities.
**Blocker**: High/critical vulnerabilities block release.
**Process**: Security team must approve vulnerability exceptions.

### License Compliance

**Requirement**: All dependencies must have compatible licenses.
**Check**: Automated license scanning in CI.
**Gotcha**: New dependencies may introduce license conflicts.

## Recovery Procedures

### Failed Release Recovery

1. **Unlock Branch**: Remove release freeze
2. **Reset State**: Revert any partial commits
3. **Clean Tags**: Remove any created but not pushed tags
4. **Retry**: Run release process again

### Version Mismatch Recovery

1. **Identify Issue**: Check which packages have mismatched versions
2. **Manual Fix**: Manually align package.json versions
3. **Commit Fix**: Create manual commit with version corrections
4. **Re-release**: Run full release process

### Emergency Hotfix Process

1. **Create Branch**: From master, create hotfix branch
2. **Apply Fix**: Minimal change to address issue
3. **Fast Track**: Use abbreviated release process
4. **Merge Back**: Ensure fix gets into master

## Monitoring and Alerts

### Release Health Checks

- All packages published successfully
- CDN bundles accessible
- npm packages installable
- Documentation updated
- No broken links in docs

### Post-Release Validation

- Install packages in fresh project
- Test basic functionality
- Verify sample applications work
- Check download statistics
