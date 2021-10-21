type QueryExpression =
  | KeyWord
  | ExactMatch
  | FieldExpression
  | Near
  | Not
  | FieldExists
  | ObjectAccess
  | QueryExtensionInvocation
  | QuerySyntax
  | And
  | Or;

type FieldValue = DateRange | Date | KeyWord | ExactMatch;

type TextValue = KeyWord | ExactMatch;

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

interface KeyWord {
  type: 'keyword';
  value: string;
}

interface ExactMatch {
  type: 'exactMatch';
  value: string;
}

interface And {
  type: 'and';
  expressions: QueryExpression[];
}

interface Or {
  type: 'or';
  expressions: QueryExpression[];
}

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
  value: FieldValue; // shouldn't this be an array?
}

interface Near {
  type: 'near';
  startTerm: TextValue;
  otherTerms: OtherTerm[];
}

interface OtherTerm {
  maxKeywordsFrom: number;
  endTerm: TextValue;
}

interface Not {
  type: 'not';
  expression: QueryExpression;
}

interface FieldExists {
  type: 'fieldExists';
  fieldName: string;
}

// Not sure how to use this one.
interface MatchAll {
  type: 'matchAll';
}

interface ObjectAccess {
  type: 'objectAccess';
  properties: string[];
}

interface QueryExtensionInvocation {
  type: 'queryExtensionInvocation';
  name: string;
  argument: Argument[];
}

interface Argument {
  name: string;
  value: QueryExpression;
}

interface QuerySyntax {
  type: 'querySyntax';
  value: string;
}

function createExpressionBuilderV4(expression?: QueryExpression) {
  const expressions: QueryExpression[] = expression ? [expression] : [];

  return {
    addExpression(expression: QueryExpression) {
      expressions.push(expression);
      return this;
    },

    build(delimiter: 'and' | 'or'): QueryExpression {
      return {
        type: delimiter,
        expressions,
      };
    },
  };
}

const builderV4 = createExpressionBuilderV4();

builderV4
  .addExpression({
    type: 'fieldExpression',
    fieldName: 'filetype',
    operator: 'isExactly',
    value: {
      type: 'keyword',
      value: 'pdf',
    },
  })
  .addExpression({
    type: 'not',
    expression: {
      type: 'fieldExpression',
      fieldName: 'author',
      operator: 'isExactly',
      value: {
        type: 'keyword',
        value: 'alice',
      },
    },
  });

const expressionV4 = builderV4.build('and');
console.log(JSON.stringify(expressionV4, null, 2));

// {
//   "type": "and",
//   "expressions": [
//     {
//       "type": "fieldExpression",
//       "fieldName": "filetype",
//       "operator": "isExactly",
//       "value": {
//         "type": "keyword",
//         "value": "pdf"
//       }
//     },
//     {
//       "type": "not",
//       "expression": {
//         "type": "fieldExpression",
//         "fieldName": "author",
//         "operator": "isExactly",
//         "value": {
//           "type": "keyword",
//           "value": "alice"
//         }
//       }
//     }
//   ]
// }

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
