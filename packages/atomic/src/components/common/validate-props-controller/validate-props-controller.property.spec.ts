import * as z from '@coveo/bueno/zod';
import fc from 'fast-check';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {ValidatePropsController} from './validate-props-controller';

/**
 * Feature: atomic-bueno-zod-migration, Property 2: ValidatePropsController safeParse Contract
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.5
 *
 * For any Zod schema and for any props object, when props change (not deep-equal
 * to previous), the ValidatePropsController SHALL call safeParse and:
 * - set host.error to an Error when validation fails and throwOnError is true
 * - log a warning when validation fails and throwOnError is false
 * - leave host.error as undefined when validation succeeds
 */
describe('Property 2: ValidatePropsController safeParse Contract', () => {
  const schema = z.object({
    value: z.string(),
  });

  function createMockHost() {
    const host = {
      error: undefined as Error | undefined,
      tagName: 'TEST-ELEMENT',
      addController: vi.fn(),
    } as unknown as HTMLElement & {
      error: Error;
      addController: ReturnType<typeof vi.fn>;
    };
    return host;
  }

  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('when validation succeeds (valid props), host.error is undefined', () => {
    it('clears host.error for any valid string prop', () => {
      fc.assert(
        fc.property(fc.string(), (value) => {
          const host = createMockHost();
          let currentProps = {value};
          const controller = new ValidatePropsController(
            host as unknown as HTMLElement & {error: Error},
            () => currentProps,
            schema,
            true
          );

          controller.hostUpdate();

          expect(host.error).toBeUndefined();
        }),
        {numRuns: 100}
      );
    });
  });

  describe('when validation fails and throwOnError=true, host.error is an Error instance', () => {
    it('sets host.error to an Error for any non-string value prop', () => {
      const invalidValueArb = fc.oneof(
        fc.integer(),
        fc.boolean(),
        fc.constant(null),
        fc.array(fc.integer())
      );

      fc.assert(
        fc.property(invalidValueArb, (invalidValue) => {
          const host = createMockHost();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let currentProps = {value: invalidValue as any};
          const controller = new ValidatePropsController(
            host as unknown as HTMLElement & {error: Error},
            () => currentProps,
            schema,
            true
          );

          controller.hostUpdate();

          expect(host.error).toBeInstanceOf(Error);
        }),
        {numRuns: 100}
      );
    });
  });

  describe('when validation fails and throwOnError=false, console.warn is called and host.error stays undefined', () => {
    it('logs a warning and does not set host.error for any non-string value prop', () => {
      const invalidValueArb = fc.oneof(
        fc.integer(),
        fc.boolean(),
        fc.constant(null),
        fc.array(fc.integer())
      );

      fc.assert(
        fc.property(invalidValueArb, (invalidValue) => {
          const host = createMockHost();
          consoleWarnSpy.mockClear();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let currentProps = {value: invalidValue as any};
          const controller = new ValidatePropsController(
            host as unknown as HTMLElement & {error: Error},
            () => currentProps,
            schema,
            false
          );

          controller.hostUpdate();

          expect(host.error).toBeUndefined();
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Prop validation failed for component'),
            host
          );
        }),
        {numRuns: 100}
      );
    });
  });

  describe('when props change from invalid to valid, host.error is cleared', () => {
    it('clears previously set error when props become valid', () => {
      const invalidValueArb = fc.oneof(
        fc.integer(),
        fc.boolean(),
        fc.constant(null),
        fc.array(fc.integer())
      );

      fc.assert(
        fc.property(
          invalidValueArb,
          fc.string(),
          (invalidValue, validValue) => {
            const host = createMockHost();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let currentProps: {value: any} = {value: invalidValue};
            const getProps = () => currentProps;
            const controller = new ValidatePropsController(
              host as unknown as HTMLElement & {error: Error},
              getProps,
              schema,
              true
            );

            controller.hostUpdate();
            expect(host.error).toBeInstanceOf(Error);

            currentProps = {value: validValue};
            controller.hostUpdate();

            expect(host.error).toBeUndefined();
          }
        ),
        {numRuns: 100}
      );
    });
  });
});
