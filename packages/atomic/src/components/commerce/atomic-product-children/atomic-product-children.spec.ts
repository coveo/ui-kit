import {describe, expect, it, vi} from 'vitest';
import './atomic-product-children';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {AtomicProductChildren} from './atomic-product-children';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-children', () => {
  const renderProductChildren = async (
    props: {
      label?: string;
      field?: string;
      fallback?: string;
      // biome-ignore lint/suspicious/noExplicitAny: <>
      childProducts?: any[];
    } = {}
  ) => {
    const childProducts = Array.from({length: 6}, (_, i) =>
      buildFakeProduct({
        ec_name: `Test Child Product ${i + 1}`,
        ec_brand: 'Test Brand',
        additionalFields: {
          custom_field: 'Custom Field Value',
          empty_field: '',
          null_field: null,
        },
        permanentid: i === 0 ? 'permanentId' : `child-permanent-id-${i + 1}`,
        ec_thumbnails: [
          `https://images.barca.group/Sports/mj/Clothing/Pants/67_Men_Pink_Cotton/bb7702430243_bottom_left.webp`,
        ],
      })
    );

    const mockedProduct = buildFakeProduct({
      ec_name: 'Test Product Name',
      ec_brand: 'Test Brand',
      additionalFields: {
        custom_field: 'Custom Field Value',
        empty_field: '',
        null_field: null,
      },
      children: props.childProducts ? props.childProducts : childProducts,
    });

    const {element} = await renderInAtomicProduct({
      template: html`
        <atomic-product-children
        field=${ifDefined(props.field)}
        label=${ifDefined(props.label)}
        fallback=${ifDefined(props.fallback)}
        ></atomic-product-children>
      `,
      selector: 'atomic-product-children',
      product: mockedProduct,
    });

    return {
      element,
      get label() {
        return element.querySelector('atomic-commerce-text');
      },
      get childProducts() {
        return element.querySelectorAll('button');
      },
      get image() {
        return element.querySelector('img');
      },
    };
  };

  it('should render nothing when there are no child products', async () => {
    const {element} = await renderProductChildren({childProducts: []});
    expect(element).toBeEmptyDOMElement();
  });

  it('should render the default label when no label is provided', async () => {
    const {label} = await renderProductChildren();
    expect(label?.value).toBe('Available in:');
  });

  it('should render the provided label', async () => {
    const {label} = await renderProductChildren({label: 'Custom Label'});
    expect(label?.value).toBe('Custom Label');
  });

  it('should render child products with the proper classes', async () => {
    const {childProducts} = await renderProductChildren();

    expect(childProducts[0]).toHaveClass(
      'product-child box-border rounded border border-primary'
    );
    expect(childProducts[1]).toHaveClass('product-child');
  });

  it('should render child products with the proper title', async () => {
    const {childProducts} = await renderProductChildren();
    expect(childProducts[0].title).toBe('Test Child Product 1');
    expect(childProducts[1].title).toBe('Test Child Product 2');
  });

  describe('when "Enter" is pressed on a child product', () => {
    const pressEnterOnChild = async () => {
      const {childProducts} = await renderProductChildren();
      childProducts[1].dispatchEvent(
        new KeyboardEvent('keypress', {key: 'Enter'})
      );
      return childProducts;
    };

    it('should change the active child product', async () => {
      const childProducts = await pressEnterOnChild();
      await expect
        .poll(() => childProducts[1])
        .toHaveClass('box-border rounded border border-primary');
      await expect
        .poll(() => childProducts[0])
        .not.toHaveClass('box-border rounded border border-primary');
    });

    it('should dispatch the "atomic/selectChildProduct" event', async () => {
      const dispatchSpy = vi.spyOn(
        AtomicProductChildren.prototype,
        'dispatchEvent'
      );
      await pressEnterOnChild();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('when a child product is hovered', () => {
    const hoverChild = async () => {
      const {childProducts} = await renderProductChildren();
      childProducts[2].dispatchEvent(new MouseEvent('mouseenter'));
      return childProducts;
    };

    it('should change the active child product', async () => {
      const childProducts = await hoverChild();
      await expect
        .poll(() => childProducts[2])
        .toHaveClass('box-border rounded border border-primary');
      await expect
        .poll(() => childProducts[0])
        .not.toHaveClass('box-border rounded border border-primary');
    });

    it('should dispatch the "atomic/selectChildProduct" event', async () => {
      const dispatchSpy = vi.spyOn(
        AtomicProductChildren.prototype,
        'dispatchEvent'
      );
      await hoverChild();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('when a child product is touched', () => {
    const touchChild = async () => {
      const {childProducts} = await renderProductChildren();
      childProducts[3].dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [
            new Touch({
              identifier: 0,
              target: childProducts[3],
              clientX: 100,
              clientY: 100,
              screenX: 100,
              screenY: 100,
              pageX: 100,
              pageY: 100,
              radiusX: 10,
              radiusY: 10,
              rotationAngle: 0,
              force: 0.5,
            }),
          ],
        })
      );
      return childProducts;
    };

    it('should change the active child product', async () => {
      const childProducts = await touchChild();
      await expect
        .poll(() => childProducts[3])
        .toHaveClass('box-border rounded border border-primary');
      await expect
        .poll(() => childProducts[0])
        .not.toHaveClass('box-border rounded border border-primary');
    });

    it('should dispatch the "atomic/selectChildProduct" event', async () => {
      const dispatchSpy = vi.spyOn(
        AtomicProductChildren.prototype,
        'dispatchEvent'
      );
      await touchChild();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it('should render the image with the proper alt text', async () => {
    const {image} = await renderProductChildren();
    expect(image?.alt).toBe('Test Child Product 1');
  });

  it('should render the image when the ec_thumbnails field is a string', async () => {
    const {image} = await renderProductChildren({
      childProducts: [
        buildFakeProduct({
          ec_name: 'Test Child Product',
          ec_thumbnails: 'https://example.com/image.jpg' as unknown as string[],
        }),
      ],
    });
    expect(image?.src).toBe('https://example.com/image.jpg');
  });

  it('should render the image when the ec_thumbnails field is an array', async () => {
    const {image} = await renderProductChildren({
      childProducts: [
        buildFakeProduct({
          ec_name: 'Test Child Product',
          ec_thumbnails: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        }),
      ],
    });
    expect(image?.src).toBe('https://example.com/image1.jpg');
  });

  it('should render the default fallback image when the ec_thumbnails field is empty and no fallback image is provided', async () => {
    const {image} = await renderProductChildren({
      childProducts: [
        buildFakeProduct({
          ec_name: 'Test Child Product',
          ec_thumbnails: [],
        }),
      ],
    });
    expect(image?.src).toBe(
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="gray"%3E%3C/rect%3E%3C/svg%3E'
    );
  });

  it('should render the fallback image provided when the ec_thumbnails field is empty', async () => {
    const {image} = await renderProductChildren({
      childProducts: [
        buildFakeProduct({
          ec_name: 'Test Child Product',
          ec_thumbnails: [],
        }),
      ],
      fallback: 'https://example.com/fallback.jpg',
    });
    expect(image?.src).toBe('https://example.com/fallback.jpg');
  });

  //TODO: Add more tests for this while fixing KIT-4408
  it('should render the count button with the correct count', async () => {
    const {childProducts} = await renderProductChildren();

    expect(childProducts[childProducts.length - 1]).toHaveTextContent('+1');
  });
});
