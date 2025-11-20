import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {BaseTemplateController} from './base-template-controller';

class TestTemplateController extends BaseTemplateController<() => boolean> {
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
  let mockElement: TestElement;
  let controller: TestTemplateController;

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

  beforeEach(() => {
    mockElement = new TestElement();
  });

  it('should register itself as a controller with the host', () => {
    const addControllerSpy = vi.spyOn(mockElement, 'addController');
    controller = new TestTemplateController(
      mockElement,
      ['valid-parent'],
      false
    );

    expect(addControllerSpy).toHaveBeenCalledExactlyOnceWith(controller);
  });

  describe('when the host is connected to the DOM', () => {
    it('it should set an error on the host when the host is not a valid parent', async () => {
      const element = await setupElement(
        html`<test-element>
            <template><h1>hello</h1></template>
          </test-element>`,
        document.createElement('invalid-parent')
      );

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('has to be the child');
    });

    it('should set an error on the host when the template is missing from the host', async () => {
      const element = await setupElement(html`<test-element></test-element>`);

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('must contain a "template"');
    });

    it('should set an error when allowEmpty is false', async () => {
      const element = await setupElement(
        html`<test-element>
            <template> </template>
          </test-element>`
      );

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('cannot be empty');
    });

    it('should not set an error when allowEmpty is true', async () => {
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

    it('it should log a warning when the template contains script tags', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const element = await setupElement(
        html`<test-element>
            <template><script></script></template>
          </test-element>`
      );

      expect(warnSpy).toHaveBeenCalledWith(
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the items are rendered.',
        element
      );
    });

    describe('when validating template content', () => {
      let warnSpy: MockInstance;

      beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should not log a warning when template contains only section elements', async () => {
        await setupElement(
          html`<test-element>
            <template>
              <atomic-result-section-visual>section1</atomic-result-section-visual>
              <atomic-result-section-title>section2</atomic-result-section-title>
            </template>
          </test-element>`
        );

        expect(warnSpy).not.toHaveBeenCalledWith(
          'Item templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this item template.',
          expect.any(TestElement),
          expect.any(Object)
        );
      });

      it('should not log a warning when template contains only other elements', async () => {
        await setupElement(
          html`<test-element>
            <template>
              <div>content1</div>
              <span>content2</span>
              <p>content3</p>
            </template>
          </test-element>`
        );

        expect(warnSpy).not.toHaveBeenCalledWith(
          'Item templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this item template.',
          expect.any(TestElement),
          expect.any(Object)
        );
      });

      it('should not log a warning when template contains only metadata elements', async () => {
        await setupElement(
          html`<test-element>
            <template>
              <style>body { color: red; }</style>
              <!-- This is a comment -->
               
            </template>
          </test-element>`
        );

        expect(warnSpy).not.toHaveBeenCalledWith(
          'Item templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this item template.',
          expect.any(TestElement),
          expect.any(Object)
        );
      });

      it('should not log a warning when template contains only table column definitions', async () => {
        await setupElement(
          html`<test-element>
            <template>
              <atomic-table-element slot="table-column">Column 1</atomic-table-element>
              <atomic-table-element slot="table-column">Column 2</atomic-table-element>
            </template>
          </test-element>`
        );

        expect(warnSpy).not.toHaveBeenCalledWith(
          'Item templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this item template.',
          expect.any(TestElement),
          expect.any(Object)
        );
      });

      describe('when the template contains both section and other nodes', () => {
        const localSetup = () =>
          setupElement(
            html`<test-element>
              <template>
                <atomic-result-section-visual>section</atomic-result-section-visual>
                <span>other</span>
              </template>
            </test-element>`
          );

        it('should log a warning when mixing section and other elements', async () => {
          await localSetup();

          expect(warnSpy).toHaveBeenCalledWith(
            'Item templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this item template.',
            expect.any(TestElement),
            expect.objectContaining({
              section: expect.any(Array),
              other: expect.any(Array),
            })
          );
        });

        it('should identify section elements correctly', async () => {
          await localSetup();

          expect(warnSpy).toHaveBeenCalled();
          const [, , logData] = warnSpy.mock.calls[0];

          expect(logData.section).toBeDefined();
          expect(logData.section.length).toBe(1);

          expect(logData.other).toBeDefined();
          expect(logData.other.length).toBe(1);
        });
      });
    });

    describe('when parent has grid display and grid-cell-link-target', () => {
      it('should set grid cell link target', async () => {
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
  });

  describe('#getLinkTemplateElement', () => {
    it('should return custom link template when provided', async () => {
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

      const linkElement = controller.getLinkTemplateElement(controller.host);
      expect(linkElement.innerHTML.trim()).toBe('<custom-link></custom-link>');
    });

    it('should return default link template when none provided', async () => {
      const {controller} = await setupElement(
        html`<test-element>
          <template>
            <div>content</div>
          </template>
        </test-element>`
      );

      const linkElement = controller.getLinkTemplateElement(controller.host);
      expect(linkElement.innerHTML).toBe('<test-link></test-link>');
    });

    it('should include grid cell link target in default template when set', async () => {
      const parent = document.createElement('valid-parent');
      parent.setAttribute('display', 'grid');
      parent.setAttribute('grid-cell-link-target', '_blank');

      const {controller} = await setupElement(
        html`<test-element>
          <template><div>content</div></template>
        </test-element>`,
        parent
      );

      const linkElement = controller.getLinkTemplateElement(controller.host);
      expect(linkElement.innerHTML).toContain('target="_blank"');
    });
  });

  describe('#getBaseTemplate', () => {
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

      it('should return a non-null template object', () => {
        expect(result).not.toBeNull();
      });

      it('should return the correct conditions', () => {
        expect(result).toHaveProperty('conditions', []);
      });

      it('should return the correct content', () => {
        const contentTemplate = buildTemplateHtml('<div>test content</div>');
        expect(result && fragmentToHTML(result.content!)).toBe(
          fragmentToHTML(contentTemplate.content)
        );
      });

      it('should return the correct linkContent', () => {
        const linkTemplate = buildTemplateHtml('<test-link></test-link>');
        expect(fragmentToHTML(result!.linkContent!)).toBe(
          fragmentToHTML(linkTemplate.content)
        );
      });

      it('should return the correct priority', () => {
        expect(result).toHaveProperty('priority', 1);
      });

      it('should merge match conditions with provided conditions', async () => {
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

    it('should return null when there is an error', async () => {
      const element = await setupElement(html`<test-element></test-element>`);

      const result = element.controller.getBaseTemplateForTesting([]);
      expect(result).toBeNull();
    });
  });
});
