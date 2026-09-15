import {describe, expect, it, afterEach} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import type {RemoteControllerSource} from '@coveo/thermidor';
import {StateSourceProvider} from '../state-source-context.js';
import {ProductSummaryRenderer} from './ProductSummary.js';

/**
 * Builds a RemoteControllerSource whose active turn carries the given per-componentId
 * state map. Correlation happens solely by componentId, matching the real AG-UI path.
 */
function buildStateSource(components: Record<string, unknown>): RemoteControllerSource {
  return {
    state: {activeTurn: {agentResponse: {state: {components}}}},
    subscribe: () => () => undefined,
    dispatchAction: () => undefined,
  } as unknown as RemoteControllerSource;
}

function renderSummary(componentId: string, components: Record<string, unknown>) {
  return render(
    <StateSourceProvider stateSource={buildStateSource(components)}>
      <ProductSummaryRenderer props={{componentId, componentType: 'product-summary'}} />
    </StateSourceProvider>
  );
}

describe('ProductSummaryRenderer', () => {
  afterEach(() => cleanup());

  it('renders the product name, description and price from its AG-UI state', () => {
    renderSummary('slot-1', {
      'slot-1': {
        categoryLabel: 'Surfboard',
        product: {
          permanentid: 'p1',
          ec_name: 'Wave Rider Soft Top',
          ec_shortdesc: 'A great beginner board.',
          ec_price: 199.99,
          ec_promo_price: 149.99,
          ec_images: ['https://example.com/board.webp'],
          additionalFields: {},
        },
      },
    });

    expect(screen.queryByText('Wave Rider Soft Top')).not.toBeNull();
    expect(screen.queryByText('A great beginner board.')).not.toBeNull();
    // Prefers the promo price over the regular price.
    expect(screen.queryByText('$149.99')).not.toBeNull();
    expect(screen.queryByText('$199.99')).toBeNull();
  });

  it('falls back to the categoryLabel and renders no price when the product is null', () => {
    renderSummary('slot-2', {
      'slot-2': {categoryLabel: 'Wetsuit', product: null},
    });

    expect(screen.queryByText('Wetsuit')).not.toBeNull();
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it('renders a loading placeholder without throwing when no state entry exists', () => {
    expect(() => renderSummary('absent', {})).not.toThrow();
    expect(screen.queryByLabelText('Loading product summary')).not.toBeNull();
  });
});
