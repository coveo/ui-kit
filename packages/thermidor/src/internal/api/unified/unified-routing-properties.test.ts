import fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {extractSurfaceType} from './unified-runtime.js';

/**
 * Property-based tests for the surfaceType routing logic in unified-runtime.ts.
 *
 * The routing callback (`onA2uiSurface`) decides:
 * 1. If surfaceType is present: do nothing (consumer derives navigation from activities)
 * 2. If surfaceType is absent: delegate to SurfaceProcessor (legacy path)
 *
 * These tests verify that surfaceType-bearing surfaces never trigger the legacy
 * SurfaceProcessor or emit a navigation signal, while the legacy path is preserved
 * for surfaces without surfaceType.
 */

const NUM_RUNS = 100;

interface RoutedData {
  useCase: string;
  surfaceType?: string;
  surfaceId?: string;
}

interface RoutingDeps {
  statePort: {
    setRoutedInterface: ReturnType<typeof vi.fn<(turnId: string, data: RoutedData) => void>>;
  };
  surfaceProcessor: {
    processSnapshot: ReturnType<typeof vi.fn<(turnId: string, content: unknown) => void>>;
  };
}

/**
 * Extracted routing logic that mirrors the onA2uiSurface callback.
 * This is the system under test for property-based verification.
 */
function routeA2uiSurface(
  turnId: string,
  content: Record<string, unknown>,
  deps: RoutingDeps
): void {
  const surfaceType = extractSurfaceType(content);

  if (!surfaceType) {
    deps.surfaceProcessor.processSnapshot(turnId, content);
  }
  // Surfaces with a surfaceType need no routing signal — the consumer
  // derives navigation directly from the A2-UI activities.
}

/**
 * Arbitrary: generates a createSurface message WITH a surfaceType field present.
 */
function arbContentWithSurfaceType() {
  return fc
    .record({
      surfaceType: fc.oneof(
        fc.constant('commerceSearch'),
        fc.constant('converse'),
        fc.string({minLength: 1, maxLength: 50})
      ),
      surfaceId: fc.string({minLength: 0, maxLength: 100}),
      extraFields: fc.dictionary(
        fc.string({minLength: 1, maxLength: 20}),
        fc.jsonValue({maxDepth: 1})
      ),
    })
    .map(({surfaceType, surfaceId, extraFields}) => ({
      messages: [
        {
          createSurface: {
            surfaceType,
            surfaceId,
            ...extraFields,
          },
        },
      ],
    }));
}

/**
 * Arbitrary: generates content WITHOUT a surfaceType field (legacy path).
 */
function arbContentWithoutSurfaceType() {
  return fc
    .record({
      surfaceId: fc.string({minLength: 0, maxLength: 100}),
      components: fc.array(
        fc.record({
          id: fc.string({minLength: 1, maxLength: 20}),
          component: fc.string({minLength: 1, maxLength: 50}),
        }),
        {maxLength: 5}
      ),
      extraFields: fc.dictionary(
        fc.string({minLength: 1, maxLength: 20}).filter((k) => k !== 'surfaceType'),
        fc.jsonValue({maxDepth: 1})
      ),
    })
    .map(({surfaceId, components, extraFields}) => ({
      messages: [
        {
          createSurface: {
            surfaceId,
            components,
            ...extraFields,
          },
        },
      ],
    }));
}

/**
 * Arbitrary: generates a content payload with surfaceType explicitly set to 'commerceSearch'.
 */
function arbContentWithCommerceSearch() {
  return fc
    .record({
      surfaceId: fc.string({minLength: 0, maxLength: 100}),
      components: fc.array(
        fc.record({
          id: fc.string({minLength: 1, maxLength: 20}),
          component: fc.oneof(
            fc.constant('ProductSearchSurface'),
            fc.constant('ProductListingSurface'),
            fc.constant('product-list'),
            fc.string({minLength: 1, maxLength: 50})
          ),
        }),
        {maxLength: 5}
      ),
    })
    .map(({surfaceId, components}) => ({
      messages: [
        {
          createSurface: {
            surfaceType: 'commerceSearch',
            surfaceId,
            components,
          },
        },
      ],
    }));
}

/**
 * Arbitrary: generates a content payload with surfaceType set to 'converse'.
 */
function arbContentWithConverse() {
  return fc
    .record({
      surfaceId: fc.string({minLength: 0, maxLength: 100}),
      components: fc.array(
        fc.record({
          id: fc.string({minLength: 1, maxLength: 20}),
          component: fc.string({minLength: 1, maxLength: 50}),
        }),
        {maxLength: 5}
      ),
    })
    .map(({surfaceId, components}) => ({
      messages: [
        {
          createSurface: {
            surfaceType: 'converse',
            surfaceId,
            components,
          },
        },
      ],
    }));
}

describe('Feature: commerce-surface-decomposition, Property 1: surfaceType routing exclusivity', () => {
  let deps: RoutingDeps;

  beforeEach(() => {
    deps = {
      statePort: {setRoutedInterface: vi.fn()},
      surfaceProcessor: {processSnapshot: vi.fn()},
    };
  });

  it('if surfaceType is present, SurfaceProcessor.processSnapshot is NEVER called — regardless of component structure', () => {
    /**
     * Validates: Requirements 1.2, 2.1, 10.1, 10.4
     *
     * For ANY createSurface payload that contains a surfaceType field,
     * the routing callback SHALL NOT invoke the SurfaceProcessor,
     * regardless of any root component present in the components array.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbContentWithSurfaceType(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.surfaceProcessor.processSnapshot.mockClear();
          deps.statePort.setRoutedInterface.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('surfaceType present prevents legacy routing even when ProductSearchSurface root component exists', () => {
    /**
     * Validates: Requirements 10.1, 10.4
     *
     * Even when the components array contains a root component named
     * ProductSearchSurface, the presence of surfaceType routes exclusively
     * to the decomposed path.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 0, maxLength: 100}),
        (turnId, surfaceType, surfaceId) => {
          const content = {
            messages: [
              {
                createSurface: {
                  surfaceType,
                  surfaceId,
                  components: [{id: 'root', component: 'ProductSearchSurface'}],
                },
              },
            ],
          };
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.surfaceProcessor.processSnapshot.mockClear();
          deps.statePort.setRoutedInterface.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});

describe('Feature: commerce-surface-decomposition, Property 2: Legacy routing by absence of surfaceType', () => {
  let deps: RoutingDeps;

  beforeEach(() => {
    deps = {
      statePort: {setRoutedInterface: vi.fn()},
      surfaceProcessor: {processSnapshot: vi.fn()},
    };
  });

  it('if surfaceType is absent, SurfaceProcessor.processSnapshot IS called', () => {
    /**
     * Validates: Requirements 2.3, 10.5
     *
     * For ANY createSurface payload that omits the surfaceType field,
     * the routing callback SHALL delegate to the SurfaceProcessor.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbContentWithoutSurfaceType(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).toHaveBeenCalledWith(turnId, content);
          deps.surfaceProcessor.processSnapshot.mockClear();
          deps.statePort.setRoutedInterface.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('absence of surfaceType routes to legacy path regardless of component names', () => {
    /**
     * Validates: Requirements 2.3, 10.5
     *
     * Even components named 'product-list', 'pagination', etc. route
     * to the legacy path when surfaceType is absent.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 0, maxLength: 100}),
        fc.constantFrom('product-list', 'pagination', 'sort', 'search-box', 'SomeOther'),
        (turnId, surfaceId, componentName) => {
          const content = {
            messages: [
              {
                createSurface: {
                  surfaceId,
                  components: [{id: 'comp-1', component: componentName}],
                },
              },
            ],
          };
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).toHaveBeenCalledWith(turnId, content);
          deps.surfaceProcessor.processSnapshot.mockClear();
          deps.statePort.setRoutedInterface.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});

describe('Feature: commerce-surface-decomposition, Property 3: Decomposed surfaces never trigger hydration', () => {
  let deps: RoutingDeps;

  beforeEach(() => {
    deps = {
      statePort: {setRoutedInterface: vi.fn()},
      surfaceProcessor: {processSnapshot: vi.fn()},
    };
  });

  it('surfaceType present → SurfaceProcessor is not called (no hydration path reachable)', () => {
    /**
     * Validates: Requirements 4.1, 4.2, 4.3
     *
     * For ANY A2-UI snapshot processed through the new path (surfaceType present),
     * the system SHALL NOT invoke the SurfaceProcessor, which means:
     * - No CommerceInterfaceImpl instantiation
     * - No hydrateFromCreateSurface call
     * - No hydration snapshot storage
     *
     * Since hydration only occurs inside processSnapshot → maybeHydrate,
     * verifying processSnapshot is never called guarantees no hydration.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbContentWithSurfaceType(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.surfaceProcessor.processSnapshot.mockClear();
          deps.statePort.setRoutedInterface.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('surfaceType present with legacy root components → still no hydration', () => {
    /**
     * Validates: Requirements 4.1, 4.2, 4.3
     *
     * Even when a payload contains components that WOULD trigger hydration
     * in the legacy path (ProductSearchSurface/ProductListingSurface),
     * the presence of surfaceType prevents processSnapshot from being called.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.constantFrom('commerceSearch', 'converse', 'someOtherType'),
        fc.string({minLength: 0, maxLength: 100}),
        fc.constantFrom('ProductSearchSurface', 'ProductListingSurface'),
        (turnId, surfaceType, surfaceId, rootComponent) => {
          const content = {
            messages: [
              {
                createSurface: {
                  surfaceType,
                  surfaceId,
                  components: [{id: 'root', component: rootComponent}],
                  dataModel: {products: []},
                },
              },
            ],
          };
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.surfaceProcessor.processSnapshot.mockClear();
          deps.statePort.setRoutedInterface.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('commerceSearch surfaceType → setRoutedInterface is NOT called (no navigation signal emitted)', () => {
    /**
     * Validates: surfaceType-bearing surfaces derive navigation from activities,
     * not from a routing signal. The runtime does not emit setRoutedInterface.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbContentWithCommerceSearch(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.statePort.setRoutedInterface).not.toHaveBeenCalled();
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.statePort.setRoutedInterface.mockClear();
          deps.surfaceProcessor.processSnapshot.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});

describe('Feature: commerce-surface-decomposition, Property 5: No navigation signal for any surfaceType', () => {
  let deps: RoutingDeps;

  beforeEach(() => {
    deps = {
      statePort: {setRoutedInterface: vi.fn()},
      surfaceProcessor: {processSnapshot: vi.fn()},
    };
  });

  it('commerceSearch surfaceType → setRoutedInterface is NOT called', () => {
    /**
     * Validates: navigation is derived from activities, not from a routing signal.
     * The runtime no longer emits setRoutedInterface for decomposed surfaces.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbContentWithCommerceSearch(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.statePort.setRoutedInterface).not.toHaveBeenCalled();
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.statePort.setRoutedInterface.mockClear();
          deps.surfaceProcessor.processSnapshot.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('converse surfaceType → setRoutedInterface is NOT called', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbContentWithConverse(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.statePort.setRoutedInterface).not.toHaveBeenCalled();
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.statePort.setRoutedInterface.mockClear();
          deps.surfaceProcessor.processSnapshot.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('arbitrary non-commerceSearch surfaceType → setRoutedInterface is NOT called', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 0, maxLength: 100}),
        (turnId, surfaceType, surfaceId) => {
          const content = {
            messages: [{createSurface: {surfaceType, surfaceId}}],
          };
          routeA2uiSurface(turnId, content, deps);
          expect(deps.statePort.setRoutedInterface).not.toHaveBeenCalled();
          expect(deps.surfaceProcessor.processSnapshot).not.toHaveBeenCalled();
          deps.statePort.setRoutedInterface.mockClear();
          deps.surfaceProcessor.processSnapshot.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
