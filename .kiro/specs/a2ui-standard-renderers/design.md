# Design Document: A2UI Standard Renderers

## Overview

This design replaces the custom `a2ui-parser.ts` (~300 lines) and `SurfaceOutletComponent` dispatch logic in the generative-angular sample with the official `@a2ui/angular` renderer package. The migration introduces three new architectural pieces:

1. **A2UI Adapter Service** — A thin bridge that extracts raw A2UI operations from Thermidor's `A2UISurface[]` (ActivitySnapshot envelopes) and feeds them to the standard `A2uiRendererService`.
2. **Commerce Catalog** — A custom catalog registration mapping our existing commerce component types to their Angular implementations.
3. **Component Host integration** — Replacing the `SurfaceOutletComponent` / `NgComponentOutlet` pattern with the standard `a2ui-v09-component-host` directive.

The existing commerce components (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar) remain functionally unchanged. Their input interface shifts from typed `@Input surface` objects to the A2UI renderer's standard data-binding mechanism (component props + data model).

```mermaid
graph TD
    subgraph Thermidor
        CC[ConverseController] -->|state subscription| CS[ConversationService]
    end

    subgraph "New Bridge Layer"
        CS -->|A2UISurface[]| ADA[A2uiAdapterService]
        ADA -->|raw operations| RS[A2uiRendererService]
    end

    subgraph "A2UI Angular Renderer"
        RS -->|reactive surface state| CH[a2ui-v09-component-host]
        CH -->|catalog lookup| CAT[Commerce Catalog]
        CAT -->|instantiates| PC[ProductCarouselComponent]
        CAT -->|instantiates| CT[ComparisonTableComponent]
        CAT -->|instantiates| CSM[ComparisonSummaryComponent]
        CAT -->|instantiates| BD[BundleDisplayComponent]
        CAT -->|instantiates| NA[NextActionsBarComponent]
    end

    NA -->|action handler| CS
```

## Architecture

### High-Level Data Flow

1. The `ConverseController` emits state updates containing `agentResponse.surfaces` — an array of opaque `A2UISurface` records (each being an ActivitySnapshot content with an `operations` array).
2. The new `A2uiAdapterService` subscribes to these updates, extracts the `operations` arrays, and calls `A2uiRendererService.processMessages()` with the raw A2UI v0.8 operations.
3. The `A2uiRendererService` manages its internal surface state reactively (via Angular Signals), resolving component types against registered catalogs.
4. The transcript panel template iterates over the renderer's surface list using `a2ui-v09-component-host`, which instantiates the correct commerce component for each surface.
5. When a user clicks a NextActionsBar action, the action handler (configured in `A2UI_RENDERER_CONFIG`) calls back into `ConversationService.submit()` to trigger a new turn.

### Key Design Decisions

| Decision                                                                                            | Rationale                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Introduce a dedicated `A2uiAdapterService` rather than inlining extraction in `ConversationService` | Separation of concerns: the adapter owns the A2UI protocol bridge; `ConversationService` stays focused on turn lifecycle. Also avoids circular dependencies. |
| Keep commerce components' internal template/styles unchanged                                        | Minimizes risk. Only the input binding interface changes.                                                                                                    |
| Register a single merged catalog (Commerce + Basic)                                                 | The Basic_Catalog provides fallback rendering for any future generic A2UI components while the Commerce_Catalog handles our domain-specific surfaces.        |
| Use the action handler in `A2UI_RENDERER_CONFIG` for NextActionsBar interactions                    | This is the standard A2UI pattern for component-to-app communication — avoids custom event wiring.                                                           |
| Adapt component inputs to A2UI data-binding props                                                   | The A2UI Component_Host passes data via `componentProps` and the data model. Components read from these instead of a monolithic typed surface object.        |

## Components and Interfaces

### 1. `A2uiAdapterService` (new)

**Location:** `src/app/services/a2ui-adapter.service.ts`

**Responsibility:** Bridge between Thermidor's `A2UISurface[]` and `A2uiRendererService`.

```typescript
@Injectable({providedIn: 'root'})
export class A2uiAdapterService {
  private readonly renderer = inject(A2uiRendererService);

  /**
   * Processes an array of A2UISurface records (ActivitySnapshot contents)
   * by extracting operations and forwarding them to the renderer.
   */
  processSurfaces(surfaces: A2UISurface[]): void;

  /**
   * Resets the renderer state (used when a snapshot has replace: true,
   * or when starting a new conversation).
   */
  reset(): void;
}
```

**Extraction logic:**

```typescript
for (const surface of surfaces) {
  const content = surface as {operations?: unknown[]; replace?: boolean};
  if (content.replace) {
    this.renderer.reset(); // or equivalent clear method
  }
  if (Array.isArray(content.operations)) {
    this.renderer.processMessages(content.operations);
  }
}
```

### 2. `Commerce Catalog` (new)

**Location:** `src/app/a2ui/commerce-catalog.ts`

**Responsibility:** Maps commerce component type strings to Angular component classes.

```typescript
import type {A2uiCatalog} from '@a2ui/angular';

export const COMMERCE_CATALOG: A2uiCatalog = {
  ProductCarousel: ProductCarouselComponent,
  ComparisonTable: ComparisonTableComponent,
  ComparisonSummary: ComparisonSummaryComponent,
  BundleDisplay: BundleDisplayComponent,
  NextActionsBar: NextActionsBarComponent,
};
```

### 3. `A2UI_RENDERER_CONFIG` Provider (new)

**Location:** `src/app/app.config.ts`

**Responsibility:** Configures the A2UI renderer with catalogs and the action handler.

```typescript
import {A2UI_RENDERER_CONFIG, BasicCatalog} from '@a2ui/angular';
import {COMMERCE_CATALOG} from './a2ui/commerce-catalog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => ({
        catalogs: [BasicCatalog, COMMERCE_CATALOG],
        actionHandler: (action: {type: string; payload: unknown}) => {
          // Injected at runtime via a wrapper — see ConversationService integration
          return inject(ConversationService).submit(String(action.payload));
        },
      }),
    },
  ],
};
```

> **Note:** The exact action handler injection pattern will depend on `@a2ui/angular`'s DI support. If the config factory runs in an injection context, `inject()` works directly. Otherwise, a wrapper service or `APP_INITIALIZER` pattern may be needed.

### 4. Modified `ConversationService`

**Changes:**

- Remove `parseSurfaces` import and usage.
- Remove the `surfaces` signal (no longer needed — surfaces come from `A2uiRendererService` state).
- Inject `A2uiAdapterService` and call `processSurfaces()` in `applyState()`.
- Expose a method for the action handler to trigger prompts.

```typescript
@Injectable({providedIn: 'root'})
export class ConversationService {
  private readonly adapter = inject(A2uiAdapterService);

  // ... existing fields minus `surfaces` signal ...

  private applyState(state: ConverseControllerState): void {
    // ... existing logic ...
    this.adapter.processSurfaces(this.collectSurfaces(state.turns));
  }

  private collectSurfaces(turns: Turn[]): A2UISurface[] {
    // Find latest turn with surfaces (same logic as current buildSurfaces)
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].agentResponse?.surfaces?.length) {
        return turns[i].agentResponse!.surfaces;
      }
    }
    return [];
  }
}
```

### 5. Modified `TranscriptPanelComponent`

**Changes:**

- Remove `SurfaceOutletComponent` import.
- Import and use `a2ui-v09-component-host` from `@a2ui/angular`.
- Inject `A2uiRendererService` (or receive surfaces signal as input) for the surface list.

```html
<!-- Replace the surface-stack section -->
@if (rendererSurfaces().length > 0) {
<article class="inline-surfaces">
  <div class="inline-surfaces-head">
    <p class="bubble-role">Assistant</p>
    <span>Structured results</span>
  </div>
  <div class="surface-stack">
    @for (surface of rendererSurfaces(); track surface.id) {
    <a2ui-v09-component-host [surface]="surface" />
    }
  </div>
</article>
}
```

### 6. Modified Commerce Components

Each commerce component shifts from a typed `surface` input to individual A2UI-bound props. The A2UI Component_Host passes data through its standard binding mechanism.

**Example — ProductCarouselComponent (before):**

```typescript
readonly surface = input.required<ProductCarouselSurface>();
// Template accesses: surface().heading, surface().products, surface().isLoading
```

**Example — ProductCarouselComponent (after):**

```typescript
readonly heading = input<string>('');
readonly products = input<ProductRecord[]>([]);
readonly isLoading = input<boolean>(false);
// Template accesses: heading(), products(), isLoading()
```

The A2UI data-binding mechanism resolves `componentProps` (heading, isLoading) and `dataModel` entries (products from the `items` key) into the component's inputs automatically.

### 7. Files to Delete

| File                                             | Reason                                |
| ------------------------------------------------ | ------------------------------------- |
| `src/app/a2ui-parser.ts`                         | Replaced by `A2uiRendererService`     |
| `src/app/components/surface-outlet.component.ts` | Replaced by `a2ui-v09-component-host` |

### 8. Types to Remove from `models.ts`

- `A2UIOperation`
- `ActivitySnapshotContent`
- `BeginRenderingOperation`
- `SurfaceUpdateOperation`
- `DataModelUpdateOperation`
- `SurfaceComponentPayload`
- `CommerceSurfaceComponentType`
- `RenderableCommerceSurface`
- `ProductCarouselSurface`
- `ComparisonTableSurface`
- `ComparisonSummarySurface`
- `BundleDisplaySurface`
- `NextActionsBarSurface`
- `ValueMapEntry`
- `ValueMapItem`

**Retained types:** `ProductRecord`, `NextAction`, `BundleDisplayTier`, `BundleDisplaySlot`, `BundleSlotConfig`, `BundleTierConfig`.

## Data Models

### A2UI Operation Flow (unchanged wire format)

The A2UI v0.8 operations arrive as-is from the converse API. The adapter does not transform them — it only unwraps the ActivitySnapshot envelope:

```
ActivitySnapshot surface record:
{
  operations: [
    { beginRendering: { surfaceId, root, catalogId } },
    { surfaceUpdate: { surfaceId, components: [{ id, component: { ProductCarousel: {...} } }] } },
    { dataModelUpdate: { surfaceId, contents: [{ key: "items", valueMap: [...] }] } }
  ],
  replace?: boolean
}
```

After extraction, these raw operation objects are passed directly to `A2uiRendererService.processMessages()`.

### Commerce Component Data Model (via A2UI binding)

The A2UI renderer maps operations to component inputs as follows:

| A2UI Source                                                                     | Component Input             | Example                  |
| ------------------------------------------------------------------------------- | --------------------------- | ------------------------ |
| `surfaceUpdate.components[].component.ProductCarousel.heading.literalString`    | `heading: string`           | `"Top Surfboards"`       |
| `surfaceUpdate.components[].component.ProductCarousel.isLoading`                | `isLoading: boolean`        | `true`                   |
| `dataModelUpdate.contents[key="items"].valueMap`                                | `products: ProductRecord[]` | Array of product objects |
| `surfaceUpdate.components[].component.NextActionsBar.actions` (via dataBinding) | `actions: NextAction[]`     | Array of action objects  |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Operations extraction preserves content

_For any_ valid array of `A2UISurface` records (each containing an `operations` array), the `A2uiAdapterService.processSurfaces()` method SHALL extract and forward every operation object to `A2uiRendererService.processMessages()` without modification, in the same order they appear in the source.

**Validates: Requirements 3.1**

### Property 2: Action handler forwarding

_For any_ non-empty action string dispatched through the A2UI action handler, the `ConversationService.submit()` method SHALL be called with that exact string as the prompt.

**Validates: Requirements 1.3, 6.5**

### Property 3: Surface render order preservation

_For any_ ordered list of surfaces provided by the `A2uiRendererService` state, the transcript panel SHALL render `a2ui-v09-component-host` instances in the same sequential order.

**Validates: Requirements 4.2**

## Error Handling

| Scenario                                                           | Handling                                                                                                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `A2UISurface` record has no `operations` field                     | Adapter skips silently (defensive guard: `if (!Array.isArray(content.operations)) continue`)                                  |
| `operations` contains unknown operation types                      | Passed through to `A2uiRendererService` — the renderer ignores unrecognized operations per the A2UI spec                      |
| `A2uiRendererService` throws during `processMessages()`            | Adapter catches and logs to console; does not propagate to `ConversationService` to avoid breaking the subscription loop      |
| Commerce Catalog lookup fails (unknown component type)             | `a2ui-v09-component-host` renders nothing (standard A2UI fallback behavior)                                                   |
| Action handler receives malformed payload                          | Guard with `String(action.payload ?? '')` — empty strings are ignored by `ConversationService.submit()`                       |
| Circular dependency between `ConversationService` ↔ action handler | Avoided by injecting `ConversationService` lazily in the action handler factory, or via an intermediate `ActionBridgeService` |

## Testing Strategy

### Unit Tests (Vitest)

| Test Area                              | What to Verify                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `A2uiAdapterService.processSurfaces()` | Correctly extracts operations from various ActivitySnapshot shapes; handles missing/malformed data gracefully |
| `A2uiAdapterService.reset()`           | Calls renderer reset                                                                                          |
| Commerce Catalog                       | Each of the 5 component types resolves to the correct Angular component class                                 |
| Action handler                         | Forwards action payload to `ConversationService.submit()`                                                     |
| `ConversationService` (modified)       | No longer calls `parseSurfaces`; calls adapter instead                                                        |
| Component input adaptation             | Each commerce component receives correct data via individual inputs                                           |

### Property-Based Tests (fast-check)

Property-based testing is applicable here for the adapter logic and action handler — these are pure data transformations where input variation reveals edge cases.

**Configuration:**

- Library: `fast-check`
- Minimum iterations: 100 per property
- Tag format: `Feature: a2ui-standard-renderers, Property {N}: {description}`

| Property                              | Generator Strategy                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Property 1: Operations extraction     | Generate random arrays of objects with varying `operations` arrays (including empty, nested, large) and verify pass-through integrity |
| Property 2: Action handler forwarding | Generate arbitrary non-empty strings and verify exact forwarding                                                                      |
| Property 3: Surface render order      | Generate random-length arrays of surface objects and verify DOM order matches                                                         |

### Integration Tests

| Test                         | Description                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| End-to-end surface rendering | Feed real A2UI operation sequences (from mock responses) through the full pipeline and verify commerce components render correctly |
| Turn lifecycle               | Verify that streaming → complete transition clears loading states                                                                  |
| Replace semantics            | Verify that `replace: true` resets renderer before processing                                                                      |
| NextActionsBar click         | Verify clicking an action button triggers a new turn                                                                               |

### Smoke Tests

| Test                   | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| Build integrity        | `ng build` succeeds with zero errors                                   |
| No circular deps       | Build output contains no circular dependency warnings                  |
| File cleanup           | `a2ui-parser.ts` does not exist; removed types absent from `models.ts` |
| Dependency declaration | `package.json` includes `@a2ui/angular` and `@a2ui/web_core`           |
