import {html} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import './atomic-product-excerpt';
import '../atomic-product-text/atomic-product-text';
import {ifDefined} from 'lit/directives/if-defined.js';
import {userEvent} from 'vitest/browser';
import type {TruncateAfter} from '../../common/expandable-text/expandable-text';
import type {AtomicProductExcerpt} from './atomic-product-excerpt';

const LINE_HEIGHT = 16;

describe('atomic-product-excerpt', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty(
      '--line-height',
      `${LINE_HEIGHT}px`
    );
  });
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

    const {element} = await renderInAtomicProduct<AtomicProductExcerpt>({
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

  it('should have isCollapsible as `false` by default', async () => {
    const {element} = await renderProductExcerpt();
    expect(element.isCollapsible).toBe(false);
  });

  it('should render the excerpt text', async () => {
    const {locators} = await renderProductExcerpt({
      excerpt: 'This is a short excerpt for child product.',
    });

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
    const {element, locators} = await renderProductExcerpt({
      truncateAfter: '2',
    });
    // biome-ignore lint/suspicious/noExplicitAny: <>
    (element as any).isTruncated = true;
    await userEvent.click(locators.button!);

    expect(locators.expandableDiv).toHaveClass('min-lines-2');
  });

  it('should set the correct min-height based on the truncateAfter value', async () => {
    const {element, locators} = await renderProductExcerpt({
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
    let locators: Awaited<ReturnType<typeof renderProductExcerpt>>['locators'];
    let element: AtomicProductExcerpt;

    beforeEach(async () => {
      ({element, locators} = await renderProductExcerpt({
        isCollapsible: true,
        truncateAfter: '2',
      }));
    });

    it('should collapse when clicking on the show less button', async () => {
      await userEvent.click(locators.button!);

      expect(locators.expandableDiv).not.toHaveClass('line-clamp-2');

      // biome-ignore lint/suspicious/noExplicitAny: <>
      (element as any).isTruncated = true;
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
    const {locators} = await renderProductExcerpt();
    expect(locators.expandableDiv).toHaveAttribute('part', 'expandable-text');
  });
});
