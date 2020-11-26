import {BooleanValue, StringValue} from '@coveo/bueno';

export const searchParametersDefinition = {
  q: new StringValue(),
  enableQuerySyntax: new BooleanValue(),
};
