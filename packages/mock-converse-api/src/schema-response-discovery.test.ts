import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';
import {expectNormalizedGroups, groupsOf} from './product-groups.test-utils.js';

const {matchSchemaPrompt} = converseSchemaResponses;

type Product = Record<string, unknown>;

function carouselProducts(events: ConverseEvent[], surfaceId: string): Product[] {
  const op = events
    .filter(
      ({event, data}) =>
        event === 'ACTIVITY_SNAPSHOT' &&
        (data as {activityType: string}).activityType === 'a2ui-surface'
    )
    .flatMap(({data}) => (data as {content: {messages: Product[]}}).content.messages)
    .map(({updateDataModel}) => updateDataModel as {surfaceId: string; value: unknown} | undefined)
    .find((update) => update?.surfaceId === surfaceId);
  return (op!.value as {products: Product[]}).products;
}

describe('schema-response-discovery product groups', () => {
  const events = matchSchemaPrompt('boating safety');
  const lifeJackets = carouselProducts(events, 'product-surface-life-jackets');
  const safetyGear = carouselProducts(events, 'product-surface-safety-gear');

  it('shows grouped and ungrouped products in each carousel', () => {
    expect(groupsOf(lifeJackets).slice(0, 2)).toEqual([
      {name: 'AquaSecure Life Jacket - Yellow / Child', listed: 3, total: 3},
      {name: 'AquaGuardian Life Jacket - Black / Toddler', listed: undefined, total: undefined},
    ]);
    expect(groupsOf(safetyGear).slice(0, 2)).toEqual([
      {name: 'AquaGuardian Safety Vest - Red / Adult Universal', listed: 3, total: 8},
      {name: 'EcoRider Safety Helmet - Red / M', listed: undefined, total: undefined},
    ]);
  });

  it('lists each product first among its children, each with its own thumbnail', () => {
    expectNormalizedGroups([...lifeJackets, ...safetyGear]);
    for (const child of lifeJackets[0].children as Product[]) {
      expect(child.ec_thumbnails).toEqual(child.ec_images);
    }
  });
});
