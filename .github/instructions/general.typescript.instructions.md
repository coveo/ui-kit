---
applyTo: '**/*.ts, **/*.tsx'
---

## Type Safety

**Avoid `any` types.** Use union types, generics, or conditional types to maintain type safety.

**When `any` is required** (third-party APIs, complex type constraints):
- Add a `// biome-ignore lint/suspicious/noExplicitAny: <reason>` comment explaining why
- Document the external constraint (e.g., "third-party API requires 'any'")

**Type assertions** (`as Type`) are acceptable for:
- Narrowing union types when you have runtime guarantees
- Test fixtures with intentionally invalid data (use `as unknown as Type`)
- Working around temporary type system limitations

Avoid double assertions (`as any as Type`) in production code—they bypass all type checking.

## Import Organization

**Use path aliases** when both conditions are met:
1. The package `tsconfig.json` defines path mappings (check `compilerOptions.paths`)
2. Importing from **outside the current file's directory** (any `../` import)

**Use relative imports** only for:
- Same-directory imports (`./local-file`)
- Packages without configured path aliases

**Rationale:** Path aliases improve refactoring resilience, eliminate import path maintenance when moving files, and provide consistent absolute references.

**Examples (Atomic package with `@/*` alias configured):**

```typescript
// ✅ Correct: Path aliases for anything outside current directory
import {bindings} from '@/src/decorators/bindings';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderButton} from '@/src/components/common/button';
import {renderQueryErrorContainer} from '@/src/components/common/query-error/container';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';

// ✅ Correct: Relative for same-directory files
import {localHelper} from './local-helper';
import type {LocalType} from './types';

// ❌ Incorrect: Relative paths leaving current directory
import {renderButton} from '../../../common/button';
import {bindings} from '../../../decorators/bindings';
import {renderQueryErrorContainer} from '../../common/query-error/container';

// ❌ Incorrect: Path alias for same-directory import
import {localHelper} from '@/src/components/search/atomic-query-error/local-helper';
```

**Migration note:** Existing code may use relative imports for component navigation. New code and migrations should follow the path alias convention above.

## Module Structure

**Prefer focused modules** that encapsulate a single concept over broad "utility" files.

**Export organization** (optional, not enforced): Group public exports before private helpers for scanability.
