# Requirements Document

## Introduction

This document captures the requirements that conversational and generative experiences impose on DXUI Headless (headless-future). The Generative Endpoint is responsible for interpreting user intent, determining orchestration needs, invoking backend services, composing responses, and returning AGUI-compliant event streams. DXUI Headless is not responsible for those decisions. Instead, it must provide the communication, orchestration, and state management capabilities necessary for applications to consume and interact with responses produced by the Generative Endpoint.

The primary integration model is event-driven: the Generative Endpoint communicates through SSE streams following the AGUI protocol. DXUI Headless must consume these streams and maintain client-side state derived from them. Two response patterns exist — direct backend resolutions (no agent orchestration) and agent-based experiences (with A2UI activity snapshots) — and both must be supported through a unified orchestration and state management model.

This feature builds upon ADR-002 (multi-interface engine architecture) and is designed according to ADR-003 (generative interface).

## Glossary

- **Generative_Endpoint**: The Coveo backend service responsible for interpreting user intent, determining orchestration needs, invoking backend services, composing responses, and returning AGUI-compliant event streams.
- **AGUI**: The transport protocol (Server-Sent Events based) used by the Generative_Endpoint to deliver responses. All communication from the endpoint flows through AGUI event streams.
- **AGUI_Event**: A single event within an AGUI stream, carrying payload data, metadata, and hints that determine how the event should be interpreted.
- **Hint**: Metadata embedded in AGUI events that identifies the originating backend service or response type. Used by the Generative_Interface to determine how a stream should be interpreted and normalized.
- **A2UI_Snapshot**: An activity snapshot produced by agent orchestration within the Generative_Endpoint. Describes a generated experience that cannot be represented as a single backend API response contract.
- **Generative_Interface**: The meta-interface (per ADR-002/ADR-003) responsible for dynamically spawning typed sub-interfaces as AGUI streams resolve. Built via `buildGenerativeInterface`. Manages the ordered collection of Generated_Experiences.
- **Generative_Map_Controller**: A generic reactive map controller produced by `buildGenerativeMapController({ interface, controllerBuilder })`. Maps Experience_IDs to controller instances of the type inferred from `controllerBuilder`. Only populated for experiences whose hint matches the controller's use case.
- **Conversation_Controller**: A controller registered on the Generative_Interface that owns the turn lifecycle — prompt submission, message history, streaming state, and conversation context.
- **Generated_Experience**: A first-class entity representing the output of a single conversational turn. Each user prompt produces one Generated_Experience within a session. Internally backed by a real ADR-002 typed sub-interface when the hint identifies a known backend.
- **Experience_ID**: A unique identifier assigned to each Generated_Experience instance.
- **Experience_Lifecycle**: The set of states a Generated_Experience progresses through: creation and disposal. The Generative_Interface exposes `dispose(id)` for explicit resource release.
- **Experience_State**: The independent state maintained by a single Generated_Experience, including response payloads, AGUI-derived state, controller state, and UI surface state.
- **Direct_Backend_Resolution**: A response pattern where the Generative_Endpoint determines that a prompt can be resolved directly by a backend service (Commerce Search API, Search API, Knowledge API) without agent orchestration.
- **Agent_Based_Resolution**: A response pattern where the Generative_Endpoint determines that agent orchestration is required, producing A2UI_Snapshots describing the generated experience.
- **Session**: The top-level conversation context within which multiple Generated_Experiences are produced over sequential user prompts.
- **UI_Surface_Controller**: A controller for agent-composed responses whose shape doesn't map to an existing backend contract. Exposes the rendered surface snapshot state. Public name avoids referencing A2UI.
- **Frozen_No_Op**: The state of a disposed controller — `.state` returns the last known snapshot, methods are silent no-ops, `.subscribe()` never fires again.

## Requirements

### Requirement 1: AGUI Stream Consumption

**User Story:** As a developer, I want the Generative_Interface to consume AGUI event streams from the Generative_Endpoint, so that my application can receive and process conversational responses.

#### Acceptance Criteria

1. WHEN a user prompt is submitted through the Conversation_Controller, THE Generative_Interface SHALL open an SSE connection to the Generative_Endpoint and consume the resulting AGUI event stream.
2. WHEN an AGUI_Event is received from the stream, THE Generative_Interface SHALL parse the event and dispatch it to the appropriate state management handler.
3. IF the SSE connection fails or drops unexpectedly, THEN THE Generative_Interface SHALL emit an error state that consumers can observe.
4. IF the SSE connection fails or drops unexpectedly, THEN THE Generative_Interface SHALL preserve any partial state accumulated from events received before the failure.
5. WHEN the AGUI event stream signals completion, THE Generative_Interface SHALL transition the corresponding Generated_Experience to a completed state.

### Requirement 2: Hint-Driven Response Interpretation

**User Story:** As a developer, I want the Generative_Interface to use hints embedded in AGUI events to determine how a stream should be interpreted, so that responses are normalized according to their originating backend service.

#### Acceptance Criteria

1. WHEN an AGUI_Event contains a Hint identifying the originating backend service, THE Generative_Interface SHALL route the event payload to the normalization handler corresponding to that backend service.
2. WHEN a Hint indicates a Commerce Search API origin, THE Generative_Interface SHALL normalize the response into the Commerce state model and spawn a commerce-typed sub-interface.
3. WHEN a Hint indicates a Search API origin, THE Generative_Interface SHALL normalize the response into the Search state model and spawn a search-typed sub-interface.
4. WHEN a Hint indicates a Knowledge API origin, THE Generative_Interface SHALL normalize the response into the Knowledge state model and spawn a knowledge-typed sub-interface.
5. IF an AGUI_Event contains a Hint identifying an unknown or unsupported backend service, THEN THE Generative_Interface SHALL expose the raw event payload without normalization and emit a warning observable by consumers.
6. WHEN a Hint indicates an Agent_Based_Resolution, THE Generative_Interface SHALL route the event payload to the A2UI_Snapshot handler and populate the corresponding UI_Surface_Controller map entry.

### Requirement 3: Response Normalization for Direct Backend Resolutions

**User Story:** As a developer, I want direct backend resolutions to produce the same state model as if the backend API had been called directly, so that my application does not require fundamentally different logic depending on the request path.

#### Acceptance Criteria

1. WHEN a Direct_Backend_Resolution for Commerce Search is received through the AGUI stream, THE Generative_Interface SHALL produce a sub-interface with a state model equivalent to the Commerce state model produced by a direct Commerce Search API call.
2. WHEN a Direct_Backend_Resolution for Search is received through the AGUI stream, THE Generative_Interface SHALL produce a sub-interface with a state model equivalent to the Search state model produced by a direct Search API call.
3. WHEN a Direct_Backend_Resolution for Knowledge is received through the AGUI stream, THE Generative_Interface SHALL produce a sub-interface with a state model equivalent to the Knowledge state model produced by a direct Knowledge API call.
4. THE normalized state SHALL be accessible through the same controllers used for the corresponding backend service type, via the Generative_Map_Controller pattern.

### Requirement 4: Generated Experience as First-Class Entity

**User Story:** As a developer, I want each conversational turn to produce a first-class Generated_Experience entity backed by a real typed sub-interface, so that I can manage multiple conversation outputs independently within a session.

#### Acceptance Criteria

1. WHEN a user prompt is submitted and the Generative_Endpoint begins streaming a response, THE Generative_Interface SHALL create a new Generated_Experience with a unique Experience_ID.
2. THE Generated_Experience SHALL maintain its own independent Experience_State, isolated from other Generated_Experiences in the same Session.
3. WHEN a new Generated_Experience is created, THE Generative_Interface SHALL NOT destroy or mutate the state of previously created Generated_Experiences.
4. THE Generative_Interface SHALL expose an ordered list of Experience_IDs as its state, allowing consumers to enumerate all Generated_Experiences within the current Session.
5. THE Generative_Interface SHALL support a subscribe mechanism that notifies consumers when experiences are added or disposed.

### Requirement 5: Experience Lifecycle Management

**User Story:** As a developer, I want the Generative_Interface to own the lifecycle of Generated_Experiences, so that I can manage their creation and disposal without coupling to a rendering implementation.

#### Acceptance Criteria

1. WHEN a new Generated_Experience is created, THE Generative_Interface SHALL append its Experience_ID to the ordered state list and notify subscribers.
2. THE Generative_Interface SHALL expose a `dispose(id)` method that releases the state and resources of the specified Generated_Experience.
3. WHEN `dispose(id)` is called, THE Generative_Interface SHALL remove the Experience_ID from its state list and notify subscribers.
4. WHEN `dispose(id)` is called, THE corresponding Generative_Map_Controller entries SHALL be removed — subsequent `.get(id)` calls SHALL return `undefined`.
5. IF a consumer holds a reference to a controller from a disposed Generated_Experience, THEN that controller SHALL become a Frozen_No_Op: `.state` returns the last known snapshot, methods are silent no-ops, `.subscribe()` never fires again.
6. THE lifecycle model SHALL remain independent from any rendering implementation.

### Requirement 6: Experience State Preservation

**User Story:** As a developer, I want each Generated_Experience to maintain independent state that is preserved across interactions with other experiences, so that navigating between experiences does not lose data.

#### Acceptance Criteria

1. THE Generated_Experience SHALL maintain independent state including: response payloads, AGUI-derived state, controller state, and UI surface state.
2. WHEN a consumer creates or interacts with one Generated_Experience, THE Generative_Interface SHALL NOT implicitly mutate the state of any other Generated_Experience.
3. THE Experience_State SHALL be representable as serializable plain data structures (no closures, class instances, or non-serializable references).

### Requirement 7: Multiple Concurrent Experiences

**User Story:** As a developer, I want multiple Generated_Experiences to exist simultaneously within a session, so that users can reference and navigate between previous conversation outputs.

#### Acceptance Criteria

1. THE Generative_Interface SHALL support multiple Generated_Experiences existing simultaneously within a single Session.
2. WHEN a new Generated_Experience is created, THE Generative_Interface SHALL add it to the ordered state list without removing or invalidating previously created experiences.
3. THE Generative_Interface SHALL expose the total count of Generated_Experiences via its state (ordered list length).
4. Consumers SHALL correlate across Generative_Map_Controllers by Experience_ID to access different controller types for the same experience.

### Requirement 8: A2UI Activity Management

**User Story:** As a developer, I want the Generative_Interface to manage A2UI activity snapshots through a dedicated UI_Surface_Controller, so that agent-orchestrated experiences can be consumed and displayed by my application.

#### Acceptance Criteria

1. WHEN an AGUI_Event contains an A2UI_Snapshot, THE Generative_Interface SHALL store the snapshot as part of the corresponding Generated_Experience's state and populate the UI_Surface_Controller map entry for that experience.
2. WHEN subsequent AGUI_Events contain incremental updates to an A2UI_Snapshot, THE Generative_Interface SHALL apply those updates to the existing snapshot state progressively.
3. THE UI_Surface_Controller SHALL expose the current snapshot state to consumers, supporting subscription-based observation.
4. THE A2UI_Snapshot state SHALL be treated as a first-class state object within the Generated_Experience.

### Requirement 9: State Synchronization Model

**User Story:** As a developer, I want the state synchronization strategy to match the response type — batch for direct resolutions, progressive for agentic — so that I get complete state for API responses and real-time updates for streaming agent content.

#### Acceptance Criteria

1. WHEN a Direct_Backend_Resolution is received, THE Generative_Interface SHALL buffer AGUI events internally and sync state to the sub-interface in a single batch once the stream completes.
2. WHEN an Agent_Based_Resolution is received, THE Generative_Interface SHALL apply state updates progressively as AGUI events arrive, allowing consumers to observe partial state.
3. THE Generative_Interface SHALL expose a streaming status indicator on each Generated_Experience so consumers can distinguish between in-progress and completed experiences.
4. FOR Agent_Based_Resolutions, THE UI_Surface_Controller SHALL notify subscribers of state changes as each AGUI_Event is processed.

### Requirement 10: Generic Map Controller

**User Story:** As a developer, I want a generic `buildGenerativeMapController` factory that produces typed reactive maps keyed by Experience_ID, so that I can declare which controller capabilities my application supports without needing a dedicated named builder per feature.

#### Acceptance Criteria

1. THE `buildGenerativeMapController` factory SHALL accept an `interface` parameter (the Generative_Interface) and a `controllerBuilder` parameter (any controller build function).
2. THE return type SHALL be inferred from the `controllerBuilder` parameter — no explicit generic annotation required from consumers.
3. THE map controller's `.state` SHALL be a `Map<Experience_ID, Controller>` where `Controller` is the type produced by `controllerBuilder`.
4. THE map SHALL only contain entries for Generated_Experiences whose hint matches the controller's use case (e.g., product list controllers only appear for commerce-resolved experiences).
5. THE map controller SHALL lazily instantiate and memoize controller instances per Experience_ID — guaranteeing stable controller identity across repeated `.get()` calls within the same experience lifecycle.
6. THE map controller SHALL support a `subscribe` mechanism for consumers to observe map additions and removals.
7. WHEN a Generated_Experience is disposed, THE map controller SHALL remove the corresponding entry and invalidate the memoized controller instance.

### Requirement 11: Conversation Controller

**User Story:** As a developer, I want a dedicated Conversation_Controller that owns the turn lifecycle (prompt submission, message history, streaming state), so that conversation management is separated from experience management.

#### Acceptance Criteria

1. THE Conversation_Controller SHALL be constructed via `buildConversationController({ interface: generativeInterface })`, registering itself on the Generative_Interface.
2. THE Conversation_Controller SHALL expose a `submitTurn(input)` method that submits a user prompt to the Generative_Endpoint.
3. THE Conversation_Controller SHALL expose an `abortTurn()` method that aborts the currently active turn (silent no-op if no turn is active).
4. THE Conversation_Controller SHALL maintain conversation state including: message history (user and agent messages), turn state, session identifiers, streaming status, and error state.
5. THE Conversation_Controller SHALL expose its state through a `.state` property and support subscription-based observation.
6. THE Conversation_Controller SHALL manage conversation context (prior turns) automatically, sending appropriate context with each prompt to the Generative_Endpoint.

### Requirement 12: Generative Interface Construction

**User Story:** As a developer, I want to build a Generative_Interface using the same per-type build function pattern established in ADR-002, so that conversational/generative support integrates consistently with the existing multi-interface architecture.

#### Acceptance Criteria

1. THE Generative_Interface SHALL be constructed via `buildGenerativeInterface({ engine })`, consistent with the ADR-002 `build*Interface` naming convention.
2. THE build function SHALL return a fully-typed Generative_Interface with type inference — no explicit generic annotation required from consumers.
3. THE Generative_Interface SHALL constrain which controllers and map controllers are compatible with it at the type level.
4. THE Generative_Interface SHALL integrate with the Engine as an opaque Interface type per ADR-002.

### Requirement 13: Session Management

**User Story:** As a developer, I want the Conversation_Controller to manage conversation sessions, so that I can maintain context across multiple user prompts and control session boundaries.

#### Acceptance Criteria

1. WHEN a Conversation_Controller is built, THE Conversation_Controller SHALL initialize a new Session.
2. THE Session SHALL maintain conversation context that persists across multiple user prompts within that session.
3. THE Conversation_Controller SHALL allow consumers to start a new Session, clearing the conversation context and Generated_Experiences of the previous session.
4. THE Conversation_Controller SHALL expose the current Session state (including conversation history and session identifiers) to consumers through its `.state` property.

### Requirement 14: Support for Future Interactive Experiences

**User Story:** As a developer, I want generated sub-interfaces to be fully interactive (search box, facets, pagination), so that once a prompt resolves to a typed experience, users can refine their results within that experience.

#### Acceptance Criteria

1. WHEN a Direct_Backend_Resolution spawns a typed sub-interface, THE sub-interface SHALL support full interactive capabilities — consumers can call controller methods (e.g., `searchBox.submit()`, `facet.toggleSelect()`) to trigger requests within that sub-interface.
2. THE Generated_Experience state model SHALL be extensible to accommodate new controller types without structural changes to the experience entity or the Generative_Interface.
3. Adding support for a new controller type SHALL NOT require changes to the Generative_Interface or existing Generative_Map_Controllers — consumers simply pass the new `controllerBuilder` to `buildGenerativeMapController`.

### Requirement 15: Support for Hybrid Experiences

**User Story:** As a developer, I want the experience model to support responses composed from multiple backend services, so that a single Generated_Experience can represent combined results.

#### Acceptance Criteria

1. THE Generated_Experience state model SHALL NOT assume that an experience maps to a single backend service.
2. THE Generated_Experience SHALL support holding normalized state from multiple backend services simultaneously (e.g., Commerce results and Knowledge results within the same experience).
3. WHEN an AGUI stream delivers events with Hints referencing multiple backend services, THE Generative_Interface SHALL normalize each event according to its Hint and merge the results into the same Generated_Experience.

## Design Constraints

1. THE Generated_Experience state SHALL be representable as serializable plain data structures (no closures, class instances, or non-serializable references), enabling future state transfer across runtime boundaries (e.g., SSR hydration).
2. THE Generative_Interface SHALL integrate with the Engine as an opaque Interface type per ADR-002 — no feature-level access on the Engine class itself.
3. THE architecture SHALL preserve TypeScript type safety, tree-shaking, and state isolation as established by headless-future's architecture principles.
4. THE design SHALL NOT depend on specific Generative_Endpoint implementation details that are subject to change — the integration boundary is the AGUI protocol.
5. Rendering behavior, visual navigation paradigms, UI layouts, and Generative_Endpoint internal behavior are out of scope for these requirements.
6. THE public API SHALL NOT reference AGUI or A2UI by name — these are internal transport/protocol details hidden behind the anti-corruption layer (ADR-001).
7. Generated experiences are isolated — cross-experience communication is not a requirement. Coordination between experiences is a consumer-side concern.
