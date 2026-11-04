import {fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {AddedMessage, FoundProduct} from '@coveo/thermidor';
import {FoundProducts} from './FoundProducts.js';

const PRODUCTS: FoundProduct[] = [
  {id: 'k1', name: 'Pelican Sprint', price: 499, image: 'https://img.test/k1.jpg'},
  {id: 'k2', name: 'Sun Dolphin'},
];

function renderFound(addedMessages: AddedMessage[] = []) {
  const onReact = vi.fn();
  render(<FoundProducts products={PRODUCTS} addedMessages={addedMessages} onReact={onReact} />);
  return onReact;
}

function card(name: string) {
  return within(screen.getByRole('listitem', {name}));
}

describe('FoundProducts', () => {
  it('lists each product the agent found with its price', () => {
    renderFound();

    expect(screen.getByRole('region', {name: 'Found so far'})).toBeDefined();
    expect(card('Pelican Sprint').getByText('$499.00')).toBeDefined();
    expect(card('Sun Dolphin').getByText('Sun Dolphin')).toBeDefined();
  });

  it('asks the answer for more like a product', () => {
    const onReact = renderFound();

    fireEvent.click(card('Pelican Sprint').getByRole('button', {name: 'More like this'}));

    expect(onReact).toHaveBeenCalledWith('Show me more like the Pelican Sprint');
  });

  it('asks the answer to leave a product out', () => {
    const onReact = renderFound();

    fireEvent.click(card('Sun Dolphin').getByRole('button', {name: 'Leave out'}));

    expect(onReact).toHaveBeenCalledWith('Show me options without the Sun Dolphin');
  });

  it('shows a reaction already sent instead of offering it again', () => {
    renderFound([{id: 'a1', text: 'Show me options without the Sun Dolphin', status: 'applied'}]);

    expect(card('Sun Dolphin').getByText('Left out')).toBeDefined();
    expect(card('Sun Dolphin').queryByRole('button')).toBeNull();
    expect(card('Pelican Sprint').getAllByRole('button')).toHaveLength(2);
  });
});
