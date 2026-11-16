import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import type {Product, ProductChild} from '@coveo/thermidor-schema';
import {FALLBACK_THUMBNAIL, ProductChildren} from './ProductChildren.js';
import {usePromotedProduct} from './use-promoted-product.js';

afterEach(() => cleanup());

function child(id: string, overrides: Partial<ProductChild> = {}): ProductChild {
  return {
    permanentid: id,
    ec_name: `Shoe ${id}`,
    ec_thumbnails: [`https://example.com/${id}.png`],
    additionalFields: {},
    ...overrides,
  };
}

function group(children: ProductChild[], totalNumberOfChildren = children.length): Product {
  return {...children[0], children: children, totalNumberOfChildren};
}

function Slot({product}: {product: Product}) {
  const [shown, promote] = usePromotedProduct(product);
  return (
    <>
      <h3>{shown.ec_name}</h3>
      <ProductChildren product={shown} onPromote={promote} />
    </>
  );
}

const thumbnails = () => screen.queryAllByRole('button');
const shownName = () => screen.getByRole('heading').textContent;
const pressed = () =>
  thumbnails()
    .filter((button) => button.getAttribute('aria-pressed') === 'true')
    .map((button) => button.title);

describe('ProductChildren', () => {
  it('shows up to five children, the shown one marked, and counts the others', () => {
    const children = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => child(id));
    render(<Slot product={group(children, 9)} />);

    expect(thumbnails().map((button) => button.title)).toEqual([
      'Shoe a',
      'Shoe b',
      'Shoe c',
      'Shoe d',
      'Shoe e',
    ]);
    expect(pressed()).toEqual(['Shoe a']);
    expect(screen.getByText('4 more products')).toBeDefined();
    expect(screen.getByRole('group', {name: 'Available in:'})).toBeDefined();
  });

  it('counts the children beyond those listed, if any', () => {
    const {rerender} = render(<Slot product={group([child('a'), child('b')], 4)} />);
    expect(thumbnails()).toHaveLength(2);
    expect(screen.getByText('2 more products')).toBeDefined();

    rerender(<Slot product={group([child('a'), child('b')])} />);
    expect(screen.queryByText(/more product/)).toBeNull();
  });

  it('shows a fallback for a child without a web image', () => {
    render(
      <Slot
        product={group([
          child('a'),
          child('b', {ec_thumbnails: []}),
          child('c', {ec_thumbnails: ['javascript:alert(1)']}),
        ])}
      />
    );

    expect(screen.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      FALLBACK_THUMBNAIL,
      FALLBACK_THUMBNAIL,
    ]);
  });

  it('shows nothing for a product without children', () => {
    render(<Slot product={child('a')} />);
    expect(screen.queryByRole('group', {name: 'Available in:'})).toBeNull();
  });

  it('promotes a child on hover or click, not on focus', () => {
    render(<Slot product={group([child('a'), child('b'), child('c')])} />);

    fireEvent.mouseEnter(thumbnails()[1]);
    expect(shownName()).toBe('Shoe b');
    expect(pressed()).toEqual(['Shoe b']);

    fireEvent.focus(thumbnails()[2]);
    expect(shownName()).toBe('Shoe b');

    fireEvent.click(thumbnails()[2]);
    expect(shownName()).toBe('Shoe c');
    expect(pressed()).toEqual(['Shoe c']);
  });

  it('keeps the children in place once one is promoted', () => {
    const children = [child('a'), child('b')];
    render(<Slot product={group(children, 7)} />);

    fireEvent.mouseEnter(thumbnails()[1]);

    expect(thumbnails().map((button) => button.title)).toEqual(['Shoe a', 'Shoe b']);
    expect(screen.getByText('5 more products')).toBeDefined();
  });

  it('hides presentational thumbnails from assistive technologies', () => {
    const product = group([child('a'), child('b')]);
    render(<ProductChildren product={product} onPromote={() => {}} presentational />);

    expect(screen.queryByRole('group')).toBeNull();
    expect(thumbnails()).toHaveLength(0);
  });
});
