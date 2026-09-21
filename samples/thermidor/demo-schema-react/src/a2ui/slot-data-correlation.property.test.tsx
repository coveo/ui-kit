import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import type {ProductListProps, ProductSummaryProps} from '@coveo/thermidor-schema';
import {TargetingProvider, type TargetingContext} from '../context/targeting.js';
import {ProductListRenderer} from './ProductList/ProductList.js';
import {ProductSummaryRenderer} from './ProductSummary/ProductSummary.js';

// Under the inline-state model each renderer receives its OWN resolved state on `props`
// (bound from the A2-UI data model by the renderer), with no identity join. The property
// below exercises that a dumb renderer renders exactly the data on its resolved props.
const targeting: TargetingContext = {
  isTargeting: false,
  onProductTargeted: () => undefined,
  selectedProductIds: new Set(),
};

interface GeneratedProduct {
  permanentid: string;
  ec_name: string;
  additionalFields: Record<string, unknown>;
}

// Each mounted slot carries its own resolved product list (possibly empty, or unresolved).
const scenarioArb = fc.array(
  fc.record({
    resolved: fc.boolean(),
    products: fc.uniqueArray(
      fc.string({minLength: 1, maxLength: 8}).map<GeneratedProduct>((name) => ({
        permanentid: `${name}-id`,
        ec_name: name,
        additionalFields: {},
      })),
      {minLength: 0, maxLength: 4, selector: (p) => p.permanentid}
    ),
  }),
  {minLength: 1, maxLength: 6}
);

describe('product-list slot renders exactly its resolved props.products (Property 5)', () => {
  // Feature: a2ui-inline-state-data-model, Property 5: For any set of mounted product-list
  // slots each carrying its own resolved product state, each slot renders exactly the
  // products on its resolved props, renders an empty product set (no error) when the list is
  // empty, and renders a loading placeholder when the state is unresolved.
  it('renders each slot from its own resolved props, empty/loading otherwise', () => {
    fc.assert(
      fc.property(scenarioArb, (slots) => {
        expect(() =>
          render(
            <TargetingProvider value={targeting}>
              {slots.map((slot, index) => (
                <div key={index} data-testid={`slot-${index}`}>
                  <ProductListRenderer
                    props={(slot.resolved ? {products: slot.products} : {}) as ProductListProps}
                  />
                </div>
              ))}
            </TargetingProvider>
          )
        ).not.toThrow();

        slots.forEach((slot, index) => {
          const container = screen.getByTestId(`slot-${index}`);
          const renderedNames = Array.from(container.querySelectorAll('h3')).map(
            (node) => node.textContent
          );

          if (!slot.resolved) {
            // Unresolved → loading placeholder, no product headings.
            expect(container.querySelector('[aria-label="Loading product list"]')).not.toBeNull();
            expect(renderedNames).toEqual([]);
          } else {
            expect(renderedNames).toEqual(slot.products.map((product) => product.ec_name));
          }
        });

        cleanup();
      }),
      {numRuns: 150}
    );
  });
});

// A generated resolved product-summary state per mounted slot.
const summaryScenarioArb = fc.array(
  fc.record({
    resolved: fc.boolean(),
    categoryLabel: fc.string({minLength: 1, maxLength: 12}),
    productName: fc.string({minLength: 1, maxLength: 12}),
  }),
  {minLength: 1, maxLength: 6}
);

describe('product-summary slot renders from its own resolved props (Property 5)', () => {
  // Feature: a2ui-inline-state-data-model, Property 5 (product-summary variant): For any set
  // of mounted product-summary slots, each renders the product name on its resolved props and
  // renders the loading placeholder (no error) when the state is unresolved.
  it('renders each summary from its own resolved props, loading when unresolved', () => {
    fc.assert(
      fc.property(summaryScenarioArb, (slots) => {
        expect(() =>
          render(
            <TargetingProvider value={targeting}>
              {slots.map((slot, index) => (
                <div key={index} data-testid={`summary-slot-${index}`}>
                  <ProductSummaryRenderer
                    props={
                      (slot.resolved
                        ? {
                            categoryLabel: slot.categoryLabel,
                            product: {
                              permanentid: `${slot.productName}-id`,
                              ec_name: slot.productName,
                              additionalFields: {},
                            },
                          }
                        : {}) as ProductSummaryProps
                    }
                  />
                </div>
              ))}
            </TargetingProvider>
          )
        ).not.toThrow();

        slots.forEach((slot, index) => {
          const container = screen.getByTestId(`summary-slot-${index}`);

          if (slot.resolved) {
            expect(container.textContent).toContain(slot.productName);
          } else {
            expect(
              container.querySelector('[aria-label="Loading product summary"]')
            ).not.toBeNull();
          }
        });

        cleanup();
      }),
      {numRuns: 150}
    );
  });
});
