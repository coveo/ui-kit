import {buildDateRangeField} from './date-range-field';

describe('#buildDateRangeField', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildDateRangeField({
        field: 'date',
        from: '2021/01/21',
        to: '2021/06/21',
      });

      expect(builder.toString()).toBe('@date==2021/01/21..2021/06/21');
    });

    it('with #negate set to true', () => {
      const builder = buildDateRangeField({
        field: 'date',
        from: '2021/01/21',
        to: '2021/06/21',
        negate: true,
      });

      expect(builder.toString()).toBe('NOT @date==2021/01/21..2021/06/21');
    });
  });
});
