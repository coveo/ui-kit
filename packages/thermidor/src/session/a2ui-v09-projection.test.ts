import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {deriveA2uiV09Messages} from './a2ui-v09-projection.js';
import type {Activity, A2uiV09Message} from './types.js';

function surfaceActivity(
  messages: unknown[],
  {id = 'activity-1', replace = false}: {id?: string; replace?: boolean} = {}
): Activity {
  return {id, kind: 'a2ui-surface', replace, payload: {messages}};
}

/** Runs the projection over a single surface activity carrying `messages`. */
function project(messages: unknown[]): A2uiV09Message[] {
  return deriveA2uiV09Messages([surfaceActivity(messages)]);
}

describe('deriveA2uiV09Messages', () => {
  it('passes already-v0.9 messages through from multiple activities', () => {
    const message1 = {version: 'v0.9', createSurface: {surfaceId: 'surface-1'}};
    const message2 = {version: 'v0.9', createSurface: {surfaceId: 'surface-2'}};

    expect(
      deriveA2uiV09Messages([
        surfaceActivity([message1], {id: 'activity-1'}),
        surfaceActivity([message2], {id: 'activity-2'}),
      ])
    ).toEqual([message1, message2]);
  });

  it('honors per-activity-id replacement semantics', () => {
    const firstVersion = {version: 'v0.9', createSurface: {surfaceId: 'old'}};
    const updatedVersion = {version: 'v0.9', createSurface: {surfaceId: 'updated'}};

    expect(
      deriveA2uiV09Messages([
        surfaceActivity([firstVersion], {id: 'activity-1'}),
        surfaceActivity([updatedVersion], {id: 'activity-1', replace: true}),
      ])
    ).toEqual([updatedVersion]);
  });

  it('appends to the same activity id when replace is not set', () => {
    const first = {version: 'v0.9', createSurface: {surfaceId: 'a'}};
    const second = {version: 'v0.9', createSurface: {surfaceId: 'b'}};

    expect(
      deriveA2uiV09Messages([
        surfaceActivity([first], {id: 'activity-1'}),
        surfaceActivity([second], {id: 'activity-1'}),
      ])
    ).toEqual([first, second]);
  });

  it('splits a v1.0 createSurface into createSurface + updateComponents', () => {
    const result = project([
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'my-surface',
          components: [
            {id: 'root', component: 'ProductCarousel', heading: {path: '/state/root/heading'}},
          ],
        },
      },
    ]);

    expect(result[0]).toEqual({version: 'v0.9', createSurface: {surfaceId: 'my-surface'}});
    expect(result[1]).toEqual({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'my-surface',
        components: [
          {id: 'root', component: 'ProductCarousel', heading: {path: '/state/root/heading'}},
        ],
      },
    });
  });

  it('carries catalogId onto the v0.9 createSurface when present', () => {
    const result = project([
      {
        version: 'v1.0',
        createSurface: {surfaceId: 's', catalogId: 'commerce', components: []},
      },
    ]);

    expect(result).toEqual([
      {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: 'commerce'}},
    ]);
  });

  it('emits no updateComponents for a surface with no components', () => {
    const result = project([{version: 'v1.0', createSurface: {surfaceId: 's', components: []}}]);

    expect(result).toEqual([{version: 'v0.9', createSurface: {surfaceId: 's'}}]);
  });

  it('drops a v1.0 createSurface with no usable surfaceId', () => {
    expect(project([{version: 'v1.0', createSurface: {components: []}}])).toEqual([]);
    expect(project([{version: 'v1.0', createSurface: {surfaceId: '', components: []}}])).toEqual(
      []
    );
  });

  it('ignores activities that are not a2ui-surface', () => {
    expect(
      deriveA2uiV09Messages([
        {id: 'activity-1', kind: 'text', replace: false, payload: {content: 'hello'}},
      ])
    ).toEqual([]);
  });

  it('ignores surface activities whose payload carries no messages array', () => {
    expect(
      deriveA2uiV09Messages([{id: 'activity-1', kind: 'a2ui-surface', replace: false, payload: {}}])
    ).toEqual([]);
  });

  it('yields an empty stream for no activities', () => {
    expect(deriveA2uiV09Messages([])).toEqual([]);
  });
});

// The projection is a derived view of `activities`, never an independent source of truth:
// dropping it and recomputing from the same activity list must yield a deeply-equal stream.
// This is the invariant ADR-011 already requires of `surfaces`, and it is what lets
// serialization omit `a2uiMessages` and re-derive it on restore.
describe('deriveA2uiV09Messages is a pure re-derivable projection of activities', () => {
  const nodeArb = fc.record({
    id: fc.string({minLength: 1, maxLength: 6}),
    component: fc.constantFrom('ProductList', 'RegularFacet', 'Sort', 'CommerceSearch'),
  });

  const v1MessageArb = fc.oneof(
    fc.record({
      version: fc.constant('v1.0'),
      createSurface: fc.record({
        surfaceId: fc.string({minLength: 1, maxLength: 8}),
        components: fc.array(nodeArb, {maxLength: 4}),
      }),
    }),
    fc.record({
      version: fc.constant('v1.0'),
      updateDataModel: fc.record({
        surfaceId: fc.string({minLength: 1, maxLength: 8}),
        path: fc.string({minLength: 1, maxLength: 6}).map((seg) => `/state/${seg}`),
        value: fc.oneof(fc.integer(), fc.string(), fc.boolean()),
      }),
    }),
    fc.record({
      version: fc.constant('v1.0'),
      deleteSurface: fc.record({surfaceId: fc.string({minLength: 1, maxLength: 8})}),
    })
  );

  const activityArb: fc.Arbitrary<Activity> = fc.record({
    id: fc.string({minLength: 1, maxLength: 4}),
    kind: fc.constantFrom('a2ui-surface', 'text'),
    replace: fc.boolean(),
    payload: fc
      .array(v1MessageArb, {maxLength: 4})
      .map((messages) => ({messages}) as Record<string, unknown>),
  });

  it('recomputes deeply-equal output for the same activity list', () => {
    fc.assert(
      fc.property(fc.array(activityArb, {maxLength: 8}), (activities) => {
        expect(deriveA2uiV09Messages(activities)).toEqual(deriveA2uiV09Messages(activities));
      }),
      {numRuns: 200}
    );
  });

  it('never mutates the activities it reads', () => {
    fc.assert(
      fc.property(fc.array(activityArb, {maxLength: 8}), (activities) => {
        const before = JSON.stringify(activities);
        deriveA2uiV09Messages(activities);
        expect(JSON.stringify(activities)).toBe(before);
      }),
      {numRuns: 200}
    );
  });
});

// Every already-flat v1.0 node is forwarded byte-for-byte: the `{ "path": ... }` Data_Binding
// objects carried at the node top level survive, composition links (children[]/child) survive,
// the single `id`/`component` identity is preserved, and no `componentId`/`componentType`
// correlation is ever synthesized. No root rewrite is performed — v1.0 nodes already mount the
// canonical `root` node and the envelope carries no `rootId`.
describe('flat v1.0 nodes are forwarded byte-for-byte', () => {
  interface GeneratedNode {
    id: string;
    boundProps: Record<string, string>;
    children?: string[];
    child?: string;
  }

  function extractComponents(converted: A2uiV09Message[]): Array<Record<string, unknown>> {
    const updateMessage = converted.find((message) => 'updateComponents' in message);
    if (!updateMessage) {
      return [];
    }
    const updateComponents = updateMessage['updateComponents'] as Record<string, unknown>;
    return (updateComponents['components'] as Array<Record<string, unknown>>) ?? [];
  }

  function buildMessage(nodes: GeneratedNode[]): Record<string, unknown> {
    const components = nodes.map((node) => {
      const {id, boundProps, children, child} = node;
      const comp: Record<string, unknown> = {id, component: 'SomeComponent'};
      for (const [key, path] of Object.entries(boundProps)) {
        comp[key] = {path};
      }
      if (children !== undefined) {
        comp['children'] = [...children];
      }
      if (child !== undefined) {
        comp['child'] = child;
      }
      return comp;
    });

    return {
      version: 'v1.0',
      createSurface: {surfaceId: 'surface-under-test', components},
    };
  }

  const scenarioArb = fc
    .uniqueArray(fc.string({minLength: 1, maxLength: 6}), {minLength: 1, maxLength: 6})
    .chain((ids) =>
      fc.record({
        ids: fc.constant(ids),
        boundPropsPerNode: fc.array(
          fc.dictionary(
            fc.string({minLength: 1, maxLength: 6}),
            fc.string({minLength: 1, maxLength: 8}).map((seg) => `/state/${seg}`),
            {maxKeys: 4}
          ),
          {minLength: ids.length, maxLength: ids.length}
        ),
        childrenPerNode: fc.array(fc.option(fc.subarray(ids), {nil: undefined}), {
          minLength: ids.length,
          maxLength: ids.length,
        }),
        childPerNode: fc.array(fc.option(fc.constantFrom(...ids), {nil: undefined}), {
          minLength: ids.length,
          maxLength: ids.length,
        }),
      })
    )
    .map(({ids, boundPropsPerNode, childrenPerNode, childPerNode}) => ({
      nodes: ids.map((id, index) => ({
        id,
        boundProps: boundPropsPerNode[index],
        children: childrenPerNode[index],
        child: childPerNode[index],
      })) as GeneratedNode[],
    }));

  it('preserves bindings, composition links, and single identity', () => {
    fc.assert(
      fc.property(scenarioArb, ({nodes}) => {
        const converted = project([buildMessage(nodes)]);
        const output = extractComponents(converted);

        expect(output).toHaveLength(nodes.length);

        output.forEach((outNode, index) => {
          const source = nodes[index];

          for (const [key, path] of Object.entries(source.boundProps)) {
            expect(outNode[key]).toEqual({path});
          }

          expect(outNode['component']).toBe('SomeComponent');
          expect('componentId' in outNode).toBe(false);
          expect('componentType' in outNode).toBe(false);
          expect(outNode['id']).toBe(source.id);

          if (source.children === undefined) {
            expect('children' in outNode).toBe(false);
          } else {
            expect(outNode['children']).toEqual(source.children);
          }

          if (source.child === undefined) {
            expect('child' in outNode).toBe(false);
          } else {
            expect(outNode['child']).toBe(source.child);
          }
        });

        expect(JSON.stringify(converted)).not.toContain('componentId');
        expect(JSON.stringify(converted)).not.toContain('componentType');
      }),
      {numRuns: 200}
    );
  });

  it('passes updateDataModel ops through carrying {surfaceId, path, value} unchanged', () => {
    const opArb = fc.record({
      surfaceId: fc.string({minLength: 1, maxLength: 12}),
      path: fc.string({minLength: 1, maxLength: 8}).map((seg) => `/state/${seg}`),
      value: fc.oneof(
        fc.integer(),
        fc.string(),
        fc.boolean(),
        fc.record({page: fc.integer()}, {requiredKeys: ['page']})
      ),
    });

    fc.assert(
      fc.property(opArb, ({surfaceId, path, value}) => {
        const converted = project([{version: 'v1.0', updateDataModel: {surfaceId, path, value}}]);

        expect(converted).toHaveLength(1);
        expect(converted[0]).toEqual({version: 'v0.9', updateDataModel: {surfaceId, path, value}});
      }),
      {numRuns: 150}
    );
  });
});

// An unconvertible v1.0 message (one carrying no recognized operation) must contribute nothing
// to the renderer stream, so it cannot mutate previously rendered state.
describe('unconvertible v1.0 messages are dropped, leaving prior state intact', () => {
  const KNOWN_OPS = ['createSurface', 'updateDataModel', 'updateComponents', 'deleteSurface'];

  const RESERVED = new Set([
    ...KNOWN_OPS,
    'version',
    ...Object.getOwnPropertyNames(Object.prototype),
  ]);

  const unconvertibleArb = fc
    .string({minLength: 1, maxLength: 12})
    .filter((key) => !RESERVED.has(key))
    .chain((key) =>
      fc.record({
        key: fc.constant(key),
        payload: fc.oneof(fc.record({}), fc.record({foo: fc.string()}), fc.string(), fc.integer()),
      })
    );

  it('emits nothing for an unconvertible message so the prior surface is retained', () => {
    fc.assert(
      fc.property(unconvertibleArb, ({key, payload}) => {
        const validCreate = {
          version: 'v1.0',
          createSurface: {surfaceId: 'surface-prior', components: [{id: 'root', component: 'X'}]},
        };

        const result = project([validCreate, {version: 'v1.0', [key]: payload}]);

        const emittedFromUnconvertible = result.filter((message) => Object.hasOwn(message, key));
        expect(emittedFromUnconvertible).toHaveLength(0);

        const createSurfaces = result.filter((message) => Object.hasOwn(message, 'createSurface'));
        expect(createSurfaces).toHaveLength(1);
      }),
      {numRuns: 150}
    );
  });
});
