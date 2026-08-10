import {describe, it, expect, vi} from 'vitest';
import {createUnifiedSearchFacadeResolver} from './unified-search-facade.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

const mockCreateThunk = vi.fn();

vi.mock('./unified-search-thunk.js', () => ({
  createUnifiedSearchEndpointThunk: (...args: unknown[]) => mockCreateThunk(...args),
}));

describe('createUnifiedSearchFacadeResolver', () => {
  it('returns a FacadeResolver function', () => {
    const generativeInterface = {} as InterfaceHandle;
    const cartInterface = {} as InterfaceHandle;

    const resolver = createUnifiedSearchFacadeResolver(
      generativeInterface,
      cartInterface,
      'surface-123'
    );

    expect(typeof resolver).toBe('function');
  });

  it('resolver produces an EndpointThunk when invoked with interface handle', () => {
    const generativeInterface = {} as InterfaceHandle;
    const cartInterface = {} as InterfaceHandle;
    const searchInterface = {} as InterfaceHandle;
    const fakeThunk = vi.fn();
    mockCreateThunk.mockReturnValue(fakeThunk);

    const resolver = createUnifiedSearchFacadeResolver(
      generativeInterface,
      cartInterface,
      'surface-456'
    );

    const thunk = resolver(searchInterface);

    expect(thunk).toBe(fakeThunk);
  });

  it('captures surfaceId and interface handles in closure', () => {
    const generativeInterface = {} as InterfaceHandle;
    const cartInterface = {} as InterfaceHandle;
    const searchInterface = {} as InterfaceHandle;
    mockCreateThunk.mockReturnValue(vi.fn());

    const resolver = createUnifiedSearchFacadeResolver(
      generativeInterface,
      cartInterface,
      'surface-789'
    );

    resolver(searchInterface);

    expect(mockCreateThunk).toHaveBeenCalledWith(
      searchInterface,
      generativeInterface,
      cartInterface,
      'surface-789'
    );
  });
});
