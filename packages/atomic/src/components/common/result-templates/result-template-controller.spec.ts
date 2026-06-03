import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, expect, it} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {ResultTemplateController} from './result-template-controller';

@customElement('test-result-element')
class TestResultElement extends LitElement implements LitElementWithError {
  @state()
  public error!: Error;
  controller = new ResultTemplateController(this, ['valid-parent'], false);
}

async function setupResultElement(
  template: TemplateResult<1>,
  parentNode: HTMLElement = document.createElement('valid-parent')
) {
  await fixture(template, parentNode);
  return document.querySelector('test-result-element')! as TestResultElement;
}

describe('ResultTemplateController', () => {
  describe('#getTemplate', () => {
    it('should return a ResultTemplate with proper structure from getTemplate', async () => {
      const {controller} = await setupResultElement(
        html`<test-result-element>
          <template><div>content</div></template>
        </test-result-element>`
      );
      const result = controller.getTemplate([]);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('conditions', []);
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('linkContent');
      expect(result).toHaveProperty('priority', 1);
    });

    it('should return null when there is an error', async () => {
      const element = await setupResultElement(
        html`<test-result-element></test-result-element>`
      );
      const result = element.controller.getTemplate([]);

      expect(result).toBeNull();
    });
  });

  describe('#getLinkTemplateElement', () => {
    it('should get link template element', async () => {
      const {controller} = await setupResultElement(
        html`<test-result-element>
          <template><div>content</div></template>
        </test-result-element>`
      );
      const linkElement = controller.getLinkTemplateElement(controller.host);

      expect(linkElement).toBeInstanceOf(HTMLTemplateElement);
      expect(linkElement.innerHTML).toBe(
        '<atomic-result-link></atomic-result-link>'
      );
    });

    it('should use custom link template when provided', async () => {
      const element = await setupResultElement(
        html`<test-result-element>
          <template><div>content</div></template>
          <template slot="link">
            <custom-result-link></custom-result-link>
          </template>
        </test-result-element>`
      );

      const linkElement = element.controller.getLinkTemplateElement(element);

      expect(linkElement.innerHTML.trim()).toBe(
        '<custom-result-link></custom-result-link>'
      );
    });
  });
});
