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

| Option                         | Description                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `<project-name>`               | Directory to create the project in.                                                   |
| `--template <id>`              | Template to scaffold (skips the interactive prompt).                                  |
| `--template-version <version>` | Headless/Atomic library version (or npm dist-tag) to scaffold (defaults to `latest`). |
| `-h`, `--help`                 | Show usage and the list of available templates.                                       |

### Pinning a template version

Samples are versioned in lockstep with the Coveo library they build on (Headless
or Atomic), so a sample's version always matches its library's version. By
default the CLI scaffolds the `latest` published version. Pass
`--template-version` to scaffold the sample that matches a specific library
version instead:

```sh
npm create @coveo/ui@latest my-app --template headless-search-react --template-version 3.2.1
```

The example above scaffolds the `headless-search-react` sample built against
Headless `3.2.1`. Omitting `--template-version` keeps the default (`latest`).

## Templates

Run `npm create @coveo/ui --help` for the current list. Templates encode the
library, use case, and framework (e.g. `headless-search-react`). Additional
Atomic and vanilla templates are added as their samples become scaffold-ready.

## How it works

The CLI downloads the matching sample package from npm (via
[pacote](https://github.com/npm/pacote)), renames the project, and installs
dependencies with the package manager you invoked it with.
