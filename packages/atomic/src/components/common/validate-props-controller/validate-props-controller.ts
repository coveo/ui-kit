import * as z from '@coveo/bueno/zod';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {deepEqual} from '@/src/utils/compare-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema = z.ZodMiniType<any>;

export class ValidatePropsController<
  TProps extends Record<string, unknown>,
> implements ReactiveController {
  private currentProps?: TProps;
  private previousProps?: TProps;
  private lastValidationError?: Error;

  constructor(
    private host: ReactiveControllerHost & HTMLElement & {error: Error},
    private getProps: () => TProps,
    private schema: AnyZodSchema,
    private throwOnError: boolean = true
  ) {
    host.addController(this);
  }

  hostConnected() {
    if (this.host.error === null) {
      // @ts-expect-error: we need to set the error to undefined if it was null.
      this.host.error = undefined;
    }
  }

  hostUpdate() {
    if (this.host.error && this.host.error !== this.lastValidationError) {
      return;
    }
    this.currentProps = this.getProps();

    if (deepEqual(this.currentProps, this.previousProps)) {
      return;
    }

    // @ts-expect-error: we need to clear the error.
    this.host.error = undefined;
    this.validateProps();
  }

  private validateProps() {
    const result = this.schema.safeParse(this.currentProps);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = issue.path.length > 0 ? issue.path.join('.') : '';
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join('; ');

      if (this.throwOnError) {
        const error = new Error(message);
        this.host.error = error;
        this.lastValidationError = error;
      } else {
        const warnMsg = `Prop validation failed for component ${this.host.tagName?.toLowerCase()}: ${message}`;
        console.warn(warnMsg, this.host);
      }
    }
    this.previousProps = this.currentProps;
  }
}
