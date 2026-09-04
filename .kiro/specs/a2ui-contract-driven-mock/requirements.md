# Requirements Document

## Introduction

This feature introduces contract-driven mock responses for three conversational A2-UI scenarios in the `demo-schema-react` sample. Following the architecture defined by ADR-001 (hierarchical controller-based schema) and ADR-002 (AG-UI for controller state transport, A2-UI for surface composition), the feature:

1. Defines new controller schemas and component schemas in `packages/thermidor-schema` (within the ui-kit monorepo) for NextActionsBar, BundleDisplay, and ComparisonTable. Controller JSON Schemas go under `packages/thermidor-schema/schema/controllers/` and component JSON Schemas go under `packages/thermidor-schema/schema/components/`. Zod code is generated via `pnpm run generate` (which runs `scripts/generate-zod.ts`) and output lands in `src/generated/schemas.ts`.
2. Updates the mock templates in `@coveo/platform-mock-api` to emit proper AG-UI `StateSnapshot` events alongside A2-UI component advertisements that reference `controllerId` and `controllerSchema`.
3. Registers new catalog component renderers in the demo sample so the frontend can consume advertised controllers via `buildRemoteController`/`useAdvertisedController`.

The result is that the three conversational scenarios render end-to-end in local development using the same contract-driven architecture as the existing ProductCarousel and Cart components.

## Glossary

- **Controller_Schema**: A JSON Schema document in `packages/thermidor-schema/schema/controllers/` defining the state shape and available actions for a controller, registered in the `ControllerContracts` discriminated union.
- **Component_Schema**: A JSON Schema document in `packages/thermidor-schema/schema/components/` mapping a named component to its required controllers (following the pattern of `product-carousel.schema.json` and `cart.schema.json`).
- **StateSnapshot**: An AG-UI event carrying the complete `controllers` map (keyed by runtime controller ID) that the Thermidor Engine uses to hydrate or resynchronize controller state on the frontend.
- **A2UI_Surface_Activity**: An `ACTIVITY_SNAPSHOT` event with `activityType: 'a2ui-surface'` carrying surface lifecycle and component composition in v1.0 format.
- **Component_Advertisement**: An A2-UI component entry within a `createSurface` message that declares a `controllerId` and `controllerSchema` via its props, enabling the frontend to build a typed remote controller.
- **Mock_Template**: A TypeScript module in `packages/platform-mock-api/src/converse/templates/` exporting an array of `ConverseEvent` objects that simulate a backend conversation response.
- **Controller_Contracts_Union**: The `ControllerContracts` Zod discriminated union in `@coveo/thermidor-schema` that indexes all known controller schemas by their `controllerSchema` literal.
- **Remote_Controller**: A typed frontend object built by `buildRemoteController` from `@coveo/thermidor` that selects state from the AG-UI snapshot and exposes typed action dispatchers.
- **Catalog_Renderer**: A React component registered in the A2-UI catalog that receives props containing controller advertisements and renders UI by subscribing to the corresponding Remote_Controller.
- **Prompt_Mapping**: An entry in the `PROMPT_TEMPLATE_MAP` array in `generate-response.ts` that associates a normalized user prompt string with a template ID.

## Requirements

### Requirement 1: NextActionsBar Controller Schema

**User Story:** As a frontend developer, I want a typed controller schema for the NextActionsBar component, so that the mock API can advertise controller state and the frontend can consume it through a Remote_Controller.

#### Acceptance Criteria

1. THE Controller_Schema SHALL define a `controllerSchema` literal of `"https://schema.thermidor.coveo.com/controllers/next-actions.schema.json"`.
2. THE Controller_Schema SHALL define a state object with a required `actions` property containing an array of action items.
3. WHEN an action item is defined, THE Controller_Schema SHALL require each item to have a `text` property of type string and a `type` property constrained to the values `"followup"` or `"search"`.
4. THE Controller_Schema SHALL define an `actions` object with a required `selectAction` action. The `selectAction` payload SHALL require a `text` property (string) and a `type` property constrained to `"followup"` or `"search"`, matching the shape of an action item.
5. THE Controller_Schema SHALL extend the base controller schema at `https://schema.thermidor.coveo.com/base/controller.schema.json`.
6. WHEN `pnpm run generate` is executed in `packages/thermidor-schema`, THE Controller_Contracts_Union SHALL include the NextActionsBar controller schema as a valid discriminated variant.
7. THE Component_Schema SHALL be created at `packages/thermidor-schema/schema/components/next-actions-bar.schema.json`, referencing the NextActionsBar controller schema via a `controllers` property with a required `nextActionsController` field.

### Requirement 2: BundleDisplay Controller Schema

**User Story:** As a frontend developer, I want a typed controller schema for the BundleDisplay component, so that tiered product bundles can be rendered from backend-owned state.

#### Acceptance Criteria

1. THE Controller_Schema SHALL define a `controllerSchema` literal of `"https://schema.thermidor.coveo.com/controllers/bundle-display.schema.json"`.
2. THE Controller_Schema SHALL define a state object with a required `tiers` property containing an array of tier objects.
3. WHEN a tier object is defined, THE Controller_Schema SHALL require `label` (string), `description` (string), and `slots` (array) properties.
4. WHEN a slot object is defined, THE Controller_Schema SHALL require a `categoryLabel` (string) property and a `surfaceRef` (string) property referencing the surface ID where that slot's products are rendered.
5. THE Controller_Schema SHALL define an empty `actions` object (no dispatchable actions), making the controller read-only.
6. THE Controller_Schema SHALL extend the base controller schema at `https://schema.thermidor.coveo.com/base/controller.schema.json`.
7. WHEN `pnpm run generate` is executed in `packages/thermidor-schema`, THE Controller_Contracts_Union SHALL include the BundleDisplay controller schema as a valid discriminated variant.
8. THE Component_Schema SHALL be created at `packages/thermidor-schema/schema/components/bundle-display.schema.json`, referencing the BundleDisplay controller schema via a `controllers` property with a required `bundleDisplayController` field.

### Requirement 3: ComparisonTable Controller Schema

**User Story:** As a frontend developer, I want a typed controller schema for the ComparisonTable component, so that product comparisons can be rendered from backend-owned state.

#### Acceptance Criteria

1. THE Controller_Schema SHALL define a `controllerSchema` literal of `"https://schema.thermidor.coveo.com/controllers/comparison-table.schema.json"`.
2. THE Controller_Schema SHALL define a state object with a required `products` property (array of product references) and a required `attributes` property (array of attribute descriptors).
3. WHEN a product reference is defined, THE Controller_Schema SHALL require `productId` (string), `name` (string), and `values` (record mapping attribute keys to string values) properties, and allow optional `imageUrl` (string URI), `price` (number), and `rating` (number 0-5) properties.
4. WHEN an attribute descriptor is defined, THE Controller_Schema SHALL require a `key` (string) property and a `label` (string) property.
5. THE Controller_Schema SHALL define an empty `actions` object (no dispatchable actions), making the controller read-only.
6. THE Controller_Schema SHALL extend the base controller schema at `https://schema.thermidor.coveo.com/base/controller.schema.json`.
7. WHEN `pnpm run generate` is executed in `packages/thermidor-schema`, THE Controller_Contracts_Union SHALL include the ComparisonTable controller schema as a valid discriminated variant.
8. THE Component_Schema SHALL be created at `packages/thermidor-schema/schema/components/comparison-table.schema.json`, referencing the ComparisonTable controller schema via a `controllers` property with a required `comparisonTableController` field.

### Requirement 4: NextActionsBar Mock Template

**User Story:** As a developer running the demo locally, I want the fallback prompt to produce a well-formed NextActionsBar response, so that I can verify the end-to-end contract-driven rendering without a real backend.

#### Acceptance Criteria

1. WHEN the mock server receives an unrecognized prompt (fallback), THE Mock_Template SHALL emit a text message followed by a complete NextActionsBar scenario.
2. THE Mock_Template SHALL emit an A2UI_Surface_Activity containing a `createSurface` message in v1.0 format with a component entry for `NextActionsBar` that includes `controllerId` and `controllerSchema` in its props.
3. THE Mock_Template SHALL emit a StateSnapshot event whose `snapshot.controllers` map contains an entry keyed by the same `controllerId` advertised in the surface, with state conforming to the NextActionsBar Controller_Schema.
4. THE Mock_Template SHALL include at least 2 action items in the controller state, with at least one of type `"followup"` and at least one of type `"search"`.
5. THE Mock_Template SHALL be wrapped by `buildConversationResponse` to include standard turn lifecycle events (TurnStarted, RunStarted, RunFinished, TurnComplete).

### Requirement 5: BundleDisplay Mock Template

**User Story:** As a developer running the demo locally, I want the "build a beginner surfing kit with budget, mid-range, and premium options" prompt to produce a well-formed BundleDisplay response, so that I can verify tiered bundles render correctly.

#### Acceptance Criteria

1. WHEN the mock server receives the prompt "build a beginner surfing kit with budget, mid-range, and premium options", THE Mock_Template SHALL emit a BundleDisplay scenario.
2. THE Mock_Template SHALL emit an A2UI_Surface_Activity containing a `createSurface` message in v1.0 format with a component entry for `BundleDisplay` that includes `controllerId` and `controllerSchema` in its props.
3. THE Mock_Template SHALL emit a StateSnapshot event whose `snapshot.controllers` map contains an entry keyed by the advertised `controllerId`, with state conforming to the BundleDisplay Controller_Schema.
4. THE Mock_Template SHALL include exactly 3 tiers in the controller state with labels corresponding to budget, mid-range, and premium options.
5. WHEN a tier has slots referencing product surfaces, THE Mock_Template SHALL also emit additional A2UI_Surface_Activity events or StateSnapshot entries for the referenced product-list controllers (one per slot category).
6. THE Mock_Template SHALL be wrapped by `buildConversationResponse` to include standard turn lifecycle events.
7. THE Prompt_Mapping for this template SHALL remain `"build a beginner surfing kit with budget, mid-range, and premium options"` mapped to its template ID.

### Requirement 6: ComparisonTable Mock Template

**User Story:** As a developer running the demo locally, I want the "i like cold-water surfing. compare wetsuits for it" prompt to produce a well-formed ComparisonTable response, so that I can verify product comparison renders correctly.

#### Acceptance Criteria

1. WHEN the mock server receives the prompt "i like cold-water surfing. compare wetsuits for it", THE Mock_Template SHALL emit a ComparisonTable scenario.
2. THE Mock_Template SHALL emit an A2UI_Surface_Activity containing a `createSurface` message in v1.0 format with a component entry for `ComparisonTable` that includes `controllerId` and `controllerSchema` in its props.
3. THE Mock_Template SHALL emit a StateSnapshot event whose `snapshot.controllers` map contains an entry keyed by the advertised `controllerId`, with state conforming to the ComparisonTable Controller_Schema.
4. THE Mock_Template SHALL include at least 3 products and at least 3 comparison attributes in the controller state.
5. THE Mock_Template SHALL be wrapped by `buildConversationResponse` to include standard turn lifecycle events.
6. THE Prompt_Mapping for this template SHALL remain `"i like cold-water surfing. compare wetsuits for it"` mapped to its template ID.

### Requirement 7: Catalog Renderer Registration for New Components

**User Story:** As a frontend developer, I want the demo-schema-react sample to register catalog renderers for NextActionsBar, BundleDisplay, and ComparisonTable, so that the A2-UI renderer can instantiate them when their surfaces arrive.

#### Acceptance Criteria

1. THE Catalog_Renderer definitions SHALL include entries for `NextActionsBar`, `BundleDisplay`, and `ComparisonTable` alongside the existing `ProductCarousel` and `Cart`.
2. WHEN a `NextActionsBar` component is advertised, THE Catalog_Renderer SHALL declare a props schema requiring a `controllers` object with a `nextActionsController` field containing `controllerId` and `controllerSchema`.
3. WHEN a `BundleDisplay` component is advertised, THE Catalog_Renderer SHALL declare a props schema requiring a `controllers` object with a `bundleDisplayController` field containing `controllerId` and `controllerSchema`.
4. WHEN a `ComparisonTable` component is advertised, THE Catalog_Renderer SHALL declare a props schema requiring a `controllers` object with a `comparisonTableController` field containing `controllerId` and `controllerSchema`.
5. THE Catalog_Renderer for each new component SHALL invoke `useAdvertisedController` with the advertised controller props to obtain a typed Remote_Controller.
6. THE Catalog_Renderer for each new component SHALL render UI reflecting the controller state obtained from the Remote_Controller (actions list for NextActionsBar, tier layout for BundleDisplay, tabular comparison for ComparisonTable).

### Requirement 8: Schema Generation and Type Export

**User Story:** As a consumer of `@coveo/thermidor-schema`, I want generated Zod schemas and TypeScript types for the new controllers, so that I can use compile-time type safety when building components.

#### Acceptance Criteria

1. WHEN `pnpm run generate` is executed in `packages/thermidor-schema`, THE Generator SHALL produce Zod schemas for `NextActionsControllerContractSchema`, `BundleDisplayControllerContractSchema`, and `ComparisonTableControllerContractSchema` in `src/generated/schemas.ts`.
2. THE Generator SHALL export the new state types (`NextActionsState`, `BundleDisplayState`, `ComparisonTableState`) from the package entry point (`src/index.ts`).
3. THE Generator SHALL export the new contract schemas (`NextActionsControllerContractSchema`, `BundleDisplayControllerContractSchema`, `ComparisonTableControllerContractSchema`) from the package entry point (`src/index.ts`).
4. THE updated `ControllerContractsSchema` discriminated union SHALL accept all five controller schemas (product-list, cart, next-actions, bundle-display, comparison-table).
5. FOR ALL new controller state types, generating a state object, serializing it to JSON, and parsing it back through the corresponding Zod schema SHALL produce an equivalent object (round-trip property).

### Requirement 9: Mock Template Format Consistency

**User Story:** As a developer, I want all three new mock templates to follow the same structural patterns as the existing working ProductSearchSurface template (response4), so that the platform-mock-api remains internally consistent and predictable.

#### Acceptance Criteria

1. THE Mock_Template for each new scenario SHALL use the `ActivitySnapshot` helper from `events.ts` to construct A2UI_Surface_Activity events.
2. THE Mock_Template for each new scenario SHALL use the `StateSnapshot` helper from `events.ts` to construct AG-UI state events, passing a `snapshot` object with a `controllers` map.
3. THE Mock_Template for each new scenario SHALL use v1.0 format in A2-UI messages (with `createSurface` containing `surfaceId`, `catalogId`, `components`, and component props — not the legacy `beginRendering`/`surfaceUpdate`/`dataModelUpdate` format).
4. THE Mock_Template for each new scenario SHALL reference the Thermidor catalog ID `"https://schema.thermidor.coveo.com/a2-ui/catalog.json"` in the `catalogId` field of the created surface.
5. IF a scenario includes assistant text messages, THE Mock_Template SHALL use the `textMessage` helper or equivalent TEXT_MESSAGE_START/CONTENT/END event structure.
