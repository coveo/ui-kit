import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt} = converseSchemaResponses;

const COMPARISON_PROMPT = 'i like cold-water surfing. compare wetsuits for it';
const COMPARISON_SURFACE_ID = 'comparison-surface';
const STATE_PREFIX = '/state/';

// The property set of the thermidor-schema `ComparisonProduct` definition, which is closed
// (`additionalProperties: false`).
const COMPARISON_PRODUCT_PROPERTIES = new Set([
  'productId',
  'name',
  'values',
  'imageUrl',
  'price',
  'rating',
  'relatedDocuments',
]);

// The property set of the thermidor-schema `ProductResearchRelatedDocument` definition, which
// `ComparisonProduct.relatedDocuments` reuses and which is closed (`additionalProperties: false`).
const RELATED_DOCUMENT_PROPERTIES = ['clickUri', 'filetype', 'size', 'title'];

function eventData(event: ConverseEvent): Record<string, unknown> {
  return event.data as Record<string, unknown>;
}

function surfaceMessages(event: ConverseEvent): Array<Record<string, unknown>> {
  const content = eventData(event).content as Record<string, unknown>;
  return content.messages as Array<Record<string, unknown>>;
}

function isSurfaceActivity(event: ConverseEvent): boolean {
  return event.event === 'ACTIVITY_SNAPSHOT' && eventData(event).activityType === 'a2ui-surface';
}

function findCreateSurfaces(events: ConverseEvent[]): Array<Record<string, unknown>> {
  return events
    .filter(isSurfaceActivity)
    .flatMap(surfaceMessages)
    .filter((m) => m.createSurface !== undefined)
    .map((m) => m.createSurface as Record<string, unknown>);
}

// Collects the whole-component `/state/<id>` values written to one surface by updateDataModel ops.
function collectSurfaceState(events: ConverseEvent[], surfaceId: string): Record<string, unknown> {
  const components: Record<string, unknown> = {};
  for (const message of events.filter(isSurfaceActivity).flatMap(surfaceMessages)) {
    const op = message.updateDataModel as Record<string, unknown> | undefined;
    if (!op || op.surfaceId !== surfaceId) {
      continue;
    }
    const path = op.path as string;
    if (path.startsWith(STATE_PREFIX)) {
      components[path.slice(STATE_PREFIX.length)] = op.value;
    }
  }
  return components;
}

describe('schema-response-comparison related documents', () => {
  const events = matchSchemaPrompt(COMPARISON_PROMPT);
  const comparisonSurface = findCreateSurfaces(events).find(
    (s) => s.surfaceId === COMPARISON_SURFACE_ID
  );
  const state = collectSurfaceState(events, COMPARISON_SURFACE_ID).root as Record<string, unknown>;
  const products = state.products as Array<Record<string, unknown>>;

  it('binds the ComparisonTable to its state fields, with documents riding on products', () => {
    expect(comparisonSurface!.components).toEqual([
      {
        id: 'root',
        component: 'ComparisonTable',
        heading: {path: '/state/root/heading'},
        summary: {path: '/state/root/summary'},
        products: {path: '/state/root/products'},
        attributes: {path: '/state/root/attributes'},
      },
    ]);
  });

  it('carries products with only the closed schema fields', () => {
    for (const product of products) {
      for (const key of Object.keys(product)) {
        expect(
          COMPARISON_PRODUCT_PROPERTIES,
          `unexpected ComparisonProduct field "${key}"`
        ).toContain(key);
      }
    }
  });

  it('sends more documents than the demo shows for one product, and none for another', () => {
    const counts = products.map(
      (product) => (product.relatedDocuments as unknown[] | undefined)?.length ?? 0
    );
    expect(Math.max(...counts)).toBeGreaterThan(5);
    expect(Math.max(...counts)).toBeLessThanOrEqual(10);
    expect(counts).toContain(0);
  });

  it('gives every document exactly the closed schema fields', () => {
    const documents = products.flatMap(
      (product) => (product.relatedDocuments as Array<Record<string, unknown>> | undefined) ?? []
    );
    expect(documents.length).toBeGreaterThan(0);
    for (const document of documents) {
      expect(Object.keys(document).sort()).toEqual(RELATED_DOCUMENT_PROPERTIES);
      expect(typeof document.title).toBe('string');
      expect(new URL(document.clickUri as string).protocol).toBe('https:');
      expect(typeof document.filetype).toBe('string');
      expect(Number.isInteger(document.size)).toBe(true);
      expect(document.size as number).toBeGreaterThanOrEqual(0);
    }
  });
});
