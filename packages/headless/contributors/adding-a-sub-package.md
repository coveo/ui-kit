# Adding a sub-package

Headless provides exports through multiple sub-packages.

A sub-package groups together exports (i.e. engine, controllers, action loaders, selectors, types, utilities) that work together as a cohesive unit. By separating exports into sub-packages, it becomes clear to users of Headless what exports are available to build a specific use-case.

## To add a new sub-package:

1. In the `headless/src` directory, create an entry file for your new sub-package (e.g. `headless/src/case-assist.index.ts`). Everything you export from this file will be part of the public API of your sub-package.
2. In `headless/esbuild.mjs`, Configure NodeJS add entries for your new sub-package in the `useCaseEntries` object and `getUmdGlobalName` function map.

   ```javascript
   // headless/esbuild.mjs

   // ...

   const useCaseEntries = {
     search: 'src/index.ts',
     recommendation: 'src/recommendation.index.ts',
     'case-assist': 'src/case-assist.index.ts',
     // ...
   };

   // ...

   function getUmdGlobalName(useCase) {
     const map = {
       search: 'CoveoHeadless',
       recommendation: 'CoveoHeadlessRecommendation',
       'case-assist': 'CoveoHeadlessCaseAssist',
       // ...
     };

     // ...
   }
   ```

3. In `headless/package.json`, add an entry point for your sub-package in the `exports` object.

   ````json
   // headless/package.json

   // ...
   "exports": {
     // ...
     "./case-assist": {
        "types": "./dist/definitions/case-assist.index.d.ts",
        "import": "./dist/case-assist/headless.esm.js",
        "require": "./dist/case-assist/headless.cjs",
        "default": "./dist/case-assist/headless.esm.js"
     },
     // ...
   }
   ``` 
   ````

## Testing your sub-package:

1. Build the headless project: `turbo build --filter=@coveo/headless`.
2. Create a tarball: from the `/packages/headless` directory, run `npm pack`.
3. Install the tarball as a dependency of a different project: `npm i <path to the tarball>`.
4. Import an export from your sub-package: `import {...} from '@coveo/headless/<sub-package>'`

That's all!
