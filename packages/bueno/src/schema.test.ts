import {Schema} from './schema';
import {Value} from './values/value';

describe('schema', () => {
  describe('calling validate', () => {
    it('should return only the value(s) with a defined default', () => {
      const schema = new Schema({
        valueWithoutDefault: new Value<unknown>(),
        valueWithDefault: new Value<unknown>({default: 'default'}),
      });
      expect(schema.validate({})).toEqual({
        valueWithDefault: 'default',
      });
    });

    it('should not return the default if a value is defined', () => {
      const schema = new Schema({
        valueWithDefault: new Value<unknown>({default: 'default'}),
      });
      expect(schema.validate({valueWithDefault: 'defined'})).toEqual({
        valueWithDefault: 'defined',
      });
    });

    describe('when the values fail validation', () => {
      const schema = new Schema({
        requiredValue: new Value<unknown>({required: true}),
      });

      it('throws an error with the value that failed validation', () => {
        expect(() => schema.validate()).toThrow(
          'requiredValue: value is required'
        );
      });

      it('the error contains the passed context message', () => {
        const contextMessage = 'Check the options passed to buildSearchBox';
        const fn = () => schema.validate({}, contextMessage);

        expect(fn).toThrow(contextMessage);
      });
    });
  });
});
