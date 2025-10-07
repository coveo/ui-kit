import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {BaseTemplateController} from './base-template-controller';

vi.mock('./template-utils', {spy: true});

class TestTemplateController extends BaseTemplateController<() => boolean> {
  protected getWarnings() {
    return {
      scriptTag: 'Test script warning',
      sectionMix: 'Test section mix warning',
    };
  }

  protected getDefaultLinkTemplateElement() {
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `<test-link>${this.currentGridCellLinkTarget ? `<a slot="attributes" target="${this.currentGridCellLinkTarget}"></a>` : ''}</test-link>`;
    return linkTemplate;
  }

  public getBaseTemplateForTesting(conditions: (() => boolean)[]) {
    return this.getBaseTemplate(conditions);
  }
}

@customElement('test-element')
class TestElement extends LitElement implements LitElementWithError {
  @state()
  public error!: Error;
  controller = new TestTemplateController(this, ['valid-parent'], false);
}

@customElement('empty-test-element')
class EmptyTestElement extends LitElement implements LitElementWithError {
  @state()
  public error!: Error;
  controller = new TestTemplateController(this, ['valid-parent'], true);
}

describe('BaseTemplateController', () => {
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

  describe('validation', () => {
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
      it('should log a warning using child class message', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const element = await setupElement(
          html`<test-element>
            <template><script></script></template>
          </test-element>`
        );

        expect(warnSpy).toHaveBeenCalledWith('Test script warning', element);

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

      it('should call getTemplateNodeType with the appropriate sections', async () => {
        const {getTemplateNodeType} = await import('./template-utils');
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

      it('should log a warning using child class message', async () => {
        await localSetup();

        expect(warnSpy).toHaveBeenCalledWith(
          'Test section mix warning',
          expect.any(TestElement),
          expect.objectContaining({})
        );
      });
    });
  });

  describe('template generation', () => {
    describe('when the template is valid', () => {
      let result: ReturnType<
        TestTemplateController['getBaseTemplateForTesting']
      >;

      beforeEach(async () => {
        const {controller} = await setupElement(
          html`<test-element>
            <template data-testId="test-template">
              <div>test content</div>
            </template>
          </test-element>`
        );
        result = controller.getBaseTemplateForTesting([])!;
      });

      it('getBaseTemplate returns a non-null object', () => {
        expect(result).not.toBeNull();
      });

      it('getBaseTemplate returns the correct conditions', () => {
        expect(result).toHaveProperty('conditions', []);
      });

      it('getBaseTemplate returns the correct content', () => {
        const contentTemplate = buildTemplateHtml('<div>test content</div>');
        expect(result && fragmentToHTML(result.content!)).toBe(
          fragmentToHTML(contentTemplate.content)
        );
      });

      it('getBaseTemplate returns the correct linkContent', () => {
        const linkTemplate = buildTemplateHtml('<test-link></test-link>');
        expect(result).toHaveProperty('linkContent', linkTemplate.content);
      });

      it('getBaseTemplate returns the correct priority', () => {
        expect(result).toHaveProperty('priority', 1);
      });
    });

    describe('when there is an error', () => {
      it('getBaseTemplate returns null', async () => {
        const element = await setupElement(html`<test-element></test-element>`);

        const result = element.controller.getBaseTemplateForTesting([]);
        expect(result).toBeNull();
      });
    });
  });

  describe('link template handling', () => {
    it('should use custom link template when provided', async () => {
      const {controller} = await setupElement(
        html`<test-element>
          <template>
            <div>content</div>
          </template>
          <template slot="link">
            <custom-link></custom-link>
          </template>
        </test-element>`
      );

      const linkElement = controller.getLinkTemplateElement(controller['host']);
      expect(linkElement.innerHTML.trim()).toBe('<custom-link></custom-link>');
    });

    it('should use default link template when none provided', async () => {
      const {controller} = await setupElement(
        html`<test-element>
          <template>
            <div>content</div>
          </template>
        </test-element>`
      );

      const linkElement = controller.getLinkTemplateElement(controller['host']);
      expect(linkElement.innerHTML).toBe('<test-link></test-link>');
    });
  });

  describe('grid cell link target functionality', () => {
    it('should include grid cell link target in default link template when parent has grid display', async () => {
      const parent = document.createElement('valid-parent');
      parent.setAttribute('display', 'grid');
      parent.setAttribute('grid-cell-link-target', '_blank');

      const element = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`,
        parent
      );

      const result = element.controller.getBaseTemplateForTesting([]);
      const linkContent = fragmentToHTML(result!.linkContent!);

      expect(linkContent).toContain('target="_blank"');
      expect(linkContent).toContain('<test-link>');
    });

    it('should not include target attribute when no grid cell link target is set', async () => {
      const parent = document.createElement('valid-parent');
      parent.setAttribute('display', 'grid');

      const element = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`,
        parent
      );

      const result = element.controller.getBaseTemplateForTesting([]);
      const linkContent = fragmentToHTML(result!.linkContent!);

      expect(linkContent).not.toContain('target=');
      expect(linkContent).toBe('<test-link></test-link>');
    });

    it('should not include target attribute for non-grid display', async () => {
      const parent = document.createElement('valid-parent');
      parent.setAttribute('display', 'list');
      parent.setAttribute('grid-cell-link-target', '_blank');

      const element = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`,
        parent
      );

      const result = element.controller.getBaseTemplateForTesting([]);
      const linkContent = fragmentToHTML(result!.linkContent!);

      expect(linkContent).not.toContain('target=');
      expect(linkContent).toBe('<test-link></test-link>');
    });
  });

  describe('match conditions', () => {
    it('should initialize with empty match conditions', async () => {
      const {controller} = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`
      );

      expect(controller.matchConditions).toEqual([]);
    });

    it('should merge match conditions with provided conditions in getBaseTemplate', async () => {
      const {controller} = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`
      );

      controller.matchConditions = [() => true, () => false];
      const providedConditions = [() => true];

      const result = controller.getBaseTemplateForTesting(providedConditions);

      expect(result?.conditions).toHaveLength(3);
      expect(result?.conditions).toEqual([
        ...providedConditions,
        ...controller.matchConditions,
      ]);
    });
  });

  describe('host lifecycle', () => {
    it('should validate template during initialization', async () => {
      const element = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`
      );

      expect(element.error).toBeUndefined();

      const result = element.controller.getBaseTemplateForTesting([]);
      expect(result).not.toBeNull();
    });
  });

  describe('error state management', () => {
    it('should preserve error state across multiple calls', async () => {
      const element = await setupElement(html`<test-element></test-element>`);

      const firstResult = element.controller.getBaseTemplateForTesting([]);
      const secondResult = element.controller.getBaseTemplateForTesting([]);

      expect(firstResult).toBeNull();
      expect(secondResult).toBeNull();
      expect(element.error).toBeInstanceOf(Error);
    });
  });
});
