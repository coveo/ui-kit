# Implementation Plan: A2UI Standard Renderers

## Overview

Replace the custom `a2ui-parser.ts` and `SurfaceOutletComponent` in the generative-angular sample with the official `@a2ui/angular` renderer package. This involves installing packages, creating a Commerce Catalog, building a thin adapter service, reconfiguring the transcript panel to use `a2ui-v09-component-host`, adapting commerce component inputs, and cleaning up obsolete code.

## Tasks

- [ ] 1. Install packages and create Commerce Catalog
  - [ ] 1.1 Add `@a2ui/angular` and `@a2ui/web_core` dependencies to `samples/thermidor/generative-angular/package.json`
    - Add both packages to the `dependencies` section
    - Run `pnpm install` to update the lockfile
    - _Requirements: 1.1_

  - [ ] 1.2 Create the Commerce Catalog at `src/app/a2ui/commerce-catalog.ts`
    - Define and export `COMMERCE_CATALOG` as an `A2uiCatalog` object
    - Map `ProductCarousel` → `ProductCarouselComponent`
    - Map `ComparisonTable` → `ComparisonTableComponent`
    - Map `ComparisonSummary` → `ComparisonSummaryComponent`
    - Map `BundleDisplay` → `BundleDisplayComponent`
    - Map `NextActionsBar` → `NextActionsBarComponent`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Create the A2uiAdapterService
  - [ ] 2.1 Create `src/app/services/a2ui-adapter.service.ts`
    - Inject `A2uiRendererService` from `@a2ui/angular`
    - Implement `processSurfaces(surfaces: A2UISurface[])` method that iterates over surfaces, checks for `replace: true` (calling `renderer.reset()` if found), extracts `operations` arrays, and forwards them to `renderer.processMessages()`
    - Implement `reset()` method that calls `renderer.reset()`
    - Wrap `processMessages()` in a try/catch to log errors without propagating
    - _Requirements: 3.1, 3.2_

  - [ ]\* 2.2 Write property test for operations extraction (Property 1)
    - **Property 1: Operations extraction preserves content**
    - Use `fast-check` to generate random arrays of objects with varying `operations` arrays (empty, nested, large)
    - Verify all operations are forwarded to `processMessages()` without modification, in order
    - **Validates: Requirements 3.1**

  - [ ]\* 2.3 Write unit tests for `A2uiAdapterService`
    - Test that surfaces without `operations` are skipped silently
    - Test that `replace: true` triggers a reset before processing
    - Test that errors in `processMessages()` are caught and logged
    - _Requirements: 3.1, 3.2_

- [ ] 3. Configure A2UI_RENDERER_CONFIG provider
  - [ ] 3.1 Modify `src/app/app.config.ts` to provide `A2UI_RENDERER_CONFIG`
    - Import `A2UI_RENDERER_CONFIG` and `BasicCatalog` from `@a2ui/angular`
    - Import `COMMERCE_CATALOG` from `./a2ui/commerce-catalog`
    - Register both catalogs: `[BasicCatalog, COMMERCE_CATALOG]`
    - Configure the `actionHandler` to forward action payloads to `ConversationService.submit()` (use lazy injection or an intermediate bridge to avoid circular dependencies)
    - _Requirements: 1.2, 1.3, 6.5_

  - [ ]\* 3.2 Write property test for action handler forwarding (Property 2)
    - **Property 2: Action handler forwarding**
    - Use `fast-check` to generate arbitrary non-empty strings
    - Verify the action handler calls `ConversationService.submit()` with the exact string
    - **Validates: Requirements 1.3, 6.5**

- [ ] 4. Checkpoint - Ensure foundation compiles
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Modify ConversationService to use the adapter
  - [ ] 5.1 Update `src/app/services/conversation.service.ts`
    - Remove `import {parseSurfaces} from '../a2ui-parser'`
    - Remove the `surfaces` signal
    - Inject `A2uiAdapterService`
    - Replace the `buildSurfaces()` method with `collectSurfaces(turns: Turn[]): A2UISurface[]` that returns the latest turn's surfaces array
    - Call `this.adapter.processSurfaces(this.collectSurfaces(state.turns))` inside `applyState()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.3_

  - [ ]\* 5.2 Write unit tests for modified ConversationService
    - Verify `parseSurfaces` is no longer called
    - Verify `A2uiAdapterService.processSurfaces()` is called on state updates
    - Verify streaming/complete transitions are handled correctly
    - _Requirements: 3.1, 3.3, 3.4_

- [ ] 6. Modify TranscriptPanelComponent to use a2ui-v09-component-host
  - [ ] 6.1 Update `src/app/components/transcript-panel.component.ts`
    - Remove `SurfaceOutletComponent` import
    - Import the `a2ui-v09-component-host` component/directive from `@a2ui/angular`
    - Inject `A2uiRendererService` to access reactive surface state (or receive surfaces from the renderer as a signal input)
    - Replace the `surfaces` input of type `RenderableCommerceSurface[]` with the renderer's surface signal
    - Replace the `<app-surface-outlet>` loop with `<a2ui-v09-component-host [surface]="surface" />` iterating over renderer surfaces
    - Remove the `quickAction` output (action handling is now via `A2UI_RENDERER_CONFIG`)
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]\* 6.2 Write property test for surface render order (Property 3)
    - **Property 3: Surface render order preservation**
    - Use `fast-check` to generate random-length arrays of surface objects
    - Verify DOM order of `a2ui-v09-component-host` instances matches the renderer's surface order
    - **Validates: Requirements 4.2**

- [ ] 7. Adapt commerce component inputs
  - [ ] 7.1 Adapt `ProductCarouselComponent` inputs
    - Replace `surface = input.required<ProductCarouselSurface>()` with individual inputs: `heading = input<string>('')`, `products = input<ProductRecord[]>([])`, `isLoading = input<boolean>(false)`
    - Update template references from `surface().heading` to `heading()`, etc.
    - _Requirements: 6.1, 6.6_

  - [ ] 7.2 Adapt `ComparisonTableComponent` inputs
    - Replace `surface` input with individual inputs: `heading`, `attributes`, `products`, `isLoading`
    - Update template references accordingly
    - _Requirements: 6.2, 6.6_

  - [ ] 7.3 Adapt `ComparisonSummaryComponent` inputs
    - Replace `surface` input with individual input: `text = input<string>('')`
    - Update template references accordingly
    - _Requirements: 6.3_

  - [ ] 7.4 Adapt `BundleDisplayComponent` inputs
    - Replace `surface` input with individual inputs: `title`, `bundles`, `isLoading`
    - Update template references accordingly
    - _Requirements: 6.4, 6.6_

  - [ ] 7.5 Adapt `NextActionsBarComponent` inputs
    - Replace `surface` input with individual inputs: `actions`, `isLoading`
    - Remove `onSelectAction` callback input (actions are now handled by the A2UI action handler config)
    - Update template to dispatch actions through the A2UI mechanism
    - _Requirements: 6.5, 6.6_

  - [ ]\* 7.6 Write unit tests for commerce component input adaptation
    - Verify each component renders correctly with individual inputs
    - Verify loading states display skeleton UI
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. Checkpoint - Ensure adapted components compile and render
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Clean up obsolete code
  - [ ] 9.1 Remove obsolete types from `src/app/models.ts`
    - Delete types: `A2UIOperation`, `ActivitySnapshotContent`, `BeginRenderingOperation`, `SurfaceUpdateOperation`, `DataModelUpdateOperation`, `SurfaceComponentPayload`, `CommerceSurfaceComponentType`, `RenderableCommerceSurface`, `ProductCarouselSurface`, `ComparisonTableSurface`, `ComparisonSummarySurface`, `BundleDisplaySurface`, `NextActionsBarSurface`, `ValueMapEntry`, `ValueMapItem`
    - Retain: `ProductRecord`, `NextAction`, `BundleDisplayTier`, `BundleDisplaySlot`, `BundleSlotConfig`, `BundleTierConfig`
    - _Requirements: 5.2, 5.4_

  - [ ] 9.2 Delete `src/app/a2ui-parser.ts`
    - Remove the file entirely
    - _Requirements: 5.1, 5.3_

  - [ ] 9.3 Delete `src/app/components/surface-outlet.component.ts`
    - Remove the file entirely
    - Verify no remaining imports reference this file
    - _Requirements: 4.1_

- [ ] 10. Final verification
  - [ ] 10.1 Verify build integrity
    - Run `ng build` and confirm zero compilation errors
    - Confirm no circular dependency warnings in build output
    - Confirm `a2ui-parser.ts` and `surface-outlet.component.ts` no longer exist
    - Confirm `package.json` includes `@a2ui/angular` and `@a2ui/web_core`
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing commerce component templates and styles remain unchanged — only the input binding interface shifts
- The `@a2ui/angular` package handles all surface state management internally via Angular Signals

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1"]},
    {"id": 1, "tasks": ["1.2", "2.1"]},
    {"id": 2, "tasks": ["2.2", "2.3", "3.1"]},
    {"id": 3, "tasks": ["3.2", "5.1"]},
    {"id": 4, "tasks": ["5.2", "6.1"]},
    {"id": 5, "tasks": ["6.2", "7.1", "7.2", "7.3", "7.4", "7.5"]},
    {"id": 6, "tasks": ["7.6", "9.1"]},
    {"id": 7, "tasks": ["9.2", "9.3"]},
    {"id": 8, "tasks": ["10.1"]}
  ]
}
```
