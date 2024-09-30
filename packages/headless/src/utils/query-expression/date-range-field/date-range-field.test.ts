import {buildDateRangeField} from './date-range-field.js';

describe('#buildDateRangeField', () => {
  describe('#toQuerySyntax', () => {
    it('with #negate not specified', () => {
      const builder = buildDateRangeField({
        field: 'date',
        from: '2021/01/21',
        to: '2021/06/21',
      });

      expect(builder.toQuerySyntax()).toBe('@date==2021/01/21..2021/06/21');
    });

    it('with #negate set to true', () => {
      const builder = buildDateRangeField({
        field: 'date',
        from: '2021/01/21',
        to: '2021/06/21',
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @date==2021/01/21..2021/06/21');
    });
  });
});
