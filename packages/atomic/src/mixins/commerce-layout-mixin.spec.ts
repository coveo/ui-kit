import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {LitElement, unsafeCSS, html, CSSResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, it, expect, vi} from 'vitest';
import {buildCommerceLayout} from '../components/commerce/atomic-commerce-layout/commerce-layout';
import {DEFAULT_MOBILE_BREAKPOINT} from '../utils/replace-breakpoint';
import {CommerceLayoutMixin} from './commerce-layout-mixin';

vi.mock('../components/commerce/atomic-commerce-layout/commerce-layout', {
  spy: true,
});

const dummyCss = '.foo { color: red; }';

@customElement('test-commerce-layout')
class TestElement extends CommerceLayoutMixin(LitElement, unsafeCSS(dummyCss)) {
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;
}

const setupElement = async (props?: {breakpoint?: string}) => {
  const element = (await fixture(
    html`<test-commerce-layout
      mobile-breakpoint="${ifDefined(props?.breakpoint)}"
    ></test-commerce-layout>`
  )) as TestElement;
  return element;
};

describe('CommerceLayoutMixin', () => {
  it('should call #mockBuildCommerceLayout with default mobileBreakpoint', async () => {
    const element = await setupElement();
    const mockBuildCommerceLayout = vi.mocked(buildCommerceLayout);
    expect(mockBuildCommerceLayout).toHaveBeenCalledWith(
      element,
      DEFAULT_MOBILE_BREAKPOINT
    );
  });

  it('should call #mockBuildCommerceLayout with specified mobileBreakpoint', async () => {
    const element = await setupElement({breakpoint: '600px'});
    const mockBuildCommerceLayout = vi.mocked(buildCommerceLayout);
    expect(mockBuildCommerceLayout).toHaveBeenCalledWith(element, '600px');
  });

  it('should set a random id if not present', async () => {
    const element = await setupElement();
    expect(element.id).toMatch(/^atomic-commerce-layout-/);
  });

  it('should only have one CSS style in the component style array (control test)', async () => {
    @customElement('baseline-element')
    class BaselineElement extends LitElement {
      static styles = [unsafeCSS(dummyCss)];
    }
    const element = (await fixture(
      html`<baseline-element></baseline-element>`
    )) as BaselineElement;
    const stylesArr = (element.constructor as typeof TestElement)
      .styles! as CSSResult[];
    expect(stylesArr.length).toBe(1);
  });

  it('should add dynamic layout CSS to styles on connectedCallback', async () => {
    const element = await setupElement();
    const stylesArr = (element.constructor as typeof TestElement)
      .styles! as CSSResult[];
    expect(stylesArr.length).toBeGreaterThan(1);
  });
});
