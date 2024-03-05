import {RecordValue, Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  nonRequiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';

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

export const contextDefinition = {
  trackingId: requiredNonEmptyString,
  language: requiredNonEmptyString,
  country: requiredNonEmptyString,
  currency: requiredNonEmptyString,
  user: new RecordValue({
    values: {
      ...userDefinition,
    },
  }),
  view: new RecordValue({
    options: {required: true},
    values: {
      ...viewDefinition,
    },
  }),
};

export const contextSchema = new Schema(contextDefinition);
