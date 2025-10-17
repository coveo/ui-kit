# Coveo UI Kit

## Projects

- [Headless](packages/headless): Stateful middle-layer between UI elements and the Coveo Platform.
- [Atomic](packages/atomic): Coveo's web-component library for building modern search experiences.
- [Quantic](packages/quantic): Coveo's LWC library for building Salesforce search experiences.
- [Bueno](packages/bueno): A simple schema validator.
- [Auth](packages/auth): Functions to help authenticate with the Coveo platform.
- [Headless React Samples](packages/samples/headless-react): Various code samples using Headless inside a React application.
- Dummy

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
npx nx run atomic:build
```

## Development mode

To start Atomic & Headless simultaneously in development (recommended), run:

```sh
npx nx run atomic:dev
```

To start a single project in development (for instance, the `quantic` package), run:

```sh
npx nx run quantic:dev
```

To run a specific task in a package separate it with colon e.g. to run `test:watch` inside quantic

```sh
npx nx run quantic:test:watch
```

To start story book in development, run:

```sh
npx nx run atomic-storybook:dev
```

## Test

To run the tests for a specific package (recommended) e.g. `atomic` package

```sh
npx nx run atomic:test
```

For e2e tests

```sh
npx nx run atomic:dev
# In a separate terminal
npx nx run atomic:e2e
```

To run e2e tests for specific files/components using the Cypress GUI

```sh
npx nx run atomic:e2e:watch
```

## Lint

```sh
npm run lint:check
npm run lint:fix
```

## Misc

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

The following Visual Studio Code extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
