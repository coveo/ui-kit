# Requirements Document

## Introduction

Register a new `generativeUnified` interface type in the thermidor package's `InterfaceRegistry`. This type supports the upcoming unified endpoint (AgentGateway protocol) while remaining structurally parallel to the existing `generative` type. This task is scoped to type registration, class implementation, and a public factory — no runtime client or controller wiring.

## Glossary

- **InterfaceRegistry**: The central TypeScript interface in `interface-types.ts` that maps interface type keys to their associated branded interface type and facades.
- **Facade**: A named capability slot (e.g., `'conversation'`, `'search'`) that an interface declares support for.
- **BaseInterface**: The abstract base class that all interface implementations extend, parameterized by their interface type key.
- **Engine**: The runtime orchestration object that manages slices, interfaces, and dispatch.
- **GenerativeSlice**: The Redux Toolkit slice that holds conversational state (turns, session tokens, etc.).
- **InterfaceHandle**: The minimal public contract of an interface — exposes `disposed` and `dispose()`.
- **GenerativeUnifiedInterface**: The branded interface type for the new `generativeUnified` registry entry.
- **GenerativeUnifiedInterfaceImpl**: The concrete class implementing `GenerativeUnifiedInterface`.

## Requirements

### Requirement 1: Registry Entry

**User Story:** As a thermidor consumer, I want `generativeUnified` to be a recognized interface type, so that the type system can distinguish unified-endpoint interfaces from converse-endpoint interfaces.

#### Acceptance Criteria

1. THE InterfaceRegistry SHALL contain a `generativeUnified` key whose `interface` field is `GenerativeUnifiedInterface` and whose `facades` field is `'conversation'`.
2. WHEN TypeScript resolves `InterfaceType`, THE type system SHALL include `'generativeUnified'` as a valid union member.
3. WHEN TypeScript resolves `Facades['generativeUnified']`, THE type system SHALL evaluate to `'conversation'`.

### Requirement 2: Branded Interface Type

**User Story:** As a library author, I want `GenerativeUnifiedInterface` and `GenerativeInterface` to be nominally distinct, so that consumers cannot accidentally pass one where the other is expected.

#### Acceptance Criteria

1. THE GenerativeUnifiedInterface type SHALL extend `Supports<'conversation'>`.
2. WHEN a value typed `GenerativeUnifiedInterface` is assigned to a variable typed `GenerativeInterface`, THE TypeScript compiler SHALL produce a type error.
3. WHEN a value typed `GenerativeInterface` is assigned to a variable typed `GenerativeUnifiedInterface`, THE TypeScript compiler SHALL produce a type error.

### Requirement 3: Implementation Class

**User Story:** As a thermidor developer, I want a `GenerativeUnifiedInterfaceImpl` class that mirrors `GenerativeInterfaceImpl`, so that the unified interface can be instantiated and participate in the engine lifecycle.

#### Acceptance Criteria

1. THE GenerativeUnifiedInterfaceImpl SHALL extend `BaseInterface<'generativeUnified'>` and implement `GenerativeUnifiedInterface`.
2. WHEN constructed, THE GenerativeUnifiedInterfaceImpl SHALL call `engine.adoptSlice(getOrCreateGenerativeSlice(this))` to register the generative slice with the engine.
3. WHEN constructed, THE GenerativeUnifiedInterfaceImpl SHALL register a noop facade resolver for the `'conversation'` facade.

### Requirement 4: Public Factory Function

**User Story:** As a thermidor consumer, I want a `buildGenerativeUnifiedInterface` factory function, so that I can create a `GenerativeUnifiedInterface` handle without importing internal classes.

#### Acceptance Criteria

1. THE `buildGenerativeUnifiedInterface` function SHALL accept an options object with a required `engine: Engine` property and an optional `id: string` property.
2. WHEN `id` is not provided, THE factory SHALL generate a unique identifier for the interface.
3. WHEN called, THE factory SHALL return a value that satisfies the `GenerativeUnifiedInterface` type.
4. WHEN called, THE factory SHALL resolve the full engine from the provided `Engine` handle before constructing the implementation.

### Requirement 5: Disposability

**User Story:** As a thermidor consumer, I want the generative unified interface to be disposable, so that I can clean up resources when the interface is no longer needed.

#### Acceptance Criteria

1. WHEN `.dispose()` is called on a `GenerativeUnifiedInterface` handle, THE handle SHALL mark itself as disposed (`.disposed === true`).
2. WHEN `.dispose()` is called, THE handle SHALL remove itself from the engine's interface set.
3. IF `.dispose()` has already been called, THEN calling `.dispose()` again SHALL have no effect (idempotent).
4. IF the handle is disposed, THEN invoking facade resolution SHALL throw an error.

### Requirement 6: Module Exports

**User Story:** As a thermidor developer, I want the new interface to be properly exported from barrel files, so that internal and public consumers can import it through standard paths.

#### Acceptance Criteria

1. THE internal interfaces barrel (`internal/interfaces/index.ts`) SHALL export `GenerativeUnifiedInterfaceImpl`.
2. THE internal utils barrel (`internal/utils/index.ts`) SHALL export the `GenerativeUnifiedInterface` type.
3. THE public interfaces directory SHALL contain a `generative-unified.ts` module exporting `buildGenerativeUnifiedInterface` and re-exporting the `GenerativeUnifiedInterface` type.
