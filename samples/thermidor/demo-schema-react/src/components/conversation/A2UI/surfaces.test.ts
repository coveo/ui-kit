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

  it('converts v1.0 messages to v0.9 format', () => {
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
                components: [{id: 'root', component: 'ProductCarousel', props: {controllers: {}}}],
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
        components: [{id: 'root', component: 'ProductCarousel', controllers: {}}],
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

// Feature: thermidor-commerce-search-composition, Property 1: For any v1.0 createSurface
// message, convertV1ToV09 (a) rewrites the single node matching a declared rootId (other
// than "root") — and every children[]/child reference to it — to "root"; (b) performs no
// rewrite and synthesizes no "root" node when rootId is absent or matches zero or more
// than one node, completing without throwing; and (c) preserves each node's
// props.componentId/componentType and its children/child fields (including their absence),
// except for the single root-id rename in case (a).
describe('convertV1ToV09 root mapping (Property 1)', () => {
  const RENDERER_ROOT_ID = 'root';

  interface GeneratedNode {
    id: string;
    componentId: string;
    componentType: string;
    children?: string[];
    child?: string;
  }

  type RootIdKind = 'matching' | 'absent' | 'duplicate' | 'none';

  /** Extracts the flattened v0.9 component nodes from a converted createSurface message. */
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

  /** Builds the v1.0 createSurface message from generated nodes and a root id. */
  function buildMessage(
    nodes: GeneratedNode[],
    rootId: string | undefined
  ): Record<string, unknown> {
    const components = nodes.map((node) => {
      const {id, componentId, componentType, children, child} = node;
      const comp: Record<string, unknown> = {
        id,
        component: 'SomeComponent',
        props: {componentId, componentType},
      };
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

  // Generates 1..6 nodes with unique ids never equal to "root", each with optional
  // children (drawn from the node ids) and an optional child, plus a root-id selection
  // mode covering the matching, absent, duplicate, and no-rootId cases.
  const scenarioArb = fc
    .uniqueArray(
      fc.string({minLength: 1, maxLength: 6}).filter((s) => s !== RENDERER_ROOT_ID),
      {minLength: 1, maxLength: 6}
    )
    .chain((ids) =>
      fc.record({
        ids: fc.constant(ids),
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
    .map(({ids, childrenPerNode, childPerNode, rootKind}) => {
      const baseNodes: GeneratedNode[] = ids.map((id, index) => ({
        id,
        componentId: `cid-${id}`,
        componentType: `type-${id}`,
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
          // A root id that cannot match any node id (all ids are <= 6 chars).
          rootId = 'absent-root-id-that-matches-nothing';
          break;
        case 'duplicate': {
          // Duplicate the first node so its id matches two nodes.
          rootId = ids[0];
          const dup: GeneratedNode = {
            id: ids[0],
            componentId: `cid-dup-${ids[0]}`,
            componentType: `type-dup-${ids[0]}`,
          };
          nodes = [...baseNodes, dup];
          break;
        }
        case 'none':
          rootId = undefined;
          break;
      }

      return {nodes, rootId, rootKind};
    });

  it('resolves, preserves identity, and tolerates the no-match cases', () => {
    fc.assert(
      fc.property(scenarioArb, ({nodes, rootId, rootKind}) => {
        const message = buildMessage(nodes, rootId);

        // (b) conversion never throws.
        const converted = convertV1ToV09(message);
        const output = extractV09Components(converted);

        expect(output).toHaveLength(nodes.length);

        const shouldResolve = rootKind === 'matching';
        const rootNodes = output.filter((node) => node['id'] === RENDERER_ROOT_ID);

        if (shouldResolve) {
          // (a) exactly one node has id "root", and it is the node that had rootId.
          expect(rootNodes).toHaveLength(1);
          const originalRootIndex = nodes.findIndex((node) => node.id === rootId);
          expect(output[originalRootIndex]['id']).toBe(RENDERER_ROOT_ID);
        } else {
          // (b) no rewrite, no synthesized "root" node.
          const originalRootCount = nodes.filter((node) => node.id === RENDERER_ROOT_ID).length;
          expect(rootNodes).toHaveLength(originalRootCount);
        }

        // (a)/(c) per-node assertions.
        output.forEach((outNode, index) => {
          const source = nodes[index];

          // (c) props survive unchanged.
          expect(outNode['componentId']).toBe(source.componentId);
          expect(outNode['componentType']).toBe(source.componentType);

          const idWasRewritten = shouldResolve && source.id === rootId;
          expect(outNode['id']).toBe(idWasRewritten ? RENDERER_ROOT_ID : source.id);

          // (c) children absence is preserved; presence is preserved with only the
          // root-id references rewritten.
          if (source.children === undefined) {
            expect('children' in outNode).toBe(false);
          } else {
            const expectedChildren = shouldResolve
              ? source.children.map((c) => (c === rootId ? RENDERER_ROOT_ID : c))
              : source.children;
            expect(outNode['children']).toEqual(expectedChildren);
          }

          // (c) child absence/presence preserved with only the root-id reference rewritten.
          if (source.child === undefined) {
            expect('child' in outNode).toBe(false);
          } else {
            const expectedChild =
              shouldResolve && source.child === rootId ? RENDERER_ROOT_ID : source.child;
            expect(outNode['child']).toBe(expectedChild);
          }
        });
      }),
      {numRuns: 200}
    );
  });
});
