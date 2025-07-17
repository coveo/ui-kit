import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import './atomic-product-excerpt';
import '../atomic-product-text/atomic-product-text';
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
        ?is-collapsible=${props.isCollapsible ?? true}
      ></atomic-product-excerpt>
      `,
      selector: 'atomic-product-excerpt',
      product: mockedProduct,
    });

    return {
      element,
      text: element.querySelector('atomic-commerce-text'),
      expandableDiv: element.querySelector('.expandable-text'),
    };
  };

  it('should render nothing when there are no excerpt', async () => {
    const {element} = await renderProductExcerpt({excerpt: ''});
    expect(element).toBeEmptyDOMElement();
  });

  it('should render the excerpt text', async () => {
    const {text} = await renderProductExcerpt({
      excerpt: 'This is a short excerpt for child product.',
    });
    expect(text).toHaveAttribute(
      'value',
      'This is a short excerpt for child product.'
    );
  });

  it('should show the excerpt truncated to the specified number of lines', async () => {
    const {expandableDiv} = await renderProductExcerpt({truncateAfter: '2'});
    expect(expandableDiv).toHaveClass('line-clamp-2');
  });

  it('should not truncate when truncateAfter is set to "none"', async () => {
    const {expandableDiv} = await renderProductExcerpt({
      truncateAfter: 'none',
    });
    expect(expandableDiv).toHaveClass('line-clamp-none');
  });

  it('should throw an error if truncateAfter is set to an invalid value', async () => {
    const {element} = await renderProductExcerpt({
      truncateAfter: 'invalid' as TruncateAfter,
    });
    expect(element).toHaveAttribute('error');
  });
});
