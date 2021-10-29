import {buildKeyword} from './keyword';

describe('#buildKeyword', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildKeyword({
        expression: 'bbc news',
      });

      expect(builder.toString()).toBe('bbc news');
    });

    it('with #negate set to true', () => {
      const builder = buildKeyword({
        expression: 'bbc news',
        negate: true,
      });

      expect(builder.toString()).toBe('NOT (bbc news)');
    });
  });
});
