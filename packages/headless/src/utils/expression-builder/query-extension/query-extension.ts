import {Part} from '../common/part';
import {ExpressionBuilder} from '../expression-builder';

export interface QueryExtensionExpression {
  name: string;
  parameters: Parameter[];
}

interface Parameter {
  name: string;
  value: ExpressionBuilder;
}

export function buildQueryExtension(config: QueryExtensionExpression): Part {
  return {
    toString() {
      const {name, parameters} = config;
      const argumentExpression = buildParameters(parameters);
      return `$${name}(${argumentExpression})`;
    },
  };
}

function buildParameters(params: Parameter[]) {
  return params
    .map((param) => {
      const {name, value} = param;
      return `${name}: ${value.toString()}`;
    })
    .join(', ');
}
