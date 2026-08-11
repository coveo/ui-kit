import {describe, expect, it} from 'vitest';
import {resolveAgentRuntimeHeaders, resolveProxyTargets} from './vite.config.js';

describe('resolveProxyTargets', () => {
  it('does not configure a proxy without an organization ID', () => {
    expect(resolveProxyTargets(undefined, 'http://localhost:8980', 'dev')).toBeUndefined();
  });

  it('does not configure a proxy with a blank organization ID', () => {
    expect(resolveProxyTargets('  ', 'http://localhost:8980', 'dev')).toBeUndefined();
  });

  it('uses the organization platform endpoint by default', () => {
    expect(resolveProxyTargets('my-org', undefined, 'dev')).toEqual({
      agentGateway: 'https://my-org.orgdev.coveo.com',
      platform: 'https://my-org.orgdev.coveo.com',
    });
  });

  it('routes AG-UI requests to an explicit Agent Gateway endpoint', () => {
    expect(resolveProxyTargets('my-org', 'http://localhost:8980', 'dev')).toEqual({
      agentGateway: 'http://localhost:8980',
      platform: 'https://my-org.orgdev.coveo.com',
    });
  });

  it('uses the platform endpoint when the override is blank', () => {
    expect(resolveProxyTargets(' my-org ', '  ', 'dev')).toEqual({
      agentGateway: 'https://my-org.orgdev.coveo.com',
      platform: 'https://my-org.orgdev.coveo.com',
    });
  });
});

describe('resolveAgentRuntimeHeaders', () => {
  it('returns undefined without a runtime name', () => {
    expect(resolveAgentRuntimeHeaders('  ', 'qualifier')).toBeUndefined();
  });

  it('returns the runtime name header', () => {
    expect(resolveAgentRuntimeHeaders(' runtime ', undefined)).toEqual({
      'x-coveo-agent-runtime-name': 'runtime',
    });
  });

  it('returns runtime name and qualifier headers', () => {
    expect(resolveAgentRuntimeHeaders('runtime', ' qualifier ')).toEqual({
      'x-coveo-agent-runtime-name': 'runtime',
      'x-coveo-agent-runtime-qualifier': 'qualifier',
    });
  });
});
