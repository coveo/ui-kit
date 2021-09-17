# Coveo UI Kit

## Installation

To install all dependencies and link local packages, run:

```sh
npm run setup
```

To build all projects for production, run:

```sh
npm run build
```

To start all projects in development, run:

```sh
npm start
```

**Note:** You should build all separate projects at least once before running the `npm start` command the first time.

To build a single project for production (for instance, the `product-listing` package), run:

```sh
npm run build  -- --filter product-listing
```

To run all FTs for Atomic using Cypress, run: (need to start all projects in development before

**Note:** You should build all separate projects at least once before running tests.

```sh
npm run cypresstest
```

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

The following Visual Studio Code extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
