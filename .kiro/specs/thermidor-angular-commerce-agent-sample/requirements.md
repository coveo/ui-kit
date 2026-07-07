# Requirements Document

## Introduction

This document defines the requirements for adapting the externally-sourced Angular commerce agent sample (`samples/thermidor/commerce-agent-frontend-implementation-angular`) so that it integrates with the `@coveo/thermidor` headless library and follows the monorepo conventions established by the existing `generative-react` sample.

The Angular sample currently implements its own AG-UI event parsing, A2UI surface rendering, custom transport layer, and manual state management. The adaptation replaces those custom layers with the framework-agnostic Thermidor `Engine`, `buildGenerativeInterface`, and `buildConverseController` APIs, while preserving the sample's Angular-native presentation components and commerce surface renderers.

## Glossary

- **Thermidor**: The `@coveo/thermidor` package — a framework-agnostic headless engine for search and conversational experiences in the monorepo.
- **Engine**: The root Thermidor object that manages configuration, state, and dispatches. Created via `new Engine({configuration, navigatorContextProvider})`.
- **GenerativeInterface**: A Thermidor interface created via `buildGenerativeInterface({engine})` that represents a conversational experience.
- **ConverseController**: A Thermidor controller created via `buildConverseController({interface})` that exposes `submit()`, `selectTurn()`, `retry()`, and a subscribable `state` containing turns, the active turn, and streaming status.
- **Turn**: A Thermidor state object representing one user prompt and its corresponding agent response, including messages, A2UI surfaces, and tool calls.
- **A2UISurface**: An opaque surface record emitted by the agent during a turn, passed through Thermidor state without interpretation.
- **Angular_Sample**: The Angular application at `samples/thermidor/commerce-agent-frontend-implementation-angular`.
- **React_Sample**: The reference Thermidor sample at `samples/thermidor/generative-react`.
- **Monorepo**: The `ui-kit` pnpm workspace that hosts packages, samples, and build tooling.
- **Commerce_Surface_Components**: The set of Angular standalone components rendering A2UI surfaces (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar).
- **pnpm_Workspace**: The workspace protocol (`workspace:*`) used to reference local packages in the monorepo.
- **Conversation_Persistence**: The capability to serialize a ConverseController's state to a JSON-safe format and restore it from a previously serialized snapshot.
- **Reasoning_Event**: An AG-UI stream event (`REASONING_MESSAGE_START`, `REASONING_MESSAGE_CONTENT`, `REASONING_MESSAGE_END`) that carries the model's internal reasoning/thinking text during a turn.
- **State_Snapshot**: An AG-UI stream event (`STATE_SNAPSHOT`) that carries a point-in-time status payload describing the agent's current execution progress (e.g., `{label: "Searching products"}`).

## Requirements

### Requirement 1: Monorepo Integration

**User Story:** As a developer working in the ui-kit monorepo, I want the Angular sample to be a proper pnpm workspace member with correct dependency resolution, so that it builds alongside other packages and samples.

#### Acceptance Criteria

1. THE Angular_Sample SHALL declare `@coveo/thermidor` as a dependency using the `workspace:*` protocol.
2. THE Angular_Sample SHALL use pnpm `catalog:` references for all dependencies and devDependencies where a matching entry exists in `pnpm-workspace.yaml` catalog (including `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/forms`, `@angular/platform-browser`, `@angular/build`, `@angular/cli`, `@angular/compiler-cli`, `typescript`, and `playwright`).
3. THE Angular_Sample SHALL have a `package.json` `name` field following the pattern `@samples/thermidor-commerce-agent-angular`.
4. THE Angular_Sample SHALL set `"private": true` in its `package.json`.
5. THE Angular_Sample SHALL remove the nested `.git` directory so it is part of the parent monorepo's version control.
6. THE Angular_Sample SHALL remove the `package-lock.json` file and remove the `packageManager` field from `package.json` since the monorepo uses pnpm with a single lockfile and declares its own `packageManager` at the root.
7. THE Angular_Sample SHALL remove the `@ag-ui/client` direct dependency since Thermidor internalizes AG-UI protocol handling.
8. THE Angular_Sample SHALL include at minimum a `build` script and a `dev` script in its `package.json` so that the monorepo's Turbo pipeline (which defines `build` with `dependsOn: [^build]` and `dev` with `dependsOn: [build]`) can orchestrate the sample.
9. WHEN the monorepo runs `pnpm install` from the repository root, THE Angular_Sample SHALL have its dependencies resolved with a zero exit code and no unresolved peer dependency warnings related to workspace packages.

### Requirement 2: Thermidor Engine Initialization

**User Story:** As a developer, I want the Angular sample to initialize a Thermidor Engine and GenerativeInterface, so that the app uses the standard headless layer instead of a custom transport.

#### Acceptance Criteria

1. THE Angular_Sample SHALL create a Thermidor `Engine` instance with a configuration providing `organizationId`, `accessToken`, `trackingId`, `language`, `country`, `currency`, and `endpoint`.
2. THE Angular_Sample SHALL create a `GenerativeInterface` via `buildGenerativeInterface({engine})`.
3. THE Angular_Sample SHALL create a `ConverseController` via `buildConverseController({interface})`.
4. THE Angular_Sample SHALL expose the ConverseController through an Angular injectable service so that any component in the application can inject it.
5. THE Angular_Sample SHALL read configuration values from Angular environment files (`environment.ts` / `environment.development.ts`) rather than hard-coding them in application logic.
6. THE Angular_Sample SHALL provide a `NavigatorContextProvider` function that returns an object with `clientId` (string), `location` (string), `referrer` (string or null), and `userAgent` (string or null).
7. THE Angular_Sample SHALL generate a `clientId` using `crypto.randomUUID()` and persist it in `sessionStorage` so the same clientId is reused across page navigation events within a session.
8. IF `sessionStorage` is unavailable or `crypto.randomUUID()` is unavailable, THEN THE Angular_Sample SHALL continue without a clientId by passing `undefined` to the NavigatorContextProvider without throwing an error.

### Requirement 3: Replace Custom Transport with ConverseController

**User Story:** As a developer, I want the Angular sample to use Thermidor's ConverseController for conversation orchestration, so that it benefits from the standard state management and protocol handling.

#### Acceptance Criteria

1. THE Angular_Sample SHALL remove the `AgentDemoService` custom transport service such that no source file imports or references it.
2. THE Angular_Sample SHALL remove the `AgUiClientTransportService` custom AG-UI client wrapper such that no source file imports or references it.
3. THE Angular_Sample SHALL remove the `DemoConversationFacade` custom signal-based state layer such that no source file imports or references it.
4. WHEN the user submits a non-empty prompt, THE Angular_Sample SHALL call `converseController.submit({prompt})` with the trimmed prompt string.
5. IF the user submits an empty or whitespace-only prompt, THEN THE Angular_Sample SHALL not call `converseController.submit` and SHALL leave the conversation state unchanged.
6. THE Angular_Sample SHALL subscribe to `ConverseController` state changes and drive Angular UI updates from the `turns`, `activeTurnId`, `activeTurn`, and `isStreaming` state properties.
7. THE Angular_Sample SHALL use `converseController.selectTurn({id})` to navigate between turns.
8. IF a turn has an error status, THEN THE Angular_Sample SHALL use `converseController.retry({id})` to retry the failed turn when the user requests a retry.
9. WHEN the ConverseController state updates, THE Angular_Sample SHALL render the active turn's agent response messages, A2UI surfaces, and tool calls.
10. WHILE `isStreaming` is true, THE Angular_Sample SHALL indicate to the user that a response is in progress.

### Requirement 4: A2UI Surface Rendering from Thermidor State

**User Story:** As a developer, I want the Angular sample to render commerce surfaces from Thermidor's Turn state, so that the rendering layer works with the standard data shape.

#### Acceptance Criteria

1. THE Angular_Sample SHALL read A2UI surfaces from the active turn's `agentResponse.surfaces` array and transform each opaque `A2UISurface` record into a typed renderable commerce surface object using its A2UI parser logic.
2. IF the active turn's `agentResponse` property is undefined, THEN THE Angular_Sample SHALL render no commerce surfaces for that turn.
3. IF the active turn's `agentResponse.surfaces` array is empty, THEN THE Angular_Sample SHALL skip surface transformation logic and render no commerce surfaces.
4. THE Angular_Sample SHALL render ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, and NextActionsBar components from the parsed surface data.
5. IF a surface's `isLoading` property is true, THEN THE Angular_Sample SHALL render a visually distinct placeholder (skeleton or loading indicator) in place of the surface's final content.
6. WHILE a turn is streaming progressive updates, THE Angular_Sample SHALL preserve the first-appearance insertion order of surfaces, such that a surface that appeared earlier is never rendered after a surface that appeared later within the same turn.
7. IF a surface record contains a `componentType` value not matching any of the supported component types (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar), THEN THE Angular_Sample SHALL skip rendering that surface without affecting other surfaces.

### Requirement 5: Conversation UI Driven by Turn State

**User Story:** As a developer, I want the conversation UI to reflect the ConverseController's turn model, so that the user experience matches the Thermidor state lifecycle.

#### Acceptance Criteria

1. THE Angular_Sample SHALL render the user's prompt text from each `Turn.prompt` field as a visible message bubble attributed to the user role.
2. THE Angular_Sample SHALL render assistant messages from `Turn.agentResponse.messages` as visible message bubbles attributed to the assistant role, preserving message order.
3. WHILE a turn's status is `streaming`, THE Angular_Sample SHALL display a visible animated streaming indicator element that is removed when the turn status transitions away from `streaming`.
4. IF a turn's status is `error`, THEN THE Angular_Sample SHALL display the turn's error message text and a "Retry" control that, when activated, re-submits the same prompt for that turn.
5. THE Angular_Sample SHALL render tool call progress from `Turn.agentResponse.toolCalls`, showing the tool name (truncated to 60 characters with ellipsis if longer) and its current status (`running` or `completed`).
6. THE Angular_Sample SHALL display all turns in a scrollable turn history list showing at least the 50 most recent turns, each identifiable by its prompt text or sequence number.
7. WHEN the user selects a different turn in the history, THE Angular_Sample SHALL update all displayed content panels (messages, surfaces, and tool activity) to reflect the selected turn's data.

### Requirement 6: Remove Custom AG-UI Event and Type Definitions

**User Story:** As a developer, I want the Angular sample to rely on Thermidor's exported types instead of re-defining AG-UI protocol types locally, so that the codebase stays DRY and consistent.

#### Acceptance Criteria

1. THE Angular_Sample SHALL remove from `models.ts` all locally defined AG-UI event types (`RunStartedEvent`, `RunFinishedEvent`, `TextMessageStartEvent`, `TextMessageContentEvent`, `TextMessageEndEvent`, `ToolCallStartEvent`, `ToolCallArgsEvent`, `ToolCallResultEvent`, `ToolCallEndEvent`, `StateSnapshotEvent`, `ActivitySnapshotEvent`, `ReasoningStartEvent`, `ReasoningMessageStartEvent`, `ReasoningMessageContentEvent`, `ReasoningMessageEndEvent`, `ReasoningEndEvent`) and the `AgUiEvent` union type.
2. THE Angular_Sample SHALL import `Turn`, `TurnStatus`, `AgentResponse`, `AgentMessage`, `A2UISurface`, `ToolCall`, and `ToolCallStatus` from `@coveo/thermidor`.
3. THE Angular_Sample SHALL retain in `models.ts` all types that `@coveo/thermidor` does not export, including: `ProductRecord`, `RenderableCommerceSurface` and its constituent surface types, `CommerceSurfaceComponentType`, `NextAction`, `BundleSlotConfig`, `BundleTierConfig`, `BundleDisplaySlot`, `BundleDisplayTier`, `ValueMapEntry`, `ValueMapItem`, `A2UIOperation`, `ActivitySnapshotContent`, `StreamTurnInput`, and all surface operation and component payload types.
4. THE Angular_Sample SHALL remove the `ChatMessage` and `ChatRole` local types from `models.ts`, and all files that previously referenced `ChatMessage` SHALL be updated to use Thermidor's `Turn` and `AgentMessage` types for conversation history.
5. WHEN all type removals and import updates are applied, THE Angular_Sample SHALL compile without errors using `pnpm run build` from the sample directory.

### Requirement 7: Remove Mock Transport Layer

**User Story:** As a developer, I want the Angular sample to remove its local mock transport since Thermidor and the monorepo provide mock infrastructure, so that the sample focuses on demonstrating Thermidor integration.

#### Acceptance Criteria

1. THE Angular_Sample SHALL remove the `mock-catalog.ts` file and all import references to it, so that no source file depends on locally hard-coded mock scenarios.
2. THE Angular_Sample SHALL remove the `demo-agent.config.ts` file, the `DemoAgentMode` type, and all branching logic that switches between mock and live transport paths (including the `streamMockTurn` method and its helpers in `agent-demo.service.ts`).
3. THE Angular_Sample SHALL remove mock-mode related UI controls (live/mock toggle checkbox and associated `agentMode` input/output bindings in the conversation header component).
4. IF a mock mode is needed for local development, THEN THE Angular_Sample SHALL accept the Thermidor Engine endpoint URL through an Angular environment file or an environment variable override, defaulting to the monorepo's `packages/mock-converse-api` local address when no override is provided.
5. WHEN all mock transport artifacts are removed, THE Angular_Sample SHALL compile without errors and produce a runnable build using only the live transport path.

### Requirement 8: Preserve Angular Presentation Components

**User Story:** As a developer, I want the Angular surface-rendering components to remain as standalone Angular components, so that the sample demonstrates Angular-native A2UI rendering on top of Thermidor.

#### Acceptance Criteria

1. THE Angular_Sample SHALL retain the standalone Angular components for ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, and NextActionsBar, each declared with `standalone: true` (or using the standalone default in Angular 19+).
2. THE Angular_Sample SHALL retain the `SurfaceOutlet` component that maps a surface `componentType` to the matching renderer using `NgComponentOutlet`.
3. THE Angular_Sample SHALL update component inputs to accept data derived from Thermidor's `A2UISurface` type after parsing, using Angular `input()` signal inputs typed to the corresponding `RenderableCommerceSurface` variant.
4. THE Angular_Sample SHALL use `ChangeDetectionStrategy.OnPush` on all surface rendering components to efficiently update only when input references change.
5. IF a surface record contains a `componentType` not present in the `SURFACE_COMPONENTS` registry, THEN THE `SurfaceOutlet` component SHALL render nothing for that entry without throwing an error.

### Requirement 9: Build and Development Tooling

**User Story:** As a developer, I want the Angular sample to build correctly within the monorepo, so that CI and local development workflows function without manual steps.

#### Acceptance Criteria

1. THE Angular_Sample SHALL use the Angular CLI builder (`@angular/build:application`) for production builds.
2. THE Angular_Sample SHALL configure a dev server proxy that routes `/rest/organizations/{orgId}/commerce/unstable/agentic` requests to the Coveo admin endpoint and all other `/rest` requests to the Coveo platform endpoint, matching the same logical proxy routes used in the React_Sample's Vite config.
3. THE Angular_Sample SHALL resolve `@coveo/thermidor` to the local workspace source (via TypeScript path mapping or Angular CLI resolve alias) so that importing from `@coveo/thermidor` compiles against the local `packages/thermidor/src` entry point without requiring a prior publish or build of the Thermidor package.
4. THE Angular_Sample SHALL produce a successful build (exit code 0 with zero TypeScript compilation errors) when running `pnpm run build` from the sample directory, using `pnpm` as the package manager consistent with the monorepo tooling.
5. THE Angular_Sample SHALL set `skipLibCheck: true` in its `tsconfig.json` to align with the monorepo root TypeScript configuration, while retaining Angular-specific compiler options (`strict`, `isolatedModules`, `experimentalDecorators`) required by the Angular compiler.
6. IF the Coveo platform endpoint environment variables required by the dev server proxy are not set, THEN THE Angular_Sample SHALL start the dev server without the proxy enabled and without producing a startup error.

### Requirement 10: Remove Unnecessary Configuration Files

**User Story:** As a developer, I want the Angular sample to not carry configuration files that conflict with or duplicate the monorepo's root configuration, so that the project is clean and consistent.

#### Acceptance Criteria

1. THE Angular_Sample SHALL NOT contain a `.prettierrc` file, since the monorepo root provides formatting configuration via `.oxfmtrc.json`.
2. THE Angular_Sample SHALL retain its `.editorconfig` file, since the monorepo root does not provide a root-level `.editorconfig`.
3. IF the Angular_Sample's `.gitignore` contains patterns already covered by the monorepo root `.gitignore` (e.g., `node_modules`, `.DS_Store`), THEN THE Angular_Sample SHALL remove those redundant patterns from its local `.gitignore`.
4. IF the Angular_Sample requires ignore patterns specific to the Angular toolchain that are not covered by the monorepo root `.gitignore` (e.g., `/.angular/cache`), THEN THE Angular_Sample MAY retain a local `.gitignore` containing only those Angular-specific patterns; absence of a local `.gitignore` is also acceptable.
5. WHEN the `.prettierrc` file is removed, THE Angular_Sample SHALL still produce correctly formatted output when `pnpm run lint:fix` is executed from the monorepo root.

### Requirement 11: Remove Dead Code and Obsolete Files

**User Story:** As a developer, I want all source files, types, and directories that become unused after the Thermidor transition to be removed, so that the sample contains no dead code and remains easy to understand.

#### Acceptance Criteria

1. WHEN Requirements 1 through 7 are implemented, THE Angular_Sample SHALL remove the `conversation.interfaces.ts` file (containing `PersistedConversation`, `ConversationViewModel`, `ToolActivity`, and `SurfaceState` types), since these types are superseded by Thermidor's `Turn` and `ConverseController` state.
2. WHEN Requirements 1 through 7 are implemented, THE Angular_Sample SHALL remove the `formatting.ts` file (containing the `formatAudPrice` utility), since currency formatting tied to the old mock catalog is no longer referenced.
3. WHEN all service files (`demo-conversation.facade.ts`, `agent-demo.service.ts`, `ag-ui-client-transport.service.ts`) are removed per Requirement 3, THE Angular_Sample SHALL remove the `services/` directory entirely so that no empty directory remains.
4. THE Angular_Sample SHALL remove the `tsconfig.spec.json` file, since no unit test files are being ported and the Angular test runner configuration is not used in the monorepo sample.
5. THE Angular_Sample SHALL remove the `docs/screenshots/` directory and all its contents (`single-intent.png`, `comparison.png`, `bundles.png`, `.gitkeep`), since these screenshots reference the standalone project UX and are not applicable to the Thermidor-integrated sample.
6. IF the `docs/` directory is empty after the screenshots removal, THEN THE Angular_Sample SHALL remove the `docs/` directory entirely.
7. WHEN all dead code removals are applied, THE Angular_Sample SHALL compile without errors using `pnpm run build` from the sample directory.
8. WHEN all dead code removals are applied, no remaining source file in the Angular_Sample SHALL contain an import statement referencing any of the removed files.

### Requirement 12: Update Sample Documentation

**User Story:** As a developer exploring the monorepo, I want the Angular sample's README to accurately describe its purpose, setup, and architecture as a Thermidor-integrated sample, so that I can understand how to run and extend it without encountering outdated instructions.

#### Acceptance Criteria

1. THE Angular_Sample SHALL replace the existing `README.md` with documentation that describes the sample as a Thermidor-integrated Angular commerce agent experience within the ui-kit monorepo.
2. THE Angular_Sample README SHALL include a "Getting Started" section that documents setup using `pnpm install` from the monorepo root (not `npm install`) and running the sample with `pnpm run dev` from the sample directory.
3. THE Angular_Sample README SHALL include an "Environment Configuration" section that documents the Angular environment files (`environment.ts` / `environment.development.ts`) and the configuration values required by the Thermidor Engine (`organizationId`, `accessToken`, `trackingId`, `language`, `country`, `currency`, `endpoint`).
4. THE Angular_Sample README SHALL include an "Architecture" section that describes how the sample uses the Thermidor `Engine`, `GenerativeInterface`, and `ConverseController` APIs to drive the conversation experience, replacing the old five-layer architecture description.
5. THE Angular_Sample README SHALL include a "What This Sample Demonstrates" section listing: Thermidor Engine initialization, ConverseController-driven conversation flow, A2UI surface parsing and rendering with Angular standalone components, commerce surface components (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar), and the dev server proxy configuration.
6. THE Angular_Sample README SHALL remove all references to `npm install`, `npm start`, mock mode, `DemoAgentMode`, `@ag-ui/client` as an "alternative option", the hardcoded Freedom endpoint URL, and the old "Code Map" section describing removed services.
7. THE Angular_Sample README SHALL remove all references to the AG-UI and A2UI protocol concepts sections (including "What is AG-UI?", "What is A2UI?", "How They Work Together", and "AG-UI Event Contract"), since Thermidor abstracts these protocol details away from the sample consumer.
8. IF the `docs/` directory is retained for new documentation purposes, THEN THE Angular_Sample README SHALL reference it accurately; otherwise the README SHALL contain no references to `docs/screenshots/` or UX reference screenshots.
9. WHEN the README update is complete, THE Angular_Sample README SHALL contain no references to files or services that have been removed by Requirements 1 through 11.

### Requirement 13: Thermidor Conversation Persistence API

**User Story:** As a developer using Thermidor, I want to serialize and restore ConverseController state, so that conversation history survives page reloads and session resumption without the consuming application managing raw turn data structures.

#### Acceptance Criteria

1. THE ConverseController SHALL expose a `serialize()` method that returns a JSON-safe object representing the complete conversation state, including the turns array with all nested data (messages, surfaces, toolCalls, status, prompt, id, error, and routedInterface metadata).
2. THE `buildConverseController` function SHALL accept an optional `initialState` property in its options object that accepts a previously serialized state snapshot.
3. WHEN `initialState` is provided, THE ConverseController SHALL restore the serialized turns into its internal state before any subscriber callback fires, such that the first emitted state contains the hydrated turn history.
4. IF `initialState` contains turns with a `streaming` status, THEN THE ConverseController SHALL transition those turns to `error` status with a message indicating the stream was interrupted, since a previously streaming turn cannot be resumed.
5. THE serialized format returned by `serialize()` SHALL be treated as a public contract: its shape SHALL NOT change in a backward-incompatible way within the same major version of `@coveo/thermidor`.
6. WHEN `serialize()` is called, THE ConverseController SHALL return a plain object that can be passed to `JSON.stringify()` without throwing and without losing information upon a subsequent `JSON.parse()`.
7. THE Angular_Sample SHALL use `ConverseController.serialize()` to persist conversation state to `localStorage` and SHALL pass the parsed value as `initialState` when rebuilding the controller on page load.
8. IF `localStorage` is unavailable or the stored value fails to parse, THEN THE Angular_Sample SHALL initialize the ConverseController without `initialState` and SHALL not throw an error.

### Requirement 14: Thermidor Reasoning Event Support

**User Story:** As a developer using Thermidor, I want the runtime to process reasoning events and expose reasoning content on the turn state, so that consuming applications can display "thinking" indicators without manually parsing stream events.

#### Acceptance Criteria

1. THE AgentResponse type SHALL include a `reasoningContent` field of type `string` that accumulates the model's reasoning text for the turn.
2. WHEN a `REASONING_MESSAGE_START` event is received, THE GenerativeRuntime SHALL signal the start of a reasoning sequence for the active turn.
3. WHEN a `REASONING_MESSAGE_CONTENT` event is received, THE GenerativeRuntime SHALL append the event's delta text to the active turn's `agentResponse.reasoningContent` field.
4. WHEN a `REASONING_MESSAGE_END` event is received, THE GenerativeRuntime SHALL finalize the reasoning sequence for the active turn.
5. THE GenerativeStatePort SHALL expose `startReasoning(turnId: string)`, `appendReasoningDelta(turnId: string, delta: string)`, and `endReasoning(turnId: string)` methods that the GenerativeRuntime calls to manage reasoning state.
6. IF no reasoning events are received during a turn, THEN THE AgentResponse's `reasoningContent` field SHALL be an empty string.
7. THE Angular_Sample SHALL read reasoning content from `Turn.agentResponse.reasoningContent` and display it as a "thinking" indicator when the value is non-empty and the turn is streaming.
8. THE Angular_Sample SHALL remove its local reasoning text accumulation logic and rely on the ConverseController state as the single source of truth for reasoning content.

### Requirement 15: Thermidor State Snapshot Support

**User Story:** As a developer using Thermidor, I want the runtime to process STATE_SNAPSHOT events and expose the latest snapshot on the turn state, so that consuming applications can display agent execution status labels without manually parsing stream events.

#### Acceptance Criteria

1. THE Turn type SHALL include a `stateSnapshot` field of type `Record<string, unknown> | null` that holds the most recent state snapshot payload for the turn.
2. WHEN a `STATE_SNAPSHOT` event is received, THE GenerativeRuntime SHALL store the event's snapshot payload on the active turn's `stateSnapshot` field, replacing any previous snapshot value.
3. THE GenerativeStatePort SHALL expose a `setStateSnapshot(turnId: string, snapshot: Record<string, unknown>)` method that the GenerativeRuntime calls to update the turn's state snapshot.
4. WHEN a turn completes (status transitions to `complete`), THE Turn's `stateSnapshot` field SHALL be set to `null`, since the snapshot represents transient execution progress.
5. IF no `STATE_SNAPSHOT` events are received during a turn, THEN THE Turn's `stateSnapshot` field SHALL remain `null`.
6. THE Angular_Sample SHALL read status information from `Turn.stateSnapshot` and display it as an execution progress label (e.g., "Searching products", "Building comparison") when the value is non-null and the turn is streaming.
7. THE Angular_Sample SHALL remove its local state snapshot management logic and rely on the ConverseController state as the single source of truth for execution status.
