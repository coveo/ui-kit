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

  if (operator === 'fuzzyMatch') {
    return '~=';
  }

  if (operator === 'wildcardMatch') {
    return '*=';
  }

  if (operator === 'phoneticMatch') {
    return '%=';
  }

  if (operator === 'differentThan') {
    return '<>';
  }

  if (operator === 'regexMatch') {
    return '/=';
  }

  return '';
}
