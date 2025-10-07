# pnpm Migration - Quick Reference for LLM Agents

## How to Use This Guide

This is a companion document to `pnpm-migration.instructions.md`. Use this for quick lookups while executing the migration.

---

## Quick Command Reference

### npm → pnpm Command Mapping

```bash
# Installation
npm install          → pnpm install
npm i                → pnpm add (for new packages) or pnpm install
npm ci               → pnpm install --frozen-lockfile
npm i -g <package>   → pnpm add -g <package>

# Running Scripts
npm run <script>     → pnpm run <script> OR pnpm <script>
npm test             → pnpm test
npm start            → pnpm start

# Workspace Commands
npm run -w <workspace> <script>        → pnpm --filter <workspace> <script>
npm run-script -w=<workspace> <script> → pnpm --filter <workspace> <script>
npm i <package> -w <workspace>         → pnpm --filter <workspace> add <package>

# Publishing
npm publish          → pnpm publish
npm pack             → pnpm pack

# Other
npm list             → pnpm list
npm outdated         → pnpm outdated
npm update           → pnpm update
```

---

## File Patterns to Search & Replace

### Pattern 1: Workspace script execution
```bash
# Find
npm run-script -w=@coveo/ci <script>

# Replace
pnpm --filter @coveo/ci <script>
```

### Pattern 2: Workspace script execution (alternate syntax)
```bash
# Find
npm run -w @coveo/headless dev

# Replace
pnpm --filter @coveo/headless dev
```

### Pattern 3: Chained npm run commands
```bash
# Find
npm run build:bundles && npm run build:definitions

# Replace
pnpm run build:bundles && pnpm run build:definitions
# OR (shorter)
pnpm build:bundles && pnpm build:definitions
```

### Pattern 4: CI installation
```bash
# Find
npm ci

# Replace
pnpm install --frozen-lockfile
```

### Pattern 5: Lockfile references
```bash
# Find
package-lock.json

# Replace
pnpm-lock.yaml
```

---

## Critical Files Checklist

### Must Update in Order:

1. **Phase 1 - Foundation**
   - [ ] Create `pnpm-workspace.yaml`
   - [ ] Update `.npmrc`
   - [ ] Update root `package.json` (engines, packageManager)

2. **Phase 2 - Scripts** (Can be partially automated)
   - [ ] Root `package.json` scripts
   - [ ] All workspace `package.json` scripts (use find/replace)

3. **Phase 3 - Turbo**
   - [ ] `turbo.json` globalDependencies

4. **Phase 4 - CI/CD** (HIGH RISK - Test carefully)
   - [ ] `.github/workflows/ci.yml`
   - [ ] All files in `.github/actions/*/action.yml`

5. **Phase 5 - Custom Utils** (VERY HIGH RISK)
   - [ ] `utils/ci/reify.mjs` (requires rewrite)
   - [ ] `utils/ci/git-publish-all.mjs`
   - [ ] `utils/ci/npm-publish-package.mjs`

---

## GitHub Actions Setup Template

Use this in all workflow files:

```yaml
steps:
  - uses: actions/checkout@v4
  
  # IMPORTANT: pnpm setup must come BEFORE node setup
  - uses: pnpm/action-setup@v4
    with:
      version: 9.15.4
  
  - uses: actions/setup-node@v4
    with:
      node-version-file: ".nvmrc"
      cache: 'pnpm'  # Enable pnpm caching
      registry-url: "https://registry.npmjs.org"
  
  # Now use pnpm commands
  - run: pnpm install --frozen-lockfile
  - run: pnpm run build
  - run: pnpm --filter <workspace> <script>
```

---

## pnpm-workspace.yaml Template

```yaml
packages:
  # Core packages
  - 'packages/bueno'
  - 'packages/auth'
  - 'packages/headless'
  - 'packages/atomic'
  - 'packages/quantic'
  - 'packages/headless-react'
  - 'packages/ssr'
  - 'packages/atomic-hosted-page'
  - 'packages/atomic-react'
  - 'packages/atomic-angular'
  - 'packages/documentation'
  - 'packages/shopify'
  
  # Create packages
  - 'packages/create-atomic-template'
  - 'packages/create-atomic'
  - 'packages/create-atomic-component'
  - 'packages/create-atomic-component-project'
  - 'packages/create-atomic-rollup-plugin'
  - 'packages/create-atomic-result-component'
  
  # Templates (if they have package.json)
  - 'packages/create-atomic-component/template/src/components/sample-component'
  - 'packages/create-atomic-component-project/template'
  - 'packages/create-atomic-result-component/template/src/components/sample-result-component'
  
  # Angular sub-packages
  - 'packages/atomic-angular/projects/*'
  
  # Samples
  - 'samples/atomic/*'
  - 'samples/headless/*'
  - 'samples/headless-ssr/*'
  
  # Utils
  - 'utils/cdn'
  - 'utils/ci'
```

---

## .npmrc for pnpm

```ini
# Existing settings
engine-strict=true
save-exact=true

# pnpm-specific settings
shamefully-hoist=false
auto-install-peers=true
strict-peer-dependencies=false

# Public hoist patterns (if needed for build tools)
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=typescript
public-hoist-pattern[]=@stencil/*
```

---

## Testing Commands

After each phase, run these to verify:

```bash
# 1. Verify installation works
pnpm install

# 2. Verify lockfile is valid
pnpm install --frozen-lockfile

# 3. Verify workspace structure
pnpm list -r --depth 0

# 4. Test builds
pnpm run build
pnpm turbo build

# 5. Test workspace filtering
pnpm --filter @coveo/headless build
pnpm --filter @coveo/atomic build

# 6. Test all scripts still parse
node -e "require('./package.json')"

# 7. Verify no npm artifacts
find . -name "package-lock.json" -type f
# Should return nothing after cleanup
```

---

## Common Gotchas

### 1. Order Matters in GitHub Actions
❌ Wrong:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
- uses: pnpm/action-setup@v4  # Too late!
```

✅ Correct:
```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

### 2. Frozen Lockfile in CI
Always use `--frozen-lockfile` in CI to prevent unexpected updates:
```bash
pnpm install --frozen-lockfile
```

### 3. Workspace Protocol
pnpm may auto-update workspace dependencies to use `workspace:*`:
```json
{
  "dependencies": {
    "@coveo/headless": "workspace:*"
  }
}
```
This is normal and expected.

### 4. Script Prefix
pnpm doesn't require `run` for custom scripts:
```bash
pnpm build      # Works
pnpm run build  # Also works
```

### 5. Filter Syntax
Multiple filters:
```bash
pnpm --filter @coveo/headless --filter @coveo/atomic build
```

Filter with dependencies:
```bash
pnpm --filter @coveo/atomic... build  # Include dependencies
```

---

## Validation Checklist

Before considering a phase complete:

- [ ] No errors during `pnpm install`
- [ ] `pnpm run build` succeeds
- [ ] All tests pass: `pnpm run test`
- [ ] Turbo works: `pnpm turbo build`
- [ ] CI pipeline passes (if CI phase complete)
- [ ] No references to old lockfile remain
- [ ] Documentation is updated
- [ ] Team members can reproduce locally

---

## Regex Patterns for Bulk Updates

Use these with your editor's find/replace (regex mode):

### 1. Update npm run -w commands
```regex
Find:    npm run -w (\S+) (\S+)
Replace: pnpm --filter $1 $2
```

### 2. Update npm run-script -w= commands
```regex
Find:    npm run-script -w=(\S+) (\S+)
Replace: pnpm --filter $1 $2
```

### 3. Update npm run commands
```regex
Find:    npm run (\S+)
Replace: pnpm run $1
```

### 4. Update npm ci
```regex
Find:    npm ci
Replace: pnpm install --frozen-lockfile
```

### 5. Update lockfile references
```regex
Find:    package-lock\.json
Replace: pnpm-lock.yaml
```

**⚠️ Warning:** Always review regex replacements before committing. Context matters!

---

## Emergency Rollback

If things go wrong:

```bash
# 1. Restore npm lockfile
git checkout origin/main -- package-lock.json

# 2. Remove pnpm files
rm pnpm-lock.yaml pnpm-workspace.yaml

# 3. Restore package.json packageManager field
# Edit package.json: "packageManager": "npm@11.6.0"

# 4. Reinstall with npm
npm ci
```

---

## Phase Completion Markers

Update the status table in the main instructions file after each phase:

```markdown
| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| 1: Setup | ✅ Complete | 2025-XX-XX | 2025-XX-XX | All good |
```

Status emoji:
- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ⚠️ Issues Found
- ❌ Blocked

---

## Agent Instructions

When working on this migration:

1. **Always start by reading the phase description** in the main migration document
2. **Work on ONE phase at a time** - don't skip ahead
3. **Test after each significant change** - use the testing commands above
4. **Update the status table** when completing a phase
5. **Document any issues or deviations** in the Notes column
6. **Ask for human review** before moving to high-risk phases (4, 5, 10)
7. **Never commit untested changes** to main branch
8. **Use feature branches** for testing

---

## Human Supervision Points

Request human review at these checkpoints:

1. ✋ **Before Phase 4 (CI/CD)** - High impact on team
2. ✋ **Before Phase 5 (CI Utilities)** - Critical for releases
3. ✋ **Before Phase 10 (Testing)** - Need human judgment on test results
4. ✋ **After Phase 10** - Before final cleanup and merge
5. ✋ **Any time unexpected errors occur**

---

**Last Updated:** 2025-10-07  
**Quick Reference Version:** 1.0
