import {Part} from '../common/part';
import {ExpressionBuilder} from '../expression-builder';

export interface QueryExtensionExpression {
  /**
   * The query extension name without the leading $ sign. See [Standard Query Extensions](https://docs.coveo.com/en/1462/build-a-search-ui/standard-query-extensions) for examples.
   */
  name: string;

  /**
   * The query extension parameters where applicable.
   */
  parameters: QueryExtensionParameter[];
}

export interface QueryExtensionParameter {
  /**
   * The parameter name.
   */
  name: string;

  /**
   * The parameter value.
   */
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

function buildParameters(params: QueryExtensionParameter[]) {
  return params
    .map((param) => {
      const {name, value} = param;
      return `${name}: ${value.toString()}`;
    })
    .join(', ');
}
