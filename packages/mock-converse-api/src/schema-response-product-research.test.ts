import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt} = converseSchemaResponses;

const RESEARCH_PROMPT = 'tell me more about the thermoflex winter wetsuit';
const RESEARCH_SURFACE_ID = 'product-research-surface';
const STATE_PREFIX = '/state/';

// The property set of the thermidor-schema `Product` definition, which is closed
// (`additionalProperties: false`).
const PRODUCT_PROPERTIES = new Set([
  'permanentid',
  'ec_name',
  'ec_description',
  'ec_shortdesc',
  'ec_brand',
  'ec_category',
  'ec_price',
  'ec_promo_price',
  'ec_images',
  'ec_thumbnails',
  'ec_in_stock',
  'ec_rating',
  'ec_color',
  'ec_item_group_id',
  'ec_item_group_name',
  'clickUri',
  'additionalFields',
  'children',
]);

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

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

describe('schema-response-product-research single-product research scenario', () => {
  const events = matchSchemaPrompt(RESEARCH_PROMPT);
  const createSurfaces = findCreateSurfaces(events);
  const researchSurface = createSurfaces.find((s) => s.surfaceId === RESEARCH_SURFACE_ID);

  it('matches the research prompt after trimming and lowercasing', () => {
    const normalizedEvents = matchSchemaPrompt(
      '  Tell me more about the ThermoFlex Winter Wetsuit '
    );
    expect(findCreateSurfaces(normalizedEvents).map((s) => s.surfaceId)).toContain(
      RESEARCH_SURFACE_ID
    );
  });

  it('does not emit the research surface for an unrelated prompt', () => {
    const fallbackSurfaces = findCreateSurfaces(matchSchemaPrompt('tell me a joke'));
    expect(fallbackSurfaces.map((s) => s.surfaceId)).not.toContain(RESEARCH_SURFACE_ID);
  });

  it('routes through the research flow', () => {
    const toolCallNames = events
      .filter((e) => eventData(e).type === 'TOOL_CALL_START')
      .map((e) => eventData(e).toolCallName);
    expect(toolCallNames).toEqual(['route_research', 'store_render_plan']);
  });

  it('creates a surface whose root node is a ProductResearchCard bound to its state fields', () => {
    expect(researchSurface).toBeDefined();
    const nodes = researchSurface!.components as Array<Record<string, unknown>>;
    expect(nodes).toEqual([
      {
        id: 'root',
        component: 'ProductResearchCard',
        product: {path: '/state/root/product'},
        summary: {path: '/state/root/summary'},
        bullets: {path: '/state/root/bullets'},
      },
    ]);
  });

  describe('ProductResearchCard state', () => {
    const state = collectSurfaceState(events, RESEARCH_SURFACE_ID).root as Record<string, unknown>;

    it('is written whole at /state/root with exactly the schema fields', () => {
      expect(state).toBeDefined();
      expect(Object.keys(state).sort()).toEqual(['bullets', 'product', 'summary']);
    });

    it('carries a product that conforms to the closed schema Product', () => {
      const product = state.product as Record<string, unknown>;
      expect(isNonEmptyString(product.permanentid)).toBe(true);
      expect(isNonEmptyString(product.ec_name)).toBe(true);
      expect(product.additionalFields).toEqual({});
      for (const key of Object.keys(product)) {
        expect(PRODUCT_PROPERTIES, `unexpected Product field "${key}"`).toContain(key);
      }
      expect(() => new URL(product.clickUri as string)).not.toThrow();
    });

    it('carries a non-empty summary', () => {
      expect(isNonEmptyString(state.summary)).toBe(true);
    });

    it('carries a non-empty list of non-empty bullets', () => {
      const bullets = state.bullets as unknown[];
      expect(Array.isArray(bullets)).toBe(true);
      expect(bullets.length).toBeGreaterThan(0);
      expect(bullets.every(isNonEmptyString)).toBe(true);
    });
  });

  it('follows up with a NextActionsBar surface and its suggested actions', () => {
    const nextActions = createSurfaces.find((s) => s.surfaceId === 'next-actions-surface');
    const nodes = nextActions!.components as Array<Record<string, unknown>>;
    expect(nodes[0].component).toBe('NextActionsBar');
    const state = collectSurfaceState(events, 'next-actions-surface').root as Record<
      string,
      unknown
    >;
    expect((state.suggestedActions as unknown[]).length).toBeGreaterThan(0);
  });
});
