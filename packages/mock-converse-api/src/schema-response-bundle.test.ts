import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import {expectNormalizedGroups, groupsOf} from './product-groups.test-utils.js';

const {matchSchemaPrompt} = converseSchemaResponses;

type Product = Record<string, unknown>;

const BUNDLE_PROMPT = 'build a beginner surfing kit with budget, mid-range, and premium options';

function slotProducts(): Product[] {
  return matchSchemaPrompt(BUNDLE_PROMPT)
    .filter(({event}) => event === 'ACTIVITY_SNAPSHOT')
    .flatMap(({data}) => (data as {content?: {messages?: Product[]}}).content?.messages ?? [])
    .map(({updateDataModel}) => updateDataModel as {surfaceId: string; value: unknown} | undefined)
    .filter((update) => update?.surfaceId === 'bundle-surface')
    .map((update) => (update!.value as {product?: Product}).product)
    .filter((product) => product !== undefined);
}

describe('schema-response-bundle product groups', () => {
  const products = slotProducts();

  it('groups a slot product beside slots without children', () => {
    expect(groupsOf(products).slice(0, 2)).toEqual([
      {name: 'Wave Rider Kids Soft Top - Red', listed: 2, total: 2},
      {name: 'EcoFlex Wetsuit for Women - Red / M', listed: undefined, total: undefined},
    ]);
  });

  it('lists each product first among its children', () => {
    expectNormalizedGroups(products);
  });
});
