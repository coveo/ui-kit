import {buildNear} from './near.js';

describe('#buildNear', () => {
  describe('#toQuerySyntax', () => {
    it('with multiple terms', () => {
      const builder = buildNear({
        startTerm: 'keep calm',
        otherTerms: [
          {
            endTerm: 'and',
            maxKeywordsBetween: 1,
          },
          {
            endTerm: 'carry on',
            maxKeywordsBetween: 5,
          },
        ],
      });

      expect(builder.toQuerySyntax()).toBe(
        'keep calm near:1 and near:5 carry on'
      );
    });

    it('with #negate set to true', () => {
      const builder = buildNear({
        startTerm: 'keep calm',
        otherTerms: [
          {
            endTerm: 'carry on',
            maxKeywordsBetween: 5,
          },
        ],
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT (keep calm near:5 carry on)');
    });
  });
});
