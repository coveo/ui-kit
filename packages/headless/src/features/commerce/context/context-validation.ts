import {ArrayValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
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
  userId: nonEmptyString,
  email: nonEmptyString,
  userIp: nonEmptyString,
  userAgent: nonEmptyString,
};

const cartItemDefinition = new RecordValue({
  options: {
    required: true,
  },
  values: {
    productId: nonEmptyString,
    sku: nonEmptyString,
    name: nonEmptyString,
    price: nonEmptyString,
    quantity: nonEmptyString,
  },
});

export const cartDefinition = {
  items: new ArrayValue({
    each: cartItemDefinition,
  }),
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
