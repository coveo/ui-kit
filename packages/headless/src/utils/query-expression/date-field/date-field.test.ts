import {buildDateField} from './date-field';

describe('#buildDateField', () => {
  describe('#toString', () => {
    it('with #negate not specified', () => {
      const builder = buildDateField({
        field: 'date',
        operator: 'greaterThan',
        value: '2021/01/21',
      });

      expect(builder.toString()).toBe('@date>2021/01/21');
    });

    it('with #negate set to true', () => {
      const builder = buildDateField({
        field: 'date',
        operator: 'greaterThan',
        value: '2021/01/21',
        negate: true,
      });

      expect(builder.toString()).toBe('NOT @date>2021/01/21');
    });
  });
});
