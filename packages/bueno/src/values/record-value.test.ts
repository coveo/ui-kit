import {RecordValue} from './record-value';
import {BooleanValue} from './boolean-value';
import {NumberValue} from './number-value';
import {StringValue} from './string-value';

describe('record value', () => {
  describe('can validate', () => {
    it('boolean value', () => {
      const v = new RecordValue({
        foo: new BooleanValue({required: true}),
      });

      expect(v.validate({foo: undefined})).not.toBeNull();
      expect(v.validate({foo: true})).toBeNull();
    });

    it('number value', () => {
      const v = new RecordValue({
        foo: new NumberValue({required: true, min: 5}),
      });
      expect(v.validate({foo: 4})).not.toBeNull();
      expect(v.validate({foo: 5})).toBeNull();
      expect(
        new RecordValue({
          foo: new NumberValue({required: true, min: 5}),
        }).validate({foo: 4})
      ).not.toBeNull();
    });

    it('string value', () => {
      const v = new RecordValue({
        foo: new StringValue({required: true}),
      });
      expect(v.validate({foo: 4})).not.toBeNull();
      expect(v.validate({foo: 'hello'})).toBeNull();
    });

    it('record value', () => {
      const v = new RecordValue({
        foo: new RecordValue({
          bar: new RecordValue({
            bazz: new NumberValue({required: true, min: 1, max: 10}),
          }),
        }),
      });

      expect(v.validate({foo: false})).not.toBeNull();
      expect(v.validate({foo: {bar: {bazz: 5}}})).toBeNull();
    });
    it('empty record should be accepted if no property is required', () => {
      const v = new RecordValue({
        foo: new BooleanValue({required: false}),
      });

      expect(v.validate({})).toBeNull();
    });

    it('empty record should not be accepted if a property is required', () => {
      const v = new RecordValue({
        foo: new BooleanValue({required: true}),
      });

      expect(v.validate({})).not.toBeNull();
    });

    it('not a record', () => {
      const v = new RecordValue({
        foo: new BooleanValue(),
      });

      expect(v.validate('yo')).not.toBeNull();
    });

    it('record with many keys', () => {
      const v = new RecordValue({
        foo: new BooleanValue(),
        bar: new StringValue({required: true}),
      });

      expect(
        v.validate({
          foo: true,
        })
      ).not.toBeNull();

      expect(
        v.validate({
          foo: true,
          bar: undefined,
        })
      ).not.toBeNull();

      expect(
        v.validate({
          foo: true,
          bar: 'hello',
        })
      ).toBeNull();
    });

    it('record with too many keys', () => {
      const v = new RecordValue({
        foo: new BooleanValue(),
        bar: new StringValue({required: true}),
      });

      expect(
        v.validate({
          foo: true,
          bar: 'hello',
          whatIsThis: 123,
        })
      ).not.toBeNull();
    });
  });
});
