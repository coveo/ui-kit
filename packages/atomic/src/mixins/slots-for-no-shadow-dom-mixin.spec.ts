import {html, LitElement} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {SlotsForNoShadowDOMMixin} from './slots-for-no-shadow-dom-mixin';

describe('SlotsForNoShadowDOMMixin', () => {
  type TestableSlottedElement = InstanceType<typeof SlottedElement>;

  class SlottedElement extends SlotsForNoShadowDOMMixin(LitElement) {
    render() {
      return html`
        <div class="content">${this.renderDefaultSlotContent(html`<span>Default content</span>`)}</div>
      `;
    }
  }

  class SimpleSlottedElement extends SlotsForNoShadowDOMMixin(LitElement) {
    render() {
      return html`
        <div class="main">${this.renderDefaultSlotContent()}</div>
      `;
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

  describe('when the element is rendered without slot content', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(
        html`<slotted-element></slotted-element>`
      )) as TestableSlottedElement;
    });

    it('should render in light DOM', () => {
      expect((element as LitElement).shadowRoot).toBeNull();
      expect((element as LitElement).renderRoot).toBe(element);
    });

    it('should render default content when no slot content provided', () => {
      const contentDiv = (element as Element).querySelector('.content');
      expect(contentDiv?.textContent).toBe('Default content');
    });
  });

  describe('when the element is rendered with default slot content', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <slotted-element><p>Main Content</p></slotted-element>
      `)) as TestableSlottedElement;
    });

    it('should adopt children into default slot', () => {
      expect(element.slots['']).toHaveLength(1);
    });

    it('should render slot content in correct position', async () => {
      const contentDiv = (element as Element).querySelector('.content');
      expect(contentDiv?.textContent?.trim()).toBe('Main Content');
    });
  });

  describe('when the element has content without slot attributes', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <simple-slotted-element><p>Unslotted content</p></simple-slotted-element>
      `)) as TestableSlottedElement;
    });

    it('should adopt unslotted content to default slot', () => {
      expect(element.slots['']).toBeDefined();
      expect(element.slots['']).toContain(
        (element as Element).querySelector('p')
      );
    });

    it('should render unslotted content correctly', async () => {
      const mainDiv = (element as Element).querySelector('.main');
      expect(mainDiv?.textContent?.trim()).toBe('Unslotted content');
    });
  });

  describe('#renderDefaultSlotContent', () => {
    let element: TestableSlottedElement;

    beforeEach(async () => {
      element = (await fixture(html`
        <slotted-element><span>Default Content</span></slotted-element>
      `)) as TestableSlottedElement;
    });

    it('should return placeholder for default slot with content', () => {
      const content = element.renderDefaultSlotContent();
      expect(Array.isArray(content)).toBe(true);
      expect(content).toHaveLength(1);
      // The first item should be a placeholder comment
      expect((content as unknown[])[0]).toBeInstanceOf(Comment);
      expect(((content as unknown[])[0] as Comment).textContent).toBe(
        'slot:default'
      );
    });

    it('should return default content for empty default slot', async () => {
      const emptyElement = (await fixture(html`
        <slotted-element></slotted-element>
      `)) as TestableSlottedElement;

      const defaultContent = html`<span>Default</span>`;
      const content = emptyElement.renderDefaultSlotContent(defaultContent);
      expect(Array.isArray(content)).toBe(true);
      expect(content).toHaveLength(1);
      expect((content as unknown[])[0]).toBe(defaultContent);
    });

    it('should return placeholder instead of default when default slot has content', () => {
      const defaultContent = html`<span>Default</span>`;
      const content = element.renderDefaultSlotContent(defaultContent);
      expect(Array.isArray(content)).toBe(true);
      expect(content).toHaveLength(1);
      // Should return placeholder, not default content
      expect((content as unknown[])[0]).toBeInstanceOf(Comment);
      expect(((content as unknown[])[0] as Comment).textContent).toBe(
        'slot:default'
      );
    });
  });
});
