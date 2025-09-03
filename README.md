# Coveo UI Kit

## Projects

- [Headless](packages/headless): Stateful middle-layer between UI elements and the Coveo Platform.
- [Atomic](packages/atomic): Coveo's web-component library for building modern search experiences.
- [Quantic](packages/quantic): Coveo's LWC library for building Salesforce search experiences.
- [Bueno](packages/bueno): A simple schema validator.
- [Auth](packages/auth): Functions to help authenticate with the Coveo platform.
- [Headless React Samples](packages/samples/headless-react): Various code samples using Headless inside a React application.

## Install

To install all dependencies and link local packages, run:

```sh
npm i
```

To install a dependency in a specific package, specify the workspace:

```sh
npm i lodash -w @coveo/headless-react-samples
```

## Build

To build all projects for production, run:

```sh
npm run build
```

To build a single project for production (for instance, the `atomic` package), run:

```sh
npx turbo run @coveo/atomic#build
```

## Development mode

Add the `--stencil` switch if you are changing stencil files.

To start a single project in development (for instance, the `quantic` package), run:

```sh
npx turbo run @coveo/quantic#dev
```

To run a specific task in a package separate it with colon e.g. to run `test:watch` inside quantic

```sh
npx turbo test:watch --filter=@coveo/quantic
```

## Test

To run the tests for a specific package (recommended) e.g. `atomic` package

```sh
npx turbo test --filter=@coveo/atomic
```

For e2e tests

```sh
npx turbo run @coveo/atomic#dev
# In a separate terminal
npx turbo run @coveo/atomic#e2e
```

To run e2e tests for specific files/components using the Cypress GUI

```sh
npx turbo e2e:watch --filter=@coveo/atomic
```

## Lint

```sh
npm run lint:check
npm run lint:fix
```

## Misc

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

## Recommended VS Code Settings

To ensure a consistent development experience, add the following to your `.vscode/settings.json` in the project root:

```jsonc
{
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
