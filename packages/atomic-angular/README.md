# @coveo/atomic-angular-builder

Private Angular workspace that builds and publishes [`@coveo/atomic-angular`](projects/atomic-angular/).

The consumer documentation, published to npm with the package, is [`projects/atomic-angular/README.md`](projects/atomic-angular/README.md). Update that file, not this one, when the wrapper's usage changes.

## Layout

- `scripts/build-lit.mjs`: reads the `@coveo/atomic` custom elements manifest and generates one Angular component per Atomic Lit element, plus `AtomicAngularModule`, in `projects/atomic-angular/src/lib/generated/` (gitignored). Each component imports its element class from `@coveo/atomic/components/<tag-name>`.
- `projects/atomic-angular/src/utils.ts`: the `ProxyCmp` decorator and the input, method and output proxies the generated components use.
- `projects/atomic-angular/src/public-api.ts`: the package's public API.
- `projects/atomic-angular/package.json`: the published manifest. `ng-packagr` builds into `projects/atomic-angular/dist`, which is the directory that gets published.

## Scripts

Run them from this directory, after building `@coveo/atomic` (or run `pnpm run build` at the repository root, which builds everything in order).

- `pnpm run gen:lit`: regenerates the components from the manifest.
- `pnpm run build:bundles`: builds the library with `ng-packagr`.
- `pnpm run build:assets`: copies Atomic's `assets` and `lang` folders into the package's `dist`.

## Testing changes

The wrapper has no unit tests of its own. Check changes against the Angular samples in [`samples/atomic`](../../samples/atomic/), which consume the workspace build and run Playwright smoke tests. To check what consumers get, including the README, run `pnpm pack` in `projects/atomic-angular` and inspect or install the tarball.
