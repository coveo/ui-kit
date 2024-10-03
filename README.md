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
pnpm i
```

To install a dependency in a specific package, specify the workspace:

```sh
pnpm add lodash --filter @coveo/headless-react-samples
```

## Build

To build all projects for production, run:

```sh
pnpm run build
```

To build a single project for production (for instance, the `atomic` package), run:

```sh
pnpm nx run atomic:build
```

## Development mode

To start Atomic & Headless simultaneously in development (recommended), run:

```sh
pnpm nx run atomic:dev
```

To start a single project in development (for instance, the `quantic` package), run:

```sh
pnpm nx run quantic:dev
```

To run a specific task in a package separate it with colon e.g. to run `test:watch` inside quantic

```sh
pnpm nx run quantic:test:watch
```

To start story book in development, run:

```sh
pnpm nx run atomic-storybook:dev
```

## Test

To run the tests for a specific package (recommended) e.g. `atomic` package

```sh
pnpm nx run atomic:test
```

For e2e tests

```sh
pnpm nx run atomic:dev
# In a separate terminal
pnpm nx run atomic:e2e
```

To run e2e tests for specific files/components using the Cypress GUI

```sh
pnpm nx run atomic:e2e:watch
```

## Lint

```sh
pnpm run lint:check
pnpm run lint:fix
```

The following Visual Studio Code extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
