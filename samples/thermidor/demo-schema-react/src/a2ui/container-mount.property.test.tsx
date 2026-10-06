import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from './mount-surface.harness.js';

/**
 * The ordered-list container components (FacetManager, BundleDisplay) are `createReactComponent`
 * implementations driven by the generic binder: they mount their children by id via `buildChild`,
 * reading composition from their resolved props. These property tests drive the whole pipeline
 * through the real thermidor catalog, asserting the observable mounted-child DOM: each present
 * child id mounts exactly once, in declared order, with absent ids skipped and empty/unavailable
 * lists mounting nothing.
 *
 * Children are trivial `QuerySummary` leaf nodes whose query text encodes the child id, so the
 * mounted order is read back directly from the DOM. Ids are constrained to the QuerySummary-safe
 * subset (non-empty, no whitespace collisions) via a `child-<n>` labelling that keeps them unique.
 */

// A distinguishable leaf node: renders its id as query text (inside a <strong>).
function leafNode(id: string): Record<string, unknown> {
  return {id, component: 'QuerySummary', query: id, firstIndex: 1, lastIndex: 12, totalEntries: 1};
}

// Read mounted child ids in DOM order from the query <strong> text nodes.
function mountedChildIds(container: HTMLElement, selector: string): string[] {
  return Array.from(container.querySelectorAll(`${selector} p strong`))
    .map((node) => node.textContent)
    .filter((text): text is string => text !== null && text.startsWith('id-'));
}

// Unique, QuerySummary-safe child ids (no whitespace; stable prefix).
const childIdArb = fc.uniqueArray(
  fc.integer({min: 0, max: 9999}).map((n) => `id-${n}`),
  {minLength: 0, maxLength: 6}
);

describe('FacetManager mounts each present child once, in declared order, tolerating gaps (Property 3)', () => {
  // Feature: a2ui-inline-state-data-model, Property 3: For any ordered list of child ids supplied to
  // an ordered-list container through its resolved `children` prop, the container mounts each id that
  // has a corresponding component exactly once, in the exact declared order, skips any id with no
  // corresponding component while preserving the order of the rest, and mounts nothing when the list
  // is empty or unavailable.
  it('mounts the present-id subsequence in declared order', async () => {
    await fc.assert(
      fc.asyncProperty(
        childIdArb,
        fc.array(fc.boolean(), {minLength: 0, maxLength: 6}),
        fc.boolean(),
        async (declaredIds, presentFlagsRaw, unavailable) => {
          const presentFlags = declaredIds.map((_, i) => presentFlagsRaw[i] ?? true);
          const presentIds = new Set(declaredIds.filter((_, i) => presentFlags[i]));
          const expectedPresentSubsequence = declaredIds.filter((id) => presentIds.has(id));

          const {container} = mountSurface({
            component: unavailable
              ? {component: 'FacetManager'}
              : {component: 'FacetManager', children: [...declaredIds]},
            children: [...presentIds].map((id) => leafNode(id)),
          });

          await waitFor(() =>
            expect(container.querySelector('[data-testid="facet-manager"]')).not.toBeNull()
          );

          const mounted = mountedChildIds(container, '[data-testid="facet-manager"]');
          if (unavailable || declaredIds.length === 0) {
            expect(mounted).toEqual([]);
          } else {
            expect(mounted).toEqual(expectedPresentSubsequence);
          }

          cleanup();
        }
      ),
      {numRuns: 40}
    );
  });
});

describe('BundleDisplay mounts only the active tier slot childIds in order (Property 3)', () => {
  // Feature: a2ui-inline-state-data-model, Property 3 (bundle-display variant): For any tier state
  // resolved on props, the container mounts the Children_Mount_Function exactly once for each slot
  // childId of the ACTIVE (first) tier, in slot-enumeration order, mounts nothing when the active
  // tier has no slots or no tier state exists, and renders without error.
  const tierArb = fc.record({
    label: fc.string({minLength: 1, maxLength: 12}),
    description: fc.string({maxLength: 20}),
    total: fc.float({min: Math.fround(0), max: Math.fround(10000), noNaN: true}),
    slots: fc.uniqueArray(
      fc.integer({min: 0, max: 9999}).map((n) => ({categoryLabel: `cat-${n}`, childId: `id-${n}`})),
      {minLength: 0, maxLength: 5, selector: (slot) => slot.childId}
    ),
  });

  it('mounts the first (active) tier slot childIds in declared order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(tierArb, {minLength: 0, maxLength: 3, selector: (t) => t.label}),
        async (tiers) => {
          const activeTierSlotIds = (tiers[0]?.slots ?? []).map((slot) => slot.childId);

          const {container} = mountSurface({
            component: {component: 'BundleDisplay', tiers},
            children: activeTierSlotIds.map((id) => leafNode(id)),
          });

          // The bundle mounts children into its item list; read them in DOM order.
          await waitFor(() => expect(container.querySelector('section')).not.toBeNull());

          const mounted = Array.from(container.querySelectorAll('p strong'))
            .map((node) => node.textContent)
            .filter((text): text is string => text !== null && text.startsWith('id-'));
          expect(mounted).toEqual(activeTierSlotIds);

          cleanup();
        }
      ),
      {numRuns: 40}
    );
  });
});
