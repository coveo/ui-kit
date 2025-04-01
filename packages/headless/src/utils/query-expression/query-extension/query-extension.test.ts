import {buildQueryExpression} from '../query-expression.js';
import {buildQueryExtension} from './query-extension.js';

describe('#buildQueryExtension', () => {
  describe('#toQuerySyntax', () => {
    it('with no parameters', () => {
      const builder = buildQueryExtension({
        name: 'q',
        parameters: {},
      });

      expect(builder.toQuerySyntax()).toBe('$q()');
    });

    it('with multiple parameters', () => {
      const fieldExpression = buildQueryExpression().addStringField({
        field: 'documenttype',
        operator: 'isExactly',
        values: ['Book'],
      });

      const builder = buildQueryExtension({
        name: 'qre',
        parameters: {
          expression: fieldExpression,
          modifier: '100',
        },
      });

      expect(builder.toQuerySyntax()).toBe(
        '$qre(expression: @documenttype=="Book", modifier: 100)'
      );
    });
  });
});
