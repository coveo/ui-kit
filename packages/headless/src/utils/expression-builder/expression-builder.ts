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
  /**
   * Adds an expression to match. Terms can be in any order, and may also be expanded with stemming.
   *
   * @param expression - A keyword expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addKeyword(expression: KeywordExpression): ExpressionBuilder;

  /**
   * Adds an expression that returns all of the items in which the specified `startTerm` appears no more than `maxKeywordsBetween` from the endTerm, for each element in `otherTerms`.
   *
   * @param expression - A near expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addNear(expression: NearExpression): ExpressionBuilder;

  /**
   * Adds an expression that must appear in its entirety at least once in an item for that item to be returned.
   *
   * @param expression - An exact match expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addExactMatch(expression: KeywordExpression): ExpressionBuilder;

  /**
   * Adds an expression returning all items where the defined field exists.
   *
   * @param expression - A field exists expressions.
   * @returns The `ExpressionBuilder` instance.
   */
  addFieldExists(expression: FieldExistsExpression): ExpressionBuilder;

  /**
   * Adds an expression that uses an `operator` to compare a string `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A string field expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addStringField(expression: StringFieldExpression): ExpressionBuilder;

  /**
   * Adds an expression that uses an `operator` to compare a string facet `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A string facet field expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addStringFacetField(
    expression: StringFacetFieldExpression
  ): ExpressionBuilder;

  /**
   * Adds an expression that uses an `operator` to compare a numeric `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A numeric field expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addNumericField(expression: NumericFieldExpression): ExpressionBuilder;

  /**
   * Adds an expression that returns all items for which the `value` of the numeric `field` is within the defined range.
   *
   * @param expression - A numeric field expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addNumericRangeField(
    expression: NumericRangeFieldExpression
  ): ExpressionBuilder;

  /**
   * Adds an expression that uses an `operator` to compare a date `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A date field expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addDateField(expression: DateFieldExpression): ExpressionBuilder;

  /**
   * Adds an expression that returns all items for which the `value` of the date `field` is within the defined range.
   *
   * @param expression - A numeric field expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addDateRangeField(expression: DateRangeFieldExpression): ExpressionBuilder;

  /**
   * Adds an expression that invokes a query extension.
   *
   * @param expression - A query extension expression.
   * @returns The `ExpressionBuilder` instance.
   */
  addQueryExtension(expression: QueryExtensionExpression): ExpressionBuilder;

  /**
   * Joins all expressions using the configured boolean operator.
   *
   * @returns A string representation of the configured expressions.
   */
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
