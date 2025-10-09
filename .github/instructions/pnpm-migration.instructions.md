---
applyTo: '**'
---

# Migration Plan: npm to pnpm

# pnpm Migration Plan

**Status:** Not Started  
**Target pnpm version:** 9.15.4  
**Current npm version:** 11.6.0  

## Overview

This document provides a step-by-step migration plan for converting the ui-kit monorepo from npm to pnpm. Each phase should be completed and verified before moving to the next.

---

## Phase 1: Initial Setup & Preparation

**Estimated Time:** 2-3 hours  
**Risk Level:** Low  
**Prerequisites:** None  

### Tasks:

#### 1.1 Create pnpm workspace configuration

Create `pnpm-workspace.yaml` at the repository root:

```yaml
packages:
  - 'packages/bueno'
  - 'packages/auth'
  - 'packages/headless'
  - 'packages/quantic'
  - 'packages/headless-react'
  - 'packages/ssr'
  - 'packages/atomic-hosted-page'
  - 'packages/atomic-react'
  - 'packages/atomic-angular'
  - 'packages/documentation'
  - 'packages/atomic-angular/projects/*'
  - 'packages/atomic'
  - 'packages/shopify'
  - 'packages/create-atomic-template'
  - 'packages/create-atomic'
  - 'packages/create-atomic-component'
  - 'packages/create-atomic-component/template/src/components/sample-component'
  - 'packages/create-atomic-component-project'
  - 'packages/create-atomic-component-project/template'
  - 'packages/create-atomic-rollup-plugin'
  - 'packages/create-atomic-result-component'
  - 'packages/create-atomic-result-component/template/src/components/sample-result-component'
  - 'samples/atomic/*'
  - 'samples/headless/*'
  - 'samples/headless-ssr/*'
  - 'samples/headless-ssr/search-nextjs/*'
  - 'utils/cdn'
  - 'utils/ci'
```

#### 1.2 Update root .npmrc

Update `.npmrc` with pnpm-compatible settings:

```ini
engine-strict=true
save-exact=true

# pnpm specific settings
shamefully-hoist=false
auto-install-peers=true
strict-peer-dependencies=false
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

**Rationale:** 
- `shamefully-hoist=false` maintains pnpm's strict isolation
- `auto-install-peers=true` helps with peer dependency resolution
- `public-hoist-pattern` hoists commonly needed dev dependencies

#### 1.3 Update root package.json

In `/Users/olamothe/ui-kit/package.json`:

**Changes needed:**
- Update `engines.npm` → `engines.pnpm`
- Update `packageManager` field
- Remove `workspaces` array (moved to pnpm-workspace.yaml)

Example:
```json
{
  "engines": {
    "node": "^22.14.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.4"
}
```

**Note:** The `workspaces` field can be removed as it's now in `pnpm-workspace.yaml`.

#### 1.4 Test initial installation

**Commands to run:**
```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@9.15.4

# Generate initial lockfile
pnpm install

# Verify installation
pnpm list --depth 0
```

**Verification:**
- `pnpm-lock.yaml` is created
- All packages are linked correctly
- No installation errors

---

## Phase 2: Update Package Scripts

**Estimated Time:** 8-12 hours  
**Risk Level:** Medium  
**Prerequisites:** Phase 1 complete  

### Script Replacement Patterns:

| npm command | pnpm equivalent |
|-------------|-----------------|
| `npm install` | `pnpm install` |
| `npm i` | `pnpm add` or `pnpm install` |
| `npm ci` | `pnpm install --frozen-lockfile` |
| `npm run <script>` | `pnpm run <script>` or `pnpm <script>` |
| `npm run -w <workspace> <script>` | `pnpm --filter <workspace> <script>` |
| `npm run-script -w=<workspace> <script>` | `pnpm --filter <workspace> <script>` |
| `npm publish` | `pnpm publish` |
| `npm pack` | `pnpm pack` |

### Files to Update:

#### 2.1 Root package.json scripts

File: `/Users/olamothe/ui-kit/package.json`

**Scripts to update:**
- `postinstall`: Keep as-is (should work with pnpm)
- `reset:install`: Update to use pnpm
- `clean:install`: Update to use pnpm
- `dev:atomic`: Replace `npm run -w` with `pnpm --filter`
- `release:phase0` through `release:phase5`: Replace `npm run-script -w=` with `pnpm --filter`

Example transformation:
```json
// Before
"dev:atomic": "concurrently \"npm run -w @coveo/headless dev\" \"npm run -w @coveo/atomic start\""

// After
"dev:atomic": "concurrently \"pnpm --filter @coveo/headless dev\" \"pnpm --filter @coveo/atomic start\""
```

#### 2.2 Package-specific scripts

**Packages with workspace script references:**

1. `/packages/atomic-hosted-page/package.json`
   - `release:phase3`: `npm run-script -w=@coveo/ci npm-publish`
   - `release:phase1`: `npm run-script -w=@coveo/ci bump`
   - `promote:npm:latest`: `npm run-script -w=@coveo/ci promote-npm-prod`

2. `/packages/create-atomic-rollup-plugin/package.json`
   - Same pattern as above

3. `/packages/quantic/package.json`
   - Multiple scripts with `npm run` chaining
   - `dev`, `setup:examples`, `deploy:*` scripts

4. `/packages/headless/package.json`
   - `dev`: Nested `npm run` commands
   - `build`: Chained `npm run` commands
   - `build:typedoc:docs`: Multiple concurrent `npm run` commands

5. `/packages/atomic/package.json`
   - `test`: Chained `npm run` commands
   - Similar patterns

**Strategy for each file:**
1. Find all occurrences of `npm run` and replace with `pnpm run` or just `pnpm`
2. Find `npm run -w <workspace>` and replace with `pnpm --filter <workspace>`
3. Find `npm run-script -w=<workspace>` and replace with `pnpm --filter <workspace>`
4. Keep other npm-style commands like `&&` and `concurrently` as-is

#### 2.3 Template and sample projects

**Files in these directories:**
- `/packages/create-atomic-component-project/template/package.json`
- All sample projects in `/samples/*/package.json`

These should reference pnpm in their documentation/scripts if they're meant to be used as templates.

### Verification:

After updating each package:
```bash
# Test that scripts still parse correctly
pnpm run <script-name> --dry-run

# Verify no syntax errors in package.json
pnpm install --lockfile-only
```

---

## Phase 3: Update Turbo Configuration

**Estimated Time:** 1-2 hours  
**Risk Level:** Low  
**Prerequisites:** Phase 2 complete  

### Tasks:

#### 3.1 Update root turbo.json

File: `/Users/olamothe/ui-kit/turbo.json`

**Update `globalDependencies` array:**

```json
{
  "globalDependencies": [
    "package.json",
    "pnpm-lock.yaml",
    ".npmrc",
    "pnpm-workspace.yaml",
    "tsconfig.json",
    "biome.jsonc",
    ".cspell.json"
  ]
}
```

**Changes:**
- `package-lock.json` → `pnpm-lock.yaml`
- Add `pnpm-workspace.yaml`

#### 3.2 Verify Turbo compatibility

Turborepo is fully compatible with pnpm, but verify:

```bash
# Test turbo with pnpm
pnpm turbo build --dry-run
pnpm turbo test --dry-run
```

**Note:** Turborepo automatically detects pnpm when `pnpm-lock.yaml` exists.

---

## Phase 4: Update CI/CD Workflows

**Estimated Time:** 6-8 hours  
**Risk Level:** High (affects deployments)  
**Prerequisites:** Phases 1-3 complete  

### Files to Update:

#### 4.1 Main CI workflow

File: `.github/workflows/ci.yml`

**Pattern to replace throughout the file:**

```yaml
# Before
- name: Install npm
  run: npm i -g npm@11.6.0

- run: npm ci
- run: npm run build
- run: npm run-script -w=@coveo/ci add-generated-files

# After
- name: Install pnpm
  uses: pnpm/action-setup@v4

- uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
  with:
    node-version-file: '.nvmrc'

- run: pnpm install --frozen-lockfile
- run: pnpm run build
- run: pnpm --filter @coveo/ci add-generated-files
```

**Note:** When using `pnpm/action-setup@v4` without specifying a version, it automatically reads the version from the `packageManager` field in your root `package.json`. This ensures a uniform pnpm version across the entire repository.

**Jobs to update in ci.yml:**
- `pr-report`
- `build`
- `generated-files`
- `knip`
- `lint`
- `package-compatibility`
- `build-typedoc`
- All test jobs
- `prerelease-npm-pr`
- `prerelease-npm-merge`

**Important:** Also update the `setup-node` action configuration to use minimal settings:
```yaml
- uses: pnpm/action-setup@v4

- uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
  with:
    node-version-file: '.nvmrc'
```

**Note:** The pnpm version is not specified in the action because it automatically reads from the `packageManager` field in the root `package.json` file (`"packageManager": "pnpm@9.15.4"`). This ensures version consistency across the repository. The `cache` and `registry-url` options in setup-node should only be added when specifically needed (e.g., registry-url for publishing jobs).

#### 4.2 GitHub Actions

**Directory:** `.github/actions/`

Files that likely need updates (search for `npm` in each):
- `setup-sfdx/action.yml` - May reference npm install
- `commit-generated-files/action.yml`
- All e2e test actions
- All playwright test actions

**Search and replace in these files:**
- `npm ci` → `pnpm install --frozen-lockfile`
- `npm install` → `pnpm install`
- `npm run` → `pnpm run` or `pnpm`

#### 4.3 Verify Node.js setup

Ensure all workflows use the setup-node action first, then pnpm setup, with minimal configuration:

```yaml
steps:
  - uses: actions/checkout@v4

  - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
    with:
      node-version-file: ".nvmrc"

  - uses: pnpm/action-setup@v4
```

**Order matters:** Node.js must be set up before pnpm is installed.

**Note:** The pnpm version is automatically read from the `packageManager` field in `package.json`. The `cache` and `registry-url` options in setup-node are optional and should only be added when specifically needed (e.g., registry-url for publishing jobs).

---

## Phase 5: Update Custom CI Utilities

**Estimated Time:** 8-12 hours  
**Risk Level:** Very High (critical for releases)  
**Prerequisites:** Phases 1-4 complete  

### Critical Files:

#### 5.1 utils/ci/reify.mjs

**Current behavior:** Uses `@npmcli/arborist` to update `package-lock.json`

**Required changes:**

This file needs significant refactoring. The current approach:
1. Uses npm's internal Arborist API
2. Builds dependency graph from npm's virtual tree
3. Updates package-lock.json for specific packages

**pnpm approach:**

```javascript
#!/usr/bin/env node
import {execaCommand} from 'execa';
import {DepGraph} from 'dependency-graph';
import {REPO_FS_ROOT} from './common/constants.mjs';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

/**
 * pnpm approach: Use pnpm commands to update lockfile
 * pnpm has built-in workspace support and handles updates correctly
 */

// Get workspace information from pnpm
const {stdout: workspacesJson} = await execaCommand(
  'pnpm list -r --depth -1 --json',
  {cwd: REPO_FS_ROOT}
);
const workspaces = JSON.parse(workspacesJson);

// Build dependency graph from pnpm's workspace info
function buildDependencyGraph(workspaces) {
  const graph = new DepGraph();
  
  for (const ws of workspaces) {
    graph.addNode(ws.name, ws);
  }
  
  for (const ws of workspaces) {
    const deps = {...ws.dependencies, ...ws.devDependencies};
    for (const [depName, depVersion] of Object.entries(deps)) {
      if (workspaces.find(w => w.name === depName)) {
        graph.addDependency(ws.name, depName);
      }
    }
  }
  
  return graph;
}

const graph = buildDependencyGraph(workspaces);

// Update lockfile for each package in topological order
for (const packageToUpdate of graph.overallOrder()) {
  const names = [
    packageToUpdate,
    ...graph.dependantsOf(packageToUpdate),
  ];
  
  console.log('Updating lockfile for', names);
  
  // Use pnpm install to update the lockfile
  await execaCommand('pnpm install --lockfile-only --no-frozen-lockfile', {
    cwd: REPO_FS_ROOT,
  });
}
```

**Dependencies to add:**
- Remove: `@npmcli/arborist`
- Add: `execa` (if not already present)

**Testing strategy:**
1. Create a test branch
2. Modify a package dependency
3. Run the updated reify script
4. Verify `pnpm-lock.yaml` is updated correctly
5. Test the release process end-to-end in a staging environment

#### 5.2 utils/ci/git-publish-all.mjs

File: `/Users/olamothe/ui-kit/utils/ci/git-publish-all.mjs`

**Changes needed:**

Line ~41 references `package-lock.json` in the commit message:

```javascript
// Before
const commitMessage = dedent`
  [Version Bump][skip ci]: ui-kit publish

  ${packagesReleased}

  **/CHANGELOG.md
  **/package.json
  CHANGELOG.md
  package.json
  package-lock.json
`;

// After
const commitMessage = dedent`
  [Version Bump][skip ci]: ui-kit publish

  ${packagesReleased}

  **/CHANGELOG.md
  **/package.json
  CHANGELOG.md
  package.json
  pnpm-lock.yaml
`;
```

#### 5.3 utils/ci/npm-publish-package.mjs

File: `/Users/olamothe/ui-kit/utils/ci/npm-publish-package.mjs`

**Current behavior:** Uses `@coveo/semantic-monorepo-tools` for npm publishing

**Check needed:**
- Verify `@coveo/semantic-monorepo-tools` supports pnpm
- The `npmPublish` function should work with pnpm (it uses npm commands internally)
- May need to ensure `pnpm publish` is used instead of `npm publish`

**Potential update:**
If the library doesn't support pnpm natively, wrap the publish command:

```javascript
import {execaCommand} from 'execa';

// Instead of npmPublish from the library, use pnpm directly
await execaCommand(`pnpm publish --tag ${tagToPublish} --provenance`, {
  cwd: '.',
});
```

#### 5.4 utils/ci/package.json dependencies

Check if `@coveo/semantic-monorepo-tools` needs updating or if pnpm-specific tools are needed.

---

## Phase 6: Update VS Code Configuration

**Estimated Time:** 1 hour  
**Risk Level:** Low  
**Prerequisites:** None (can be done in parallel with other phases)  

### Files to Update:

#### 6.1 .vscode/tasks.json

File: `/Users/olamothe/ui-kit/.vscode/tasks.json`

**Updates needed:**

```jsonc
{
  "tasks": [
    {
      "label": "reinstall dependencies & rebuild",
      "dependsOn": [
        "reinstall dependencies",
        "build"
      ],
      "dependsOrder": "sequence",
      "problemMatcher": []
    },
    {
      "type": "shell",
      "problemMatcher": [],
      "label": "reinstall dependencies",
      // Before: "command": "rimraf **/node_modules && npm run setup",
      "command": "rimraf **/node_modules && pnpm install",
      "dependsOn": [
        "discard pnpm-lock.yaml changes"
      ]
    },
    {
      "type": "shell",
      "problemMatcher": [],
      // Before: "label": "discard package-lock.json changes",
      "label": "discard pnpm-lock.yaml changes",
      // Before: "command": "git checkout HEAD -- **/package-lock.json"
      "command": "git checkout HEAD -- pnpm-lock.yaml"
    },
    {
      "type": "shell",
      "problemMatcher": [],
      "label": "build",
      // Before: "command": "npm run build"
      "command": "pnpm run build"
    }
  ]
}
```

---

## Phase 7: Update Scripts and Utilities

**Estimated Time:** 4-6 hours  
**Risk Level:** Medium  
**Prerequisites:** Phases 1-3 complete  

### Files to Update:

#### 7.1 scripts/ci/determine-tests.mjs

**Changes needed:**

```javascript
// Line 30 and 154
// Before
if (file.includes('package.json') || file.includes('package-lock.json')) {

// After
if (file.includes('package.json') || file.includes('pnpm-lock.yaml')) {
```

**Also update the comment on line 147:**
```javascript
// Before
* Ensures that the provided file is not 'package.json' or 'package-lock.json'.

// After
* Ensures that the provided file is not 'package.json' or 'pnpm-lock.yaml'.
```

#### 7.2 lint-staged.config.js

**Changes needed:**

```javascript
// Line 15
// Before
if (file.endsWith('package-lock.json')) return false;

// After
if (file.endsWith('pnpm-lock.yaml')) return false;
```

#### 7.3 packages/create-atomic-template/scripts/utils.js

**Changes needed:**

```javascript
// Line 4
// Before
const DEFAULT_PACKAGE_MANAGER = 'npm';

// After
const DEFAULT_PACKAGE_MANAGER = 'pnpm';
```

**Also update detection logic around line 9:**
```javascript
// Ensure it detects pnpm from user agent
const packageManager =
  process.env['npm_config_user_agent']?.match(firstUserAgent) ??
  DEFAULT_PACKAGE_MANAGER;
```

This should already work for pnpm (user agent will be `pnpm/9.15.4`), but verify.

#### 7.4 packages/create-atomic-template/scripts/clean-up.js

**Line 11:**
```javascript
// Before
/npm/g,

// After  
/pnpm/g,
```

#### 7.5 packages/create-atomic-component/index.js

**Line 42:**
```javascript
// Before
$ npm install

// After
$ pnpm install
```

#### 7.6 packages/create-atomic-result-component/index.js

**Same change as 7.5**

#### 7.7 scripts/reports/bundle-size/command.mjs

**Line 7:**
```javascript
// Before
await execute('npm', ['ci']);

// After
await execute('pnpm', ['install', '--frozen-lockfile']);
```

---

## Phase 8: Update Documentation

**Estimated Time:** 4-6 hours  
**Risk Level:** Low  
**Prerequisites:** All previous phases complete  

### Strategy:

Search and replace across all Markdown files:
- `npm install` → `pnpm install`
- `npm i` → `pnpm add` (context-dependent) or `pnpm install`
- `npm run <script>` → `pnpm run <script>` or `pnpm <script>`
- `npm ci` → `pnpm install --frozen-lockfile`

### Files to Update:

#### 8.1 Root documentation

- `/README.md`
- `/internal-docs/release-process.md`
- `/internal-docs/scripts-and-tasks.md`

#### 8.2 Package documentation

**Major packages with README files:**
- `/packages/atomic/README.md`
- `/packages/headless/README.md`
- `/packages/quantic/README.md`
- `/packages/atomic-hosted-page/README.md`
- `/packages/atomic-angular/README.md`
- And all other package READMEs

**Atomic package docs:**
- `/packages/atomic/biome-rules/README.md`
- `/packages/headless/contributors/*.md`
- `/packages/quantic/docs/*.md`

#### 8.3 Sample project documentation

- `/samples/atomic/*/README.md`
- `/samples/headless/*/README.md`
- `/samples/headless-ssr/*/README.md`

#### 8.4 Special attention areas

**In `/packages/quantic/README.md`:**
- Line 20: `npm install --global @salesforce/cli@2.x` - This is a global install of a different tool, keep as-is or suggest `pnpm add -g`
- Multiple `npm run` commands throughout

**In `/packages/headless/contributors/adding-a-sub-package.md`:**
- Line 60-61: Instructions use `npm pack` and `npm i` - update to `pnpm pack` and `pnpm add`

### Search Command:

To find all files to update:
```bash
grep -r "npm install\|npm i\|npm run\|npm ci" --include="*.md" .
```

---

## Phase 9: Handle Package Patches

**Estimated Time:** 2-4 hours  
**Risk Level:** Medium  
**Prerequisites:** Phase 1 complete  

### Current State:

The repo uses `patch-package` with patches in `/patches/`:
- `@stencil+angular-output-target+0.8.4.patch`
- `@stencil+core+4.20.0.patch`
- `@stencil+react-output-target+0.5.3.patch`
- `@wc-toolkit+storybook-helpers+9.0.1.patch`
- `fix-esm-import-path+1.10.1.patch`
- `jest-environment-jsdom+29.7.0.patch`

### pnpm Approach:

pnpm has built-in patching support. Two options:

#### Option 1: Continue using patch-package

`patch-package` works with pnpm. Keep current setup:
- Keep patches in `/patches/`
- Keep `patch-package` in `postinstall` script
- No changes needed

#### Option 2: Migrate to pnpm's native patching

**Steps:**
1. For each patch, run:
   ```bash
   pnpm patch <package>@<version>
   ```
2. Apply the patch content
3. Run:
   ```bash
   pnpm patch-commit <temp-dir>
   ```
4. This adds patch info to `pnpm-lock.yaml` and stores patches in `patches/` with pnpm's naming convention

**Recommendation:** Stick with Option 1 initially (patch-package) to reduce migration complexity. Can migrate to native pnpm patches later if desired.

---

## Phase 10: Testing & Validation

**Estimated Time:** 8-12 hours  
**Risk Level:** High  
**Prerequisites:** All previous phases complete  

### Test Plan:

#### 10.1 Local Development Tests

**Test workspace operations:**
```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Run specific package commands
pnpm --filter @coveo/headless build
pnpm --filter @coveo/atomic build
pnpm --filter @coveo/quantic build
```

**Test Turborepo:**
```bash
# Turbo build
pnpm turbo build

# Turbo test
pnpm turbo test

# Turbo with filters
pnpm turbo build --filter=@coveo/headless
```

**Test development workflows:**
```bash
# Start development servers
pnpm --filter @coveo/headless dev &
pnpm --filter @coveo/atomic start

# Or use the combined script
pnpm run dev:atomic
```

#### 10.2 CI/CD Tests

**Create test branch:**
```bash
git checkout -b test/pnpm-migration
git add .
git commit -m "test: pnpm migration"
git push origin test/pnpm-migration
```

**Verify in GitHub Actions:**
- Check that all CI jobs pass
- Verify caching works (second run should be faster)
- Check that builds produce correct artifacts

#### 10.3 Release Process Test

**Critical: Test in a safe environment**

**Mock release test:**
1. Create a test repository or use a fork
2. Trigger the release process
3. Verify:
   - Version bumping works (`release:phase1`)
   - Publishing works (`release:phase3`)
   - Lockfile is committed correctly (`release:phase4`)
   - Tags are created (`release:phase5`)

**Commands to test:**
```bash
# Test phase by phase
pnpm run nx:graph
pnpm run release:phase1
pnpm run release:phase3
# etc.
```

#### 10.4 Package Publishing Test

**Test npm registry interaction:**
```bash
# Dry run publish
pnpm --filter @coveo/headless publish --dry-run

# Check package contents
pnpm --filter @coveo/headless pack
tar -tzf <package>.tgz
```

#### 10.5 Workspace Dependency Tests

**Verify workspace linking:**
```bash
# Check that workspace dependencies resolve correctly
pnpm why @coveo/headless
pnpm why @coveo/atomic

# Verify peer dependencies are satisfied
pnpm install --resolution-only
```

#### 10.6 Sample Projects Tests

**Test each sample can:**
1. Install dependencies
2. Build
3. Run development server
4. Run tests (if applicable)

```bash
cd samples/atomic/search-nextjs-pages-router
pnpm install
pnpm run dev
pnpm run build
```

Repeat for all sample projects.

### Validation Checklist:

- [ ] All packages install without errors
- [ ] All builds complete successfully
- [ ] All tests pass locally
- [ ] Turborepo caching works correctly
- [ ] CI pipeline runs successfully
- [ ] Development servers start correctly
- [ ] Sample projects work
- [ ] Workspace dependencies resolve correctly
- [ ] Publishing dry-run works
- [ ] Release process can be completed (in test environment)
- [ ] Documentation is accurate
- [ ] VS Code tasks work
- [ ] Git hooks work (husky)

---

## Phase 11: Cleanup & Finalization

**Estimated Time:** 2-3 hours  
**Risk Level:** Low  
**Prerequisites:** Phase 10 complete and all tests passing  

### Tasks:

#### 11.1 Remove npm artifacts

```bash
# Delete package-lock.json
rm package-lock.json

# Remove from git tracking if needed
git rm package-lock.json
```

#### 11.2 Update .gitignore

Verify `.gitignore` includes:
```
node_modules/
pnpm-lock.yaml
```

**Note:** We want to track `pnpm-lock.yaml` in git (don't ignore it), so ensure it's NOT in .gitignore.

#### 11.3 Update package.json cleanup

Remove the `workspaces` field from root `package.json` (if not already done in Phase 1):

```json
// This can be removed as it's now in pnpm-workspace.yaml
// "workspaces": [...]
```

#### 11.4 Update dependencies

**Remove npm-specific dependencies:**
```bash
pnpm remove -w @npmcli/arborist
```

**Add pnpm-specific dependencies (if needed):**
```bash
# If we need programmatic access to pnpm
pnpm add -w -D @pnpm/types
```

#### 11.5 Final documentation review

- [ ] All README files updated
- [ ] Contributing guides updated
- [ ] Internal docs updated
- [ ] Release process documentation updated

#### 11.6 Update this migration document

Mark this document as complete and move it to the appropriate location:
- Update status at the top to "Complete"
- Add completion date
- Add any lessons learned or gotchas discovered
- Archive in `/internal-docs/` for future reference

---

## Rollback Plan

If critical issues are discovered post-migration:

### Quick Rollback:

```bash
# Restore package-lock.json from git history
git checkout origin/main -- package-lock.json

# Remove pnpm files
rm pnpm-lock.yaml pnpm-workspace.yaml

# Reinstall with npm
npm ci

# Restore npm in package.json
# Edit package.json to restore "packageManager": "npm@11.6.0"
npm install
```

### Partial Rollback:

If only specific packages have issues:
- Keep pnpm for most packages
- Use npm for problematic packages via `preinstall` scripts
- Not recommended long-term, but can work as temporary measure

---

## Common Issues & Solutions

### Issue 1: Peer Dependency Warnings

**Symptom:** Many warnings about unmet peer dependencies

**Solution:**
```ini
# In .npmrc
auto-install-peers=true
# Or
strict-peer-dependencies=false
```

### Issue 2: Hoisting Problems

**Symptom:** Packages can't find dependencies that worked with npm

**Solution:**
```ini
# In .npmrc
shamefully-hoist=true
# Or use public-hoist-pattern for specific packages
public-hoist-pattern[]=@types/*
```

### Issue 3: CI Cache Not Working

**Symptom:** CI is slower than expected, cache always misses

**Solution:**
Ensure pnpm setup happens BEFORE Node.js setup:
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9.15.4

- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

### Issue 4: Scripts Not Finding Commands

**Symptom:** Commands like `tsc` or `eslint` not found

**Solution:**
These tools might need to be hoisted:
```ini
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=typescript
```

### Issue 5: Patch Application Fails

**Symptom:** `patch-package` fails to apply patches

**Solution:**
Ensure `patch-package` runs after pnpm install:
```json
{
  "scripts": {
    "postinstall": "pnpm rebuild && patch-package"
  }
}
```

### Issue 6: Workspace Protocol Issues

**Symptom:** Workspace dependencies showing wrong versions

**Solution:**
pnpm uses `workspace:` protocol. Update dependencies:
```json
{
  "dependencies": {
    "@coveo/headless": "workspace:*"
  }
}
```

---

## Success Criteria

Migration is considered successful when:

1. ✅ All packages install without errors
2. ✅ All builds complete successfully (local and CI)
3. ✅ All existing tests pass
4. ✅ CI/CD pipeline runs faster (due to better caching)
5. ✅ Release process works end-to-end
6. ✅ No regression in development workflow
7. ✅ Documentation is complete and accurate
8. ✅ Team is trained on pnpm differences
9. ✅ `pnpm-lock.yaml` is committed and tracked
10. ✅ No `package-lock.json` or npm artifacts remain

---

## Post-Migration Benefits

After successful migration, expect:

1. **Faster installs:** pnpm's content-addressable storage means packages are stored once globally
2. **Disk space savings:** Hard links instead of copies
3. **Stricter dependency management:** Helps catch issues with undeclared dependencies
4. **Better monorepo support:** Built-in workspace protocol and filtering
5. **Improved CI caching:** More efficient lockfile diffs

---

## References

- [pnpm Documentation](https://pnpm.io/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Migrating from npm](https://pnpm.io/cli/import)
- [pnpm GitHub Action](https://github.com/pnpm/action-setup)
- [Turborepo with pnpm](https://turbo.build/repo/docs/handbook/package-installation#pnpm)

---

## Migration Status Tracking

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| 1: Setup | ⬜ Not Started | - | - | |
| 2: Package Scripts | ⬜ Not Started | - | - | |
| 3: Turbo Config | ⬜ Not Started | - | - | |
| 4: CI/CD | ⬜ Not Started | - | - | |
| 5: CI Utilities | ⬜ Not Started | - | - | |
| 6: VS Code | ⬜ Not Started | - | - | |
| 7: Scripts | ⬜ Not Started | - | - | |
| 8: Documentation | ⬜ Not Started | - | - | |
| 9: Patches | ⬜ Not Started | - | - | |
| 10: Testing | ⬜ Not Started | - | - | |
| 11: Cleanup | ⬜ Not Started | - | - | |

---

**Last Updated:** 2025-10-07  
**Document Version:** 1.0  
**Migration Status:** Not Started
