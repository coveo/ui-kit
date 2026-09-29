import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import {deriveTransitionAction} from './use-navigation.js';
import {makeTurn} from '../test/turn-fixtures.js';

const COMMERCE_SEARCH_ROOT_TYPE = 'CommerceSearch';

/**
 * Builds a completed turn whose typed `response.surfaces` projection carries the
 * given discovered surfaces. `deriveTransitionAction` reads this projection
 * directly (ADR-015); it never walks `response.activities`.
 */
function makeSurfaceTurn(surfaces: DiscoveredSurface[]): Turn {
  return makeTurn({id: 'turn-1', prompt: 'a prompt', response: {surfaces}});
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
  // and the absence of a surface (with a completed turn), routes to inline conversation.
  it('routes commerce-search roots to search and every other case to conversation', () => {
    fc.assert(
      fc.property(scenarioArb, (scenario) => {
        if (scenario.kind === 'commerce-search') {
          const turn = makeSurfaceTurn([
            {surfaceId: scenario.surfaceId, rootComponentType: COMMERCE_SEARCH_ROOT_TYPE},
          ]);
          expect(deriveTransitionAction(turn)).toEqual({type: 'NAVIGATE_SEARCH'});
          return;
        }

        if (scenario.kind === 'other-root') {
          const turn = makeSurfaceTurn([
            {surfaceId: scenario.surfaceId, rootComponentType: scenario.componentType},
          ]);
          expect(deriveTransitionAction(turn)).toEqual({type: 'NAVIGATE_CONVERSATION'});
          return;
        }

        // No surface, completed turn → inline conversation.
        const turn = makeSurfaceTurn([]);
        expect(deriveTransitionAction(turn)).toEqual({type: 'NAVIGATE_CONVERSATION'});
      }),
      {numRuns: 150}
    );
  });
});
