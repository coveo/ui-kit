import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import '../atomic-product-text/atomic-product-text';
import {userEvent} from '@vitest/browser/context';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {TruncateAfter} from '../../common/expandable-text/expandable-text';
import './atomic-product-description';

describe('atomic-product-description', () => {
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

    const {element} = await renderInAtomicProduct({
      template: html`
      <atomic-product-description
        truncate-after=${ifDefined(props.truncateAfter)}
        ?is-collapsible=${props.isCollapsible ?? false}
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
    const {locators} = await renderProductDescription();

    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('min-lines-2');
  });

  it('should collapse when isCollapsible is true and clicking on the show less button', async () => {
    const {locators} = await renderProductDescription({isCollapsible: true});

    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('min-lines-2');

    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('line-clamp-2');
  });

  it('should have the correct part attribute on the expandable text', async () => {
    const {locators} = await renderProductDescription();
    expect(locators.expandableDiv).toHaveAttribute('part', 'expandable-text');
  });

  it('should have the correct text on the show more button', async () => {
    const {locators} = await renderProductDescription();

    expect(locators.button).toHaveTextContent('Show more');
  });

  it('should have the correct text on the show less button when expanded', async () => {
    const {locators} = await renderProductDescription({isCollapsible: true});

    await userEvent.click(locators.button!);

    expect(locators.button).toHaveTextContent('Show less');
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
