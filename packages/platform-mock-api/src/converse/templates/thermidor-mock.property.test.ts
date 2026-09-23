import fc from 'fast-check';
import {describe, expect, it} from 'vitest';

import {matchSchemaPrompt, buildSearchActionEvents} from '../generate-schema-response.js';
import {
  buildWaterSportsInitialEvents,
  buildWaterSportsActionEvents,
} from './schema-response-search.js';
import {STATE_NAMESPACE, statePath, bindStateFields} from './shared.js';
import type {ConverseEvent} from '../events.js';

const NUM_RUNS = 200;

// The two removed dual-identity keys (`componentId`/`componentType`) must never appear anywhere on
// a mock-emitted flat node.
const FORBIDDEN_TOP_LEVEL_KEYS = ['componentId', 'componentType'] as const;

// The migrated prompts whose templates emit component-node surfaces, plus a no-match prompt that
// falls through to the fallback template.
const TEMPLATE_PROMPTS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'water sports',
  'i like cold-water surfing. compare wetsuits for it',
  'boating safety',
  'something that matches no prompt',
];

interface EmittedNode {
  id?: unknown;
  component?: unknown;
  [key: string]: unknown;
}

// Pulls every `createSurface.components[]` node out of an emitted ConverseEvent stream. The mock
// carries surfaces inside `a2ui-surface` ACTIVITY_SNAPSHOT events as
// `content.messages[].createSurface.components[]`.
function extractNodesFromEvents(events: ConverseEvent[]): EmittedNode[] {
  const nodes: EmittedNode[] = [];
  for (const message of a2uiMessagesOf(events)) {
    const createSurface = (message as Record<string, unknown>)['createSurface'] as
      | Record<string, unknown>
      | undefined;
    const components = createSurface?.['components'];
    if (Array.isArray(components)) {
      nodes.push(...(components as EmittedNode[]));
    }
  }
  return nodes;
}

// Reads the `messages` payload of every `a2ui-surface` ACTIVITY_SNAPSHOT event in a sequence.
function a2uiMessagesOf(events: ConverseEvent[]): Record<string, unknown>[] {
  const messages: Record<string, unknown>[] = [];
  for (const event of events) {
    if (event.event !== 'ACTIVITY_SNAPSHOT') {
      continue;
    }
    const data = event.data as Record<string, unknown>;
    if (data['activityType'] !== 'a2ui-surface') {
      continue;
    }
    const content = data['content'] as Record<string, unknown> | undefined;
    const list = content?.['messages'];
    if (Array.isArray(list)) {
      for (const message of list) {
        if (message && typeof message === 'object') {
          messages.push(message as Record<string, unknown>);
        }
      }
    }
  }
  return messages;
}

interface UpdateDataModelOp {
  surfaceId: string;
  path: string;
  value: unknown;
}

function updateDataModelOpsOf(events: ConverseEvent[]): UpdateDataModelOp[] {
  const ops: UpdateDataModelOp[] = [];
  for (const message of a2uiMessagesOf(events)) {
    const op = message['updateDataModel'] as UpdateDataModelOp | undefined;
    if (op && typeof op.path === 'string') {
      ops.push(op);
    }
  }
  return ops;
}

// Deep scan: does `value` (recursively) contain a plain-object key named `key`?
function containsKeyDeep(value: unknown, key: string): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => containsKeyDeep(entry, key));
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return true;
    }
    return Object.values(record).some((entry) => containsKeyDeep(entry, key));
  }
  return false;
}

// Asserts the single-identity invariant on one emitted flat node: exactly `id`/`component`
// identity at the top level and no `componentId`/`componentType` anywhere on the node. In the flat
// A2-UI node model there is no `props` wrapper, so the node's own props live at the top level; the
// contract's identity guard only forbids the two removed dual-identity keys.
function assertSingleIdentity(node: EmittedNode): void {
  expect(typeof node.id).toBe('string');
  expect(typeof node.component).toBe('string');
  for (const key of FORBIDDEN_TOP_LEVEL_KEYS) {
    expect(Object.prototype.hasOwnProperty.call(node, key)).toBe(false);
    expect(containsKeyDeep(node, key)).toBe(false);
  }
}

// True iff `path` equals `statePath(id)` or is a sub-path beneath it for some present node id.
function targetsPresentStatePath(path: string, presentNodeIds: Set<string>): boolean {
  for (const id of presentNodeIds) {
    const root = statePath(id);
    if (path === root || path.startsWith(`${root}/`)) {
      return true;
    }
  }
  return false;
}

// A generator over the shared node builder: valid kebab-case ids, a PascalCase component
// discriminant, and a set of state field names bound through `bindStateFields`, mirroring how the
// migrated templates construct their stateful nodes.
const kebabId = fc
  .array(fc.stringMatching(/^[a-z][a-z0-9]{0,7}$/), {minLength: 1, maxLength: 4})
  .map((segments) => segments.join('-'));
const fieldName = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,11}$/);
const nodeArbitrary = fc
  .record({
    id: kebabId,
    component: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{0,15}$/),
    fields: fc.uniqueArray(fieldName, {minLength: 0, maxLength: 8}),
  })
  .map(({id, component, fields}) => ({
    id,
    component,
    ...bindStateFields(id, fields),
  }));

describe('Feature: a2ui-inline-state-data-model, Property 8: Mock-emitted nodes carry a single identity with no identity keys in props', () => {
  it('every node emitted by a migrated template carries a single identity and no identity keys in props', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TEMPLATE_PROMPTS), (prompt) => {
        const nodes = extractNodesFromEvents(matchSchemaPrompt(prompt));
        expect(nodes.length).toBeGreaterThan(0);
        for (const node of nodes) {
          assertSingleIdentity(node);
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('every node emitted by the water-sports action surface carries a single identity and no identity keys in props', () => {
    const actionNames = ['toggleSelect', 'selectPage', 'setPageSize', 'search'];
    fc.assert(
      fc.property(fc.constantFrom(...actionNames), fc.string(), (name, value) => {
        const events = buildSearchActionEvents({
          name,
          context: {value, query: value},
          sourceComponentId: 'facet-brand-2',
        });
        for (const node of extractNodesFromEvents(events)) {
          assertSingleIdentity(node);
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('every node produced by the shared node builder carries a single identity and no identity keys in props', () => {
    fc.assert(
      fc.property(nodeArbitrary, (node) => {
        assertSingleIdentity(node);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});

// A candidate action targeting one of the water-sports facets or non-facet controls. Actions
// unknown to a target are no-ops that still trigger a `/state` re-emission.
const arbAction = fc.oneof(
  fc.record({
    sourceComponentId: fc.constant('facet-brand-2'),
    name: fc.constantFrom(
      'toggleSelect',
      'toggleExclude',
      'toggleSingleSelect',
      'clearAllActiveValues',
      'showMoreValues',
      'showLessValues',
      'search',
      'showMoreSearchResults',
      'clearSearch'
    ),
    context: fc.record({
      value: fc.constantFrom('Billabong', 'Quiksilver', 'Rip Curl', 'Xcel', 'Dakine'),
      query: fc.string({maxLength: 6}),
    }),
  }),
  fc.record({
    sourceComponentId: fc.constant('facet-price-2'),
    name: fc.constantFrom(
      'toggleSelect',
      'toggleSingleSelect',
      'applyCustomRange',
      'clearAllActiveValues'
    ),
    context: fc.record({
      start: fc.integer({min: 0, max: 500}),
      end: fc.integer({min: 500, max: 100000}),
    }),
  }),
  fc.record({
    sourceComponentId: fc.constant('facet-category-2'),
    name: fc.constantFrom(
      'selectPath',
      'clearSelectedPath',
      'showMoreValues',
      'showLessValues',
      'search',
      'showMoreSearchResults',
      'clearSearch'
    ),
    context: fc.record({
      path: fc.subarray(['Surfing', 'Surfboards', 'Paddling', 'Kayaks']),
      query: fc.string({maxLength: 6}),
    }),
  }),
  fc.record({
    sourceComponentId: fc.constantFrom(undefined, 'pagination-2', 'page-size-2', 'sort-2'),
    name: fc.constantFrom('selectPage', 'setPageSize', 'selectSort'),
    context: fc.record({
      page: fc.integer({min: 0, max: 20}),
      pageSize: fc.constantFrom(12, 24, 48),
      sortCriteria: fc.constantFrom('relevance', 'price_asc', 'price_desc'),
    }),
  })
);

// The node ids the initial response composes into the surface, read from its single createSurface.
function presentNodeIdsOf(initialEvents: ConverseEvent[]): Set<string> {
  const ids = new Set<string>();
  for (const message of a2uiMessagesOf(initialEvents)) {
    const createSurface = message['createSurface'] as Record<string, unknown> | undefined;
    const components = createSurface?.['components'];
    if (Array.isArray(components)) {
      for (const component of components as EmittedNode[]) {
        if (typeof component.id === 'string') {
          ids.add(component.id);
        }
      }
    }
  }
  return ids;
}

describe('Feature: a2ui-inline-state-data-model, Property 9: Every mock updateDataModel op targets a present node /state path', () => {
  it('emits only server-owned /state ops targeting present nodes for any initial + action sequence', () => {
    fc.assert(
      fc.property(fc.array(arbAction, {maxLength: 12}), (actions) => {
        // A fresh initial response resets the in-memory view and composes the surface.
        const initialEvents = buildWaterSportsInitialEvents();
        const presentNodeIds = presentNodeIdsOf(initialEvents);
        expect(presentNodeIds.size).toBeGreaterThan(0);

        const opSequences: UpdateDataModelOp[][] = [updateDataModelOpsOf(initialEvents)];
        for (const action of actions) {
          const actionEvents = buildWaterSportsActionEvents(
            {name: action.name, context: action.context},
            action.sourceComponentId
          );
          opSequences.push(updateDataModelOpsOf(actionEvents));
        }

        for (const ops of opSequences) {
          for (const op of ops) {
            expect(op.path.startsWith(`${STATE_NAMESPACE}/`)).toBe(true);
            expect(op.surfaceId).toBe('ui-commerce-water-sports');
            expect(targetsPresentStatePath(op.path, presentNodeIds)).toBe(true);
          }
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('emits at least one /state op for the initial response (non-vacuous)', () => {
    const initialEvents = buildWaterSportsInitialEvents();
    const ops = updateDataModelOpsOf(initialEvents);
    expect(ops.length).toBeGreaterThan(0);
    const presentNodeIds = presentNodeIdsOf(initialEvents);
    for (const op of ops) {
      expect(op.path.startsWith(`${STATE_NAMESPACE}/`)).toBe(true);
      expect(targetsPresentStatePath(op.path, presentNodeIds)).toBe(true);
    }
  });
});
