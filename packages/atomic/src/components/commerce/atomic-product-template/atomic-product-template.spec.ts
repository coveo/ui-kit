import type {Product} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicProductTemplate} from './atomic-product-template';
import './atomic-product-template';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-product-template', () => {
  type AtomicProductTemplateProps = Pick<
    AtomicProductTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch'
  >;
  const setupElement = async (
    options: Partial<AtomicProductTemplateProps> = {}
  ) => {
    const defaultProps: AtomicProductTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const {element} =
      await renderInAtomicCommerceInterface<AtomicProductTemplate>({
        template: html`<atomic-commerce-product-list>
          <atomic-product-template
            .conditions=${options.conditions || defaultProps.conditions}
            .mustMatch=${options.mustMatch || defaultProps.mustMatch}
            .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
          >
            <slot slot="default">
              <template>
                <div>Product Template Content</div>
              </template>
            </slot>
          </atomic-product-template>
        </atomic-commerce-product-list>`,
        selector: 'atomic-product-template',
      });
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicProductTemplate);
  });

  it('should have default empty mustMatch, mustNotMatch and conditions', async () => {
    const element = await setupElement();
    expect(element.mustMatch).toEqual({});
    expect(element.mustNotMatch).toEqual({});
    expect(element.conditions).toEqual([]);
  });

  describe('when must-match and must-not-match attributes are set', () => {
    it('should call #makeMatchConditions on connectedCallback', async () => {
      const mockMakeMatchConditions = vi.mocked(makeMatchConditions);
      await setupElement({
        mustMatch: {foo: ['bar']},
        mustNotMatch: {baz: ['qux']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledWith(
        {foo: ['bar']},
        {baz: ['qux']},
        expect.any(Object)
      );
    });
  });

  it('should call #getTemplate on the controller', async () => {
    const brandConditions = (item: Product) => item.ec_brand === 'Coveo';
    const element = await setupElement({conditions: [brandConditions]});
    const ctrl = element.productTemplateController;
    //@ts-expect-error: we don't really care about the return template here
    const spy = vi.spyOn(ctrl, 'getTemplate').mockResolvedValue('🍰');
    const result = await element.getTemplate();

    expect(spy).toHaveBeenCalledWith([brandConditions]);
    expect(result).toBe('🍰');
  });

  it('should render nothing by default', async () => {
    const element = await setupElement();
    expect(sanitizeHtml(element.shadowRoot!.innerHTML)).toBe('');
  });

  it('should render an atomic-component-error if error is thrown', async () => {
    const mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const element = await setupElement();
    const error = new Error('fail');
    element.error = error;

    const componentError = page.getByText(
      'atomic-product-template component error'
    );

    await expect.element(componentError).toBeVisible();
    mockedConsoleError.mockRestore();
  });
});
