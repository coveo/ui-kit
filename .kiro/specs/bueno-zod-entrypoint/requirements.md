# Requirements Document

## Introduction

This feature adds a new export path `@coveo/bueno/zod` to the Bueno package that re-exports Zod 4 mini APIs. This lets Atomic and Headless packages gradually migrate from Bueno's custom validation classes to Zod schemas while maintaining full backward compatibility with the existing `@coveo/bueno` entrypoint. The new entrypoint acts as a facade so that all Zod usage in downstream packages flows through Bueno, allowing centralized control over the validation layer.

## Glossary

- **Bueno**: The `@coveo/bueno` npm package, a value validation library used by Headless and Atomic
- **Zod_Mini**: The tree-shakeable subset of Zod 4 (`zod/mini`), optimized for minimal bundle size
- **Zod_Entrypoint**: The new `@coveo/bueno/zod` export path that re-exports Zod Mini APIs
- **Existing_Entrypoint**: The current `@coveo/bueno` export path (root entrypoint) with Schema, Value, StringValue, NumberValue, BooleanValue, EnumValue, RecordValue, and ArrayValue classes
- **Facade**: The architectural pattern where Bueno wraps and re-exports third-party APIs to provide a stable interface to consumers
- **Consumer**: Any package that depends on `@coveo/bueno`, primarily `@coveo/headless` and `@coveo/atomic`
- **Tree_Shaking**: Dead-code elimination performed by bundlers on unused ESM exports

## Requirements

### Requirement 1: New Package Export Path

**User Story:** As a developer working on Headless or Atomic, I want to import Zod Mini schemas from `@coveo/bueno/zod`, so that I can use Zod for validation without adding a direct Zod dependency.

#### Acceptance Criteria

1. THE Bueno package.json SHALL declare an `exports` entry for `"./zod"` that resolves to a dedicated bundle and type definitions
2. WHEN a Consumer imports from `@coveo/bueno/zod`, THE Zod_Entrypoint SHALL provide Zod_Mini's full public API surface
3. THE Zod_Entrypoint SHALL export only ESM format to maximize Tree_Shaking effectiveness
4. WHEN a Consumer does not import from `@coveo/bueno/zod`, THE Zod_Entrypoint code SHALL NOT be included in the Consumer's bundle due to Tree_Shaking

### Requirement 2: Backward Compatibility

**User Story:** As a developer maintaining packages that depend on Bueno, I want the existing `@coveo/bueno` import path to continue working without modification, so that this change does not break existing code.

#### Acceptance Criteria

1. THE Existing_Entrypoint SHALL continue to export Schema, SchemaValue, SchemaDefinition, SchemaValidationError, SchemaValues, Value, ValueConfig, PrimitivesValues, StringValue, NumberValue, BooleanValue, EnumValue, EnumValueConfig, RecordValue, ArrayValue, isNullOrUndefined, isUndefined, isNull, isString, isNumber, isBoolean, isBooleanOrUndefined, isNumberOrUndefined, isArray, and isRecord
2. THE Existing_Entrypoint SHALL preserve the same module resolution behavior for both ESM and CJS consumers: `require("@coveo/bueno")` SHALL resolve to the CJS bundle and `import from "@coveo/bueno"` SHALL resolve to the ESM bundle
3. WHEN a Consumer upgrades Bueno to a version containing the Zod_Entrypoint, THE Consumer SHALL NOT need to modify any existing import statements or build configuration

### Requirement 3: Zod Mini as Dependency

**User Story:** As a maintainer of the Bueno package, I want Zod 4 mini to be a production dependency of Bueno, so that it is available at runtime for consumers using the new entrypoint.

#### Acceptance Criteria

1. THE Bueno package.json SHALL list `zod` with a caret range on a 4.x release (e.g., `^4.0.0`) in its `dependencies` field so that Consumers receive it transitively without declaring their own dependency on Zod
2. THE Zod_Entrypoint SHALL re-export all public APIs from the `zod/mini` subpath of the installed Zod 4 package
3. WHEN the Zod package is updated, THE Facade SHALL isolate Consumers from internal Zod API changes because Consumers import from `@coveo/bueno/zod` rather than directly from `zod/mini`, allowing Bueno to pin, adapt, or restrict re-exports in a future release without requiring Consumer code changes

### Requirement 4: Build Configuration

**User Story:** As a developer building Bueno, I want the build system to produce a separate bundle for the Zod entrypoint, so that the existing bundle remains unchanged and the new entrypoint is independently tree-shakeable.

#### Acceptance Criteria

1. THE build system SHALL produce a dedicated ESM bundle for the Zod_Entrypoint at a path under `dist/` that does not overwrite any existing bundle file (dist/bueno.js, dist/bueno.esm.js, cdn/bueno.esm.js, cdn/bueno.js)
2. THE build system SHALL produce TypeScript type definitions for the Zod_Entrypoint in the `dist/definitions/` directory at a path matching the `types` condition declared in the package.json `exports` entry for `"./zod"`
3. THE build system SHALL mark `zod` as external when bundling the Zod_Entrypoint so that the output bundle contains no inlined Zod library code
4. WHEN the build runs, THE existing bundle outputs (dist/bueno.js, dist/bueno.esm.js, cdn/bueno.esm.js, cdn/bueno.js) SHALL remain byte-for-byte identical to a build produced without the Zod_Entrypoint present, given the same source input
5. THE Zod_Entrypoint bundle SHALL NOT include any code from the Existing_Entrypoint source, ensuring the two entrypoints are fully independent for Tree_Shaking purposes
6. THE build system SHALL NOT bundle `zod` into the existing bundle outputs (dist/bueno.js, dist/bueno.esm.js, cdn/bueno.esm.js, cdn/bueno.js)

### Requirement 5: Type Safety

**User Story:** As a TypeScript developer consuming `@coveo/bueno/zod`, I want full type inference and autocompletion from the Zod Mini API, so that schema definitions are type-safe.

#### Acceptance Criteria

1. WHEN a Consumer imports from `@coveo/bueno/zod`, THE TypeScript compiler SHALL resolve types and compile without type errors and without requiring additional `@types` packages
2. THE Zod_Entrypoint type definitions SHALL re-export all publicly exported type aliases, interfaces, and function signatures from `zod/mini` so that type inference and autocompletion are equivalent to importing directly from `zod/mini`
3. WHEN a Consumer's tsconfig uses `moduleResolution` set to `"node16"`, `"nodenext"`, or `"bundler"`, THE TypeScript compiler SHALL resolve the `@coveo/bueno/zod` import using the `types` condition declared in the `"./zod"` exports entry
4. WHEN a Consumer assigns a value produced by `@coveo/bueno/zod` schemas to a variable typed with the equivalent `zod/mini` type, THE TypeScript compiler SHALL report no type incompatibility errors

### Requirement 6: Package Validation

**User Story:** As a package maintainer, I want the package exports to pass publint validation, so that consumers on all supported module systems can resolve the entrypoint correctly.

#### Acceptance Criteria

1. WHEN publint is run against the Bueno package, THE Bueno package SHALL produce zero errors and zero warnings for both the `"."` and `"./zod"` export paths
2. THE `"./zod"` export entry SHALL list conditions in the following order: `types` first, `import` second, `default` last, so that Node.js condition matching resolves the most specific entry first
3. WHEN the Bueno package is packed for publishing, THE files referenced by the `"./zod"` export conditions (bundle and type definitions) SHALL exist within the directories declared in the package.json `files` field
