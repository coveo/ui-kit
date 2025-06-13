import {CSSResult, LitElement, unsafeCSS} from 'lit';
import {buildCommerceLayout} from '../components/commerce/atomic-commerce-layout/commerce-layout';
import {injectStylesForNoShadowDOM} from '../decorators/light-dom';
import {DEFAULT_MOBILE_BREAKPOINT} from '../utils/replace-breakpoint';
import {randomID} from '../utils/utils';
import {Constructor} from './mixin-common';

export const CommerceLayoutMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  cssResult: CSSResult
) => {
  @injectStylesForNoShadowDOM
  class CommerceLayoutMixinClass extends superClass {
    protected mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

    static styles = [cssResult];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      if (!this.id) {
        this.id = randomID('atomic-commerce-layout-');
      }
    }

    connectedCallback() {
      super.connectedCallback();
      const layout = unsafeCSS(
        buildCommerceLayout(this, this.mobileBreakpoint)
      );
      CommerceLayoutMixinClass.styles.unshift(layout);
    }
  }

  return CommerceLayoutMixinClass as T;
};
