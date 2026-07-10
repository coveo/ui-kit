# Publishing samples

How any `samples/*` app (Atomic or Headless) is published to npm as a
`@coveo/create-ui` scaffolding template, and the gotchas that bite every time.
The mechanism is library-agnostic; the only per-sample differences are which
build tooling is kept (e.g. `@vitejs/plugin-react`/`typescript` for React/TS,
or an Atomic-React `build:assets` step) versus stripped.

## Mechanism: `publishConfig.directory` + prepack builder

Each sample publishes a **trimmed copy** of itself, not its working directory.
On `pnpm pack`/`publish`, pnpm runs the `prepack` script, which builds a
`./publish/` folder; `publishConfig.directory: "publish"` tells pnpm to publish
that folder.

The builder is shared: [`scripts/build-sample-publish-dir.mjs`](../../../../scripts/build-sample-publish-dir.mjs).
It:

- Copies only `SHIPPED_PATHS` (`src`, `public`, `index.html`, `vite.config.js`,
  `tsconfig.json`, `README.md`), skipping any that don't exist (`existsSync`
  guard, needed for vanilla samples with no `tsconfig.json`) and excluding test
  files (`*.test.*` / `*.spec.*`).
- Removes test-only devDependencies (`@coveo/platform-mock-api`, `@msw/playwright`,
  `@playwright/test`, `msw`) — the internal `@coveo/platform-mock-api` is
  unpublished and would break `install` for a scaffolded user. **Build tooling
  (`vite`, `@vitejs/plugin-react`, `typescript`, `@types/*`) is intentionally
  kept.**
- Removes test-only scripts (`e2e`) and the publish-only fields (`prepack`,
  `publishConfig.directory`, `publishConfig.linkDirectory`) so the published copy
  is a plain, runnable project.

**Prefer generalizing this shared script over per-sample logic.** If a sample has
an extra test-only script (e.g. `e2e:watch`), the cleaner fix is usually to
remove that script from the sample rather than special-case the builder. Never
let a branch's copy of the builder diverge from `main`.

## package.json shape (publishable sample)

```jsonc
{
  "name": "@coveo/ui-kit-sample-<category>-<use-case>[-<framework>]",
  "version": "0.0.0",
  "type": "module",
  "publishConfig": {
    "access": "public",
    "directory": "publish",
    "linkDirectory": false
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "e2e": "playwright test",
    "prepack": "node ../../../scripts/build-sample-publish-dir.mjs"
  },
  "dependencies": {
    "@coveo/headless": "workspace:*"
    // + react/react-dom (catalog:) or lit (catalog:)
  },
  "devDependencies": {
    "@coveo/platform-mock-api": "workspace:*",
    "@msw/playwright": "catalog:",
    "@playwright/test": "catalog:",
    "msw": "catalog:"
    // + build tooling: vite (catalog:), and for TS/react:
    //   @vitejs/plugin-react, typescript, @types/node, @types/react, @types/react-dom
  }
}
```

Also add `publish` to the sample's `.gitignore`.

## Lockfile: the `publishDirectory` field

`publishConfig.directory` must be recorded in the sample's importer in
`pnpm-lock.yaml` as `publishDirectory`, or `--frozen-lockfile` fails:

```
ERR_PNPM_OUTDATED_LOCKFILE ... "publishDirectory" in the lockfile (undefined)
doesn't match "publishConfig.directory" in package.json (publish)
```

### Surgical edit (preferred — no drift)

A full `pnpm install` can drift unrelated versions (e.g. bump `@types/node`
across the lockfile). For an existing sample whose deps don't change, edit the
lockfile by hand: find the sample's importer block and add, at 4-space indent
right after its last devDependency version line:

```yaml
    publishDirectory: publish
```

Then confirm: `pnpm install --frozen-lockfile` → `Lockfile is up to date`.
`--frozen-lockfile` tolerates stale transitive versions; it only flags
importer ↔ package.json mismatches.

### When adding a brand-new sample

The importer doesn't exist in `main`'s lockfile yet, so regenerate additively:

```bash
git checkout origin/main -- pnpm-lock.yaml   # start from a clean base
pnpm install --lockfile-only                 # adds the new importer (+ publishDirectory)
pnpm install --frozen-lockfile               # verify (exit 0)
git diff --stat origin/main -- pnpm-lock.yaml   # expect a small, additive diff
```

## Broken lockfile after a rebase (recurring!)

A conflict-free `git rebase origin/main` frequently leaves `pnpm-lock.yaml`
**semantically broken** even though git reported no conflict: the sample importer
still references version hashes (e.g. `vite@8.1.2(@types/node@26.0.1)...`) that no
longer exist in `main`'s updated `packages:`/`snapshots:` section. Symptom:

```
ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY  Broken lockfile: no entry for
'@msw/playwright@0.6.7(msw@2.14.6(@types/node@26.0.1)...)' in pnpm-lock.yaml
```

**Always run `pnpm install --frozen-lockfile` after any rebase, before pushing.**
Fix by regenerating just this importer against main's lockfile:

```bash
git checkout origin/main -- pnpm-lock.yaml
pnpm install --lockfile-only        # re-resolves the importer against main's packages
pnpm install --frozen-lockfile      # verify exit 0
# re-add publishDirectory if the regen dropped it, then amend + force-push
```

The result should be a small additive diff (just this sample's importer +
`publishDirectory`), not a repo-wide version churn.

## Verify the published output (builder check)

```bash
cd samples/headless/<sample>
node ../../../scripts/build-sample-publish-dir.mjs
# inspect publish/package.json: no "private", access "public",
#   scripts = dev/build/preview, devDeps = build tooling only (no @coveo/platform-mock-api/msw/@playwright)
find publish -name '*.spec.*' -o -path '*/e2e/*'   # must be empty
rm -rf publish
```

## Scaffold deploy-test (prove it works for an outside user)

```bash
SRC=$(pwd)                       # the sample dir
pnpm pack                        # writes publish/*.tgz (publishConfig.directory)
DEST=/tmp/<sample>-scaffold-test
rm -rf "$DEST" && mkdir -p "$DEST"
tar -xzf "$SRC"/publish/*.tgz -C "$DEST" --strip-components=1
cd "$DEST"
npm install                      # from the public registry — must resolve with no internal deps
npm run build                    # must succeed
npm run dev                      # open the URL; confirm it renders with live results
```

A correct scaffold installs (~300 packages, no `@coveo/platform-mock-api`),
builds, and renders the live experience (e.g. search results counted from the
`searchuisamples` org) with no console errors.

## CI signals

The lockfile-sensitive jobs to watch on the PR: **Build**, **Build & commit
missing generated files**, **Build CDN**, **Build Windows**. If the lockfile is
inconsistent they fail fast. The `samples-e2e` job runs the Playwright smoke test
via `turbo run e2e --affected`.
