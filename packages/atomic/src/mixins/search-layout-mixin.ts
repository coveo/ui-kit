import {CSSResult, LitElement, unsafeCSS} from 'lit';
import {buildSearchLayout} from '../components/search/atomic-search-layout/search-layout';
import {injectStylesForNoShadowDOM} from '../decorators/light-dom';
import {randomID} from '../utils/utils';
import {Constructor} from './mixin-common';

export interface SearchLayoutRequirements {
  error: Error;
  mobileBreakpoint: string;
}

/**
 *
 * @param superClass The class to extend, typically a LitElement.
 * @param cssResult The CSSResult to inject into the component styles.
 * @returns A new class that extends the provided superClass with the search layout mixin.
 *
 * @remarks
 * Any Lit component using this mixin MUST declare the following public properties:
 * - `error: Error`
 * - `mobileBreakpoint: string`
 */
export const SearchLayoutMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  cssResult: CSSResult
) => {
  @injectStylesForNoShadowDOM
  class SearchLayoutMixinClass extends superClass {
    static styles = [cssResult];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      if (!this.id) {
        this.id = randomID('atomic-search-layout-');
      }
    }

    connectedCallback() {
      super.connectedCallback();

      // @ts-expect-error: Casting to SearchLayoutRequirements to access required properties (`error`, `mobileBreakpoint`) without changing the mixin's template type from LitElement. This keeps the mixin simple but handles invalid values.
      const self = this as SearchLayoutRequirements;

      if (self.mobileBreakpoint === undefined) {
        self.error = new Error(
          'The "mobileBreakpoint" property is not defined. Make sure the component is initialized with a valid value.'
        );
      }

      const layout = unsafeCSS(buildSearchLayout(this, self.mobileBreakpoint));
      SearchLayoutMixinClass.styles.unshift(layout);
    }
  }

  return SearchLayoutMixinClass as T;
};
