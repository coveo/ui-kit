# Coveo UI Kit

## Quick Start with GitHub Codespaces

Get started in seconds with a fully configured development environment:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/coveo/ui-kit)

GitHub Codespaces provides a complete, cloud-based development environment with:
- ✅ All dependencies pre-installed (1.6GB of node_modules)
- ✅ Full project built and ready (~5 minutes of build time saved)
- ✅ VS Code extensions automatically installed
- ✅ Consistent environment across all developers

**First-time setup**: ~5 minutes | **With prebuilds**: ~30 seconds

See [.devcontainer/README.md](.devcontainer/README.md) for details on the devcontainer configuration.

## Projects

- [Headless](packages/headless): Stateful middle-layer between UI elements and the Coveo Platform.
- [Atomic](packages/atomic): Coveo's web-component library for building modern search experiences.
- [Quantic](packages/quantic): Coveo's LWC library for building Salesforce search experiences.
- [Bueno](packages/bueno): A simple schema validator.
- [Auth](packages/auth): Functions to help authenticate with the Coveo platform.
- [Headless React Samples](packages/samples/headless-react): Various code samples using Headless inside a React application.

## Samples

Looking for code examples? Check out the [samples](samples/) directory for working examples using Atomic, Headless, and Headless SSR across various frameworks including React, Angular, Vue.js, and Next.js.

## Install

To install all dependencies and link local packages, run:

```sh
pnpm install
```

To install a dependency in a specific package, specify the workspace:

```sh
pnpm add lodash -w @coveo/headless-react-samples
```

## Build

To build all projects for production, run:

```sh
pnpm run build
```

To build a single project for production (for instance, the `atomic` package), run:

```sh
pnpm turbo run @coveo/atomic#build
```

## Development mode

Add the `--stencil` switch if you are changing stencil files.

To start a single project in development (for instance, the `quantic` package), run:

```sh
pnpm turbo run @coveo/quantic#dev
```

To run a specific task in a package separate it with colon e.g. to run `test:watch` inside quantic

```sh
pnpm turbo test:watch --filter=@coveo/quantic
```

## Test

To run the tests for a specific package (recommended) e.g. `atomic` package

```sh
pnpm turbo test --filter=@coveo/atomic
```

For e2e tests

```sh
pnpm turbo run @coveo/atomic#dev
# In a separate terminal
pnpm turbo run @coveo/atomic#e2e
```

To run e2e tests for specific files/components using the Cypress GUI

```sh
pnpm turbo e2e:watch --filter=@coveo/atomic
```

## Lint

```sh
pnpm run lint:check
pnpm run lint:fix
```

## Misc

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `pnpm rebuild` command.

## Recommended VS Code Settings

To ensure a consistent development experience, add the following to your `.vscode/settings.json` in the project root:

```jsonc
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.biome": "explicit"
  },
  "editor.formatOnSave": true
}
```

These settings will:
- Use [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) as the default code formatter.
- Automatically organize imports and fix issues with Biome on save.

> **Note:**  
> Actual formatting is controlled by the project's `biome.jsonc` configuration.  
> The above settings ensure your editor behavior matches project standards.
