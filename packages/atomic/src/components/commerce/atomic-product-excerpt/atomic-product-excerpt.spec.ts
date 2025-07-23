import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import './atomic-product-excerpt';
import '../atomic-product-text/atomic-product-text';
import {userEvent} from '@vitest/browser/context';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {TruncateAfter} from '../../common/expandable-text/expandable-text';

describe('atomic-product-excerpt', () => {
  const renderProductExcerpt = async (
    props: {
      truncateAfter?: TruncateAfter;
      isCollapsible?: boolean;
      excerpt?: string;
    } = {}
  ) => {
    const mockedProduct = buildFakeProduct({
      excerpt:
        props.excerpt ??
        `This is a short excerpt for child product. 
      With very long text that should be truncated after a certain number of lines. 
      And even more text to ensure truncation works properly. 
      This is a test to see how the excerpt behaves with long content.`,
    });

    console.log(props.truncateAfter);
    const {element} = await renderInAtomicProduct({
      template: html`
      <atomic-product-excerpt
        truncate-after=${ifDefined(props.truncateAfter)}
        ?is-collapsible=${props.isCollapsible ?? false}
      ></atomic-product-excerpt>
      `,
      selector: 'atomic-product-excerpt',
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

  it('should render nothing when there are no excerpt', async () => {
    const {element} = await renderProductExcerpt({excerpt: ''});
    expect(element).toBeEmptyDOMElement();
  });

  it('should render the excerpt text', async () => {
    const {locators} = await renderProductExcerpt({
      excerpt: 'This is a short excerpt for child product.',
    });
    console.log(locators.text);
    expect(locators.text).toHaveAttribute(
      'value',
      'This is a short excerpt for child product.'
    );
  });

  it('should show the excerpt truncated to the specified number of lines', async () => {
    const {locators} = await renderProductExcerpt({truncateAfter: '2'});
    expect(locators.expandableDiv).toHaveClass('line-clamp-2');
  });

  it('should not truncate when truncateAfter is set to "none"', async () => {
    const {locators} = await renderProductExcerpt({
      truncateAfter: 'none',
    });
    expect(locators.expandableDiv).toHaveClass('line-clamp-none');
  });

  it('should expand when clicking on the show more button', async () => {
    const {locators} = await renderProductExcerpt();

    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('min-lines-2');
  });

  it('should collapse when isCollapsible is true and clicking on the show less button', async () => {
    const {locators} = await renderProductExcerpt({isCollapsible: true});

    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('min-lines-2');

    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('line-clamp-2');
  });

  it('should have the correct part attribute on the expandable text', async () => {
    const {locators} = await renderProductExcerpt();
    expect(locators.expandableDiv).toHaveAttribute('part', 'expandable-text');
  });

  it('should have the correct text on the show more button', async () => {
    const {locators} = await renderProductExcerpt();

    expect(locators.button).toHaveTextContent('Show more');
  });

  it('should have the correct text on the show less button when expanded', async () => {
    const {locators} = await renderProductExcerpt({isCollapsible: true});

    await userEvent.click(locators.button!);

    expect(locators.button).toHaveTextContent('Show less');
  });
});
