import {describe, expect, it} from 'vitest';
import {
  resolveAgentRuntimeHeaders,
  resolveGatewayProxyHeaders,
  resolveProxyTargets,
} from './vite.config.js';

describe('resolveProxyTargets', () => {
  it('does not configure a proxy without an organization ID', () => {
    expect(resolveProxyTargets(undefined, 'http://localhost:8980', 'dev')).toBeUndefined();
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
    expect(resolveProxyTargets('my-org', '', 'dev')).toEqual({
      agentGateway: 'https://my-org.orgdev.coveo.com',
      platform: 'https://my-org.orgdev.coveo.com',
    });
  });
});

describe('resolveAgentRuntimeHeaders', () => {
  it('does not override runtime routing without a runtime name', () => {
    expect(resolveAgentRuntimeHeaders(undefined, undefined)).toBeUndefined();
    expect(resolveAgentRuntimeHeaders(undefined, 'stable')).toBeUndefined();
  });

  it('forwards a configured runtime name without a qualifier', () => {
    expect(resolveAgentRuntimeHeaders(' commerce_pr_676_Agent ', undefined)).toEqual({
      'x-coveo-agent-runtime-name': 'commerce_pr_676_Agent',
    });
  });

  it('forwards the configured runtime name and qualifier when both are present', () => {
    expect(resolveAgentRuntimeHeaders(' commerce_pr_676_Agent ', ' stable ')).toEqual({
      'x-coveo-agent-runtime-name': 'commerce_pr_676_Agent',
      'x-coveo-agent-runtime-qualifier': 'stable',
    });
  });
});

describe('resolveGatewayProxyHeaders', () => {
  it('enables stateful commerce for local schema-contract development', () => {
    expect(resolveGatewayProxyHeaders(undefined, undefined)).toEqual({
      'X-Coveo-Feature-Flags-Overrides': '{"cpd-stateful-commerce-enabled":true}',
    });
  });

  it('combines the stateful override with configured runtime routing', () => {
    expect(resolveGatewayProxyHeaders('commerce-local', 'stable')).toEqual({
      'X-Coveo-Feature-Flags-Overrides': '{"cpd-stateful-commerce-enabled":true}',
      'x-coveo-agent-runtime-name': 'commerce-local',
      'x-coveo-agent-runtime-qualifier': 'stable',
    });
  });
});
