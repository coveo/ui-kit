import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from './mount-surface.harness.js';

/**
 * Under the inline-state model each leaf receives its OWN resolved state on `props` (bound from the
 * A2-UI data model), with no identity join. ProductList / ProductSummary are `createReactComponent`
 * implementations; these property tests mount each generated slot end-to-end through the real
 * thermidor catalog (its products/summary written to the data model via a `{path}` binding) and
 * assert the leaf renders exactly its resolved state — empty/loading otherwise.
 *
 * Each generated case is mounted independently (one leaf per surface): a slot's "own resolved
 * props" is precisely what a per-surface data model gives it, and the property being exercised (a
 * leaf renders exactly its resolved state) holds per slot and is asserted per mount.
 */

interface GeneratedProduct {
  permanentid: string;
  ec_name: string;
  additionalFields: Record<string, unknown>;
}

const slotArb = fc.record({
  resolved: fc.boolean(),
  products: fc.uniqueArray(
    fc.string({minLength: 1, maxLength: 8}).map<GeneratedProduct>((name) => ({
      permanentid: `${name}-id`,
      ec_name: name,
      additionalFields: {},
    })),
    {minLength: 0, maxLength: 4, selector: (p) => p.permanentid}
  ),
});

describe('product-list slot renders exactly its resolved props.products (Property 5)', () => {
  // Feature: a2ui-inline-state-data-model, Property 5: For any mounted product-list slot carrying
  // its own resolved product state, the slot renders exactly the products on its resolved props,
  // renders an empty product set (no error) when the list is empty, and renders a loading
  // placeholder when the state is unresolved.
  it('renders each slot from its own resolved props, empty/loading otherwise', async () => {
    await fc.assert(
      fc.asyncProperty(slotArb, async (slot) => {
        const {container} = mountSurface({
          component: {component: 'ProductList', products: {path: '/state/root/products'}},
          // Unresolved → omit the write so the binding resolves undefined (loading).
          dataModel: slot.resolved ? [{path: '/state/root/products', value: slot.products}] : [],
        });

        if (!slot.resolved) {
          await waitFor(() =>
            expect(container.querySelector('[aria-label="Loading product list"]')).not.toBeNull()
          );
          expect(container.querySelectorAll('h3').length).toBe(0);
        } else {
          // Wait until the render settles to its resolved shape.
          await waitFor(() => {
            if (slot.products.length === 0) {
              expect(container.querySelector('[role="list"]')).toBeNull();
            } else {
              expect(container.querySelector('[role="list"]')).not.toBeNull();
            }
          });
          const renderedNames = Array.from(container.querySelectorAll('h3')).map(
            (node) => node.textContent
          );
          expect(renderedNames).toEqual(slot.products.map((product) => product.ec_name));
        }

        cleanup();
      }),
      {numRuns: 40}
    );
  });
});

const summarySlotArb = fc.record({
  resolved: fc.boolean(),
  categoryLabel: fc.string({minLength: 1, maxLength: 12}),
  productName: fc.string({minLength: 1, maxLength: 12}),
});

describe('product-summary slot renders from its own resolved props (Property 5)', () => {
  // Feature: a2ui-inline-state-data-model, Property 5 (product-summary variant): For any mounted
  // product-summary slot, it renders the product name on its resolved props and renders the loading
  // placeholder (no error) when the state is unresolved.
  it('renders each summary from its own resolved props, loading when unresolved', async () => {
    await fc.assert(
      fc.asyncProperty(summarySlotArb, async (slot) => {
        const {container} = mountSurface({
          component: {
            component: 'ProductSummary',
            categoryLabel: {path: '/state/root/categoryLabel'},
            product: {path: '/state/root/product'},
          },
          dataModel: slot.resolved
            ? [
                {path: '/state/root/categoryLabel', value: slot.categoryLabel},
                {
                  path: '/state/root/product',
                  value: {
                    permanentid: `${slot.productName}-id`,
                    ec_name: slot.productName,
                    additionalFields: {},
                  },
                },
              ]
            : [],
        });

        if (slot.resolved) {
          await waitFor(() => expect(container.textContent).toContain(slot.productName));
        } else {
          await waitFor(() =>
            expect(container.querySelector('[aria-label="Loading product summary"]')).not.toBeNull()
          );
        }

        cleanup();
      }),
      {numRuns: 40}
    );
  });
});
