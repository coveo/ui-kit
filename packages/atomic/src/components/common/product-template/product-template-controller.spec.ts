import {html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, MockInstance, vi} from 'vitest';
import {LitElementWithError} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {getTemplateNodeType} from './product-template-common';
import {ProductTemplateController} from './product-template-controller';

vi.mock('./product-template-common', {spy: true});

@customElement('test-element')
class TestElement extends LitElement implements LitElementWithError {
  @state()
  public error!: Error;
  controller = new ProductTemplateController(this, ['valid-parent'], false);
}

@customElement('empty-test-element')
class EmptyTestElement extends LitElement implements LitElementWithError {
  @state()
  public error!: Error;
  controller = new ProductTemplateController(this, ['valid-parent'], true);
}

describe('ProductTemplateController', () => {
  function buildTemplateHtml(html: string) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template;
  }

  function fragmentToHTML(fragment: DocumentFragment) {
    const div = document.createElement('div');
    div.appendChild(fragment.cloneNode(true));
    return div.innerHTML.trim();
  }

  async function setupElement(
    template: TemplateResult<1>,
    parentNode: HTMLElement = document.createElement('valid-parent')
  ) {
    await fixture(template, parentNode);
    return document.querySelector('test-element')! as TestElement;
  }

  describe('when the host has not a valid parent', () => {
    it('should set an error', async () => {
      const element = await setupElement(
        html`<test-element>
          <template><h1>hello</h1></template>
        </test-element>`,
        document.createElement('invalid-parent')
      );

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('has to be the child');
    });
  });

  describe('when the template is missing from the host', () => {
    it('should set an error', async () => {
      const element = await setupElement(html`<test-element></test-element>`);

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('must contain a "template"');
    });
  });

  describe('when the template is empty', () => {
    it('should set an error if allowEmpty is false', async () => {
      const element = await setupElement(
        html`<test-element>
          <template> </template>
        </test-element>`
      );

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('cannot be empty');
    });

    it('should not set an error if allowEmpty is true', async () => {
      await setupElement(
        html`<empty-test-element>
          <template> </template>
        </empty-test-element>`
      );

      const element = document.querySelector(
        'empty-test-element'
      ) as EmptyTestElement;

      expect(element.error).toBeUndefined();
    });
  });

  describe('when the template contains script tags', () => {
    it('should log a warning', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const element = await setupElement(
        html`<test-element>
          <template><script></script></template>
        </test-element>`
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('script'),
        element
      );

      warnSpy.mockRestore();
    });
  });

  describe('when the template contains both section and other nodes', () => {
    let warnSpy: MockInstance;
    const getTemplateFirstNode = (template: HTMLTemplateElement) =>
      template.content.childNodes[0];

    const localSetup = () =>
      setupElement(
        html`<test-element>
          <template>
            <atomic-result-section-visual>section</atomic-result-section-visual>
            <span>other</span>
          </template>
        </test-element>`
      );

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should call #getTemplateNodeType with the appropriate sections', async () => {
      const mockedGetTemplateNodeType = vi.mocked(getTemplateNodeType);
      await localSetup();

      const visualSectionTemplate = buildTemplateHtml(
        '<atomic-result-section-visual>section</atomic-result-section-visual>'
      );
      const otherSectionTemplate = buildTemplateHtml('<span>other</span>');

      expect(mockedGetTemplateNodeType).toHaveBeenCalledWith(
        getTemplateFirstNode(visualSectionTemplate)
      );

      expect(mockedGetTemplateNodeType).toHaveBeenCalledWith(
        getTemplateFirstNode(otherSectionTemplate)
      );
    });

    it('should log a warning', async () => {
      await localSetup();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('should only contain section elements'),
        expect.any(TestElement),
        expect.objectContaining({})
      );
    });
  });

  describe('when the template is valid', () => {
    let result: ReturnType<ProductTemplateController['getTemplate']>;

    beforeEach(async () => {
      const {controller} = await setupElement(
        html`<test-element>
          <template data-testId="product-template">
            <atomic-result-section-visual>section</atomic-result-section-visual>
          </template>
        </test-element>`
      );
      result = controller.getTemplate([])!;
    });

    it('getTemplate returns a non-null object', () => {
      expect(result).not.toBeNull();
    });

    it('getTemplate returns the correct conditions', () => {
      expect(result).toHaveProperty('conditions', []);
    });

    it('getTemplate returns the correct content', () => {
      const contentTemplate = buildTemplateHtml(
        '<atomic-result-section-visual>section</atomic-result-section-visual>'
      );
      expect(result && fragmentToHTML(result.content!)).toBe(
        fragmentToHTML(contentTemplate.content)
      );
    });

    it('getTemplate returns the correct linkContent', () => {
      const linkTemplate = buildTemplateHtml(
        '<atomic-product-link></atomic-product-link>'
      );
      expect(result).toHaveProperty('linkContent', linkTemplate.content);
    });

    it('getTemplate returns the correct priority', () => {
      expect(result).toHaveProperty('priority', 1);
    });
  });
});
