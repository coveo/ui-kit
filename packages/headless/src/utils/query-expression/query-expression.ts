import type {Negatable} from './common/negatable.js';
import type {Part} from './common/part.js';
import {
  buildDateField,
  type DateFieldExpression,
} from './date-field/date-field.js';
import {
  buildDateRangeField,
  type DateRangeFieldExpression,
} from './date-range-field/date-range-field.js';
import {
  buildExactMatch,
  type ExactMatchExpression,
} from './exact-match/exact-match.js';
import {
  buildFieldExists,
  type FieldExistsExpression,
} from './field-exists/field-exists.js';
import {buildKeyword, type KeywordExpression} from './keyword/keyword.js';
import {buildNear, type NearExpression, type OtherTerm} from './near/near.js';
import {
  buildNumericField,
  type NumericFieldExpression,
} from './numeric-field/numeric-field.js';
import {
  buildNumericRangeField,
  type NumericRangeFieldExpression,
} from './numeric-range-field/numeric-range-field.js';
import {
  buildQueryExtension,
  type QueryExtensionExpression,
} from './query-extension/query-extension.js';
import {
  buildStringFacetField,
  type StringFacetFieldExpression,
} from './string-facet-field/string-facet-field.js';
import {
  buildStringField,
  type StringFieldExpression,
} from './string-field/string-field.js';

export type {
  KeywordExpression,
  NearExpression,
  OtherTerm,
  ExactMatchExpression,
  FieldExistsExpression,
  StringFieldExpression,
  StringFacetFieldExpression,
  NumericFieldExpression,
  NumericRangeFieldExpression,
  DateFieldExpression,
  DateRangeFieldExpression,
  QueryExtensionExpression,
  Negatable,
};

/**
 * A utility to help build query expressions.
 */
export interface QueryExpression {
  /**
   * Adds a `QueryExpression` to the current instance.
   *
   * @param expression - The query expression instance to add.
   * @returns The `QueryExpression` instance.
   */
  addExpression(expression: QueryExpression): QueryExpression;

  /**
   * Adds an expression containing terms to match. Terms can be in any order, and may also be expanded with stemming.
   *
   * @param expression - A keyword expression.
   * @returns The `QueryExpression` instance.
   */
  addKeyword(expression: KeywordExpression): QueryExpression;

  /**
   * Adds an expression that returns all of the items in which the specified `startTerm` appears no more than `maxKeywordsBetween` from the endTerm, for each element in `otherTerms`.
   *
   * @param expression - A near expression.
   * @returns The `QueryExpression` instance.
   */
  addNear(expression: NearExpression): QueryExpression;

  /**
   * Adds an expression that must appear in its entirety, at least once, for an item to be returned.
   *
   * @param expression - An exact match expression.
   * @returns The `QueryExpression` instance.
   */
  addExactMatch(expression: ExactMatchExpression): QueryExpression;

  /**
   * Adds an expression returning all items where the defined field exists.
   *
   * @param expression - A field exists expressions.
   * @returns The `QueryExpression` instance.
   */
  addFieldExists(expression: FieldExistsExpression): QueryExpression;

  /**
   * Adds an expression that uses an `operator` to compare a string `field` against certain `values`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A string field expression.
   * @returns The `QueryExpression` instance.
   */
  addStringField(expression: StringFieldExpression): QueryExpression;

  /**
   * Adds an expression that uses an `operator` to compare a string facet `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A string facet field expression.
   * @returns The `QueryExpression` instance.
   */
  addStringFacetField(expression: StringFacetFieldExpression): QueryExpression;

  /**
   * Adds an expression that uses an `operator` to compare a numeric `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A numeric field expression.
   * @returns The `QueryExpression` instance.
   */
  addNumericField(expression: NumericFieldExpression): QueryExpression;

  /**
   * Adds an expression that returns all items for which the `value` of the numeric `field` is within the defined range.
   *
   * @param expression - A numeric field expression.
   * @returns The `QueryExpression` instance.
   */
  addNumericRangeField(
    expression: NumericRangeFieldExpression
  ): QueryExpression;

  /**
   * Adds an expression that uses an `operator` to compare a date `field` to a `value`.
   * Returns all of the items for which the expression evaluates to true.
   *
   * @param expression - A date field expression.
   * @returns The `QueryExpression` instance.
   */
  addDateField(expression: DateFieldExpression): QueryExpression;

  /**
   * Adds an expression that returns all items for which the `value` of the date `field` is within the defined range.
   *
   * @param expression - A numeric field expression.
   * @returns The `QueryExpression` instance.
   */
  addDateRangeField(expression: DateRangeFieldExpression): QueryExpression;

  /**
   * Adds an expression that invokes a query extension.
   *
   * @param expression - A query extension expression.
   * @returns The `QueryExpression` instance.
   */
  addQueryExtension(expression: QueryExtensionExpression): QueryExpression;

  /**
   * Allows specifying a boolean operator join expressions with. Possible values are `and` and `or`.
   *
   * @param operator - The boolean operator to join individual expressions with.
   * @returns The `QueryExpression` instance.
   */
  joinUsing(operator: BooleanOperator): QueryExpression;

  /**
   * Joins all expressions using the configured boolean operator.
   *
   * @returns A string representation of the configured expressions.
   */
  toQuerySyntax(): string;
}

type BooleanOperator = 'and' | 'or';

/**
 * Creates an `QueryExpression` instance.
 *
 * @param config - The expression builder options.
 * @returns An `QueryExpression` instance.
 */
export function buildQueryExpression(): QueryExpression {
  const parts: Part[] = [];
  let booleanOperator: BooleanOperator = 'and';

  return {
    addExpression(expression: QueryExpression) {
      parts.push(expression);
      return this;
    },

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

    joinUsing(operator: BooleanOperator) {
      booleanOperator = operator;
      return this;
    },

    toQuerySyntax() {
      const symbol = getBooleanOperatorSymbol(booleanOperator);
      const expression = parts
        .map((part) => part.toQuerySyntax())
        .join(`) ${symbol} (`);

      return parts.length <= 1 ? expression : `(${expression})`;
    },
  };
}

function getBooleanOperatorSymbol(operator: BooleanOperator) {
  return operator === 'and' ? 'AND' : 'OR';
}
