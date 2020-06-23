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

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

The following Visual Studio Code extensions are recommended:
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)