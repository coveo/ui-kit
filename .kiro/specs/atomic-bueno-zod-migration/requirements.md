# Requirements Document

## Introduction

This specification covers the migration of the `packages/atomic/` package from the class-based `@coveo/bueno` validation API (Schema, StringValue, NumberValue, BooleanValue, ArrayValue, RecordValue) to Zod 4 mini schemas imported through the `@coveo/bueno/zod` facade entrypoint. The migration follows the same patterns established in the `@coveo/headless` migration. Approximately 60+ component files are affected across search, commerce, insight, recommendations, ipx, and common directories. The core change involves rewriting the `ValidatePropsController` (a Lit ReactiveController) to accept Zod schemas instead of Bueno Schema instances, and converting all component-level prop schema definitions to Zod equivalents.

## Glossary

- **Atomic**: The `@coveo/atomic` Lit-based web component library for building UIs on the Coveo platform
- **Bueno_Classic**: The root `@coveo/bueno` entrypoint exporting class-based validation (Schema, StringValue, NumberValue, etc.)
- **Bueno_Zod**: The `@coveo/bueno/zod` entrypoint that re-exports all of `zod/mini` (Zod 4)
- **ValidatePropsController**: A Lit ReactiveController at `src/components/common/validate-props-controller/validate-props-controller.ts` that validates component props against a schema on host connection and update
- **Props_Schema**: A `new Schema(definition)` instance defined as a static property on an Atomic component, used to validate props at runtime
- **Type_Guard**: A simple runtime type check function (e.g., `isNullOrUndefined`, `isArray`, `isString`, `isUndefined`) previously imported from Bueno_Classic
- **Zod_Schema**: A Zod 4 mini schema object (created via `z.object()`, `z.string()`, etc.) that validates data via `.parse()` or `.safeParse()`
- **Component_Host**: The Lit element instance that owns the `ValidatePropsController`, exposing an `error` state property for validation failures

## Requirements

### Requirement 1: Eliminate All Bueno_Classic Imports from Atomic

**User Story:** As a maintainer, I want all Atomic source files to stop importing from `@coveo/bueno` (the root entrypoint), so that the package uses modern Zod schemas exclusively.

#### Acceptance Criteria

1. THE Atomic package SHALL contain zero import statements matching `from '@coveo/bueno'` (the root entrypoint, without subpath) in non-test source files (`.ts`, `.tsx`) under `packages/atomic/src/`
2. THE Atomic package SHALL contain zero import statements matching `from '@coveo/bueno'` in test files (`.spec.ts`, `.spec.tsx`) under `packages/atomic/src/`
3. WHEN a component file requires validation schemas (replacing Schema, StringValue, NumberValue, BooleanValue, ArrayValue, or RecordValue), THE file SHALL import `z` from `@coveo/bueno/zod` and construct Zod schema objects
4. WHEN a file requires only Type_Guard functionality (isNullOrUndefined, isArray, isString, isUndefined), THE file SHALL use inline JavaScript checks (`x == null`, `Array.isArray(x)`, `typeof x === 'string'`, `x === undefined`) instead of importing from either Bueno entrypoint
5. THE ValidatePropsController SHALL accept Zod schemas after migration, removing its `import type {Schema} from '@coveo/bueno'` statement

### Requirement 2: Rewrite ValidatePropsController to Accept Zod Schemas

**User Story:** As a developer, I want the `ValidatePropsController` to validate props using a Zod schema, so that all Atomic components benefit from Zod validation through the same reactive controller pattern.

#### Acceptance Criteria

1. THE ValidatePropsController SHALL accept a Zod_Schema (a `z.ZodMiniType` instance) as its schema parameter instead of a Bueno `Schema<T>` instance
2. WHEN the Component_Host updates and props have changed since the last validation (determined by deep equality comparison), THE ValidatePropsController SHALL validate the current props by calling the Zod schema's `safeParse` method with the current props object
3. WHEN validation succeeds, THE ValidatePropsController SHALL set the Component_Host `error` property to `undefined`
4. WHEN validation fails and `throwOnError` is true, THE ValidatePropsController SHALL set the Component_Host `error` property to an Error whose message contains the Zod validation issue messages, and store the error reference internally for external-error detection
5. WHEN validation fails and `throwOnError` is false, THE ValidatePropsController SHALL log a warning to the console via `console.warn` with a message containing the component tag name (lowercase) and the Zod validation issue messages, passing the host element as an additional argument
6. IF the Component_Host `error` property is already set and was not set by the controller itself, THEN THE ValidatePropsController SHALL skip validation and preserve the existing error
7. WHEN the Component_Host connects to the DOM with its `error` property set to `null`, THE ValidatePropsController SHALL normalize the `error` property to `undefined`
8. THE ValidatePropsController SHALL preserve the existing optimization of skipping validation when props have not changed since the last validation (deep equality check via the existing `deepEqual` utility)

### Requirement 3: Migrate Component Props_Schema Definitions

**User Story:** As a developer, I want each component's static `propsSchema` to be expressed as a Zod object schema, so that prop validation uses Zod natively.

#### Acceptance Criteria

1. WHEN a component previously defined `new Schema({field: new StringValue({constrainTo: values})})`, THE component SHALL define `z.object({field: z.optional(z.enum(values))})` as its schema
2. WHEN a component previously defined `new Schema({field: new NumberValue({min: N})})`, THE component SHALL define `z.object({field: z.optional(z.number().check(z.minimum(N)))})` as its schema; WHEN the original definition also included `max: M`, THE component SHALL additionally include `z.maximum(M)` in the check (e.g., `z.number().check(z.minimum(N), z.maximum(M))`)
3. WHEN a component previously defined `new Schema({field: new BooleanValue()})`, THE component SHALL define `z.object({field: z.optional(z.boolean())})` as its schema
4. WHEN a component previously defined `new Schema({field: new StringValue()})` (unconstrained, with no `required: true` option), THE component SHALL define `z.object({field: z.optional(z.string())})` as its schema; this rule applies only to fields where `required` is absent or `false` in the original Bueno config
5. WHEN a component previously defined `new Schema({field: new ArrayValue({each: X})})`, THE component SHALL define `z.object({field: z.optional(z.array(Z))})` where Z is the Zod equivalent of the Bueno value type X (applying the same mapping rules from criteria 1–4 to the element type); WHEN the original definition also included `max: M`, THE component SHALL include `z.maxLength(M)` as a check on the array (e.g., `z.array(Z).check(z.maxLength(M))`)
6. WHEN a component previously defined `new Schema({field: new RecordValue({options: {required: false}})})`, THE component SHALL define `z.object({field: z.optional(z.record(z.string()))})` as its schema
7. WHEN a component passes its schema to `ValidatePropsController`, THE component SHALL pass the Zod object schema directly
8. WHEN a component previously defined a field with `new StringValue({required: true, emptyAllowed: false})`, THE component SHALL define that field as `z.string().check(z.minLength(1))` without wrapping in `z.optional()`, ensuring the field is required and non-empty in the Zod schema

### Requirement 4: Replace Type_Guard Imports with Inline Checks

**User Story:** As a developer, I want type guard functions to be replaced with inline JavaScript checks, so that Atomic does not depend on Bueno for trivial utilities.

#### Acceptance Criteria

1. WHEN a file previously imported `isNullOrUndefined` from Bueno_Classic, THE file SHALL use `x == null` (loose equality covering both null and undefined)
2. WHEN a file previously imported `isUndefined` from Bueno_Classic, THE file SHALL use `x === undefined`
3. WHEN a file previously imported `isArray` from Bueno_Classic, THE file SHALL use `Array.isArray(x)`
4. WHEN a file previously imported `isString` from Bueno_Classic, THE file SHALL use `typeof x === 'string'`
5. WHEN a type guard was the only symbol imported from `@coveo/bueno` in a file, THEN THE file SHALL remove the `@coveo/bueno` import statement entirely
6. WHEN a test file previously mocked a type guard function imported from `@coveo/bueno`, THE test file SHALL be updated to test the inline check directly without mocking, and all assertions referencing the mocked guard SHALL be removed or replaced with assertions on the resulting behavior
7. WHEN any type guard replacement is applied, THE file SHALL use JavaScript standard checks (e.g., `Array.isArray`, `typeof`, strict/loose equality) which are preferred over exact Bueno_Classic behavioral compatibility; minor behavioral differences where native checks are more correct (e.g., cross-frame array detection) are acceptable

### Requirement 5: Maintain Runtime Validation Behavior

**User Story:** As a consumer of Atomic, I want the migration to preserve the same prop validation behavior, so that component validation failures surface identically.

#### Acceptance Criteria

1. WHEN a component receives valid prop values, THE ValidatePropsController SHALL clear any previous validation error on the Component_Host and SHALL NOT set a new error
2. WHEN a component receives an invalid prop value (e.g., a string not in the constrained set, a number below the minimum) and `throwOnError` is true (the default), THE ValidatePropsController SHALL set the Component_Host `error` property to an Error whose message includes the name of the invalid prop and the constraint that was violated
3. WHEN a component's `throwOnError` is configured as false and the component receives an invalid prop value, THE ValidatePropsController SHALL log a console warning containing the component's tag name and the validation failure description, and SHALL NOT set the Component_Host `error` property
4. THE error messages produced by Zod validation SHALL include, for each invalid prop, the property name and the specific constraint violated (e.g., expected enum values, minimum numeric bound) so that a developer can identify the failing prop without inspecting source code
5. WHEN props change from invalid values to valid values, THE ValidatePropsController SHALL clear the previously set validation error on the Component_Host, restoring the component to a non-error state

### Requirement 6: Maintain Build and Test Integrity

**User Story:** As a developer, I want the Atomic package to compile and pass all tests after migration, so that the migration does not introduce regressions.

#### Acceptance Criteria

1. THE Atomic package SHALL compile without TypeScript errors after migration (`tsc --noEmit`)
2. THE existing unit test suite for the Atomic package SHALL pass with zero failures after migration, and no pre-existing test files SHALL be removed or disabled to achieve a passing result
3. THE ValidatePropsController unit tests in `validate-props-controller.spec.ts` SHALL replace Bueno_Classic schema fixtures (Schema, StringValue) with equivalent Zod_Schema fixtures (z.object, z.enum) and SHALL pass with zero failures simultaneously (no intermediate failing state is permitted)
4. THE Atomic package SHALL build successfully (`pnpm run build` in the atomic package) with zero errors and zero warnings treated as errors
5. THE Atomic package SHALL pass lint checks (`pnpm run lint:check`) with zero errors after migration

### Requirement 7: No Adapter Layer

**User Story:** As a maintainer, I want the migration to use Zod directly without compatibility shims, so that the codebase is fully Zod-native and does not carry translation overhead.

#### Acceptance Criteria

1. THE migration SHALL NOT introduce any module that exposes Bueno_Classic-compatible API signatures (Schema, StringValue, NumberValue, BooleanValue, ArrayValue, RecordValue) and internally delegates to Zod
2. WHEN converting a component schema, THE conversion SHALL call Zod API methods directly (z.object, z.string, z.number, z.enum, z.boolean, z.array, z.optional, and their check combinators) without an intermediary factory or builder that hides the Zod API from the call site
3. THE ValidatePropsController SHALL NOT import any type or class from `@coveo/bueno` (the root entrypoint), and SHALL NOT use any intermediary factory or abstraction layer that hides the Zod API, regardless of whether that factory originates from within the project or from external sources
4. THE migration SHALL permit importing `z` from `@coveo/bueno/zod` (Bueno_Zod), since that entrypoint is a pass-through re-export of `zod/mini` and does not constitute an adapter or translation layer

### Requirement 8: Update Test Files

**User Story:** As a developer, I want test files to use Zod constructs when testing validation behavior, so that tests align with the new validation implementation.

#### Acceptance Criteria

1. WHEN a test file previously imported Bueno_Classic classes (Schema, StringValue, NumberValue), THE test file SHALL import `z` from `@coveo/bueno/zod` and construct equivalent Zod schemas using `z.object({...})` with appropriate field definitions
2. WHEN a test file previously imported Type_Guard functions (isArray, isUndefined), THE test file SHALL replace their usage with inline JavaScript equivalents (`Array.isArray(x)`, `x === undefined`) and SHALL remove any `vi.mock` or `vi.mocked` calls targeting those functions
3. WHEN the `validate-props-controller.spec.ts` test creates schemas for test fixtures, THE test SHALL create Zod object schemas using `z.object({...})` and SHALL spy on the schema's `safeParse` method instead of the former `validate` method
4. WHEN a test file previously declared `vi.mock('@coveo/bueno', {spy: true})`, THE test file SHALL remove that mock declaration and any associated `vi.mocked` wrappers for Bueno_Classic functions that are replaced by inline JavaScript
