# @coveo/create-ui

Scaffold a Coveo UI project (Atomic or Headless) from the official
[ui-kit samples](https://github.com/coveo/ui-kit/tree/main/samples). Every
template runs with **zero configuration** against the sample organization — no
credentials, API keys, or search tokens required.

## Usage

```sh
npm create @coveo/ui@latest my-app --template headless-search-react
```

Or run without arguments for an interactive prompt:

```sh
npm create @coveo/ui@latest
```

`pnpm` is also supported:

```sh
pnpm create @coveo/ui my-app --template headless-search-react
```

### Options

| Option            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `<project-name>`  | Directory to create the project in.                  |
| `--template <id>` | Template to scaffold (skips the interactive prompt). |
| `-h`, `--help`    | Show usage and the list of available templates.      |

## Templates

Run `npm create @coveo/ui --help` for the current list. Templates encode the
library, use case, and framework (e.g. `headless-search-react`). Additional
Atomic and vanilla templates are added as their samples become scaffold-ready.

## How it works

The CLI downloads the matching sample directory from the `coveo/ui-kit` `main`
branch (via GitHub tarball), rewrites the sample's `package.json` so its
monorepo-only `catalog:` and `workspace:*` dependencies resolve to concrete
published versions, renames the project, and installs dependencies with the
package manager you invoked it with.
