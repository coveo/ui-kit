import {html, type LitElement, nothing} from 'lit';
import type {TemplateResultType} from 'lit/directive-helpers.js';
import type {
  GenericRender,
  InitializableComponent,
  RenderGuardDecorator,
} from './types';

type LitElementWithBindings = Pick<InitializableComponent, 'bindings'> &
  LitElement;
/**
 * A decorator that guards the render method based on the presence of component bindings.
 *
 * This decorator is designed for LitElement components. It wraps the render method and checks for the `bindings` property
 * on the component. If the `bindings` property is not present or is false, the render method will return `nothing`.
 * If the `bindings` property is present and true, it calls the original render method.
 *
 * This decorator works in conjunction with the @initializeBindings decorator.
 *
 * @example
 * ```typescript
 * import { bindingGuard } from './decorators/binding-guard';
 * import { initializeBindings } from './decorators/initialize-bindings';
 *
 * class MyElement extends LitElement {
 *   @initializeBindings() bindings!: Bindings;
 *
 *   @bindingGuard()
 *   render() {
 *     return html`<div>Content to render when bindings are present</div>`;
 *   }
 * }
 * @throws {Error} If the decorator is used on a method other than the render method.
 */
export function bindingGuard<
  Component extends LitElementWithBindings,
  T extends TemplateResultType,
>(): RenderGuardDecorator<Component, T> {
  return (_, propertyKey, descriptor) => {
    if (descriptor?.value === undefined || propertyKey !== 'render') {
      throw new Error(
        '@bindingGuard decorator can only be used on render method'
      );
    }
    const originalMethod = descriptor.value;
    descriptor.value = function (this: Component) {
      return this.bindings
        ? originalMethod?.call(this)
        : (html`${nothing}` as GenericRender<T>);
    };
    return descriptor;
  };
}
