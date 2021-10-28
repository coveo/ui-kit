import {createExpressionBuilder} from '../expression-builder';
import {buildQueryExtension} from './query-extension';

describe('#buildQueryExtension', () => {
  describe('#toString', () => {
    it('with no parameters', () => {
      const builder = buildQueryExtension({
        name: 'q',
        parameters: [],
      });

      expect(builder.toString()).toBe('$q()');
    });

    it('with multiple parameters', () => {
      const fieldExpression = createExpressionBuilder({
        operator: 'or',
      }).addStringField({
        field: 'documenttype',
        operator: 'isExactly',
        values: ['Book'],
      });

      const modifierExpression = createExpressionBuilder({
        operator: 'or',
      }).addKeyword({expression: '100'});

      const builder = buildQueryExtension({
        name: 'qre',
        parameters: [
          {
            name: 'expression',
            value: fieldExpression,
          },
          {
            name: 'modifier',
            value: modifierExpression,
          },
        ],
      });

      expect(builder.toString()).toBe(
        '$qre(expression: @documenttype=="Book", modifier: 100)'
      );
    });
  });
});
