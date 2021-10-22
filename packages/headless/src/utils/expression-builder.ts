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

interface StringFieldExpression {
  field: string;
  operator: 'contains' | 'isExactly';
  values: string[];
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

// Not

interface Not {
  type: 'not';
  expression: QueryExpression;
}

// Field Exists

interface FieldExists {
  type: 'fieldExists';
  fieldName: string;
}

// Not sure how to use this one.
interface MatchAll {
  type: 'matchAll';
  value: string;
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

// Junctions

interface And {
  type: 'and';
  expressions: QueryExpression[];
}

interface Or {
  type: 'or';
  expressions: QueryExpression[];
}

export function createExpressionBuilder(config: {delimiter: 'and' | 'or'}) {
  const parts: Part[] = [];

  return {
    addStringField(expression: StringFieldExpression) {
      parts.push(buildStringFieldPart(expression));
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
      const operator = config.operator === 'contains' ? '=' : '==';
      const processed = config.values.map((value) => `"${value}"`);

      const values =
        processed.length === 1 ? processed[0] : `(${processed.join(',')})`;

      return `@${field}${operator}${values}`;
    },
  };
}

// function createExpressionBuilder(expression = '') {
//   const parts = expression ? [expression] : [];

//   return {
//     addStringFieldExpression(
//       field: string,
//       operator: '==' | '!=',
//       values: string[]
//     ) {
//       const stringValues = values.map((v) => `"${v}"`).join(',');
//       const expression = `${field}==(${stringValues})`;
//       const prefix = operator === '!=' ? 'NOT ' : '';

//       parts.push(`${prefix}${expression}`);
//     },

//     join(delimiter: 'AND' | 'OR') {
//       const concatenated = parts.join(`) ${delimiter} (`);
//       return `(${concatenated})`;
//     },
//   };
// }

// const builder = createExpressionBuilder();
// builder.addStringFieldExpression('filetype', '==', ['pdf']);
// builder.addStringFieldExpression('author', '!=', ['alice', 'bob']);
// const expression = builder.join('AND');

// console.log(expression);
// (filetype==("pdf")) AND (NOT author==("alice","bob"))
