type Operator = StringOperator | StringFacetFieldOperator | NumericOperator;

export type StringOperator = 'contains' | 'isExactly';
export type StringFacetFieldOperator =
  | 'contains'
  | 'isExactly'
  | 'phoneticMatch'
  | 'fuzzyMatch'
  | 'wildcardMatch'
  | 'differentThan'
  | 'regexMatch';

export type NumericOperator =
  | 'isExactly'
  | 'lowerThan'
  | 'lowerThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual';

export function getOperatorSymbol(operator: Operator) {
  const dictionary: Record<Operator, string> = {
    contains: '=',
    differentThan: '<>',
    fuzzyMatch: '~=',
    greaterThan: '>',
    greaterThanOrEqual: '>=',
    isExactly: '==',
    lowerThan: '<',
    lowerThanOrEqual: '<=',
    phoneticMatch: '%=',
    regexMatch: '/=',
    wildcardMatch: '*=',
  };

  return dictionary[operator];
}
