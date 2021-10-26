import {buildKeywordExpression} from './keyword-expression';

describe('#buildKeywordExpression', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildKeywordExpression({
        expression: 'bbc news',
      });

      expect(builder.toString()).toBe('bbc news');
    });

    it('with #negate set to true', () => {
      const builder = buildKeywordExpression({
        expression: 'bbc news',
        negate: true,
      });

      expect(builder.toString()).toBe('NOT (bbc news)');
    });
  });
});
