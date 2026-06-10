# Implementation Plan: headless-bueno-zod-migration

## Overview

This plan migrates `@coveo/headless` from class-based `@coveo/bueno` validation to Zod 4 mini schemas via `@coveo/bueno/zod`. The migration proceeds layer-by-layer: central utility first, then shared definitions, then action creators, then controllers, then special cases, then type guard replacements, then tests, and finally verification.

## Tasks

- [x] 1. Rewrite the central validation utility
  - [x] 1.1 Rewrite `packages/headless/src/utils/validate-payload.ts` to use Zod
    - Replace all imports from `@coveo/bueno` with `import {z} from '@coveo/bueno/zod'`
    - Rewrite `validatePayload` to accept a `z.ZodType` and use `safeParse`
    - Rewrite `validatePayloadAndThrow` to accept a `z.ZodType` and use `parse`
    - Rewrite `validateOptions` and `validateInitialState` to accept a `z.ZodType`
    - Rewrite `serializeSchemaValidationError` to accept `z.ZodError | Error`
    - Replace all pre-built Bueno instances (`requiredNonEmptyString`, `nonEmptyString`, `requiredEmptyAllowedString`, `nonRequiredEmptyAllowedString`, `nonEmptyStringArray`, `optionalNonEmptyVersionString`, `optionalTrackingId`, `requiredTrackingId`) with equivalent Zod schemas per the design mapping table
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.2 Write property tests for `validate-payload.ts`
    - **Property 2: validatePayload Contract**
    - **Property 3: Pre-built Schema Equivalence**
    - **Property 4: Error Serialization Shape**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [x] 2. Migrate shared facet definitions
  - [x] 2.1 Migrate `packages/headless/src/controllers/core/facets/_common/facet-option-definitions.ts`
    - Replace all Bueno imports with `import {z} from '@coveo/bueno/zod'`
    - Convert `facetId`, `field`, `basePath`, `delimitingCharacter`, `filterByBasePath`, `filterFacetCount`, `injectionDepth`, `numberOfValues`, `generateAutomaticRanges`, `facetSearch`, `allowedValues`, `hasBreadcrumbs`, `customSort` to Zod schemas using the design mapping table
    - _Requirements: 9.1_

  - [x] 2.2 Migrate `packages/headless/src/features/facets/generic/facet-actions-validation.ts`
    - Update `facetIdDefinition` to reference the Zod-based `requiredNonEmptyString` (import stays the same, only the underlying type changes)
    - Remove any `@coveo/bueno` imports if present
    - _Requirements: 9.2_

  - [x] 2.3 Migrate `packages/headless/src/features/facets/facet-set/facet-set-validate-payload.ts`
    - Replace `NumberValue` import with `import {z} from '@coveo/bueno/zod'`
    - Convert `facetValueDefinition` to a Zod object schema using `requiredNonEmptyString` and `z.optional(z.number().check(z.minimum(0)))`
    - _Requirements: 9.3_

- [x] 3. Migrate feature action creators (batch 1 — core search actions)
  - [x] 3.1 Migrate `packages/headless/src/features/query/query-actions.ts`
    - Replace `BooleanValue, StringValue` imports with `import {z} from '@coveo/bueno/zod'`
    - Convert inline schema to `z.object({q: z.optional(z.string()), enableQuerySyntax: z.optional(z.boolean())})`
    - _Requirements: 3.1, 3.3, 3.9_

  - [x] 3.2 Migrate `packages/headless/src/features/facets/facet-set/facet-set-actions.ts`
    - Replace all Bueno imports with `import {z} from '@coveo/bueno/zod'`
    - Convert `facetRegistrationOptionsDefinition` and all inline schemas to Zod equivalents
    - Update references to `allowedValues`, `customSort`, `facetIdDefinition`, `facetValueDefinition` (these are now Zod schemas from tasks 2.1–2.3)
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.10, 3.11_

  - [x] 3.3 Migrate `packages/headless/src/features/facets/category-facet-set/category-facet-set-actions.ts`
    - Replace Bueno imports with Zod, convert all schemas
    - _Requirements: 3.1, 3.6, 3.7, 3.10_

  - [x] 3.4 Migrate `packages/headless/src/features/search/search-actions.ts` and `packages/headless/src/features/search/legacy/search-actions.ts`
    - Replace Bueno imports with Zod in both files
    - _Requirements: 3.1_

  - [x] 3.5 Migrate `packages/headless/src/features/facets/facet-set/facet-set-controller-actions.ts` and `packages/headless/src/features/facets/facet-set/facet-set-analytics-actions.ts`
    - Replace Bueno imports with Zod, convert schemas
    - _Requirements: 3.1, 3.2_

  - [x] 3.6 Migrate `packages/headless/src/features/facets/category-facet-set/category-facet-set-analytics-actions.ts`
    - Replace Bueno imports with Zod, convert schemas
    - _Requirements: 3.1_

- [x] 4. Migrate feature action creators (batch 2 — remaining actions)
  - [x] 4.1 Migrate generated-answer, recent-queries, recent-results, did-you-mean actions
    - Files: `features/generated-answer/generated-answer-actions.ts`, `features/recent-queries/recent-queries-actions.ts`, `features/recent-results/recent-results-actions.ts`, `features/did-you-mean/did-you-mean-actions.ts`
    - Replace Bueno imports with Zod, convert all schemas
    - _Requirements: 3.1, 3.3, 3.6, 3.7_

  - [x] 4.2 Migrate advanced-search-queries, case-assist-configuration, dictionary-field-context actions
    - Files: `features/advanced-search-queries/advanced-search-queries-actions.ts`, `features/case-assist-configuration/case-assist-configuration-actions.ts`, `features/dictionary-field-context/dictionary-field-context-actions.ts`
    - Replace Bueno imports with Zod, convert all schemas
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.3 Migrate excerpt-length, facet-options, result-preview, triggers actions
    - Files: `features/excerpt-length/excerpt-length-actions.ts`, `features/facet-options/facet-options-actions.ts`, `features/result-preview/result-preview-actions.ts`, `features/triggers/triggers-actions.ts`, `features/triggers/trigger-analytics-actions.ts`
    - Replace Bueno imports with Zod, convert all schemas
    - _Requirements: 3.1, 3.6, 3.7_

  - [x] 4.4 Migrate tab-set, query-suggest, case-context, insight-user-actions, attached-results actions
    - Files: `features/tab-set/tab-set-actions.ts`, `features/query-suggest/query-suggest-actions.ts`, `features/case-context/case-context-actions.ts`, `features/insight-user-actions/insight-user-actions-actions.ts`, `features/attached-results/attached-results-actions.ts`
    - Replace Bueno imports with Zod, convert all schemas
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.5 Migrate `features/static-filter-set/static-filter-set-schema.ts`
    - Replace Bueno imports with Zod, convert schema
    - _Requirements: 3.1, 3.2_

- [x] 5. Checkpoint - Verify action creator migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Migrate controller options (batch 1 — core search controllers)
  - [x] 6.1 Migrate `controllers/core/pager/headless-core-pager.ts`
    - Replace `Schema`/`NumberValue` usage with `z.object(...)` schema
    - Update `validateOptions` call to pass Zod schema
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Migrate `controllers/core/results-per-page/headless-core-results-per-page.ts`
    - Replace Bueno schema with Zod schema for `numberOfResults` validation
    - _Requirements: 4.1, 4.2_

  - [x] 6.3 Migrate `controllers/core/search-box/headless-core-search-box-options.ts`
    - Replace Bueno schema with Zod schema
    - _Requirements: 4.1, 4.2_

  - [x] 6.4 Migrate `controllers/core/tab/headless-core-tab.ts`
    - Replace Bueno schema with Zod schema
    - _Requirements: 4.1, 4.2_

  - [x] 6.5 Migrate `controllers/core/sort/headless-core-sort.ts`
    - Replace Bueno schema with Zod schema
    - _Requirements: 4.1, 4.2_

  - [x] 6.6 Migrate `controllers/core/context/headless-core-context.ts`
    - Replace Bueno schema with Zod schema
    - _Requirements: 4.1, 4.2_

  - [x] 6.7 Migrate `controllers/core/result-list/headless-core-result-list.ts` and `controllers/core/folded-result-list/headless-core-folded-result-list.ts`
    - Replace Bueno schemas with Zod schemas
    - _Requirements: 4.1, 4.2_

- [x] 7. Migrate controller options (batch 2 — facet controllers)
  - [x] 7.1 Migrate `controllers/core/facets/facet/headless-core-facet-options.ts`
    - Replace Bueno schema with Zod schema using shared definitions from task 2.1
    - _Requirements: 4.1, 4.2, 9.1_

  - [x] 7.2 Migrate `controllers/core/facets/category-facet/headless-core-category-facet-options.ts`
    - Replace Bueno schema with Zod schema
    - _Requirements: 4.1, 4.2, 9.1_

  - [x] 7.3 Migrate `controllers/core/facets/range-facet/date-facet/headless-date-facet-options.ts` and `controllers/core/facets/range-facet/numeric-facet/headless-numeric-facet-options.ts`
    - Replace Bueno schemas with Zod schemas
    - _Requirements: 4.1, 4.2_

  - [x] 7.4 Migrate `controllers/facets/facet/headless-facet-options.ts` and `controllers/insight/facets/facet/headless-insight-facet-options.ts`
    - Replace Bueno schemas with Zod schemas
    - _Requirements: 4.1, 4.2_

- [x] 8. Migrate controller options (batch 3 — commerce + remaining controllers)
  - [x] 8.1 Migrate commerce controllers
    - Files: `controllers/commerce/core/pagination/headless-core-commerce-pagination.ts`, `controllers/commerce/core/sort/headless-core-commerce-sort.ts`, `controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ts`, `controllers/commerce/core/sub-controller/headless-sub-controller.ts`, `controllers/commerce/instant-products/headless-instant-products.ts`, `controllers/commerce/search-box/headless-search-box-options.ts`, `controllers/commerce/standalone-search-box/headless-standalone-search-box-options.ts`, `controllers/commerce/recent-queries-list/headless-recent-queries-list.ts`
    - Replace Bueno schemas with Zod schemas in each file
    - _Requirements: 4.1, 4.2_

  - [x] 8.2 Migrate remaining search controllers
    - Files: `controllers/core/recent-queries-list/headless-core-recent-queries-list.ts`, `controllers/core/search-parameter-manager/headless-core-search-parameter-manager.ts`, `controllers/standalone-search-box/headless-standalone-search-box-options.ts`, `controllers/relevance-inspector/headless-relevance-inspector.ts`, `controllers/recent-results-list/headless-recent-results-list.ts`, `controllers/instant-results/instant-results-options.ts`, `controllers/url-manager/headless-url-manager.ts`, `controllers/static-filter/headless-static-filter.ts`
    - Replace Bueno schemas with Zod schemas in each file
    - _Requirements: 4.1, 4.2_

  - [x] 8.3 Migrate case-assist and recommendation controllers
    - Files: `controllers/case-input/headless-case-input.ts`, `controllers/case-field/headless-case-field.ts`, `controllers/recommendation/headless-recommendation.ts`
    - Replace Bueno schemas with Zod schemas in each file
    - _Requirements: 4.1, 4.2_

- [x] 9. Checkpoint - Verify controller migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Migrate special cases
  - [x] 10.1 Migrate `packages/headless/src/features/templates/templates-manager.ts`
    - Replace `ArrayValue, NumberValue, Schema, SchemaValidationError, Value` imports with `import {z} from '@coveo/bueno/zod'`
    - Convert `templateSchema` to `z.object({content: z.unknown(), conditions: z.unknown(), priority: z.optional(z.number().check(z.minimum(0))), fields: z.optional(z.array(requiredNonEmptyString))})`
    - Replace `templateSchema.validate(template)` with `templateSchema.parse(template)`
    - Replace `throw new SchemaValidationError(...)` with `throw new Error(...)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 10.2 Migrate `packages/headless/src/api/search/date/relative-date.ts`
    - Replace `NumberValue, Schema, StringValue` imports with `import {z} from '@coveo/bueno/zod'`
    - Replace `buildRelativeDateDefinition` with discriminated union: `nowSchema`, `pastOrNextSchema`, and `relativeDateSchema = z.union([nowSchema, pastOrNextSchema])`
    - Update `validateRelativeDate` to use `relativeDateSchema.parse(relativeDate)` instead of `new Schema(definition).validate(relativeDate)`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 10.3 Migrate `packages/headless/src/features/analytics/analytics-utils.ts`
    - Replace `import {isNullOrUndefined, RecordValue, Schema, StringValue} from '@coveo/bueno'` with `import {z} from '@coveo/bueno/zod'`
    - Replace `isNullOrUndefined(source)` calls with `source == null`
    - Replace `isNullOrUndefined(author)` with `author == null`
    - Convert `rawPartialDefinition` and `resultPartialDefinition` to Zod schemas
    - Replace `new Schema(resultPartialDefinition).validate(...)` with the Zod equivalent `.parse(...)`
    - _Requirements: 7.1, 3.1, 3.3_

  - [x] 10.4 Write property tests for relative date validation
    - **Property 6: Relative Date Conditional Validation**
    - **Validates: Requirements 6.2, 6.3**

- [x] 11. Replace type guard imports across all remaining files
  - [x] 11.1 Replace `isNullOrUndefined` usages
    - Files: `controllers/history-manager/headless-history-manager.ts`, `controllers/insight/attached-results/headless-attached-results.ts`, `controllers/insight/attach-to-case/headless-attach-to-case.ts`, `api/search/search-api-client.ts`, `features/generated-answer/generated-answer-selectors.ts`, `features/search-and-folding/search-and-folding-request.ts`, `features/search-and-folding/legacy/search-and-folding-request.ts`, `features/search/search-actions-thunk-processor.ts`, `features/search/legacy/search-actions-thunk-processor.ts`, `features/attached-results/attached-results-slice.ts`, `features/query-set/query-set-slice.ts`, `features/tab-set/tab-set-slice.ts`
    - Replace `isNullOrUndefined(x)` with `x == null`
    - Remove the `isNullOrUndefined` import from `@coveo/bueno`
    - _Requirements: 7.1_

  - [x] 11.2 Replace `isUndefined` and `isString` usages
    - Files: `features/advanced-search-queries/advanced-search-queries-slice.ts` (isUndefined), `features/attached-results/attached-results-utils.ts` (isString)
    - Replace `isUndefined(x)` with `x === undefined`
    - Replace `isString(x)` with `typeof x === 'string'`
    - Remove imports from `@coveo/bueno`
    - _Requirements: 7.2, 7.3_

- [x] 12. Checkpoint - Verify type guard replacements
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Update test files
  - [x] 13.1 Update test files that import from `@coveo/bueno`
    - Files: `controllers/core/recent-queries-list/headless-core-recent-queries-list.test.ts`, `controllers/commerce/recent-queries-list/headless-recent-queries-list.test.ts`, `controllers/commerce/core/parameter-manager/headless-core-parameter-manager.test.ts`, `controllers/commerce/core/sub-controller/headless-sub-controller.test.ts`
    - Replace `@coveo/bueno` imports with `@coveo/bueno/zod` or remove them
    - Update assertions referencing `SchemaValidationError` to assert against appropriate Zod error types or the serialized error format
    - _Requirements: 10.1, 10.2_

  - [x] 13.2 Update any remaining test files that assert on `SchemaValidationError`
    - Search for `SchemaValidationError` references in test files
    - Replace with assertions on the new error format (e.g., check for `ZodError` name or serialized error shape)
    - _Requirements: 10.2, 10.3_

  - [x] 13.3 Write property tests for schema mapping equivalence
    - **Property 1: Schema Mapping Equivalence**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.10, 3.11**

  - [x] 13.4 Write property tests for controller validation contract
    - **Property 5: Controller Validation Contract**
    - **Validates: Requirements 2.7, 4.2, 4.3, 4.4**

- [x] 14. Final verification
  - [x] 14.1 Verify zero `@coveo/bueno` root imports remain in headless source
    - Run grep to confirm no `from '@coveo/bueno'` or `from "@coveo/bueno"` in `packages/headless/src/**/*.ts`
    - If any remain, migrate them
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 14.2 Run TypeScript build and full test suite
    - Run `tsc --noEmit` in `packages/headless` to verify type correctness
    - Run `pnpm run test` in `packages/headless` to verify all tests pass
    - Fix any remaining issues
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 10.3_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The design uses TypeScript throughout — all code examples and implementations use TypeScript
- The Zod mini API uses `.check()` for constraints: `z.string().check(z.minLength(1))` NOT `z.string().min(1)`
- `z.optional(schema)` wraps a schema to make it optional
- Files within the same batch can be migrated in any order since they don't write to the same files
- Type guard replacements (task 11) are independent of schema migrations and can run in parallel with controller migrations

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "11.1", "11.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 8, "tasks": ["10.4", "13.1", "13.2"] },
    { "id": 9, "tasks": ["13.3", "13.4"] },
    { "id": 10, "tasks": ["14.1", "14.2"] }
  ]
}
```
