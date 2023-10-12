import {buildKeyword} from './keyword.js';

describe('#buildKeyword', () => {
  describe('#toQuerySyntax', () => {
    it('with #negate not specified', () => {
      const builder = buildKeyword({
        expression: 'bbc news',
      });

      expect(builder.toQuerySyntax()).toBe('bbc news');
    });

    it('with #negate set to true', () => {
      const builder = buildKeyword({
        expression: 'bbc news',
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT (bbc news)');
    });
  });
});
