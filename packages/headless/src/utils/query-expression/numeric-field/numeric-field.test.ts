import {buildNumericField} from './numeric-field.js';

describe('#buildNumericField', () => {
  describe('#toQuerySyntax', () => {
    it('#greaterThan operator', () => {
      const builder = buildNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 10,
      });

      expect(builder.toQuerySyntax()).toBe('@size>10');
    });

    it('#greaterThanOrEqual operator', () => {
      const builder = buildNumericField({
        field: 'size',
        operator: 'greaterThanOrEqual',
        value: 10,
      });

      expect(builder.toQuerySyntax()).toBe('@size>=10');
    });

    it('#lowerThan operator', () => {
      const builder = buildNumericField({
        field: 'size',
        operator: 'lowerThan',
        value: 10,
      });

      expect(builder.toQuerySyntax()).toBe('@size<10');
    });

    it('#lowerThanOrEqual operator', () => {
      const builder = buildNumericField({
        field: 'size',
        operator: 'lowerThanOrEqual',
        value: 10,
      });

      expect(builder.toQuerySyntax()).toBe('@size<=10');
    });

    it('#negate set to true', () => {
      const builder = buildNumericField({
        field: 'size',
        operator: 'lowerThanOrEqual',
        value: 10,
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @size<=10');
    });
  });
});
