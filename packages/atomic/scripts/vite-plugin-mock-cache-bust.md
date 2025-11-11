# Mock Cache Bust Plugin

## Overview

The `mockCacheBustPlugin` is a Vite plugin designed to solve browser caching issues with mocked modules in Vitest browser mode tests.

## Problem

When running tests with Vitest in browser mode, modules that are mocked using `vi.mock()` can be aggressively cached by browsers. This causes issues where:
- Mocked modules may not be properly isolated between tests
- Browser cache serves stale versions of modules
- Tests that mock the same module can interfere with each other

## Solution

The plugin operates in two phases:

### Pre-phase (enforce: 'pre')
- Scans test files (`.spec.ts`) to identify all modules that are mocked
- Detects `vi.mock('module-path')` calls
- Detects `vi.mocked(importName)` calls and resolves them to module paths
- Builds a registry mapping test files to their mocked module paths

### Post-phase (enforce: 'post')
- For test files that mock a module: Rewrites imports to add a unique query parameter
- For test files that don't mock the module: Leaves imports unchanged
- Ensures each test file gets its own cached version of mocked modules

## Usage

The plugin is already integrated into the `vitest.config.js` for the atomic-default project:

```javascript
import {mockCacheBustPlugin} from './scripts/vite-plugin-mock-cache-bust.mjs';

const [mockCacheBustPre, mockCacheBustPost] = mockCacheBustPlugin();

const atomicDefault = defineConfig({
  plugins: [
    // ... other plugins
    mockCacheBustPre,
    // ... other pre-phase plugins
    // ... other post-phase plugins
    mockCacheBustPost,
  ],
  // ... rest of config
});
```

## Examples

### Example 1: Basic vi.mock()

**Before transformation:**
```typescript
import {buildController} from '@coveo/headless';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
```

**After transformation:**
```typescript
import {buildController} from '@coveo/headless?mock=a1b2c3d4';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
```

### Example 2: vi.mocked()

**Before transformation:**
```typescript
import * as domUtils from './dom-utils';
import {vi} from 'vitest';

vi.mock('./dom-utils', {spy: true});

it('test', () => {
  vi.mocked(domUtils.closest).mockReturnValue(null);
});
```

**After transformation:**
```typescript
import * as domUtils from './dom-utils?mock=a1b2c3d4';
import {vi} from 'vitest';

vi.mock('./dom-utils', {spy: true});

it('test', () => {
  vi.mocked(domUtils.closest).mockReturnValue(null);
});
```

### Example 3: Multiple mocked modules

**Before transformation:**
```typescript
import {buildController} from '@coveo/headless';
import {someUtil} from './utils';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
vi.mock('./utils', {spy: true});
```

**After transformation:**
```typescript
import {buildController} from '@coveo/headless?mock=a1b2c3d4';
import {someUtil} from './utils?mock=a1b2c3d4';
import {vi} from 'vitest';

vi.mock('@coveo/headless', {spy: true});
vi.mock('./utils', {spy: true});
```

## Implementation Details

- **Regex-based parsing**: No Babel dependency needed, uses regex to extract mock patterns
- **Unique hash IDs**: Generates 8-character MD5 hash based on file path for consistency
- **Import pattern support**: Handles default, named, namespace, and type imports
- **Query parameter handling**: Preserves existing query parameters (e.g., `?inline` becomes `?inline&mock=...`)

## Supported Patterns

The plugin detects the following patterns:

1. **Direct vi.mock() calls:**
   - `vi.mock('module-path')`
   - `vi.mock("module-path", {spy: true})`
   - `vi.mock('./relative/path')`
   - `vi.mock('@scope/package')`

2. **vi.mocked() calls:**
   - `vi.mocked(importName)`
   - `vi.mocked(namespace.property)`
   - Plugin resolves the identifier to its import source

## Limitations

- Only processes `.spec.ts` files
- Uses regex-based parsing (not a full AST parser)
- May not handle extremely complex or dynamic import patterns
- The plugin does not modify `vi.mock()` or `vi.mocked()` calls themselves, only the import statements

## Testing

Manual testing can be done by running:

```bash
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

Unit tests are available in `scripts/vite-plugin-mock-cache-bust.spec.mjs`.
