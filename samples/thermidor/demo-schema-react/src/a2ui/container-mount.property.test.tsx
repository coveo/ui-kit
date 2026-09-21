import {createElement, type FC, type ReactNode} from 'react';
import fc from 'fast-check';
import {describe, expect, it, vi} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import {FacetManagerRenderer} from './FacetManager/FacetManager.js';
import {BundleDisplayRenderer} from './BundleDisplay/BundleDisplay.js';

/**
 * The ordered-list container renderers are now DUMB: they read their composition directly
 * from the resolved props (`children` `child-ref[]`), with no controller hydration. The
 * mount-order property exercises that a container invokes the Children_Mount_Function once
 * per declared id, in order, tolerating declared-but-absent ids and empty/unavailable lists.
 */
type OrderedContainerRenderer = FC<{
  props: {children?: string[]};
  children: (id: string) => ReactNode;
}>;

const orderedContainers: Array<{name: string; render: OrderedContainerRenderer}> = [
  {
    name: 'FacetManagerRenderer',
    render: FacetManagerRenderer as unknown as OrderedContainerRenderer,
  },
];

const compositionArb = fc
  .uniqueArray(fc.string({minLength: 1, maxLength: 8}), {minLength: 0, maxLength: 8})
  .chain((declaredIds) =>
    fc.record({
      declaredIds: fc.constant(declaredIds),
      presentFlags: fc.array(fc.boolean(), {
        minLength: declaredIds.length,
        maxLength: declaredIds.length,
      }),
      // When true the composition is unavailable: no `children` field is provided at all.
      unavailable: fc.boolean(),
    })
  );

describe.each(orderedContainers)(
  '$name mounts each present child once, in declared order, tolerating gaps (Property 3)',
  ({render: renderContainer}) => {
    // Feature: a2ui-inline-state-data-model, Property 3: For any ordered list of child ids
    // supplied to an ordered-list container renderer through its resolved `children` prop,
    // the renderer invokes the Children_Mount_Function exactly once for each id that has a
    // corresponding component, in the exact order the ids appear, skips any id with no
    // corresponding component while preserving the order of the remaining ids, makes zero
    // calls when the list is empty or unavailable, and renders without error in every case.
    it('invokes children(id) as the present-id subsequence in declared order', () => {
      fc.assert(
        fc.property(compositionArb, ({declaredIds, presentFlags, unavailable}) => {
          const presentIds = new Set(declaredIds.filter((_, index) => presentFlags[index]));
          const expectedPresentSubsequence = declaredIds.filter((id) => presentIds.has(id));

          const mountedInOrder: string[] = [];
          const children = vi.fn((id: string): ReactNode => {
            if (presentIds.has(id)) {
              mountedInOrder.push(id);
              return <span data-mounted-id={id} key={id} />;
            }
            return null;
          });

          const childrenProp = unavailable ? undefined : [...declaredIds];

          expect(() =>
            render(
              createElement(renderContainer, {
                props: {children: childrenProp},
                children,
              })
            )
          ).not.toThrow();

          if (unavailable || declaredIds.length === 0) {
            expect(children).not.toHaveBeenCalled();
            expect(mountedInOrder).toEqual([]);
          } else {
            const calledIds = children.mock.calls.map(([id]) => id);
            expect(calledIds).toEqual(declaredIds);
            expect(mountedInOrder).toEqual(expectedPresentSubsequence);
          }

          cleanup();
        }),
        {numRuns: 150}
      );
    });
  }
);

// BundleDisplay composes from its own resolved `tiers` state: for the ACTIVE tier only it
// mounts that tier's slot `childId` values in slot-enumeration order via the mount function.
describe('BundleDisplayRenderer mounts only the active tier slot childIds in order (Property 3)', () => {
  // Feature: a2ui-inline-state-data-model, Property 3 (bundle-display variant): For any tier
  // state resolved on props, the renderer invokes the Children_Mount_Function exactly once
  // for each slot childId of the active tier, in slot-enumeration order, mounts nothing when
  // the active tier has no slots or no tier state exists, and renders without error.
  const tierArb = fc.record({
    label: fc.string({minLength: 1, maxLength: 12}),
    description: fc.string({maxLength: 20}),
    slots: fc.uniqueArray(
      fc.record({
        categoryLabel: fc.string({minLength: 1, maxLength: 12}),
        childId: fc.string({minLength: 1, maxLength: 10}),
      }),
      {minLength: 0, maxLength: 6, selector: (slot) => slot.childId}
    ),
  });

  it('mounts the first (active) tier slot childIds in declared order', () => {
    fc.assert(
      fc.property(fc.array(tierArb, {minLength: 0, maxLength: 4}), (tiers) => {
        const mountedInOrder: string[] = [];
        const children = vi.fn((id: string): ReactNode => {
          mountedInOrder.push(id);
          return <span data-mounted-id={id} key={id} />;
        });

        expect(() =>
          render(
            createElement(
              BundleDisplayRenderer as unknown as FC<{
                props: {tiers: unknown[]};
                children: (id: string) => ReactNode;
              }>,
              {
                props: {tiers},
                children,
              }
            )
          )
        ).not.toThrow();

        const activeTierSlotIds = (tiers[0]?.slots ?? []).map((slot) => slot.childId);
        expect(mountedInOrder).toEqual(activeTierSlotIds);

        cleanup();
      }),
      {numRuns: 150}
    );
  });
});
