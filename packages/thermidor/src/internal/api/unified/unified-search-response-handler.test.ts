import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createUnifiedSearchResponseHandler} from './unified-search-response-handler.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

const mockExtract = vi.fn();
const mockApplyUpdate = vi.fn();

vi.mock('./unified-stream-extractor.js', () => ({
  extractUpdateDataModelOperationsFromStream: (...args: any[]) => mockExtract(...args),
}));

vi.mock('./unified-surface-hydration.js', () => ({
  applyDataModelUpdate: (...args: any[]) => mockApplyUpdate(...args),
}));

function createMockEngine(): FullEngine {
  return {
    read: vi.fn(),
    mutate: vi.fn(),
    adoptSlice: vi.fn(),
    getNavigatorContextProvider: () => undefined,
  } as unknown as FullEngine;
}

describe('createUnifiedSearchResponseHandler', () => {
  const iface: InterfaceHandle = {disposed: false, dispose: vi.fn()};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts updates from stream', async () => {
    mockExtract.mockResolvedValue([]);
    const handleResponse = createUnifiedSearchResponseHandler(iface);
    const engine = createMockEngine();
    const stream = {} as ReadableStream<Uint8Array>;

    await handleResponse(engine, stream);

    expect(mockExtract).toHaveBeenCalledWith(stream);
  });

  it('applies each update in order', async () => {
    const updates = [
      {path: '/products', value: [{id: '1'}]},
      {path: '/pagination', value: {page: 2}},
    ];
    mockExtract.mockResolvedValue(updates);
    const handleResponse = createUnifiedSearchResponseHandler(iface);
    const engine = createMockEngine();
    const stream = {} as ReadableStream<Uint8Array>;

    await handleResponse(engine, stream);

    expect(mockApplyUpdate).toHaveBeenCalledTimes(2);
    expect(mockApplyUpdate).toHaveBeenNthCalledWith(1, engine, iface, '/products', [{id: '1'}]);
    expect(mockApplyUpdate).toHaveBeenNthCalledWith(2, engine, iface, '/pagination', {page: 2});
  });

  it('does not call applyDataModelUpdate when no updates', async () => {
    mockExtract.mockResolvedValue([]);
    const handleResponse = createUnifiedSearchResponseHandler(iface);
    const engine = createMockEngine();
    const stream = {} as ReadableStream<Uint8Array>;

    await handleResponse(engine, stream);

    expect(mockApplyUpdate).not.toHaveBeenCalled();
  });

  it('propagates extraction errors', async () => {
    mockExtract.mockRejectedValue(new Error('stream failed'));
    const handleResponse = createUnifiedSearchResponseHandler(iface);
    const engine = createMockEngine();
    const stream = {} as ReadableStream<Uint8Array>;

    await expect(handleResponse(engine, stream)).rejects.toThrow('stream failed');
  });
});
