import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {
  nonEmptyString,
  nonRequiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';

const currencies = Intl.supportedValuesOf('currency') as CurrencyCodeISO4217[];

const currencyDefinition = new StringValue<CurrencyCodeISO4217>({
  required: true,
  emptyAllowed: false,
  constrainTo: currencies,
});

export const viewDefinition = {
  url: requiredNonEmptyString,
  referrer: nonRequiredEmptyAllowedString,
};

export const userDefinition = {
  userAgent: nonEmptyString,
};

export const contextDefinition = {
  language: requiredNonEmptyString,
  country: requiredNonEmptyString,
  currency: currencyDefinition,
  user: new RecordValue({
    values: userDefinition,
  }),
  view: new RecordValue({
    options: {required: true},
    values: viewDefinition,
  }),
};

export const contextSchema = new Schema(contextDefinition);
