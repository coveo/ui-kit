import * as z from '@coveo/bueno/zod';
import fc from 'fast-check';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {ValidatePropsController} from './validate-props-controller';

/**
 * Feature: atomic-bueno-zod-migration, Property 4: Validation Skip on Unchanged Props
 * Validates: Requirements 2.8
 *
 * For any sequence of `hostUpdate` calls where the props returned by `getProps()`
 * are deep-equal to the previous props, the ValidatePropsController SHALL NOT
 * invoke `safeParse` on the schema, preserving the existing optimization.
 */
describe('Property 4: Validation Skip on Unchanged Props', () => {
  function createMockHost() {
    const host = {
      error: undefined as Error | undefined,
      tagName: 'TEST-ELEMENT',
      addController(_controller: ReactiveController) {},
    } as unknown as ReactiveControllerHost & HTMLElement & {error: Error};
    return host;
  }

  it('safeParse is not called on the second hostUpdate when props are unchanged', () => {
    const schema = z.record(z.unknown());

    fc.assert(
      fc.property(
        fc.dictionary(fc.string({minLength: 1, maxLength: 10}), fc.string(), {
          minKeys: 0,
          maxKeys: 5,
        }),
        (props) => {
          const host = createMockHost();
          const getProps = () => ({...props});

          const controller = new ValidatePropsController(
            host,
            getProps,
            schema
          );

          controller.hostUpdate();

          const safeParseSpy = vi.spyOn(schema, 'safeParse');

          controller.hostUpdate();

          expect(safeParseSpy).not.toHaveBeenCalled();

          safeParseSpy.mockRestore();
        }
      ),
      {numRuns: 100}
    );
  });
});
