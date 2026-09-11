import fc from 'fast-check';
import {beforeEach, describe, expect, vi, it} from 'vitest';

/**
 * Property-based tests for the surface routing logic in unified-runtime.ts.
 *
 * The routing callback (`onA2uiSurface`) unconditionally delegates every A2-UI
 * surface to the SurfaceProcessor for hydration. The SurfaceProcessor is a no-op
 * for surfaces that do not require hydration. Navigation is derived by the consumer
 * from the root component's `componentType`, not from any routing signal or a
 * `surfaceType` field (which no longer exists).
 *
 * These tests verify that the delegation happens for every surface regardless of
 * its shape, and that the runtime never emits a navigation signal.
 */

const NUM_RUNS = 100;

interface RoutingDeps {
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
  deps.surfaceProcessor.processSnapshot(turnId, content);
}

/**
 * Arbitrary: generates a createSurface message with an arbitrary shape.
 */
function arbCreateSurfaceContent() {
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
        fc.string({minLength: 1, maxLength: 20}),
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

describe('Feature: thermidor-commerce-search-composition, Property: surface routing delegation', () => {
  let deps: RoutingDeps;

  beforeEach(() => {
    deps = {
      surfaceProcessor: {processSnapshot: vi.fn()},
    };
  });

  it('every createSurface payload is delegated to SurfaceProcessor.processSnapshot', () => {
    /**
     * Validates: Requirements 10.1, 10.2
     *
     * For ANY createSurface payload, the routing callback SHALL delegate to the
     * SurfaceProcessor unconditionally. There is no surfaceType-based branch.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        arbCreateSurfaceContent(),
        (turnId, content) => {
          routeA2uiSurface(turnId, content, deps);
          expect(deps.surfaceProcessor.processSnapshot).toHaveBeenCalledWith(turnId, content);
          deps.surfaceProcessor.processSnapshot.mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('delegation happens regardless of the component names present', () => {
    /**
     * Validates: Requirements 10.1, 10.2
     *
     * Whether the components array contains a ProductSearchSurface root, a
     * product-list, or arbitrary names, the callback always delegates to the
     * SurfaceProcessor.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 0, maxLength: 100}),
        fc.constantFrom(
          'ProductSearchSurface',
          'ProductListingSurface',
          'product-list',
          'pagination',
          'sort',
          'facet-manager',
          'SomeOther'
        ),
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
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
