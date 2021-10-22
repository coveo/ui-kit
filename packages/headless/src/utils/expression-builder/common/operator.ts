type Operator = StringOperator | NumericOperator;

export type StringOperator = 'contains' | 'isExactly';
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

  return '';
}
