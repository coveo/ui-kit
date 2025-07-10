import {html} from 'lit';
import type {TemplateResultType} from 'lit/directive-helpers.js';
import '../components/common/atomic-component-error/atomic-component-error';
import type {
  GenericRender,
  LitElementWithError,
  RenderGuardDecorator,
} from './types';

/**
 * A decorator that guards the render method of a LitElement component against errors.
 *
 * It wraps the render method and checks for an `error` property on the component.
 * If an error is present, it logs the error to the console and renders an error message.
 * Otherwise, it calls the original render method.
 *
 * @example
 * ```typescript
 * @errorGuard()
 * render() {
 *   // ...
 * }
 * ```
 *
 * @returns A decorator function that wraps the render method with error handling logic.
 * @throws {Error} If the decorator is used on a method other than the render method.
 */
export function errorGuard<
  Component extends LitElementWithError,
  T extends TemplateResultType,
>(): RenderGuardDecorator<Component, T> {
  return (_, propertyKey, descriptor) => {
    if (descriptor?.value === undefined || propertyKey !== 'render') {
      throw new Error(
        '@errorGuard decorator can only be used on render method'
      );
    }
    const originalMethod = descriptor.value;
    descriptor.value = function (this: Component) {
      if (this.error) {
        return html`<atomic-component-error
          .error=${this.error}
          .element=${this as HTMLElement}
        ></atomic-component-error>` as GenericRender<T>;
      }
      return originalMethod.call(this);
    };
    return descriptor;
  };
}
