import {buildNear} from './near';

describe('#buildNear', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildNear({
        startTerm: 'keep calm',
        endTerm: 'carry on',
        maxKeywordsBetween: 5,
      });

      expect(builder.toString()).toBe('keep calm near:5 carry on');
    });

    it('with #negate set to true', () => {
      const builder = buildNear({
        startTerm: 'keep calm',
        endTerm: 'carry on',
        maxKeywordsBetween: 5,
        negate: true,
      });

      expect(builder.toString()).toBe('NOT (keep calm near:5 carry on)');
    });
  });
});
