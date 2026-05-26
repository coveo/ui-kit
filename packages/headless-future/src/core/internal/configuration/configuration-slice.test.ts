/**
 * Configuration Slice Tests
 */

import {describe, it, expect} from 'vitest';
import {
  configurationSlice,
  initialConfigurationState,
} from './configuration-slice.js';

const localeDefaults = {
  trackingId: '',
  language: '',
  country: '',
  currency: '',
};

describe('configurationSlice: initialState', () => {
  it('should have correct initial state', () => {
    expect(initialConfigurationState).toEqual({
      organizationId: '',
      accessToken: '',
      ...localeDefaults,
      endpoint: undefined,
    });
  });
});

describe('configurationSlice: setOrganizationId', () => {
  it('should update organization ID', () => {
    const state = configurationSlice.reducer(
      initialConfigurationState,
      configurationSlice.actions.setOrganizationId('my-org-123')
    );

    expect(state.organizationId).toBe('my-org-123');
  });

  it('should not affect other fields', () => {
    const initialState = {
      organizationId: '',
      accessToken: 'existing-token',
      ...localeDefaults,
      endpoint: 'https://api.example.com',
    };

    const state = configurationSlice.reducer(
      initialState,
      configurationSlice.actions.setOrganizationId('new-org')
    );

    expect(state.organizationId).toBe('new-org');
    expect(state.accessToken).toBe('existing-token');
    expect(state.endpoint).toBe('https://api.example.com');
  });

  it('should accept empty string', () => {
    const state = configurationSlice.reducer(
      {...initialConfigurationState, organizationId: 'some-org'},
      configurationSlice.actions.setOrganizationId('')
    );

    expect(state.organizationId).toBe('');
  });

  it('should maintain state immutability', () => {
    const original = {...initialConfigurationState};
    configurationSlice.reducer(
      original,
      configurationSlice.actions.setOrganizationId('test')
    );

    expect(original.organizationId).toBe('');
  });
});

describe('configurationSlice: setAccessToken', () => {
  it('should update access token', () => {
    const state = configurationSlice.reducer(
      initialConfigurationState,
      configurationSlice.actions.setAccessToken('abc123token')
    );

    expect(state.accessToken).toBe('abc123token');
  });

  it('should not affect other fields', () => {
    const initialState = {
      organizationId: 'my-org',
      accessToken: '',
      ...localeDefaults,
      endpoint: 'https://api.example.com',
    };

    const state = configurationSlice.reducer(
      initialState,
      configurationSlice.actions.setAccessToken('new-token')
    );

    expect(state.accessToken).toBe('new-token');
    expect(state.organizationId).toBe('my-org');
    expect(state.endpoint).toBe('https://api.example.com');
  });

  it('should accept empty string', () => {
    const state = configurationSlice.reducer(
      {...initialConfigurationState, accessToken: 'old-token'},
      configurationSlice.actions.setAccessToken('')
    );

    expect(state.accessToken).toBe('');
  });
});

describe('configurationSlice: setEndpoint', () => {
  it('should set endpoint', () => {
    const state = configurationSlice.reducer(
      initialConfigurationState,
      configurationSlice.actions.setEndpoint('https://custom.api.com')
    );

    expect(state.endpoint).toBe('https://custom.api.com');
  });

  it('should accept undefined to clear endpoint', () => {
    const initialState = {
      ...initialConfigurationState,
      endpoint: 'https://api.example.com',
    };

    const state = configurationSlice.reducer(
      initialState,
      configurationSlice.actions.setEndpoint(undefined)
    );

    expect(state.endpoint).toBeUndefined();
  });

  it('should not affect other fields', () => {
    const initialState = {
      organizationId: 'my-org',
      accessToken: 'my-token',
      ...localeDefaults,
      endpoint: undefined,
    };

    const state = configurationSlice.reducer(
      initialState,
      configurationSlice.actions.setEndpoint('https://new.endpoint.com')
    );

    expect(state.endpoint).toBe('https://new.endpoint.com');
    expect(state.organizationId).toBe('my-org');
    expect(state.accessToken).toBe('my-token');
  });
});

describe('configurationSlice: setConfiguration', () => {
  it('should replace entire configuration', () => {
    const newConfig = {
      organizationId: 'new-org',
      accessToken: 'new-token',
      ...localeDefaults,
      endpoint: 'https://new.endpoint.com',
    };

    const state = configurationSlice.reducer(
      initialConfigurationState,
      configurationSlice.actions.setConfiguration(newConfig)
    );

    expect(state).toEqual(newConfig);
  });

  it('should overwrite all fields', () => {
    const initialState = {
      organizationId: 'old-org',
      accessToken: 'old-token',
      ...localeDefaults,
      endpoint: 'https://old.endpoint.com',
    };

    const newConfig = {
      organizationId: 'completely-new',
      accessToken: 'brand-new-token',
      ...localeDefaults,
      endpoint: undefined,
    };

    const state = configurationSlice.reducer(
      initialState,
      configurationSlice.actions.setConfiguration(newConfig)
    );

    expect(state).toEqual(newConfig);
  });

  it('should accept configuration without endpoint', () => {
    const newConfig = {
      organizationId: 'org-id',
      accessToken: 'token',
      ...localeDefaults,
      endpoint: undefined,
    };

    const state = configurationSlice.reducer(
      initialConfigurationState,
      configurationSlice.actions.setConfiguration(newConfig)
    );

    expect(state.endpoint).toBeUndefined();
  });

  it('should return new state object (not modify existing)', () => {
    const original = {...initialConfigurationState};
    const newConfig = {
      organizationId: 'new',
      accessToken: 'new',
      ...localeDefaults,
      endpoint: 'https://new.com',
    };

    const state = configurationSlice.reducer(
      original,
      configurationSlice.actions.setConfiguration(newConfig)
    );

    expect(state).toEqual(newConfig);
    expect(state).not.toBe(original);
  });
});

describe('configurationSlice: sequential updates', () => {
  it('should handle multiple field updates', () => {
    let state = initialConfigurationState;

    state = configurationSlice.reducer(
      state,
      configurationSlice.actions.setOrganizationId('my-org')
    );
    expect(state.organizationId).toBe('my-org');

    state = configurationSlice.reducer(
      state,
      configurationSlice.actions.setAccessToken('my-token')
    );
    expect(state.accessToken).toBe('my-token');
    expect(state.organizationId).toBe('my-org');

    state = configurationSlice.reducer(
      state,
      configurationSlice.actions.setEndpoint('https://api.example.com')
    );
    expect(state.endpoint).toBe('https://api.example.com');
    expect(state.organizationId).toBe('my-org');
    expect(state.accessToken).toBe('my-token');
  });
});

describe('configurationSlice: state immutability', () => {
  it('should not mutate original state for any action', () => {
    const original = {...initialConfigurationState};

    configurationSlice.reducer(
      original,
      configurationSlice.actions.setOrganizationId('test')
    );
    expect(original.organizationId).toBe('');

    configurationSlice.reducer(
      original,
      configurationSlice.actions.setAccessToken('token')
    );
    expect(original.accessToken).toBe('');

    configurationSlice.reducer(
      original,
      configurationSlice.actions.setEndpoint('https://api.com')
    );
    expect(original.endpoint).toBeUndefined();
  });
});
