/**
 * Type test for the `@coveo/thermidor/private` entry (for internal Coveo use only).
 */
import {expectTypeOf, test} from 'vitest';
import type {
  ContractsSchema,
  NavigatorContextProvider,
  Session,
  SessionConfig,
} from '@/src/index.js';
import {createPrivateSession} from '@/src/private.js';
import type {PrivateSessionConfig} from '@/src/private.js';

declare const contracts: ContractsSchema;

test('exposes createPrivateSession, which returns a regular Session', () => {
  expectTypeOf(createPrivateSession).toBeFunction();
  expectTypeOf(createPrivateSession<ContractsSchema>).returns.toEqualTypeOf<Session>();
});

test('takes the public config with optional ids, and no locale fields', () => {
  expectTypeOf<PrivateSessionConfig['agentConfigurationId']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<PrivateSessionConfig['trackingId']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<
    PrivateSessionConfig['navigatorContextProvider']
  >().toEqualTypeOf<NavigatorContextProvider>();
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('language');
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('country');
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('currency');
  expectTypeOf<Omit<PrivateSessionConfig, 'agentConfigurationId' | 'trackingId'>>().toEqualTypeOf<
    Omit<SessionConfig, 'agentConfigurationId' | 'trackingId'>
  >();
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('request');

  const navigatorContextProvider = () => ({
    clientId: 'client-1',
    location: null,
    referrer: null,
    userAgent: null,
    language: 'en',
    country: 'US',
    currency: 'USD',
  });
  createPrivateSession({
    contracts,
    organizationId: 'org-1',
    accessToken: 'token-1',
    navigatorContextProvider,
  });
  createPrivateSession({
    contracts,
    organizationId: 'org-1',
    accessToken: 'token-1',
    trackingId: 'tracking-1',
    navigatorContextProvider,
  });
});
