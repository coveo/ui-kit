import {buildExactMatch} from './exact-match.js';

describe('#buildExactMatch', () => {
  describe('#toQuerySyntax', () => {
    it('with #negate not specified', () => {
      const builder = buildExactMatch({
        expression: 'bbc news',
      });

      expect(builder.toQuerySyntax()).toBe('"bbc news"');
    });

    it('with #negate set to true', () => {
      const builder = buildExactMatch({
        expression: 'bbc news',
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT "bbc news"');
    });
  });
});
