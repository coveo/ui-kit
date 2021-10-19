type QueryExpresion =
  | KeyWord
  | ExactMatch
  | FieldExpresion
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
  expressions: QueryExpresion[];
}

interface Or {
  type: 'or';
  expressions: QueryExpresion[];
}

interface FieldExpresion {
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
  expression: QueryExpresion;
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
  value: QueryExpresion;
}

interface QuerySyntax {
  type: 'querySyntax';
  value: string;
}

function createExpressionBuilderV4(expression?: QueryExpresion) {
  const expressions: QueryExpresion[] = expression ? [expression] : [];

  return {
    addExpression(expression: QueryExpresion) {
      expressions.push(expression);
      return this;
    },

    build(delimiter: 'and' | 'or'): QueryExpresion {
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
