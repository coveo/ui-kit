import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, expect, it} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {ProductTemplateController} from './product-template-controller';

@customElement('test-product-element')
class TestProductElement extends LitElement implements LitElementWithError {
  @state()
  public error!: Error;
  controller = new ProductTemplateController(this, ['valid-parent'], false);
}

async function setupProductElement(
  template: TemplateResult<1>,
  parentNode: HTMLElement = document.createElement('valid-parent')
) {
  await fixture(template, parentNode);
  return document.querySelector('test-product-element')! as TestProductElement;
}

describe('ProductTemplateController', () => {
  describe('#getTemplate', () => {
    it('should return a ProductTemplate with proper structure from getTemplate', async () => {
      const {controller} = await setupProductElement(
        html`<test-product-element>
          <template><div>product content</div></template>
        </test-product-element>`
      );
      const result = controller.getTemplate([]);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('conditions', []);
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('linkContent');
      expect(result).toHaveProperty('priority', 1);
    });

    it('should return null when there is an error', async () => {
      const element = await setupProductElement(
        html`<test-product-element></test-product-element>`
      );
      const result = element.controller.getTemplate([]);

      expect(result).toBeNull();
    });
  });

  describe('#getLinkTemplateElement', () => {
    it('should get link template element', async () => {
      const {controller} = await setupProductElement(
        html`<test-product-element>
          <template><div>product content</div></template>
        </test-product-element>`
      );
      const linkElement = controller.getLinkTemplateElement(controller.host);

      expect(linkElement).toBeInstanceOf(HTMLTemplateElement);
      expect(linkElement.innerHTML).toBe(
        '<atomic-product-link></atomic-product-link>'
      );
    });

    it('should use custom link template when provided', async () => {
      const element = await setupProductElement(
        html`<test-product-element>
          <template><div>product content</div></template>
          <template slot="link">
            <custom-product-link></custom-product-link>
          </template>
        </test-product-element>`
      );

      const linkElement = element.controller.getLinkTemplateElement(element);

      expect(linkElement.innerHTML.trim()).toBe(
        '<custom-product-link></custom-product-link>'
      );
    });
  });
});
