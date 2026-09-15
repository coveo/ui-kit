import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {Activity, Turn} from '@coveo/thermidor';
import {deriveTransitionAction} from './use-navigation.js';

const COMMERCE_SEARCH_ROOT_TYPE = 'commerce-search';

/**
 * Builds an `a2ui-surface` activity carrying a v1.0 createSurface whose declared
 * root component advertises the given componentType. This mirrors the raw payload
 * the mock templates emit (rootId + components[], componentType on the root's props),
 * which navigation reads before the Surface_Bridge id-rewrite.
 */
function makeSurfaceActivity(rootComponentType: string, surfaceId: string): Activity {
  const rootId = `${surfaceId}-root`;
  return {
    id: `activity-${surfaceId}`,
    kind: 'a2ui-surface',
    replace: true,
    payload: {
      messages: [
        {
          createSurface: {
            surfaceId,
            rootId,
            components: [
              {
                id: rootId,
                component: 'SomeComponent',
                props: {componentId: rootId, componentType: rootComponentType},
                children: [],
              },
            ],
          },
        },
      ],
    },
  };
}

function makeTurn(activities: Activity[] | undefined, hasAgentResponse: boolean): Turn {
  return {
    id: 'turn-1',
    prompt: 'a prompt',
    status: 'complete',
    ...(hasAgentResponse
      ? {
          agentResponse: {
            state: {},
            messages: [],
            surfaces: [],
            activities: activities ?? [],
            reasoningSteps: [],
          },
        }
      : {}),
  } as Turn;
}

// A componentType that is never the commerce-search root type.
const otherComponentTypeArb = fc
  .string({minLength: 1, maxLength: 20})
  .filter((s) => s !== COMMERCE_SEARCH_ROOT_TYPE);

type Scenario =
  | {kind: 'commerce-search'; surfaceId: string}
  | {kind: 'other-root'; componentType: string; surfaceId: string}
  | {kind: 'no-surface'};

const scenarioArb: fc.Arbitrary<Scenario> = fc.oneof(
  fc
    .string({minLength: 1, maxLength: 12})
    .map((surfaceId) => ({kind: 'commerce-search', surfaceId}) as Scenario),
  fc
    .record({
      componentType: otherComponentTypeArb,
      surfaceId: fc.string({minLength: 1, maxLength: 12}),
    })
    .map(
      ({componentType, surfaceId}) => ({kind: 'other-root', componentType, surfaceId}) as Scenario
    ),
  fc.constant({kind: 'no-surface'} as Scenario)
);

describe('surface routing partitions on the root componentType (Property 9)', () => {
  // Feature: thermidor-commerce-search-composition, Property 9: For any mounted surface,
  // navigation routes to the search-results page when and only when the resolved
  // Root_Component's componentType equals commerce-search; every other root componentType,
  // and the absence of a surface (with an agent response present), routes to inline
  // conversation.
  it('routes commerce-search roots to search and every other case to conversation', () => {
    fc.assert(
      fc.property(scenarioArb, (scenario) => {
        if (scenario.kind === 'commerce-search') {
          const turn = makeTurn(
            [makeSurfaceActivity(COMMERCE_SEARCH_ROOT_TYPE, scenario.surfaceId)],
            true
          );
          expect(deriveTransitionAction(turn)).toEqual({type: 'NAVIGATE_SEARCH'});
          return;
        }

        if (scenario.kind === 'other-root') {
          const turn = makeTurn(
            [makeSurfaceActivity(scenario.componentType, scenario.surfaceId)],
            true
          );
          expect(deriveTransitionAction(turn)).toEqual({type: 'NAVIGATE_CONVERSATION'});
          return;
        }

        // No surface, but an agent response is present → inline conversation.
        const turn = makeTurn(undefined, true);
        expect(deriveTransitionAction(turn)).toEqual({type: 'NAVIGATE_CONVERSATION'});
      }),
      {numRuns: 150}
    );
  });
});
