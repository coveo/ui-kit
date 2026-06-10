# Requirements Document

## Introduction

This specification covers the migration of the `@coveo/headless` package from the class-based `@coveo/bueno` validation API (Schema, StringValue, NumberValue, BooleanValue, ArrayValue, RecordValue, EnumValue, Value) to Zod 4 mini schemas imported through the `@coveo/bueno/zod` facade entrypoint. The migration is big-bang: all ~60+ files are converted in one pass, eliminating all imports from the `@coveo/bueno` root entrypoint within headless.

## Glossary

- **Headless**: The `@coveo/headless` Redux-based package that provides search, commerce, and recommendation engine controllers
- **Bueno_Classic**: The root `@coveo/bueno` entrypoint exporting class-based validation (Schema, StringValue, NumberValue, etc.)
- **Bueno_Zod**: The `@coveo/bueno/zod` entrypoint that re-exports all of `zod/mini` (Zod 4)
- **Validate_Payload**: The central utility module at `packages/headless/src/utils/validate-payload.ts` that wraps Bueno validation for use with Redux Toolkit action creators
- **Schema_Definition**: A Bueno_Classic type representing an object where each key maps to a SchemaValue instance (used as the shape definition for validatePayload)
- **Action_Creator**: A Redux Toolkit action created with `createAction` that uses `validatePayload` as its prepare callback
- **Controller_Options_Schema**: A `new Schema(definition)` instance used in controller constructors to validate user-provided options
- **Type_Guard**: A simple runtime type check function (e.g., `isNullOrUndefined`, `isArray`, `isString`) previously imported from Bueno_Classic
- **Zod_Schema**: A Zod 4 mini schema object (created via `z.object()`, `z.string()`, etc.) that validates data via `.parse()` or `.safeParse()`
- **SafeParse_Result**: The return type of `zodSchema.safeParse(data)` containing either `{success: true, data}` or `{success: false, error}`

## Requirements

### Requirement 1: Eliminate All Bueno_Classic Imports

**User Story:** As a maintainer, I want all headless source files to import from `@coveo/bueno/zod` instead of `@coveo/bueno`, so that the package uses modern Zod schemas exclusively.

#### Acceptance Criteria

1. THE Headless package SHALL contain zero import statements referencing `@coveo/bueno` (the root entrypoint) in source files under `packages/headless/src/`
2. THE Headless package SHALL contain zero import statements referencing `@coveo/bueno` in test files under `packages/headless/src/`
3. WHEN a file requires validation schemas, THE file SHALL import from `@coveo/bueno/zod`
4. WHEN a file requires only Type_Guard functionality (isNullOrUndefined, isArray, isString), THE file SHALL use inline JavaScript checks or a local utility module instead of importing from either Bueno entrypoint

### Requirement 2: Rewrite Validate_Payload Utility

**User Story:** As a developer, I want the central `validate-payload.ts` utility to use Zod schemas internally, so that all action creators benefit from Zod validation without individual changes to their call sites.

#### Acceptance Criteria

1. THE Validate_Payload module SHALL export a `validatePayload` function that accepts a payload and a Zod_Schema, validates the payload using `safeParse`, and returns `{payload, error?}` matching the current return signature
2. THE Validate_Payload module SHALL export a `validatePayloadAndThrow` function that accepts a payload and a Zod_Schema, validates using `parse`, and throws on invalid input
3. THE Validate_Payload module SHALL export pre-built Zod schemas equivalent to the current pre-built StringValue instances: `requiredNonEmptyString`, `nonEmptyString`, `requiredEmptyAllowedString`, `nonRequiredEmptyAllowedString`
4. THE Validate_Payload module SHALL export a `nonEmptyStringArray` Zod schema equivalent to the current ArrayValue instance
5. THE Validate_Payload module SHALL export `optionalNonEmptyVersionString`, `optionalTrackingId`, and `requiredTrackingId` as Zod schemas with equivalent regex constraints
6. THE Validate_Payload module SHALL export a `serializeSchemaValidationError` function that converts a Zod error into a Redux Toolkit `SerializedError`
7. THE Validate_Payload module SHALL export `validateInitialState` and `validateOptions` functions that accept a Zod_Schema and validate controller initialization parameters

### Requirement 3: Migrate Action_Creator Validation Definitions

**User Story:** As a developer, I want each action creator's validation definition to be expressed as a Zod object schema, so that validation uses Zod natively.

#### Acceptance Criteria

1. WHEN an Action_Creator previously used an inline object of Bueno value instances as its definition, THE Action_Creator SHALL use a `z.object({...})` schema with equivalent field schemas
2. WHEN a field was defined as `new StringValue({required: true, emptyAllowed: false})`, THE equivalent Zod field SHALL be `z.string().check(z.minLength(1))`
3. WHEN a field was defined as `new StringValue({required: false})`, THE equivalent Zod field SHALL use `z.optional(z.string())`
4. WHEN a field was defined as `new StringValue({constrainTo: values})`, THE equivalent Zod field SHALL use `z.enum(values)` or `z.optional(z.enum(values))`
5. WHEN a field was defined as `new StringValue({regex: pattern})`, THE equivalent Zod field SHALL use `z.string().check(z.regex(pattern))`
6. WHEN a field was defined as `new NumberValue({required: true, min: N})`, THE equivalent Zod field SHALL use `z.number().check(z.minimum(N))`
7. WHEN a field was defined as `new NumberValue({required: false, min: N})`, THE equivalent Zod field SHALL use `z.optional(z.number().check(z.minimum(N)))`
8. WHEN a field was defined as `new BooleanValue({required: true})`, THE equivalent Zod field SHALL use `z.boolean()`
9. WHEN a field was defined as `new BooleanValue({required: false})` or `new BooleanValue()`, THE equivalent Zod field SHALL use `z.optional(z.boolean())`
10. WHEN a field was defined as `new ArrayValue({each: X})`, THE equivalent Zod field SHALL use `z.array(zodEquivalent(X))`
11. WHEN a field was defined as `new RecordValue({values: def})`, THE equivalent Zod field SHALL use `z.object({...})` with the nested definition translated to Zod
12. WHEN a field was defined as `new Value({required: false})`, THE equivalent Zod field SHALL use `z.optional(z.unknown())` or a more specific Zod type when the TypeScript type is known

### Requirement 4: Migrate Controller_Options_Schema Instances

**User Story:** As a developer, I want controller option validation to use Zod schemas, so that controllers validate their initialization arguments with Zod.

#### Acceptance Criteria

1. WHEN a controller previously created a `new Schema(definition)` for options validation, THE controller SHALL define a Zod object schema using `z.object({...})` with equivalent field definitions
2. WHEN a controller calls `validateOptions(engine, schema, obj, name)`, THE `validateOptions` function SHALL accept and validate against a Zod_Schema
3. WHEN a controller calls `validateInitialState(engine, schema, obj, name)`, THE `validateInitialState` function SHALL accept and validate against a Zod_Schema
4. WHEN validation fails in a controller, THE error logged to `engine.logger` SHALL contain an equivalent error message describing which fields are invalid

### Requirement 5: Migrate Template Validation

**User Story:** As a developer, I want the templates-manager module to validate templates using Zod, so that template registration uses Zod schemas consistently.

#### Acceptance Criteria

1. THE templates-manager module SHALL define a Zod object schema equivalent to the current `templateSchema`
2. WHEN a template is registered, THE templates-manager SHALL validate it using the Zod schema's `parse` method
3. WHEN template validation fails, THE templates-manager SHALL throw an error with a descriptive message
4. THE templates-manager SHALL continue to validate that each template condition is a function

### Requirement 6: Migrate Relative Date Validation

**User Story:** As a developer, I want relative date validation to use Zod schemas, so that date parsing and validation is consistent with the rest of headless.

#### Acceptance Criteria

1. THE relative-date module SHALL define Zod schemas for the `RelativeDate` structure with period, unit, and amount fields
2. WHEN `period` is `now`, THE amount and unit fields SHALL be optional in the Zod schema
3. WHEN `period` is `past` or `next`, THE amount field SHALL be required with a minimum of 1, and the unit field SHALL be required and constrained to valid units
4. WHEN `validateRelativeDate` is called with an invalid date, THE function SHALL throw an error with a descriptive message

### Requirement 7: Replace Type_Guard Imports

**User Story:** As a developer, I want type guard functions to be replaced with inline JavaScript checks, so that headless does not depend on Bueno for trivial utilities.

#### Acceptance Criteria

1. WHEN a file previously imported `isNullOrUndefined` from Bueno_Classic, THE file SHALL use `x == null` or equivalent inline check
2. WHEN a file previously imported `isArray` from Bueno_Classic, THE file SHALL use `Array.isArray(x)`
3. WHEN a file previously imported `isString` from Bueno_Classic, THE file SHALL use `typeof x === 'string'`
4. WHEN a file previously imported `isNumber` from Bueno_Classic, THE file SHALL use `typeof x === 'number'`

### Requirement 8: Maintain Runtime Validation Behavior

**User Story:** As a consumer of headless, I want the migration to preserve the same validation behavior, so that my existing integrations continue to work without changes.

#### Acceptance Criteria

1. WHEN an Action_Creator receives a valid payload, THE validation SHALL pass and the action SHALL be dispatched with the payload unchanged
2. WHEN an Action_Creator receives an invalid payload, THE validation SHALL produce a serialized error attached to the action's `error` field, matching the current behavior
3. WHEN a controller receives invalid options, THE controller SHALL throw an error and log it via `engine.logger`, matching the current behavior
4. THE public API types exported from headless SHALL remain compatible with existing consumer code (no breaking type changes to controller option interfaces or action payload interfaces)

### Requirement 9: Update Shared Facet Option Definitions

**User Story:** As a developer, I want the shared facet option definitions (facetId, field, numberOfValues, etc.) to be Zod schemas, so that all facet controllers and actions reference Zod definitions.

#### Acceptance Criteria

1. THE `facet-option-definitions.ts` module SHALL export Zod schemas for each shared facet option (facetId, field, filterFacetCount, injectionDepth, numberOfValues, facetSearch, allowedValues, customSort)
2. WHEN facet actions import shared definitions (e.g., `facetIdDefinition`), THE imported value SHALL be a Zod schema
3. THE facet value definition module (`facet-set-validate-payload.ts`) SHALL export Zod schemas for facet value validation

### Requirement 10: Update Test Files

**User Story:** As a developer, I want test files to use Zod constructs when asserting validation behavior, so that tests align with the new validation implementation.

#### Acceptance Criteria

1. WHEN a test file previously imported Bueno_Classic classes (e.g., `SchemaValidationError`, `ArrayValue`, `NumberValue`), THE test file SHALL use Zod equivalents or assert against the new error types
2. WHEN a test asserts that a validation error is a `SchemaValidationError`, THE test SHALL assert against the appropriate Zod error type or the serialized error format
3. THE existing test suite SHALL pass after migration with equivalent coverage
