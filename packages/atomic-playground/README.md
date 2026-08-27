# @coveo/atomic-playground

Local playground for developing Atomic components against a real search interface, with hot reload for Atomic and Headless changes.

> This is a **private** internal package — not published to npm.

## Why

The playground replaces the legacy `packages/atomic/dev` harness. It serves Atomic and Headless from **source** rather than `dist`, so Vite owns the entire dependency graph. An edit in any component triggers a page reload in ~150 ms, a Headless reducer edit in ~140 ms, and a theme CSS edit hot-updates in ~20 ms — no intermediate build step runs and `dist` is never written.

## Usage

```sh
pnpm turbo run @coveo/atomic-playground#dev
```

Then open <http://127.0.0.1:3400/>.

The port can be overridden with the `PLAYGROUND_PORT` environment variable.

## How it works

Eight Vite plugins reproduce, inside a dev server, the transforms Atomic's production build applies:

| Plugin                         | Purpose                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `resolveWorkspaceSource`       | Redirects `@coveo/atomic`, `@coveo/headless`, `@coveo/bueno`, `@coveo/relay` and `@coveo/platform-mock-api` to their `src` entry points |
| `resolveAtomicPathAliases`     | Resolves the `@/` import alias Atomic source uses                                                                                       |
| `virtualCustomElementTags`     | Stands in for the generated `custom-element-tags.ts` file                                                                               |
| `forceInlineCssImports`        | Appends `?inline` so `.css` imports yield strings for Lit's `css` tag                                                                   |
| `processInlineCssImports`      | Expands Tailwind directives (`@apply`, `@reference`, `@import`) inside Lit `css` templates                                              |
| `scanAtomicSourceForUtilities` | Points Tailwind's content scanner at Atomic source for utility generation                                                               |
| `svgTransform`                 | Converts `.svg` imports into inline strings                                                                                             |
| `tailwindcss()`                | Standard `@tailwindcss/vite` plugin                                                                                                     |

Because `customElements.define` throws on re-registration, component edits trigger a full page reload (Vite determines this automatically). Theme CSS still hot-updates in place without reloading.

## Turbo task graph

The `dev` task only depends on the minimal set of copy/codegen scripts:

- `@coveo/atomic-legacy#build` (Stencil components still required)
- `@coveo/atomic#build:indexes` (generated `index.ts` / `lazy-index.ts`)
- `@coveo/atomic#build:locales` (locale JSON files)
- `@coveo/atomic#build:assets` (icon SVG files → `dist/assets`)

`build:lit`, `build:cdn`, `build:storybook`, `build:cem` and `tsc:check` are all skipped.
