import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as configurationMutations from './configuration-mutators.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

describe('configurationMutations', () => {
  let engine: Engine;
  let mutateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateSpy = vi.fn();
    engine = {
      mutate: mutateSpy,
    } as unknown as Engine;
  });

  it('setOrganizationId() should call engine.mutate with setOrganizationId action', () => {
    configurationMutations.setOrganizationId(engine, 'my-org-123');

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      configurationSlice.actions.setOrganizationId('my-org-123')
    );
  });

  it('setAccessToken() should call engine.mutate with setAccessToken action', () => {
    configurationMutations.setAccessToken(engine, 'abc123token');

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      configurationSlice.actions.setAccessToken('abc123token')
    );
  });

  it('setEndpoint() should call engine.mutate with setEndpoint action', () => {
    configurationMutations.setEndpoint(engine, 'https://custom.api.com');

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      configurationSlice.actions.setEndpoint('https://custom.api.com')
    );
  });

  it('setConfiguration() should call engine.mutate with setConfiguration action', () => {
    const config = {
      organizationId: 'my-org',
      accessToken: 'my-token',
      endpoint: 'https://custom.api.com',
    };

    configurationMutations.setConfiguration(engine, config);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      configurationSlice.actions.setConfiguration(config)
    );
  });
});
