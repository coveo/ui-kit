import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {
  EMPTY_RENDERER_STREAM,
  appendToRendererStream,
  convertA2uiMessages,
} from './a2ui-v09-projection.js';
import type {A2uiV09Message} from './types.js';

/** Converts the messages of one surface snapshot. */
function project(messages: unknown[]): A2uiV09Message[] {
  return convertA2uiMessages(messages);
}

describe('convertA2uiMessages', () => {
  it('passes already-v0.9 messages through, in order', () => {
    const message1 = {version: 'v0.9', createSurface: {surfaceId: 'surface-1'}};
    const message2 = {version: 'v0.9', createSurface: {surfaceId: 'surface-2'}};

    expect(project([message1, message2])).toEqual([message1, message2]);
  });

  it('splits a v1.0 createSurface into createSurface + updateComponents', () => {
    const result = project([
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'my-surface',
          catalogId: 'commerce',
          components: [
            {id: 'root', component: 'ProductCarousel', heading: {path: '/state/root/heading'}},
          ],
        },
      },
    ]);

    expect(result[0]).toEqual({
      version: 'v0.9',
      createSurface: {surfaceId: 'my-surface', catalogId: 'commerce'},
    });
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

  it('seeds inline dataModel state as ordered updateDataModel ops after updateComponents', () => {
    const components = [
      {id: 'ui-24622445-pagination', component: 'Pagination'},
      {id: 'ui-24622445-sort', component: 'Sort'},
    ];
    const result = project([
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'my-surface',
          catalogId: 'commerce',
          sendDataModel: true,
          components,
          dataModel: {
            '/state/ui-24622445-pagination': {
              page: 0,
              pageSize: 20,
              totalEntries: 253,
              totalPages: 13,
            },
            '/state/ui-24622445-sort': {
              appliedSort: {sortCriteria: 'relevancy'},
              availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'fields'}],
            },
          },
        },
      },
    ]);

    expect(result).toEqual([
      {
        version: 'v0.9',
        createSurface: {surfaceId: 'my-surface', catalogId: 'commerce', sendDataModel: true},
      },
      {version: 'v0.9', updateComponents: {surfaceId: 'my-surface', components}},
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'my-surface',
          path: '/state/ui-24622445-pagination',
          value: {page: 0, pageSize: 20, totalEntries: 253, totalPages: 13},
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'my-surface',
          path: '/state/ui-24622445-sort',
          value: {
            appliedSort: {sortCriteria: 'relevancy'},
            availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'fields'}],
          },
        },
      },
    ]);
  });

  it('emits no updateComponents for a surface with no components', () => {
    const result = project([
      {version: 'v1.0', createSurface: {surfaceId: 's', catalogId: 'commerce', components: []}},
    ]);

    expect(result).toEqual([
      {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: 'commerce'}},
    ]);
  });

  it('drops a v1.0 createSurface with no usable surfaceId', () => {
    expect(project([{version: 'v1.0', createSurface: {components: []}}])).toEqual([]);
    expect(project([{version: 'v1.0', createSurface: {surfaceId: '', components: []}}])).toEqual(
      []
    );
  });

  it('drops a v1.0 createSurface with no catalogId (required by the v0.9 schema)', () => {
    // The v0.9 CreateSurfaceMessageSchema requires catalogId, and the renderer
    // throws `A2uiStateError: Catalog not found` without it, so an unconvertible
    // catalog-less surface is dropped rather than emitted as an invalid message.
    expect(project([{version: 'v1.0', createSurface: {surfaceId: 's', components: []}}])).toEqual(
      []
    );
    expect(
      project([{version: 'v1.0', createSurface: {surfaceId: 's', catalogId: '', components: []}}])
    ).toEqual([]);
  });

  it('ignores a message that is not an object', () => {
    expect(project(['text', null, ['a']])).toEqual([]);
  });

  it('yields nothing for no messages', () => {
    expect(project([])).toEqual([]);
  });
});

// The conversion is a pure function of the messages it reads: converting the same messages again
// yields a deeply-equal result, which is what lets serialization omit the renderer stream and
// rebuild it from the turns' activities on restore.
describe('convertA2uiMessages is a pure function of its messages', () => {
  const nodeArb = fc.record({
    id: fc.string({minLength: 1, maxLength: 6}),
    component: fc.constantFrom('ProductList', 'RegularFacet', 'Sort', 'CommerceSearch'),
  });

  const v1MessageArb = fc.oneof(
    fc.record({
      version: fc.constant('v1.0'),
      createSurface: fc.record({
        surfaceId: fc.string({minLength: 1, maxLength: 8}),
        catalogId: fc.string({minLength: 1, maxLength: 8}),
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

  const messagesArb = fc.array(v1MessageArb, {maxLength: 6});

  it('recomputes deeply-equal output for the same messages', () => {
    fc.assert(
      fc.property(messagesArb, (messages) => {
        expect(convertA2uiMessages(messages)).toEqual(convertA2uiMessages(messages));
      }),
      {numRuns: 200}
    );
  });

  it('never mutates the messages it reads', () => {
    fc.assert(
      fc.property(messagesArb, (messages) => {
        const before = JSON.stringify(messages);
        convertA2uiMessages(messages);
        expect(JSON.stringify(messages)).toBe(before);
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
      createSurface: {surfaceId: 'surface-under-test', catalogId: 'commerce', components},
    };
  }

  // A generated prop name must not collide with a node's structural fields: the fixture
  // builder writes bound props onto the node with `comp[key] = {path}`, so a prop named
  // `id` would overwrite the node id and make the fixture contradict its own assertions.
  // The projection forwards nodes byte-for-byte either way — this constraint keeps the
  // generated fixture self-consistent, it is not a limitation of the code under test.
  const STRUCTURAL_NODE_KEYS = new Set(['id', 'component', 'children', 'child']);

  const boundPropKeyArb = fc
    .string({minLength: 1, maxLength: 6})
    .filter((key) => !STRUCTURAL_NODE_KEYS.has(key));

  const scenarioArb = fc
    .uniqueArray(fc.string({minLength: 1, maxLength: 6}), {minLength: 1, maxLength: 6})
    .chain((ids) =>
      fc.record({
        ids: fc.constant(ids),
        boundPropsPerNode: fc.array(
          fc.dictionary(
            boundPropKeyArb,
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
          createSurface: {
            surfaceId: 'surface-prior',
            catalogId: 'commerce',
            components: [{id: 'root', component: 'X'}],
          },
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

describe('convertA2uiMessages loading placeholders', () => {
  const loadingSurface = (surfaceId: string) => ({
    version: 'v1.0',
    createSurface: {
      surfaceId,
      catalogId: 'commerce',
      components: [{id: 'root', component: 'ProductCarousel'}],
      dataModel: {isLoading: true},
    },
  });

  it('seeds a plain inline data-model key at its root JSON Pointer', () => {
    expect(project([loadingSurface('skel')])).toContainEqual({
      version: 'v0.9',
      updateDataModel: {surfaceId: 'skel', path: '/isLoading', value: true},
    });
  });

  it('escapes a plain key that contains pointer delimiters', () => {
    const result = project([
      {
        version: 'v1.0',
        createSurface: {surfaceId: 's', catalogId: 'commerce', dataModel: {'a/b~c': 1}},
      },
    ]);

    expect(result).toContainEqual({
      version: 'v0.9',
      updateDataModel: {surfaceId: 's', path: '/a~1b~0c', value: 1},
    });
  });

  it('seeds no data-model write for an empty inline key', () => {
    const result = project([
      {
        version: 'v1.0',
        createSurface: {surfaceId: 's', catalogId: 'commerce', dataModel: {'': {wiped: true}}},
      },
    ]);

    expect(result.some((message) => 'updateDataModel' in message)).toBe(false);
  });
});

describe('appendToRendererStream', () => {
  const create = (surfaceId: string) => ({version: 'v0.9', createSurface: {surfaceId}});
  const remove = (surfaceId: string) => ({version: 'v0.9', deleteSurface: {surfaceId}});
  const write = (surfaceId: string) => ({
    version: 'v0.9',
    updateDataModel: {surfaceId, path: '/state', value: {}},
  });

  it('only grows: earlier messages stay as they were', () => {
    const first = appendToRendererStream(EMPTY_RENDERER_STREAM, [create('a')]);
    const second = appendToRendererStream(first, [write('a'), create('b')]);

    expect(second.messages.slice(0, first.messages.length)).toEqual(first.messages);
    expect(second.messages).toEqual([create('a'), write('a'), create('b')]);
  });

  it('deletes a live surface before a createSurface replaces it', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [create('a'), create('a')]);

    expect(stream.messages).toEqual([create('a'), remove('a'), create('a')]);
  });

  it('drops an operation on a surface that is not live', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [
      write('unknown'),
      remove('unknown'),
      create('a'),
      remove('a'),
      write('a'),
    ]);

    expect(stream.messages).toEqual([create('a'), remove('a')]);
  });

  it('drops a second deleteSurface for the same surface', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [
      create('a'),
      remove('a'),
      remove('a'),
    ]);

    expect(stream.messages).toEqual([create('a'), remove('a')]);
  });

  it('keeps the same stream when nothing is appended', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [create('a')]);

    expect(appendToRendererStream(stream, [write('unknown')])).toBe(stream);
  });
});
