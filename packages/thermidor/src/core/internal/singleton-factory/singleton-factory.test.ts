import {describe, it, expect, vi} from 'vitest';
import {SingletonFactory} from './singleton-factory.js';

describe('SingletonFactory', () => {
  it('should return a value computed by the factory', () => {
    const get = SingletonFactory((key: string) => `value-${key}`);

    expect(get('a')).toBe('value-a');
  });

  it('should return the same reference for the same key', () => {
    const get = SingletonFactory((key: string) => ({id: key}));

    const first = get('x');
    const second = get('x');

    expect(first).toBe(second);
  });

  it('should return different values for different keys', () => {
    const get = SingletonFactory((key: string) => ({id: key}));

    const a = get('a');
    const b = get('b');

    expect(a).not.toBe(b);
    expect(a.id).toBe('a');
    expect(b.id).toBe('b');
  });

  it('should call the factory exactly once per key', () => {
    const factory = vi.fn((key: string) => key.toUpperCase());
    const get = SingletonFactory(factory);

    get('hello');
    get('hello');
    get('hello');

    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith('hello');
  });

  describe('with custom keyFn', () => {
    interface Scope {
      interfaceId: string;
      composedInterfaceId?: string;
    }

    it('should use the derived key for caching', () => {
      const factory = vi.fn((scope: Scope) => ({scope}));
      const get = SingletonFactory<string, {scope: Scope}, Scope>(
        factory,
        (scope) => scope.composedInterfaceId ?? scope.interfaceId
      );

      const scope1: Scope = {interfaceId: 'a', composedInterfaceId: 'shared'};
      const scope2: Scope = {interfaceId: 'b', composedInterfaceId: 'shared'};

      const result1 = get(scope1);
      const result2 = get(scope2);

      expect(result1).toBe(result2);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should pass the original argument to the factory', () => {
      const factory = vi.fn((scope: Scope) => scope.interfaceId);
      const get = SingletonFactory<string, string, Scope>(
        factory,
        (scope) => scope.composedInterfaceId ?? scope.interfaceId
      );

      const scope: Scope = {
        interfaceId: 'original',
        composedInterfaceId: 'key',
      };
      get(scope);

      expect(factory).toHaveBeenCalledWith(scope);
    });

    it('should produce different entries for different derived keys', () => {
      const factory = vi.fn((scope: Scope) => ({id: scope.interfaceId}));
      const get = SingletonFactory<string, {id: string}, Scope>(
        factory,
        (scope) => scope.interfaceId
      );

      const a = get({interfaceId: 'x'});
      const b = get({interfaceId: 'y'});

      expect(a).not.toBe(b);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });
});
