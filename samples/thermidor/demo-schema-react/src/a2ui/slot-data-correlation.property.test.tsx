import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import type {RemoteControllerSource} from '@coveo/thermidor';
import {StateSourceProvider} from './state-source-context.js';
import {TargetingProvider, type TargetingContext} from '../context/targeting.js';
import {ProductListRenderer} from './ProductList/ProductList.js';
import {ProductSummaryRenderer} from './ProductSummary/ProductSummary.js';

const targeting: TargetingContext = {
  isTargeting: false,
  onProductTargeted: () => undefined,
  selectedProductIds: new Set(),
};

/**
 * Builds a RemoteControllerSource whose active turn carries the given per-componentId
 * state map. This is the real AG-UI correlation path: `useRemoteController` resolves a
 * component's state from `components[componentId]` and nothing else.
 */
function buildStateSource(components: Record<string, unknown>): RemoteControllerSource {
  return {
    state: {activeTurn: {agentResponse: {state: {components}}}},
    subscribe: () => () => undefined,
    dispatchAction: () => undefined,
  } as unknown as RemoteControllerSource;
}

interface GeneratedProduct {
  permanentid: string;
  ec_name: string;
  additionalFields: Record<string, unknown>;
}

// A generated AG-UI state: a map of componentId → product data, plus an ordered set of
// mounted slot child ids. The mounted ids may or may not have a matching state entry,
// exercising both the correlated and the missing-entry cases.
const scenarioArb = fc
  .uniqueArray(
    fc.string({minLength: 1, maxLength: 8}).filter((s) => !s.startsWith('absent-')),
    {minLength: 0, maxLength: 6}
  )
  .chain((stateIds) =>
    fc.record({
      // Products keyed by componentId.
      productsById: fc.constant<Record<string, GeneratedProduct[]>>(
        Object.fromEntries(
          stateIds.map((id, index) => [
            id,
            [
              {permanentid: `${id}-p0`, ec_name: `${id} product ${index}`, additionalFields: {}},
              {
                permanentid: `${id}-p1`,
                ec_name: `${id} product ${index} b`,
                additionalFields: {},
              },
            ],
          ])
        )
      ),
      stateIds: fc.constant(stateIds),
      // Mounted slot child ids: a mix of ids that exist in state and ids that do not.
      mountedIds: fc.uniqueArray(
        fc.oneof(
          stateIds.length > 0 ? fc.constantFrom(...stateIds) : fc.constant('missing-only'),
          fc.string({minLength: 1, maxLength: 8}).map((s) => `absent-${s}`)
        ),
        {minLength: 1, maxLength: 6}
      ),
    })
  );

describe('slot product data correlates to AG-UI state solely by componentId (Property 5)', () => {
  // Feature: thermidor-commerce-search-composition, Property 5: For any mapping of
  // componentId to product data and any set of mounted slot product-list child ids, each
  // mounted child renders exactly the product data found at the AG-UI state entry whose key
  // equals that child's componentId, and renders an empty product set (without error) when
  // no such entry exists.
  it('renders each mounted slot from the state keyed by its componentId, empty when absent', () => {
    fc.assert(
      fc.property(scenarioArb, ({productsById, mountedIds}) => {
        const components: Record<string, unknown> = {};
        for (const [id, products] of Object.entries(productsById)) {
          components[id] = {products};
        }
        const stateSource = buildStateSource(components);

        expect(() =>
          render(
            <StateSourceProvider stateSource={stateSource}>
              <TargetingProvider value={targeting}>
                {mountedIds.map((id, index) => (
                  <div key={id} data-testid={`slot-${index}`}>
                    <ProductListRenderer props={{componentId: id, componentType: 'product-list'}} />
                  </div>
                ))}
              </TargetingProvider>
            </StateSourceProvider>
          )
        ).not.toThrow();

        mountedIds.forEach((id, index) => {
          const expectedProducts = productsById[id];
          const slot = screen.getByTestId(`slot-${index}`);
          const renderedNames = Array.from(slot.querySelectorAll('h3')).map(
            (node) => node.textContent
          );

          if (expectedProducts && expectedProducts.length > 0) {
            // Correlated: renders exactly the products at components[componentId].
            expect(renderedNames).toEqual(expectedProducts.map((product) => product.ec_name));
          } else {
            // No matching AG-UI state entry → empty product set, no error.
            expect(renderedNames).toEqual([]);
          }
        });

        cleanup();
      }),
      {numRuns: 150}
    );
  });
});

// A generated AG-UI state for product-summary bundle slots: a map of componentId →
// {categoryLabel, product}, plus an ordered set of mounted slot child ids. Mounted ids may or
// may not have a matching state entry, exercising both the correlated and missing-entry cases.
const summaryScenarioArb = fc
  .uniqueArray(
    fc.string({minLength: 1, maxLength: 8}).filter((s) => !s.startsWith('absent-')),
    {minLength: 0, maxLength: 6}
  )
  .chain((stateIds) =>
    fc.record({
      // A summary entry per componentId, each with a single product carrying a unique name.
      summariesById: fc.constant<
        Record<
          string,
          {
            categoryLabel: string;
            product: {
              permanentid: string;
              ec_name: string;
              additionalFields: Record<string, unknown>;
            };
          }
        >
      >(
        Object.fromEntries(
          stateIds.map((id, index) => [
            id,
            {
              categoryLabel: `Category ${index}`,
              product: {
                permanentid: `${id}-p0`,
                ec_name: `${id} summary ${index}`,
                additionalFields: {},
              },
            },
          ])
        )
      ),
      stateIds: fc.constant(stateIds),
      mountedIds: fc.uniqueArray(
        fc.oneof(
          stateIds.length > 0 ? fc.constantFrom(...stateIds) : fc.constant('missing-only'),
          fc.string({minLength: 1, maxLength: 8}).map((s) => `absent-${s}`)
        ),
        {minLength: 1, maxLength: 6}
      ),
    })
  );

describe('summary slot data correlates to AG-UI state solely by componentId (Property 5)', () => {
  // Feature: thermidor-commerce-search-composition, Property 5 (product-summary variant): For any
  // mapping of componentId to product-summary state ({categoryLabel, product}) and any set of
  // mounted slot product-summary child ids, each mounted child renders exactly the product name
  // found at the AG-UI state entry whose key equals that child's componentId, and renders the
  // categoryLabel fallback (without error) when no such entry exists.
  it('renders each mounted summary from the state keyed by its componentId, fallback when absent', () => {
    fc.assert(
      fc.property(summaryScenarioArb, ({summariesById, mountedIds}) => {
        const components: Record<string, unknown> = {};
        for (const [id, summary] of Object.entries(summariesById)) {
          components[id] = summary;
        }
        const stateSource = buildStateSource(components);

        expect(() =>
          render(
            <StateSourceProvider stateSource={stateSource}>
              <TargetingProvider value={targeting}>
                {mountedIds.map((id, index) => (
                  <div key={id} data-testid={`summary-slot-${index}`}>
                    <ProductSummaryRenderer
                      props={{componentId: id, componentType: 'product-summary'}}
                    />
                  </div>
                ))}
              </TargetingProvider>
            </StateSourceProvider>
          )
        ).not.toThrow();

        mountedIds.forEach((id, index) => {
          const expected = summariesById[id];
          const slot = screen.getByTestId(`summary-slot-${index}`);

          if (expected) {
            // Correlated: renders exactly the product name at components[componentId].
            expect(slot.textContent).toContain(expected.product.ec_name);
          } else {
            // No matching AG-UI state entry → loading placeholder, no error, no product name.
            expect(slot.querySelector('[aria-label="Loading product summary"]')).not.toBeNull();
          }
        });

        cleanup();
      }),
      {numRuns: 150}
    );
  });
});
