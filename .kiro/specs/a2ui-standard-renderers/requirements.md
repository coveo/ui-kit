# Requirements Document

## Introduction

This feature replaces the custom A2UI parsing logic (`a2ui-parser.ts`) in the generative-angular sample with the official `@a2ui/angular` renderer package (backed by `@a2ui/web_core`). The goal is to drastically reduce custom code, leverage the standard A2UI renderer's built-in state management and component resolution, and align with the A2UI ecosystem for easier future extensibility.

## Glossary

- **Renderer_Service**: The `A2uiRendererService` provided by `@a2ui/angular` — processes A2UI operation messages and manages reactive surface state via Angular Signals.
- **Component_Host**: The `a2ui-v09-component-host` / `SurfaceComponent` from `@a2ui/angular` that dynamically renders surfaces by resolving component types from registered catalogs.
- **Renderer_Config**: The `A2UI_RENDERER_CONFIG` injection token from `@a2ui/angular` used to supply catalogs and action handlers at the Angular module/provider level.
- **Basic_Catalog**: The standard catalog shipped with `@a2ui/angular` containing generic layout, content, and input components.
- **Commerce_Catalog**: A custom catalog defined in the sample app that maps commerce-specific A2UI component types (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar) to Angular components.
- **Activity_Snapshot**: An SSE event from the Coveo converse API with `type: "ACTIVITY_SNAPSHOT"` and `activityType: "a2ui-surface"` whose `content.operations` array contains A2UI v0.8 operations.
- **Operations_Array**: The `content.operations` field of an Activity_Snapshot containing `beginRendering`, `surfaceUpdate`, and `dataModelUpdate` operation objects.
- **Conversation_Service**: The Angular service (`ConversationService`) that manages conversation state, subscribes to `ConverseController`, and exposes reactive signals consumed by UI components.
- **Surface_Outlet**: The existing `SurfaceOutletComponent` that maps typed surfaces to Angular components via `NgComponentOutlet`.
- **Custom_Parser**: The existing `a2ui-parser.ts` module (~300 lines) that manually transforms raw A2UI surfaces into typed `RenderableCommerceSurface` objects.

## Requirements

### Requirement 1: Install and configure the A2UI Angular renderer packages

**User Story:** As a developer maintaining the generative-angular sample, I want to install the official `@a2ui/angular` and `@a2ui/web_core` packages, so that I can leverage the standard renderer infrastructure instead of custom parsing logic.

#### Acceptance Criteria

1. THE generative-angular sample SHALL declare `@a2ui/angular` and `@a2ui/web_core` as dependencies in its `package.json`.
2. WHEN the application bootstraps, THE App SHALL provide `A2UI_RENDERER_CONFIG` via Angular's dependency injection with at least the Commerce_Catalog registered.
3. THE Renderer_Config SHALL include an action handler that triggers new prompts through the Conversation_Service when a NextActionsBar action is selected.

### Requirement 2: Register a custom Commerce_Catalog

**User Story:** As a developer, I want to register the existing commerce Angular components (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar) as a custom A2UI catalog, so that the standard renderer can resolve and instantiate them by component type name.

#### Acceptance Criteria

1. THE Commerce_Catalog SHALL map the component type `"ProductCarousel"` to the `ProductCarouselComponent`.
2. THE Commerce_Catalog SHALL map the component type `"ComparisonTable"` to the `ComparisonTableComponent`.
3. THE Commerce_Catalog SHALL map the component type `"ComparisonSummary"` to the `ComparisonSummaryComponent`.
4. THE Commerce_Catalog SHALL map the component type `"BundleDisplay"` to the `BundleDisplayComponent`.
5. THE Commerce_Catalog SHALL map the component type `"NextActionsBar"` to the `NextActionsBarComponent`.
6. WHEN the Renderer_Service encounters a component type present in the Commerce_Catalog, THE Component_Host SHALL instantiate the corresponding Angular component.

### Requirement 3: Feed raw operations to the Renderer_Service

**User Story:** As a developer, I want the Conversation_Service to pass raw A2UI operations directly to the Renderer_Service instead of the Custom_Parser, so that the standard renderer handles state management and component resolution.

#### Acceptance Criteria

1. WHEN the ConverseController emits a turn containing `agentResponse.surfaces`, THE Conversation_Service SHALL extract the Operations_Array from each Activity_Snapshot surface and pass it to `Renderer_Service.processMessages()`.
2. WHEN an Activity_Snapshot has `replace: true`, THE Conversation_Service SHALL reset the Renderer_Service state before processing the new operations.
3. WHILE a turn has status `"streaming"`, THE Renderer_Service SHALL reflect loading states (e.g., `isLoading: true`) as conveyed by the incoming component data.
4. WHEN a turn completes (status transitions from `"streaming"` to `"complete"`), THE Renderer_Service SHALL clear all loading indicators from rendered surfaces.

### Requirement 4: Replace Surface_Outlet with Component_Host

**User Story:** As a developer, I want the transcript panel to use the standard A2UI Component_Host for rendering surfaces instead of the custom Surface_Outlet and `NgComponentOutlet` dispatch logic, so that surface rendering is fully delegated to the A2UI renderer.

#### Acceptance Criteria

1. THE transcript panel template SHALL use `a2ui-v09-component-host` (or equivalent Component_Host directive) to render each active surface from the Renderer_Service state.
2. WHEN the Renderer_Service state contains multiple surfaces, THE transcript panel SHALL render them in the order provided by the Renderer_Service.
3. THE Component_Host SHALL pass resolved component data (products, headings, attributes, actions) to each commerce component through the standard A2UI data binding mechanism.

### Requirement 5: Remove the Custom_Parser and associated custom types

**User Story:** As a developer, I want to delete the `a2ui-parser.ts` file and the A2UI-specific type definitions from `models.ts`, so that the codebase no longer carries redundant custom parsing logic.

#### Acceptance Criteria

1. WHEN the migration is complete, THE generative-angular sample SHALL NOT contain the file `a2ui-parser.ts`.
2. WHEN the migration is complete, THE `models.ts` file SHALL NOT export the types `A2UIOperation`, `ActivitySnapshotContent`, `BeginRenderingOperation`, `SurfaceUpdateOperation`, `DataModelUpdateOperation`, `SurfaceComponentPayload`, `CommerceSurfaceComponentType`, or `RenderableCommerceSurface`.
3. WHEN the migration is complete, THE Conversation_Service SHALL NOT import from `a2ui-parser.ts`.
4. THE generative-angular sample SHALL continue to export shared domain types (`ProductRecord`, `NextAction`, `BundleDisplayTier`, `BundleSlotConfig`) that the commerce components require for their inputs.

### Requirement 6: Preserve existing commerce component behavior

**User Story:** As a user of the generative-angular sample, I want the rendered commerce surfaces (product carousels, comparison tables, comparison summaries, bundle displays, and next-actions bars) to behave identically after the migration, so that no user-facing functionality is lost.

#### Acceptance Criteria

1. WHEN a ProductCarousel surface is rendered, THE ProductCarouselComponent SHALL display the heading and product list as before the migration.
2. WHEN a ComparisonTable surface is rendered, THE ComparisonTableComponent SHALL display the heading, attribute columns, and product rows as before the migration.
3. WHEN a ComparisonSummary surface is rendered, THE ComparisonSummaryComponent SHALL display the summary text as before the migration.
4. WHEN a BundleDisplay surface is rendered, THE BundleDisplayComponent SHALL display the title, tier labels, and slot products as before the migration.
5. WHEN a NextActionsBar action button is clicked, THE NextActionsBarComponent SHALL invoke the action handler configured in the Renderer_Config, which triggers a new prompt submission through the Conversation_Service.
6. WHILE any commerce surface has `isLoading: true`, THE corresponding component SHALL display its loading/skeleton state.

### Requirement 7: Maintain application build and serve integrity

**User Story:** As a developer, I want the generative-angular sample to compile and serve without errors after the migration, so that the sample remains a functional reference implementation.

#### Acceptance Criteria

1. WHEN `ng build` is executed, THE generative-angular sample SHALL produce a successful build with zero compilation errors.
2. WHEN `ng serve` is executed, THE generative-angular sample SHALL serve without runtime errors related to the A2UI renderer integration.
3. THE generative-angular sample SHALL NOT introduce circular dependency warnings related to the Renderer_Service or Commerce_Catalog registration.
