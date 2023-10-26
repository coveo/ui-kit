import {RecordValue, Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';

export const viewDefinition = {
  url: requiredNonEmptyString,
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
  currency: requiredNonEmptyString,
  clientId: requiredNonEmptyString,
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
