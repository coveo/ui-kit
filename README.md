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
npm dev -w @coveo/quantic
```

To start Atomic & Headless simultaneously in development (recommended), run:

```sh
npm run dev:atomic
```

The project uses git hooks with [Husky](https://www.npmjs.com/package/husky). You can make sure hooks are correctly installed using the `npm rebuild` command.

The following Visual Studio Code extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Scripts and tasks

Scripts for each `package.json` should follow these rules:

### Nesting

Some scripts may be nested under other scripts using the colon (`:`) symbol. This can interchangeably be used to mean either:

- The nested script is a fragment of the parent script.
  - E.g.:
    ```json
    {
      "build": "npm run build:bundles && npm run build:definitions",
      "build:bundles": "...",
      "build:definitions": "..."
    }
    ```
- The nested script is an alternative configuration of the parent script.
  - E.g.:
    ```json
    {
      "e2e": "cypress run --browser chrome",
      "e2e:firefox": "cypress run --browser firefox",
      "e2e:watch": "cypress open"
    }
    ```

### `build` script

- Generates all the files needed for a dependent project to run.
- Doesn't expect another script from the same project to be run before this script.
- If the build fails, exits with an error.

### `dev` script

- Generates all the files needed for a dependent project to run.
- Doesn't expect another script from the same project to be run before this script.
- Automatically re-runs when there's a code change in the project or its dependencies.
- Doesn't exit until the user chooses to.
- May serve the project with a URL.

### `prod` script

- Expects the `build` script to be run before this script.
- Runs the build.
- May serve the project with a URL.

### `test` script

- Runs all unit tests and/or integration tests for the project.
- **Doesn't** run end-to-end tests.
- Doesn't expect another script from the same project to be run before this script.
- If all tests pass, exits without an error.
- If any test fails, exits with an error.

### `test:watch` script

Does the same thing as the `test` script, except:

- Re-runs tests when there's a code change in the project.
- Doesn't exit until the user chooses to.

### `e2e` script

- Does the same thing as the `test` script, but runs end-to-end tests instead.

### `e2e:watch` script

- Does the same thing as the `test:watch` script, but runs end-to-end tests instead.

### `publish:*` script

- Expects the `build` script to be run before this script.
- Publishes a remote package.

#### `publish:npm:*` script

- Publishes the package to NPM.
- Uses an alpha/prerelease tag.

#### `publish:sfdx` script

- Publishes the package to the current Salesforce dev hub.

### `promote:*` script

- Promotes a remote package.
- Should be run after QA validations.

#### `promote:npm:beta` and `promote:npm:latest` scripts

- Promotes an NPM package.

#### `promote:sfdx` script

- Promotes a package in the current Salesforce dev hub.

### `lint:check` script

- Doesn't expect another script from the same project to be run before this script.
- If there's no linting errors, exits without an error.
- If there's any linting error, exits with an error.

### `lint:fix` script

- Checks for linting errors and tries to fix them.

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
