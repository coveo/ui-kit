import {css, html, LitElement, unsafeCSS} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {LightDomMixin} from './light-dom';

describe('#LightDomMixin', () => {
  const styles = 'body { background-color: red; }';

  class StyledElement extends LightDomMixin(LitElement) {
    static styles = unsafeCSS(styles);
    render() {
      return html`<div>styled element</div>`;
    }
  }

  class ComplexStyledElement extends LightDomMixin(LitElement) {
    static styles = [
      unsafeCSS(styles),
      css`
        div {
          color: blue;
        }
      `,
    ];
    render() {
      return html`<div>complex styled element</div>`;
    }
  }

  class UnstyledElement extends LightDomMixin(LitElement) {
    render() {
      return html`<div>unstyled element</div>`;
    }
  }

  class LightDomParentElement extends HTMLElement {
    render() {
      return html`<slot></slot>`;
    }
  }

  class ShadowDomParentElement extends HTMLElement {
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
  customElements.define('shadow-dom-parent-element', ShadowDomParentElement);
  customElements.define('styled-element', StyledElement);
  customElements.define('complex-styled-element', ComplexStyledElement);
  customElements.define('unstyled-element', UnstyledElement);

  describe('#createRenderRoot', () => {
    it('should return the element itself instead of creating shadow root', async () => {
      const element = await fixture<StyledElement>(
        html`<styled-element></styled-element>`
      );

      expect(element.renderRoot).toBe(element);
      expect(element.shadowRoot).toBeNull();
    });
  });

  describe('#connectedCallback', () => {
    it('should automatically inject static styles when element connects', async () => {
      await fixture(html`<styled-element></styled-element>`);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(1);
      expect(adoptedStyleSheets[0].cssRules).toHaveLength(1);
      expect(adoptedStyleSheets[0].cssRules[0].cssText).toBe(styles);
    });

    it('should inject multiple styles when element has array of styles', async () => {
      await fixture(html`<complex-styled-element></complex-styled-element>`);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(2);
    });

    it('should not inject styles when element has no static styles', async () => {
      await fixture(html`<unstyled-element></unstyled-element>`);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(0);
    });
  });

  describe('#injectStyles', () => {
    it('should inject static styles when called without arguments', async () => {
      const element = await fixture<StyledElement>(
        html`<styled-element></styled-element>`
      );

      document.adoptedStyleSheets = [];

      await element.injectStyles();

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(1);
      expect(adoptedStyleSheets[0].cssRules[0].cssText).toBe(styles);
    });

    it('should inject both static and dynamic styles when called with dynamic styles', async () => {
      const element = await fixture<StyledElement>(
        html`<styled-element></styled-element>`
      );

      document.adoptedStyleSheets = [];

      const dynamicStyle = css`
        p {
          font-size: 16px;
        }
      `;

      await element.injectStyles(dynamicStyle);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(2);
    });

    it('should handle array of dynamic styles', async () => {
      const element = await fixture<StyledElement>(
        html`<styled-element></styled-element>`
      );

      document.adoptedStyleSheets = [];

      const dynamicStyles = [
        css`p { font-size: 16px; }`,
        css`span { color: green; }`,
      ];

      await element.injectStyles(dynamicStyles);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(3); // 1 static + 2 dynamic
    });

    it('should not inject duplicate stylesheets', async () => {
      const element = await fixture<StyledElement>(
        html`<styled-element></styled-element>`
      );

      await element.injectStyles();
      await element.injectStyles();
      await element.injectStyles();

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(1);
    });

    it('should do nothing when parent is not document or shadow root', async () => {
      const element = new StyledElement();
      const mockParent = document.createElement('div');

      element.getRootNode = () => mockParent;

      await element.injectStyles();

      expect(document.adoptedStyleSheets).toHaveLength(0);
    });

    describe('when element is in shadow DOM', () => {
      it('should inject styles into shadow root adoptedStyleSheets', async () => {
        await fixture(html`
          <shadow-dom-parent-element>
            <styled-element></styled-element>
          </shadow-dom-parent-element>
        `);

        const shadowRoot = document.querySelector(
          'shadow-dom-parent-element'
        )?.shadowRoot;
        const adoptedStyleSheets = shadowRoot?.adoptedStyleSheets || [];

        expect(adoptedStyleSheets).toHaveLength(1);
        expect(adoptedStyleSheets[0].cssRules[0].cssText).toBe(styles);
      });

      it('should not inject styles into document when in shadow DOM', async () => {
        await fixture(html`
          <shadow-dom-parent-element>
            <styled-element></styled-element>
          </shadow-dom-parent-element>
        `);

        expect(document.adoptedStyleSheets).toHaveLength(0);
      });
    });

    describe('when element has no static styles', () => {
      it('should only inject dynamic styles', async () => {
        const element = await fixture<UnstyledElement>(
          html`<unstyled-element></unstyled-element>`
        );

        const dynamicStyle = css`
          h1 {
            color: purple;
          }
        `;

        await element.injectStyles(dynamicStyle);

        const adoptedStyleSheets = document.adoptedStyleSheets;
        expect(adoptedStyleSheets).toHaveLength(1);
      });

      it('should do nothing when called without arguments and no static styles', async () => {
        const element = await fixture<UnstyledElement>(
          html`<unstyled-element></unstyled-element>`
        );

        await element.injectStyles();

        expect(document.adoptedStyleSheets).toHaveLength(0);
      });
    });

    it('should handle CSSStyleSheet instances', async () => {
      const element = await fixture<UnstyledElement>(
        html`<unstyled-element></unstyled-element>`
      );

      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync('h2 { color: orange; }');

      await element.injectStyles(styleSheet);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(1);
      expect(adoptedStyleSheets[0]).toBe(styleSheet);
    });
  });

  describe('when multiple elements with same styles are added', () => {
    it('should not duplicate stylesheets in adoptedStyleSheets', async () => {
      await fixture(html`
        <div>
          <styled-element></styled-element>
          <styled-element></styled-element>
          <styled-element></styled-element>
        </div>
      `);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(1);
    });
  });

  describe('when element has complex static styles array', () => {
    it('should inject all styles from the array', async () => {
      await fixture(html`<complex-styled-element></complex-styled-element>`);

      const adoptedStyleSheets = document.adoptedStyleSheets;
      expect(adoptedStyleSheets).toHaveLength(2);
    });
  });
});
