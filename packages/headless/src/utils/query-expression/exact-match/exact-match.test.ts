import {buildExactMatch} from './exact-match';

describe('#buildExactMatch', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildExactMatch({
        expression: 'bbc news',
      });

      expect(builder.toString()).toBe('"bbc news"');
    });

    it('with #negate set to true', () => {
      const builder = buildExactMatch({
        expression: 'bbc news',
        negate: true,
      });

      expect(builder.toString()).toBe('NOT "bbc news"');
    });
  });
});
