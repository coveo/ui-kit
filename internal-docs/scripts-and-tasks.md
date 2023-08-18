# Scripts and tasks

When adding packages or changing scripts, make sure that scripts for each `package.json` follow these rules:

## Nesting

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
      "e2e:watch": "cypress open --browser chrome --e2e"
    }
    ```

## `build` script

- Generates all the files needed for a dependent project to run.
- Doesn't expect another script from the same project to be run before this script.
- If the build fails, exits with an error.

## `dev` script

- Generates all the files needed for a dependent project to run.
- Doesn't expect another script from the same project to be run before this script.
- Automatically re-runs when there's a code change in the project or its dependencies.
- Doesn't exit until the user chooses to.
- May serve the project with a URL.

## `prod` script

- Expects the `build` script to be run before this script.
- Runs the build.
- May serve the project with a URL.

## `test` script

- Runs all unit tests and/or integration tests for the project.
- **Doesn't** run end-to-end tests.
- Doesn't expect another script from the same project to be run before this script.
- If all tests pass, exits without an error.
- If any test fails, exits with an error.

## `test:watch` script

Does the same thing as the `test` script, except:

- Re-runs tests when there's a code change in the project.
- Doesn't exit until the user chooses to.

## `e2e` script

- Does the same thing as the `test` script, but runs end-to-end tests instead.

## `e2e:watch` script

- Does the same thing as the `test:watch` script, but runs end-to-end tests instead.

### `publish:sfdx` script

- Publishes the package to the current Salesforce dev hub.

## `promote:*` script

- Promotes a remote package.
- Should be run after QA validations.

### `promote:npm:latest` script

- Promotes an NPM package to `latest`.

### `promote:sfdx` script

- Promotes a package in the current Salesforce dev hub.

## `lint:check` script

- Doesn't expect another script from the same project to be run before this script.
- If there's no linting errors, exits without an error.
- If there's any linting error, exits with an error.

## `lint:fix` script

- Checks for linting errors and tries to fix them.
