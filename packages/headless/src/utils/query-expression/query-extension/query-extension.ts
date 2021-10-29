import {Part} from '../common/part';
import {QueryExpression} from '../query-expression';

export interface QueryExtensionExpression {
  /**
   * The query extension name without the leading $ sign. See [Standard Query Extensions](https://docs.coveo.com/en/1462/build-a-search-ui/standard-query-extensions) for examples.
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
    toString() {
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
      return `${name}: ${value.toString()}`;
    })
    .join(', ');
}
