import {buildFoldedResultList, type FoldedResult} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, type MockInstance, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeFoldedResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/folded-result';
import {buildFakeFoldedResultList} from '@/vitest-utils/testing-helpers/fixtures/headless/search/folded-result-list-controller';
import type {AtomicResultChildren} from './atomic-result-children';
import './atomic-result-children';
import '@/src/components/search/atomic-result-children-template/atomic-result-children-template';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-children', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedFoldedResultList: ReturnType<typeof buildFoldedResultList>;

  const renderAtomicResultChildren = async ({
    props = {},
    result,
    hasTemplate = true,
  }: {
    props?: Partial<{
      inheritTemplates: boolean;
      imageSize: string;
      noResultText: string;
    }>;
    result?: FoldedResult;
    hasTemplate?: boolean;
  } = {}) => {
    const defaultResult =
      result ||
      buildFakeFoldedResult({
        children: [
          buildFakeFoldedResult({title: 'Child 1'}),
          buildFakeFoldedResult({title: 'Child 2'}),
        ],
      });

    mockedFoldedResultList = buildFakeFoldedResultList();
    vi.mocked(buildFoldedResultList).mockImplementation(
      () => mockedFoldedResultList
    );

    const templateContent = hasTemplate
      ? html`<atomic-result-children-template>
          <template>
            <div class="child-template">Child Template</div>
          </template>
        </atomic-result-children-template>`
      : html``;

    const {element} = await renderInAtomicSearchInterface<AtomicResultChildren>(
      {
        template: html`
          <atomic-folded-result-list>
            <atomic-result-template>
              <template>
                <atomic-result>
                  <atomic-result-children
                    ?inherit-templates=${props.inheritTemplates}
                    image-size=${ifDefined(props.imageSize)}
                    no-result-text=${ifDefined(props.noResultText)}
                  >
                    ${templateContent}
                  </atomic-result-children>
                </atomic-result>
              </template>
            </atomic-result-template>
          </atomic-folded-result-list>
        `,
        selector: 'atomic-result-children',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
        result: defaultResult,
      }
    );

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
    it('should not set the error when using the default props with a template', async () => {
      const {element} = await renderAtomicResultChildren();

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

    it('should not set the error when inheritTemplates is true', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {inheritTemplates: true},
        hasTemplate: false,
      });

      expect(element.error).toBeUndefined();
    });
  });

  describe('when rendering (#render)', () => {
    it('should render the children-root part when there are children', async () => {
      const {element, parts} = await renderAtomicResultChildren();
      const partsElements = parts(element);

      await expect.element(partsElements.childrenRoot!).toBeInTheDocument();
    });

    it('should not render when there are no children', async () => {
      const {element} = await renderAtomicResultChildren({
        result: buildFakeFoldedResult({children: []}),
      });

      expect(element.shadowRoot?.children.length).toBe(0);
    });

    it('should render child results using the template', async () => {
      const {element} = await renderAtomicResultChildren();

      const childResults =
        element.shadowRoot?.querySelectorAll('atomic-result');
      expect(childResults?.length).toBeGreaterThan(0);
    });
  });

  describe('when imageSize prop is set', () => {
    it('should pass the imageSize to child results', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {imageSize: 'large'},
      });

      const childResult = element.shadowRoot?.querySelector('atomic-result');
      expect(childResult?.imageSize).toBe('large');
    });
  });

  describe('when noResultText prop is set', () => {
    it('should use the custom noResultText value', async () => {
      const {element} = await renderAtomicResultChildren({
        props: {noResultText: 'custom-no-result-text'},
      });

      expect(element.noResultText).toBe('custom-no-result-text');
    });
  });
});
