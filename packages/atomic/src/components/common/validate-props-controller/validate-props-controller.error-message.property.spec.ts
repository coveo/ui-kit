import fc from 'fast-check';
import {z} from '@coveo/bueno/zod';
import {describe, it, expect} from 'vitest';
import {ValidatePropsController} from './validate-props-controller';

/**
 * Feature: atomic-bueno-zod-migration, Property 3: Error Message Content
 *
 * For any invalid prop value that violates a schema constraint,
 * the error message produced by the ValidatePropsController SHALL contain
 * the property path (field name) that failed validation.
 *
 * **Validates: Requirements 5.2, 5.4**
 */
describe('Property 3: Error Message Content', () => {
  function createMockHost() {
    const host = {
      error: undefined as Error | undefined,
      tagName: 'TEST-ELEMENT',
      addController: () => {},
      removeController: () => {},
      requestUpdate: () => {},
      updateComplete: Promise.resolve(true),
    };
    return host as unknown as HTMLElement & {error: Error} & {
      addController: (c: unknown) => void;
      removeController: (c: unknown) => void;
      requestUpdate: () => void;
      updateComplete: Promise<boolean>;
    };
  }

  const validIdentifierArb = fc
    .string({minLength: 1})
    .filter((s) => /^[a-z][a-zA-Z0-9]*$/.test(s));

  it('error message contains the field name when validation fails for a string schema', () => {
    fc.assert(
      fc.property(validIdentifierArb, (fieldName) => {
        const host = createMockHost();
        const schema = z.object({[fieldName]: z.string()});
        const invalidProps = {[fieldName]: 123};

        new ValidatePropsController(host, () => invalidProps, schema);

        host.addController = () => {};
        // Simulate hostUpdate to trigger validation
        const controller = new ValidatePropsController(
          host,
          () => invalidProps,
          schema
        );
        controller.hostConnected();
        controller.hostUpdate();

        expect(host.error).toBeInstanceOf(Error);
        expect(host.error!.message).toContain(fieldName);
      }),
      {numRuns: 100}
    );
  });

  it('error message contains the field name when validation fails for an enum schema', () => {
    fc.assert(
      fc.property(validIdentifierArb, (fieldName) => {
        const host = createMockHost();
        const schema = z.object({[fieldName]: z.enum(['allowed', 'values'])});
        const invalidProps = {[fieldName]: 'not-in-enum'};

        const controller = new ValidatePropsController(
          host,
          () => invalidProps,
          schema
        );
        controller.hostConnected();
        controller.hostUpdate();

        expect(host.error).toBeInstanceOf(Error);
        expect(host.error!.message).toContain(fieldName);
      }),
      {numRuns: 100}
    );
  });

  it('error message contains the field name when validation fails for a number schema', () => {
    fc.assert(
      fc.property(validIdentifierArb, (fieldName) => {
        const host = createMockHost();
        const schema = z.object({[fieldName]: z.number()});
        const invalidProps = {[fieldName]: 'not-a-number'};

        const controller = new ValidatePropsController(
          host,
          () => invalidProps,
          schema
        );
        controller.hostConnected();
        controller.hostUpdate();

        expect(host.error).toBeInstanceOf(Error);
        expect(host.error!.message).toContain(fieldName);
      }),
      {numRuns: 100}
    );
  });
});
