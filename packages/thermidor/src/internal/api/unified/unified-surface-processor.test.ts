import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {GenerativeStatePort} from '@/src/internal/api/generative/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

const {mockHydrateFromCreateSurface, mockApplyDataModelUpdate} = vi.hoisted(() => ({
  mockHydrateFromCreateSurface: vi.fn(),
  mockApplyDataModelUpdate: vi.fn(),
}));

vi.mock('./unified-surface-hydration.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./unified-surface-hydration.js')>();
  return {
    ...actual,
    hydrateFromCreateSurface: mockHydrateFromCreateSurface,
    applyDataModelUpdate: mockApplyDataModelUpdate,
  };
});

import {applyDataModelPatch, createSurfaceProcessor} from './unified-surface-processor.js';

function createMockInterface(): InterfaceHandle {
  return {disposed: false, dispose: vi.fn()} as InterfaceHandle;
}

function createDeps() {
  const statePort = {
    setRoutedInterface: vi.fn(),
    clearRoutedInterface: vi.fn(),
  } as unknown as GenerativeStatePort;
  return {
    deps: {
      engine: {} as FullEngine,
      statePort,
      generativeInterface: createMockInterface(),
      cartInterface: createMockInterface(),
    },
    statePort,
  };
}

function snapshot(messages: unknown[]) {
  return {messages};
}

const searchRoot = [{id: 'root', component: 'ProductSearchSurface'}];
const listingRoot = [{id: 'root', component: 'ProductListingSurface'}];

describe('createSurfaceProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hydrates when updateComponents completes a model-only createSurface', () => {
    const {deps, statePort} = createDeps();
    const iface = createMockInterface();
    mockHydrateFromCreateSurface.mockReturnValue({
      surfaceId: 's1',
      useCase: 'commerceSearch',
      interface: iface,
      snapshot: {products: []},
      query: undefined,
    });
    const processor = createSurfaceProcessor(deps);

    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', createSurface: {surfaceId: 's1', dataModel: {products: []}}}])
    );
    expect(mockHydrateFromCreateSurface).not.toHaveBeenCalled();

    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', updateComponents: {surfaceId: 's1', components: searchRoot}}])
    );

    expect(mockHydrateFromCreateSurface).toHaveBeenCalledWith(
      deps.engine,
      expect.objectContaining({surfaceId: 's1', components: searchRoot, dataModel: {products: []}}),
      deps.generativeInterface,
      deps.cartInterface
    );
    expect(statePort.setRoutedInterface).toHaveBeenCalledOnce();
  });

  it('hydrates when updateDataModel completes a component-only createSurface', () => {
    const {deps} = createDeps();
    mockHydrateFromCreateSurface.mockReturnValue({
      surfaceId: 's1',
      useCase: 'commerceSearch',
      interface: createMockInterface(),
      snapshot: {products: ['p1']},
      query: undefined,
    });
    const processor = createSurfaceProcessor(deps);

    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', createSurface: {surfaceId: 's1', components: searchRoot}}])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([
        {
          version: 'v1.0',
          updateDataModel: {surfaceId: 's1', path: '/', value: {products: ['p1']}},
        },
      ])
    );

    expect(mockHydrateFromCreateSurface).toHaveBeenCalledWith(
      deps.engine,
      expect.objectContaining({dataModel: {products: ['p1']}, components: searchRoot}),
      deps.generativeInterface,
      deps.cartInterface
    );
  });

  it('ignores updates for surfaces that have not been created', () => {
    const {deps} = createDeps();
    const processor = createSurfaceProcessor(deps);

    processor.processSnapshot(
      'turn-1',
      snapshot([
        {
          version: 'v1.0',
          updateDataModel: {surfaceId: 's1', path: '/', value: {products: ['stale']}},
        },
        {version: 'v1.0', updateComponents: {surfaceId: 's1', components: searchRoot}},
      ])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', createSurface: {surfaceId: 's1', components: searchRoot}}])
    );

    expect(mockHydrateFromCreateSurface).not.toHaveBeenCalled();
  });

  it('warns and preserves pending state for a duplicate createSurface', () => {
    const {deps} = createDeps();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockHydrateFromCreateSurface.mockReturnValue({
      surfaceId: 's1',
      useCase: 'commerceSearch',
      interface: createMockInterface(),
      snapshot: {products: ['fresh']},
      query: undefined,
    });
    const processor = createSurfaceProcessor(deps);

    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', createSurface: {surfaceId: 's1', components: searchRoot}}])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 's1',
            components: listingRoot,
            dataModel: {products: ['stale']},
          },
        },
      ])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([
        {
          version: 'v1.0',
          updateDataModel: {surfaceId: 's1', path: '/', value: {products: ['fresh']}},
        },
      ])
    );

    expect(warn).toHaveBeenCalledWith(
      'Ignoring duplicate A2UI createSurface for existing surfaceId "s1".'
    );
    expect(mockHydrateFromCreateSurface).toHaveBeenCalledWith(
      deps.engine,
      expect.objectContaining({components: searchRoot, dataModel: {products: ['fresh']}}),
      deps.generativeInterface,
      deps.cartInterface
    );
    warn.mockRestore();
  });

  it('recreates a live interface when updateComponents changes the stateful root', () => {
    const {deps, statePort} = createDeps();
    const searchInterface = createMockInterface();
    const listingInterface = createMockInterface();
    mockHydrateFromCreateSurface
      .mockReturnValueOnce({
        surfaceId: 's1',
        useCase: 'commerceSearch',
        interface: searchInterface,
        snapshot: {products: []},
        query: undefined,
      })
      .mockReturnValueOnce({
        surfaceId: 's1',
        useCase: 'commerceSearch',
        interface: listingInterface,
        snapshot: {products: []},
        query: undefined,
      });
    const processor = createSurfaceProcessor(deps);

    processor.processSnapshot(
      'turn-1',
      snapshot([
        {
          version: 'v1.0',
          createSurface: {surfaceId: 's1', components: searchRoot, dataModel: {products: []}},
        },
      ])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', updateComponents: {surfaceId: 's1', components: listingRoot}}])
    );

    expect(searchInterface.dispose).toHaveBeenCalledOnce();
    expect(statePort.clearRoutedInterface).toHaveBeenCalledWith('turn-1', 's1');
    expect(mockHydrateFromCreateSurface).toHaveBeenCalledTimes(2);
  });

  it('deletes pending state so a later createSurface starts fresh', () => {
    const {deps} = createDeps();
    mockHydrateFromCreateSurface.mockReturnValue({
      surfaceId: 's1',
      useCase: 'commerceSearch',
      interface: createMockInterface(),
      snapshot: {products: ['fresh']},
      query: undefined,
    });
    const processor = createSurfaceProcessor(deps);

    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', createSurface: {surfaceId: 's1', components: searchRoot}}])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([{version: 'v1.0', deleteSurface: {surfaceId: 's1'}}])
    );
    processor.processSnapshot(
      'turn-1',
      snapshot([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 's1',
            components: searchRoot,
            dataModel: {products: ['fresh']},
          },
        },
      ])
    );

    expect(mockHydrateFromCreateSurface).toHaveBeenCalledOnce();
    expect(mockHydrateFromCreateSurface).toHaveBeenCalledWith(
      deps.engine,
      expect.objectContaining({dataModel: {products: ['fresh']}}),
      deps.generativeInterface,
      deps.cartInterface
    );
  });
});

describe('applyDataModelPatch', () => {
  it('applies nested JSON Pointer updates and explicit null deletions immutably', () => {
    const initial = {query: {text: 'old', locale: 'en'}, products: ['p1', 'p2']};
    const updated = applyDataModelPatch(initial, '/query/text', 'new');
    const deleted = applyDataModelPatch(updated, '/products/0', null);

    expect(updated).toEqual({query: {text: 'new', locale: 'en'}, products: ['p1', 'p2']});
    expect(deleted).toEqual({query: {text: 'new', locale: 'en'}, products: ['p2']});
    expect(initial).toEqual({query: {text: 'old', locale: 'en'}, products: ['p1', 'p2']});
  });
});
