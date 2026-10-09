import type {Product} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicProductTemplate} from './atomic-product-template';
import './atomic-product-template';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-product-template', () => {
  type AtomicProductTemplateProps = Pick<
    AtomicProductTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch' | 'ifDefined' | 'ifNotDefined'
  >;
  const setupElement = async (options: Partial<AtomicProductTemplateProps> = {}) => {
    const defaultProps: AtomicProductTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const {element} = await renderInAtomicCommerceInterface<AtomicProductTemplate>({
      template: html`<atomic-commerce-product-list>
        <atomic-product-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
          if-defined=${ifDefined(options.ifDefined)}
          if-not-defined=${ifDefined(options.ifNotDefined)}
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

  describe('when #ifDefined or #ifNotDefined is set', () => {
    const appliesTo = async (element: AtomicProductTemplate, productState: Partial<Product>) => {
      const template = await element.getTemplate();
      const product = buildFakeProduct(productState);
      return template!.conditions.every((condition) => condition(product));
    };

    it('should map the if-defined and if-not-defined attributes to ifDefined and ifNotDefined', async () => {
      const element = await setupElement({
        ifDefined: 'ec_brand,cat_color',
        ifNotDefined: 'cat_size',
      });
      expect(element.ifDefined).toBe('ec_brand,cat_color');
      expect(element.ifNotDefined).toBe('cat_size');
    });

    it('should apply only to products that define every field of if-defined', async () => {
      const element = await setupElement({ifDefined: 'ec_brand,cat_color'});
      const product = {ec_brand: 'Acme', additionalFields: {cat_color: 'red'}};

      expect(await appliesTo(element, product)).toBe(true);
      expect(await appliesTo(element, {...product, additionalFields: {}})).toBe(false);
    });

    it('should apply only to products that define none of the fields of if-not-defined', async () => {
      const element = await setupElement({ifNotDefined: 'ec_brand,cat_color'});
      const product = {ec_brand: null, additionalFields: {}};

      expect(await appliesTo(element, product)).toBe(true);
      expect(await appliesTo(element, {...product, additionalFields: {cat_color: 'red'}})).toBe(
        false
      );
    });

    it('should apply only when the defined, must-match and custom conditions are all met', async () => {
      const element = await setupElement({
        ifDefined: 'ec_brand',
        ifNotDefined: 'cat_color',
        mustMatch: {ec_gender: ['women']},
        conditions: [(product: Product) => product.ec_name === 'Coveo'],
      });
      const product = {
        ec_name: 'Coveo',
        ec_brand: 'Acme',
        ec_gender: 'women',
        additionalFields: {},
      };

      expect(await appliesTo(element, product)).toBe(true);
      expect(await appliesTo(element, {...product, ec_brand: null})).toBe(false);
      expect(await appliesTo(element, {...product, additionalFields: {cat_color: 'red'}})).toBe(
        false
      );
      expect(await appliesTo(element, {...product, ec_gender: 'men'})).toBe(false);
      expect(await appliesTo(element, {...product, ec_name: 'Other'})).toBe(false);
    });

    it('should leave the #conditions property untouched', async () => {
      const customCondition = (product: Product) => product.ec_name === 'Coveo';
      const element = await setupElement({conditions: [customCondition], ifDefined: 'ec_brand'});

      expect(element.conditions).toEqual([customCondition]);
    });

    it('should not accumulate conditions when reconnected to the DOM', async () => {
      const element = await setupElement({ifDefined: 'ec_brand', ifNotDefined: 'cat_color'});
      const parent = element.parentElement!;

      element.remove();
      parent.append(element);

      const template = await element.getTemplate();
      expect(template!.conditions).toHaveLength(2);
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
    const mockedConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const element = await setupElement();
    const error = new Error('fail');
    element.error = error;

    const componentError = page.getByText('atomic-product-template component error');

    await expect.element(componentError).toBeVisible();
    mockedConsoleError.mockRestore();
  });
});
