import {css, html, LitElement, unsafeCSS} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {injectStylesForNoShadowDOM} from './light-dom';

describe('injectStylesForNoShadowDOM', () => {
  const styles = 'body { background-color: red; }';

  @injectStylesForNoShadowDOM
  class ComplexStyledElement extends LitElement {
    static styles = [
      unsafeCSS(styles),
      unsafeCSS(css`
        div {
          color: blue;
        }
      `),
    ];
    render() {
      return html`<div>children element</div>`;
    }
  }

  @injectStylesForNoShadowDOM
  class StyledElement extends LitElement {
    static styles = unsafeCSS(styles);
    render() {
      return html`<div>children element</div>`;
    }
  }

  class UnstyledElement extends LitElement {
    static styles = unsafeCSS(styles);
    render() {
      return html`<div>children element</div>`;
    }
  }

  class LightDomParentElement extends HTMLElement {
    render() {
      return html`<slot></slot>`;
    }
  }

  class ShadownDomParentElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
      const fragment = document.createDocumentFragment();
      while (this.childNodes.length > 0) {
        fragment.appendChild(this.childNodes[0]);
      }
      this.shadowRoot!.appendChild(fragment);
    }
  }

  customElements.define('light-dom-parent-element', LightDomParentElement);
  customElements.define('shadow-dom-parent-element', ShadownDomParentElement);
  customElements.define('styled-element', StyledElement);
  customElements.define('complex-styled-element', ComplexStyledElement);
  customElements.define('unstyled-element', UnstyledElement);

  describe('when the element added in a shadow dom does not contain style', () => {
    beforeEach(async () => {
      await fixture(html`
        <shadow-dom-parent-element>
          <unstyled-element></unstyled-element>
          <unstyled-element></unstyled-element>
          <unstyled-element></unstyled-element>
        </shadow-dom-parent-element>
      `);
    });

    it("should not add any css in the parent's adoptedStyleSheets", async () => {
      const styleElement =
        document.querySelector('shadow-dom-parent-element')?.shadowRoot
          ?.adoptedStyleSheets || [];

      expect(styleElement).toHaveLength(0);
    });
  });

  describe('when the element is added in a shadow dom', () => {
    beforeEach(async () => {
      await fixture(html`
        <shadow-dom-parent-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
        </shadow-dom-parent-element>
      `);
    });

    it("should add css in the parent's adoptedStyleSheets", async () => {
      const styleElement =
        document.querySelector('shadow-dom-parent-element')?.shadowRoot
          ?.adoptedStyleSheets || [];

      expect(styleElement).toHaveLength(1);
      expect(styleElement[0].cssRules).toHaveLength(1);
      expect(styleElement[0].cssRules[0].cssText).toBe(styles);
    });

    it("should not add css in the document's adoptedStyleSheets", async () => {
      const styleElement = document?.adoptedStyleSheets || [];

      expect(styleElement).toHaveLength(0);
    });
  });

  describe('when the element has an array of styles', () => {
    beforeEach(async () => {
      await fixture(html`
        <shadow-dom-parent-element>
          <complex-styled-element></complex-styled-element>
        </shadow-dom-parent-element>
      `);
    });

    it('should have added 2 stylesheets', async () => {
      const styleElement =
        document.querySelector('shadow-dom-parent-element')?.shadowRoot
          ?.adoptedStyleSheets || [];

      expect(styleElement).toHaveLength(2);
    });
  });

  describe('when the element is added directly into the dom', () => {
    beforeEach(async () => {
      await fixture(html`
        <light-dom-parent-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
        </light-dom-parent-element>
      `);
    });

    it("should add css in the document's adoptedStyleSheets", async () => {
      const styleElement = document?.adoptedStyleSheets || [];

      expect(styleElement).toHaveLength(1);
      expect(styleElement[0].cssRules).toHaveLength(1);
      expect(styleElement[0].cssRules[0].cssText).toBe(styles);
    });
  });

  describe('when the element added directly into the dom does not contain style', () => {
    beforeEach(async () => {
      await fixture(html`
        <light-dom-parent-element>
          <unstyled-element></unstyled-element>
          <unstyled-element></unstyled-element>
          <unstyled-element></unstyled-element>
        </light-dom-parent-element>
      `);
    });

    it("should add css in the document's adoptedStyleSheets", async () => {
      const styleElement = document?.adoptedStyleSheets || [];

      expect(styleElement).toHaveLength(0);
    });
  });
});
