# Custom elements manifest plugins

`pnpm run build:cem` runs `@custom-elements-manifest/analyzer` over the Atomic sources with the configuration in `custom-elements-manifest.config.mjs`, and writes `custom-elements.json`. The manifest is published with the package and drives:

- the Storybook API tables and controls (`.storybook/preview.ts` and `@wc-toolkit/storybook-helpers`);
- the Angular wrappers (`packages/atomic-angular/scripts/build-lit.mjs`), which turn attributes into inputs;
- the React wrappers (`packages/atomic-react/scripts/build-lit.mjs`), which only need the tag names.

Each plugin in this folder adjusts the output for those consumers, and its JSDoc says why it exists.

| Plugin                                     | Effect                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `keep-custom-element-exports`              | Keeps only the public custom elements, so utilities, mixins and `@internal` elements stay out |
| `map-property`                             | Exposes `@mapProperty` fields as attributes named after their prefix                          |
| `remove-undefined-type`                    | Removes `\| undefined` from attribute types                                                   |
| `hide-base-initializable-component-fields` | Hides `bindings`, `initialized`, `unsubscribeLanguage` and `error`                            |
| `hide-bind-state-to-controller-fields`     | Hides `@bindStateToController` fields and their controllers                                   |

## Testing

`pnpm run test:cem-plugins` runs the specs next to the plugins. `testing/analyze.mjs` runs the analyzer in memory, over fixture sources or over the real sources with the real configuration.

The Storybook tables and the wrappers are generated from the manifest, so tests alone cannot show every effect of a change. Build the manifest before and after the change and diff the two copies, then regenerate the Angular wrappers (`pnpm run build:angular`) and diff those too.
