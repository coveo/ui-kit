import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol} from '../common/operator';
import {Part} from '../common/part';

export interface DateRangeFieldExpression extends Negatable {
  /**
   * The field name.
   */
  field: string;

  /**
   * The start of the range. For absolute dates, please use form YYYY/MM/DD. For relative dates, please refer to the supported [date/time operators](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators#datetime-operators).
   */
  from: string;

  /**
   * The end of the range. For absolute dates, please use form YYYY/MM/DD. For relative dates, please refer to the supported [date/time operators](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators#datetime-operators).
   */
  to: string;
}

export function buildDateRangeField(config: DateRangeFieldExpression): Part {
  return {
    toQuerySyntax() {
      const prefix = getNegationPrefix(config);
      const {field, from, to} = config;
      const operator = getOperatorSymbol('isExactly');
      return `${prefix}@${field}${operator}${from}..${to}`;
    },
  };
}
