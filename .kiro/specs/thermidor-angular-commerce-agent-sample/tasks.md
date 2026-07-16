# Implementation Plan: Thermidor Angular Commerce Agent Sample

## Overview

This plan delivers two workstreams: (1) Thermidor library enhancements (persistence, reasoning, state snapshot), and (2) Angular sample adaptation to use Thermidor APIs. Library enhancements come first since the Angular sample depends on them. Within the library work, reasoning and state snapshot support are independent and can proceed in parallel, while persistence builds on both (its serialized format includes the new fields). After the library is enhanced, the Angular sample is integrated into the monorepo, rewired to use Thermidor, and cleaned up.

## Tasks

- [x] 1. Thermidor Library: Reasoning Event Support
  - [x] 1.1 Add `reasoningContent` field to `AgentResponse` and extend `GenerativeStatePort`
    - Add `reasoningContent: string` to the `AgentResponse` interface in `generative-types.ts`
    - Initialize `reasoningContent` to `''` in `initAgentResponse` action/reducer
    - Add `startReasoning`, `appendReasoningDelta`, `endReasoning` methods to `GenerativeStatePort` interface in `generative-runtime.ts`
    - Implement the corresponding action creators and reducer cases in the generative slice
    - `appendReasoningDelta` concatenates the delta string onto `agentResponse.reasoningContent`
    - _Requirements: 14.1, 14.2, 14.5, 14.6_

  - [x] 1.2 Handle reasoning events in `GenerativeRuntime.dispatchEvent`
    - Add cases for `REASONING_MESSAGE_START`, `REASONING_MESSAGE_CONTENT`, and `REASONING_MESSAGE_END` in the `dispatchEvent` switch
    - `REASONING_MESSAGE_START` calls `this.statePort.startReasoning(turnId)`
    - `REASONING_MESSAGE_CONTENT` calls `this.statePort.appendReasoningDelta(turnId, event.delta)`
    - `REASONING_MESSAGE_END` calls `this.statePort.endReasoning(turnId)`
    - _Requirements: 14.2, 14.3, 14.4_

  - [x]\* 1.3 Write property test for reasoning delta accumulation
    - **Property 11: Reasoning delta accumulation**
    - **Validates: Requirements 14.2, 14.3**

- [x] 2. Thermidor Library: State Snapshot Support
  - [x] 2.1 Add `stateSnapshot` field to `Turn` and extend `GenerativeStatePort`
    - Add `stateSnapshot: Record<string, unknown> | null` to the `Turn` interface in `generative-types.ts`
    - Initialize `stateSnapshot` to `null` when creating a turn
    - Add `setStateSnapshot(turnId: string, snapshot: Record<string, unknown>)` to `GenerativeStatePort`
    - Implement the action creator and reducer case in the generative slice
    - In the `completeTurn` reducer, set `stateSnapshot` to `null`
    - _Requirements: 15.1, 15.3, 15.4, 15.5_

  - [x] 2.2 Handle `STATE_SNAPSHOT` event in `GenerativeRuntime.dispatchEvent`
    - Add a case for `STATE_SNAPSHOT` that calls `this.statePort.setStateSnapshot(turnId, event.snapshot)`
    - _Requirements: 15.2_

  - [x]\* 2.3 Write property test for state snapshot storage
    - **Property 12: State snapshot storage**
    - **Validates: Requirements 15.2**

  - [x]\* 2.4 Write property test for state snapshot cleared on completion
    - **Property 13: State snapshot cleared on completion**
    - **Validates: Requirements 15.4**

- [x] 3. Thermidor Library: Conversation Persistence API
  - [x] 3.1 Define `SerializedConverseState` and `SerializedTurn` types
    - Create serialization types in a new file or alongside `converse-controller.ts`
    - `SerializedTurn` includes all Turn fields (id, prompt, status, error, stateSnapshot, agentResponse with reasoningContent) plus `routedInterface?: {useCase: string}`
    - Export the types from Thermidor's public API
    - _Requirements: 13.1, 13.5, 13.6_

  - [x] 3.2 Implement `serialize()` method on `ConverseController`
    - Add `serialize(): SerializedConverseState` to the `ConverseController` interface
    - In `ConverseControllerImpl`, implement `serialize()` to read current state, map turns to `SerializedTurn` (reducing `routedInterface` to `{useCase}` only), and return the plain object
    - Ensure the returned object survives `JSON.stringify`/`JSON.parse` round-trips
    - _Requirements: 13.1, 13.6_

  - [x] 3.3 Implement `initialState` option in `buildConverseController`
    - Add optional `initialState?: SerializedConverseState` to `ConverseControllerOptions`
    - When provided, hydrate the generative slice with the serialized turns before creating the controller's state selector
    - Transition any turns with `status: 'streaming'` to `status: 'error'` with message "Stream was interrupted"
    - Set `activeTurnId` from the serialized state
    - Ensure first subscriber callback receives the hydrated state
    - _Requirements: 13.2, 13.3, 13.4_

  - [x]\* 3.4 Write property test for serialization JSON round-trip
    - **Property 8: Serialization JSON round-trip**
    - **Validates: Requirements 13.1, 13.6**

  - [x]\* 3.5 Write property test for state restoration hydration
    - **Property 9: State restoration hydrates turns before first subscriber callback**
    - **Validates: Requirements 13.3**

  - [x]\* 3.6 Write property test for streaming turns becoming error on restore
    - **Property 10: Streaming turns become error on restore**
    - **Validates: Requirements 13.4**

- [x] 4. Checkpoint - Thermidor library enhancements
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Angular Sample: Monorepo Integration
  - [x] 5.1 Update `package.json` to monorepo conventions
    - Set `name` to `@samples/thermidor-commerce-agent-angular`
    - Set `"private": true`
    - Remove `packageManager` field
    - Add `@coveo/thermidor` as `workspace:*` dependency
    - Replace Angular dependency versions with `catalog:` references for all packages present in `pnpm-workspace.yaml` catalog
    - Remove `@ag-ui/client` dependency
    - Ensure `build` and `dev` scripts are present (`"build": "ng build"`, `"dev": "ng serve --configuration development"`)
    - Remove `watch` and `ng` scripts that are not needed
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8_

  - [x] 5.2 Remove standalone VCS and lockfile artifacts
    - Delete nested `.git/` directory
    - Delete `package-lock.json` if present
    - Delete `.prettierrc` file
    - _Requirements: 1.5, 1.6, 10.1_

  - [x] 5.3 Configure TypeScript path resolution for local Thermidor
    - Add `paths` mapping in `tsconfig.app.json`: `"@coveo/thermidor": ["../../packages/thermidor/src/index.ts"]`
    - Set `skipLibCheck: true` in `tsconfig.json`
    - Retain Angular-specific compiler options (`strict`, `isolatedModules`)
    - _Requirements: 9.3, 9.5_

  - [x] 5.4 Configure dev server proxy
    - Create or update `proxy.conf.json` (or `angular.json` proxyConfig) to route `/rest/organizations/{orgId}/commerce/unstable/agentic` to admin endpoint and `/rest/**` to platform endpoint
    - Ensure dev server starts without error when proxy env vars are unset
    - _Requirements: 9.2, 9.6_

  - [x] 5.5 Configure Angular CLI builder and build settings
    - Ensure `angular.json` uses `@angular/build:application` builder
    - Remove `tsconfig.spec.json` reference from angular.json if present
    - _Requirements: 9.1, 11.4_

- [x] 6. Angular Sample: Engine Initialization and ThermidorService
  - [x] 6.1 Create environment configuration files
    - Create `src/environments/environment.ts` with `organizationId`, `accessToken`, `trackingId`, `language`, `country`, `currency`, `endpoint` fields
    - Create `src/environments/environment.development.ts` with development overrides
    - _Requirements: 2.1, 2.5_

  - [x] 6.2 Implement `ThermidorService` injectable
    - Create `src/app/services/thermidor.service.ts` as `@Injectable({providedIn: 'root'})`
    - Initialize `Engine` with configuration from environment files
    - Create `GenerativeInterface` via `buildGenerativeInterface({engine})`
    - Create `ConverseController` via `buildConverseController({interface, initialState})`
    - Implement `NavigatorContextProvider` returning `clientId`, `location`, `referrer`, `userAgent`
    - Implement `getClientId()` using `crypto.randomUUID()` persisted to `sessionStorage`
    - Handle `sessionStorage`/`crypto` unavailability gracefully (return `undefined`)
    - Load persisted state from `localStorage`, pass as `initialState`
    - Handle `localStorage` unavailability or parse failure gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 13.7, 13.8_

- [x] 7. Angular Sample: Replace Custom Transport with ConverseController
  - [x] 7.1 Remove custom transport services
    - Delete `services/agent-demo.service.ts` (AgentDemoService)
    - Delete `services/ag-ui-client-transport.service.ts` (AgUiClientTransportService)
    - Delete `services/demo-conversation.facade.ts` (DemoConversationFacade)
    - Remove `services/` directory entirely
    - _Requirements: 3.1, 3.2, 3.3, 11.3_

  - [x] 7.2 Rewire `AppComponent` to use `ThermidorService`
    - Replace `DemoConversationFacade` injection with `ThermidorService`
    - Subscribe to `converseController.state` and drive UI updates from `turns`, `activeTurnId`, `activeTurn`, `isStreaming`
    - Implement persistence via `converseController.serialize()` → `localStorage`
    - Wire prompt submission to `converseController.submit({prompt})`
    - Wire turn selection to `converseController.selectTurn({id})`
    - Wire retry to `converseController.retry({id})`
    - Show streaming indicator when `isStreaming` is true
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 13.7_

  - [x]\* 7.3 Write property test for prompt validation
    - **Property 1: Prompt validation determines submission**
    - **Validates: Requirements 3.4, 3.5**

- [x] 8. Angular Sample: A2UI Surface Rendering from Thermidor State
  - [x] 8.1 Adapt A2UI parser to work with Thermidor's `A2UISurface` array
    - Update `a2ui-parser.ts` to receive `A2UISurface[]` from `turn.agentResponse.surfaces`
    - Keep `SurfaceState` as a private implementation detail within the parser
    - Ensure insertion order preservation during streaming
    - _Requirements: 4.1, 4.6_

  - [x] 8.2 Update `SurfaceOutlet` and surface components
    - Update component inputs to use Angular `input()` signal inputs typed to `RenderableCommerceSurface` variants
    - Ensure `SurfaceOutlet` uses `SURFACE_COMPONENTS` registry to map `componentType` to component class
    - Render nothing for unrecognized component types (no error)
    - Ensure all surface components use `ChangeDetectionStrategy.OnPush`
    - Wire surface rendering to active turn's `agentResponse.surfaces`
    - Skip rendering when `agentResponse` is undefined or surfaces array is empty
    - Render loading placeholders when `isLoading` is true
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x]\* 8.3 Write property test for A2UI parser surface typing
    - **Property 2: A2UI parser produces typed surfaces from opaque records**
    - **Validates: Requirements 4.1**

  - [x]\* 8.4 Write property test for surface component dispatch
    - **Property 3: Surface component dispatch matches componentType**
    - **Validates: Requirements 4.4, 8.2**

  - [x]\* 8.5 Write property test for surface insertion order
    - **Property 4: Surface insertion order is preserved during streaming**
    - **Validates: Requirements 4.6**

- [x] 9. Angular Sample: Conversation UI Driven by Turn State
  - [x] 9.1 Update transcript panel and message rendering
    - Render user prompt from `Turn.prompt` as user message bubble
    - Render assistant messages from `Turn.agentResponse.messages` preserving array order
    - Display streaming indicator when turn status is `streaming`
    - Display error message and retry control when turn status is `error`
    - Render tool call progress showing tool name (truncated to 60 chars with ellipsis) and status
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 9.2 Implement turn history and reasoning/snapshot display
    - Display all turns in scrollable history showing at least 50 most recent turns
    - Update content panels when user selects a different turn
    - Display reasoning content from `Turn.agentResponse.reasoningContent` as thinking indicator when non-empty and streaming
    - Display state snapshot from `Turn.stateSnapshot` as execution progress label when non-null and streaming
    - Remove local reasoning text accumulation and state snapshot management logic
    - _Requirements: 5.6, 5.7, 14.7, 14.8, 15.6, 15.7_

  - [x]\* 9.3 Write property test for assistant message order
    - **Property 5: Assistant messages render in array order**
    - **Validates: Requirements 5.2**

  - [x]\* 9.4 Write property test for tool call name truncation
    - **Property 6: Tool call name truncation**
    - **Validates: Requirements 5.5**

  - [x]\* 9.5 Write property test for turn history display capacity
    - **Property 7: Turn history display capacity**
    - **Validates: Requirements 5.6**

- [x] 10. Checkpoint - Core integration complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Angular Sample: Remove AG-UI Types and Mock Transport
  - [x] 11.1 Clean up `models.ts` type definitions
    - Remove all locally defined AG-UI event types and `AgUiEvent` union from `models.ts`
    - Remove `ChatMessage` and `ChatRole` types
    - Import `Turn`, `TurnStatus`, `AgentResponse`, `AgentMessage`, `A2UISurface`, `ToolCall`, `ToolCallStatus` from `@coveo/thermidor`
    - Retain sample-specific types: `ProductRecord`, `RenderableCommerceSurface`, `CommerceSurfaceComponentType`, `NextAction`, `BundleSlotConfig`, `BundleTierConfig`, `BundleDisplaySlot`, `BundleDisplayTier`, `ValueMapEntry`, `ValueMapItem`, `A2UIOperation`, `ActivitySnapshotContent`
    - Update all files that referenced `ChatMessage`/`ChatRole` to use Thermidor types
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 11.2 Remove mock transport artifacts
    - Delete `mock-catalog.ts` and all import references
    - Delete `demo-agent.config.ts` and `DemoAgentMode` type
    - Remove mock-mode UI controls (live/mock toggle in conversation header)
    - Remove `agentMode` input/output bindings from conversation header component
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 11.3 Remove conversation header mock toggle and update component
    - Remove the `ConversationHeaderComponent` mock/live toggle UI
    - Update the component to only show relevant controls (no mode switching)
    - _Requirements: 7.3_

- [x] 12. Angular Sample: Dead Code Removal
  - [x] 12.1 Remove obsolete files and directories
    - Delete `conversation.interfaces.ts`
    - Delete `formatting.ts`
    - Delete `tsconfig.spec.json`
    - Delete `docs/screenshots/` directory and contents
    - Delete `docs/` directory if empty after removal
    - Verify no remaining source file imports reference removed files
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [x] 12.2 Clean up `.gitignore` and configuration files
    - Remove patterns from local `.gitignore` already covered by monorepo root
    - Retain Angular-specific patterns (e.g., `/.angular/cache`) if needed
    - Retain `.editorconfig`
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 13. Angular Sample: Update Documentation
  - [x] 13.1 Rewrite `README.md` for Thermidor-integrated sample
    - Describe the sample as a Thermidor-integrated Angular commerce agent experience
    - Include "Getting Started" section with `pnpm install` and `pnpm run dev` instructions
    - Include "Environment Configuration" section documenting environment files and required values
    - Include "Architecture" section describing Thermidor Engine/Interface/Controller usage
    - Include "What This Sample Demonstrates" section listing key capabilities
    - Remove all references to npm, mock mode, `@ag-ui/client`, hardcoded endpoints, old Code Map
    - Remove AG-UI/A2UI protocol concept sections
    - Remove references to `docs/screenshots/` or removed files
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

- [x] 14. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Thermidor library enhancements (tasks 1–3) must complete before Angular sample tasks (5+) that depend on the new APIs
- The Angular sample workstream uses TypeScript throughout, consistent with the existing codebase

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1", "2.1", "5.1", "5.2"]},
    {"id": 1, "tasks": ["1.2", "2.2", "5.3", "5.4", "5.5"]},
    {"id": 2, "tasks": ["1.3", "2.3", "2.4", "3.1", "6.1"]},
    {"id": 3, "tasks": ["3.2", "3.3", "6.2"]},
    {"id": 4, "tasks": ["3.4", "3.5", "3.6", "7.1"]},
    {"id": 5, "tasks": ["7.2", "11.1", "11.2"]},
    {"id": 6, "tasks": ["7.3", "8.1", "11.3"]},
    {"id": 7, "tasks": ["8.2", "9.1"]},
    {"id": 8, "tasks": ["8.3", "8.4", "8.5", "9.2"]},
    {"id": 9, "tasks": ["9.3", "9.4", "9.5", "12.1"]},
    {"id": 10, "tasks": ["12.2", "13.1"]}
  ]
}
```
