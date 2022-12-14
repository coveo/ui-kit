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
npm i
```

To install a dependency in a specific package, specify the workspace:

```sh
npm i lodash -w @coveo/headless-react-samples
```

To build all projects for production, run:

```sh
npm run build
```

To build a single project for production (for instance, the `@coveo/atomic` package), run:

```sh
npm run build -w @coveo/atomic
```

To start a single project in development (for instance, the `quantic` package), run:

```sh
npm start -w @coveo/quantic
```

To start Atomic & Headless simultaneously in development (recommended), run:

```sh
npm run dev
```

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

The following Visual Studio Code extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Prerelease

### To start a major prerelease (e.g., `1.2.3` → `2.0.0-pre.0`)

1. Make sure that `HEAD` refers to a version bump on `master`.
2. Create a new branch prefixed with `prerelease/` (e.g., `prerelease/headless_atomic_v2`).
3. Run `npm run bump:version:major-prerelease -- @coveo/package1 @coveo/package2 @coveo/package3`.
4. Push the new commit and its tags to the branch.

### Adding a new package to an already started prerelease

1. Checkout the prerelease branch.
2. Run `npm run bump:version:major-prerelease -- @coveo/package1` where `@coveo/package1` is the new package.
3. Push the new commit and its tags to the branch.

### Updating a prerelease branch

1. Wait for `master` to reference a version bump.
2. Pull changes from `master` into the prerelease branch.

### Officially releasing (e.g., `2.0.0-pre.15` → `2.0.0`)
1. Create a pull request from a copy of the prerelease branch to “master”.
   - Associate with a Jira issue which QA will use to validate.
   - Update the changelogs manually, adding all the changes from the last release to the new release.
   - Update all dependents to use the prerelease version (include the `-pre.` suffix).
2. Wait for `master` to reference a version bump.
3. Squash as a version bump.
   - You can copy the title & description of the last version bump commit on the prerelease branch.
   - You must add the link to the Jira issue at the beginning of the description.
