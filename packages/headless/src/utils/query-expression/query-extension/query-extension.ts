import type {Part} from '../common/part.js';
import type {QueryExpression} from '../query-expression.js';

export interface QueryExtensionExpression {
  /**
   * The query extension name without the leading $ sign. See [Standard Query Extensions](https://docs.coveo.com/en/1462) for examples.
   */
  name: string;

  /**
   * The query extension parameters where applicable.
   */
  parameters: QueryExtensionParameters;
}

type QueryExtensionParameters = Record<string, string | QueryExpression>;

export function buildQueryExtension(config: QueryExtensionExpression): Part {
  return {
    toQuerySyntax() {
      const {name, parameters} = config;
      const argumentExpression = buildParameters(parameters);
      return `$${name}(${argumentExpression})`;
    },
  };
}

function buildParameters(params: QueryExtensionParameters) {
  return Object.entries(params)
    .map((entry) => {
      const [name, value] = entry;
      const formatted =
        typeof value === 'string' ? value : value.toQuerySyntax();
      return `${name}: ${formatted}`;
    })
    .join(', ');
}
