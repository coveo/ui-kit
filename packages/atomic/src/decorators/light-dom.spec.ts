import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {html, LitElement} from 'lit';
import {vi} from 'vitest';
import {injectStylesForNoShadowDOM} from './light-dom';

describe('injectStylesForNoShadowDOM', () => {
  const styles = 'body { background-color: red; }';

  @injectStylesForNoShadowDOM(styles)
  class StyledElement extends LitElement {
    render() {
      return html`<div>Hello World</div>`;
    }
  }

  class ParentElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    connectedCallback() {
      // Move all children from light DOM to shadow DOM using a DocumentFragment
      const fragment = document.createDocumentFragment();
      while (this.childNodes.length > 0) {
        fragment.appendChild(this.childNodes[0]);
      }
      this.shadowRoot!.appendChild(fragment);
    }
  }

  customElements.define('parent-element', ParentElement);
  customElements.define('styled-element', StyledElement);

  it('should call appendChild only once', async () => {
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');
    await fixture(html`
      <styled-element></styled-element>
      <styled-element></styled-element>
      <styled-element></styled-element>
    `);
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
  });

  describe('when the element is added in a shadow dom', () => {
    beforeEach(async () => {
      await fixture(html`
        <parent-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
        </parent-element>
      `);
    });

    it('should tag the styles with the element local name as the id', async () => {
      const styleElement = document
        .querySelector('parent-element')
        ?.shadowRoot?.getElementById('styled-element');
      expect(styleElement).not.toBeNull();
    });

    it('should only have one style tag', async () => {
      const styleElement = document
        .querySelector('parent-element')
        ?.shadowRoot?.querySelectorAll('style');
      expect(styleElement?.length).toBe(1);
    });
  });

  describe('when the element is added directly into the dom', () => {
    beforeEach(async () => {
      await fixture(html`
        <styled-element></styled-element>
        <styled-element></styled-element>
        <styled-element></styled-element>
      `);
    });

    it('should inject styles into the head', async () => {
      const styleElement = document.head.querySelector('#styled-element');
      expect(styleElement).not.toBeNull();
    });

    it('should only have one style tag', async () => {
      const styleElement = document.head.querySelectorAll('#styled-element');
      expect(styleElement?.length).toBe(1);
    });
  });
});
