import {buildStringField} from './string-field';

describe('#buildStringField', () => {
  describe('#toString', () => {
    it('#contains operator, one value', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
      });

      expect(builder.toString()).toBe('@author="al"');
    });

    it('#isExactly operator, one value', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'isExactly',
        values: ['alice'],
      });

      expect(builder.toString()).toBe('@author=="alice"');
    });

    it('#contains operator with multiple values', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'contains',
        values: ['al', 'alice'],
      });

      expect(builder.toString()).toBe('@author=("al","alice")');
    });

    it('#negate set to true', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
        negate: true,
      });

      expect(builder.toString()).toBe('NOT @author="al"');
    });
  });
});
