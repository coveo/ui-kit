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

    it('should throw an error when the values are failing validation', () => {
      const schema = new Schema({
        requiredValue: new Value<unknown>({required: true}),
      });

      expect(() => schema.validate()).toThrow();
    });
  });
});
