# Custom elements manifest plugins

`pnpm run build:cem` runs `@custom-elements-manifest/analyzer` over the Atomic sources with the configuration in `custom-elements-manifest.config.mjs`, and writes `custom-elements.json`. The manifest is published as `@coveo/atomic/custom-elements-manifest` and drives:

- the Storybook API tables and controls (`.storybook/preview.ts` and `@wc-toolkit/storybook-helpers`);
- the Angular wrappers (`packages/atomic-angular/scripts/build-lit.mjs`), which turn attributes into inputs;
- the React wrappers (`packages/atomic-react/scripts/build-lit.mjs`).

Each plugin in this folder adjusts the output of the analyzer for those consumers.

## Testing

`pnpm run test:cem-plugins` runs the specs next to the plugins:

- `<plugin>.spec.mjs` runs the analyzer in memory over fixture sources (`analyze` in `testing/analyze.mjs`);
- `manifest.spec.mjs` builds the real manifest through the analyzer's CLI (`analyzeAtomic`) and checks it against the sources.

The Storybook tables and the wrappers are generated from the manifest, so the specs cannot show every effect of a change. The build is reproducible: build the manifest before and after the change and diff the two copies, then regenerate the Angular wrappers (`pnpm run build:angular`) and diff those too.
