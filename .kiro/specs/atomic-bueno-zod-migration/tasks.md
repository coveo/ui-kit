# Implementation Plan: Atomic Bueno → Zod Migration

## Overview

This plan migrates ~60+ Atomic component files from `@coveo/bueno` class-based validation to Zod 4 mini schemas via `@coveo/bueno/zod`. The migration proceeds in four phases: core infrastructure (ValidatePropsController), type guard replacements, component schema migrations by category, and final verification. Each phase builds incrementally so no orphaned code exists between steps.

## Tasks

- [x] 1. Rewrite ValidatePropsController to use Zod
  - [x] 1.1 Rewrite `validate-props-controller.ts` to accept a Zod schema and use `safeParse`
    - Replace `import type {Schema} from '@coveo/bueno'` with `import {z} from '@coveo/bueno/zod'`
    - Change the `schema` parameter type from `Schema<TProps>` to `z.ZodMiniType<any>` (via a local type alias `AnyZodSchema`)
    - Replace the `validateProps()` method body: use `this.schema.safeParse(this.currentProps)` instead of `this.schema.validate(this.currentProps)` in a try/catch
    - Format error messages from `result.error.issues` with path and message for each issue
    - Preserve all existing lifecycle behavior: `hostConnected`, `hostUpdate`, deep equality skip, external error detection, `throwOnError` toggle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 5.1, 5.2, 5.3, 5.4, 5.5, 7.3_

  - [x] 1.2 Update `validate-props-controller.spec.ts` to use Zod schemas
    - Replace `import {Schema, StringValue} from '@coveo/bueno'` with `import {z} from '@coveo/bueno/zod'`
    - Replace `new Schema({name: new StringValue({constrainTo: ['valid', 'also-valid']})})` with `z.object({name: z.optional(z.enum(['valid', 'also-valid']))})`
    - Change `vi.spyOn(mockSchema, 'validate')` to `vi.spyOn(mockSchema, 'safeParse')`
    - Update all assertions referencing `schemaSpy` to reflect `safeParse` call semantics
    - Ensure all existing test cases pass with the new Zod-based fixtures
    - _Requirements: 6.3, 8.1, 8.3_

  - [x] 1.3 Write property test for ValidatePropsController safeParse contract
    - **Property 2: ValidatePropsController safeParse Contract**
    - Use fast-check to generate arbitrary props objects and Zod schemas
    - Verify: sets `host.error` on failure with `throwOnError=true`, logs warning with `throwOnError=false`, clears error on success
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.5**

  - [x] 1.4 Write property test for error message content
    - **Property 3: Error Message Content**
    - Use fast-check to generate arbitrary field names and invalid values
    - Verify: error messages contain the property path (field name) of the failing prop
    - **Validates: Requirements 5.2, 5.4**

  - [x] 1.5 Write property test for validation skip on unchanged props
    - **Property 4: Validation Skip on Unchanged Props**
    - Use fast-check to generate arbitrary props, call `hostUpdate` twice with same props
    - Verify: `safeParse` is not called on the second update when props are deep-equal
    - **Validates: Requirements 2.8**

- [x] 2. Replace type guard imports with native JS checks
  - [x] 2.1 Replace `isArray` in `field-warning.ts` and update `field-warning.spec.ts`
    - In `src/components/common/item-text/field-warning.ts`: replace `import {isArray} from '@coveo/bueno'` and `isArray(itemValueRaw)` with `Array.isArray(itemValueRaw)`
    - In `field-warning.spec.ts`: remove `vi.mock('@coveo/bueno', {spy: true})`, remove `vi.mocked(isArray)` usage, test behavior directly by passing array/non-array values and asserting on `mockLogger.error`
    - _Requirements: 4.1, 4.3, 4.5, 4.6, 4.7, 8.2, 8.4_

  - [x] 2.2 Replace `isUndefined` in `item-text-fallback.ts` and update `item-text-fallback.spec.ts`
    - In `src/components/common/item-text/item-text-fallback.ts`: replace `import {isUndefined} from '@coveo/bueno'` and `isUndefined(x)` with `x === undefined`
    - In `item-text-fallback.spec.ts`: remove `vi.mock('@coveo/bueno', {spy: true})`, remove `vi.mocked(isUndefined)` usage, test behavior directly by passing `undefined` vs defined values
    - _Requirements: 4.2, 4.5, 4.6, 4.7, 8.2, 8.4_

  - [x] 2.3 Replace `isNullOrUndefined` in `suggestion-manager.ts`
    - Replace `import {isNullOrUndefined} from '@coveo/bueno'` with inline `x == null` checks
    - Remove the import statement entirely
    - _Requirements: 4.1, 4.5, 4.7_

  - [x] 2.4 Replace `isUndefined` in `atomic-result-link.ts` and `atomic-ipx-result-link.ts`
    - In both files: replace `import {isUndefined} from '@coveo/bueno'` and `isUndefined(x)` with `x === undefined`
    - Remove the import statements entirely
    - _Requirements: 4.2, 4.5, 4.7_

  - [x] 2.5 Replace `isNullOrUndefined` in search components (`atomic-result-localized-text.ts`, `atomic-automatic-facet.ts`, `atomic-search-box.ts`)
    - In each file: replace `import {isNullOrUndefined} from '@coveo/bueno'` and `isNullOrUndefined(x)` with `x == null`
    - Remove the import statements entirely
    - _Requirements: 4.1, 4.5, 4.7_

  - [x] 2.6 Replace type guards in commerce components (`atomic-product-link.ts`, `atomic-commerce-query-error.ts`, `atomic-product-image.ts`, `atomic-commerce-facet-number-input.ts`)
    - Replace `isUndefined(x)` with `x === undefined` and `isNullOrUndefined(x)` with `x == null`
    - Remove all `@coveo/bueno` import statements from these files
    - _Requirements: 4.1, 4.2, 4.5, 4.7_

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Migrate search component schemas (batch 1: result components)
  - [x] 4.1 Migrate `atomic-result.ts` schema to Zod
    - Replace `import {Schema, StringValue} from '@coveo/bueno'` with `import {z} from '@coveo/bueno/zod'`
    - Convert `new Schema({display: new StringValue({constrainTo: [...]}), ...})` to `z.object({display: z.optional(z.enum([...])), ...})`
    - _Requirements: 3.1, 3.7, 1.3, 7.2_

  - [x] 4.2 Migrate `atomic-result-list.ts` schema to Zod
    - Replace `import {ArrayValue, Schema, StringValue} from '@coveo/bueno'` with `import {z} from '@coveo/bueno/zod'`
    - Convert schema including `ArrayValue` fields to `z.optional(z.array(z.string()))`
    - _Requirements: 3.1, 3.5, 3.7, 1.3, 7.2_

  - [x] 4.3 Migrate `atomic-folded-result-list.ts` schema to Zod
    - Replace Bueno imports with `import {z} from '@coveo/bueno/zod'`
    - Convert schema with StringValue, NumberValue, and ArrayValue fields
    - _Requirements: 3.1, 3.2, 3.5, 3.7, 1.3, 7.2_

  - [x] 4.4 Migrate `atomic-result-text.ts`, `atomic-result-html.ts`, `atomic-result-date.ts`, `atomic-result-number.ts` schemas to Zod
    - Replace Bueno imports and convert schemas using StringValue and BooleanValue to z.optional(z.enum(...)), z.optional(z.string()), z.optional(z.boolean())
    - _Requirements: 3.1, 3.3, 3.4, 3.7, 1.3, 7.2_

  - [x] 4.5 Migrate `atomic-result-rating.ts`, `atomic-result-timespan.ts`, `atomic-result-multi-value-text.ts`, `atomic-result-printable-uri.ts` schemas to Zod
    - Convert schemas with NumberValue (min/max) to z.optional(z.number().check(z.minimum(N)))
    - _Requirements: 3.1, 3.2, 3.7, 1.3, 7.2_

  - [x] 4.6 Migrate `atomic-result-image.ts`, `atomic-quickview.ts` schemas to Zod
    - Replace Bueno imports and convert StringValue schemas
    - _Requirements: 3.1, 3.7, 1.3, 7.2_

  - [x] 4.7 Write property test for schema mapping equivalence
    - **Property 1: Schema Mapping Equivalence**
    - Use fast-check to generate arbitrary string inputs and verify that `z.enum([...])` accepts/rejects the same values as `new StringValue({constrainTo: [...]})`
    - Test NumberValue min/max equivalence with `z.number().check(z.minimum(N), z.maximum(M))`
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

- [x] 5. Migrate search component schemas (batch 2: facets and navigation)
  - [x] 5.1 Migrate `atomic-pager.ts` and `atomic-breadbox.ts` schemas to Zod
    - Convert NumberValue schemas to z.optional(z.number().check(z.minimum(N)))
    - _Requirements: 3.2, 3.7, 1.3, 7.2_

  - [x] 5.2 Migrate `atomic-category-facet.ts` and `atomic-facet.ts` schemas to Zod
    - Convert complex schemas with NumberValue, StringValue, ArrayValue
    - _Requirements: 3.1, 3.2, 3.5, 3.7, 1.3, 7.2_

  - [x] 5.3 Migrate `atomic-rating-facet.ts` and `atomic-rating-range-facet.ts` schemas to Zod
    - Convert schemas including RecordValue fields to `z.optional(z.record(z.string()))`
    - Convert required StringValue fields to `z.string().check(z.minLength(1))`
    - _Requirements: 3.1, 3.2, 3.6, 3.8, 3.7, 1.3, 7.2_

  - [x] 5.4 Migrate `atomic-numeric-facet.ts`, `atomic-color-facet.ts`, `atomic-timeframe-facet.ts` schemas to Zod
    - Convert complex schemas with NumberValue min/max and StringValue constrainTo
    - _Requirements: 3.1, 3.2, 3.7, 1.3, 7.2_

  - [x] 5.5 Migrate `atomic-facet-manager.ts`, `atomic-automatic-facet-generator.ts`, `atomic-notifications.ts`, `atomic-smart-snippet-suggestions.ts` schemas to Zod
    - Convert NumberValue-only schemas
    - _Requirements: 3.2, 3.7, 1.3, 7.2_

  - [x] 5.6 Migrate `atomic-did-you-mean.ts`, `atomic-tab.ts`, `atomic-html.ts`, `atomic-sort-expression.ts` schemas to Zod
    - Convert StringValue and ArrayValue schemas
    - _Requirements: 3.1, 3.5, 3.7, 1.3, 7.2_

  - [x] 5.7 Migrate `atomic-generated-answer.ts` schema to Zod
    - Convert NumberValue schema
    - _Requirements: 3.2, 3.7, 1.3, 7.2_

- [x] 6. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Migrate common and remaining component schemas
  - [x] 7.1 Migrate `atomic-timeframe.ts` schema to Zod
    - Convert mixed required/optional schema: `unit` field uses `z.enum([...])` (required, non-empty via minLength not needed since enum validates presence), `period` uses `z.optional(z.enum([...]))`, `amount` uses `z.optional(z.number().check(z.minimum(1)))`
    - _Requirements: 3.1, 3.2, 3.8, 3.7, 1.3, 7.2_

  - [x] 7.2 Migrate commerce components with schemas (`atomic-commerce-product-list.ts`, `atomic-commerce-recommendation-list.ts`, `atomic-commerce-breadbox.ts`, `atomic-commerce-pager.ts`, `atomic-commerce-facets.ts`)
    - Replace Bueno imports and convert NumberValue/StringValue schemas to Zod equivalents
    - _Requirements: 3.1, 3.2, 3.7, 1.3, 7.2_

  - [x] 7.3 Migrate commerce product components (`atomic-product-description.ts`, `atomic-product-excerpt.ts`)
    - Replace Bueno imports and convert StringValue schemas
    - _Requirements: 3.1, 3.7, 1.3, 7.2_

  - [x] 7.4 Migrate insight components (all 12 files)
    - Migrate `atomic-insight-timeframe-facet.ts`, `atomic-insight-user-actions-timeline.ts`, `atomic-insight-numeric-facet.ts`, `atomic-insight-folded-result-list.ts`, `atomic-insight-result-quickview-action.ts`, `atomic-insight-result-list.ts`, `atomic-insight-result.ts`, `atomic-insight-generated-answer.ts`, `atomic-insight-user-actions-toggle.ts`, `atomic-insight-pager.ts`, `atomic-insight-facet.ts`, `atomic-insight-smart-snippet-suggestions.ts`
    - Replace Bueno imports and convert all schemas to Zod equivalents following the same mapping patterns
    - _Requirements: 3.1, 3.2, 3.5, 3.7, 1.3, 7.2_

  - [x] 7.5 Migrate recommendations components (`atomic-recs-result.ts`, `atomic-recs-list.ts`)
    - Replace Bueno imports and convert schemas
    - _Requirements: 3.1, 3.2, 3.7, 1.3, 7.2_

  - [x] 7.6 Migrate IPX component (`atomic-ipx-recs-list.ts`) schema to Zod
    - Replace Bueno imports and convert NumberValue/StringValue schema
    - _Requirements: 3.1, 3.2, 3.7, 1.3, 7.2_

- [x] 8. Final verification
  - [x] 8.1 Verify zero `@coveo/bueno` imports remain in Atomic source and test files
    - Run grep to confirm no `from '@coveo/bueno'` imports remain in `packages/atomic/src/**/*.ts`
    - Confirm all schema-using files import `z` from `@coveo/bueno/zod`
    - Confirm no remaining `isNullOrUndefined`, `isArray`, `isString`, `isUndefined` imports from bueno
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 8.2 Run TypeScript compilation, tests, build, and lint
    - Run `tsc --noEmit` in the atomic package to verify no type errors
    - Run `pnpm run test` in the atomic package to verify all unit tests pass
    - Run `pnpm run build` in the atomic package to verify successful build
    - Run `pnpm run lint:check` in the atomic package to verify no lint errors
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript throughout; no language selection needed
- The Bueno → Zod mapping reference in the design document should be used for all schema conversions
- Property tests use `fast-check` and validate behavioral equivalence between old and new schemas
- Checkpoints ensure incremental validation between major phases
- Insight components follow the same patterns as search components; batch them for efficiency
- The `@coveo/bueno/zod` entrypoint re-exports `zod/mini` and is NOT considered an adapter layer (Requirement 7.4)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 3, "tasks": ["4.7", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"] },
    { "id": 4, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 5, "tasks": ["8.1", "8.2"] }
  ]
}
```
