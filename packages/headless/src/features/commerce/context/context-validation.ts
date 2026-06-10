import {z} from '@coveo/bueno/zod';
import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

const currencies = Intl.supportedValuesOf('currency') as CurrencyCodeISO4217[];

const currencyDefinition = z.enum(
  currencies as unknown as [CurrencyCodeISO4217, ...CurrencyCodeISO4217[]]
);

export const viewDefinition = z.object({
  url: requiredNonEmptyString,
});

export const locationDefinition = z.object({
  latitude: z.number().check(z.minimum(-90), z.maximum(90)),
  longitude: z.number().check(z.minimum(-180), z.maximum(180)),
});

export const customDefinition = z.object({
  custom: z.optional(z.record(z.string(), z.unknown())),
});

export const contextDefinition = z.object({
  language: requiredNonEmptyString,
  country: requiredNonEmptyString,
  currency: currencyDefinition,
  view: viewDefinition,
  location: z.optional(locationDefinition),
  custom: z.optional(z.record(z.string(), z.unknown())),
});

export const contextSchema = contextDefinition;
