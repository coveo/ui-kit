# Mock Cache Bust Plugin - Implementation Summary

## Overview

This implementation adds a Vite plugin to the atomic-default project that solves browser caching issues with mocked modules in Vitest browser mode tests.

## Files Added/Modified

### New Files

1. **`scripts/vite-plugin-mock-cache-bust.mjs`** (main plugin implementation)
   - Pre-phase plugin: Scans test files for `vi.mock()` and `vi.mocked()` calls
   - Post-phase plugin: Rewrites imports to add query parameters
   - Regex-based parsing (no external dependencies)

2. **`scripts/vite-plugin-mock-cache-bust.spec.mjs`** (unit tests)
   - Comprehensive test suite for the plugin
   - Tests all major functionality and edge cases

3. **`scripts/vite-plugin-mock-cache-bust.md`** (documentation)
   - Detailed documentation with examples
   - Usage instructions and implementation details

4. **`scripts/validate-plugin.mjs`** (validation script)
   - 13 validation tests covering all scenarios
   - Can be run independently: `node scripts/validate-plugin.mjs`

### Modified Files

1. **`vitest.config.js`**
   - Imported the plugin
   - Added pre and post-phase plugin instances to the plugins array
   - Updated test include pattern to include `scripts/**/*.spec.mjs`

## How It Works

### Problem
When running tests with Vitest in browser mode, mocked modules can be aggressively cached by browsers, causing interference between tests.

### Solution

The plugin operates in two phases:

#### Pre-phase (enforce: 'pre')
1. Scans each `.spec.ts` file
2. Extracts module paths from:
   - `vi.mock('module-path')` calls
   - `vi.mocked(importName)` calls (resolves identifier to module path)
3. Stores this information in a shared map

#### Post-phase (enforce: 'post')
1. For each `.spec.ts` file with mocked modules:
   - Rewrites import statements to add a unique query parameter
   - Example: `'@coveo/headless'` → `'@coveo/headless?mock=a1b2c3d4'`
2. Files without mocked modules are left unchanged
3. Each file gets a unique 8-character hash ID based on its path

### Example Transformation

**Before:**
```typescript
import {buildController} from '@coveo/headless';
import {html} from 'lit';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
```

**After:**
```typescript
import {buildController} from '@coveo/headless?mock=a1b2c3d4';
import {html} from 'lit';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
```

Note: Only the `@coveo/headless` import is modified because it's the only one that's mocked.

## Supported Patterns

### vi.mock() Patterns
- `vi.mock('module-path')`
- `vi.mock("module-path")`
- `vi.mock('./relative/path')`
- `vi.mock('@scope/package')`
- `vi.mock('@scope/package/subpath')`
- `vi.mock('./module?inline')` (preserves query params)

### vi.mocked() Patterns
- `vi.mocked(importName)`
- `vi.mocked(namespace.property)`
- Automatically resolves to the import source

### Import Patterns
- Default imports: `import foo from 'module'`
- Named imports: `import {foo, bar} from 'module'`
- Namespace imports: `import * as foo from 'module'`
- Type imports: `import type {Foo} from 'module'`
- Mixed imports: `import foo, {bar} from 'module'`

## Testing

### Run Validation Script
```bash
cd packages/atomic
node scripts/validate-plugin.mjs
```

### Run Manual Test
```bash
cd packages/atomic
node -e "
import('./scripts/vite-plugin-mock-cache-bust.mjs').then(module => {
  const [prePhase, postPhase] = module.mockCacheBustPlugin();
  const testCode = \`
    import {vi} from 'vitest';
    import {buildController} from '@coveo/headless';
    vi.mock('@coveo/headless', {spy: true});
  \`;
  prePhase.transform(testCode, '/test.spec.ts');
  const result = postPhase.transform(testCode, '/test.spec.ts');
  console.log(result.code);
});
"
```

### Run Unit Tests
```bash
cd packages/atomic
npm run test:lit -- scripts/vite-plugin-mock-cache-bust.spec.mjs
```

## Implementation Details

### No External Dependencies
- Uses only Node.js built-in modules (crypto for hashing)
- Regex-based parsing instead of Babel/AST
- No additional package dependencies needed

### Performance Considerations
- Only processes `.spec.ts` files
- Regex operations are fast and efficient
- Shared state between phases avoids duplicate work
- File path hashing ensures consistent IDs across runs

### Edge Cases Handled
- Modules with existing query parameters (e.g., `?inline`)
- Type imports (e.g., `import type {...}`)
- Multiple imports from the same module
- Mixed import styles in the same file
- Comments in import statements
- Single and double quotes

### Limitations
- Only processes `.spec.ts` files
- Regex-based parsing may not handle extremely complex patterns
- Does not modify dynamic imports (`import()`)
- Does not process `require()` statements (ES modules only)

## Validation Results

All 13 validation tests pass:
- ✓ Plugin structure (2 instances, correct names, correct enforce values)
- ✓ Basic vi.mock() detection and transformation
- ✓ vi.mocked() detection and transformation
- ✓ Multiple mocked modules
- ✓ Non-spec files are properly skipped
- ✓ Files without mocks remain untransformed
- ✓ Type imports are transformed
- ✓ Existing query parameters are preserved
- ✓ Consistent IDs for the same file
- ✓ Different IDs for different files
- ✓ Complex real-world test file handling

## Future Enhancements

Possible improvements (not currently needed):
1. Add support for dynamic imports if needed
2. Add caching of parsed results for better performance
3. Add more detailed logging/debugging options
4. Support for custom file patterns beyond `.spec.ts`
5. AST-based parsing for more robust code analysis

## Troubleshooting

### Plugin not transforming imports
- Check that the file has `.spec.ts` extension
- Verify that `vi.mock()` calls are present in the file
- Ensure the plugin is properly registered in `vitest.config.js`

### Imports not resolving
- The plugin only adds query parameters, resolution is handled by Vite
- Check that the original import path is correct
- Query parameters should not affect module resolution

### Tests still interfering
- Verify that the transformed imports include `?mock=<id>`
- Check browser dev tools network tab for cache headers
- Clear browser cache if needed

## References

- [Vitest Browser Mode](https://vitest.dev/guide/browser.html)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)
