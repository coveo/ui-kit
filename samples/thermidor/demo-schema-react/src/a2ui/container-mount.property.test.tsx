import {createElement, type FC, type ReactNode} from 'react';
import fc from 'fast-check';
import {describe, expect, it, vi} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import {CommerceSearchRenderer} from './CommerceSearch/CommerceSearch.js';
import {FacetManagerRenderer} from './FacetManager/FacetManager.js';
import {BundleDisplayRenderer} from './BundleDisplay/BundleDisplay.js';

// The container renderers read their per-component AG-UI state through these hooks.
// The mount-order property is about composition only, so the AG-UI plane is stubbed to a
// state that lets each container render its children region without real controller wiring.
// CommerceSearch/FacetManager mount the flattened A2-UI `children` list directly, while
// BundleDisplay mounts the active tier's slot `childId` values read from its own AG-UI
// state; the stub returns that tier state (settable per test) for the BundleDisplay block.
let mockControllerState: unknown = {tiers: []};

vi.mock('./controllers.js', () => ({
  useRemoteController: () => ({
    state: mockControllerState,
    dispatch: vi.fn().mockResolvedValue(undefined),
    subscribe: () => () => undefined,
  }),
}));

vi.mock('./state-source-context.js', () => ({
  useStateSource: () => ({state: {activeTurn: {agentResponse: {state: {components: {}}}}}}),
}));

/**
 * A container renderer conforming to the A2UI_Renderer custom-renderer contract:
 * it receives its resolved `props` (with the composition `children` list flattened on)
 * and the Children_Mount_Function.
 */
type ContainerRenderer = FC<{
  props: {componentId: string; componentType: string; children?: unknown};
  children: (id: string) => ReactNode;
}>;

interface HarnessCase {
  name: string;
  render: ContainerRenderer;
  props: {componentId: string; componentType: string; children?: unknown};
}

// Each container is exercised through the identical harness. `props.componentType` is set
// to the literal each renderer expects; only the composition (`children`) varies per run.
const containers: HarnessCase[] = [
  {
    name: 'CommerceSearchRenderer',
    render: CommerceSearchRenderer as unknown as ContainerRenderer,
    props: {componentId: 'commerce-search-1', componentType: 'commerce-search'},
  },
  {
    name: 'FacetManagerRenderer',
    render: FacetManagerRenderer as unknown as ContainerRenderer,
    props: {componentId: 'facet-manager-1', componentType: 'facet-manager'},
  },
];

// A generated composition: an ordered list of declared child ids plus the set of ids that
// actually resolve to a component. Covers empty lists, lists with absent ids (declared but
// not present), and the "unavailable composition" case (children omitted entirely).
const compositionArb = fc
  .uniqueArray(fc.string({minLength: 1, maxLength: 8}), {minLength: 0, maxLength: 8})
  .chain((declaredIds) =>
    fc.record({
      declaredIds: fc.constant(declaredIds),
      // Which of the declared ids have a corresponding component in the composition.
      presentFlags: fc.array(fc.boolean(), {
        minLength: declaredIds.length,
        maxLength: declaredIds.length,
      }),
      // When true the composition is unavailable: no `children` field is provided at all.
      unavailable: fc.boolean(),
    })
  );

describe.each(containers)(
  '$name mounts each present child once, in declared order, tolerating gaps (Property 3)',
  ({render: renderContainer, props}) => {
    // Feature: thermidor-commerce-search-composition, Property 3: For any ordered list of
    // child ids supplied to a container renderer (CommerceSearch or FacetManager) through
    // its A2-UI renderer inputs, the renderer invokes the
    // Children_Mount_Function exactly once for each id that has a corresponding component,
    // in the exact order the ids appear, skips any id with no corresponding component while
    // preserving the order of the remaining ids, makes zero calls when the list is empty or
    // unavailable, and renders without raising an error in every case.
    it('invokes children(id) as the present-id subsequence in declared order', () => {
      fc.assert(
        fc.property(compositionArb, ({declaredIds, presentFlags, unavailable}) => {
          const presentIds = new Set(declaredIds.filter((_, index) => presentFlags[index]));
          const expectedPresentSubsequence = declaredIds.filter((id) => presentIds.has(id));

          // The mocked Children_Mount_Function mimics the renderer's mount behavior:
          // present ids yield a renderable node, absent ids yield nothing renderable.
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
                props: {...props, children: childrenProp},
                children,
              })
            )
          ).not.toThrow();

          if (unavailable || declaredIds.length === 0) {
            // Empty or unavailable composition → zero mount calls.
            expect(children).not.toHaveBeenCalled();
            expect(mountedInOrder).toEqual([]);
          } else {
            // Every declared id is offered to the mount function exactly once, in order.
            const calledIds = children.mock.calls.map(([id]) => id);
            expect(calledIds).toEqual(declaredIds);
            // The mounted (present) ids form the present-id subsequence in declared order.
            expect(mountedInOrder).toEqual(expectedPresentSubsequence);
          }

          cleanup();
        }),
        {numRuns: 150}
      );
    });
  }
);

// BundleDisplay composes differently from the other containers: it does not mount the
// flattened A2-UI `children` list. It reads its tier state (owned on the AG-UI plane) and,
// for the ACTIVE tier only, mounts that tier's slot `childId` values in slot-enumeration
// order via the Children_Mount_Function. The bundle-root's `children` list still carries
// every tier's slot id for composition closure, but only the active tier's subset mounts.
describe('BundleDisplayRenderer mounts only the active tier slot childIds in order (Property 3)', () => {
  // Feature: thermidor-commerce-search-composition, Property 3 (bundle-display variant):
  // For any tier state, the renderer invokes the Children_Mount_Function exactly once for
  // each slot childId of the active tier, in slot-enumeration order, mounts nothing when
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
        mockControllerState = {tiers};

        const mountedInOrder: string[] = [];
        const children = vi.fn((id: string): ReactNode => {
          mountedInOrder.push(id);
          return <span data-mounted-id={id} key={id} />;
        });

        // bundle-root composition still declares every tier's slot id (closure), but the
        // renderer decides which subset to mount based on the active tier.
        const allSlotIds = tiers.flatMap((tier) => tier.slots.map((slot) => slot.childId));

        expect(() =>
          render(
            createElement(BundleDisplayRenderer as unknown as ContainerRenderer, {
              props: {
                componentId: 'bundle-root',
                componentType: 'bundle-display',
                children: allSlotIds,
              },
              children,
            })
          )
        ).not.toThrow();

        const activeTierSlotIds = (tiers[0]?.slots ?? []).map((slot) => slot.childId);
        expect(mountedInOrder).toEqual(activeTierSlotIds);

        mockControllerState = {tiers: []};
        cleanup();
      }),
      {numRuns: 150}
    );
  });
});
