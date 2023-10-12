import {buildStringField} from './string-field.js';

describe('#buildStringField', () => {
  describe('#toQuerySyntax', () => {
    it('#contains operator, one value', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
      });

      expect(builder.toQuerySyntax()).toBe('@author="al"');
    });

    it('#isExactly operator, one value', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'isExactly',
        values: ['alice'],
      });

      expect(builder.toQuerySyntax()).toBe('@author=="alice"');
    });

    it('#contains operator with multiple values', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'contains',
        values: ['al', 'alice'],
      });

      expect(builder.toQuerySyntax()).toBe('@author=("al","alice")');
    });

    it('#negate set to true', () => {
      const builder = buildStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @author="al"');
    });
  });
});
