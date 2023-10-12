import {buildFieldExists} from './field-exists.js';

describe('#buildFieldExists', () => {
  describe('#toQuerySyntax', () => {
    it('with #negate not specified', () => {
      const builder = buildFieldExists({
        field: 'author',
      });

      expect(builder.toQuerySyntax()).toBe('@author');
    });

    it('with #negate set to true', () => {
      const builder = buildFieldExists({
        field: 'author',
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @author');
    });
  });
});
