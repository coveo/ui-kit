import {describe, expect, it} from 'vitest';
import {z} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {
  EMPTY_UNRECORDED_STATE,
  acceptUnrecordedWrites,
  applyUnrecordedWrites,
  overlayUnrecordedState,
  releaseUnrecordedState,
  type UnrecordedState,
} from './session-state.js';
import type {Activity} from './types.js';

const contracts = z.discriminatedUnion('component', [
  z.strictObject({
    component: z.literal('InstantProducts'),
    state: z.strictObject({query: z.string(), products: z.array(z.string())}).optional(),
  }),
  z.strictObject({component: z.literal('CommerceSearch'), state: z.strictObject({}).optional()}),
]) as unknown as ContractsSchema;

const activities: Activity[] = [
  {
    id: 'shell-activity',
    kind: 'a2ui-surface',
    replace: true,
    payload: {
      messages: [
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 'shell',
            catalogId: 'commerce',
            components: [
              {id: 'root', component: 'CommerceSearch'},
              {id: 'products', component: 'InstantProducts'},
            ],
          },
        },
      ],
    },
  },
];

const boots = {query: 'boots', products: ['boots 1']};

function update(path: string, value: unknown, surfaceId = 'shell') {
  return {version: 'v1.0', updateDataModel: {surfaceId, path, value}};
}

function layer(entries: Record<string, Record<string, unknown>>): UnrecordedState {
  return new Map(
    Object.entries(entries).map(([surfaceId, writes]) => [
      surfaceId,
      new Map(Object.entries(writes)),
    ])
  );
}

describe('acceptUnrecordedWrites', () => {
  it('keeps the data model updates of known nodes that their contract accepts', () => {
    const accepted = update('/state/products', boots);

    expect(acceptUnrecordedWrites([accepted], activities, contracts)).toEqual({
      messages: [accepted],
      writes: [{surfaceId: 'shell', path: '/state/products', value: boots}],
    });
  });

  it('leaves out any other message', () => {
    const messages = [
      {version: 'v1.0', createSurface: {surfaceId: 'other', components: []}},
      {
        version: 'v1.0',
        updateComponents: {surfaceId: 'shell', components: [{id: 'ghost', component: 'Text'}]},
      },
      update('/state/ghost', {}),
      update('/state/products', 'not products'),
    ];

    expect(acceptUnrecordedWrites(messages, activities, contracts)).toEqual({
      messages: [],
      writes: [],
    });
  });
});

describe('applyUnrecordedWrites', () => {
  it('adds the writes, each replacing the values at and under its path', () => {
    const before = layer({shell: {'/state/products/query': 'old', '/state/root': {}}});

    expect(
      applyUnrecordedWrites(before, [{surfaceId: 'shell', path: '/state/products', value: boots}])
    ).toEqual(layer({shell: {'/state/root': {}, '/state/products': boots}}));
    expect(before).toEqual(layer({shell: {'/state/products/query': 'old', '/state/root': {}}}));
  });

  it('returns the same layer when there is nothing to write', () => {
    const before = layer({shell: {'/state/products': boots}});

    expect(applyUnrecordedWrites(before, [])).toBe(before);
  });
});

describe('releaseUnrecordedState', () => {
  const before = layer({shell: {'/state/products': boots, '/state/root': {}}});

  function release(messages: unknown[]) {
    return releaseUnrecordedState(before, activities, {messages}, contracts);
  }

  it('drops the values at or under a path a recorded write sets', () => {
    expect(release([update('/state/products', boots)])).toEqual(
      layer({shell: {'/state/root': {}}})
    );
    expect(
      releaseUnrecordedState(
        layer({shell: {'/state/products/query': 'boots'}}),
        activities,
        {messages: [update('/state/products', boots)]},
        contracts
      )
    ).toEqual(new Map());
  });

  it('writes a recorded write under a value into that value, keeping its other fields', () => {
    expect(release([update('/state/products/query', 'jackets')])).toEqual(
      layer({shell: {'/state/products': {...boots, query: 'jackets'}, '/state/root': {}}})
    );
  });

  it('shows the state the renderer reaches by applying the writes in order', () => {
    const recorded = {shell: {state: {root: {}, products: {query: 'jackets', products: []}}}};

    const released = release([update('/state/products/query', 'jackets')]);

    expect(overlayUnrecordedState(recorded, released)).toEqual({
      shell: {state: {root: {}, products: {query: 'jackets', products: ['boots 1']}}},
    });
  });

  it('drops the surfaces a recorded activity creates or deletes', () => {
    expect(release([{version: 'v1.0', deleteSurface: {surfaceId: 'shell'}}])).toEqual(new Map());
  });

  it('returns the same layer when a recorded write leaves it be', () => {
    expect(release([update('/state/products', boots, 'other')])).toBe(before);
    expect(
      releaseUnrecordedState(EMPTY_UNRECORDED_STATE, activities, {messages: []}, contracts)
    ).toBe(EMPTY_UNRECORDED_STATE);
  });
});

describe('overlayUnrecordedState', () => {
  it('writes the layer on top of the recorded state', () => {
    const state = {shell: {state: {root: {}, products: {query: '', products: []}}}};

    expect(overlayUnrecordedState(state, layer({shell: {'/state/products': boots}}))).toEqual({
      shell: {state: {root: {}, products: boots}},
    });
    expect(state.shell.state.products).toEqual({query: '', products: []});
  });

  it('returns the recorded state when the layer is empty', () => {
    const state = {shell: {state: {}}};

    expect(overlayUnrecordedState(state, EMPTY_UNRECORDED_STATE)).toBe(state);
  });
});
