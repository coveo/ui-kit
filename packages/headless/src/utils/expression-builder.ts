function createExpressionBuilder(expression = '') {
  const parts = expression ? [expression] : [];

  return {
    addStringFieldExpression(
      field: string,
      operator: '==' | '!=',
      values: string[]
    ) {
      const stringValues = values.map((v) => `"${v}"`).join(',');
      const expression = `${field}==(${stringValues})`;
      const prefix = operator === '!=' ? 'NOT ' : '';

      parts.push(`${prefix}${expression}`);
    },

    join(delimiter: 'AND' | 'OR') {
      const concatenated = parts.join(`) ${delimiter} (`);
      return `(${concatenated})`;
    },
  };
}

const builder = createExpressionBuilder();
builder.addStringFieldExpression('filetype', '==', ['pdf']);
builder.addStringFieldExpression('author', '==', ['alice', 'bob']);
const expression = builder.join('AND');

console.log(expression);
// (filetype==("pdf")) AND (author==("alice","bob"))
