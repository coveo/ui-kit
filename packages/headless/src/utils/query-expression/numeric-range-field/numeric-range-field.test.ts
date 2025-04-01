import {buildNumericRangeField} from './numeric-range-field.js';

describe('#buildNumericRangeField', () => {
  describe('#toQuerySyntax', () => {
    it('with #negate not specified', () => {
      const builder = buildNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toQuerySyntax()).toBe('@size==10..20');
    });

    it('with #negate set to true', () => {
      const builder = buildNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @size==10..20');
    });
  });
});
