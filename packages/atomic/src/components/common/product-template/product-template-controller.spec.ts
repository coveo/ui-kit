import {LitElementWithError} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect} from 'vitest';
import {ProductTemplateController} from './product-template-controller';

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

// @customElement('valid-parent')
// class ValidParent extends LitElement {}

// @customElement('invalid-parent')
// class InvalidParent extends LitElement {}

describe('ProductTemplateController', () => {
  async function setupElement(
    template: TemplateResult<1>,
    parentNode?: HTMLElement
  ) {
    await fixture(template, parentNode);
    return document.querySelector('test-element')! as
      | TestElement
      | EmptyTestElement;
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
      const element = await setupElement(
        html`<test-element></test-element>`,
        document.createElement('valid-parent')
      );
      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('must contain a "template"');
    });
  });

  describe('when the template is empty', () => {
    it('should set an error if allowEmpty is false', async () => {
      const element = await setupElement(
        html`<test-element>
          <template> </template>
        </test-element>`,
        document.createElement('valid-parent')
      );
      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('cannot be empty');
    });

    it('should not set an error if allowEmpty is true', async () => {
      const element = await setupElement(
        html`<empty-test-element>
          <template> </template>
        </empty-test-element>`,
        document.createElement('valid-parent')
      );
      expect(element.error).toBeNull();
    });
  });

  //   //   TODO: warnings
  //   describe.skip('when the template contains script tags', () => {});
  //   describe.skip('when the template contains both section and other nodes', () => {});
  //   describe.skip('when the template is valid', () => {});

  //   beforeEach(async () => {
  //     await fixture(html`<test-element></test-element>`);
  //   });

  //   it('sets error if missing template', () => {
  //     host.innerHTML = '';
  //     host.controller.validateTemplate();
  //     expect(host.controller['error']).toBeInstanceOf(Error);
  //     expect(host.controller['error']!.message).toContain(
  //       'must contain a "template"'
  //     );
  //   });

  //   it('sets error if template is empty and allowEmpty is false', () => {
  //     host.innerHTML = '<template>   </template>';
  //     host.controller.validateTemplate();
  //     expect(host.controller['error']).toBeInstanceOf(Error);
  //     expect(host.controller['error']!.message).toContain('cannot be empty');
  //   });

  //   it('does not set error if template is empty and allowEmpty is true', () => {
  //     ({host} = createHostWithTemplate({
  //       template: '<template>   </template>',
  //       allowEmpty: true,
  //     }));
  //     host.controller.validateTemplate();
  //     expect(host.controller['error']).toBeNull();
  //   });

  //   it('warns if template contains script', () => {
  //     const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  //     host.innerHTML = '<template><script></script></template>';
  //     host.controller.validateTemplate();
  //     expect(warnSpy).toHaveBeenCalledWith(
  //       expect.stringContaining('script'),
  //       host
  //     );
  //     warnSpy.mockRestore();
  //   });

  //   it('warns if template contains both section and other nodes', () => {
  //     const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  //     // Mock getTemplateNodeType to alternate between 'section' and 'other'
  //     vi.mock('./product-template-common', () => ({
  //       getTemplateNodeType: (node: Node) =>
  //         node.textContent === 'section' ? 'section' : 'other',
  //     }));
  //     host.innerHTML =
  //       '<template><div>section</div><span>other</span></template>';
  //     host.controller.validateTemplate();
  //     expect(warnSpy).toHaveBeenCalledWith(
  //       expect.stringContaining('should only contain section elements'),
  //       host,
  //       expect.objectContaining({
  //         sectionNodes: expect.any(Array),
  //         otherNodes: expect.any(Array),
  //       })
  //     );
  //     warnSpy.mockRestore();
  //   });

  //   it('getTemplate returns null if error is set', () => {
  //     host.controller['error'] = new Error('fail');
  //     const result = host.controller.getTemplate([]);
  //     expect(result).toBeNull();
  //   });

  //   it('getTemplate returns template object if no error', () => {
  //     const result = host.controller.getTemplate([]);
  //     expect(result).not.toBeNull();
  //     expect(result).toHaveProperty('conditions');
  //     expect(result).toHaveProperty('content');
  //     expect(result).toHaveProperty('linkContent');
  //     expect(result).toHaveProperty('priority');
  //   });
});
