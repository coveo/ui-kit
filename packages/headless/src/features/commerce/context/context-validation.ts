import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

const currencies = Intl.supportedValuesOf('currency') as CurrencyCodeISO4217[];

const currencyDefinition = new StringValue<CurrencyCodeISO4217>({
  required: true,
  emptyAllowed: false,
  constrainTo: currencies,
});

export const viewDefinition = {
  url: requiredNonEmptyString,
};

export const contextDefinition = {
  language: requiredNonEmptyString,
  country: requiredNonEmptyString,
  currency: currencyDefinition,
  view: new RecordValue({
    options: {required: true},
    values: viewDefinition,
  }),
};

export const contextSchema = new Schema(contextDefinition);
