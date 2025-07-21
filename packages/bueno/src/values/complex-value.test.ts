import {describe, expect, it} from 'vitest';
import {BooleanValue} from './boolean-value.js';
import {ArrayValue, RecordValue} from './complex-value.js';
import {NumberValue} from './number-value.js';
import {StringValue} from './string-value.js';

describe('complex value', () => {
  describe('record value', () => {
    describe('can validate', () => {
      it('boolean value', () => {
        const v = new RecordValue({
          values: {
            foo: new BooleanValue({required: true}),
          },
        });

        expect(v.validate({foo: undefined})).not.toBeNull();
        expect(v.validate({foo: true})).toBeNull();
      });

      it('number value', () => {
        const v = new RecordValue({
          values: {
            foo: new NumberValue({required: true, min: 5}),
          },
        });
        expect(v.validate({foo: 4})).not.toBeNull();
        expect(v.validate({foo: 5})).toBeNull();
        expect(
          new RecordValue({
            values: {
              foo: new NumberValue({required: true, min: 5}),
            },
          }).validate({foo: 4})
        ).not.toBeNull();
      });

      it('string value', () => {
        const v = new RecordValue({
          values: {
            foo: new StringValue({required: true}),
          },
        });
        expect(v.validate({foo: 4})).not.toBeNull();
        expect(v.validate({foo: 'hello'})).toBeNull();
      });

      it('record value', () => {
        const v = new RecordValue({
          values: {
            foo: new RecordValue({
              values: {
                bar: new RecordValue({
                  values: {
                    bazz: new NumberValue({required: true, min: 1, max: 10}),
                  },
                }),
              },
            }),
          },
        });

        expect(v.validate({foo: false})).not.toBeNull();
        expect(v.validate({foo: {bar: {bazz: 5}}})).toBeNull();
      });

      it('array value', () => {
        const v = new RecordValue({
          values: {
            foo: new ArrayValue({
              each: new NumberValue({min: 1, max: 3}),
              min: 1,
            }),
            bar: new StringValue({required: true, emptyAllowed: false}),
          },
        });

        expect(v.validate({foo: [1, 2, 3], bar: 'test'})).toBeNull();
        expect(v.validate({foo: [4, 5, 6], bar: 'test'})).not.toBeNull();
      });

      it('required', () => {
        const v = new RecordValue({
          options: {required: true},
          values: {
            foo: new StringValue({required: false, emptyAllowed: false}),
            bar: new NumberValue({required: false}),
          },
        });
        expect(v.validate({})).toBeNull();
        expect(v.validate(undefined)).not.toBeNull();
        expect(v.validate({foo: 'bar'})).toBeNull();
        expect(v.validate({foo: 'bar', bar: 10})).toBeNull();
      });

      it('not required', () => {
        const v = new RecordValue({
          options: {required: false},
          values: {
            foo: new StringValue({required: true, emptyAllowed: false}),
            bar: new NumberValue({required: false}),
          },
        });
        expect(v.validate({})).not.toBeNull();
        expect(v.validate(undefined)).toBeNull();
        expect(v.validate({foo: 'bar'})).toBeNull();
        expect(v.validate({foo: 'bar', bar: 10})).toBeNull();
      });

      it('empty record should be accepted if no property is required', () => {
        const v = new RecordValue({
          values: {
            foo: new BooleanValue({required: false}),
          },
        });

        expect(v.validate({})).toBeNull();
      });

      it('empty record should not be accepted if a property is required', () => {
        const v = new RecordValue({
          values: {
            foo: new BooleanValue({required: true}),
          },
        });

        expect(v.validate({})).not.toBeNull();
      });

      it('not a record', () => {
        const v = new RecordValue({
          values: {
            foo: new BooleanValue(),
          },
        });

        expect(v.validate('yo')).not.toBeNull();
      });

      it('record with many keys', () => {
        const v = new RecordValue({
          values: {
            foo: new BooleanValue(),
            bar: new StringValue({required: true}),
          },
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

      it('record with unknown keys, it ignores the unknown keys', () => {
        const v = new RecordValue({
          values: {
            foo: new BooleanValue(),
            bar: new StringValue({required: true}),
          },
        });

        expect(
          v.validate({
            foo: true,
            bar: 'hello',
            whatIsThis: 123,
          })
        ).toBeNull();
      });
    });
  });

  describe('array value', () => {
    describe('can validate', () => {
      it('min and max', () => {
        const v = new ArrayValue({
          min: 1,
          max: 2,
        });

        expect(v.validate([])).not.toBeNull();

        expect(v.validate([1, 2, 3])).not.toBeNull();

        expect(v.validate([1])).toBeNull();
        expect(v.validate(['yo'])).toBeNull();
        expect(v.validate([true])).toBeNull();
        expect(v.validate(null)).toBeNull();
        expect(v.validate(undefined)).toBeNull();
      });

      it('each', () => {
        const v = new ArrayValue({
          each: new NumberValue({required: true, max: 5}),
        });

        expect(v.validate([6, 7, 8])).not.toBeNull();
        expect(v.validate(['hello'])).not.toBeNull();
        expect(v.validate([true])).not.toBeNull();
        expect(v.validate([0, 1, 2, 3, 4, null])).not.toBeNull();
        expect(v.validate([0, 1, 2, 3, 4, undefined])).not.toBeNull();

        expect(v.validate(null)).toBeNull();
        expect(v.validate(undefined)).toBeNull();
        expect(v.validate([0, 1, 2, 3, 4, 5])).toBeNull();
      });

      it('each RecordValue', () => {
        const v = new ArrayValue({
          min: 2,
          max: 4,
          each: new RecordValue({
            values: {
              foo: new NumberValue({required: true, min: 1, max: 2}),
              bar: new ArrayValue({
                required: true,
                min: 2,
                max: 3,
                each: new StringValue({required: true, emptyAllowed: false}),
              }),
            },
          }),
        });

        expect(
          v.validate([
            {foo: 1, bar: ['foo', 'bar']},
            {foo: 2, bar: ['Coveo', 'JSUI']},
          ])
        ).toBeNull();
        expect(v.validate([{foo: 1, bar: ['foo', 'bar']}])).not.toBeNull();
        expect(
          v.validate([
            {foo: 1, bar: ['foo', 'bar']},
            {foo: 5, bar: ['Coveo', 'JSUI']},
          ])
        ).not.toBeNull();
        expect(
          v.validate([
            {foo: 1, bar: ['foo']},
            {foo: 2, bar: ['Coveo', 'JSUI']},
          ])
        ).not.toBeNull();
        expect(
          v.validate([
            {foo: 1, bar: ['foo', '']},
            {foo: 2, bar: ['Coveo', 'JSUI']},
          ])
        ).not.toBeNull();
        expect(
          v.validate([
            {foo: 1, bar: ['foo', 3]},
            {foo: 2, bar: ['Coveo', 'JSUI']},
          ])
        ).not.toBeNull();
      });

      it('required', () => {
        const v = new ArrayValue({
          required: true,
        });

        expect(v.validate(null)).not.toBeNull();
        expect(v.validate(undefined)).not.toBeNull();

        expect(v.validate([null])).toBeNull();
        expect(v.validate([undefined])).toBeNull();
        expect(v.validate([1, 2, 3, 4, 5])).toBeNull();
        expect(v.validate([true, false])).toBeNull();
      });
    });
  });
});
