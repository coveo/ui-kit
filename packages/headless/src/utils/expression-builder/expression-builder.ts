import {buildDateField, DateFieldExpression} from './date-field/date-field';
import {
  buildDateRangeField,
  DateRangeFieldExpression,
} from './date-range-field/date-range-field';
import {buildExactMatch, ExactMatchExpression} from './exact-match/exact-match';
import {buildKeyword, KeywordExpression} from './keyword/keyword';
import {
  buildNumericField,
  NumericFieldExpression,
} from './numeric-field/numeric-field';
import {
  buildNumericRangeField,
  NumericRangeFieldExpression,
} from './numeric-range-field/numeric-range-field';
import {
  buildStringFacetField,
  StringFacetFieldExpression,
} from './string-facet-field/string-facet-field';
import {
  buildStringField,
  StringFieldExpression,
} from './string-field/string-field';

type QueryExpression =
  | KeyWord
  | ExactMatch
  | FieldExpression
  | Near
  | Not
  | FieldExists
  | MatchAll
  | ObjectAccess
  | QueryExtensionInvocation
  | QuerySyntax
  | And
  | Or;

type TextValue = KeyWord | ExactMatch;

// Keyword

interface KeyWord {
  type: 'keyword';
  value: string;
}

// Exact Match

interface ExactMatch {
  type: 'exactMatch';
  value: string;
}

// field expression

interface DateRange {
  type: 'dateRange';
  dateRange: {
    from: string;
    to: string;
  };
}

interface Date {
  type: 'date';
  dateValue: string;
}

type FieldValue = DateRange | Date | KeyWord | ExactMatch;

interface FieldExpression {
  type: 'fieldExpression';
  fieldName: string;
  operator:
    | 'contains'
    | 'isExactly'
    | 'lowerThan'
    | 'lowerThanOrEqual'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'phoneticMatch'
    | 'fuzzyMatch'
    | 'regexMatch'
    | 'wildcardMatch'
    | 'differentThan';
  value: FieldValue;
}

// Near expression

interface Near {
  type: 'near';
  startTerm: TextValue;
  otherTerms: OtherTerm[];
}

interface OtherTerm {
  maxKeywordsFrom: number;
  endTerm: TextValue;
}

// Field Exists

interface FieldExists {
  type: 'fieldExists';
  fieldName: string;
}

// Matches all documents by adding @uri

interface MatchAll {
  type: 'matchAll';
}

// Object Access

interface ObjectAccess {
  type: 'objectAccess';
  properties: string[];
}

// Query Extension

interface QueryExtensionInvocation {
  type: 'queryExtensionInvocation';
  name: string;
  argument: Argument[];
}

interface Argument {
  name: string;
  value: QueryExpression;
}

// Query Syntax

interface QuerySyntax {
  type: 'querySyntax';
  value: string;
}

// Expression-Level Operators

interface And {
  type: 'and';
  expressions: QueryExpression[];
}

interface Or {
  type: 'or';
  expressions: QueryExpression[];
}

interface Not {
  type: 'not';
  expression: QueryExpression;
}

export interface ExpressionBuilder {
  addKeywordExpression(expression: KeywordExpression): ExpressionBuilder;
  addExactMatchExpression(expression: KeywordExpression): ExpressionBuilder;
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
  toString(): string;
}

export function createExpressionBuilder(config: {
  delimiter: 'and' | 'or';
}): ExpressionBuilder {
  const parts: Part[] = [];

  return {
    addKeywordExpression(expression: KeywordExpression) {
      parts.push(buildKeyword(expression));
      return this;
    },

    addExactMatchExpression(expression: ExactMatchExpression) {
      parts.push(buildExactMatch(expression));
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

    toString() {
      return parts.join(config.delimiter);
    },
  };
}

interface Part {
  toString(): string;
}
