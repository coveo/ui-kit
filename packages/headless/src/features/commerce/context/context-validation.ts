import {NumberValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
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

export const locationDefinition = {
  latitude: new NumberValue({min: -90, max: 90, required: true}),
  longitude: new NumberValue({min: -180, max: 180, required: true}),
};

export const contextDefinition = {
  language: requiredNonEmptyString,
  country: requiredNonEmptyString,
  currency: currencyDefinition,
  view: new RecordValue({
    options: {required: true},
    values: viewDefinition,
  }),
  location: new RecordValue({
    options: {required: false},
    values: locationDefinition,
  }),
};

export const contextSchema = new Schema(contextDefinition);
