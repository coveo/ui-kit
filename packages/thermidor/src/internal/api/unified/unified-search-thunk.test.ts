import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createUnifiedSearchEndpointThunk} from './unified-search-thunk.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

const mockCall = vi.fn();
const mockBuildRequest = vi.fn();
const mockHandleResponse = vi.fn();

vi.mock('./unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: () => ({call: mockCall}),
}));

vi.mock('./unified-search-request-builder.js', () => ({
  createUnifiedSearchRequestBuilder: () => mockBuildRequest,
}));

vi.mock('./unified-search-response-handler.js', () => ({
  createUnifiedSearchResponseHandler: () => mockHandleResponse,
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getEndpointClientConfiguration: (state: any) =>
      state.__config ?? {organizationId: 'org-1', accessToken: 'token-1'},
  }),
}));

vi.mock('@/src/internal/api/commerce-search/commerce-search-thunk-slice.js', () => ({
  getOrCreateCommerceSearchEndpointSlice: () => ({
    name: 'mock/commerceSearchEndpoint',
    reducer: () => ({}),
  }),
}));

const mockAdoptSlice = vi.fn();

vi.mock('@/src/internal/utils/index.js', () => ({
  getInterfaceInternals: () => ({
    engine: {adoptSlice: mockAdoptSlice},
    stateId: 'test-interface',
    cacheRegistry: {getOrCreate: (_key: any, factory: any) => factory()},
  }),
  generateId: () => 'generated-id',
}));

function createMockEngine(state: Record<string, any> = {}): FullEngine {
  return {
    read: (selector: any) => selector(state),
    mutate: vi.fn(),
    adoptSlice: vi.fn(),
    getNavigatorContextProvider: () => () => ({
      clientId: 'client-abc',
      location: 'https://example.com',
      referrer: 'https://google.com',
      userAgent: 'test-agent',
    }),
  } as unknown as FullEngine;
}

function createInterfaceHandle(): InterfaceHandle {
  return {disposed: false, dispose: vi.fn()};
}

describe('createUnifiedSearchEndpointThunk', () => {
  const iface = createInterfaceHandle();
  const generativeInterface = createInterfaceHandle();
  const cartInterface = createInterfaceHandle();

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildRequest.mockReturnValue({agentInput: {action: {name: 'test'}}});
    mockHandleResponse.mockResolvedValue(undefined);
  });

  it('throws if actionIntent is not provided', async () => {
    const engine = createMockEngine();
    const thunk = createUnifiedSearchEndpointThunk(
      iface,
      generativeInterface,
      cartInterface,
      'surface-1'
    );

    const action = thunk({engine} as any);
    const result = await action(vi.fn(), () => ({}), undefined);

    expect((result as any).error.message).toBe('Unified search thunk requires an actionIntent');
  });

  it('calls buildRequest with engine and actionIntent', async () => {
    mockCall.mockResolvedValue({success: true, data: {stream: 'mock-stream'}});
    const engine = createMockEngine();
    const actionIntent = {name: 'select_page' as const, context: {page: 2}};

    const thunk = createUnifiedSearchEndpointThunk(
      iface,
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const action = thunk({engine, actionIntent});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockBuildRequest).toHaveBeenCalledWith(engine, actionIntent);
  });

  it('passes built request and config to the endpoint client', async () => {
    const mockRequest = {agentInput: {action: {name: 'select_page'}}};
    mockBuildRequest.mockReturnValue(mockRequest);
    mockCall.mockResolvedValue({success: true, data: {stream: 'mock-stream'}});
    const engine = createMockEngine();

    const thunk = createUnifiedSearchEndpointThunk(
      iface,
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const action = thunk({
      engine,
      actionIntent: {name: 'select_page', context: {page: 1}},
    });
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      mockRequest,
      expect.objectContaining({organizationId: 'org-1', accessToken: 'token-1'})
    );
  });

  it('throws on client failure', async () => {
    mockCall.mockResolvedValue({success: false, error: 'Unified call failed'});
    const engine = createMockEngine();

    const thunk = createUnifiedSearchEndpointThunk(
      iface,
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const action = thunk({
      engine,
      actionIntent: {name: 'select_page', context: {page: 1}},
    });
    const result = await action(vi.fn(), () => ({}), undefined);

    expect((result as any).error.message).toBe('Unified call failed');
  });

  it('calls handleResponse with engine and stream on success', async () => {
    const mockStream = {mock: 'stream'};
    mockCall.mockResolvedValue({success: true, data: {stream: mockStream}});
    const engine = createMockEngine();

    const thunk = createUnifiedSearchEndpointThunk(
      iface,
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const action = thunk({
      engine,
      actionIntent: {name: 'select_page', context: {page: 1}},
    });
    await action(vi.fn(), () => ({}), undefined);

    expect(mockHandleResponse).toHaveBeenCalledWith(engine, mockStream);
  });

  it('does not call handleResponse on client failure', async () => {
    mockCall.mockResolvedValue({success: false, error: 'fail'});
    const engine = createMockEngine();

    const thunk = createUnifiedSearchEndpointThunk(
      iface,
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const action = thunk({
      engine,
      actionIntent: {name: 'select_page', context: {page: 1}},
    });
    await action(vi.fn(), () => ({}), undefined);

    expect(mockHandleResponse).not.toHaveBeenCalled();
  });

  it('registers thunk slice', () => {
    createUnifiedSearchEndpointThunk(iface, generativeInterface, cartInterface, 'surface-1');
    expect(mockAdoptSlice).toHaveBeenCalled();
  });
});
