/**
 * Type test for the `@coveo/thermidor/private` entry (for internal Coveo use only).
 */
import {expectTypeOf, test} from 'vitest';
import {z} from 'zod/v4';
import type {ContractsSchema, Session} from '@/src/index.js';
import {createPrivateSession} from '@/src/private.js';
import type {PrivateRequestContract, PrivateSessionConfig} from '@/src/private.js';

declare const contracts: ContractsSchema;

test('exposes createPrivateSession, which returns a regular Session', () => {
  expectTypeOf(createPrivateSession).toBeFunction();
  expectTypeOf(createPrivateSession<ContractsSchema>).returns.toEqualTypeOf<Session>();
});

test('takes a request contract and no agent configuration or tracking id', () => {
  expectTypeOf<PrivateSessionConfig['request']>().toEqualTypeOf<PrivateRequestContract>();
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('agentConfigurationId');
  expectTypeOf<PrivateSessionConfig>().not.toHaveProperty('trackingId');
  expectTypeOf<PrivateRequestContract['fields']>().toEqualTypeOf<() => Record<string, unknown>>();

  createPrivateSession({
    contracts,
    organizationId: 'org-1',
    accessToken: 'token-1',
    request: {
      schema: z.object({language: z.string(), country: z.string(), currency: z.string()}),
      fields: () => ({language: 'en', country: 'US', currency: 'USD'}),
    },
  });

  // @ts-expect-error `request` is required.
  createPrivateSession({contracts, organizationId: 'org-1', accessToken: 'token-1'});
});
