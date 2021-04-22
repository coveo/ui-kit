# Adding a sub-package

Headless provides exports through multiple sub packages. A sub-package groups together exports (i.e. controllers, actions, reducers, engines) that work together as a cohesive unit. By separating exports into sub-packages, it becomes clear to users of headless what exports are available to build a use-case.


## To add a new sub-package:

1. Create an entry file for your sub-package inside the `src` directory (e.g. case-assist.ts).
2. Configure nodejs and browser bundles inside `rollup.config.js` for your entry file.
3. Create a new directory with the name of your sub-package at the project root.
4. Inside the new directory, add a `package.json` file and fill in the paths to your bundled files and type definitions.
5. Add the directory name to the `files` array in the project root `package.json` file.

```json
pkg/case-assist/package.json

{
  "name": "case-assist",
  "description": "Headless Case Assist Module",
  "main": "../dist/case-assist/headless.js",
  "module": "../dist/case-assist/headless.esm.js",
  "browser": "../dist/browser/case-assist/headless.esm.js",
  "types": "../dist/definitions/case-assist.index.d.ts",
  "license": "Apache-2.0"
}
```

## Testing your sub-package:

1. Build the headless project: `npm run build`.
2. Create a tarball: `npm pack`.
3. Install the tarball as a dependency of a different project: `npm i <path to the tarball>`.
4. Import an export from your sub-package: `import {...} from '@coveo/headless/<sub-package>'`


That's all!