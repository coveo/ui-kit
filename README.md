# Coveo UI Kit

## Projects

- [Headless](packages/headless): Stateful middle-layer between UI elements and the Coveo Platform.
- [Atomic](packages/atomic): Coveo's web-component library for building modern search experiences.
- [Quantic](packages/quantic): Coveo's LWC library for building Salesforce search experiences.
- [Bueno](packages/bueno): A simple schema validator.
- [Auth](packages/auth): Functions to help authenticate with the Coveo platform.
- [Headless React Samples](packages/samples/headless-react): Various code samples using Headless inside a React application.

## Installation

To install all dependencies and link local packages, run:

```sh
npm run setup
```

To build all projects for production, run:

```sh
npm run build
```

To build a single project for production (for instance, the `product-listing` package), run:

```sh
npm run build  -- --filter product-listing
```

To start all projects in development (you should run `npm run build` at least once first), run:

```sh
npm start
```

To start Atomic & Headless simultaneously in development, run:

```sh
npm run dev
```

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

The following Visual Studio Code extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
