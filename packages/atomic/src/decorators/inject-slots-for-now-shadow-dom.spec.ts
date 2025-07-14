import {html, LitElement} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {injectSlotsForNoShadowDOM} from './inject-slots-for-now-shadow-dom';

type AdoptedNode = ChildNode & {contentFor?: string};

describe('injectSlotsForNoShadowDOM', () => {
  interface TestableSlottedElement extends LitElement {
    slots: {[name: string]: AdoptedNode[] | undefined};
    _slotsInitialized: boolean;
    adoptChildren(): void;
    getSlotNameForChild(child: AdoptedNode): string;
    isTextNodeEmpty(node: Text): boolean;
    isSlotEmpty(slot: string): boolean;
    yield(slot: string, defaultContent?: unknown): unknown[];
  }

  @injectSlotsForNoShadowDOM()
  class SlottedElement extends LitElement {
    render() {
      return html`
        <div class="header">${(this as unknown as TestableSlottedElement).yield('header')}</div>
        <div class="content">${(this as unknown as TestableSlottedElement).yield('content', html`<span>Default content</span>`)}</div>
        <div class="footer">${(this as unknown as TestableSlottedElement).yield('footer')}</div>
      `;
    }
  }

  @injectSlotsForNoShadowDOM()
  class SimpleSlottedElement extends LitElement {
    render() {
      return html`
        <div class="main">${(this as unknown as TestableSlottedElement).yield('main')}</div>
      `;
    }
  }

  class UnslottedElement extends LitElement {
    render() {
      return html`<div>No slots here</div>`;
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
  customElements.define('slotted-element', SlottedElement);
  customElements.define('simple-slotted-element', SimpleSlottedElement);
  customElements.define('unslotted-element', UnslottedElement);

  describe('when the element is rendered without slot content', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(
        html`<slotted-element></slotted-element>`
      )) as unknown as TestableSlottedElement;
    });

    it('should render in light DOM', () => {
      expect((element as LitElement).shadowRoot).toBeNull();
      expect((element as LitElement).renderRoot).toBe(element);
    });

    it('should render default content for slots with defaults', () => {
      const contentDiv = (element as Element).querySelector('.content');
      expect(contentDiv?.textContent).toBe('Default content');
    });

    it('should render empty slots when no default content provided', () => {
      const headerDiv = (element as Element).querySelector('.header');
      const footerDiv = (element as Element).querySelector('.footer');
      expect(headerDiv?.textContent).toBe('');
      expect(footerDiv?.textContent).toBe('');
    });
  });

  describe('when the element is rendered with slot content', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <slotted-element>
          <h1 slot="header">Header Content</h1>
          <p slot="content">Main Content</p>
          <small slot="footer">Footer Content</small>
        </slotted-element>
      `)) as unknown as TestableSlottedElement;
    });

    it('should adopt children into correct slots', () => {
      expect(element.slots.header).toHaveLength(1);
      expect(element.slots.content).toHaveLength(1);
      expect(element.slots.footer).toHaveLength(1);
    });

    it('should render slot content in correct positions', () => {
      const headerDiv = (element as Element).querySelector('.header');
      const contentDiv = (element as Element).querySelector('.content');
      const footerDiv = (element as Element).querySelector('.footer');

      expect(headerDiv?.textContent).toBe('Header Content');
      expect(contentDiv?.textContent).toBe('Main Content');
      expect(footerDiv?.textContent).toBe('Footer Content');
    });
  });

  describe('when the element has content without slot attributes', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <simple-slotted-element>
          <p>Unslotted content</p>
          <span slot="main">Slotted content</span>
        </simple-slotted-element>
      `)) as unknown as TestableSlottedElement;
    });

    it('should adopt unslotted content to default slot', () => {
      expect(element.slots['']).toBeDefined();
      expect(element.slots['']).toContain(
        (element as Element).querySelector('p')
      );
      expect(element.slots.main).toHaveLength(1);
    });

    it('should render slotted content correctly', () => {
      const mainDiv = (element as Element).querySelector('.main');
      expect(mainDiv?.textContent).toBe('Slotted content');
    });
  });

  describe('#getSlotNameForChild', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(
        html`<slotted-element></slotted-element>`
      )) as unknown as TestableSlottedElement;
    });

    it('should return slot attribute value for elements', () => {
      const child = document.createElement('div');
      child.setAttribute('slot', 'test-slot');

      const slotName = element.getSlotNameForChild(child);
      expect(slotName).toBe('test-slot');
    });

    it('should return empty string for elements without slot attribute', () => {
      const child = document.createElement('div');

      const slotName = element.getSlotNameForChild(child);
      expect(slotName).toBe('');
    });
  });

  describe('#isTextNodeEmpty', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(
        html`<slotted-element></slotted-element>`
      )) as unknown as TestableSlottedElement;
    });

    it('should return true for empty text nodes', () => {
      const textNode = document.createTextNode('');
      expect(element.isTextNodeEmpty(textNode)).toBe(true);
    });

    it('should return true for whitespace-only text nodes', () => {
      const textNode = document.createTextNode('   \n\t  ');
      expect(element.isTextNodeEmpty(textNode)).toBe(true);
    });

    it('should return false for text nodes with content', () => {
      const textNode = document.createTextNode('Hello World');
      expect(element.isTextNodeEmpty(textNode)).toBe(false);
    });

    it('should return true for null textContent', () => {
      const textNode = document.createTextNode('test');
      Object.defineProperty(textNode, 'textContent', {
        value: null,
        writable: false,
      });
      expect(element.isTextNodeEmpty(textNode)).toBe(true);
    });
  });

  describe('#isSlotEmpty', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <slotted-element>
          <div slot="header">Content</div>
          <span slot="footer">${'   '}</span>
        </slotted-element>
      `)) as unknown as TestableSlottedElement;
    });

    it('should return false for slots with actual content', async () => {
      await element.updateComplete;
      expect(element.isSlotEmpty('header')).toBe(false);
    });

    it('should return true for slots with only whitespace', async () => {
      await element.updateComplete;
      expect(element.isSlotEmpty('footer')).toBe(false);
    });

    it('should return true for non-existent slots', async () => {
      await element.updateComplete;
      expect(element.isSlotEmpty('nonexistent')).toBe(true);
    });

    it('should return true for slots with only text nodes containing whitespace', async () => {
      const testElement = (await fixture(html`
        <slotted-element>
          ${' \n\t '}
        </slotted-element>
      `)) as unknown as TestableSlottedElement;
      await testElement.updateComplete;
      expect(testElement.isSlotEmpty('')).toBe(true);
    });
  });

  describe('#yield', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <slotted-element>
          <span slot="header">Header Content</span>
        </slotted-element>
      `)) as unknown as TestableSlottedElement;
    });

    it('should return slot content when available', () => {
      const content = element.yield('header');
      expect(content).toHaveLength(1);
      expect((content[0] as Element).textContent).toBe('Header Content');
    });

    it('should return default content for empty slots', () => {
      const defaultContent = html`<span>Default</span>`;
      const content = element.yield('footer', defaultContent);
      expect(content).toHaveLength(1);
      expect(content[0]).toBe(defaultContent);
    });

    it('should return both slot content and default when slot is not empty', () => {
      const defaultContent = html`<span>Default</span>`;
      const content = element.yield('header', defaultContent);
      expect(content).toHaveLength(1);
      expect((content[0] as Element).textContent).toBe('Header Content');
    });
  });
});
