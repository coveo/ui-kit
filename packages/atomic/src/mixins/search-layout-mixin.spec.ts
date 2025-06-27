import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {LitElement, unsafeCSS, html, CSSResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, it, expect, vi} from 'vitest';
import {buildSearchLayout} from '../components/search/atomic-search-layout/search-layout';
import {SearchLayoutMixin} from './search-layout-mixin';

vi.mock('../components/search/atomic-search-layout/search-layout', {
  spy: true,
});

const dummyCss = '.foo { color: red; }';

@customElement('test-search-layout')
class TestElement extends SearchLayoutMixin(LitElement, unsafeCSS(dummyCss)) {
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint?: string;
  @state() error!: Error;
}

const setupElement = async (props?: {breakpoint?: string}) => {
  const element = (await fixture(
    html`<test-search-layout
      mobile-breakpoint="${ifDefined(props?.breakpoint)}"
    ></test-search-layout>`
  )) as TestElement;
  return element;
};

describe('SearchLayoutMixin', () => {
  it('should call #buildSearchLayout with specified mobileBreakpoint', async () => {
    const element = await setupElement({breakpoint: '600px'});
    const mockBuildSearchLayout = vi.mocked(buildSearchLayout);
    expect(mockBuildSearchLayout).toHaveBeenCalledWith(element, '600px');
  });

  it('should set a random id if not present', async () => {
    const element = await setupElement();
    expect(element.id).toMatch(/^atomic-search-layout-/);
  });

  it('should only have one CSS style in the component style array when using baseline', async () => {
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

  it('should set error property when mobileBreakpoint is undefined', async () => {
    const element = await setupElement();
    expect(element.mobileBreakpoint).toBe(undefined);
    expect(element.error).toBeInstanceOf(Error);
    expect(element.error.message).toContain(
      'The "mobileBreakpoint" property is not defined'
    );
  });
});
