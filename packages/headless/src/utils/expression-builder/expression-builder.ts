import {Part} from './common/part';
import {buildDateField, DateFieldExpression} from './date-field/date-field';
import {
  buildDateRangeField,
  DateRangeFieldExpression,
} from './date-range-field/date-range-field';
import {buildExactMatch, ExactMatchExpression} from './exact-match/exact-match';
import {
  buildFieldExists,
  FieldExistsExpression,
} from './field-exists/field-exists';
import {buildKeyword, KeywordExpression} from './keyword/keyword';
import {buildNear, NearExpression} from './near/near';
import {
  buildNumericField,
  NumericFieldExpression,
} from './numeric-field/numeric-field';
import {
  buildNumericRangeField,
  NumericRangeFieldExpression,
} from './numeric-range-field/numeric-range-field';
import {
  buildQueryExtension,
  QueryExtensionExpression,
} from './query-extension/query-extension';
import {
  buildStringFacetField,
  StringFacetFieldExpression,
} from './string-facet-field/string-facet-field';
import {
  buildStringField,
  StringFieldExpression,
} from './string-field/string-field';

/**
 * A utility to help build query expressions.
 */
export interface ExpressionBuilder {
  addKeyword(expression: KeywordExpression): ExpressionBuilder;
  addNear(expression: NearExpression): ExpressionBuilder;
  addExactMatch(expression: KeywordExpression): ExpressionBuilder;
  addFieldExists(expression: FieldExistsExpression): ExpressionBuilder;
  addStringField(expression: StringFieldExpression): ExpressionBuilder;
  addStringFacetField(
    expression: StringFacetFieldExpression
  ): ExpressionBuilder;
  addNumericField(expression: NumericFieldExpression): ExpressionBuilder;
  addNumericRangeField(
    expression: NumericRangeFieldExpression
  ): ExpressionBuilder;
  addDateField(expression: DateFieldExpression): ExpressionBuilder;
  addDateRangeField(expression: DateRangeFieldExpression): ExpressionBuilder;
  addQueryExtension(expression: QueryExtensionExpression): ExpressionBuilder;
  toString(): string;
}

type BooleanOperator = 'and' | 'or';

/**
 * The expression builder options.
 */
export interface ExpressionBuilderOptions {
  /**
   * The boolean operator to join individual expressions with.
   */
  operator: BooleanOperator;
}

/**
 * Creates an `ExpressionBuilder` instance.
 *
 * @param config - The expression builder options.
 * @returns An `ExpressionBuilder` instance.
 */
export function createExpressionBuilder(
  config: ExpressionBuilderOptions
): ExpressionBuilder {
  const parts: Part[] = [];

  return {
    addKeyword(expression: KeywordExpression) {
      parts.push(buildKeyword(expression));
      return this;
    },

    addNear(expression: NearExpression) {
      parts.push(buildNear(expression));
      return this;
    },

    addExactMatch(expression: ExactMatchExpression) {
      parts.push(buildExactMatch(expression));
      return this;
    },

    addFieldExists(expression: FieldExistsExpression) {
      parts.push(buildFieldExists(expression));
      return this;
    },

    addStringField(expression: StringFieldExpression) {
      parts.push(buildStringField(expression));
      return this;
    },

    addStringFacetField(expression: StringFacetFieldExpression) {
      parts.push(buildStringFacetField(expression));
      return this;
    },

    addNumericField(expression: NumericFieldExpression) {
      parts.push(buildNumericField(expression));
      return this;
    },

    addNumericRangeField(expression: NumericRangeFieldExpression) {
      parts.push(buildNumericRangeField(expression));
      return this;
    },

    addDateField(expression: DateFieldExpression) {
      parts.push(buildDateField(expression));
      return this;
    },

    addDateRangeField(expression: DateRangeFieldExpression) {
      parts.push(buildDateRangeField(expression));
      return this;
    },

    addQueryExtension(expression: QueryExtensionExpression) {
      parts.push(buildQueryExtension(expression));
      return this;
    },

    toString() {
      const symbol = getBooleanOperatorSymbol(config.operator);
      const expression = parts.join(`) ${symbol} (`);

      return parts.length <= 1 ? expression : `(${expression})`;
    },
  };
}

function getBooleanOperatorSymbol(operator: BooleanOperator) {
  return operator === 'and' ? 'AND' : 'OR';
}
