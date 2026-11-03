/**
 * Type test for the `@coveo/thermidor/private` entry (for internal Coveo use only).
 */
import {expectTypeOf, test} from 'vitest';
import type {ContractsSchema, Session, SessionConfig} from '@/src/index.js';
import {createPrivateSession} from '@/src/private.js';
import type {PrivateSessionConfig} from '@/src/private.js';

declare const contracts: ContractsSchema;

test('exposes createPrivateSession, which returns a regular Session', () => {
  expectTypeOf(createPrivateSession).toBeFunction();
  expectTypeOf(createPrivateSession<ContractsSchema>).returns.toEqualTypeOf<Session>();
});

test('takes the public config with optional ids and optional locale fields', () => {
  expectTypeOf<PrivateSessionConfig['agentConfigurationId']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<PrivateSessionConfig['trackingId']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<PrivateSessionConfig['language']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<PrivateSessionConfig['country']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<PrivateSessionConfig['currency']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<
    Omit<
      PrivateSessionConfig,
      'agentConfigurationId' | 'trackingId' | 'language' | 'country' | 'currency'
    >
  >().toEqualTypeOf<Omit<SessionConfig, 'agentConfigurationId' | 'trackingId'>>();
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('request');

  createPrivateSession({contracts, organizationId: 'org-1', accessToken: 'token-1'});
  createPrivateSession({
    contracts,
    organizationId: 'org-1',
    accessToken: 'token-1',
    trackingId: 'tracking-1',
    language: 'en',
    country: 'US',
    currency: 'USD',
  });
});
