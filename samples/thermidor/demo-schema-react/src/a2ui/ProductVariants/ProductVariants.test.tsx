import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import type {Product, ProductVariant} from '@coveo/thermidor-schema';
import {FALLBACK_THUMBNAIL, ProductVariants} from './ProductVariants.js';
import {usePromotedProduct} from './use-promoted-product.js';

afterEach(() => cleanup());

function variant(id: string, overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    permanentid: id,
    ec_name: `Shoe ${id}`,
    ec_thumbnails: [`https://example.com/${id}.png`],
    additionalFields: {},
    ...overrides,
  };
}

function group(variants: ProductVariant[], totalNumberOfChildren = variants.length): Product {
  return {...variants[0], children: variants, totalNumberOfChildren};
}

function Slot({product}: {product: Product}) {
  const [shown, promote] = usePromotedProduct(product);
  return (
    <>
      <h3>{shown.ec_name}</h3>
      <ProductVariants product={shown} onPromote={promote} />
    </>
  );
}

const thumbnails = () => screen.queryAllByRole('button');
const shownName = () => screen.getByRole('heading').textContent;
const pressed = () =>
  thumbnails()
    .filter((button) => button.getAttribute('aria-pressed') === 'true')
    .map((button) => button.title);

describe('ProductVariants', () => {
  it('shows up to five variants, the shown one marked, and counts the rest of the group', () => {
    const variants = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => variant(id));
    render(<Slot product={group(variants, 9)} />);

    expect(thumbnails().map((button) => button.title)).toEqual([
      'Shoe a',
      'Shoe b',
      'Shoe c',
      'Shoe d',
      'Shoe e',
    ]);
    expect(pressed()).toEqual(['Shoe a']);
    expect(screen.getByLabelText('4 more variants').textContent).toBe('+4');
  });

  it('counts the variants a group holds beyond those listed', () => {
    render(<Slot product={group([variant('a'), variant('b')], 4)} />);

    expect(thumbnails()).toHaveLength(2);
    expect(screen.getByLabelText('2 more variants').textContent).toBe('+2');
  });

  it('shows no count when every variant is shown', () => {
    render(<Slot product={group([variant('a'), variant('b')])} />);

    expect(screen.queryByLabelText(/more variants/)).toBeNull();
  });

  it('shows a fallback for a variant without a web image', () => {
    render(
      <Slot
        product={group([
          variant('a'),
          variant('b', {ec_thumbnails: []}),
          variant('c', {ec_thumbnails: ['javascript:alert(1)']}),
        ])}
      />
    );

    expect(screen.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      FALLBACK_THUMBNAIL,
      FALLBACK_THUMBNAIL,
    ]);
  });

  it('shows nothing for a product without variants', () => {
    const {rerender} = render(<Slot product={variant('a')} />);
    expect(screen.queryByRole('group', {name: 'Variants'})).toBeNull();

    rerender(<Slot product={group([variant('a')])} />);
    expect(screen.queryByRole('group', {name: 'Variants'})).toBeNull();
  });

  it('promotes a variant on hover, Enter or touch', () => {
    render(<Slot product={group([variant('a'), variant('b'), variant('c'), variant('d')])} />);

    fireEvent.mouseEnter(thumbnails()[1]);
    expect(shownName()).toBe('Shoe b');
    expect(pressed()).toEqual(['Shoe b']);

    fireEvent.keyDown(thumbnails()[2], {key: 'Enter'});
    expect(shownName()).toBe('Shoe c');

    fireEvent.keyDown(thumbnails()[3], {key: 'Tab'});
    expect(shownName()).toBe('Shoe c');

    fireEvent.touchStart(thumbnails()[3]);
    expect(shownName()).toBe('Shoe d');
    expect(pressed()).toEqual(['Shoe d']);
  });

  it('keeps the variants in place while one is promoted', () => {
    render(<Slot product={group([variant('a'), variant('b')], 7)} />);

    fireEvent.mouseEnter(thumbnails()[1]);

    expect(thumbnails().map((button) => button.title)).toEqual(['Shoe a', 'Shoe b']);
    expect(screen.getByLabelText('5 more variants')).toBeDefined();
  });

  it('keeps the promotion until the product is sent again', () => {
    const variants = [variant('a'), variant('b')];
    const product = group(variants);
    const {rerender} = render(<Slot product={product} />);
    fireEvent.mouseEnter(thumbnails()[1]);

    rerender(<Slot product={product} />);
    expect(shownName()).toBe('Shoe b');

    rerender(<Slot product={group(variants)} />);
    expect(shownName()).toBe('Shoe a');
    expect(pressed()).toEqual(['Shoe a']);
  });
});
