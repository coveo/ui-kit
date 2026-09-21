import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {convertV1ToV09, getA2UIMessages} from './surfaces.js';

describe('getA2UIMessages', () => {
  it('passes raw A2-UI operations through from multiple activities', () => {
    const operation1 = {version: 'v0.9', createSurface: {surfaceId: 'surface-1'}};
    const operation2 = {version: 'v0.9', createSurface: {surfaceId: 'surface-2'}};

    expect(
      getA2UIMessages([
        {
          id: 'activity-1',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [operation1]},
        },
        {
          id: 'activity-2',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [operation2]},
        },
      ])
    ).toEqual([operation1, operation2]);
  });

  it('honors per-activity-id replacement semantics', () => {
    const firstVersion = {version: 'v0.9', createSurface: {surfaceId: 'old'}};
    const updatedVersion = {version: 'v0.9', createSurface: {surfaceId: 'updated'}};

    expect(
      getA2UIMessages([
        {
          id: 'activity-1',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [firstVersion]},
        },
        {
          id: 'activity-1',
          kind: 'a2ui-surface',
          replace: true,
          payload: {a2ui_operations: [updatedVersion]},
        },
      ])
    ).toEqual([updatedVersion]);
  });

  it('converts v1.0 createSurface to v0.9, flattening props and preserving {path} bindings', () => {
    const result = getA2UIMessages([
      {
        id: 'activity-1',
        kind: 'a2ui-surface',
        replace: false,
        payload: {
          messages: [
            {
              version: 'v1.0',
              createSurface: {
                surfaceId: 'my-surface',
                components: [
                  {
                    id: 'root',
                    component: 'ProductCarousel',
                    props: {heading: {path: '/state/root/heading'}},
                  },
                ],
              },
            },
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

  it('ignores activities that are not a2ui-surface', () => {
    expect(
      getA2UIMessages([
        {
          id: 'activity-1',
          kind: 'text',
          replace: false,
          payload: {content: 'hello'},
        },
      ])
    ).toEqual([]);
  });
});

// Feature: a2ui-inline-state-data-model, Property 7: For any v1.0 createSurface + updateDataModel
// messages, convertV1ToV09 (a) preserves every A2-UI Data_Binding object `{ "path": ... }` in each
// node's props byte-for-byte on the flattened v0.9 node; (b) preserves the single `id`/`component`
// identity and introduces NO `componentId`/`componentType` anywhere; (c) rewrites the single node
// matching a declared rootId (other than "root") — and every children[]/child reference to it — to
// "root", performing no rewrite when rootId is absent/duplicate/none, without throwing; and (d)
// passes each updateDataModel op through carrying `{ surfaceId, path, value }` unchanged (version
// bumped to v0.9).
describe('convertV1ToV09 preserves {path} bindings and single identity (Property 7)', () => {
  const RENDERER_ROOT_ID = 'root';

  interface GeneratedNode {
    id: string;
    // A map of prop name -> JSON Pointer path, expressed as `{ path }` bindings.
    boundProps: Record<string, string>;
    children?: string[];
    child?: string;
  }

  type RootIdKind = 'matching' | 'absent' | 'duplicate' | 'none';

  function extractV09Components(
    converted: Array<Record<string, unknown>>
  ): Array<Record<string, unknown>> {
    const updateMessage = converted.find((message) => 'updateComponents' in message);
    if (!updateMessage) {
      return [];
    }
    const updateComponents = updateMessage['updateComponents'] as Record<string, unknown>;
    return (updateComponents['components'] as Array<Record<string, unknown>>) ?? [];
  }

  function buildMessage(
    nodes: GeneratedNode[],
    rootId: string | undefined
  ): Record<string, unknown> {
    const components = nodes.map((node) => {
      const {id, boundProps, children, child} = node;
      const props: Record<string, unknown> = {};
      for (const [key, path] of Object.entries(boundProps)) {
        props[key] = {path};
      }
      const comp: Record<string, unknown> = {id, component: 'SomeComponent', props};
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
      createSurface: {
        surfaceId: 'surface-under-test',
        ...(rootId !== undefined ? {rootId} : {}),
        components,
      },
    };
  }

  const scenarioArb = fc
    .uniqueArray(
      fc.string({minLength: 1, maxLength: 6}).filter((s) => s !== RENDERER_ROOT_ID),
      {minLength: 1, maxLength: 6}
    )
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
        rootKind: fc.constantFrom<RootIdKind>('matching', 'absent', 'duplicate', 'none'),
      })
    )
    .map(({ids, boundPropsPerNode, childrenPerNode, childPerNode, rootKind}) => {
      const baseNodes: GeneratedNode[] = ids.map((id, index) => ({
        id,
        boundProps: boundPropsPerNode[index],
        children: childrenPerNode[index],
        child: childPerNode[index],
      }));

      let nodes = baseNodes;
      let rootId: string | undefined;

      switch (rootKind) {
        case 'matching':
          rootId = ids[0];
          break;
        case 'absent':
          rootId = 'absent-root-id-that-matches-nothing';
          break;
        case 'duplicate': {
          rootId = ids[0];
          nodes = [...baseNodes, {id: ids[0], boundProps: {}}];
          break;
        }
        case 'none':
          rootId = undefined;
          break;
      }

      return {nodes, rootId, rootKind};
    });

  it('preserves {path} bindings and identity, rewrites only the declared root', () => {
    fc.assert(
      fc.property(scenarioArb, ({nodes, rootId, rootKind}) => {
        const message = buildMessage(nodes, rootId);

        // (c) conversion never throws.
        const converted = convertV1ToV09(message);
        const output = extractV09Components(converted);

        expect(output).toHaveLength(nodes.length);

        const shouldResolve = rootKind === 'matching';

        output.forEach((outNode, index) => {
          const source = nodes[index];

          // (a) every `{ path }` binding survives byte-for-byte on the flattened node.
          for (const [key, path] of Object.entries(source.boundProps)) {
            expect(outNode[key]).toEqual({path});
          }

          // (b) single identity preserved; no identity correlation introduced anywhere.
          expect(outNode['component']).toBe('SomeComponent');
          expect('componentId' in outNode).toBe(false);
          expect('componentType' in outNode).toBe(false);

          const idWasRewritten = shouldResolve && source.id === rootId;
          expect(outNode['id']).toBe(idWasRewritten ? RENDERER_ROOT_ID : source.id);

          if (source.children === undefined) {
            expect('children' in outNode).toBe(false);
          } else {
            const expectedChildren = shouldResolve
              ? source.children.map((c) => (c === rootId ? RENDERER_ROOT_ID : c))
              : source.children;
            expect(outNode['children']).toEqual(expectedChildren);
          }

          if (source.child === undefined) {
            expect('child' in outNode).toBe(false);
          } else {
            const expectedChild =
              shouldResolve && source.child === rootId ? RENDERER_ROOT_ID : source.child;
            expect(outNode['child']).toBe(expectedChild);
          }
        });

        // Whole-output guard: no identity-correlation key leaks anywhere in the conversion.
        expect(JSON.stringify(converted)).not.toContain('componentId');
        expect(JSON.stringify(converted)).not.toContain('componentType');
      }),
      {numRuns: 200}
    );
  });

  // Feature: a2ui-inline-state-data-model, Property 7 (updateDataModel pass-through): every
  // v1.0 updateDataModel op is passed through as a v0.9 op carrying its { surfaceId, path,
  // value } unchanged.
  it('passes updateDataModel ops through unchanged (version bumped to v0.9)', () => {
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
        const message = {version: 'v1.0', updateDataModel: {surfaceId, path, value}};
        const converted = convertV1ToV09(message);

        expect(converted).toHaveLength(1);
        expect(converted[0]).toEqual({version: 'v0.9', updateDataModel: {surfaceId, path, value}});
      }),
      {numRuns: 150}
    );
  });
});

// Feature: a2ui-inline-state-data-model, Property 13: an unconvertible v1.0 message (one that
// carries no recognized operation) leaves the renderer state unchanged — getA2UIMessages emits
// no v0.9 message for it, so the surface stream (and thus rendered state) is unaffected.
describe('unconvertible messages are rejected, leaving renderer state unchanged (Property 13)', () => {
  const KNOWN_OPS = ['createSurface', 'updateDataModel', 'updateComponents', 'deleteSurface'];

  // A v1.0 message whose single top-level key is NOT a recognized operation. Object
  // prototype keys (e.g. `toString`) are excluded so `Object.hasOwn` checks stay meaningful.
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

  it('emits nothing for an unconvertible v1.0 message so prior renderer state is retained', () => {
    fc.assert(
      fc.property(unconvertibleArb, ({key, payload}) => {
        const message = {version: 'v1.0', [key]: payload};

        // Feed a valid createSurface first (the "prior state"), then the unconvertible one:
        // only the valid message reaches the renderer stream; the unconvertible one adds
        // nothing, so it cannot mutate the previously rendered surface.
        const validCreate = {
          version: 'v1.0',
          createSurface: {surfaceId: 'surface-prior', components: [{id: 'root', component: 'X'}]},
        };

        const result = getA2UIMessages([
          {
            id: 'activity-1',
            kind: 'a2ui-surface',
            replace: false,
            payload: {messages: [validCreate, message]},
          },
        ]);

        // The unconvertible message contributes no createSurface/updateComponents/etc.
        const emittedFromUnconvertible = result.filter((m) =>
          Object.hasOwn(m as Record<string, unknown>, key)
        );
        expect(emittedFromUnconvertible).toHaveLength(0);

        // The prior valid surface is still present and unchanged.
        const createSurfaces = result.filter((m) =>
          Object.hasOwn(m as Record<string, unknown>, 'createSurface')
        );
        expect(createSurfaces).toHaveLength(1);
      }),
      {numRuns: 150}
    );
  });
});
