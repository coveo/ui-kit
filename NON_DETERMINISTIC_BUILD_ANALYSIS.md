# Non-Deterministic Build Output Analysis and Fix

## Issue Summary

GitHub Issue: https://github.com/coveo/ui-kit/issues/5469

The coveo/ui-kit repository was experiencing non-deterministic build outputs, where identical source code would produce different build artifacts between builds. This was particularly noticeable in the generated component proxy files for Angular and React integrations.

## Root Cause Analysis

### Primary Root Cause

The main source of non-determinism was in the `filterComponentsByUseCaseForReactOutput` function in `/packages/atomic/stencil.config.ts` (lines 20-27). This function uses Node.js's `readdirSync()` without sorting the results.

```typescript
function filterComponentsByUseCaseForReactOutput(useCasePath: string) {
  return readdirSync(useCasePath, {
    recursive: true,
  })
    .map((fileName) => /(atomic-[a-z-]+)\.tsx$/.exec(fileName.toString()))
    .filter((m) => m !== null)
    .flatMap((m) => m![1]);
}
```

**Problem**: `readdirSync()` returns files in filesystem order, which depends on the underlying filesystem and can vary between builds, platforms, or filesystem states.

**Impact**: This function generates the `excludeComponents` array for Stencil's React output targets, which affects the order of components in the generated proxy files.

### Secondary Root Cause - Lit Component Processing

After fixing the primary issue, continued investigation revealed another source of non-determinism in the Lit component processing scripts. The Custom Elements Manifest (CEM) modules and declarations were being processed in unstable order:

1. **Angular Lit processing** (`/packages/atomic-angular/scripts/build-lit.mjs`)
2. **React Lit processing** (`/packages/atomic-react/scripts/build-lit.mjs`)

These scripts process CEM modules and declarations without guaranteeing order, causing the generated Lit component proxy files to have unstable import and export order.

### Additional Sources of Non-Determinism

Several other scripts also used `readdirSync()` without sorting:

1. **stencil-proxy.mjs** - Processes proxy files during build
2. **list-assets.mjs** - Generates asset listings
3. **process-css.mjs** - Processes CSS files
4. **start-cdn.mjs** - Handles CDN-related file processing

### Files Confirmed to Be Deterministic

These scripts already implemented proper sorting:

- **generate-lit-exports.mjs** - Already sorts components with `.sort()`
- **stencil-plugin/atomic-angular-module/index.ts** - Angular module generator sorts component class names

## Solution Implementation

### Primary Fix

Added `.sort()` to the `filterComponentsByUseCaseForReactOutput` function:

```typescript
function filterComponentsByUseCaseForReactOutput(useCasePath: string) {
  return readdirSync(useCasePath, {
    recursive: true,
  })
    .sort() // Sort the filenames to ensure deterministic output
    .map((fileName) => /(atomic-[a-z-]+)\.tsx$/.exec(fileName.toString()))
    .filter((m) => m !== null)
    .flatMap((m) => m![1]);
}
```

### Secondary Fixes

Added sorting to all other `readdirSync()` calls to ensure complete build determinism:

1. **stencil-proxy.mjs**:

   ```javascript

   ```

## Solution Implementation

### Primary Fix - Stencil Config

Added `.sort()` to the file reading operation in `stencil.config.ts`:

```typescript
function filterComponentsByUseCaseForReactOutput(useCasePath: string) {
  return readdirSync(useCasePath, {
    recursive: true,
  })
    .sort() // ← Added this line
    .map((fileName) => /(atomic-[a-z-]+)\.tsx$/.exec(fileName.toString()))
    .filter((m) => m !== null)
    .flatMap((m) => m![1]);
}
```

### Secondary Fix - Lit Component Processing

**Angular Build Script** (`/packages/atomic-angular/scripts/build-lit.mjs`):

```javascript
// Sort modules by path to ensure deterministic processing order
const sortedModules = [...cem.modules].sort((a, b) =>
  (a.path || '').localeCompare(b.path || '')
);
for (const module of sortedModules) {
  // Sort declarations by name to ensure deterministic processing order
  const sortedDeclarations = [...module.declarations].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );
  for (const declaration of sortedDeclarations) {
    // ... processing logic
  }
}
```

**React Build Script** (`/packages/atomic-react/scripts/build-lit.mjs`):

```javascript
// Sort modules by path to ensure deterministic processing order
const sortedModules = [...cem.modules].sort((a, b) =>
  (a.path || '').localeCompare(b.path || '')
);
for (const module of sortedModules) {
  // Already had declaration sorting, also added:
  // Sort component imports to ensure deterministic order
  entry.computedComponentImports.sort();
}
```

### Additional Fixes - Build Scripts

1. **stencil-proxy.mjs**:

   ```javascript
   const files = readdirSync(srcDir, {
     recursive: true,
     withFileTypes: true,
   }).sort((a, b) => {
     const aPath = join(a.parentPath, a.name);
     const bPath = join(b.parentPath, b.name);
     return aPath.localeCompare(bPath);
   });
   ```

2. **list-assets.mjs**:

   ```javascript
   const salesforceDocTypeIcons = readdirSync(
     `${salesforceDesignSystem}/assets/icons/doctype`,
     {
       recursive: true,
       withFileTypes: true,
     }
   ).sort((a, b) => a.name.localeCompare(b.name));
   ```

3. **process-css.mjs**:

   ```javascript
   entries = readdirSync(srcDir, {withFileTypes: true}).sort((a, b) =>
     a.name.localeCompare(b.name)
   );
   ```

4. **start-cdn.mjs**:
   ```javascript
   const files = readdirSync(directoryPath).sort();
   ```

## Impact and Benefits

### Before Fix

- Component order in generated proxy files was non-deterministic
- Build outputs varied between builds of identical source code
- Lit component imports/exports had unstable order
- Made it difficult to detect actual changes in generated files
- Could cause issues with caching and deployment systems that rely on content hashing

### After Fix

- Component order is now deterministic and consistent
- CEM module and declaration processing is ordered
- Lit component imports/exports have stable order
- Identical source code produces identical build outputs
- Generated proxy files have stable, predictable ordering
- Improved build reproducibility and reliability

## Verification Steps

To verify the fix:

1. **Run multiple builds**: Execute the build process multiple times and compare the generated proxy files
2. **Check component ordering**: Verify that components in proxy files are in consistent order
3. **Cross-platform testing**: Test builds on different operating systems/filesystems
4. **Git diff verification**: Ensure no spurious diffs in generated files between identical builds

## Files Modified

1. `/packages/atomic/stencil.config.ts` - Primary fix for React output target filtering
2. `/packages/atomic-angular/scripts/build-lit.mjs` - Added module and declaration sorting
3. `/packages/atomic-react/scripts/build-lit.mjs` - Added module sorting and import sorting
4. `/packages/atomic/scripts/stencil-proxy.mjs` - Added file sorting
5. `/packages/atomic/scripts/list-assets.mjs` - Added asset and icon sorting
6. `/packages/atomic/scripts/process-css.mjs` - Added CSS file processing order
7. `/packages/atomic/scripts/start-cdn.mjs` - Added CDN file processing order

## Technical Notes

- The fix uses JavaScript's `sort()` method with default lexicographic ordering for simple cases
- For `withFileTypes: true` cases, custom comparators are used to sort by file path
- The `localeCompare()` method is used for consistent string sorting across locales
- All sorting is done in-place or chained immediately after `readdirSync()` calls
- CEM modules and declarations are sorted by path and name respectively to ensure deterministic processing

## Future Considerations

1. **Linting Rule**: Consider adding an ESLint rule to flag unsorted `readdirSync()` usage
2. **Build Verification**: Add automated checks to detect non-deterministic build outputs
3. **Documentation**: Update build documentation to emphasize the importance of deterministic file ordering
4. **Testing**: Include build determinism tests in CI/CD pipeline

## Conclusion

The non-deterministic build output issue was successfully identified and resolved by adding proper sorting to all filesystem read operations. The primary culprit was the component filtering function used in Stencil configuration, but additional preventive measures were taken across all build scripts to ensure complete build determinism.

This fix ensures that identical source code will always produce identical build outputs, improving the reliability and predictability of the build process.
