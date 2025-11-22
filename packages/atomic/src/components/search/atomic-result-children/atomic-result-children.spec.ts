import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, type MockInstance, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixtures/lit-fixtures';
import type {AtomicResultChildren} from './atomic-result-children';
import './atomic-result-children';
import '@/src/components/search/atomic-result-children-template/atomic-result-children-template';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-children', () => {
  const renderAtomicResultChildren = async ({
    props = {},
    hasTemplate = true,
  }: {
    props?: Partial<{
      inheritTemplates: boolean;
      imageSize: string;
      noResultText: string;
    }>;
    hasTemplate?: boolean;
  } = {}) => {
    const templateContent = hasTemplate
      ? html`<atomic-result-children-template>
          <template>
            <div class="child-template">Child Template</div>
          </template>
        </atomic-result-children-template>`
      : html``;

    const element = await fixture<AtomicResultChildren>(html`
      <atomic-result-children
        ?inherit-templates=${props.inheritTemplates}
        image-size=${ifDefined(props.imageSize)}
        no-result-text=${ifDefined(props.noResultText)}
      >
        ${templateContent}
      </atomic-result-children>
    `);

    return {
      element,
      parts: (element: AtomicResultChildren) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          childrenRoot: qs('children-root'),
          noResultRoot: qs('no-result-root'),
          showHideButton: qs('show-hide-button'),
        };
      },
    };
  };

  describe('#initialize', () => {
    it('should not set the error when inheritTemplates is true', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {inheritTemplates: true},
        hasTemplate: false,
      });

      expect(element.error).toBeUndefined();
    });

    it('should set the error when no child template is provided and inheritTemplates is false', async () => {
      const consoleErrorSpy: MockInstance = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const {element} = await renderAtomicResultChildren({
        hasTemplate: false,
      });

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain(
        'requires at least one "atomic-result-children-template"'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('props', () => {
    it('should have default imageSize as undefined', async () => {
      const {element} = await renderAtomicResultChildren();

      expect(element.imageSize).toBeUndefined();
    });

    it('should accept custom imageSize', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {imageSize: 'large'},
      });

      expect(element.imageSize).toBe('large');
    });

    it('should have default noResultText', async () => {
      const {element} = await renderAtomicResultChildren();

      expect(element.noResultText).toBe('no-documents-related');
    });

    it('should accept custom noResultText', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {noResultText: 'custom-no-result-text'},
      });

      expect(element.noResultText).toBe('custom-no-result-text');
    });

    it('should have default inheritTemplates as false', async () => {
      const {element} = await renderAtomicResultChildren();

      expect(element.inheritTemplates).toBe(false);
    });

    it('should accept inheritTemplates as true', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {inheritTemplates: true},
      });

      expect(element.inheritTemplates).toBe(true);
    });
  });
});
