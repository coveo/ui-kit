# Implementation Plan: Converse Routed Commerce Search

## Overview

Add a `case 'CUSTOM':` handler to `GenerativeRuntime.dispatchEvent` that routes recognized custom events through the existing `hydrateSubInterface` pipeline, plus comprehensive unit and property-based tests covering the new branch, existing SSE parsing, and hydration query resolution.

## Tasks

- [x] 1. Implement CUSTOM event handler in GenerativeRuntime
  - [x] 1.1 Add `case 'CUSTOM':` branch to `dispatchEvent` in `generative-runtime.ts`
    - Add a new case in the `switch (event.type)` block in `GenerativeRuntime.dispatchEvent`
    - Call `this.hydrateSubInterface(event.name, event.value, this.currentPrompt)`
    - If result is non-null: call `statePort.setRoutedInterface` and `statePort.completeTurn`, return `{turnId, isTerminal: true}`
    - If result is null: return `{turnId, isTerminal: false}` without calling any state port methods
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 3.2_

- [x] 2. Add unit tests for GenerativeRuntime.dispatchEvent CUSTOM handling
  - [x] 2.1 Create `generative-runtime.test.ts` with unit tests for the new CUSTOM case
    - Create file at `packages/thermidor/src/internal/api/generative/generative-runtime.test.ts`
    - Mock `GenerativeStatePort` and `hydrateSubInterface`
    - Test: recognized CUSTOM event with successful hydration → verifies `setRoutedInterface` + `completeTurn` called, returns `{isTerminal: true}`
    - Test: unrecognized CUSTOM event (hydration returns null) → verifies no state port methods called, returns `{isTerminal: false}`
    - Test: `currentPrompt` is forwarded to `hydrateSubInterface` as the query parameter
    - Test: stream ending with only an unrecognized CUSTOM event → verifies `failTurn` called via `consumeStream` onDone
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 3.2, 3.3_

  - [x] 2.2 Write property test: recognized CUSTOM event produces terminal dispatch (Property 1)
    - **Property 1: Recognized CUSTOM event produces terminal dispatch with routed interface**
    - Use `fast-check` to generate arbitrary `CustomEvent` payloads with names from `['commerce-search-api-response', 'search-api-response']`
    - Mock `hydrateSubInterface` to return a generated `RoutedInterface`
    - Assert `setRoutedInterface` and `completeTurn` called, result is `{isTerminal: true}`
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1**

  - [x] 2.3 Write property test: unrecognized CUSTOM event produces non-terminal dispatch (Property 2)
    - **Property 2: Unrecognized CUSTOM event produces non-terminal dispatch with no state mutation**
    - Use `fast-check` to generate arbitrary event names NOT in the routing table
    - Assert result is `{isTerminal: false}` and zero interactions with `GenerativeStatePort`
    - **Validates: Requirements 1.5, 3.1, 3.2**

- [x] 3. Extend hydration tests for query resolution
  - [x] 3.1 Add tests to `generative-hydration.test.ts` for effective query resolution (Property 3)
    - **Property 3: Effective query resolution uses correctedQuery when non-empty, otherwise falls back to user prompt**
    - Use `fast-check` to generate commerce payloads with/without `queryCorrection.correctedQuery` and random prompt strings
    - Assert the search box state matches the expected effective query
    - Also add example-based tests: payload with `queryCorrection.correctedQuery` → uses corrected query; payload without → uses fallback prompt; no query → search box not set
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Extend SSE parser tests for CUSTOM event variations
  - [x] 5.1 Add unit tests to `sse-parser.test.ts` for CUSTOM event edge cases
    - Test: CUSTOM with name padded with whitespace → name is trimmed
    - Test: CUSTOM with missing/null/whitespace-only name → defaults to `"custom"`
    - Test: CUSTOM with no `value` field but `payload` field → uses `payload`
    - Test: CUSTOM with neither `value` nor `payload` → uses entire parsed object
    - Test: CUSTOM that fails AG-UI schema validation → still produces `type: 'CUSTOM'` (not UnknownEvent)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.2 Write property test: SSE parser preserves CUSTOM event name and value (Property 4)
    - **Property 4: SSE parser preserves CUSTOM event name (trimmed) and value (exact)**
    - Use `fast-check` to generate random non-empty strings (with whitespace padding) and random JSON-serializable values
    - Construct SSE frames and parse them with `parseSSEEvent`
    - Assert name is trimmed and value is deeply equal to original
    - **Validates: Requirements 4.1, 4.4**

  - [x] 5.3 Write property test: SSE parser fallback always produces valid CustomEvent (Property 5)
    - **Property 5: SSE parser fallback always produces a valid CustomEvent (never UnknownEvent)**
    - Use `fast-check` to generate CUSTOM SSE frames with missing/null/whitespace names, missing value fields, and extra fields that break schema validation
    - Assert the result always has `type === 'CUSTOM'` with appropriate defaults
    - **Validates: Requirements 4.2, 4.3, 4.5**

- [x] 6. Add `fast-check` as a devDependency to `@coveo/thermidor`
  - [x] 6.1 Add `fast-check` to `packages/thermidor/package.json` devDependencies
    - Add `"fast-check": "^3.22.0"` to devDependencies
    - Run `pnpm install` to update the lockfile
    - _Requirements: (infrastructure for property tests)_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The only production code change is task 1.1 (adding the `case 'CUSTOM':` branch)
- The SSE parser and hydration layer require no production changes — they already handle CUSTOM events correctly
- `fast-check` must be added as a devDependency (task 6.1) before property tests can run
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "6.1"] },
    { "id": 1, "tasks": ["2.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "5.2", "5.3"] }
  ]
}
```
