import {Constructor} from './base';

/**
 * Allow for custom element classes with private constructors
 */
type CustomElementClass = Omit<typeof HTMLElement, 'new'>;

export type CustomElementDecorator = {
  (target: CustomElementClass): void;
};

/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * Replaces the `@customElement` decorator from Lit with a implementation that
 * checks if the custom element is already defined before defining it.
 *
 * ```js
 * @atomicElement('my-element')
 * class MyElement extends LitElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 * @param tagName The tag name of the atomic element to define.
 */
export const atomicElement =
  (tagName: string): CustomElementDecorator =>
  (classOrTarget: CustomElementClass | Constructor<HTMLElement>) => {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, classOrTarget as CustomElementConstructor);
    }
  };
