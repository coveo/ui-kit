import {describe, expect, it} from 'vitest';
import {readFromObject} from './object-utils';

describe('object-utils', () => {
  describe('#readFromObject', () => {
    it('should return string value for simple property', () => {
      const obj = {name: 'John'};

      expect(readFromObject(obj, 'name')).toBe('John');
    });

    it('should return string value for nested property', () => {
      const obj = {
        user: {
          profile: {
            name: 'Jane',
          },
        },
      };

      expect(readFromObject(obj, 'user.profile.name')).toBe('Jane');
    });

    it('should return undefined for non-existent property', () => {
      const obj = {name: 'John'};

      expect(readFromObject(obj, 'age')).toBeUndefined();
    });

    it('should return undefined for non-existent nested property', () => {
      const obj = {
        user: {
          name: 'John',
        },
      };

      expect(readFromObject(obj, 'user.profile.name')).toBeUndefined();
    });

    it('should return undefined when intermediate property is null', () => {
      const obj = {
        user: null,
      };

      expect(readFromObject(obj, 'user.name')).toBeUndefined();
    });

    it('should return undefined when intermediate property is undefined', () => {
      const obj = {
        user: undefined,
      };

      expect(readFromObject(obj, 'user.name')).toBeUndefined();
    });

    it('should return undefined for non-string values', () => {
      const obj = {
        count: 42,
        isActive: true,
        items: ['a', 'b', 'c'],
        config: {setting: 'value'},
      };

      expect(readFromObject(obj, 'count')).toBeUndefined();
      expect(readFromObject(obj, 'isActive')).toBeUndefined();
      expect(readFromObject(obj, 'items')).toBeUndefined();
      expect(readFromObject(obj, 'config')).toBeUndefined();
    });

    it('should handle empty string values', () => {
      const obj = {empty: ''};

      expect(readFromObject(obj, 'empty')).toBe('');
    });

    it('should handle string values in nested objects', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              value: 'deep value',
            },
          },
        },
      };

      expect(readFromObject(obj, 'level1.level2.level3.value')).toBe(
        'deep value'
      );
    });

    it('should handle mixed data types in path', () => {
      const obj = {
        user: {
          id: 123,
          name: 'Alice',
          active: true,
          metadata: {
            role: 'admin',
          },
        },
      };

      expect(readFromObject(obj, 'user.name')).toBe('Alice');
      expect(readFromObject(obj, 'user.metadata.role')).toBe('admin');
      expect(readFromObject(obj, 'user.id')).toBeUndefined();
      expect(readFromObject(obj, 'user.active')).toBeUndefined();
    });

    it('should handle arrays as intermediate values', () => {
      const obj = {
        items: ['item1', 'item2'],
        users: [{name: 'John'}, {name: 'Jane'}],
      };

      // Arrays are objects with numeric string keys, so this should work
      expect(readFromObject(obj, 'items.0')).toBe('item1');
      // The function can traverse into array elements that are objects
      expect(readFromObject(obj, 'users.0.name')).toBe('John');
    });

    it('should handle special characters in property names', () => {
      const obj = {
        'special-key': 'value1',
        'key with spaces': 'value2',
      };

      expect(readFromObject(obj, 'special-key')).toBe('value1');
      expect(readFromObject(obj, 'key with spaces')).toBe('value2');

      // This key contains dots which are used as separators, so it won't work as expected
      const objWithDots = {
        'key.with.dots': 'value3',
      };
      expect(readFromObject(objWithDots, 'key.with.dots')).toBeUndefined();
    });

    it('should handle numeric string keys', () => {
      const obj = {
        '123': 'numeric key',
        nested: {
          '456': 'nested numeric key',
        },
      };

      expect(readFromObject(obj, '123')).toBe('numeric key');
      expect(readFromObject(obj, 'nested.456')).toBe('nested numeric key');
    });

    it('should handle empty object', () => {
      const obj = {};

      expect(readFromObject(obj, 'any.key')).toBeUndefined();
    });

    it('should handle single character keys', () => {
      const obj = {
        a: {
          b: {
            c: 'alphabet',
          },
        },
      };

      expect(readFromObject(obj, 'a.b.c')).toBe('alphabet');
    });

    it('should handle prototype pollution attempts safely', () => {
      const obj = {
        user: {
          name: 'John',
        },
      };

      expect(readFromObject(obj, '__proto__.polluted')).toBeUndefined();
      expect(
        readFromObject(obj, 'constructor.prototype.polluted')
      ).toBeUndefined();
    });

    it('should handle objects with toString methods', () => {
      const objWithToString = {
        toString: () => 'custom toString',
        value: 'actual value',
      };

      expect(readFromObject(objWithToString, 'value')).toBe('actual value');
      expect(readFromObject(objWithToString, 'toString')).toBeUndefined();
    });

    it('should handle deeply nested objects', () => {
      const deepObj = {
        l1: {
          l2: {
            l3: {
              l4: {
                l5: {
                  l6: {
                    l7: {
                      value: 'very deep',
                    },
                  },
                },
              },
            },
          },
        },
      };

      expect(readFromObject(deepObj, 'l1.l2.l3.l4.l5.l6.l7.value')).toBe(
        'very deep'
      );
    });

    it('should handle objects with null prototype', () => {
      const obj = Object.create(null);
      obj.key = 'value';

      expect(readFromObject(obj, 'key')).toBe('value');
    });
  });
});
