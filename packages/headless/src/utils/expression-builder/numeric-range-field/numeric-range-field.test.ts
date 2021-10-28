import {buildNumericRangeField} from './numeric-range-field';

describe('#buildNumericRangeField', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toString()).toBe('@size==10..20');
    });

    it('with #negate set to true', () => {
      const builder = buildNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
        negate: true,
      });

      expect(builder.toString()).toBe('NOT @size==10..20');
    });
  });
});
