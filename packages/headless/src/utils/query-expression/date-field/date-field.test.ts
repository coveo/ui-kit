import {buildDateField} from './date-field.js';

describe('#buildDateField', () => {
  describe('#toQuerySyntax', () => {
    it('with #negate not specified', () => {
      const builder = buildDateField({
        field: 'date',
        operator: 'greaterThan',
        value: '2021/01/21',
      });

      expect(builder.toQuerySyntax()).toBe('@date>2021/01/21');
    });

    it('with #negate set to true', () => {
      const builder = buildDateField({
        field: 'date',
        operator: 'greaterThan',
        value: '2021/01/21',
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @date>2021/01/21');
    });
  });
});
