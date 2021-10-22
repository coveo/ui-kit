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

type Operator = StringOperator | NumericOperator;

type StringOperator = 'contains' | 'isExactly';
type NumericOperator =
  | 'isExactly'
  | 'lowerThan'
  | 'lowerThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual';

interface StringFieldExpression {
  field: string;
  operator: StringOperator;
  values: string[];
}

interface NumericFieldExpression {
  field: string;
  operator: NumericOperator;
  value: number;
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
  addStringField(expression: StringFieldExpression): ExpressionBuilder;
  addNumericField(expression: NumericFieldExpression): ExpressionBuilder;
  toString(): string;
}

export function createExpressionBuilder(config: {
  delimiter: 'and' | 'or';
}): ExpressionBuilder {
  const parts: Part[] = [];

  return {
    addStringField(expression: StringFieldExpression) {
      parts.push(buildStringFieldPart(expression));
      return this;
    },

    addNumericField(expression: NumericFieldExpression) {
      parts.push(buildNumericFieldPart(expression));
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

function buildStringFieldPart(config: StringFieldExpression): Part {
  return {
    toString() {
      const {field} = config;
      const operator = getOperatorSymbol(config.operator);
      const processed = config.values.map((value) => `"${value}"`);

      const values =
        processed.length === 1 ? processed[0] : `(${processed.join(',')})`;

      return `@${field}${operator}${values}`;
    },
  };
}

function buildNumericFieldPart(config: NumericFieldExpression): Part {
  return {
    toString() {
      const {field, value} = config;
      const operator = getOperatorSymbol(config.operator);
      return `@${field}${operator}${value}`;
    },
  };
}

function getOperatorSymbol(operator: Operator) {
  if (operator === 'contains') {
    return '=';
  }

  if (operator === 'isExactly') {
    return '==';
  }

  if (operator === 'greaterThan') {
    return '>';
  }

  if (operator === 'greaterThanOrEqual') {
    return '>=';
  }

  if (operator === 'lowerThan') {
    return '<';
  }

  if (operator === 'lowerThanOrEqual') {
    return '<=';
  }

  return '';
}
