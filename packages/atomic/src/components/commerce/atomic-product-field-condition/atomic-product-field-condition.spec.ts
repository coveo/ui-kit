import {describe, expect, it} from 'vitest';
import './atomic-product-field-condition';
import type {Product} from '@coveo/headless/commerce';
import {html} from 'lit';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import type {AtomicProductFieldCondition} from './atomic-product-field-condition';

describe('atomic-product-field-condition', () => {
  const renderProductFieldCondition = async ({
    ifDefined = '',
    ifNotDefined = '',
    mustMatch = {},
    mustNotMatch = {},
    productState = {},
  }: {
    ifDefined?: string;
    ifNotDefined?: string;
    mustMatch?: Record<string, unknown>;
    mustNotMatch?: Record<string, unknown>;
    productState?: Partial<Product>;
  } = {}) => {
    const product = buildFakeProduct(productState);

    const {element, atomicProduct} = await renderInAtomicProduct<AtomicProductFieldCondition>({
      template: html`
        <atomic-product-field-condition
          if-defined="${ifDefined}"
          if-not-defined="${ifNotDefined}"
          .mustMatch="${mustMatch}"
          .mustNotMatch="${mustNotMatch}"
        >
          <span id="condition-met">Condition Met</span>
        </atomic-product-field-condition>
      `,
      selector: 'atomic-product-field-condition',
      product,
    });

    // Deliberately queried from the product rather than from the condition element, and
    // returned as a boolean, so that the assertions describe what the user can see instead
    // of how the component hides its content.
    const isContentVisible = () => {
      const content = atomicProduct.shadowRoot!.querySelector<HTMLElement>('#condition-met');
      return content !== null && content.checkVisibility();
    };

    return {element, atomicProduct, isContentVisible};
  };

  it('should render its content when no conditions are defined', async () => {
    const {isContentVisible} = await renderProductFieldCondition();

    expect(isContentVisible()).toBe(true);
  });

  it('should render its content when an if-defined condition is met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      ifDefined: 'ec_brand',
      productState: {ec_brand: 'brand'},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when an if-defined condition is not met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      ifDefined: 'ec_brand',
      productState: {ec_brand: undefined},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should render its content when an if-not-defined condition is met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      ifNotDefined: 'ec_brand',
      productState: {ec_brand: undefined},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when an if-not-defined condition is not met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      ifNotDefined: 'ec_brand',
      productState: {ec_brand: 'brand'},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should render its content when a must-match condition is met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      mustMatch: {ec_brand: ['brand']},
      productState: {ec_brand: 'brand'},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when a must-match condition is not met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      mustMatch: {ec_brand: ['brand']},
      productState: {ec_brand: 'other-brand'},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should render its content when a must-not-match condition is met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      mustNotMatch: {ec_brand: ['other-brand']},
      productState: {ec_brand: 'brand'},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when a must-not-match condition is not met', async () => {
    const {isContentVisible} = await renderProductFieldCondition({
      mustNotMatch: {ec_brand: ['other-brand']},
      productState: {ec_brand: 'other-brand'},
    });

    expect(isContentVisible()).toBe(false);
  });
});
