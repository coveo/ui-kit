import {buildFieldExists} from './field-exists';

describe('#buildFieldExists', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildFieldExists({
        field: 'author',
      });

      expect(builder.toString()).toBe('@author');
    });

    it('with #negate set to true', () => {
      const builder = buildFieldExists({
        field: 'author',
        negate: true,
      });

      expect(builder.toString()).toBe('NOT @author');
    });
  });
});
