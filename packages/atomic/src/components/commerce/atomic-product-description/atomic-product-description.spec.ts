import {html} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import '../atomic-product-text/atomic-product-text';
import {ifDefined} from 'lit/directives/if-defined.js';
import {userEvent} from 'vitest/browser';
import type {TruncateAfter} from '../../common/expandable-text/expandable-text';
import './atomic-product-description';
import type {AtomicProductDescription} from './atomic-product-description';

const LINE_HEIGHT = 16;

describe('atomic-product-description', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty(
      '--line-height',
      `${LINE_HEIGHT}px`
    );
  });
  const renderProductDescription = async (
    props: {
      truncateAfter?: TruncateAfter;
      isCollapsible?: boolean;
      field?: 'ec_description' | 'ec_shortdesc';
      ec_shortdesc?: string;
      ec_description?: string;
    } = {}
  ) => {
    const mockedProduct = buildFakeProduct({
      ec_description:
        props.ec_description ??
        `This is a description for child product. It contains detailed information about the product features and specifications. It should be informative and helpful for potential buyers.`,
      ec_shortdesc:
        props.ec_shortdesc ??
        `This is a short description for child product. It is meant to be concise and informative. It should give a brief overview of the product features and benefits.`,
    });

    const {element} = await renderInAtomicProduct<AtomicProductDescription>({
      template: html`
      <atomic-product-description
        truncate-after=${ifDefined(props.truncateAfter)}
        ?is-collapsible=${props.isCollapsible}
        field=${ifDefined(props.field)}
      ></atomic-product-description>
      `,
      selector: 'atomic-product-description',
      product: mockedProduct,
    });

    return {
      element,
      locators: {
        get text() {
          return element.querySelector('atomic-commerce-text');
        },
        get expandableDiv() {
          return element.querySelector('.expandable-text');
        },
        get button() {
          return element.querySelector('button');
        },
      },
    };
  };

  it('should render nothing when there are no description', async () => {
    const {element} = await renderProductDescription({ec_shortdesc: ''});
    expect(element).toBeEmptyDOMElement();
  });

  it('should have isCollapsible as `false` by default', async () => {
    const {element} = await renderProductDescription();
    expect(element.isCollapsible).toBe(false);
  });

  it('should render the description text', async () => {
    const {locators} = await renderProductDescription({
      ec_shortdesc: 'This is a short description for child product.',
    });

    expect(locators.text).toHaveAttribute(
      'value',
      'This is a short description for child product.'
    );
  });

  it('should show the description truncated to the specified number of lines', async () => {
    const {locators} = await renderProductDescription({truncateAfter: '2'});
    expect(locators.expandableDiv).toHaveClass('line-clamp-2');
  });

  it('should not truncate when truncateAfter is set to "none"', async () => {
    const {locators} = await renderProductDescription({
      truncateAfter: 'none',
    });
    expect(locators.expandableDiv).toHaveClass('line-clamp-none');
  });

  it('should expand when clicking on the show more button', async () => {
    const {element, locators} = await renderProductDescription({
      truncateAfter: '2',
    });
    // biome-ignore lint/suspicious/noExplicitAny: <>
    (element as any).isTruncated = true;
    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).not.toHaveClass(`line-clamp-2`);
  });

  it('should set the correct min-height based on the truncateAfter value', async () => {
    const {element, locators} = await renderProductDescription({
      truncateAfter: '2',
    });
    // biome-ignore lint/suspicious/noExplicitAny: <>
    (element as any).isTruncated = true;
    expect(locators.expandableDiv).toHaveClass('min-lines-2');
    expect(locators.expandableDiv).toHaveStyle({
      'min-height': `${LINE_HEIGHT * 2}px`,
    });
  });

  describe('when isCollapsible is true', () => {
    let locators: Awaited<
      ReturnType<typeof renderProductDescription>
    >['locators'];
    let element: AtomicProductDescription;

    beforeEach(async () => {
      ({element, locators} = await renderProductDescription({
        isCollapsible: true,
        truncateAfter: '2',
      }));
      // biome-ignore lint/suspicious/noExplicitAny: <>
      (element as any).isTruncated = true;
    });

    it('should collapse when clicking on the show less button', async () => {
      await userEvent.click(locators.button!);

      expect(locators.expandableDiv).not.toHaveClass('line-clamp-2');

      await userEvent.click(locators.button!);

      expect(locators.expandableDiv).toHaveClass('line-clamp-2');
    });

    it('should have the correct text on the show more button', async () => {
      expect(locators.button).toHaveTextContent('Show more');
    });

    it('should have the correct text on the show less button when expanded', async () => {
      await userEvent.click(locators.button!);

      expect(locators.button).toHaveTextContent('Show less');
    });
  });

  it('should have the correct part attribute on the expandable text', async () => {
    const {locators} = await renderProductDescription();
    expect(locators.expandableDiv).toHaveAttribute('part', 'expandable-text');
  });

  it('should use the ec_description when setting it as the field', async () => {
    const {locators} = await renderProductDescription({
      field: 'ec_description',
      ec_description: 'This is a description for child product.',
    });

    expect(locators.text).toHaveAttribute(
      'value',
      'This is a description for child product.'
    );
  });
});
