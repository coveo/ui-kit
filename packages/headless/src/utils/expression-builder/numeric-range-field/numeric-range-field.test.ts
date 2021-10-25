import {buildNumericRangeField} from './numeric-range-field';

describe('#buildNumericRangeField', () => {
  describe('#toString', () => {
    it('with #negatable not specified', () => {
      const builder = buildNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toString()).toBe('@size==10..20');
    });

    it('with #negatable set to true', () => {
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
