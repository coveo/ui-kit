import {type CSSResult, type LitElement, unsafeCSS} from 'lit';
import {buildCommerceLayout} from '../components/commerce/atomic-commerce-layout/commerce-layout';
import {injectStylesForNoShadowDOM} from '../decorators/inject-styles-for-no-shadow-dom';
import {randomID} from '../utils/utils';
import type {Constructor} from './mixin-common';

export interface CommerceLayoutRequirements {
  error: Error;
  mobileBreakpoint: string;
}

/**
 *
 * @param superClass The class to extend, typically a LitElement.
 * @param cssResult The CSSResult to inject into the component styles.
 * @returns A new class that extends the provided superClass with the commerce layout mixin.
 *
 * @remarks
 * Any Lit component using this mixin MUST declare the following public properties:
 * - `error: Error`
 * - `mobileBreakpoint: string`
 */
export const CommerceLayoutMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  cssResult: CSSResult
) => {
  @injectStylesForNoShadowDOM
  class CommerceLayoutMixinClass extends superClass {
    static styles = [cssResult];

    // biome-ignore lint/suspicious/noExplicitAny: <>
    constructor(...args: any[]) {
      super(...args);
      if (!this.id) {
        this.id = randomID('atomic-commerce-layout-');
      }
    }

    connectedCallback() {
      super.connectedCallback();

      // @ts-expect-error: Casting to CommerceLayoutRequirements to access required properties (`error`, `mobileBreakpoint`) without changing the mixin's template type from LitElement. This keeps the mixin simple but handles invalid values.
      const self = this as CommerceLayoutRequirements;

      if (self.mobileBreakpoint === undefined) {
        self.error = new Error(
          'The "mobileBreakpoint" property is not defined. Make sure the component is initialized with a valid value.'
        );
      }

      const layout = unsafeCSS(
        buildCommerceLayout(this, self.mobileBreakpoint)
      );
      CommerceLayoutMixinClass.styles.unshift(layout);
    }
  }

  return CommerceLayoutMixinClass as T;
};
